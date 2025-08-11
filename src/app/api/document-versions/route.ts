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

    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
        workspace: { members: { some: { userId: session.user.id } } },
      },
    });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await (prisma as any).$runCommandRaw({
      find: 'document_versions',
      filter: { documentId },
      sort: { version: -1 },
    });
    const versions = result?.cursor?.firstBatch || [];
    return NextResponse.json(versions);
  } catch (e) {
    console.error('Error fetching document versions', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


