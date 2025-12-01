'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eptss/ui';
import { FormLabel } from '@eptss/ui';
import { Switch } from '@eptss/ui';
import { Input } from '@eptss/ui';
import { Textarea } from '@eptss/ui';
import { Button } from '@eptss/ui';
import {
  createSocialLinkAction,
  updateSocialLinkAction,
  deleteSocialLinkAction,
  createEmbeddedMediaAction,
  updateEmbeddedMediaAction,
  deleteEmbeddedMediaAction
} from '@eptss/actions';
import { profileProvider } from '@eptss/data-access';

interface PrivacySettings {
  showStats: boolean;
  showSignups: boolean;
  showSubmissions: boolean;
  showVotes: boolean;
  showEmail: boolean;
  profileBio: string | null;
  showSocialLinks: boolean;
  showEmbeddedMedia: boolean;
  notificationEmailsEnabled: boolean;
}

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

interface PrivacySettingsTabProps {
  user: {
    userid: string;
    username: string;
    publicDisplayName?: string | null;
  };
}

export function PrivacySettingsTab({ user }: PrivacySettingsTabProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    showStats: true,
    showSignups: true,
    showSubmissions: true,
    showVotes: false,
    showEmail: false,
    showSocialLinks: true,
    showEmbeddedMedia: true,
    profileBio: null,
    notificationEmailsEnabled: true,
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [embeddedMedia, setEmbeddedMedia] = useState<EmbeddedMedia[]>([]);
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', label: '', url: '' });
  const [newMedia, setNewMedia] = useState({ mediaType: 'audio' as const, embedCode: '', title: '' });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load privacy settings, social links, and media on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [privacyResponse, profileData] = await Promise.all([
          fetch('/api/profile/privacy'),
          profileProvider({ userId: user.userid })
        ]);

        if (!privacyResponse.ok) throw new Error('Failed to load privacy settings');

        const privacyData = await privacyResponse.json();
        setSettings({
          showStats: privacyData.privacySettings.showStats ?? true,
          showSignups: privacyData.privacySettings.showSignups ?? true,
          showSubmissions: privacyData.privacySettings.showSubmissions ?? true,
          showVotes: privacyData.privacySettings.showVotes ?? false,
          showEmail: privacyData.privacySettings.showEmail ?? false,
          showSocialLinks: privacyData.privacySettings.showSocialLinks ?? true,
          showEmbeddedMedia: privacyData.privacySettings.showEmbeddedMedia ?? true,
          profileBio: privacyData.privacySettings.profileBio,
          notificationEmailsEnabled: privacyData.privacySettings.notificationEmailsEnabled ?? true,
        });

        setSocialLinks(profileData.socialLinks);
        setEmbeddedMedia(profileData.embeddedMedia);

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.userid]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'privacy_settings',
          ...settings,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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


  if (isLoading) {
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
      {/* Privacy Settings Card */}
      <Card className="w-full bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />

        <div className="relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[var(--color-primary)] mb-2">
              Privacy Settings
            </CardTitle>
            <CardDescription className="text-sm text-gray-400">
              Control what information is visible on your public profile
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-600/50 text-green-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Privacy settings updated successfully!</span>
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

            {/* Note: Public Display Name is now managed in Personal Info tab */}

            {/* Notification Email Preference */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700">
              <div className="flex-1">
                <FormLabel htmlFor="notificationEmails" className="text-[var(--color-primary)] text-sm font-medium cursor-pointer">
                  Notification Emails
                </FormLabel>
                <p className="text-xs text-gray-400 mt-1">
                  Receive emails about new notifications and reminders for unread notifications
                </p>
              </div>
              <Switch
                id="notificationEmails"
                checked={settings.notificationEmailsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, notificationEmailsEnabled: checked })}
                className="data-[state=checked]:bg-[var(--color-accent-primary)]"
              />
            </div>

            {/* Profile Bio */}
            <div className="space-y-2">
              <FormLabel htmlFor="profileBio" className="text-[var(--color-primary)] text-sm font-medium">
                Profile Bio
                <span className="text-xs text-gray-400 ml-2 font-normal">(Optional, shown on public profile)</span>
              </FormLabel>
              <Textarea
                id="profileBio"
                value={settings.profileBio || ''}
                onChange={(e) => setSettings({ ...settings, profileBio: e.target.value || null })}
                placeholder="Tell people a bit about yourself and your music..."
                rows={4}
                className="bg-gray-800 border-gray-700 text-[var(--color-primary)] focus:border-[var(--color-accent-primary)] resize-none"
              />
              <p className="text-xs text-gray-500">{(settings.profileBio || '').length}/1000 characters</p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                size="lg"
                className="bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 shadow-lg shadow-[var(--color-accent-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-accent-primary)]/70 transition-all"
              >
                {isSaving ? 'Saving...' : 'Save Profile Settings'}
              </Button>
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
