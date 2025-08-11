import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: workspaceId } = await context.params
    const body = await request.json()
    const { name, description, slug } = body as { name?: string; description?: string; slug?: string }

    // Only OWNER/ADMIN can update
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: session.user.id, role: { in: ['OWNER', 'ADMIN'] } }
    })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Optional slug uniqueness check
    if (slug) {
      const existing = await prisma.workspace.findFirst({ where: { slug, id: { not: workspaceId } } })
      if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: name ?? undefined, description: description ?? undefined, slug: slug ?? undefined }
    })

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id: workspaceId } = await context.params

    // Only OWNER can delete
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: session.user.id, role: 'OWNER' }
    })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.workspace.delete({ where: { id: workspaceId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


