import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const sprintId = searchParams.get('sprintId')
    if (!sprintId) return NextResponse.json({ error: 'sprintId required' }, { status: 400 })

    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId }, select: { workspaceId: true, startDate: true, endDate: true } })
    if (!sprint) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const items = await prisma.sprintTask.findMany({ where: { sprintId }, include: { task: true } })
    const totalTasks = items.length
    const completedTasks = items.filter(i => i.task?.status === 'DONE').length
    const velocity = items.filter(i => i.task?.status === 'DONE').reduce((acc, i) => acc + (i.task?.storyPoints || 0), 0)
    const totalPoints = items.reduce((acc, i) => acc + (i.task?.storyPoints || 0), 0)

    return NextResponse.json({
      totalTasks,
      completedTasks,
      totalPoints,
      velocity,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


