import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const raw = (context as any).params
    const sprintId = typeof raw?.then === 'function' ? (await raw).id : raw.id
    const items = await prisma.sprintGoalItem.findMany({ where: { sprintId }, orderBy: { order: 'asc' } })
    return NextResponse.json(items)
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function POST(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const raw = (context as any).params
    const sprintId = typeof raw?.then === 'function' ? (await raw).id : raw.id
    const { content, order = 0 } = await request.json()
    if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })
    const created = await prisma.sprintGoalItem.create({ data: { sprintId, content, order } })
    return NextResponse.json(created, { status: 201 })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, content, completed, order } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const updated = await prisma.sprintGoalItem.update({ where: { id }, data: { content, completed, order } })
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
    await prisma.sprintGoalItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}


