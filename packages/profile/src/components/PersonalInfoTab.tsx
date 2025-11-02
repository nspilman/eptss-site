'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eptss/ui';
import { Input } from '@eptss/ui';
import { Button } from '@eptss/ui';
import { Label } from '@eptss/ui';
import { format } from 'date-fns';
import type { User } from './ProfileHeader';

interface PersonalInfoTabProps {
  user: User;
}

export function PersonalInfoTab({ user }: PersonalInfoTabProps) {
  const [username, setUsername] = useState(user.username || '');
  const [fullName, setFullName] = useState(user.fullName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, fullName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Optimistically update the user object
      user.username = username;
      user.fullName = fullName;

      setSuccess(true);
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Revert on error
      setUsername(user.username || '');
      setFullName(user.fullName || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(user.username || '');
    setFullName(user.fullName || '');
    setIsEditing(false);
    setError(null);
  };

  return (
    <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />

      <div className="relative z-10">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-semibold text-[var(--color-primary)] mb-2">
            Personal Information
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            View and update your profile details
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="p-4 rounded-lg bg-green-900/20 border border-green-600/50 text-green-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Profile updated successfully!</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-600/50 text-red-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Editable fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Full Name - Editable */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-2">
                  Full Name
                  {!isEditing && (
                    <span className="text-xs text-[var(--color-accent-primary)] font-normal">(editable)</span>
                  )}
                </Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-gray-800 border-gray-700 text-[var(--color-primary)] focus:border-[var(--color-accent-primary)] transition-colors"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <span className={user.fullName ? "text-[var(--color-primary)]" : "text-gray-500 italic"}>
                      {user.fullName || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              {/* Username - Editable */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-2">
                  Username
                  {!isEditing && (
                    <span className="text-xs text-[var(--color-accent-primary)] font-normal">(editable)</span>
                  )}
                </Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-gray-800 border-gray-700 text-[var(--color-primary)] focus:border-[var(--color-accent-primary)] transition-colors"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <span className={user.username ? "text-[var(--color-primary)]" : "text-gray-500 italic"}>
                      {user.username || 'Not set'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Email - Read Only */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-400 text-sm font-medium">Email</Label>
                <div className="p-3 rounded-lg bg-gray-900/30 text-gray-400 border border-gray-700/50">
                  {user.email}
                </div>
              </div>

              {/* Join Date - Read Only */}
              <div className="space-y-2">
                <Label htmlFor="joinDate" className="text-gray-400 text-sm font-medium">Member Since</Label>
                <div className="p-3 rounded-lg bg-gray-900/30 text-gray-400 border border-gray-700/50">
                  {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                size="lg"
                className="bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 shadow-lg shadow-[var(--color-accent-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-accent-primary)]/70 transition-all"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !username.trim()}
                  size="lg"
                  className="bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 disabled:opacity-50 shadow-lg shadow-[var(--color-accent-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-accent-primary)]/70 transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isSaving}
                  variant="outline"
                  size="lg"
                  className="border-gray-700 text-[var(--color-primary)] hover:bg-gray-800/50 hover:border-[var(--color-accent-primary)]/50 transition-all"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
