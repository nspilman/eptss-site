"use client";

import { signout } from "@eptss/actions";
import { routes } from "@eptss/routing";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@eptss/ui";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";

export interface UserDropdownProps {
  email: string;
  username: string | null;
  profilePictureUrl: string | null;
}

export function UserDropdown({ email, username, profilePictureUrl }: UserDropdownProps) {
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleSignout = async () => {
    await signout();
  };

  const displayName = username || email.split("@")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-white/10 transition-all"
        >
          <Avatar className="h-8 w-8 border border-[var(--color-accent-primary)]/30">
            {profilePictureUrl && (
              <AvatarImage src={profilePictureUrl} alt={displayName} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-black text-xs font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm text-gray-200 max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-[var(--color-gray-900)] border-[var(--color-gray-700)]"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-200">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--color-gray-700)]" />
        <DropdownMenuItem asChild className="cursor-pointer text-gray-200 focus:bg-white/10 focus:text-white">
          <Link href={routes.dashboard.profile()} className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--color-gray-700)]" />
        <DropdownMenuItem
          className="cursor-pointer text-gray-200 focus:bg-white/10 focus:text-white"
          onClick={handleSignout}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
