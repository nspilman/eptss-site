/**
 * Create an `at.atjam.signup` record on the USER's PDS from a JSON config.
 *
 * Used to backfill an existing EPTSS user's signup for a past round (Path A
 * — script-only, no website integration yet). Writes from a user's personal
 * bsky account, not the EPTSS admin account.
 *
 * Env (note the USER_ prefix — distinct from the admin ATPROTO_* vars):
 *   USER_ATPROTO_HANDLE        — your personal handle (e.g. nate.bsky.social)
 *   USER_ATPROTO_APP_PASSWORD  — app password (generate at https://bsky.app/settings/app-passwords)
 *
 * Usage:
 *   bun src/atproto/create-user-signup.ts <path-to-signup-config.json>
 *
 * See signup.example.json for the config shape.
 *
 * Path B (real users signing up via the EPTSS website) will not use this
 * script — that flow uses OAuth in the Next.js app. The record shape built
 * by buildSignupRecord() below is what gets shared with Path B.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loginAtprotoAgent } from "./agent";

const COLLECTION = "at.atjam.signup";

interface SignupConfig {
  round: { uri: string; cid: string };
  note?: string;
}

function loadConfig(path: string): SignupConfig {
  const raw = readFileSync(resolve(path), "utf8");
  const parsed = JSON.parse(raw);

  if (!parsed.round?.uri || !parsed.round?.cid) {
    throw new Error("config.round must have { uri, cid } — get these from create-eptss-round output");
  }
  if (parsed.note !== undefined && typeof parsed.note !== "string") {
    throw new Error("config.note must be a string if present");
  }

  return parsed as SignupConfig;
}

/**
 * Build the at.atjam.signup record body. Pure function — no side effects.
 * Path B (web app OAuth flow) will import or duplicate this to build the
 * same record shape after the user authenticates.
 */
export function buildSignupRecord(config: SignupConfig) {
  const record: Record<string, unknown> = {
    $type: COLLECTION,
    round: { uri: config.round.uri, cid: config.round.cid },
    createdAt: new Date().toISOString(),
  };
  if (config.note) record.note = config.note;
  return record;
}

async function main() {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error("usage: bun src/atproto/create-user-signup.ts <signup-config.json>");
    process.exit(1);
  }

  const config = loadConfig(configPath);
  const record = buildSignupRecord(config);

  const { agent, did, handle } = await loginAtprotoAgent({
    handleEnv: "USER_ATPROTO_HANDLE",
    passwordEnv: "USER_ATPROTO_APP_PASSWORD",
  });
  console.log(`Logged in as ${handle} (${did})`);
  console.log(`Creating ${COLLECTION} record strong-reffing ${config.round.uri}...`);

  const result = await agent.com.atproto.repo.createRecord({
    repo: did,
    collection: COLLECTION,
    record,
  });

  console.log("");
  console.log("✓ User signup record created");
  console.log(`  uri: ${result.data.uri}`);
  console.log(`  cid: ${result.data.cid}`);
  console.log(`  view: https://pdsls.dev/at/${did}/${COLLECTION}/${result.data.uri.split("/").pop()}`);
  console.log("");
  console.log("Verify the backlink lands by querying Constellation:");
  console.log(`  https://constellation.microcosm.blue/links?target=${encodeURIComponent(config.round.uri)}&collection=${COLLECTION}&path=.round.uri`);
}

main().catch((err) => {
  console.error("Failed to create signup:", err);
  process.exit(1);
});
