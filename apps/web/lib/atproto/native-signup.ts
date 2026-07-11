/**
 * The native signup mirror: when a LINKED user signs up for a round, their
 * song-free `at.atjam.signup` lands in their own repo at that moment — born
 * owned, nothing to migrate later.
 *
 * PRIVACY: same contract as the migration path — the record carries only the
 * round strong-ref, the timestamp, and the free-text note. The nominated song
 * stays in Postgres; the lexicon has no song field.
 *
 * Best-effort by construction: this NEVER throws and requires nothing of the
 * user. Unlinked user, round not yet on the network, expired OAuth session —
 * each is a silent skip, and the existing migrate-on-link flow remains the
 * self-healing net that brings any missed signup home later.
 *
 * Authority: writes only as the SESSION user, to their own linked repo. An
 * admin signing someone else up never triggers this — restoring another
 * user's OAuth session behind their back is not this app's way.
 */
import { db, signUps, eq, and } from "@eptss/db";
import { loadIdentity } from "@eptss/auth/atproto";
import { eptssRoundRkey, getRoundRecord } from "@eptss/atproto";
import { getUserAgent } from "./agent";
import { writeSignupRecord } from "./migrate-core";

/**
 * Mirror the session user's signup for `roundId` to their repo, if possible.
 * Call after the Postgres signup succeeds; failures only log.
 */
export async function recordSignupOnNetwork(
  userId: string,
  roundId: number,
): Promise<void> {
  try {
    const identity = await loadIdentity(userId);
    if (!identity) return; // not linked — migrate-on-link will bring it home

    const rows = await db
      .select({
        id: signUps.id,
        createdAt: signUps.createdAt,
        note: signUps.additionalComments,
      })
      .from(signUps)
      .where(and(eq(signUps.roundId, roundId), eq(signUps.userId, userId)))
      .limit(1);
    const signup = rows[0];
    if (!signup) return;

    // Rounds are published at creation now, so absence is rare (a pre-publisher
    // round) — the migration net catches those on the next link/visit.
    const roundRec = await getRoundRecord(eptssRoundRkey(roundId));
    if (!roundRec) {
      console.log(`[native-signup] #${signup.id} skipped — round ${roundId} not on the network`);
      return;
    }

    const agent = await getUserAgent(identity.did);
    const written = await writeSignupRecord({
      agent,
      did: identity.did,
      signupId: signup.id,
      round: { uri: roundRec.uri, cid: roundRec.cid },
      note: signup.note,
      createdAt: (signup.createdAt ?? new Date()).toISOString(),
    });
    console.log(`[native-signup] #${signup.id} -> ${written.uri}`);
  } catch (err) {
    // The mirror never fails the signup it follows.
    console.warn(`[native-signup] round ${roundId} mirror skipped`, err);
  }
}
