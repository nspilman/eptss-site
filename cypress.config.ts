import { defineConfig } from "cypress";
import dotenv from "dotenv"
dotenv.config();

export default defineConfig({
  e2e: {
      baseUrl: "http://localhost:3000",
      env: {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        THE_SECRET_SLIME_ACTION:process.env.THE_SECRET_SLIME_ACTION,
      },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});


