import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: list shares for a document
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 });

    const doc = await prisma.document.findFirst({
      where: { id: documentId, workspace: { members: { some: { userId: session.user.id } } } },
    });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const res = await (prisma as any).$runCommandRaw({ find: 'document_shares', filter: { documentId } });
    const shares = res?.cursor?.firstBatch || [];
    const userIds = shares.map((s: any) => s.userId).filter(Boolean);
    const users = userIds.length
      ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true, image: true } })
      : [];
    const usersById = new Map(users.map((u) => [u.id, u]));
    const normalized = shares.map((s: any) => ({ ...s, user: usersById.get(s.userId) || null }));
    return NextResponse.json(normalized);
  } catch (e) {
    console.error('Error fetching document shares', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: add or update a share
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { documentId, userEmail, permission = 'view' } = body;
    if (!documentId || !userEmail) return NextResponse.json({ error: 'documentId and userEmail required' }, { status: 400 });

    const doc = await prisma.document.findFirst({
      where: { id: documentId, workspace: { members: { some: { userId: session.user.id } } } },
    });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only owner can manage shares for now
    if (doc.createdById !== session.user.id) {
      return NextResponse.json({ error: 'No permission' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await (prisma as any).$runCommandRaw({
      update: 'document_shares',
      updates: [
        {
          q: { documentId, userId: targetUser.id },
          u: { $set: { permission, documentId, userId: targetUser.id, sharedById: session.user.id, createdAt: new Date() } },
          upsert: true,
        },
      ],
    });

    return NextResponse.json({ message: 'Shared' }, { status: 201 });
  } catch (e) {
    console.error('Error creating document share', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: remove a share
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const userId = searchParams.get('userId');
    if (!documentId || !userId) return NextResponse.json({ error: 'documentId and userId required' }, { status: 400 });

    const doc = await prisma.document.findFirst({
      where: { id: documentId, workspace: { members: { some: { userId: session.user.id } } } },
      select: { id: true, createdById: true },
    });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (doc.createdById !== session.user.id && userId !== session.user.id) {
      return NextResponse.json({ error: 'No permission' }, { status: 403 });
    }

    await (prisma as any).$runCommandRaw({ delete: 'document_shares', deletes: [{ q: { documentId, userId }, limit: 1 }] });
    return NextResponse.json({ message: 'Removed' });
  } catch (e) {
    console.error('Error deleting document share', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


