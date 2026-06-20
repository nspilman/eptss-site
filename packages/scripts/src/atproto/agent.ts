import { AtpAgent } from "@atproto/api";
import "dotenv/config";

/**
 * Login to bsky.social with an app password and return an authenticated
 * AtpAgent + the DID of the logged-in account.
 *
 * Default env vars (admin / project identity — writes jam, round, future
 * confirmation records):
 *   ATPROTO_HANDLE        — admin/project handle (e.g. everyoneplaysthesamesong.com)
 *   ATPROTO_APP_PASSWORD  — app password for that handle
 *
 * Override via opts to use a different identity. For Path A backfill
 * (user-side signup records on the user's own PDS), call with:
 *   loginAtprotoAgent({ handleEnv: "USER_ATPROTO_HANDLE", passwordEnv: "USER_ATPROTO_APP_PASSWORD" })
 *
 * Path B (Next.js web app, real users signing up via OAuth) won't use this
 * helper — OAuth flows store sessions per-user differently. The record-build
 * logic in each create-* script is what gets reused there.
 */
export async function loginAtprotoAgent(opts?: {
  handleEnv?: string;
  passwordEnv?: string;
}): Promise<{
  agent: AtpAgent;
  did: string;
  handle: string;
}> {
  const handleVar = opts?.handleEnv ?? "ATPROTO_HANDLE";
  const passwordVar = opts?.passwordEnv ?? "ATPROTO_APP_PASSWORD";

  const handle = process.env[handleVar];
  const password = process.env[passwordVar];

  if (!handle || !password) {
    throw new Error(
      `Missing ${handleVar} or ${passwordVar} in env. ` +
        "Set them in packages/scripts/.env or export before running."
    );
  }

  const agent = new AtpAgent({ service: "https://bsky.social" });
  await agent.login({ identifier: handle, password });

  const did = agent.session?.did;
  if (!did) {
    throw new Error("Login succeeded but no DID on session");
  }

  return { agent, did, handle };
}
