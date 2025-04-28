# Event Scheduler with GitHub Actions

This is a serverless Express.js application that allows users to schedule events and receive reminders 5 minutes before the event time. The application uses GitHub Actions to create cron jobs that will send email reminders at the scheduled time.

## Features

- RESTful API to schedule events
- Automatic creation of GitHub Actions workflows for each event
- Reminders are triggered 5 minutes before the event
- Serverless architecture for deployment on Vercel

## Prerequisites

- Node.js (v14 or higher)
- GitHub account with a personal access token
- Vercel account (for deployment)

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/your-username/cron-job.git
   cd cron-job
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - `GITHUB_TOKEN`: Your GitHub personal access token with repo permissions
   - `GITHUB_OWNER`: Your GitHub username or organization name
   - `GITHUB_REPO`: The name of the repository where workflows will be created

4. Run the application locally:
   ```
   npm run dev
   ```

## API Documentation

### Schedule an Event

**Endpoint:** `POST /api/schedule-event`

**Request Body:**
```json
{
  "eventName": "Team Meeting",
  "description": "Weekly team sync-up",
  "eventTime": "2023-12-31T15:00:00Z"
}
```

**Response:**
```json
{
  "message": "Event scheduled successfully",
  "scheduledTime": "2023-12-31T14:55:00Z",
  "eventDetails": {
    "eventName": "Team Meeting",
    "description": "Weekly team sync-up",
    "eventTime": "2023-12-31T15:00:00Z"
  },
  "workflowResult": {
    "success": true,
    "workflowFile": "event-1234567890.yml",
    "commitSha": "abc123..."
  }
}
```

## How It Works

1. When a user schedules an event through the API, the application calculates the time 5 minutes before the event.
2. It then creates a GitHub Actions workflow file with a cron schedule set to that time.
3. The workflow, when triggered, will send an email reminder with the event details.

## Deployment

### Deploying to Vercel

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the application:
   ```
   vercel
   ```

4. Set environment variables on Vercel:
   ```
   vercel env add GITHUB_TOKEN
   vercel env add GITHUB_OWNER
   vercel env add GITHUB_REPO
   ```

## Important Notes

- GitHub Actions workflows are scheduled in UTC time.
- GitHub's scheduler for Actions has a delay of up to 15 minutes, so the reminder might not run exactly at the specified time.
- The GitHub personal access token needs to have the `repo` scope to create workflow files.

## License

MIT
