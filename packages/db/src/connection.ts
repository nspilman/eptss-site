import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Check if we're in Playwright test mode
const isPlaywrightTestMode = process.env.PLAYWRIGHT_TEST_MODE === "true";

// Type for our database instance
type DatabaseInstance = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Create a mock database that returns empty results for all queries.
 * This allows tests to run without a real database connection.
 * Tests can use the mockDb fixture to set up specific data via the test API.
 */
const createMockDb = (): DatabaseInstance => {
  // Create a chainable mock that returns empty results
  const createChainableMock = (): any => {
    const mock: any = {
      // Always return empty array for queries
      then: (resolve: (value: any[]) => void) => {
        resolve([]);
        return Promise.resolve([]);
      },
    };

    // Make all method calls return the mock itself for chaining
    return new Proxy(mock, {
      get(target, prop) {
        if (prop === 'then') {
          return target.then;
        }
        // For any other property, return a function that returns this mock
        return (...args: any[]) => createChainableMock();
      },
    });
  };

  // Create the main db mock
  const mockDb = new Proxy({} as DatabaseInstance, {
    get(target, prop) {
      // For select/insert/update/delete, return chainable mock
      if (['select', 'insert', 'update', 'delete', 'query'].includes(prop as string)) {
        return (...args: any[]) => createChainableMock();
      }
      // For execute (raw SQL), return empty array
      if (prop === 'execute') {
        return async () => [];
      }
      // For transaction, execute the callback with the mock
      if (prop === 'transaction') {
        return async (callback: (tx: any) => Promise<any>) => callback(mockDb);
      }
      // Return undefined for other properties
      return undefined;
    },
  });

  return mockDb;
};

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

// Initialize database based on mode
let db: DatabaseInstance;

if (isPlaywrightTestMode) {
  // In test mode, use mock database that returns empty results
  // Tests can configure specific responses via the test API
  db = createMockDb();
} else {
  // In production/development, use real Postgres
  const client =
    (process.env.NODE_ENV === "production" || !globalForPg.pg)
      ? createPostgresConnection()
      : globalForPg.pg;

  // Save the client reference in development
  if (process.env.NODE_ENV !== "production" && !globalForPg.pg) {
    globalForPg.pg = client;
  }

  db = drizzle(client, { schema });
}

export { db };

// Explicitly handle process termination to close connections (only for real Postgres)
if (!isPlaywrightTestMode && process.env.NODE_ENV !== "test") {
  // Handle various termination signals
  const signals = ["SIGTERM", "SIGINT", "beforeExit", "exit"];

  signals.forEach((signal) => {
    process.on(signal, () => {
      if (globalForPg.pg) {
        console.log(`Closing Postgres connections due to ${signal}`);
        globalForPg.pg.end({ timeout: 5 }).catch(console.error);
      }
    });
  });
}
