import { getRound, RoundDetail, eptssSubmissionId } from "@eptss/atproto";
import { db, submissions, users, eq, inArray } from "@eptss/db";
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

export default async function RoundPage({
  params,
}: {
  params: Promise<{ rkey: string }>;
}) {
  const { rkey } = await params;
  const data = await getRound(rkey);
  if (!data) notFound();

  const submitterNames = await resolveSubmitterNames(
    data.submissions.map((s) => s.uri),
  );

  return (
    <div>
      <a href="/atproto" className="text-sm text-ink-3 hover:underline">
        ← all rounds
      </a>
      <div className="mt-6">
        <RoundDetail data={data} submitterNames={submitterNames} />
      </div>
    </div>
  );
}
