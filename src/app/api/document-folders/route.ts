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

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Verify user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: session.user.id },
          { 
            members: {
              some: { userId: session.user.id }
            }
          }
        ]
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const folders = await prisma.documentFolder.findMany({
      where: {
        workspaceId,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching document folders:', error);
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
    const { name, color, workspaceId } = body;

    if (!name || !workspaceId) {
      return NextResponse.json({ error: 'Name and workspace ID required' }, { status: 400 });
    }

    // Verify user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: session.user.id },
          { 
            members: {
              some: { userId: session.user.id }
            }
          }
        ]
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const folder = await prisma.documentFolder.create({
      data: {
        name,
        color: color || '#3b82f6',
        workspaceId,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Error creating document folder:', error);
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
    const { id, name, color } = body;

    if (!id) {
      return NextResponse.json({ error: 'Folder ID required' }, { status: 400 });
    }

    // Verify user has access to folder's workspace
    const folder = await prisma.documentFolder.findFirst({
      where: {
        id,
        workspace: {
          OR: [
            { creatorId: session.user.id },
            { 
              members: {
                some: { userId: session.user.id }
              }
            }
          ]
        }
      }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    const updatedFolder = await prisma.documentFolder.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error('Error updating document folder:', error);
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
      return NextResponse.json({ error: 'Folder ID required' }, { status: 400 });
    }

    // Verify user has access to folder's workspace
    const folder = await prisma.documentFolder.findFirst({
      where: {
        id,
        workspace: {
          OR: [
            { creatorId: session.user.id },
            { 
              members: {
                some: { userId: session.user.id }
              }
            }
          ]
        }
      }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Move documents to no folder before deleting
    await prisma.document.updateMany({
      where: { folderId: id },
      data: { folderId: null },
    });

    await prisma.documentFolder.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Folder deleted' });
  } catch (error) {
    console.error('Error deleting document folder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}