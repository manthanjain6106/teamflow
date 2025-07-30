import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  spaceId: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')

    if (!spaceId) {
      return NextResponse.json(
        { error: 'Space ID is required' },
        { status: 400 }
      )
    }

    // Check if user has access to the space through workspace membership
    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
        workspace: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

    if (!space) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const lists = await prisma.list.findMany({
      where: {
        spaceId,
        isArchived: false
      },
      include: {
        _count: {
          select: {
            tasks: {
              where: {
                status: {
                  not: 'CANCELLED'
                }
              }
            }
          }
        }
      },
      orderBy: {
        position: 'asc'
      }
    })

    return NextResponse.json(lists)
  } catch (error) {
    console.error('Error fetching lists:', error)
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
    const validatedData = createListSchema.parse(body)

    // Check if user has access to the space through workspace membership
    const space = await prisma.space.findFirst({
      where: {
        id: validatedData.spaceId,
        workspace: {
          members: {
            some: {
              userId: session.user.id,
              role: {
                not: 'GUEST'
              }
            }
          }
        }
      }
    })

    if (!space) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the highest position for ordering
    const lastList = await prisma.list.findFirst({
      where: { spaceId: validatedData.spaceId },
      orderBy: { position: 'desc' }
    })

    const list = await prisma.list.create({
      data: {
        ...validatedData,
        position: (lastList?.position || 0) + 1
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json(list)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}