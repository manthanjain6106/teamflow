import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Robust body parsing
    let body: any = null
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
    const { milestoneId, taskId } = body || {}
    if (!milestoneId || !taskId) return NextResponse.json({ error: 'milestoneId and taskId required' }, { status: 400 })

    // Validate milestone and membership
    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId }, select: { id: true, workspaceId: true } })
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: milestone.workspaceId, userId: session.user.id } })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Validate task belongs to same workspace
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        list: { space: { workspaceId: milestone.workspaceId } }
      },
      select: { id: true }
    })
    if (!task) return NextResponse.json({ error: 'Task not found in workspace' }, { status: 404 })

    try {
      const created = await prisma.milestoneTask.create({ data: { milestoneId, taskId } })
      return NextResponse.json(created, { status: 201 })
    } catch (e: any) {
      if (e?.code === 'P2002') {
        return NextResponse.json({ error: 'Task already linked' }, { status: 409 })
      }
      if (e?.code === 'P2025') {
        return NextResponse.json({ error: 'Milestone or Task not found' }, { status: 404 })
      }
      console.error('Milestone task link failed:', e)
      return NextResponse.json({ error: `Internal server error: ${e?.message || 'unknown'}` }, { status: 500 })
    }
  } catch (e) {
    console.error('Milestone task link error:', e)
    return NextResponse.json({ error: `Internal server error: ${(e as any)?.message || 'unknown'}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const milestoneId = searchParams.get('milestoneId')
    if (!milestoneId) return NextResponse.json({ error: 'milestoneId required' }, { status: 400 })
    const links = await prisma.milestoneTask.findMany({
      where: { milestoneId },
      include: { task: { select: { id: true, name: true, status: true } } },
      orderBy: { addedAt: 'desc' }
    })
    return NextResponse.json(links)
  } catch (e) {
    console.error('Milestone task list error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const milestoneId = searchParams.get('milestoneId')
    const taskId = searchParams.get('taskId')
    if (!milestoneId || !taskId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    await prisma.milestoneTask.delete({ where: { milestoneId_taskId: { milestoneId, taskId } } as any })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}


