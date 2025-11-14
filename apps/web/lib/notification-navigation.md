# Notification Navigation System

This system provides a flexible, extensible way to handle navigation from notifications. Each notification type can define its own navigation logic.

## How It Works

When a user clicks on a notification:
1. The system checks if the notification type has a registered handler
2. If yes, it calls the handler with the notification's metadata
3. The handler returns a navigation result (URL, whether to mark as read, or an error)
4. The notification is marked as read (if specified) and the user is navigated to the URL

## Built-in Handlers

The following notification types already have navigation handlers:

### Comment Notifications
- `comment_received` - Navigates to the reflection with the comment highlighted
- `comment_reply_received` - Navigates to the specific reply
- `comment_upvoted` - Navigates to the liked comment

**Metadata required:** `contentId`, `commentId`

### Round Notifications
- `round_opened` - Navigates to dashboard
- `round_voting_opened` - Navigates to dashboard
- `round_covering_begins` - Navigates to dashboard
- `round_covers_due` - Navigates to dashboard

**Metadata optional:** `roundId`

### Submission/Vote Notifications
- `submission_confirmation` - Navigates to round submissions page
- `vote_confirmation` - Navigates to round page

**Metadata optional:** `roundId`, `submissionId`

### Admin Notifications
- `admin_announcement` - Navigates to dashboard

## Adding a New Notification Handler

To add navigation for a new notification type:

### 1. Create the Handler Function

```typescript
// In notification-navigation.ts

async function handleMyNewNotification(
  metadata: Record<string, any>
): Promise<NavigationResult> {
  const { someId } = metadata;

  if (!someId) {
    return { error: "Missing required data" };
  }

  // Optionally fetch additional data
  try {
    const response = await fetch(`/api/my-endpoint?id=${someId}`);
    const data = await response.json();

    return {
      url: `/my-page/${data.slug}`,
      markAsRead: true, // Auto-mark as read when clicked
    };
  } catch (error) {
    return { error: "Failed to load data" };
  }
}
```

### 2. Register the Handler

```typescript
// At the bottom of notification-navigation.ts

registerNavigationHandler("my_notification_type", handleMyNewNotification);
```

### 3. Add Icon (Optional)

In `NotificationItem.tsx`, add an icon for your notification type:

```typescript
const notificationIcons: Record<string, string> = {
  // ... existing icons
  my_notification_type: "🎉",
};
```

### 4. Create Notifications with Proper Metadata

When creating notifications of this type, ensure you include the required metadata:

```typescript
await createNotification({
  userId: targetUserId,
  type: "my_notification_type",
  title: "Something happened!",
  message: "Details about what happened",
  metadata: {
    someId: "123",
    otherData: "abc",
  },
});
```

## Navigation Result Options

The `NavigationResult` interface supports:

```typescript
interface NavigationResult {
  /** The URL to navigate to (optional) */
  url?: string;

  /** Whether to mark the notification as read before navigating (default: false) */
  markAsRead?: boolean;

  /** Error message if navigation cannot be determined (optional) */
  error?: string;
}
```

### Examples

**Simple navigation:**
```typescript
return { url: "/dashboard", markAsRead: true };
```

**Navigation with error handling:**
```typescript
if (!requiredData) {
  return { error: "Missing required data" };
}
return { url: `/page/${requiredData}` };
```

**No navigation (non-clickable):**
```typescript
// Simply don't register a handler for this notification type
```

## Testing

To test a new notification handler:

1. Create a test notification with your notification type
2. Check that the notification appears in the bell dropdown
3. Verify it shows the cursor pointer on hover
4. Click it and verify navigation works
5. Check that it's marked as read (if `markAsRead: true`)

## API Endpoints

If your handler needs to fetch data, you may need to create an API endpoint:

```typescript
// app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  // Fetch and return data
  const data = await fetchData(id);

  return NextResponse.json(data);
}
```

## Architecture Benefits

- **Separation of Concerns:** Navigation logic is separated from UI components
- **Type Safety:** Handlers are type-checked
- **Extensibility:** New notification types can be added without modifying existing code
- **Testability:** Handlers can be tested independently
- **Maintainability:** All navigation logic is in one place
