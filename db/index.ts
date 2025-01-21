import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Connect to Supabase Postgres
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);
