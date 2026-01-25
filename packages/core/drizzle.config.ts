import { defineConfig } from "drizzle-kit";

// Always use session pooler (5432) for schema operations
const MIGRATION_DATABASE_URL = process.env.DATABASE_URL?.replace(':6543', ':5432');

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: MIGRATION_DATABASE_URL!,
  },
});
