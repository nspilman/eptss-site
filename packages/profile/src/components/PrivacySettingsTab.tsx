'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@eptss/ui';
import { Label } from '@eptss/ui';
import { Switch } from '@eptss/ui';
import { Input } from '@eptss/ui';
import { Textarea } from '@eptss/ui';
import { Button } from '@eptss/ui';

interface PrivacySettings {
  showStats: boolean;
  showSignups: boolean;
  showSubmissions: boolean;
  showVotes: boolean;
  showEmail: boolean;
  publicDisplayName: string | null;
  profileBio: string | null;
}

interface PrivacySettingsTabProps {
  user: {
    username: string;
    full_name?: string | null;
  };
}

export function PrivacySettingsTab({ user }: PrivacySettingsTabProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    showStats: true,
    showSignups: true,
    showSubmissions: true,
    showVotes: false,
    showEmail: false,
    publicDisplayName: null,
    profileBio: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load privacy settings on mount
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      try {
        const response = await fetch('/api/profile/privacy');
        if (!response.ok) throw new Error('Failed to load privacy settings');

        const data = await response.json();
        setSettings({
          showStats: data.privacySettings.showStats ?? true,
          showSignups: data.privacySettings.showSignups ?? true,
          showSubmissions: data.privacySettings.showSubmissions ?? true,
          showVotes: data.privacySettings.showVotes ?? false,
          showEmail: data.privacySettings.showEmail ?? false,
          publicDisplayName: data.privacySettings.publicDisplayName,
          profileBio: data.privacySettings.profileBio,
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading privacy settings:', err);
        setError('Failed to load privacy settings');
        setIsLoading(false);
      }
    };

    fetchPrivacySettings();
  }, []);

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

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="publicDisplayName" className="text-[var(--color-primary)] text-sm font-medium">
                Public Display Name
                <span className="text-xs text-gray-400 ml-2 font-normal">
                  (Leave blank to use {user.full_name ? 'full name' : 'username'})
                </span>
              </Label>
              <Input
                id="publicDisplayName"
                value={settings.publicDisplayName || ''}
                onChange={(e) => setSettings({ ...settings, publicDisplayName: e.target.value || null })}
                placeholder={user.full_name || user.username}
                className="bg-gray-800 border-gray-700 text-[var(--color-primary)] focus:border-[var(--color-accent-primary)]"
              />
            </div>

            {/* Profile Bio */}
            <div className="space-y-2">
              <Label htmlFor="profileBio" className="text-[var(--color-primary)] text-sm font-medium">
                Profile Bio
                <span className="text-xs text-gray-400 ml-2 font-normal">(Optional, shown on public profile)</span>
              </Label>
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

            {/* Privacy Toggles */}
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-[var(--color-primary)]">What to Show Publicly</h3>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex-1">
                  <Label htmlFor="showStats" className="text-[var(--color-primary)] cursor-pointer">
                    Activity Statistics
                  </Label>
                  <p className="text-sm text-gray-400">Show counts for signups, submissions, and votes</p>
                </div>
                <Switch
                  id="showStats"
                  checked={settings.showStats}
                  onCheckedChange={(checked) => setSettings({ ...settings, showStats: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex-1">
                  <Label htmlFor="showSignups" className="text-[var(--color-primary)] cursor-pointer">
                    Signup History
                  </Label>
                  <p className="text-sm text-gray-400">Show which rounds you've signed up for</p>
                </div>
                <Switch
                  id="showSignups"
                  checked={settings.showSignups}
                  onCheckedChange={(checked) => setSettings({ ...settings, showSignups: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex-1">
                  <Label htmlFor="showSubmissions" className="text-[var(--color-primary)] cursor-pointer">
                    All Submissions
                  </Label>
                  <p className="text-sm text-gray-400">Show all your submitted songs (can control individually below)</p>
                </div>
                <Switch
                  id="showSubmissions"
                  checked={settings.showSubmissions}
                  onCheckedChange={(checked) => setSettings({ ...settings, showSubmissions: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex-1">
                  <Label htmlFor="showVotes" className="text-[var(--color-primary)] cursor-pointer">
                    Voting Activity
                  </Label>
                  <p className="text-sm text-gray-400">Show which rounds you've voted in</p>
                </div>
                <Switch
                  id="showVotes"
                  checked={settings.showVotes}
                  onCheckedChange={(checked) => setSettings({ ...settings, showVotes: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                <div className="flex-1">
                  <Label htmlFor="showEmail" className="text-[var(--color-primary)] cursor-pointer">
                    Email Address
                  </Label>
                  <p className="text-sm text-gray-400">Show your email on your public profile</p>
                </div>
                <Switch
                  id="showEmail"
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => setSettings({ ...settings, showEmail: checked })}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                size="lg"
                className="bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 shadow-lg shadow-[var(--color-accent-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-accent-primary)]/70 transition-all"
              >
                {isSaving ? 'Saving...' : 'Save Privacy Settings'}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
