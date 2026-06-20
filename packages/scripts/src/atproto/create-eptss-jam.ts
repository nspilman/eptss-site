/**
 * Create the EPTSS `at.atjam.jam` record.
 *
 * Run ONCE. The output AT URI + CID are the identity of "EPTSS-the-project"
 * across the ATProto network. Every round record strong-refs this jam.
 *
 * Save the printed URI + CID — you'll paste them into round configs and
 * eventually into env (EPTSS_JAM_URI / EPTSS_JAM_CID) for the round script.
 *
 * Usage:
 *   bun src/atproto/create-eptss-jam.ts
 *
 * See docs/atproto-migration/01-round-creation.md for the broader plan.
 */
import { loginAtprotoAgent } from "./agent";

const COLLECTION = "at.atjam.jam";

const JAM_RECORD = {
  $type: COLLECTION,
  name: "Everyone Plays the Same Song",
  description:
    "One song, every quarter. A community of musicians covers the same track, " +
    "each in their own style. Every round runs about three months: participants " +
    "suggest and vote on the song, take the recording window to make their version, " +
    "then gather at a listening party to share what they made. Creative freedom " +
    "inside a shared constraint.",
  kind: "music-cover",
  links: [
    {
      label: "Website",
      url: "https://everyoneplaysthesamesong.com",
    },
  ],
  createdAt: new Date().toISOString(),
};

async function main() {
  const { agent, did, handle } = await loginAtprotoAgent();

  console.log(`Logged in as ${handle} (${did})`);
  console.log(`Creating ${COLLECTION} record...`);

  const result = await agent.com.atproto.repo.createRecord({
    repo: did,
    collection: COLLECTION,
    record: JAM_RECORD,
  });

  console.log("");
  console.log("✓ EPTSS jam record created");
  console.log(`  uri: ${result.data.uri}`);
  console.log(`  cid: ${result.data.cid}`);
  console.log(`  view: https://pdsls.dev/at/${did}/${COLLECTION}/${result.data.uri.split("/").pop()}`);
  console.log("");
  console.log("Next: paste these values into a round config JSON and run create-eptss-round.");
}

main().catch((err) => {
  console.error("Failed to create jam:", err);
  process.exit(1);
});
