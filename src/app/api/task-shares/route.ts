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
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    // Verify user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { creatorId: session.user.id },
          { assigneeId: session.user.id },
          { shares: { some: { userId: session.user.id } } }
        ]
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const shares = await prisma.taskShare.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(shares);
  } catch (error) {
    console.error('Error fetching task shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, userEmail, permission = 'read' } = body;

    if (!taskId || !userEmail) {
      return NextResponse.json({ error: 'Task ID and user email required' }, { status: 400 });
    }

    // Verify user has permission to share the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { creatorId: session.user.id },
          { shares: { some: { userId: session.user.id, permission: { in: ['write', 'admin'] } } } }
        ]
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found or no permission to share' }, { status: 404 });
    }

    // Find the user to share with
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or update the share
    const share = await prisma.taskShare.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId: targetUser.id,
        },
      },
      update: { permission },
      create: {
        taskId,
        userId: targetUser.id,
        permission,
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
      },
    });

    // Create notification for the shared user
    await prisma.notification.create({
      data: {
        type: 'TASK_ASSIGNED',
        title: 'Task shared with you',
        message: `${session.user.name || 'Someone'} shared a task "${task.name}" with you`,
        userId: targetUser.id,
      },
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Error creating task share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID required' }, { status: 400 });
    }

    // Verify user has permission to delete the share
    const share = await prisma.taskShare.findFirst({
      where: {
        id: shareId,
        OR: [
          { userId: session.user.id }, // User can remove themselves
          { 
            task: {
              OR: [
                { creatorId: session.user.id }, // Task creator
                { shares: { some: { userId: session.user.id, permission: 'admin' } } } // Admin permission
              ]
            }
          }
        ]
      }
    });

    if (!share) {
      return NextResponse.json({ error: 'Share not found or no permission' }, { status: 404 });
    }

    await prisma.taskShare.delete({
      where: { id: shareId },
    });

    return NextResponse.json({ message: 'Share removed' });
  } catch (error) {
    console.error('Error deleting task share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}