import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv"

const adjectives = [
  "Melodic", "Harmonic", "Rhythmic", "Dynamic", "Sonorous",
  "Resonant", "Lyrical", "Tonal", "Euphonic", "Dissonant"
];

const animals = [
  "Crocodile", "Elephant", "Tiger", "Penguin", "Lion",
  "Giraffe", "Kangaroo", "Falcon", "Owl", "Dolphin"
];

dotenv.config()

const generateUsername = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  return `${adj}${animal}${number}`;
};

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

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.userid, id));
    console.log({existingUser})
    if (existingUser.length) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    // Generate username
    const username = generateUsername();

    // Insert new user into Drizzle ORM
    await db.insert(users).values({ userid: id, email, username });

    return NextResponse.json({ message: "User created successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error inserting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}
