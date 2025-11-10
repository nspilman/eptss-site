"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export interface UserAvatarProps {
  /** URL of the profile picture, if available */
  profilePictureUrl?: string | null;
  /** Display name for alt text and fallback initials */
  displayName: string;
  /** Size variant of the avatar */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Additional className for the container */
  className?: string;
  /** Whether to show hover effects (border color change) */
  showHoverEffect?: boolean;
}

/**
 * Get initials from a display name
 * Returns first letter of first and last word, or first 2 letters if single word
 */
function getInitials(name: string): string {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

/**
 * Size mappings for the avatar
 */
const sizeClasses = {
  xs: "w-8 h-8 text-xs",
  sm: "w-10 h-10 text-sm",
  md: "w-16 h-16 text-sm",
  lg: "w-20 h-20 text-base",
  xl: "w-24 h-24 text-lg",
};

/**
 * UserAvatar component
 *
 * Displays a user's profile picture if available, otherwise shows initials
 * on a gradient background. Commonly used in comments, participant lists, etc.
 *
 * @example
 * ```tsx
 * <UserAvatar
 *   profilePictureUrl={user.profilePictureUrl}
 *   displayName={user.fullName || user.username}
 *   size="md"
 *   showHoverEffect
 * />
 * ```
 */
export function UserAvatar({
  profilePictureUrl,
  displayName,
  size = "md",
  className,
  showHoverEffect = false,
}: UserAvatarProps) {
  const initials = getInitials(displayName);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-background-primary flex-shrink-0 shadow-lg border-2 border-accent-secondary/20 transition-colors overflow-hidden",
        sizeClasses[size],
        showHoverEffect && "group-hover:border-accent-primary",
        className
      )}
      style={{
        background: profilePictureUrl
          ? undefined
          : 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))'
      }}
      aria-label={`${displayName}'s avatar`}
    >
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
