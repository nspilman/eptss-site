"use client";

import { forwardRef, useCallback } from "react";
import { Mention, MentionsInput, SuggestionDataItem } from "react-mentions";
import { cn } from "@eptss/ui";
import { getDisplayName } from "@eptss/shared";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  roundParticipants?: Array<{
    userId: string;
    username?: string;
    publicDisplayName?: string;
    profilePictureUrl?: string;
  }>;
  "aria-label"?: string;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

interface MentionUser extends SuggestionDataItem {
  id: string;
  display: string;
  username: string;
  profilePictureUrl?: string | null;
}

export const CommentInput = forwardRef<HTMLTextAreaElement, CommentInputProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      placeholder,
      disabled,
      id,
      className,
      roundParticipants = [],
      ...ariaProps
    },
    ref
  ) => {
    const fetchUsers = useCallback((query: string, callback: (data: MentionUser[]) => void) => {
      if (!query || query.trim().length === 0) {
        callback([]);
        return;
      }

      const searchLower = query.toLowerCase();

      // Filter participants client-side
      const filtered = roundParticipants
        .filter(participant => {
          const username = participant.username?.toLowerCase() || '';
          const displayName = participant.publicDisplayName?.toLowerCase() || '';
          return username.includes(searchLower) || displayName.includes(searchLower);
        })
        .map(participant => ({
          id: participant.username || participant.userId,
          display: getDisplayName(participant),
          username: participant.username || '',
          profilePictureUrl: participant.profilePictureUrl,
        }))
        .slice(0, 10); // Limit to 10 results

      callback(filtered);
    }, [roundParticipants]);

    const mentionStyle = {
      control: {
        minHeight: "100px",
        fontSize: "16px",
        fontFamily: "'Roboto', sans-serif",
      },
      "&multiLine": {
        control: {
          minHeight: "100px",
        },
        highlighter: {
          padding: "12px 16px",
          border: "1px solid transparent",
          borderRadius: "0.375rem",
        },
        input: {
          padding: "12px 16px",
          border: "1px solid var(--color-gray-700)",
          borderRadius: "0.375rem",
          backgroundColor: "var(--color-gray-900)",
          color: "#ffffff",
          outline: "none",
          minHeight: "100px",
          resize: "none" as const,
        },
      },
      suggestions: {
        list: {
          backgroundColor: "var(--color-gray-900)",
          border: "1px solid var(--color-gray-700)",
          borderRadius: "0.375rem",
          fontSize: "14px",
          maxHeight: "200px",
          overflow: "auto",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
        item: {
          padding: "8px 12px",
          color: "var(--color-primary)",
          borderBottom: "1px solid var(--color-gray-800)",
          "&focused": {
            backgroundColor: "var(--color-gray-800)",
          },
        },
      },
    };

    return (
      <div className={cn("relative", className)}>
        <MentionsInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          id={id}
          style={mentionStyle}
          className="mentions-input font-roboto"
          a11ySuggestionsListLabel="Suggested users to mention"
          {...ariaProps}
        >
          <Mention
            trigger="@"
            data={fetchUsers}
            displayTransform={(id, display) => `@${display}`}
            markup="@[__display__](__id__)"
            renderSuggestion={(suggestion, search, highlightedDisplay) => {
              const mentionUser = suggestion as MentionUser;
              return (
                <div className="flex items-center gap-2">
                  {mentionUser.profilePictureUrl ? (
                    <img
                      src={mentionUser.profilePictureUrl}
                      alt={mentionUser.display}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] flex items-center justify-center text-xs font-bold text-white">
                      {mentionUser.display.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{highlightedDisplay}</span>
                    <span className="text-xs text-[var(--color-gray-400)]">@{mentionUser.username}</span>
                  </div>
                </div>
              );
            }}
            appendSpaceOnAdd
          />
        </MentionsInput>
        <style jsx global>{`
          .mentions-input__input:focus {
            border-color: var(--color-accent-primary) !important;
            box-shadow: 0 0 0 1px var(--color-accent-primary) !important;
          }
          .mentions-input__suggestions__list {
            z-index: 100;
          }
        `}</style>
      </div>
    );
  }
);

CommentInput.displayName = "CommentInput";
