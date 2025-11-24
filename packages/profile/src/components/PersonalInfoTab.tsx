'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eptss/ui';
import { Input } from '@eptss/ui';
import { Button } from '@eptss/ui';
import { FormLabel } from '@eptss/ui';
import { Textarea } from '@eptss/ui';
import { format } from 'date-fns';
import type { User } from './ProfileHeader';
import {
  createSocialLinkAction,
  deleteSocialLinkAction,
  createEmbeddedMediaAction,
  deleteEmbeddedMediaAction,
  uploadProfilePictureAction,
  deleteProfilePictureAction
} from '@eptss/actions';
import { profileProvider } from '@eptss/data-access';
import { ProfilePictureSection } from './shared/ProfilePictureSection';
import { DisplayNameField } from './shared/DisplayNameField';
import { ProfileBioField } from './shared/ProfileBioField';

interface SocialLink {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  displayOrder: number;
}

interface EmbeddedMedia {
  id: string;
  mediaType: 'audio' | 'video' | 'image' | 'embed';
  embedCode: string;
  title: string | null;
  displayOrder: number;
}

interface PersonalInfoTabProps {
  user: User;
}

export function PersonalInfoTab({ user }: PersonalInfoTabProps) {
  const [username, setUsername] = useState(user.username || '');
  const [publicDisplayName, setPublicDisplayName] = useState(user.publicDisplayName || '');
  const [profileBio, setProfileBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(user.profilePictureUrl || null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [embeddedMedia, setEmbeddedMedia] = useState<EmbeddedMedia[]>([]);
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', label: '', url: '' });
  const [newMedia, setNewMedia] = useState({ mediaType: 'audio' as const, embedCode: '', title: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [privacyResponse, profileData] = await Promise.all([
          fetch('/api/profile/privacy'),
          profileProvider({ userId: user.userid })
        ]);

        if (privacyResponse.ok) {
          const privacyData = await privacyResponse.json();
          setProfileBio(privacyData.privacySettings.profileBio || '');
        }

        setSocialLinks(profileData.socialLinks);
        setEmbeddedMedia(profileData.embeddedMedia);
        setIsLoadingProfile(false);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setIsLoadingProfile(false);
      }
    };

    fetchData();
  }, [user.userid]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Save public display name and profile bio in parallel
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

      // Optimistically update the user object
      user.publicDisplayName = publicDisplayName;

      setSuccess(true);
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Revert on error
      setPublicDisplayName(user.publicDisplayName || '');
    } finally {
      setIsSaving(false);
    }
  };

  // Social Link Handlers
  const handleAddSocialLink = async () => {
    if (!newSocialLink.platform || !newSocialLink.url) {
      setError('Platform and URL are required');
      return;
    }

    const result = await createSocialLinkAction({
      userId: user.userid,
      platform: newSocialLink.platform,
      label: newSocialLink.label || undefined,
      url: newSocialLink.url,
      displayOrder: socialLinks.length,
    });

    if (result.status === 'Success' && result.data) {
      setSocialLinks([...socialLinks, result.data]);
      setNewSocialLink({ platform: '', label: '', url: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message);
    }
  };

  const handleDeleteSocialLink = async (linkId: string) => {
    const result = await deleteSocialLinkAction({ linkId, userId: user.userid });
    if (result.status === 'Success') {
      setSocialLinks(socialLinks.filter(link => link.id !== linkId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message);
    }
  };

  // Embedded Media Handlers
  const handleAddMedia = async () => {
    if (!newMedia.embedCode) {
      setError('Embed code is required');
      return;
    }

    const result = await createEmbeddedMediaAction({
      userId: user.userid,
      mediaType: newMedia.mediaType,
      embedCode: newMedia.embedCode,
      title: newMedia.title || undefined,
      displayOrder: embeddedMedia.length,
    });

    if (result.status === 'Success' && result.data) {
      setEmbeddedMedia([...embeddedMedia, result.data]);
      setNewMedia({ mediaType: 'audio', embedCode: '', title: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    const result = await deleteEmbeddedMediaAction({ mediaId, userId: user.userid });
    if (result.status === 'Success') {
      setEmbeddedMedia(embeddedMedia.filter(media => media.id !== mediaId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.message);
    }
  };

  const handleCancel = () => {
    setPublicDisplayName(user.publicDisplayName || '');
    setIsEditing(false);
    setError(null);
  };

  // Profile Picture Handlers
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPicture(true);
    setError(null);

    const result = await uploadProfilePictureAction({
      userId: user.userid,
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
      userId: user.userid,
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

  if (isLoadingProfile) {
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
    <div className="space-y-6">
      {/* Personal Information Card */}
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
            {/* Profile Picture */}
            <ProfilePictureSection
              profilePictureUrl={profilePictureUrl}
              isUploading={isUploadingPicture}
              isDisabled={false}
              onUpload={handleProfilePictureUpload}
              onDelete={handleDeleteProfilePicture}
            />

            {/* Editable fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Public Display Name - Editable */}
              <DisplayNameField
                value={publicDisplayName}
                onChange={setPublicDisplayName}
                placeholder={user.username || 'Enter your display name'}
                isDisabled={!isEditing}
                showEditableLabel={!isEditing}
              />

              {/* Username - Read Only */}
              <div className="space-y-2">
                <FormLabel htmlFor="username" className="text-gray-400 text-sm font-medium">Username</FormLabel>
                <Input
                  id="username"
                  value={username}
                  disabled
                  className="bg-gray-900/30 border-gray-700/50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Email - Read Only */}
              <div className="space-y-2">
                <FormLabel htmlFor="email" className="text-gray-400 text-sm font-medium">Email</FormLabel>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-900/30 border-gray-700/50 text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Join Date - Read Only */}
              <div className="space-y-2">
                <FormLabel htmlFor="joinDate" className="text-gray-400 text-sm font-medium">Member Since</FormLabel>
                <Input
                  id="joinDate"
                  value={user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Unknown'}
                  disabled
                  className="bg-gray-900/30 border-gray-700/50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Profile Bio - Editable */}
            <ProfileBioField
              value={profileBio}
              onChange={setProfileBio}
              isDisabled={!isEditing}
              showEditableLabel={!isEditing}
              showBorder={true}
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
                Edit Profile
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

    {/* Social Links Card */}
    <Card className="w-full bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs">
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[var(--color-primary)] mb-2">
            Social Links
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            Add links to your social media profiles
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Existing Social Links */}
          {socialLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
              <div className="flex-1">
                <div className="text-[var(--color-primary)] font-medium">
                  {link.label || link.platform}
                </div>
                <div className="text-sm text-gray-400 truncate">{link.url}</div>
              </div>
              <Button
                onClick={() => handleDeleteSocialLink(link.id)}
                variant="destructive"
                size="sm"
              >
                Delete
              </Button>
            </div>
          ))}

          {/* Add New Social Link */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-[var(--color-primary)]">Add New Link</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Platform (e.g., Twitter, Instagram)"
                value={newSocialLink.platform}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                className="bg-gray-800 border-gray-700 text-[var(--color-primary)]"
              />
              <Input
                placeholder="Label (optional)"
                value={newSocialLink.label}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, label: e.target.value })}
                className="bg-gray-800 border-gray-700 text-[var(--color-primary)]"
              />
              <Input
                placeholder="URL"
                value={newSocialLink.url}
                onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                className="bg-gray-800 border-gray-700 text-[var(--color-primary)]"
              />
            </div>
            <Button
              onClick={handleAddSocialLink}
              className="bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900"
            >
              Add Social Link
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>

    {/* Embedded Media Card */}
    <Card className="w-full bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs">
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[var(--color-primary)] mb-2">
            Embedded Media
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            Add audio, video, or other embeddable media to your profile
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Existing Embedded Media */}
          {embeddedMedia.map((media) => (
            <div key={media.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
              <div className="flex-1">
                <div className="text-[var(--color-primary)] font-medium">
                  {media.title || `${media.mediaType} embed`}
                </div>
                <div className="text-sm text-gray-400">Type: {media.mediaType}</div>
              </div>
              <Button
                onClick={() => handleDeleteMedia(media.id)}
                variant="destructive"
                size="sm"
              >
                Delete
              </Button>
            </div>
          ))}

          {/* Add New Media */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-medium text-[var(--color-primary)]">Add New Media</h4>
            <div className="space-y-3">
              <select
                value={newMedia.mediaType}
                onChange={(e) => setNewMedia({ ...newMedia, mediaType: e.target.value as any })}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-[var(--color-primary)]"
              >
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="embed">Other Embed</option>
              </select>
              <Input
                placeholder="Title (optional)"
                value={newMedia.title}
                onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                className="bg-gray-800 border-gray-700 text-[var(--color-primary)]"
              />
              <Textarea
                placeholder="Embed code or URL (e.g., SoundCloud iframe, YouTube embed, etc.)"
                value={newMedia.embedCode}
                onChange={(e) => setNewMedia({ ...newMedia, embedCode: e.target.value })}
                rows={4}
                className="bg-gray-800 border-gray-700 text-[var(--color-primary)]"
              />
            </div>
            <Button
              onClick={handleAddMedia}
              className="bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900"
            >
              Add Media
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  </div>
  );
}
