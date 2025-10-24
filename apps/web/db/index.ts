import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Singleton pattern to prevent connection leaks in development with Next.js hot reloading
const createPostgresConnection = () => {
  // Connection pooling configuration with strict limits
  const connectionOptions = {
    max: 5, // Reduce max connections to prevent pool exhaustion
    idle_timeout: 10, // Close idle connections faster (10 seconds)
    connect_timeout: 5, // Shorter connection timeout
    max_lifetime: 60 * 5, // Force-close connections after 5 minutes
    prepare: false, // Disable prepared statements
    debug: process.env.NODE_ENV === "development", // Log queries in development
    onnotice: () => {}, // Suppress notice messages
    onparameter: () => {}, // Suppress parameter messages
  };

  return postgres(process.env.DATABASE_URL!, connectionOptions);
};

// Use a global singleton for the Postgres client to prevent connection leaks
// during development with hot module reloading
const globalForPg = global as unknown as {
  pg: ReturnType<typeof postgres> | undefined;
};

// In production, create a new connection for each server instance
// In development, reuse the connection to prevent leaks during hot reloading
const client = 
  (process.env.NODE_ENV === "production" || !globalForPg.pg)
    ? createPostgresConnection()
    : globalForPg.pg;

// Save the client reference in development
if (process.env.NODE_ENV !== "production" && !globalForPg.pg) {
  globalForPg.pg = client;
}

// Create drizzle instance
export const db = drizzle(client);

// Explicitly handle process termination to close connections
if (process.env.NODE_ENV !== "test") {
  // Handle various termination signals
  const signals = ["SIGTERM", "SIGINT", "beforeExit", "exit"];
  
  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`Closing Postgres connections due to ${signal}`);
      client.end({ timeout: 5 }).catch(console.error);
    });
  });
}
