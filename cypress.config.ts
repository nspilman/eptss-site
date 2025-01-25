import { defineConfig } from "cypress";
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from "dotenv";
dotenv.config();

const execAsync = promisify(exec);

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        async getMagicLink() {
          try {
            const { stdout, stderr } = await execAsync('node scripts/get-magic-link.js');
            const match = stdout.match(/^MAGIC_LINK=(.+)$/m);
            if (!match) {
              console.error('Could not find magic link in output');
              return null;
            }
            return match[1].trim();
          } catch (error) {
            console.error('Error getting magic link:', error);
            if (error.stderr) {
              console.error('Script error output:', error.stderr);
            }
            return null;
          }
        }
      });
      
      // Make sure env variables are available
      config.env = config.env || {};
      config.env.GMAIL_USER_EMAIL = process.env.GMAIL_USER_EMAIL;
      
      return config;
    },
    baseUrl: "https://everyoneplaysthesamesong.com",
    env: {
      GMAIL_USER_EMAIL: process.env.GMAIL_USER_EMAIL,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      THE_SECRET_SLIME_ACTION: process.env.THE_SECRET_SLIME_ACTION,
    },
  },
});
