import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const period = searchParams.get('period') || '7d';

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Verify user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: session.user.id } }
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get all tasks in workspace
    const allTasks = await prisma.task.findMany({
      where: {
        list: {
          space: {
            workspaceId,
          },
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            subtasks: true,
            attachments: true,
          },
        },
      },
    });

    // Get tasks created in the period
    const tasksInPeriod = allTasks.filter(task => task.createdAt >= startDate);
    const completedTasksInPeriod = allTasks.filter(task => 
      task.status === 'DONE' && task.updatedAt >= startDate
    );

    // Calculate stats
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'DONE').length;
    const inProgressTasks = allTasks.filter(task => task.status === 'IN_PROGRESS').length;
    const overdueTasks = allTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE'
    ).length;

    // Get team members count
    const teamMembers = await prisma.workspaceMember.count({
      where: { workspaceId },
    });

    // Team performance data
    const teamPerformance = await prisma.user.findMany({
      where: {
        workspaceMembers: { some: { workspaceId } },
      },
      include: {
        assignedTasks: {
          where: {
            list: {
              space: {
                workspaceId,
              },
            },
          },
        },
      },
    });

    const teamStats = teamPerformance.map(member => {
      const memberTasks = member.assignedTasks;
      const completedTasks = memberTasks.filter(task => task.status === 'DONE').length;
      const totalTasks = memberTasks.length;
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        name: member.name || member.email,
        completed: completedTasks,
        total: totalTasks,
        percentage,
      };
    }).filter(member => member.total > 0);

    // Recent activity
    const recentActivities = await prisma.activity.findMany({
      where: {
        OR: [
          {
            task: {
              list: {
                space: {
                  workspaceId,
                },
              },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Calculate changes vs previous period
    const prevPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const prevPeriodTasks = allTasks.filter(task => 
      task.createdAt >= prevPeriodStart && task.createdAt < startDate
    );
    const prevCompletedTasks = allTasks.filter(task => 
      task.status === 'DONE' && 
      task.updatedAt >= prevPeriodStart && 
      task.updatedAt < startDate
    );

    const taskChange = tasksInPeriod.length - prevPeriodTasks.length;
    const completedChange = completedTasksInPeriod.length - prevCompletedTasks.length;

    const analytics = {
      stats: [
        {
          name: 'Total Tasks',
          value: totalTasks,
          change: taskChange,
          changeType: taskChange >= 0 ? 'positive' : 'negative',
        },
        {
          name: 'Completed',
          value: completedTasks,
          change: completedChange,
          changeType: completedChange >= 0 ? 'positive' : 'negative',
        },
        {
          name: 'In Progress',
          value: inProgressTasks,
          change: 0, // Calculate if needed
          changeType: 'neutral',
        },
        {
          name: 'Team Members',
          value: teamMembers + 1, // +1 for workspace owner
          change: 0, // Calculate if needed
          changeType: 'neutral',
        },
      ],
      teamPerformance: teamStats,
      recentActivity: recentActivities.map(activity => ({
        action: formatActivityType(activity.type),
        description: formatActivityDescription(activity, activity.task?.name),
        time: formatTimeAgo(activity.createdAt),
        type: getActivityTypeCategory(activity.type),
        user: activity.user?.name || 'Unknown',
      })),
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatActivityType(type: string): string {
  switch (type) {
    case 'TASK_CREATED': return 'Task created';
    case 'TASK_UPDATED': return 'Task updated';
    case 'TASK_COMPLETED': return 'Task completed';
    case 'TASK_ASSIGNED': return 'Task assigned';
    case 'COMMENT_ADDED': return 'Comment added';
    case 'STATUS_CHANGED': return 'Status changed';
    case 'PRIORITY_CHANGED': return 'Priority changed';
    default: return type.toLowerCase().replace('_', ' ');
  }
}

type ActivityForDescription = {
  type: string;
  user?: { name?: string | null } | null;
};

function formatActivityDescription(activity: ActivityForDescription, taskName?: string): string {
  const userName = activity.user?.name || 'Someone';
  const task = taskName ? `"${taskName}"` : 'a task';
  
  switch (activity.type) {
    case 'TASK_CREATED': return `${userName} created ${task}`;
    case 'TASK_COMPLETED': return `${userName} completed ${task}`;
    case 'TASK_ASSIGNED': return `${userName} was assigned to ${task}`;
    case 'COMMENT_ADDED': return `${userName} commented on ${task}`;
    default: return `${userName} ${formatActivityType(activity.type).toLowerCase()} ${task}`;
  }
}

function getActivityTypeCategory(type: string): string {
  switch (type) {
    case 'TASK_COMPLETED': return 'success';
    case 'TASK_CREATED': 
    case 'TASK_ASSIGNED':
    case 'COMMENT_ADDED': return 'info';
    default: return 'info';
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    return `${diffInDays} days ago`;
  }
}