'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eptss/ui';
import { Button } from '@eptss/ui';
import {
  uploadProfilePictureAction,
  deleteProfilePictureAction
} from '@eptss/actions';
import { ProfilePictureSection } from './shared/ProfilePictureSection';
import { DisplayNameField } from './shared/DisplayNameField';
import { ProfileBioField } from './shared/ProfileBioField';

interface ProfileSetupCardProps {
  userId: string;
  username: string;
  initialDisplayName?: string | null;
  initialProfilePictureUrl?: string | null;
  variant?: 'full' | 'compact';
  onSuccess?: () => void;
}

export function ProfileSetupCard({
  userId,
  username,
  initialDisplayName,
  initialProfilePictureUrl,
  variant = 'full',
  onSuccess
}: ProfileSetupCardProps) {
  const isCompact = variant === 'compact';

  const [publicDisplayName, setPublicDisplayName] = useState(initialDisplayName || '');
  const [profileBio, setProfileBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(initialProfilePictureUrl || null);
  const [isEditing, setIsEditing] = useState(isCompact);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBio, setIsLoadingBio] = useState(true);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load profile bio on mount
  useEffect(() => {
    const fetchBio = async () => {
      try {
        const response = await fetch('/api/profile/privacy');
        if (response.ok) {
          const data = await response.json();
          setProfileBio(data.privacySettings.profileBio || '');
        }
        setIsLoadingBio(false);
      } catch (err) {
        console.error('Error loading profile bio:', err);
        setIsLoadingBio(false);
      }
    };

    fetchBio();
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const [profileResponse, privacyResponse] = await Promise.all([
        fetch('/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, publicDisplayName: publicDisplayName || null }),
        }),
        fetch('/api/profile/privacy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'privacy_settings',
            profileBio: profileBio || null,
          }),
        })
      ]);

      if (!profileResponse.ok) {
        const data = await profileResponse.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      if (!privacyResponse.ok) {
        const data = await privacyResponse.json();
        throw new Error(data.error || 'Failed to update profile settings');
      }

      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPublicDisplayName(initialDisplayName || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPublicDisplayName(initialDisplayName || '');
    setIsEditing(false);
    setError(null);
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPicture(true);
    setError(null);

    const result = await uploadProfilePictureAction({
      userId,
      file,
      oldProfilePictureUrl: profilePictureUrl,
    });

    setIsUploadingPicture(false);

    if (result.status === 'Success' && result.url) {
      setProfilePictureUrl(result.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profilePictureUrl) return;

    setIsUploadingPicture(true);
    setError(null);

    const result = await deleteProfilePictureAction({
      userId,
      profilePictureUrl,
    });

    setIsUploadingPicture(false);

    if (result.status === 'Success') {
      setProfilePictureUrl(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message);
    }
  };

  if (isLoadingBio) {
    return (
      <Card className="w-full p-8 bg-gray-900/50 border-gray-800">
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent-primary)]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative group">
      {/* Rainbow gradient border effect for compact variant */}
      {isCompact && (
        <div className="absolute -inset-2 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
      )}

      <Card className="relative z-10 w-full p-8 bg-gray-900/50 border-gray-800 overflow-hidden backdrop-blur-xs">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />

      <div className="relative z-10">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-semibold text-[var(--color-primary)] mb-2">
            {isCompact ? 'Complete Your Profile' : 'Display Name & Bio'}
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            {isCompact
              ? 'Add a display name and bio to personalize your profile'
              : 'Update how you appear to other community members'
            }
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
            {/* Profile Picture */}
            <ProfilePictureSection
              profilePictureUrl={profilePictureUrl}
              isUploading={isUploadingPicture}
              isDisabled={!isEditing}
              onUpload={handleProfilePictureUpload}
              onDelete={handleDeleteProfilePicture}
              showOptionalLabel
            />

            {/* Public Display Name */}
            <DisplayNameField
              value={publicDisplayName}
              onChange={setPublicDisplayName}
              placeholder={username || 'Enter your display name'}
              isDisabled={!isEditing}
              showEditableLabel={!isEditing}
            />

            {/* Profile Bio */}
            <ProfileBioField
              value={profileBio}
              onChange={setProfileBio}
              isDisabled={!isEditing}
              showEditableLabel={!isEditing}
              showBorder={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                size="lg"
                className="bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 shadow-lg shadow-[var(--color-accent-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-accent-primary)]/70 transition-all"
              >
                {isCompact ? 'Set Up Profile' : 'Edit'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
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
    </div>
  );
}
