/**
 * Serves the ATProto OAuth client metadata document at the URL that IS
 * the client_id. The OAuth provider fetches this document to learn how
 * to interact with us, so client_id and URL must match exactly.
 *
 * The metadata shape lives in lib/atproto/metadata.ts and is shared with
 * the NodeOAuthClient constructor — drift between the two is a bug class
 * we eliminate by having one source.
 *
 * Dev: http://127.0.0.1:3000/oauth-client-metadata.json
 * Prod: https://everyoneplaysthesamesong.com/oauth-client-metadata.json
 *
 * Use 127.0.0.1 (not localhost) in dev — OAuth requires loopback IP for
 * non-HTTPS client_ids.
 */
import { NextResponse } from "next/server";
import { getClientMetadata } from "@/lib/atproto/metadata";

export const dynamic = "force-dynamic"; // env-dependent

export async function GET() {
  return NextResponse.json(getClientMetadata());
}
