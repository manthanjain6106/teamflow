import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      role: 'USER',
    },
  });

  console.log('Created user:', user.name);

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      pushNotifications: true,
      taskAssigned: true,
      taskCompleted: false,
      mentions: true,
      dueDates: true,
    },
  });

  console.log('Created user settings');

  // Create a workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'my-workspace' },
    update: {},
    create: {
      name: 'My Workspace',
      slug: 'my-workspace',
      description: 'A sample workspace for testing',
      creatorId: user.id,
    },
  });

  console.log('Created workspace:', workspace.name);

  // Create document folders
  const productFolder = await prisma.documentFolder.create({
    data: {
      name: 'Product',
      color: '#3b82f6',
      workspaceId: workspace.id,
    },
  });

  const engineeringFolder = await prisma.documentFolder.create({
    data: {
      name: 'Engineering',
      color: '#10b981',
      workspaceId: workspace.id,
    },
  });

  const marketingFolder = await prisma.documentFolder.create({
    data: {
      name: 'Marketing',
      color: '#f59e0b',
      workspaceId: workspace.id,
    },
  });

  console.log('Created document folders');

  // Create documents
  const documents = [
    {
      title: 'Project Requirements Document',
      content: 'This document outlines the key requirements for our upcoming project. It includes functional specifications, user stories, and acceptance criteria.',
      starred: true,
      folderId: productFolder.id,
    },
    {
      title: 'API Documentation',
      content: 'Complete API reference with endpoints, request/response examples, and authentication details.',
      starred: false,
      folderId: engineeringFolder.id,
    },
    {
      title: 'Brand Guidelines',
      content: 'Our brand identity guidelines including logo usage, color palette, typography, and tone of voice.',
      starred: true,
      folderId: marketingFolder.id,
    },
    {
      title: 'Meeting Notes - Sprint Planning',
      content: 'Notes from our sprint planning meeting including story estimation and sprint goals.',
      starred: false,
      folderId: productFolder.id,
    },
    {
      title: 'Technical Architecture',
      content: 'System architecture documentation including database schema, API design, and deployment strategy.',
      starred: false,
      folderId: engineeringFolder.id,
    },
  ];

  for (const doc of documents) {
    await prisma.document.create({
      data: {
        ...doc,
        workspaceId: workspace.id,
        createdById: user.id,
      },
    });
  }

  console.log('Created documents');

  // Create goals with key results
  const goals = [
    {
      title: 'Increase User Engagement',
      description: 'Improve user engagement metrics across all platforms',
      progress: 75,
      status: 'ON_TRACK',
      dueDate: new Date('2024-12-31'),
      keyResults: [
        { name: 'Increase daily active users by 25%', target: 1000, current: 800 },
        { name: 'Reduce bounce rate to under 30%', target: 30, current: 35 },
        { name: 'Improve user retention by 15%', target: 85, current: 72 },
      ],
    },
    {
      title: 'Launch Mobile App',
      description: 'Successfully launch and deploy mobile application',
      progress: 45,
      status: 'AT_RISK',
      dueDate: new Date('2024-11-30'),
      keyResults: [
        { name: 'Complete iOS app development', target: 100, current: 60 },
        { name: 'Complete Android app development', target: 100, current: 40 },
        { name: 'Achieve 1000 beta testers', target: 1000, current: 350 },
      ],
    },
    {
      title: 'Improve Customer Satisfaction',
      description: 'Enhance customer experience and support quality',
      progress: 90,
      status: 'ON_TRACK',
      dueDate: new Date('2024-12-15'),
      keyResults: [
        { name: 'Achieve NPS score of 70+', target: 70, current: 73 },
        { name: 'Reduce support ticket response time to 2h', target: 2, current: 2.5 },
        { name: 'Increase customer retention to 95%', target: 95, current: 92 },
      ],
    },
  ];

  for (const goalData of goals) {
    const { keyResults, ...goalInfo } = goalData;
    const goal = await prisma.goal.create({
      data: {
        ...goalInfo,
        workspaceId: workspace.id,
        ownerId: user.id,
        keyResults: {
          create: keyResults.map(kr => ({
            ...kr,
            progress: Math.round((kr.current / kr.target) * 100),
          })),
        },
      },
    });
    console.log('Created goal:', goal.title);
  }

  // Create spaces
  const productSpace = await prisma.space.create({
    data: {
      name: 'Product Development',
      description: 'Product planning and development tasks',
      color: '#3b82f6',
      workspaceId: workspace.id,
    },
  });

  const marketingSpace = await prisma.space.create({
    data: {
      name: 'Marketing',
      description: 'Marketing campaigns and content',
      color: '#10b981',
      workspaceId: workspace.id,
    },
  });

  console.log('Created spaces');

  // Create lists
  const todoList = await prisma.list.create({
    data: {
      name: 'To Do',
      description: 'Tasks that need to be started',
      spaceId: productSpace.id,
    },
  });

  const inProgressList = await prisma.list.create({
    data: {
      name: 'In Progress',
      description: 'Tasks currently being worked on',
      spaceId: productSpace.id,
    },
  });

  const marketingList = await prisma.list.create({
    data: {
      name: 'Marketing Tasks',
      description: 'Marketing and promotional tasks',
      spaceId: marketingSpace.id,
    },
  });

  console.log('Created lists');

  // Create tasks
  const tasks = [
    {
      name: 'Design user onboarding flow',
      description: 'Create wireframes and mockups for the user onboarding process',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      listId: inProgressList.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      name: 'Implement authentication system',
      description: 'Set up user registration, login, and password reset functionality',
      status: 'OPEN',
      priority: 'URGENT',
      listId: todoList.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
    {
      name: 'Write API documentation',
      description: 'Document all API endpoints with examples and response formats',
      status: 'OPEN',
      priority: 'NORMAL',
      listId: todoList.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    {
      name: 'Create marketing landing page',
      description: 'Design and develop a landing page for the product launch',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      listId: marketingList.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
    {
      name: 'Set up analytics tracking',
      description: 'Implement Google Analytics and custom event tracking',
      status: 'DONE',
      priority: 'NORMAL',
      listId: inProgressList.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (completed)
    },
    {
      name: 'Fix mobile responsive issues',
      description: 'Address mobile layout problems on the dashboard',
      status: 'OPEN',
      priority: 'HIGH',
      listId: todoList.id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        creatorId: user.id,
        assigneeId: user.id,
      },
    });
  }

  console.log('Created tasks');

  // Create some comments
  const createdTasks = await prisma.task.findMany();
  for (const task of createdTasks.slice(0, 3)) {
    await prisma.comment.create({
      data: {
        content: `This is a sample comment on task: ${task.name}`,
        taskId: task.id,
        authorId: user.id,
      },
    });
  }

  console.log('Created comments');

  // Create time entries
  for (const task of createdTasks.slice(0, 2)) {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    await prisma.timeEntry.create({
      data: {
        description: `Time spent working on ${task.name}`,
        duration: 7200, // 2 hours in seconds
        startTime: startTime,
        endTime: endTime,
        taskId: task.id,
        userId: user.id,
      },
    });
  }

  console.log('Created time entries');

  // Create activities
  const activities = [
    {
      type: 'TASK_CREATED',
      message: 'Task was created',
      userId: user.id,
      taskId: createdTasks[0].id,
    },
    {
      type: 'TASK_ASSIGNED',
      message: 'Task was assigned to user',
      userId: user.id,
      taskId: createdTasks[1].id,
    },
    {
      type: 'TASK_COMPLETED',
      message: 'Task was completed',
      userId: user.id,
      taskId: createdTasks[4].id, // The completed task
    },
    {
      type: 'COMMENT_ADDED',
      message: 'Comment was added to task',
      userId: user.id,
      taskId: createdTasks[0].id,
    },
  ];

  for (const activity of activities) {
    await prisma.activity.create({
      data: activity,
    });
  }

  console.log('Created activities');

  // Create notifications
  const notifications = [
    {
      type: 'TASK_ASSIGNED',
      title: 'New task assigned to you',
      message: 'You have been assigned to "Design user onboarding flow"',
      read: false,
      userId: user.id,
    },
    {
      type: 'COMMENT_MENTION',
      title: 'New comment on your task',
      message: 'Someone commented on "Implement authentication system"',
      read: false,
      userId: user.id,
    },
    {
      type: 'DUE_DATE_REMINDER',
      title: 'Task due soon',
      message: '"Fix mobile responsive issues" is overdue',
      read: true,
      userId: user.id,
    },
    {
      type: 'TASK_COMPLETED',
      title: 'Task completed',
      message: 'You completed "Set up analytics tracking"',
      read: true,
      userId: user.id,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log('Created notifications');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });