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
    const query = searchParams.get('q');
    const workspaceId = searchParams.get('workspaceId');
    const type = searchParams.get('type'); // 'task', 'document', 'goal', 'all'

    if (!query || !workspaceId) {
      return NextResponse.json({ error: 'Query and workspace ID required' }, { status: 400 });
    }

    // Verify user has access to workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: session.user.id },
          { 
            members: {
              some: { userId: session.user.id }
            }
          }
        ]
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const results: any[] = [];

    // Search tasks
    if (!type || type === 'all' || type === 'task') {
      const tasks = await prisma.task.findMany({
        where: {
          list: {
            space: {
              workspaceId,
            },
          },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          AND: [
            {
              OR: [
                { creatorId: session.user.id },
                { assigneeId: session.user.id },
                { shares: { some: { userId: session.user.id } } }
              ]
            }
          ]
        },
        include: {
          list: {
            include: {
              space: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        take: 10,
      });

      results.push(...tasks.map(task => ({
        id: task.id,
        type: 'task',
        title: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        creator: task.creator,
        assignee: task.assignee,
        space: task.list.space.name,
        list: task.list.name,
        url: `/app/tasks/${task.id}`,
        createdAt: task.createdAt,
      })));
    }

    // Search documents
    if (!type || type === 'all' || type === 'document') {
      const documents = await prisma.document.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
          AND: [
            {
              OR: [
                { createdById: session.user.id },
                { shares: { some: { userId: session.user.id } } }
              ]
            }
          ]
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        take: 10,
      });

      results.push(...documents.map(doc => ({
        id: doc.id,
        type: 'document',
        title: doc.title,
        description: doc.content?.substring(0, 200) + (doc.content?.length > 200 ? '...' : ''),
        starred: doc.starred,
        creator: doc.createdBy,
        folder: doc.folder?.name || 'No folder',
        url: `/app/docs/${doc.id}`,
        createdAt: doc.createdAt,
      })));
    }

    // Search goals
    if (!type || type === 'all' || type === 'goal') {
      const goals = await prisma.goal.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          keyResults: true,
        },
        take: 10,
      });

      results.push(...goals.map(goal => ({
        id: goal.id,
        type: 'goal',
        title: goal.title,
        description: goal.description,
        status: goal.status,
        progress: goal.progress,
        dueDate: goal.dueDate,
        owner: goal.owner,
        keyResultsCount: goal.keyResults.length,
        url: `/app/goals/${goal.id}`,
        createdAt: goal.createdAt,
      })));
    }

    // Search comments
    if (!type || type === 'all' || type === 'comment') {
      const comments = await prisma.comment.findMany({
        where: {
          content: { contains: query, mode: 'insensitive' },
          task: {
            list: {
              space: {
                workspaceId,
              },
            },
          },
        },
        include: {
          author: {
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
        take: 5,
      });

      results.push(...comments.map(comment => ({
        id: comment.id,
        type: 'comment',
        title: `Comment on "${comment.task.name}"`,
        description: comment.content,
        author: comment.author,
        taskId: comment.task.id,
        taskName: comment.task.name,
        url: `/app/tasks/${comment.task.id}#comment-${comment.id}`,
        createdAt: comment.createdAt,
      })));
    }

    // Sort by relevance and date
    results.sort((a, b) => {
      // Exact title matches first
      const aExact = a.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      results: results.slice(0, 50),
      total: results.length,
      query,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint to update search index
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entityId, title, content, type, workspaceId } = body;

    if (!entityId || !title || !type || !workspaceId) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Update or create search index entry
    await prisma.searchIndex.upsert({
      where: {
        entityId,
      },
      update: {
        title,
        content: content || '',
        type,
        workspaceId,
      },
      create: {
        entityId,
        title,
        content: content || '',
        type,
        workspaceId,
      },
    });

    return NextResponse.json({ message: 'Search index updated' });
  } catch (error) {
    console.error('Error updating search index:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}