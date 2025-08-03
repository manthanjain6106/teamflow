import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting ClickUp-style seed...');

  try {
    // Create Amarnath Pandey user
    const user = await prisma.user.create({
      data: {
        name: 'Amarnath Pandey',
        email: 'amarnath.pandey@teamflow.com',
        password: await bcrypt.hash('password123', 12),
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amarnath'
      }
    });

    console.log('Created user:', user.name);

    // Create "Amarnath Pandey's Workspace"
    const workspace = await prisma.workspace.create({
      data: {
        name: "Amarnath Pandey's Workspace",
        slug: 'amarnath-pandeys-workspace',
        description: 'Main workspace for project management',
        creatorId: user.id
      }
    });

    // Add user as workspace member
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'OWNER'
      }
    });

    console.log('Created workspace:', workspace.name);

    // Create Team Space
    const teamSpace = await prisma.space.create({
      data: {
        name: 'Team Space',
        description: 'Main team collaboration space',
        color: '#3b82f6',
        workspaceId: workspace.id
      }
    });

    // Create CORE list
    const coreList = await prisma.list.create({
      data: {
        name: 'CORE',
        description: 'Core development tasks',
        color: '#10b981',
        position: 0,
        spaceId: teamSpace.id
      }
    });

    // Create Integration list  
    const integrationList = await prisma.list.create({
      data: {
        name: 'Integration',
        description: 'Integration and API tasks',
        color: '#f59e0b',
        position: 1,
        spaceId: teamSpace.id
      }
    });

    console.log('Created lists: CORE, Integration');

    // Create real tasks matching the ClickUp screenshot
    const tasks = [
      {
        name: 'Meta ads',
        description: 'Set up and optimize Meta advertising campaigns',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        listId: coreList.id,
        creatorId: user.id,
        assigneeId: user.id,
        dueDate: new Date('2025-01-15'),
        startDate: new Date('2025-01-01')
      },
      {
        name: 'Google Search Console',
        description: 'Implement Google Search Console integration and monitoring',
        status: 'OPEN',
        priority: 'NORMAL',
        listId: integrationList.id,
        creatorId: user.id,
        assigneeId: user.id,
        dueDate: new Date('2025-01-20'),
        startDate: new Date('2025-01-10')
      },
      {
        name: 'Stripe',
        description: 'Integrate Stripe payment processing system',
        status: 'OPEN',
        priority: 'HIGH',
        listId: integrationList.id,
        creatorId: user.id,
        assigneeId: user.id,
        dueDate: new Date('2025-01-25'),
        startDate: new Date('2025-01-15')
      },
      {
        name: 'Marketing Campaign',
        description: 'Launch Q1 marketing campaign across all channels',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        listId: coreList.id,
        creatorId: user.id,
        assigneeId: user.id,
        dueDate: new Date('2025-02-01'),
        startDate: new Date('2025-01-05')
      },
      {
        name: 'Website Redesign',
        description: 'Complete homepage and landing page redesign',
        status: 'OPEN',
        priority: 'NORMAL',
        listId: coreList.id,
        creatorId: user.id,
        assigneeId: user.id,
        dueDate: new Date('2025-02-15'),
        startDate: new Date('2025-01-20')
      }
    ];

    for (const taskData of tasks) {
      const task = await prisma.task.create({
        data: taskData
      });

      // Create activity for task creation
      await prisma.activity.create({
        data: {
          type: 'TASK_CREATED',
          message: `Created task "${task.name}"`,
          taskId: task.id,
          userId: user.id,
          metadata: {
            taskName: task.name,
            status: task.status
          }
        }
      });

      console.log('Created task:', task.name);
    }

    // Create additional spaces to match ClickUp structure
    const spaces = [
      { name: 'Marketing', color: '#ef4444' },
      { name: 'CRM', color: '#8b5cf6' },
      { name: 'MAVROX', color: '#06b6d4' },
      { name: 'Project Management', color: '#84cc16' },
      { name: 'Agile Scrum Management', color: '#f97316' }
    ];

    for (const spaceData of spaces) {
      const space = await prisma.space.create({
        data: {
          ...spaceData,
          workspaceId: workspace.id
        }
      });

      // Create a default list for each space
      await prisma.list.create({
        data: {
          name: 'Tasks',
          description: `Tasks for ${spaceData.name}`,
          color: spaceData.color,
          position: 0,
          spaceId: space.id
        }
      });

      console.log('Created space:', space.name);
    }

    // Create some comments
    await prisma.comment.create({
      data: {
        content: 'Meta ads campaign is performing well. CPM is down 15% this week.',
        taskId: (await prisma.task.findFirst({ where: { name: 'Meta ads' } }))!.id,
        authorId: user.id
      }
    });

    // Create search index entries
    const allTasks = await prisma.task.findMany({
      include: { list: { include: { space: true } } }
    });

    for (const task of allTasks) {
      await prisma.searchIndex.create({
        data: {
          title: task.name,
          content: task.description || '',
          type: 'task',
          entityId: task.id,
          workspaceId: workspace.id
        }
      });
    }

    console.log('✅ ClickUp-style seed completed successfully!');
    console.log(`👤 User: ${user.email} / password123`);
    console.log(`🏢 Workspace: ${workspace.name}`);
    console.log(`📋 Created ${tasks.length} real tasks`);
    console.log(`🎯 Created ${spaces.length + 1} spaces total`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });