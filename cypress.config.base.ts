import { defineConfig } from "cypress";
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

console.error('🔵 Loading Cypress base config...');

const execAsync = promisify(exec);

const debugLog = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync('cypress-debug.log', logMessage);
};

// Export setupNodeEvents separately so it doesn't get lost in spreading
export const setupNodeEvents = async (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  debugLog('🔵 Base setupNodeEvents called');
  
  // Register tasks
  on('task', {
    async getMagicLink() {
      try {
        const { stdout, stderr } = await execAsync('node scripts/get-magic-link.js');
        const match = stdout.match(/^MAGIC_LINK=(.+)$/m);
        if (!match) {
          debugLog('Could not find magic link in output');
          return null;
        }
        return match[1].trim();
      } catch (error) {
        debugLog('Error getting magic link: ' + error);
        if ('stderr' in (error as {stderr: string})) {
          debugLog('Script error output: ' + (error as { stderr: string }).stderr);
        }
        return null;
      }
    },
    log(message) {
      debugLog(message);
      return null;
    }
  });
  
  // Make sure env variables are available
  config.env = config.env || {};
  config.env.GMAIL_USER_EMAIL = process.env.GMAIL_USER_EMAIL;
  
  return config;
};

export const baseConfig = defineConfig({
  e2e: {
    setupNodeEvents,
    env: {
      GMAIL_USER_EMAIL: process.env.GMAIL_USER_EMAIL,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      THE_SECRET_SLIME_ACTION: process.env.THE_SECRET_SLIME_ACTION,
    },
  },
});
