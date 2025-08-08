import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check users
    const users = await prisma.user.findMany();
    console.log(`👥 Users: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });
    
    // Check workspaces
    const workspaces = await prisma.workspace.findMany({
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
    console.log(`🏢 Workspaces: ${workspaces.length}`);
    workspaces.forEach(workspace => {
      console.log(`  - ${workspace.name} (${workspace.slug})`);
      console.log(`    Members: ${workspace.members.length}`);
    });
    
    // Check spaces
    const spaces = await prisma.space.findMany({
      include: {
        workspace: true
      }
    });
    console.log(`📁 Spaces: ${spaces.length}`);
    spaces.forEach(space => {
      console.log(`  - ${space.name} (Workspace: ${space.workspace.name})`);
    });
    
    // Check lists
    const lists = await prisma.list.findMany({
      include: {
        space: true
      }
    });
    console.log(`📋 Lists: ${lists.length}`);
    lists.forEach(list => {
      console.log(`  - ${list.name} (Space: ${list.space.name})`);
    });
    
    // Check tasks
    const tasks = await prisma.task.findMany({
      include: {
        list: {
          include: {
            space: true
          }
        }
      }
    });
    console.log(`✅ Tasks: ${tasks.length}`);
    tasks.forEach(task => {
      console.log(`  - ${task.name} (List: ${task.list.name})`);
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
