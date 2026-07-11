import { formatDate } from "@eptss/core/utils/formatDate";
import { plyrOwnership } from "./plyr-ownership";
import type { ClaimableCover, ClaimableSignup } from "./claims";

/** One record the link→migrate run brings home — a cover or a signup. */
export type MigratableItem =
  | { kind: "cover"; id: number; title: string; subtitle: string | null }
  | { kind: "signup"; id: number; title: string; subtitle: string | null };

/**
 * The records not yet fully home — covers + signups — as the one list the migration
 * card walks. A cover qualifies when its submission is unclaimed OR its plyr track is
 * still on the EPTSS scaffold (the self-healing top-up — e.g. a mid-claim upload that
 * failed). Covers name their song; signups name only their round.
 *
 * Pure: given the already-fetched rows + the user's DID. Shared by the profile and the
 * project dashboard so the two surfaces can't drift on what "needs migrating" means.
 */
export function toMigrationItems(
  covers: ClaimableCover[],
  signups: ClaimableSignup[],
  did: string,
): MigratableItem[] {
  return [
    ...covers
      .filter(
        (c) =>
          c.claimedAtUri == null ||
          plyrOwnership(c.plyrTrackUri ?? null, did) === "eptss",
      )
      .map((c) => ({
        kind: "cover" as const,
        id: c.submissionId,
        title: c.songTitle ?? "Unknown song",
        subtitle: c.songArtist,
      })),
    ...signups.map((s) => ({
      kind: "signup" as const,
      id: s.signupId,
      title: `Round ${s.roundSlug ?? s.roundId}`,
      subtitle: formatDate(s.createdAt),
    })),
  ];
}
