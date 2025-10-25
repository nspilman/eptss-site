"use server";

import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const adjectives = [
  "Melodic", "Harmonic", "Rhythmic", "Dynamic", "Sonorous",
  "Resonant", "Lyrical", "Tonal", "Euphonic", "Dissonant"
];

const animals = [
  "Crocodile", "Elephant", "Tiger", "Penguin", "Lion",
  "Giraffe", "Kangaroo", "Falcon", "Owl", "Dolphin"
];

export function generateUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  return `${adj}${animal}${number}`;
}

export async function createUser(userId: string, email: string) {
  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.userid, userId));
  if (existingUser.length) {
    return { success: true, message: "User already exists" };
  }

  // Generate username
  const username = generateUsername();

  // Insert new user
  await db.insert(users).values({ userid: userId, email, username });

  return { success: true, message: "User created successfully" };
}
