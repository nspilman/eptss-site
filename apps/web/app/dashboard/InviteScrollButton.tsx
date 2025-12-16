"use client";

import { Button } from "@eptss/ui";

interface InviteScrollButtonProps {
  actionText: string;
}

export function InviteScrollButton({ actionText }: InviteScrollButtonProps) {
  const scrollToInvite = (e: React.MouseEvent) => {
    e.preventDefault();
    const invitePanel = document.querySelector('[data-panel-id="inviteFriends"]');
    if (invitePanel) {
      invitePanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.warn('[InviteScrollButton] Could not find invite panel');
    }
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full sm:w-auto gap-2"
      onClick={scrollToInvite}
    >
      <span>{actionText}</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </Button>
  );
}
