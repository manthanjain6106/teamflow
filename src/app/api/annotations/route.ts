import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get('attachmentId')
    if (!attachmentId) return NextResponse.json({ error: 'attachmentId required' }, { status: 400 })
    const ann = await prisma.attachmentAnnotation.findMany({ where: { attachmentId }, orderBy: { createdAt: 'asc' } })
    return NextResponse.json(ann)
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { attachmentId, position, comment } = await request.json()
    if (!attachmentId || !position || !comment) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const created = await prisma.attachmentAnnotation.create({ data: { attachmentId, position, comment, authorId: session.user.id } })
    return NextResponse.json(created, { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.attachmentAnnotation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}


