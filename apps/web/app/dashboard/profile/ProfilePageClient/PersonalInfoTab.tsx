'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eptss/ui';
import { Input } from '@eptss/ui';
import { Button } from '@eptss/ui';
import { Label } from '@eptss/ui';
import { Database } from '@/types/database';
import { format } from 'date-fns';

type User = Database['public']['Tables']['users']['Row'];

interface PersonalInfoTabProps {
  user: User;
}

export function PersonalInfoTab({ user }: PersonalInfoTabProps) {
  const [username, setUsername] = useState(user.username || '');
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
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(user.username || '');
    setIsEditing(false);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Personal Information</CardTitle>
        <CardDescription className="text-accent-secondary">
          View and update your profile details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
            Profile updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Username - Editable */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-primary">Username</Label>
            {isEditing ? (
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-background-tertiary border-accent-secondary/20"
              />
            ) : (
              <div className="p-2 rounded-md bg-background-tertiary text-primary border border-accent-secondary/20">
                {user.username || 'Not set'}
              </div>
            )}
          </div>

          {/* Email - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-primary">Email</Label>
            <div className="p-2 rounded-md bg-background-tertiary text-accent-secondary border border-accent-secondary/20">
              {user.email}
            </div>
            <p className="text-xs text-accent-secondary">Email cannot be changed</p>
          </div>

          {/* User ID - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="userid" className="text-primary">User ID</Label>
            <div className="p-2 rounded-md bg-background-tertiary text-accent-secondary border border-accent-secondary/20 font-mono text-xs break-all">
              {user.userid}
            </div>
          </div>

          {/* Join Date - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="joinDate" className="text-primary">Member Since</Label>
            <div className="p-2 rounded-md bg-background-tertiary text-accent-secondary border border-accent-secondary/20">
              {user.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'Unknown'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving || !username.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isSaving}
                variant="outline"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
