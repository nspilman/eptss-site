import { Agent } from "@atproto/api";
import { getOAuthClient } from "./client";

/**
 * An agent acting AS the given DID — used to write records into that user's own
 * repo (the claim flow). Restores the stored OAuth session (the library
 * auto-refreshes tokens) and wraps it in an Agent. Throws if there is no live
 * session for the DID, i.e. the user must (re)link before they can write.
 */
export async function getUserAgent(did: string): Promise<Agent> {
  const client = getOAuthClient();
  const session = await client.restore(did);
  return new Agent(session);
}
