import { PostHog } from 'posthog-node';
import { LogLevel, LogData } from '../../types';

let posthogClient: PostHog | null = null;

function getPostHogClient(): PostHog | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // Server-side PostHog requires a separate API key
  // This is DIFFERENT from NEXT_PUBLIC_POSTHOG_KEY (which is client-side only)
  // Set POSTHOG_SERVER_API_KEY in your production environment
  if (!process.env.POSTHOG_SERVER_API_KEY) {
    return null;
  }

  // Create singleton instance
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.POSTHOG_SERVER_API_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
      flushAt: 1,
      flushInterval: 0
    });
  }

  return posthogClient;
}

export async function sendToPostHog(
  level: LogLevel,
  message: string,
  data?: LogData,
  distinctId: string = 'server'
): Promise<void> {
  const client = getPostHogClient();
  if (!client) {
    return;
  }

  try {
    const timestamp = new Date().toISOString();

    client.capture({
      distinctId,
      event: `server_log_${level}`,
      properties: {
        message,
        level,
        timestamp,
        ...data,
      },
    });

    await client.shutdown();
  } catch (error) {
    // Silently fail PostHog logging to avoid breaking the main flow
    console.error('PostHog logging failed:', error);
  }
}

// Shutdown function for graceful cleanup
export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}
