import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTaskSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).default('TODO'),
  priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']).default('NORMAL'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  listId: z.string(),
  assigneeId: z.string().optional(),
  parentTaskId: z.string().optional(),
})



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listId = searchParams.get('listId')
    const spaceId = searchParams.get('spaceId')
    const status = searchParams.get('status')
    const assigneeIdRaw = searchParams.get('assigneeId')
    const createdByIdRaw = searchParams.get('createdById')
    const watcherIdRaw = searchParams.get('watcherId')
    const watchingRaw = searchParams.get('watching')

    const whereClause: Record<string, unknown> = {}

    if (listId) {
      // Check access through list
      const list = await prisma.list.findFirst({
        where: {
          id: listId,
          space: {
            workspace: {
              members: {
                some: {
                  userId: session.user.id
                }
              }
            }
          }
        }
      })

      if (!list) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      whereClause.listId = listId
    } else if (spaceId) {
      // Check access through space
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

      whereClause.list = {
        spaceId: spaceId
      }
    } else {
      // Get tasks from all workspaces user has access to
      whereClause.list = {
        space: {
          workspace: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      }
    }

    // Add additional filters
    if (status) {
      whereClause.status = status
    }
    const assigneeId = assigneeIdRaw === 'me' ? session.user.id : assigneeIdRaw || undefined
    if (assigneeId) whereClause.assigneeId = assigneeId

    const createdById = createdByIdRaw === 'me' ? session.user.id : createdByIdRaw || undefined
    if (createdById) whereClause.createdById = createdById

    // Watching filter: if watcherId or watching=true (me), fetch taskIds from raw collection "task_watchers"
    const watcherId = watcherIdRaw === 'me' || (watchingRaw === 'true') ? session.user.id : watcherIdRaw || undefined
    if (watcherId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await (prisma as any).$runCommandRaw({
          find: 'task_watchers',
          filter: { userId: watcherId },
          projection: { taskId: 1 }
        })
        const ids = (res?.cursor?.firstBatch || []).map((d: any) => d.taskId).filter(Boolean)
        if (ids.length === 0) {
          return NextResponse.json([])
        }
        whereClause.id = { in: ids }
      } catch (e) {
        console.error('Watcher filter failed', e)
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        list: {
          select: {
            id: true,
            name: true,
            color: true,
            space: {
              select: {
                id: true,
                name: true,
                color: true,
                workspace: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            subtasks: true,
            comments: true,
            attachments: true
          }
        }
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
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
    const validatedData = createTaskSchema.parse(body)

    // Use transaction for data consistency
    const task = await prisma.$transaction(async (tx) => {
      // Check if user has access to the list
      const list = await tx.list.findFirst({
        where: {
          id: validatedData.listId,
          space: {
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
        }
      })

      if (!list) {
        throw new Error('Access denied to this list')
      }

      // Validate assignee if provided
      if (validatedData.assigneeId) {
        const assigneeAccess = await tx.workspaceMember.findFirst({
          where: {
            userId: validatedData.assigneeId,
            workspace: {
              spaces: {
                some: {
                  lists: {
                    some: {
                      id: validatedData.listId
                    }
                  }
                }
              }
            }
          }
        })

        if (!assigneeAccess) {
          throw new Error('Assignee does not have access to this workspace')
        }
      }

      // Validate parent task if provided
      if (validatedData.parentTaskId) {
        const parentTask = await tx.task.findFirst({
          where: {
            id: validatedData.parentTaskId,
            listId: validatedData.listId
          }
        })

        if (!parentTask) {
          throw new Error('Parent task not found or not in the same list')
        }
      }

      // Get the highest position for ordering
      const lastTask = await tx.task.findFirst({
        where: { listId: validatedData.listId },
        orderBy: { position: 'desc' }
      })

      // Prepare task data
      const taskData = {
        ...validatedData,
        position: (lastTask?.position || 0) + 1,
        createdById: session.user.id,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      }

      // Create the task
      const newTask = await tx.task.create({
        data: taskData,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          list: {
            select: {
              id: true,
              name: true,
              color: true,
              space: {
                select: {
                  id: true,
                  name: true,
                  color: true
                }
              }
            }
          },
          _count: {
            select: {
              subtasks: true,
              comments: true,
              attachments: true
            }
          }
        }
      })

      // Create activity log
      await tx.activity.create({
        data: {
          type: 'TASK_CREATED',
          message: `Created task "${newTask.name}"`,
          taskId: newTask.id,
          userId: session.user.id,
          data: {
            taskName: newTask.name,
            listName: newTask.list.name
          }
        }
      })

      return newTask
    })

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating task:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('Access denied') ? 403 : 
                   message.includes('does not have access') || message.includes('not found') ? 400 : 500
    
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}

