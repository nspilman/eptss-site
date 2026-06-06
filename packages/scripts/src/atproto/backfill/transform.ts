/**
 * Transform an extracted `RoundExport` into atjam lexicon records — a pure
 * function (no DB, no network) so the mapping is easy to inspect and test.
 *
 * Produces:
 *   - one `at.atjam.round` record, with:
 *       · milestones from the EPTSS phase dates (coversDue → the *standard*
 *         `submission-deadline` so deriveState can close the round; the rest
 *         kept as EPTSS's native phase labels)
 *       · subject = `site.eptss.song` (the chosen song) with a nested
 *         `selection` carrying the songs signed up with + aggregate vote
 *         results (averages + counts only — no per-voter data)
 *       · closingEvent from the listening-party playlist, when present
 *   - submission *drafts* (one per submission that has an audio URL); the
 *     caller fills in the round strong-ref after the round is written.
 *
 * rkeys are derived from Postgres IDs so re-running with putRecord upserts
 * rather than duplicating.
 */
import { eptssRoundRkey, eptssSubmissionRkey } from "@eptss/atproto/rkey";
import type { RoundExport } from "./extract";

export interface StrongRef {
  uri: string;
  cid: string;
}

export interface AtjamRoundRecord {
  $type: "at.atjam.round";
  jam: StrongRef;
  name: string;
  assignment: string;
  subject?: Record<string, unknown>;
  acceptedSubmissionTypes: string[];
  milestones: Array<{ label: string; date: string }>;
  closingEvent?: Record<string, unknown>;
  createdAt: string;
}

export interface SubmissionDraft {
  rkey: string;
  sourceSubmissionId: number;
  username: string | null;
  url: string;
  note?: string;
  createdAt: string;
}

export interface TransformedRound {
  roundId: number;
  rkey: string;
  record: AtjamRoundRecord;
  submissions: SubmissionDraft[];
  warnings: string[];
  /** at.atjam.round requires ≥1 milestone — false means the round can't be written. */
  valid: boolean;
}

export interface TransformOptions {
  jam: StrongRef;
  acceptedSubmissionTypes?: string[];
}

const SONG_TYPE = "site.eptss.song";
const SELECTION_TYPE = "site.eptss.songSelection";
const LISTENING_PARTY_TYPE = "site.eptss.listeningParty";
const DEFAULT_ASSIGNMENT =
  "Record your cover of this round's song and submit your recording.";

/**
 * Map the five EPTSS phase dates to milestones. coversDue uses the standard
 * `submission-deadline` label (so deriveState closes finished rounds) and the
 * listening party uses `closing-event`; the earlier phases keep EPTSS's own
 * names. Phases with no date are omitted, not null-stamped.
 */
function buildMilestones(r: RoundExport): Array<{ label: string; date: string }> {
  const sources: Array<[string, Date | null]> = [
    ["signup-opens", r.signupOpens],
    ["voting-opens", r.votingOpens],
    ["covering-begins", r.coveringBegins],
    ["submission-deadline", r.coversDue],
    ["closing-event", r.listeningParty],
  ];
  return sources
    .filter((s): s is [string, Date] => s[1] !== null)
    .map(([label, date]) => ({ label, date: date.toISOString() }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function buildSelection(r: RoundExport): Record<string, unknown> | null {
  const selection: Record<string, unknown> = {};
  if (r.signups.length) {
    selection.signups = r.signups.map((s) => ({
      title: s.title,
      artist: s.artist,
      count: s.count,
    }));
  }
  if (r.voteResults.length) {
    selection.voteResults = r.voteResults.map((v) => ({
      title: v.title,
      artist: v.artist,
      total: v.total,
      count: v.count,
    }));
  }
  return Object.keys(selection).length > 0 ? selection : null;
}

function buildSubject(
  r: RoundExport,
  createdAt: string,
): Record<string, unknown> | undefined {
  const selection = buildSelection(r);

  if (r.chosenSong) {
    return {
      $type: SONG_TYPE,
      title: r.chosenSong.title,
      artist: r.chosenSong.artist,
      createdAt,
      ...(selection ? { selection } : {}),
    };
  }
  // No chosen song but selection data exists → carry it under a selection type.
  if (selection) {
    return { $type: SELECTION_TYPE, createdAt, selection };
  }
  return undefined;
}

/**
 * round_metadata.playlistUrl is sometimes a clean URL and sometimes a full
 * embed (e.g. a SoundCloud `<iframe>` with a `<a href>` set link). Extract a
 * usable link: a bare URL as-is, otherwise prefer a SoundCloud `/sets/` link
 * from the embed's href/src attributes, else any non-player http(s) URL.
 */
function extractPlaylistUrl(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (/^https?:\/\//i.test(s) && !s.includes("<")) return s;

  const urls = [...s.matchAll(/(?:href|src)="([^"]+)"/gi)].map((m) => m[1]);
  const set = urls.find((u) => /soundcloud\.com\/[^"]+\/sets\//i.test(u));
  if (set) return set;
  const nonPlayer = urls.find(
    (u) => /^https?:\/\//i.test(u) && !/w\.soundcloud\.com\/player/i.test(u),
  );
  return nonPlayer ?? urls.find((u) => /^https?:\/\//i.test(u)) ?? null;
}

export function transformRound(
  r: RoundExport,
  opts: TransformOptions,
): TransformedRound {
  const warnings: string[] = [];

  const createdDate = r.createdAt ?? r.signupOpens ?? new Date();
  if (!r.createdAt) {
    warnings.push("round.createdAt is null — using a fallback date");
  }
  const createdAt = createdDate.toISOString();

  const milestones = buildMilestones(r);
  if (milestones.length === 0) {
    warnings.push("no milestone dates — round is INVALID (needs ≥1 milestone)");
  }
  if (!r.chosenSong) {
    warnings.push("no chosen song on this round");
  }

  // Submissions → drafts; skip any with no deliverable URL (an at.atjam.submission
  // needs at least one of payload/url, and backfill only has url).
  const submissions: SubmissionDraft[] = [];
  for (const s of r.submissions) {
    if (!s.url) {
      warnings.push(
        `submission #${s.id}${s.username ? ` (${s.username})` : ""} has no audio URL — skipped`,
      );
      continue;
    }
    submissions.push({
      rkey: eptssSubmissionRkey(s.id),
      sourceSubmissionId: s.id,
      username: s.username,
      url: s.url,
      ...(s.note ? { note: s.note } : {}),
      createdAt: (s.createdAt ?? createdDate).toISOString(),
    });
  }

  const record: AtjamRoundRecord = {
    $type: "at.atjam.round",
    jam: opts.jam,
    name: `EPTSS Round ${r.id}`,
    assignment: r.promptText?.trim() || DEFAULT_ASSIGNMENT,
    acceptedSubmissionTypes: opts.acceptedSubmissionTypes ?? ["fm.plyr.track"],
    milestones,
    createdAt,
  };

  const subject = buildSubject(r, createdAt);
  if (subject) record.subject = subject;
  const playlistUrl = extractPlaylistUrl(r.playlistUrl);
  if (playlistUrl) {
    record.closingEvent = { $type: LISTENING_PARTY_TYPE, playlistUrl };
  } else if (r.playlistUrl) {
    warnings.push("playlistUrl present but no clean link could be extracted — closingEvent omitted");
  }

  return {
    roundId: r.id,
    rkey: eptssRoundRkey(r.id),
    record,
    submissions,
    warnings,
    valid: milestones.length > 0,
  };
}
