#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing user access and data...')

  try {
    // Get all users
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name || 'No name'})`)
    })

    // Get the demo workspace
    let demoWorkspace = await prisma.workspace.findUnique({
      where: { slug: 'demo-workspace' },
      include: {
        members: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!demoWorkspace) {
      console.log('❌ Demo workspace not found. Creating it...')
      
      // Create demo workspace with first user as owner
      if (users.length > 0) {
        const firstUser = users[0]
        demoWorkspace = await prisma.workspace.create({
          data: {
            name: 'Demo Workspace',
            slug: 'demo-workspace',
            description: 'A demo workspace for testing TeamFlow',
            createdById: firstUser.id,
            members: {
              create: {
                userId: firstUser.id,
                role: 'OWNER'
              }
            }
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    email: true,
                    name: true
                  }
                }
              }
            }
          }
        })
        console.log('✅ Created demo workspace')
      } else {
        console.log('❌ No users found to create workspace')
        return
      }
    }

    console.log(`\n📋 Demo workspace members:`)
    demoWorkspace.members.forEach(member => {
      console.log(`- ${member.user.email} (${member.role})`)
    })

    // Add all users to the demo workspace if they're not already members
    for (const user of users) {
      const existingMember = demoWorkspace.members.find(m => m.userId === user.id)
      if (!existingMember) {
        await prisma.workspaceMember.create({
          data: {
            userId: user.id,
            workspaceId: demoWorkspace.id,
            role: 'MEMBER'
          }
        })
        console.log(`✅ Added ${user.email} to demo workspace`)
      }
    }

    // Check if demo spaces exist
    const spaces = await prisma.space.findMany({
      where: { workspaceId: demoWorkspace.id }
    })

    if (spaces.length === 0) {
      console.log('📁 Creating demo spaces...')
      
      const firstUser = users[0]
      
      const marketingSpace = await prisma.space.create({
        data: {
          name: 'Marketing',
          description: 'Marketing campaigns and content',
          color: '#f59e0b',
          workspaceId: demoWorkspace.id,
          createdById: firstUser.id,
          private: false
        }
      })

      const developmentSpace = await prisma.space.create({
        data: {
          name: 'Development', 
          description: 'Software development tasks',
          color: '#3b82f6',
          workspaceId: demoWorkspace.id,
          createdById: firstUser.id,
          private: false
        }
      })

      // Create lists
      const sprintList = await prisma.list.create({
        data: {
          name: 'Current Sprint',
          description: 'Active development tasks',
          color: '#10b981',
          spaceId: developmentSpace.id,
          createdById: firstUser.id,
          position: 1
        }
      })

      const campaignList = await prisma.list.create({
        data: {
          name: 'Campaigns',
          description: 'Marketing campaign tasks',
          color: '#f59e0b',
          spaceId: marketingSpace.id,
          createdById: firstUser.id,
          position: 1
        }
      })

      // Create some tasks
      await prisma.task.create({
        data: {
          name: 'Welcome to TeamFlow!',
          description: 'This is your first task. Click to edit or mark as complete.',
          status: 'TODO',
          priority: 'NORMAL',
          listId: sprintList.id,
          createdById: firstUser.id,
          position: 1
        }
      })

      await prisma.task.create({
        data: {
          name: 'Plan marketing campaign',
          description: 'Create a comprehensive marketing strategy for Q1',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          listId: campaignList.id,
          createdById: firstUser.id,
          position: 1
        }
      })

      console.log('✅ Created demo spaces, lists, and tasks')
    } else {
      console.log(`✅ Found ${spaces.length} existing spaces`)
    }

    // Final verification
    const taskCount = await prisma.task.count({
      where: {
        list: {
          space: {
            workspace: {
              members: {
                some: {
                  userId: users[0]?.id
                }
              }
            }
          }
        }
      }
    })

    console.log(`\n🎉 Setup complete!`)
    console.log(`📊 Total tasks accessible to users: ${taskCount}`)
    console.log(`🏢 Workspace: ${demoWorkspace.name}`)
    console.log(`👥 Members: ${demoWorkspace.members.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })