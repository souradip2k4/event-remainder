import express from 'express';
import bodyParser from 'body-parser';
import {Octokit} from '@octokit/rest';

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

app.get('/api', (req, res) => {
  res.send('Hello World!');
})

// API endpoint to receive event details
app.post('/api/schedule-event', async (req, res) => {
  try {
    const {eventName, description, eventTime, recipientMailId} = req.body;

    // Validate request body
    if (!eventName || !description || !eventTime || !recipientMailId) {
      return res.status(400).json({error: 'Missing required fields: eventName, description, eventTime, recipientMailId'});
    }

    // Parse event time
    const eventDate = new Date(eventTime);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({error: 'Invalid eventTime format. Please use ISO format (e.g., 2023-12-31T23:59:59Z)'});
    }

    // Calculate time 5 minutes before the event
    const reminderTime = new Date(eventDate);
    reminderTime.setMinutes(reminderTime.getMinutes() - 1);

    // Schedule GitHub Action
    const result = await scheduleGitHubAction(eventName, description, eventTime, reminderTime, recipientMailId);

    return res.status(200).json({
      message: 'Event scheduled successfully', scheduledTime: reminderTime.toISOString(), eventDetails: {
        eventName, description, eventTime
      }, workflowResult: result
    });
  } catch (error) {
    console.error('Error scheduling event:', error);
    return res.status(500).json({error: 'Failed to schedule event'});
  }
});

// Function to schedule GitHub Action
async function scheduleGitHubAction(eventName, description, eventTime, reminderTime, recipientMailId) {
  // GitHub authentication requires a personal access token
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  // Repository information
  const owner = process.env.GITHUB_OWNER || 'souradip2k4';
  const repo = process.env.GITHUB_REPO || 'event-remainder';

  // Create a unique identifier for this event
  const eventId = `event-${Date.now()}`;

  // Create a workflow file for this specific event
  try {
    const workflowContent = `name: Event Reminder—${eventName}

on:
  schedule:
    # This is in UTC time
    - cron: '${getCronExpression(reminderTime)}'
  workflow_dispatch:

jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - name: Event Logs
        run: |
          echo "Event: ${eventName}, Description: ${description}, Event Time: ${eventTime}"
      - name: Send Email
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: \${{ secrets.MAIL_USERNAME }}
          password: \${{ secrets.MAIL_PASSWORD }}
          subject: "Event Reminder: ${eventName}"
          body: |
            EVENT REMINDER
            ===============
            Event Name: ${eventName}
            Description: ${description}
            Event Time: ${eventTime}
          to: ${recipientMailId}
          from: Your GitHub Actions <souradipsaha2004@gmail.com>
`;

    // Create or update the workflow file in the .github/workflows directory
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `.github/workflows/${eventId}.yml`,
      message: `Schedule reminder for event: ${eventName}`,
      content: Buffer.from(workflowContent).toString('base64'),
      committer: {
        name: 'Event Scheduler Bot',
        email: 'souradipsaha2004@gmail.com'
      }
    });

    return {
      success: true,
      workflowFile: `${eventId}.yml`,
      commitSha: response.data.commit.sha
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    throw new Error('Failed to create GitHub workflow');
  }
}

function getCronExpression(date) {
  const minutes = date.getUTCMinutes();
  const hours = date.getUTCHours();
  const dayOfMonth = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // Months are 0-indexed in JS

  return `${minutes} ${hours} ${dayOfMonth} ${month} *`;
}

// Export for Vercel serverless deployment
export default app;
