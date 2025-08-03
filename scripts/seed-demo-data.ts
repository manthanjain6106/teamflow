#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  // Create demo users
  const demoUserPassword = await bcrypt.hash('demo123', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@teamflow.com' },
    update: {},
    create: {
      email: 'demo@teamflow.com',
      name: 'Demo User',
      password: demoUserPassword,
      role: 'ADMIN'
    }
  })

  const johnUser = await prisma.user.upsert({
    where: { email: 'john@teamflow.com' },
    update: {},
    create: {
      email: 'john@teamflow.com',
      name: 'John Smith',
      password: demoUserPassword,
      role: 'USER'
    }
  })

  const sarahUser = await prisma.user.upsert({
    where: { email: 'sarah@teamflow.com' },
    update: {},
    create: {
      email: 'sarah@teamflow.com',
      name: 'Sarah Johnson',
      password: demoUserPassword,
      role: 'USER'
    }
  })

  console.log('✅ Created demo users')

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      description: 'A demo workspace for testing TeamFlow',
      creatorId: demoUser.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'OWNER' },
          { userId: johnUser.id, role: 'MEMBER' },
          { userId: sarahUser.id, role: 'MEMBER' }
        ]
      }
    }
  })

  console.log('✅ Created demo workspace')

  // Create spaces
  const marketingSpace = await prisma.space.create({
    data: {
      name: 'Marketing',
      description: 'Marketing campaigns and content',
      color: '#f59e0b',
      workspaceId: workspace.id,
      private: false
    }
  })

  const developmentSpace = await prisma.space.create({
    data: {
      name: 'Development', 
      description: 'Software development tasks',
      color: '#3b82f6',
      workspaceId: workspace.id,
      private: false
    }
  })

  const designSpace = await prisma.space.create({
    data: {
      name: 'Design',
      description: 'UI/UX design projects',
      color: '#8b5cf6',
      workspaceId: workspace.id,
      private: false
    }
  })

  console.log('✅ Created demo spaces')

  // Create lists
  const sprintList = await prisma.list.create({
    data: {
      name: 'Current Sprint',
      description: 'Active development tasks',
      color: '#10b981',
      spaceId: developmentSpace.id,
      position: 1
    }
  })

  const backlogList = await prisma.list.create({
    data: {
      name: 'Backlog',
      description: 'Future development tasks',
      color: '#6b7280',
      spaceId: developmentSpace.id,
      position: 2
    }
  })

  const campaignList = await prisma.list.create({
    data: {
      name: 'Campaigns',
      description: 'Marketing campaign tasks',
      color: '#f59e0b',
      spaceId: marketingSpace.id,
      position: 1
    }
  })

  const designList = await prisma.list.create({
    data: {
      name: 'Design Projects',
      description: 'UI/UX design tasks',
      color: '#8b5cf6',
      spaceId: designSpace.id,
      position: 1
    }
  })

  console.log('✅ Created demo lists')

  // Create demo tasks
  const tasks = [
    {
      name: 'Implement user authentication',
      description: 'Add login/logout functionality with JWT tokens',
      status: 'DONE',
      priority: 'HIGH',
      listId: sprintList.id,
      creatorId: demoUser.id,
      assigneeId: johnUser.id,
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-01-05')
    },
    {
      name: 'Design landing page',
      description: 'Create a modern landing page design for the product',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      listId: designList.id,
      creatorId: demoUser.id,
      assigneeId: sarahUser.id,
      startDate: new Date('2024-01-03'),
      dueDate: new Date('2024-01-10')
    },
    {
      name: 'Set up CI/CD pipeline',
      description: 'Configure automated testing and deployment',
      status: 'OPEN',
      priority: 'NORMAL',
      listId: sprintList.id,
      creatorId: demoUser.id,
      assigneeId: johnUser.id,
      startDate: new Date('2024-01-08'),
      dueDate: new Date('2024-01-15')
    },
    {
      name: 'Launch social media campaign',
      description: 'Create and launch Q1 social media campaign',
      status: 'OPEN',
      priority: 'URGENT',
      listId: campaignList.id,
      creatorId: demoUser.id,
      assigneeId: sarahUser.id,
      startDate: new Date('2024-01-10'),
      dueDate: new Date('2024-01-20')
    },
    {
      name: 'Mobile app optimization',
      description: 'Optimize mobile app performance and user experience',
      status: 'OPEN',
      priority: 'NORMAL',
      listId: backlogList.id,
      creatorId: demoUser.id,
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-01-30')
    },
    {
      name: 'Create brand guidelines',
      description: 'Develop comprehensive brand guidelines document',
      status: 'OPEN',
      priority: 'LOW',
      listId: designList.id,
      creatorId: demoUser.id,
      assigneeId: sarahUser.id,
      startDate: new Date('2024-01-12'),
      dueDate: new Date('2024-01-25')
    }
  ]

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        position: tasks.indexOf(task) + 1
      }
    })
  }

  console.log('✅ Created demo tasks')

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      pushNotifications: true,
      taskAssigned: true,
      taskCompleted: false,
      mentions: true,
      dueDates: true
    }
  })

  console.log('✅ Created user settings')

  console.log('🎉 Demo data seeded successfully!')
  console.log('\n📧 Demo login credentials:')
  console.log('Email: demo@teamflow.com')
  console.log('Password: demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })