import {
  getRound,
  RoundDetail,
  eptssSubmissionId,
  applyClaims,
  resolvePlyrTrackIds,
  plyrTrackEmbedUrl,
} from "@eptss/atproto";
import { db, submissions, users, eq, inArray } from "@eptss/db";
import { getClaimedSubmissionUris } from "@/lib/atproto/claims";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Resolve each backfilled submission's submitter username from the EPTSS DB.
 * The generic at.atjam.submission record doesn't carry the author (it's the
 * admin DID until claimed), but the record's rkey encodes the Postgres
 * submission id, so we cross-walk id → user → username here.
 */
async function resolveSubmitterNames(
  submissionUris: string[],
): Promise<Record<string, string>> {
  const idByUri = new Map<string, number>();
  for (const uri of submissionUris) {
    const id = eptssSubmissionId(uri);
    if (id != null) idByUri.set(uri, id);
  }
  const ids = [...new Set(idByUri.values())];
  if (ids.length === 0) return {};

  const rows = await db
    .select({ id: submissions.id, username: users.username })
    .from(submissions)
    .leftJoin(users, eq(submissions.userId, users.userid))
    .where(inArray(submissions.id, ids));
  const nameById = new Map(rows.map((r) => [r.id, r.username]));

  const out: Record<string, string> = {};
  for (const [uri, id] of idByUri) {
    const name = nameById.get(id);
    if (name) out[uri] = name;
  }
  return out;
}

/**
 * Resolve each submission's plyr.fm embed, for covers re-hosted to plyr. The
 * submission → plyr-track link lives in Postgres (`plyr_track_uri`); we then ask
 * plyr's API for the numeric track id behind that record URI to build the embed.
 * Submissions without a plyr track fall through to their original deliverable.
 */
async function resolvePlyrEmbeds(
  submissionUris: string[],
): Promise<Record<string, string>> {
  const idByUri = new Map<string, number>();
  for (const uri of submissionUris) {
    const id = eptssSubmissionId(uri);
    if (id != null) idByUri.set(uri, id);
  }
  const ids = [...new Set(idByUri.values())];
  if (ids.length === 0) return {};

  const rows = await db
    .select({ id: submissions.id, plyrTrackUri: submissions.plyrTrackUri })
    .from(submissions)
    .where(inArray(submissions.id, ids));
  const plyrUriById = new Map(rows.map((r) => [r.id, r.plyrTrackUri]));

  // Bridge each plyr_track_uri to its numeric embed id. A track may live in the
  // admin repo OR — once re-homed — a participant's own, and resolvePlyrTrackIds
  // groups by repo DID so either resolves.
  const plyrUris = [...plyrUriById.values()].filter(
    (u): u is string => Boolean(u),
  );
  if (plyrUris.length === 0) return {};
  const trackIdByUri = await resolvePlyrTrackIds(plyrUris);

  const out: Record<string, string> = {};
  for (const [subUri, subId] of idByUri) {
    const plyrUri = plyrUriById.get(subId);
    if (!plyrUri) continue;
    const trackId = trackIdByUri.get(plyrUri);
    if (trackId != null) out[subUri] = plyrTrackEmbedUrl(trackId);
  }
  return out;
}

export default async function RoundPage({
  params,
}: {
  params: Promise<{ rkey: string }>;
}) {
  const { rkey } = await params;
  const data = await getRound(rkey);
  if (!data) notFound();

  // Claim-aware read: re-home any submissions a participant has claimed to their
  // own repo. With nothing claimed yet, the claim map is empty and applyClaims
  // is a pass-through — the page renders identically off the admin scaffold.
  const submissionIds = data.submissions
    .map((s) => eptssSubmissionId(s.uri))
    .filter((id): id is number => id != null);
  const claimedUris = await getClaimedSubmissionUris(submissionIds);
  const submissions = applyClaims(data.submissions, claimedUris);
  const roundData = { ...data, submissions };

  const submissionUris = submissions.map((s) => s.uri);
  const [submitterNames, plyrEmbeds] = await Promise.all([
    resolveSubmitterNames(submissionUris),
    resolvePlyrEmbeds(submissionUris),
  ]);

  return (
    <div>
      <a href="/atproto" className="text-sm text-ink-3 hover:underline">
        ← all rounds
      </a>
      <div className="mt-6">
        <RoundDetail
          data={roundData}
          submitterNames={submitterNames}
          plyrEmbeds={plyrEmbeds}
        />
      </div>
    </div>
  );
}
