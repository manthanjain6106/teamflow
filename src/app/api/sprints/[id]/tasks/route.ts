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
    if (!sprintId) return NextResponse.json({ error: 'sprint id required' }, { status: 400 })
    // Ensure workspace membership
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId }, select: { workspaceId: true } })
    if (!sprint) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: sprint.workspaceId, userId: session.user.id } })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const items = await prisma.sprintTask.findMany({ where: { sprintId }, include: { task: true } })
    return NextResponse.json(items)
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function POST(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const raw = (context as any).params
    const sprintId = typeof raw?.then === 'function' ? (await raw).id : raw.id
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId }, select: { workspaceId: true } })
    if (!sprint) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: sprint.workspaceId, userId: session.user.id } })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { taskId } = await request.json()
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    const st = await prisma.sprintTask.create({ data: { sprintId, taskId } })
    return NextResponse.json(st, { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const raw = (context as any).params
    const sprintId = typeof raw?.then === 'function' ? (await raw).id : raw.id
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId }, select: { workspaceId: true } })
    if (!sprint) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: sprint.workspaceId, userId: session.user.id } })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    await prisma.sprintTask.delete({ where: { sprintId_taskId: { sprintId, taskId } } as any })
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}


