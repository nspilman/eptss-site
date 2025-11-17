'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@eptss/ui';
import { Copy, Check, Users, Sparkles } from 'lucide-react';
import { createUserReferralCode } from '../actions';

interface InviteFriendsCardProps {
  userId: string;
}

/**
 * Invite Friends Card - Friendly component to create and share referral links
 * Uses the UI library components for consistency
 */
export function InviteFriendsCard({ userId }: InviteFriendsCardProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCode = async () => {
    setIsCreating(true);
    try {
      const result = await createUserReferralCode({});
      if (result.success && result.code) {
        setReferralCode(result.code);
      }
    } catch (error) {
      console.error('Failed to create referral code:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!referralCode) return;

    const referralUrl = `${window.location.origin}/sign-up?ref=${referralCode}`;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {/* Subtle glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>

      <Card className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader className="pb-6">
          <div className="flex items-start gap-5">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center shadow-lg">
                <Users size={30} className="text-[var(--color-background-primary)]" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2 mb-3">
                Invite Friends!
                <Sparkles size={22} className="text-[var(--color-accent-primary)] flex-shrink-0" />
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Love EPTSS? Share the experience with your friends and grow our community together!
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {!referralCode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-[var(--color-gray-300)] leading-relaxed">
                  Create your personal invite link to share with friends and receive credit for growing our community.
                </p>
                <p className="text-xs text-[var(--color-gray-400)] leading-relaxed italic">
                  Note: New members need an invite code to join EPTSS.
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleCreateCode}
                disabled={isCreating}
                className="gap-2.5 min-w-[200px]"
              >
                <Users size={20} className="flex-shrink-0" />
                <span className="font-medium">{isCreating ? 'Creating your invite link...' : 'Create Invite Link'}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Code block with better visual hierarchy */}
              <div>
                <label className="text-xs font-medium text-[var(--color-gray-400)] uppercase tracking-wide mb-3 block">
                  Your invite link
                </label>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                  <code className="text-sm text-[var(--color-accent-primary)] font-mono break-all block leading-relaxed">
                    {window.location.origin}/sign-up?ref={referralCode}
                  </code>
                </div>
              </div>

              {/* Copy button with better sizing */}
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleCopyLink}
                  className="gap-2 min-w-[140px]"
                >
                  {copied ? (
                    <>
                      <Check size={18} className="text-green-500" />
                      <span className="text-green-500 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span className="font-medium">Copy Link</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Helper text with better spacing */}
              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-[var(--color-gray-500)] leading-relaxed">
                  Want to see all your invite codes and track who signed up?{' '}
                  <a
                    href="/dashboard/profile/referrals"
                    className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] underline underline-offset-2 transition-colors font-medium"
                  >
                    Visit Referrals page
                  </a>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
