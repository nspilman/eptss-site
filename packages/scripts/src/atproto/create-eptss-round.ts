/**
 * Create a `at.atjam.round` record from a JSON config file.
 *
 * The round strong-refs the parent EPTSS jam (created once by create-eptss-jam.ts)
 * and embeds the round's song as an inline `site.eptss.song` subject.
 *
 * Usage:
 *   bun src/atproto/create-eptss-round.ts <path-to-round-config.json>
 *
 * See round.example.json for the config shape.
 * See docs/atproto-migration/01-round-creation.md for the full record shape rationale.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loginAtprotoAgent } from "./agent";

const COLLECTION = "at.atjam.round";
const SONG_TYPE = "site.eptss.song";

interface RoundConfig {
  jam: { uri: string; cid: string };
  name: string;
  assignment: string;
  song: { title: string; artist: string };
  milestones: Array<{ label: string; date: string }>;
  acceptedSubmissionTypes: string[];
}

function loadConfig(path: string): RoundConfig {
  const raw = readFileSync(resolve(path), "utf8");
  const parsed = JSON.parse(raw);

  // Light validation — catch obvious config errors before hitting the network.
  if (!parsed.jam?.uri || !parsed.jam?.cid) {
    throw new Error("config.jam must have { uri, cid } from create-eptss-jam output");
  }
  if (!parsed.assignment) {
    throw new Error("config.assignment is required");
  }
  if (!parsed.song?.title || !parsed.song?.artist) {
    throw new Error("config.song must have { title, artist }");
  }
  if (!Array.isArray(parsed.milestones) || parsed.milestones.length === 0) {
    throw new Error("config.milestones must be a non-empty array");
  }
  if (!Array.isArray(parsed.acceptedSubmissionTypes) || parsed.acceptedSubmissionTypes.length === 0) {
    throw new Error("config.acceptedSubmissionTypes must be a non-empty array of NSIDs");
  }

  return parsed as RoundConfig;
}

function buildRoundRecord(config: RoundConfig) {
  const now = new Date().toISOString();
  return {
    $type: COLLECTION,
    jam: {
      uri: config.jam.uri,
      cid: config.jam.cid,
    },
    name: config.name,
    assignment: config.assignment,
    // Inline song subject. The atjam round lexicon types `subject` as
    // `unknown` and requires `$type` discrimination, so this is valid
    // even though site.eptss.song has no published lexicon yet.
    subject: {
      $type: SONG_TYPE,
      title: config.song.title,
      artist: config.song.artist,
      createdAt: now,
    },
    acceptedSubmissionTypes: config.acceptedSubmissionTypes,
    milestones: config.milestones,
    createdAt: now,
  };
}

async function main() {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error("usage: bun src/atproto/create-eptss-round.ts <round-config.json>");
    process.exit(1);
  }

  const config = loadConfig(configPath);
  const record = buildRoundRecord(config);

  const { agent, did, handle } = await loginAtprotoAgent();
  console.log(`Logged in as ${handle} (${did})`);
  console.log(`Creating ${COLLECTION} for "${config.name}" (song: ${config.song.title} — ${config.song.artist})...`);

  const result = await agent.com.atproto.repo.createRecord({
    repo: did,
    collection: COLLECTION,
    record,
  });

  console.log("");
  console.log("✓ EPTSS round record created");
  console.log(`  uri: ${result.data.uri}`);
  console.log(`  cid: ${result.data.cid}`);
  console.log(`  view: https://pdsls.dev/at/${did}/${COLLECTION}/${result.data.uri.split("/").pop()}`);
  console.log("");
  console.log("Save these — they identify this round across the network.");
}

main().catch((err) => {
  console.error("Failed to create round:", err);
  process.exit(1);
});
