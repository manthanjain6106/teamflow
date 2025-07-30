# Slack Integration Helper

A comprehensive helper library for sending messages to Slack using incoming webhooks in your TeamFlow application.

## Setup

### 1. Create a Slack App and Webhook

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "TeamFlow Bot") and select your workspace
4. Navigate to "Incoming Webhooks" in the sidebar
5. Turn on "Activate Incoming Webhooks"
6. Click "Add New Webhook to Workspace"
7. Select the channel where messages should be sent
8. Copy the webhook URL

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```env
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# TeamFlow Configuration
NEXT_PUBLIC_APP_NAME=TeamFlow
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Important:** Never commit your actual webhook URL to version control. Add `.env.local` to your `.gitignore` file.

## Basic Usage

### Import the Helper

```typescript
import { sendSlackMessage } from '@/lib/slack';
```

### Send a Simple Message

```typescript
// Basic message
await sendSlackMessage('Hello from TeamFlow! 🚀');

// Message with custom options
await sendSlackMessage('Project completed successfully!', {
  username: 'TeamFlow Bot',
  icon_emoji: ':white_check_mark:',
  channel: '#general'
});
```

## Available Functions

### `sendSlackMessage(message, options?)`

Sends a basic message to Slack.

**Parameters:**
- `message` (string): The message text to send
- `options` (object, optional):
  - `username` (string): Display name for the bot
  - `icon_emoji` (string): Emoji to use as the bot's avatar
  - `channel` (string): Channel to send to (overrides webhook default)

**Returns:** `Promise<void>`

### `sendSlackNotification(title, message, level?)`

Sends a formatted notification with severity levels.

**Parameters:**
- `title` (string): Notification title
- `message` (string): Notification message
- `level` ('info' | 'success' | 'warning' | 'error'): Severity level (default: 'info')

**Example:**
```typescript
await sendSlackNotification(
  'Task Completed',
  'UI Design Review has been completed by Sarah',
  'success'
);
```

### `sendProjectUpdateNotification(projectName, action, user, details?)`

Sends structured project update notifications.

**Parameters:**
- `projectName` (string): Name of the project
- `action` (string): Action performed (created, updated, completed, etc.)
- `user` (string): User who performed the action
- `details` (string, optional): Additional details

**Example:**
```typescript
await sendProjectUpdateNotification(
  'Website Redesign',
  'created',
  'John Doe',
  'Initial project setup with timeline and team assignments'
);
```

### `sendTeamNotification(memberName, action, details?)`

Sends team-related notifications.

**Parameters:**
- `memberName` (string): Name of the team member
- `action` (string): Action (joined, left, role_changed, promoted)
- `details` (string, optional): Additional details

**Example:**
```typescript
await sendTeamNotification(
  'Sarah Johnson',
  'joined',
  'Joined as Senior Designer'
);
```

### `testSlackIntegration()`

Tests the Slack integration to verify it's working correctly.

**Example:**
```typescript
try {
  await testSlackIntegration();
  console.log('Slack integration is working!');
} catch (error) {
  console.error('Slack integration failed:', error);
}
```

## Error Handling

All functions throw errors that should be handled appropriately:

```typescript
try {
  await sendSlackMessage('Hello World!');
} catch (error) {
  if (error.message.includes('SLACK_WEBHOOK_URL')) {
    console.error('Slack webhook URL not configured');
  } else {
    console.error('Failed to send Slack message:', error);
  }
}
```

## Usage in Next.js API Routes

```typescript
// pages/api/notifications.ts or app/api/notifications/route.ts
import { sendSlackNotification } from '@/lib/slack';

export async function POST(request: Request) {
  try {
    const { title, message, level } = await request.json();
    
    await sendSlackNotification(title, message, level);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
```

## Usage in React Components

```typescript
// In a React component
import { sendSlackMessage } from '@/lib/slack';

const ProjectForm = () => {
  const handleSubmit = async (projectData) => {
    try {
      // Create project logic here
      await createProject(projectData);
      
      // Notify team via Slack
      await sendSlackMessage(
        `New project "${projectData.name}" has been created! 🎉`
      );
      
      alert('Project created and team notified!');
    } catch (error) {
      console.error('Failed to create project or send notification:', error);
    }
  };
  
  // ... rest of component
};
```

## Advanced Features

### Retry Logic

For critical notifications, implement retry logic:

```typescript
async function sendCriticalAlert(message: string, maxRetries = 3) {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      await sendSlackNotification('Critical Alert', message, 'error');
      break;
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) throw error;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    }
  }
}
```

### Batch Notifications

Send multiple updates in a single message:

```typescript
const updates = [
  'John completed UI Review',
  'Sarah started Backend Implementation',
  'Mike deployed version 1.2.0'
];

const message = [
  '📊 *Daily Updates*',
  ...updates.map(update => `• ${update}`),
  '',
  `Total updates: ${updates.length}`
].join('\n');

await sendSlackMessage(message);
```

## Troubleshooting

### Common Issues

1. **"SLACK_WEBHOOK_URL environment variable is not set"**
   - Ensure `.env.local` file exists with the correct webhook URL
   - Restart your development server after adding environment variables

2. **"Slack webhook request failed with status 404"**
   - Verify your webhook URL is correct
   - Check if the Slack app is still installed in your workspace

3. **"Slack webhook returned unexpected response"**
   - The webhook might be invalid or expired
   - Regenerate the webhook URL in your Slack app settings

### Testing

Run the test function to verify your setup:

```typescript
import { testSlackIntegration } from '@/lib/slack';

// In your development environment
testSlackIntegration()
  .then(() => console.log('✅ Slack integration works!'))
  .catch(error => console.error('❌ Integration failed:', error));
```

## Security Notes

- Never expose your webhook URL in client-side code
- Use environment variables for all sensitive configuration
- Consider rate limiting if sending many notifications
- Add webhook URL to your secrets management system in production

## Rate Limits

Slack has rate limits for incoming webhooks:
- 1 message per second per webhook URL
- Consider implementing queuing for high-volume applications

## Support

For issues with this integration helper, check:
1. Environment variable configuration
2. Slack app permissions
3. Network connectivity
4. Webhook URL validity

For Slack-specific issues, refer to the [Slack API documentation](https://api.slack.com/messaging/webhooks). 