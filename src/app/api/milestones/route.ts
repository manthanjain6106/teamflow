import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
    const milestones = await prisma.milestone.findMany({ where: { workspaceId }, orderBy: { targetDate: 'asc' } })
    return NextResponse.json(milestones)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { title, description, targetDate, workspaceId, spaceId, ownerId } = await request.json()
    if (!title || !targetDate || !workspaceId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const m = await prisma.milestone.create({ data: { title, description, targetDate: new Date(targetDate), workspaceId, spaceId, ownerId } })
    return NextResponse.json(m, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, ...updates } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const base: any = {
      title: updates.title,
      description: updates.description,
      targetDate: updates.targetDate ? new Date(updates.targetDate) : undefined,
      ownerId: updates.ownerId,
    }
    const updated = await prisma.milestone.update({ where: { id }, data: base })
    if (updates.status) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any = { update: 'milestones', updates: [{ q: { _id: new ObjectId(id) }, u: { $set: { status: updates.status } } }] }
        if (updates.status === 'COMPLETED') raw.updates[0].u.$set.completedAt = new Date()
        else raw.updates[0].u.$unset = { completedAt: '' }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).$runCommandRaw(raw)
      } catch (e) { console.error('Milestone status raw update failed:', e) }
    }
    const m = await prisma.milestone.findUnique({ where: { id } })
    return NextResponse.json(m)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await prisma.milestone.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


