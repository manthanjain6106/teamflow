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
    const caps = await prisma.sprintCapacity.findMany({ where: { sprintId }, include: { user: { select: { id: true, name: true, email: true } } } })
    return NextResponse.json(caps)
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function POST(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const raw = (context as any).params
    const sprintId = typeof raw?.then === 'function' ? (await raw).id : raw.id
    const { userId, hours, points } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const upserted = await prisma.sprintCapacity.upsert({
      where: { sprintId_userId: { sprintId, userId } } as any,
      update: { hours, points },
      create: { sprintId, userId, hours, points }
    })
    return NextResponse.json(upserted)
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const raw = (context as any).params
    const sprintId = typeof raw?.then === 'function' ? (await raw).id : raw.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    await prisma.sprintCapacity.delete({ where: { sprintId_userId: { sprintId, userId } } as any })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}


