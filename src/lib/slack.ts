/**
 * Slack Integration Helper
 * Sends messages to Slack using incoming webhooks
 */

interface SlackMessage {
  text: string;
  username?: string;
  icon_emoji?: string;
  channel?: string;
}

interface SlackWebhookResponse {
  ok?: boolean;
  error?: string;
}

/**
 * Sends a message to Slack using a webhook URL
 * @param message - The message text to send to Slack
 * @param options - Optional configuration for the message
 * @returns Promise<void>
 * @throws Error if webhook URL is not configured or request fails
 */
export async function sendSlackMessage(
  message: string,
  options?: {
    username?: string;
    icon_emoji?: string;
    channel?: string;
  }
): Promise<void> {
  // Get webhook URL from environment variables
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error(
      'SLACK_WEBHOOK_URL environment variable is not set. Please configure your Slack webhook URL.'
    );
  }

  // Prepare the message payload
  const payload: SlackMessage = {
    text: message,
    username: options?.username || 'TeamFlow Bot',
    icon_emoji: options?.icon_emoji || ':robot_face:',
    ...(options?.channel && { channel: options.channel }),
  };

  try {
    // Send POST request to Slack webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Slack webhook request failed with status ${response.status}: ${errorText}`
      );
    }

    // For successful requests, Slack returns "ok" as plain text
    const responseText = await response.text();
    if (responseText !== 'ok') {
      throw new Error(`Slack webhook returned unexpected response: ${responseText}`);
    }

    console.log('✅ Slack message sent successfully');
  } catch (error) {
    // Log the error for debugging
    console.error('❌ Failed to send Slack message:', error);
    
    // Re-throw the error so calling code can handle it
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error occurred while sending Slack message');
  }
}

/**
 * Sends a formatted notification to Slack with rich formatting
 * @param title - The notification title
 * @param message - The notification message
 * @param level - The severity level (info, success, warning, error)
 * @returns Promise<void>
 */
export async function sendSlackNotification(
  title: string,
  message: string,
  level: 'info' | 'success' | 'warning' | 'error' = 'info'
): Promise<void> {
  const icons = {
    info: ':information_source:',
    success: ':white_check_mark:',
    warning: ':warning:',
    error: ':x:',
  };

  const colors = {
    info: '',
    success: ':green_circle: ',
    warning: ':yellow_circle: ',
    error: ':red_circle: ',
  };

  const formattedMessage = `${colors[level]}*${title}*\n${message}`;

  await sendSlackMessage(formattedMessage, {
    username: 'TeamFlow Notifications',
    icon_emoji: icons[level],
  });
}

/**
 * Sends a project update notification to Slack
 * @param projectName - Name of the project
 * @param action - The action that occurred (created, updated, completed, etc.)
 * @param user - The user who performed the action
 * @param details - Additional details about the update
 * @returns Promise<void>
 */
export async function sendProjectUpdateNotification(
  projectName: string,
  action: string,
  user: string,
  details?: string
): Promise<void> {
  const message = [
    `:file_folder: *Project Update*`,
    `• *Project:* ${projectName}`,
    `• *Action:* ${action}`,
    `• *User:* ${user}`,
    ...(details ? [`• *Details:* ${details}`] : []),
    `• *Time:* ${new Date().toLocaleString()}`,
  ].join('\n');

  await sendSlackMessage(message, {
    username: 'TeamFlow Projects',
    icon_emoji: ':file_folder:',
  });
}

/**
 * Sends a team member notification to Slack
 * @param memberName - Name of the team member
 * @param action - The action (joined, left, role_changed, etc.)
 * @param details - Additional details
 * @returns Promise<void>
 */
export async function sendTeamNotification(
  memberName: string,
  action: string,
  details?: string
): Promise<void> {
  const actionEmojis = {
    joined: ':wave:',
    left: ':door:',
    role_changed: ':gear:',
    promoted: ':arrow_up:',
  };

  const emoji = actionEmojis[action as keyof typeof actionEmojis] || ':busts_in_silhouette:';
  
  const message = [
    `${emoji} *Team Update*`,
    `• *Member:* ${memberName}`,
    `• *Action:* ${action.replace('_', ' ')}`,
    ...(details ? [`• *Details:* ${details}`] : []),
    `• *Time:* ${new Date().toLocaleString()}`,
  ].join('\n');

  await sendSlackMessage(message, {
    username: 'TeamFlow Team',
    icon_emoji: ':busts_in_silhouette:',
  });
}

/**
 * Test function to verify Slack integration is working
 * @returns Promise<void>
 */
export async function testSlackIntegration(): Promise<void> {
  try {
    await sendSlackMessage(
      'Hello from TeamFlow! 🚀 Slack integration is working correctly.',
      {
        username: 'TeamFlow Test',
        icon_emoji: ':test_tube:',
      }
    );
    console.log('✅ Slack integration test successful');
  } catch (error) {
    console.error('❌ Slack integration test failed:', error);
    throw error;
  }
} 