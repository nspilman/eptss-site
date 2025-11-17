'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  useToast,
} from '@eptss/ui';
import { Copy, Check, Plus, UserPlus, Users, Link as LinkIcon } from 'lucide-react';
import {
  createUserReferralCode,
  getMyReferralCodes,
  getMyReferrals,
  deactivateMyReferralCode,
  reactivateMyReferralCode,
} from '@eptss/actions';

interface ReferralCode {
  id: string;
  code: string;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}

interface Referral {
  id: string;
  referredUserId: string;
  referredUserEmail: string;
  referredUsername: string;
  code: string;
  createdAt: Date;
}

interface ReferralsTabProps {
  initialCodes?: ReferralCode[];
  initialReferrals?: Referral[];
}

export function ReferralsTab({ initialCodes = [], initialReferrals = [] }: ReferralsTabProps) {
  const [codes, setCodes] = useState<ReferralCode[]>(initialCodes);
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateCode = async () => {
    setIsCreating(true);
    try {
      const result = await createUserReferralCode();

      if (result.success && result.code) {
        toast({
          title: 'Referral code created!',
          description: `Your new referral code: ${result.code}`,
        });

        // Refresh codes
        const codesResult = await getMyReferralCodes();
        if (codesResult.success) {
          setCodes(codesResult.codes as ReferralCode[]);
        }
      } else {
        toast({
          title: 'Failed to create referral code',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    const referralUrl = `${window.location.origin}/login?ref=${code}`;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedCode(code);
      toast({
        title: 'Copied to clipboard!',
        description: 'Referral link copied successfully',
      });

      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleToggleCode = async (codeId: string, currentlyActive: boolean) => {
    try {
      const result = currentlyActive
        ? await deactivateMyReferralCode(codeId)
        : await reactivateMyReferralCode(codeId);

      if (result.success) {
        toast({
          title: currentlyActive ? 'Code deactivated' : 'Code activated',
          description: result.message,
        });

        // Refresh codes
        const codesResult = await getMyReferralCodes();
        if (codesResult.success) {
          setCodes(codesResult.codes as ReferralCode[]);
        }
      } else {
        toast({
          title: 'Failed to update code',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const totalReferrals = referrals.length;
  const activeCodes = codes.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-accent-secondary flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Referral Codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{codes.length}</div>
            <p className="text-xs text-accent-secondary mt-1">{activeCodes} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-accent-secondary flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalReferrals}</div>
            <p className="text-xs text-accent-secondary mt-1">Users referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-accent-secondary flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Uses Remaining
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {codes.reduce((sum, code) => {
                if (!code.isActive) return sum;
                if (code.maxUses === null) return Infinity;
                return sum + Math.max(0, code.maxUses - code.usesCount);
              }, 0) === Infinity ? '∞' : codes.reduce((sum, code) => {
                if (!code.isActive) return sum;
                if (code.maxUses === null) return sum;
                return sum + Math.max(0, code.maxUses - code.usesCount);
              }, 0)}
            </div>
            <p className="text-xs text-accent-secondary mt-1">Across all active codes</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Codes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-primary">Your Referral Codes</CardTitle>
              <CardDescription className="text-accent-secondary">
                Create and manage referral links to invite new members
              </CardDescription>
            </div>
            <Button onClick={handleCreateCode} disabled={isCreating} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Code'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-accent-secondary">
              You haven&apos;t created any referral codes yet. Click &quot;Create Code&quot; to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className="p-4 border rounded-lg bg-background-secondary shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono font-semibold text-accent-primary bg-background-tertiary px-2 py-1 rounded">
                          {code.code}
                        </code>
                        {!code.isActive && (
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-accent-secondary space-y-1">
                        <p>
                          Uses: {code.usesCount}
                          {code.maxUses !== null && ` / ${code.maxUses}`}
                        </p>
                        <p>Created: {format(new Date(code.createdAt), 'MMM d, yyyy')}</p>
                        {code.expiresAt && (
                          <p>Expires: {format(new Date(code.expiresAt), 'MMM d, yyyy')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCode(code.code)}
                        disabled={!code.isActive}
                      >
                        {copiedCode === code.code ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={code.isActive ? 'destructive' : 'default'}
                        onClick={() => handleToggleCode(code.id, code.isActive)}
                      >
                        {code.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referred Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Users You&apos;ve Referred</CardTitle>
          <CardDescription className="text-accent-secondary">
            People who joined using your referral links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-accent-secondary">
              No one has used your referral codes yet. Share your referral link to invite new members!
            </p>
          ) : (
            <div className="space-y-2">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="p-3 border rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-primary">{referral.referredUsername}</p>
                      <p className="text-xs text-accent-secondary mt-1">
                        Joined on {format(new Date(referral.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-accent-secondary">
                        Via code: <code className="font-mono">{referral.code}</code>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
