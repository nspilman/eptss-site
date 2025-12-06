import { CommentSection } from "@eptss/comments";
import type { PanelProps } from "@eptss/dashboard";
import { MessageSquare } from "lucide-react";

interface DiscussionPanelData {
  roundId: string;
  currentUserId?: string;
}

/**
 * Wrapper to adapt CommentSection for dashboard display
 *
 * Content-only - PanelCard + DashboardLayout handle sizing/styling
 */
export function DiscussionPanelWrapper({ data, user }: PanelProps<DiscussionPanelData>) {
  if (!data || !data.roundId) {
    return null;
  }

  // If user is not logged in, show a prompt to log in
  if (!user?.id) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-[var(--color-accent-primary)] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
          Round Discussions
        </h3>
        <p className="text-gray-400">
          Please log in to view and participate in discussions.
        </p>
      </div>
    );
  }

  // CommentSection renders content only - no wrapper needed
  return (
    <CommentSection
      roundId={data.roundId}
      currentUserId={user.id}
      sortOrder="asc"
      showHeader={false}
    />
  );
}

export function DiscussionPanelSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-[var(--color-gray-800)] rounded-lg"></div>
      <div className="h-32 bg-[var(--color-gray-800)] rounded-lg"></div>
      <div className="h-32 bg-[var(--color-gray-800)] rounded-lg"></div>
    </div>
  );
}
