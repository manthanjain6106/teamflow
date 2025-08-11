import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSpaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  private: z.boolean().default(false),
  workspaceId: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      )
    }

    // Check if user has access to the workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id
      }
    })

    if (!workspaceMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const spaces = await prisma.space.findMany({
      where: {
        workspaceId,
        OR: [
          { private: false },
          // Include private spaces if user has access
          { private: true }
        ]
      },
      include: {
        _count: {
          select: {
            lists: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(spaces)
  } catch (error) {
    console.error('Error fetching spaces:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSpaceSchema.parse(body)

    // Check if user has access to the workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id
      }
    })

    if (!workspaceMember || workspaceMember.role === 'GUEST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const space = await prisma.space.create({
      data: {
        ...validatedData,
        createdById: session.user.id
      },
      include: {
        _count: {
          select: {
            lists: true
          }
        }
      }
    })

    return NextResponse.json(space)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating space:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'Space ID is required' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      const space = await tx.space.findFirst({
        where: {
          id,
          workspace: {
            members: {
              some: {
                userId: session.user.id,
                role: { not: 'GUEST' }
              }
            }
          }
        }
      })

      if (!space) {
        throw new Error('Space not found or access denied')
      }

      await tx.space.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('not found') || message.includes('denied') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}