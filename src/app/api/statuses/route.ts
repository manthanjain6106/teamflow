import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const listId = searchParams.get('listId')
    if (!listId) return NextResponse.json({ error: 'listId required' }, { status: 400 })
    const items = await prisma.status.findMany({ where: { listId }, orderBy: { order: 'asc' } })
    return NextResponse.json(items)
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { listId, name, color, order, isDone } = await request.json()
    if (!listId || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const created = await prisma.status.create({ data: { listId, name, color, order: order ?? 0, isDone: !!isDone } })
    return NextResponse.json(created, { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, name, color, order, isDone } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const updated = await prisma.status.update({ where: { id }, data: { name, color, order, isDone } })
    return NextResponse.json(updated)
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.status.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}


