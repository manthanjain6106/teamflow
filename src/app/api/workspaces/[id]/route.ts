import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
})

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolved = 'params' in context && typeof (context as any).params?.then !== 'function'
      ? (context as { params: { id: string } }).params
      : await (context as { params: Promise<{ id: string }> }).params

    const id = resolved.id
    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: id, userId: session.user.id } })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const workspace = await prisma.workspace.findUnique({ where: { id } })
    if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ ...workspace, role: member.role })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const data = updateWorkspaceSchema.parse(body)

    const resolved = 'params' in context && typeof (context as any).params?.then !== 'function'
      ? (context as { params: { id: string } }).params
      : await (context as { params: Promise<{ id: string }> }).params

    const id = resolved.id

    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: id, userId: session.user.id } })
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.workspace.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const resolved = 'params' in context && typeof (context as any).params?.then !== 'function'
      ? (context as { params: { id: string } }).params
      : await (context as { params: Promise<{ id: string }> }).params

    const id = resolved.id

    const member = await prisma.workspaceMember.findFirst({ where: { workspaceId: id, userId: session.user.id } })
    if (!member || member.role !== 'OWNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.workspace.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
