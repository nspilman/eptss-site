/**
 * Admin-voiced writes, in pure fetch — the EPTSS service account putting its own
 * records (rounds, scaffold submissions) on the network via app-password auth.
 *
 * Plain XRPC (`com.atproto.server.createSession` + `com.atproto.repo.putRecord`)
 * rather than @atproto/api, so this package keeps its zero-dependency shape and
 * any layer (admin actions, scripts, cron) can publish as EPTSS. This is NOT the
 * user path: user-owned records are written over their OAuth session in the web
 * app (see apps/web/lib/atproto), never with a password.
 */
import type { StrongRef } from "./types";

const DEFAULT_SERVICE = "https://bsky.social";

export interface AdminSession {
  service: string;
  did: string;
  accessJwt: string;
}

/**
 * Log the admin account in with an app password. `service` is the PDS entryway
 * (default bsky.social). Throws on bad credentials or an unreachable PDS.
 */
export async function createAdminSession(opts: {
  identifier: string;
  appPassword: string;
  service?: string;
}): Promise<AdminSession> {
  const service = (opts.service ?? DEFAULT_SERVICE).replace(/\/$/, "");
  const res = await fetch(`${service}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      identifier: opts.identifier,
      password: opts.appPassword,
    }),
  });
  if (!res.ok) {
    throw new Error(`createSession ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { did?: string; accessJwt?: string };
  if (!data.did || !data.accessJwt) {
    throw new Error("createSession returned no did/accessJwt");
  }
  return { service, did: data.did, accessJwt: data.accessJwt };
}

/**
 * Upsert one record in the admin repo at a stable rkey and read it back to
 * prove it resolves. Returns the written strong-ref.
 */
export async function putAdminRecord(
  session: AdminSession,
  opts: { collection: string; rkey: string; record: Record<string, unknown> },
): Promise<StrongRef> {
  const put = await fetch(`${session.service}/xrpc/com.atproto.repo.putRecord`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: opts.collection,
      rkey: opts.rkey,
      record: opts.record,
    }),
  });
  if (!put.ok) {
    throw new Error(`putRecord ${opts.collection}/${opts.rkey} ${put.status}: ${await put.text()}`);
  }
  const ref = (await put.json()) as { uri?: string; cid?: string };
  if (!ref.uri || !ref.cid) {
    throw new Error(`putRecord ${opts.collection}/${opts.rkey} returned no uri/cid`);
  }

  // Read-back: the record must resolve from the repo before we call it written.
  const url = new URL(`${session.service}/xrpc/com.atproto.repo.getRecord`);
  url.searchParams.set("repo", session.did);
  url.searchParams.set("collection", opts.collection);
  url.searchParams.set("rkey", opts.rkey);
  const back = await fetch(url.toString());
  if (!back.ok) {
    throw new Error(`read-back ${opts.collection}/${opts.rkey} failed (${back.status})`);
  }
  return { uri: ref.uri, cid: ref.cid };
}
