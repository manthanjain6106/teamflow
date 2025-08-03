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
  parentId: z.string().optional(),
})

const updateTaskSchema = createTaskSchema.partial().omit({ listId: true })

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
    const assigneeId = searchParams.get('assigneeId')

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
    if (assigneeId) {
      whereClause.assigneeId = assigneeId
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        creator: {
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
        },
        customFieldValues: {
          include: {
            customField: true
          }
        },
        tags: {
          include: {
            tag: true
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

    // Check if user has access to the list
    const list = await prisma.list.findFirst({
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If assigneeId is provided, check if assignee has access to workspace
    if (validatedData.assigneeId) {
      const assigneeAccess = await prisma.workspaceMember.findFirst({
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
        return NextResponse.json(
          { error: 'Assignee does not have access to this workspace' },
          { status: 400 }
        )
      }
    }

    // Get the highest position for ordering
    const lastTask = await prisma.task.findFirst({
      where: { listId: validatedData.listId },
      orderBy: { position: 'desc' }
    })

    const taskData = {
      ...validatedData,
      position: (lastTask?.position || 0) + 1,
      creatorId: session.user.id,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    }

    const task = await prisma.task.create({
      data: taskData,
      include: {
        creator: {
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
    await prisma.activity.create({
      data: {
        type: 'TASK_CREATED',
        message: `Created task "${task.name}"`,
        taskId: task.id,
        userId: session.user.id,
        data: {
          taskName: task.name,
          listName: task.list.name
        }
      }
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    // Check if user has access to the task
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        list: {
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
      },
      include: {
        list: true
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if assigneeId is valid if provided
    if (validatedData.assigneeId) {
      const assigneeAccess = await prisma.workspaceMember.findFirst({
        where: {
          userId: validatedData.assigneeId,
          workspace: {
            spaces: {
              some: {
                lists: {
                  some: {
                    id: existingTask.listId
                  }
                }
              }
            }
          }
        }
      })

      if (!assigneeAccess) {
        return NextResponse.json(
          { error: 'Assignee does not have access to this workspace' },
          { status: 400 }
        )
      }
    }

    const updateData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      completedAt: validatedData.status === 'DONE' && existingTask.status !== 'DONE' 
        ? new Date() 
        : validatedData.status !== 'DONE' ? null : undefined
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        creator: {
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

    // Create activity log for significant changes
    if (validatedData.status && validatedData.status !== existingTask.status) {
      await prisma.activity.create({
        data: {
          type: validatedData.status === 'DONE' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
          message: `Changed task status to "${validatedData.status}"`,
          taskId: task.id,
          userId: session.user.id,
          data: {
            taskName: task.name,
            oldStatus: existingTask.status,
            newStatus: validatedData.status
          }
        }
      })
    }

    if (validatedData.assigneeId && validatedData.assigneeId !== existingTask.assigneeId) {
      await prisma.activity.create({
        data: {
          type: 'TASK_ASSIGNED',
          message: `Assigned task to ${task.assignee?.name}`,
          taskId: task.id,
          userId: session.user.id,
          data: {
            taskName: task.name,
            assigneeId: validatedData.assigneeId
          }
        }
      })
    }

    return NextResponse.json(task)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating task:', error)
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
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Check if user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        list: {
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
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}