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
    const documentId = searchParams.get('documentId');
    if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 });

    // Check access: user must be in the workspace of the document
    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
        workspace: { members: { some: { userId: session.user.id } } },
      },
    });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Read from raw collection to avoid prisma schema dependency
    const result = await (prisma as any).$runCommandRaw({
      find: 'document_comments',
      filter: { documentId },
      sort: { createdAt: 1 },
    });

    const comments = result?.cursor?.firstBatch || [];
    return NextResponse.json(comments);
  } catch (e) {
    console.error('Error fetching document comments', e);
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
    const { documentId, content } = body;
    if (!documentId || !content?.trim()) {
      return NextResponse.json({ error: 'documentId and content required' }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
        workspace: { members: { some: { userId: session.user.id } } },
      },
    });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = new Date();
    const record = {
      documentId,
      content,
      createdAt: now,
      updatedAt: now,
      authorId: session.user.id,
    } as any;

    const res = await (prisma as any).$runCommandRaw({
      insert: 'document_comments',
      documents: [record],
    });

    return NextResponse.json({ ...record, id: res?.insertedIds?.[0] || undefined }, { status: 201 });
  } catch (e) {
    console.error('Error creating document comment', e);
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
    const documentId = searchParams.get('documentId');
    if (!id || !documentId) return NextResponse.json({ error: 'id and documentId required' }, { status: 400 });

    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
        workspace: { members: { some: { userId: session.user.id } } },
      },
    });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await (prisma as any).$runCommandRaw({
      delete: 'document_comments',
      deletes: [{ q: { _id: { $oid: id } }, limit: 1 }],
    });

    return NextResponse.json({ message: 'Deleted' });
  } catch (e) {
    console.error('Error deleting document comment', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


