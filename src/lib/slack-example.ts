/**
 * Example usage of Slack integration helpers
 * This file demonstrates how to use the Slack functions in your application
 */

import {
  sendSlackMessage,
  sendSlackNotification,
  sendProjectUpdateNotification,
  sendTeamNotification,
  testSlackIntegration,
} from './slack';

// Example 1: Send a simple message
export async function sendWelcomeMessage() {
  try {
    await sendSlackMessage('Welcome to TeamFlow! 🎉', {
      username: 'TeamFlow Bot',
      icon_emoji: ':wave:',
    });
  } catch (error) {
    console.error('Failed to send welcome message:', error);
  }
}

// Example 2: Send a formatted notification
export async function notifyTaskCompletion(taskName: string, userName: string) {
  try {
    await sendSlackNotification(
      'Task Completed',
      `${userName} has successfully completed "${taskName}"`,
      'success'
    );
  } catch (error) {
    console.error('Failed to send task completion notification:', error);
  }
}

// Example 3: Send project update
export async function notifyProjectCreated(projectName: string, createdBy: string) {
  try {
    await sendProjectUpdateNotification(
      projectName,
      'created',
      createdBy,
      'New project has been set up with initial configuration'
    );
  } catch (error) {
    console.error('Failed to send project creation notification:', error);
  }
}

// Example 4: Send team notification
export async function notifyNewTeamMember(memberName: string, role: string) {
  try {
    await sendTeamNotification(
      memberName,
      'joined',
      `Joined as ${role}`
    );
  } catch (error) {
    console.error('Failed to send team notification:', error);
  }
}

// Example 5: Error handling with multiple attempts
export async function sendCriticalAlert(message: string, maxRetries = 3) {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      await sendSlackNotification(
        'Critical Alert',
        message,
        'error'
      );
      console.log('Critical alert sent successfully');
      break;
    } catch (error) {
      attempts++;
      console.error(`Alert attempt ${attempts} failed:`, error);
      
      if (attempts >= maxRetries) {
        console.error('Failed to send critical alert after all retries');
        // You might want to store this in a database or log it elsewhere
        throw new Error('Failed to send critical Slack alert');
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }
}

// Example 6: Using in API routes (Next.js)
export async function handleProjectUpdate(req: any, res: any) {
  try {
    // Your project update logic here
    const { projectId, action, userId } = req.body;
    
    // Send Slack notification
    await sendProjectUpdateNotification(
      `Project #${projectId}`,
      action,
      `User ${userId}`,
      `Action performed via API at ${new Date().toISOString()}`
    );
    
    res.status(200).json({ message: 'Project updated and team notified' });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

// Example 7: Batch notifications
export async function sendDailySummary(summary: {
  tasksCompleted: number;
  newProjects: number;
  teamUpdates: string[];
}) {
  try {
    const message = [
      '📊 *Daily Summary*',
      `• Tasks completed: ${summary.tasksCompleted}`,
      `• New projects: ${summary.newProjects}`,
      `• Team updates: ${summary.teamUpdates.length}`,
      '',
      '🎯 *Recent Updates:*',
      ...summary.teamUpdates.map(update => `• ${update}`),
    ].join('\n');

    await sendSlackMessage(message, {
      username: 'TeamFlow Daily Report',
      icon_emoji: ':chart_with_upwards_trend:',
    });
  } catch (error) {
    console.error('Failed to send daily summary:', error);
  }
}

// Example 8: Testing the integration
export async function runSlackTests() {
  console.log('🧪 Testing Slack integration...');
  
  try {
    // Test basic connectivity
    await testSlackIntegration();
    
    // Test different message types
    await sendSlackMessage('Test message from TeamFlow');
    await sendSlackNotification('Test Notification', 'This is a test notification', 'info');
    
    console.log('✅ All Slack tests passed!');
  } catch (error) {
    console.error('❌ Slack tests failed:', error);
    throw error;
  }
} 