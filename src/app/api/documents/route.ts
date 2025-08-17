import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const folderId = searchParams.get('folderId');
    const starred = searchParams.get('starred');
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Verify user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: session.user.id } }
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const where: {
      workspaceId: string;
      folderId?: string;
      starred?: boolean;
    } = {
      workspaceId,
    };

    if (folderId) {
      where.folderId = folderId;
    }

    if (starred === 'true') {
      where.starred = true;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, workspaceId, folderId, starred = false } = body as {
      title?: string;
      content?: string;
      workspaceId?: string;
      folderId?: string | null;
      starred?: boolean;
    };

    if (!title || !workspaceId) {
      return NextResponse.json({ error: 'Title and workspace ID required' }, { status: 400 });
    }

    // Verify user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: session.user.id } }
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const document = await prisma.document.create({
      data: {
        title,
        content: content || '',
        starred,
        workspaceId,
        folderId: folderId || null,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // index in search_index collection
    try {
      await (prisma as unknown as { $runCommandRaw: (cmd: unknown) => Promise<unknown> }).$runCommandRaw({
        insert: 'search_index',
        documents: [{
          entityId: document.id,
          title: document.title,
          content: document.content || '',
          type: 'document',
          workspaceId: workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      });
    } catch (e) {
      console.error('Search index insert failed', e);
    }

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, starred, folderId, isPublic } = body as {
      id?: string;
      title?: string;
      content?: string;
      starred?: boolean;
      folderId?: string | null;
      isPublic?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Verify user has access to document
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        createdById: session.user.id
      }
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found or no permission' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (starred !== undefined) updateData.starred = starred;
    if (folderId !== undefined) updateData.folderId = folderId;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // If content/title changed, bump version and store snapshot
    const shouldVersion = content !== undefined || title !== undefined;
    if (shouldVersion) {
      updateData.version = { increment: 1 } as { increment: number };
    }

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // Update search index
    try {
      await (prisma as unknown as { $runCommandRaw: (cmd: unknown) => Promise<unknown> }).$runCommandRaw({
        update: 'search_index',
        updates: [{
          q: { entityId: id },
          u: { $set: { title: document.title, content: document.content || '', updatedAt: new Date() } },
          upsert: true,
        }],
      });
    } catch (e) {
      console.error('Search index update failed', e);
    }

    // Write a version snapshot without relying on generated Prisma client
    if (shouldVersion) {
      try {
        const versionRecord: {
          documentId: string;
          title: string;
          content: string | null;
          version: number;
          createdAt: Date;
          createdById: string;
        } = {
          documentId: document.id,
          title: document.title,
          content: document.content,
          version: document.version,
          createdAt: new Date(),
          createdById: session.user.id,
        };
        // Insert into "document_versions" collection using $runCommandRaw
        await (prisma as unknown as { $runCommandRaw: (cmd: unknown) => Promise<unknown> }).$runCommandRaw({
          insert: 'document_versions',
          documents: [versionRecord],
        });
      } catch (e) {
        console.error('Failed to create document version snapshot', e);
      }
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    // Verify user has access to delete document (owner or admin share)
    const document = await prisma.document.findFirst({
      where: {
        id,
        createdById: session.user.id
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or no permission' }, { status: 404 });
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}