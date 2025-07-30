import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        members: {
          where: {
            userId: session.user.id
          },
          select: {
            role: true
          }
        },
        _count: {
          select: {
            members: true,
            spaces: true
          }
        }
      }
    })

    const formattedWorkspaces = workspaces.map(workspace => ({
      ...workspace,
      role: workspace.members[0]?.role,
      members: undefined
    }))

    return NextResponse.json(formattedWorkspaces)
  } catch (error) {
    console.error('Error fetching workspaces:', error)
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
    const validatedData = createWorkspaceSchema.parse(body)

    // Check if slug is already taken
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingWorkspace) {
      return NextResponse.json(
        { error: 'Workspace slug already exists' },
        { status: 409 }
      )
    }

    // Create workspace with the user as owner
    const workspace = await prisma.workspace.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: {
          where: {
            userId: session.user.id
          },
          select: {
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      ...workspace,
      role: workspace.members[0]?.role,
      members: undefined
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating workspace:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}