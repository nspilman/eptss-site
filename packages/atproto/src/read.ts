/**
 * The read layer: pull EPTSS's at.atjam.* records straight off the network.
 *
 * Because the backfill wrote every record (rounds + submissions) to the EPTSS
 * admin repo, reads are simple — resolve that one DID to its PDS, then
 * listRecords each collection. No auth (public reads), no backlinks index
 * needed yet; submissions are grouped to their round by the round strong-ref
 * they already carry.
 */
import type { Jam, RecordEnvelope, Round, Submission } from "./types";

/** The EPTSS service account that owns the jam, rounds, and backfilled submissions. */
export const EPTSS_DID = "did:plc:pf6izdjdonyd46isl3txwu4g";

const PLC_DIRECTORY = "https://plc.directory";

interface DidDoc {
  service?: Array<{ id: string; type: string; serviceEndpoint: string }>;
}

async function resolvePds(did: string): Promise<string> {
  const res = await fetch(`${PLC_DIRECTORY}/${encodeURIComponent(did)}`);
  if (!res.ok) throw new Error(`PLC directory ${res.status} for ${did}`);
  const doc = (await res.json()) as DidDoc;
  const svc = doc.service?.find((s) => s.id === "#atproto_pds");
  if (!svc?.serviceEndpoint) throw new Error(`No #atproto_pds endpoint for ${did}`);
  return svc.serviceEndpoint;
}

async function listRecords<T>(
  pds: string,
  did: string,
  collection: string,
): Promise<RecordEnvelope<T>[]> {
  const out: RecordEnvelope<T>[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(`${pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set("repo", did);
    url.searchParams.set("collection", collection);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`listRecords ${res.status} for ${collection}`);
    const data = (await res.json()) as {
      records?: RecordEnvelope<T>[];
      cursor?: string;
    };
    for (const r of data.records ?? []) out.push(r);
    cursor = data.cursor;
  } while (cursor);
  return out;
}

export interface RoundWithSubmissions {
  uri: string;
  cid: string;
  rkey: string;
  round: Round;
  submissions: RecordEnvelope<Submission>[];
}

export interface EptssData {
  did: string;
  jam: Jam | null;
  rounds: RoundWithSubmissions[];
}

function rkeyOf(uri: string): string {
  return uri.split("/").pop() ?? uri;
}

/**
 * The backfill keys each submission record `eptss-sub<postgres-id>`. Recover
 * that `submissions.id` from a submission AT URI so the app can cross-walk to
 * DB-only data (the submitter's username) that the generic record doesn't
 * carry. Returns null when the rkey isn't a backfilled submission.
 */
export function eptssSubmissionId(submissionUri: string): number | null {
  const m = /^eptss-sub(\d+)$/.exec(rkeyOf(submissionUri));
  return m ? Number(m[1]) : null;
}

export async function getEptssData(did: string = EPTSS_DID): Promise<EptssData> {
  const pds = await resolvePds(did);
  const [roundRecs, subRecs, jamRecs] = await Promise.all([
    listRecords<Round>(pds, did, "at.atjam.round"),
    listRecords<Submission>(pds, did, "at.atjam.submission"),
    listRecords<Jam>(pds, did, "at.atjam.jam"),
  ]);

  const subsByRound = new Map<string, RecordEnvelope<Submission>[]>();
  for (const s of subRecs) {
    const roundUri = s.value.round?.uri;
    if (!roundUri) continue;
    const list = subsByRound.get(roundUri) ?? [];
    list.push(s);
    subsByRound.set(roundUri, list);
  }

  const rounds: RoundWithSubmissions[] = roundRecs
    .map((r) => ({
      uri: r.uri,
      cid: r.cid,
      rkey: rkeyOf(r.uri),
      round: r.value,
      submissions: (subsByRound.get(r.uri) ?? []).sort(
        (a, b) =>
          new Date(a.value.createdAt).getTime() -
          new Date(b.value.createdAt).getTime(),
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.round.createdAt).getTime() -
        new Date(a.round.createdAt).getTime(),
    );

  return { did, jam: jamRecs[0]?.value ?? null, rounds };
}

export async function getRound(
  rkey: string,
  did: string = EPTSS_DID,
): Promise<RoundWithSubmissions | null> {
  const data = await getEptssData(did);
  return data.rounds.find((r) => r.rkey === rkey) ?? null;
}
