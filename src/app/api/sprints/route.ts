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

    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId: session.user.id } })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const sprints = await prisma.sprint.findMany({
      where: { workspaceId },
      include: {
        tasks: { include: { task: { select: { id: true, name: true, status: true, priority: true } } } }
      },
      orderBy: { startDate: 'desc' }
    })
    return NextResponse.json(sprints)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, goal, startDate, endDate, workspaceId } = await request.json()
    if (!name || !startDate || !endDate || !workspaceId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Validate dates
    const sd = new Date(startDate)
    const ed = new Date(endDate)
    if (isNaN(sd.getTime()) || isNaN(ed.getTime()) || sd > ed) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    const ownerOrAdmin = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: session.user.id, role: { in: ['OWNER', 'ADMIN'] } }
    })
    if (!ownerOrAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Optional: prevent overlapping ACTIVE sprint creation (if created as ACTIVE later)
    const sprint = await prisma.sprint.create({
      data: { name, goal, startDate: sd, endDate: ed, workspaceId }
    })
    return NextResponse.json(sprint, { status: 201 })
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

    // Authorization: must be member of the workspace owning the sprint
    const existing = await prisma.sprint.findUnique({ where: { id }, select: { workspaceId: true } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: existing.workspaceId, userId: session.user.id } })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const baseData: any = {
      name: updates.name,
      goal: updates.goal,
      startDate: updates.startDate ? new Date(updates.startDate) : undefined,
      endDate: updates.endDate ? new Date(updates.endDate) : undefined,
    }

    // Validate date range if provided
    if (baseData.startDate && baseData.endDate && baseData.startDate > baseData.endDate) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    // Always avoid `status` in Prisma update to prevent client mismatch
    await prisma.sprint.update({ where: { id }, data: baseData })
    if (updates.status) {
      // Enforce only one ACTIVE sprint per workspace
      if (updates.status === 'ACTIVE') {
        try {
          // Prefer raw count to avoid Prisma client enum mismatch
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const res: any = await (prisma as any).$runCommandRaw({
            count: 'sprints',
            query: { workspaceId: new ObjectId(existing.workspaceId), status: 'ACTIVE', _id: { $ne: new ObjectId(id) } }
          })
          const n = res?.n ?? 0
          if (n > 0) {
            return NextResponse.json({ error: 'Another active sprint exists in this workspace' }, { status: 400 })
          }
        } catch (e) {
          console.error('Active sprint check failed:', e)
        }
      }
      try {
        // Raw update for status and completedAt
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any = { update: 'sprints', updates: [{ q: { _id: new ObjectId(id) }, u: { $set: { status: updates.status } } }] }
        if (updates.status === 'COMPLETED') {
          raw.updates[0].u.$set.completedAt = new Date()
        } else {
          raw.updates[0].u.$unset = { completedAt: '' }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).$runCommandRaw(raw)
      } catch (rawErr) {
        console.error('Raw sprint status update failed:', rawErr)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
    }
    // Return latest
    const latest = await prisma.sprint.findUnique({ where: { id } })
    return NextResponse.json(latest)
  } catch (e) {
    console.error('Sprint update error:', e)
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
    const sprint = await prisma.sprint.findUnique({ where: { id }, select: { workspaceId: true } })
    if (!sprint) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: sprint.workspaceId, userId: session.user.id, role: { in: ['OWNER','ADMIN'] } } })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await prisma.sprint.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


