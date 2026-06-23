'use client';

/**
 * "Add your Atmosphere account" — links the EPTSS user to a Bluesky DID
 * via OAuth.
 *
 * Two states:
 *   - Not linked: shows a handle input + Link button. POSTs to
 *     /api/atproto/link, then redirects to the returned URL.
 *   - Linked: shows the linked handle + DID, with an Unlink button
 *     (deferred — not implemented in v1; just shows status).
 *
 * Failure feedback comes via query-string params on the profile page,
 * surfaced as a banner via the `linkedError` prop. See callback route
 * comments for the error code enumeration.
 */

import { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@eptss/ui';

interface AtprotoLinkSectionProps {
  /** The currently-linked identity, or null if not linked. */
  identity: { did: string; handle: string | null } | null;
  /** Error code from callback route, or null. See callback route for codes. */
  linkedError?: string | null;
  /** When linked_error=different_identity, the DID we're already linked to. */
  existingDid?: string | null;
  /** Whether the link succeeded (?linked=success on the URL). */
  linkedSuccess?: boolean;
}

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: 'You declined the link on Bluesky. No worries — try again whenever.',
  callback_failed: 'Something went wrong completing the link. Bluesky may be unreachable, or the link expired. Try again.',
  invalid_state: 'The link request was malformed. Start over from the button below.',
  different_identity: 'You\'re already linked to a different Bluesky account. Unlink it first if you want to switch.',
};

export function AtprotoLinkSection({
  identity,
  linkedError,
  existingDid,
  linkedSuccess,
}: AtprotoLinkSectionProps) {
  const [handle, setHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  async function startLink(handleValue: string) {
    const h = handleValue.trim();
    if (!h) return;
    setSubmitting(true);
    setClientError(null);
    try {
      const res = await fetch('/api/atproto/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: h }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setClientError(data.error || 'Could not start link flow');
        setSubmitting(false);
        return;
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setClientError(err instanceof Error ? err.message : 'Network error');
      setSubmitting(false);
    }
  }

  function handleLink(e: React.FormEvent) {
    e.preventDefault();
    void startLink(handle);
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50">
      <CardHeader>
        <CardTitle>Atmosphere account</CardTitle>
        <CardDescription>
          Link your Bluesky account so your EPTSS signups and submissions can be
          recorded on your personal AT Protocol PDS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Only claim success when we're actually linked right now. `?linked=success`
            can linger in the URL after the link is gone (e.g. an unlink/reset, or
            reopening the tab), so the param alone must not assert a live link. */}
        {linkedSuccess && identity && (
          <div className="rounded-md border border-green-700/40 bg-green-900/20 p-3 text-sm text-green-300">
            Linked successfully.
          </div>
        )}

        {linkedError && (
          <div className="rounded-md border border-red-700/40 bg-red-900/20 p-3 text-sm text-red-300">
            {ERROR_MESSAGES[linkedError] ?? `Link failed (${linkedError}).`}
            {linkedError === 'different_identity' && existingDid && (
              <div className="mt-1 text-xs opacity-80">Currently linked: {existingDid}</div>
            )}
          </div>
        )}

        {identity ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-gray-400">Linked to:</span>
              <span className="font-medium text-[var(--color-accent-primary)]">
                {identity.handle ? `@${identity.handle}` : '(handle unresolved)'}
              </span>
            </div>
            <div className="text-xs text-gray-500 break-all">{identity.did}</div>
            {/* Unlink deferred — would call DELETE /api/atproto/unlink. */}

            {/* Re-link refreshes the OAuth session with the app's current scope —
                needed when new record types are added (e.g. plyr tracks). Re-auth
                with the same DID just updates the stored session; the link is kept. */}
            <div className="space-y-2 border-t border-gray-800 pt-3">
              <p className="text-xs text-gray-400">
                Re-link to refresh permissions — e.g. to grant new record types
                like plyr tracks. You&apos;ll re-approve on Bluesky; your linked
                account stays the same.
              </p>
              {!identity.handle && (
                <Input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="nate.bsky.social"
                  disabled={submitting}
                />
              )}
              {clientError && (
                <div className="text-sm text-red-400">{clientError}</div>
              )}
              <Button
                variant="outline"
                disabled={submitting || (!identity.handle && !handle.trim())}
                onClick={() => startLink(identity.handle ?? handle)}
              >
                {submitting ? 'Redirecting…' : 'Re-link to refresh permissions'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLink} className="space-y-3">
            <div>
              <label htmlFor="bsky-handle" className="text-sm text-gray-300">
                Your Bluesky handle
              </label>
              <Input
                id="bsky-handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="nate.bsky.social"
                disabled={submitting}
                className="mt-1"
              />
            </div>
            {clientError && (
              <div className="text-sm text-red-400">{clientError}</div>
            )}
            <Button type="submit" disabled={submitting || !handle.trim()}>
              {submitting ? 'Redirecting…' : 'Link Bluesky account'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
