import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTaskSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  parentTaskId: z.string().optional(),
  position: z.number().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id

    const task = await prisma.task.findFirst({
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
        subtasks: {
          select: {
            id: true,
            name: true,
            status: true,
            position: true
          },
          orderBy: {
            position: 'asc'
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

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id
    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if user has access to the task
      const existingTask = await tx.task.findFirst({
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
        throw new Error('Task not found or access denied')
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
                      id: existingTask.listId
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
        if (validatedData.parentTaskId === taskId) {
          throw new Error('Task cannot be its own parent')
        }

        const parentTask = await tx.task.findFirst({
          where: {
            id: validatedData.parentTaskId,
            listId: existingTask.listId
          }
        })

        if (!parentTask) {
          throw new Error('Parent task not found or not in the same list')
        }
      }

      // Prepare update data
      const updateData: any = {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      }

      // Handle completion status
      if (validatedData.status === 'DONE' && existingTask.status !== 'DONE') {
        updateData.completedAt = new Date()
      } else if (validatedData.status !== 'DONE' && existingTask.status === 'DONE') {
        updateData.completedAt = null
      }

      // Update the task
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: updateData,
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

      // Create activity logs
      const activities = []

      if (validatedData.status && validatedData.status !== existingTask.status) {
        activities.push({
          type: validatedData.status === 'DONE' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
          message: `Changed task status to "${validatedData.status}"`,
          taskId: updatedTask.id,
          userId: session.user.id,
          data: {
            taskName: updatedTask.name,
            oldStatus: existingTask.status,
            newStatus: validatedData.status
          }
        })
      }

      if (validatedData.assigneeId && validatedData.assigneeId !== existingTask.assigneeId) {
        activities.push({
          type: 'TASK_ASSIGNED',
          message: `Assigned task to ${updatedTask.assignee?.name || 'someone'}`,
          taskId: updatedTask.id,
          userId: session.user.id,
          data: {
            taskName: updatedTask.name,
            assigneeId: validatedData.assigneeId
          }
        })
      }

      // Create all activities
      if (activities.length > 0) {
        await tx.activity.createMany({
          data: activities
        })
      }

      return updatedTask
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating task:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('not found') || message.includes('access denied') ? 404 : 
                   message.includes('does not have access') || message.includes('cannot be its own parent') ? 400 : 500
    
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id

    // Use transaction for data consistency
    await prisma.$transaction(async (tx) => {
      // Check if user has access to the task
      const task = await tx.task.findFirst({
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
        throw new Error('Task not found or access denied')
      }

      // Delete the task (cascade will handle related data)
      await tx.task.delete({
        where: { id: taskId }
      })

      // Create activity log for deletion
      await tx.activity.create({
        data: {
          type: 'TASK_DELETED',
          message: `Deleted task "${task.name}"`,
          userId: session.user.id,
          data: {
            taskName: task.name,
            taskId: taskId
          }
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('not found') || message.includes('access denied') ? 404 : 500
    
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}