import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Test database connection and data
    const results = {
      session: session ? {
        userId: session.user?.id,
        userEmail: session.user?.email,
        userName: session.user?.name
      } : null,
      counts: {
        users: await prisma.user.count(),
        workspaces: await prisma.workspace.count(),
        workspaceMembers: await prisma.workspaceMember.count(),
        spaces: await prisma.space.count(),
        lists: await prisma.list.count(),
        tasks: await prisma.task.count()
      }
    }

    if (session?.user?.id) {
      results.userWorkspaces = await prisma.workspace.findMany({
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

      results.userTasks = await prisma.task.findMany({
        where: {
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
        take: 5,
        include: {
          list: {
            select: {
              name: true,
              space: {
                select: {
                  name: true,
                  workspace: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}