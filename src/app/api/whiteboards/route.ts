import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const workspaceId = searchParams.get('workspaceId')
    if (id) {
      const board = await prisma.whiteboard.findUnique({ where: { id } })
      if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(board)
    }
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
    const items = await prisma.whiteboard.findMany({ where: { workspaceId }, orderBy: { updatedAt: 'desc' } })
    return NextResponse.json(items)
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { title, data, workspaceId } = await request.json()
    if (!title || !workspaceId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const created = await prisma.whiteboard.create({ data: { title, data: data || {}, workspaceId, ownerId: session.user.id } })
    return NextResponse.json(created, { status: 201 })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, title, data } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const updated = await prisma.whiteboard.update({ where: { id }, data: { title, data } })
    return NextResponse.json(updated)
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.whiteboard.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}


