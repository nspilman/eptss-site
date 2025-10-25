import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@eptss/data-access/services/userCreationService";

const SECRET = process.env.NEXT_PUBLIC_SUPABASE_USER_CREATION_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const receivedSecret = req.headers.get("x-supabase-signature");

    if (!receivedSecret || receivedSecret !== SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { id, email } = payload.record;

    if (!id || !email) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    console.log("Received webhook payload:", payload);

    const result = await createUser(id, email);

    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Error inserting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}
