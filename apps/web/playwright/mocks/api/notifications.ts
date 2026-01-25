/**
 * Mock notification data for integration tests
 *
 * Matches the Notification type from the codebase
 */

export type NotificationType =
  | 'signup_confirmation'
  | 'vote_confirmation'
  | 'submission_confirmation'
  | 'round_opened'
  | 'round_voting_opened'
  | 'round_covering_begins'
  | 'round_covers_due'
  | 'comment_received'
  | 'comment_reply_received'
  | 'comment_upvoted'
  | 'mention_received'
  | 'admin_announcement'
  | 'test_notification';

export interface MockNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: string | null;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  readAt?: Date | null;
}

/**
 * Create a mock notification with sensible defaults
 */
export function createMockNotification(
  overrides: Partial<MockNotification> = {}
): MockNotification {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    userId: overrides.userId ?? '11111111-1111-1111-1111-111111111111',
    type: overrides.type ?? 'round_opened',
    title: overrides.title ?? 'Test Notification',
    message: overrides.message ?? 'This is a test notification message.',
    metadata: overrides.metadata ?? null,
    isRead: overrides.isRead ?? false,
    isDeleted: overrides.isDeleted ?? false,
    createdAt: overrides.createdAt ?? new Date(),
    readAt: overrides.readAt ?? null,
  };
}

/**
 * Pre-defined mock notifications for common test scenarios
 */
export const mockNotifications = {
  /**
   * Unread round notification
   */
  unreadRoundOpened: createMockNotification({
    id: 'notif-1',
    type: 'round_opened',
    title: 'New Round Started!',
    message: 'Round 12 has opened. Sign up now!',
    metadata: JSON.stringify({ roundId: 12, roundSlug: 'round-12' }),
    isRead: false,
  }),

  /**
   * Read signup confirmation
   */
  readSignupConfirmation: createMockNotification({
    id: 'notif-2',
    type: 'signup_confirmation',
    title: 'Signup Confirmed',
    message: 'You have successfully signed up for Round 12.',
    metadata: JSON.stringify({ roundId: 12 }),
    isRead: true,
    readAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  }),

  /**
   * Comment received notification
   */
  commentReceived: createMockNotification({
    id: 'notif-3',
    type: 'comment_received',
    title: 'New Comment',
    message: 'Someone commented on your reflection.',
    metadata: JSON.stringify({ contentId: 'content-123', commentId: 'comment-456' }),
    isRead: false,
  }),

  /**
   * Admin announcement
   */
  adminAnnouncement: createMockNotification({
    id: 'notif-4',
    type: 'admin_announcement',
    title: 'Important Update',
    message: 'We have updated the submission guidelines.',
    isRead: false,
  }),

  /**
   * Submission confirmation
   */
  submissionConfirmation: createMockNotification({
    id: 'notif-5',
    type: 'submission_confirmation',
    title: 'Submission Received',
    message: 'Your cover has been submitted for Round 12.',
    metadata: JSON.stringify({ roundId: 12, submissionId: 'sub-123' }),
    isRead: true,
    readAt: new Date(),
  }),
};

/**
 * Create a list of mock notifications
 */
export function createMockNotificationList(count = 5): MockNotification[] {
  const types: NotificationType[] = [
    'round_opened',
    'signup_confirmation',
    'comment_received',
    'submission_confirmation',
    'round_voting_opened',
  ];

  return Array.from({ length: count }, (_, i) =>
    createMockNotification({
      id: `notif-list-${i}`,
      type: types[i % types.length],
      title: `Notification ${i + 1}`,
      message: `This is notification number ${i + 1}.`,
      isRead: i < 2, // First 2 are read
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000), // Staggered by 1 hour
    })
  );
}

export type MockNotificationKey = keyof typeof mockNotifications;
