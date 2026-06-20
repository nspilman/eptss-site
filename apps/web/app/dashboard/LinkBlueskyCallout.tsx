import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@eptss/ui';

/**
 * Dashboard nudge to link a Bluesky / Atmosphere account.
 *
 * Cover submissions are moving onto the AT Protocol — a submitted cover is written
 * to the member's OWN repo — so a linked identity is the prerequisite. This is the
 * front-door pointer to the link flow, which lives single-sourced in the profile's
 * AtprotoLinkSection (we route there rather than duplicate the OAuth start).
 *
 * It is built from the same Card vocabulary as that destination, so it reads as a
 * sibling of the surface it leads to — not a foreign banner. Render it ONLY while
 * unlinked: it should dissolve the moment the account is connected, leaving the
 * dashboard clean — the CTA exists exactly as long as the need does.
 */
export function LinkBlueskyCallout() {
  return (
    <Card className="mb-6 border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-primary)]/5">
      <CardHeader>
        <CardTitle>Link your Bluesky account</CardTitle>
        <CardDescription>
          Cover submissions are recorded to your own AT Protocol repo — link your
          account so you&apos;re ready to submit.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button asChild variant="gradient" size="lg">
          <a href="/dashboard/profile#atproto-link">Link your Bluesky account</a>
        </Button>
      </CardContent>
    </Card>
  );
}
