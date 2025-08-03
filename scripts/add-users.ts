import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding team members...');

  try {
    // Get Amarnath's workspace
    const workspace = await prisma.workspace.findFirst({
      where: { name: "Amarnath Pandey's Workspace" }
    });

    if (!workspace) {
      console.log('Workspace not found. Please run the clickup-seed first.');
      return;
    }

    // Create additional team members
    const teamMembers = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@teamflow.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
      },
      {
        name: 'Mike Chen',
        email: 'mike.chen@teamflow.com', 
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@teamflow.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily' 
      },
      {
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@teamflow.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
      }
    ];

    for (const memberData of teamMembers) {
      // Create user
      const user = await prisma.user.create({
        data: {
          ...memberData,
          password: await bcrypt.hash('password123', 12)
        }
      });

      // Add to workspace
      await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'MEMBER'
        }
      });

      console.log('Created user:', user.name);
    }

    console.log('✅ Successfully added team members!');
    console.log('You can now assign tasks to:');
    teamMembers.forEach(member => {
      console.log(`- ${member.name} (${member.email})`);
    });

  } catch (error) {
    console.error('❌ Failed to add users:', error);
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