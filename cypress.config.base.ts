import { defineConfig } from "cypress";
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

dotenv.config();

console.error('🔵 Loading Cypress base config...');

const execAsync = promisify(exec);

const debugLog = (message: string) => {
  fs.appendFileSync(path.join(__dirname, 'cypress-debug.log'), `${new Date().toISOString()}: ${message}\n`);
};

const saveTestResult = async (testData: any) => {
  debugLog('🔴 saveTestResult called with data: ' + JSON.stringify(testData, null, 2));

  const baseUrl = 'https://everyoneplaysthesamesong.com';
  const reportUrl = `${baseUrl}/api/test-report`;
  
  debugLog(`🚀 Sending test report to: ${reportUrl}`);

  try {
    // First check if fetch is available
    if (typeof fetch === 'undefined') {
      debugLog('❌ fetch is not available in this context!');
      throw new Error('fetch is not available in this context');
    }

    debugLog('Attempting fetch call...');
    const response = await fetch(reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    }).catch(error => {
      debugLog(`❌ Fetch failed with error: ${error.message}`);
      debugLog(`Stack trace: ${error.stack}`);
      throw error;
    });

    debugLog(`Response status: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    debugLog(`Response body: ${responseText}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }

    try {
      const result = JSON.parse(responseText);
      debugLog(`✅ Success! Response: ${JSON.stringify(result, null, 2)}`);
      return result;
    } catch (parseError) {
      debugLog('⚠️ Warning: Invalid JSON response');
      debugLog(`Parse error: ${parseError}`);
      return responseText;
    }
  } catch (error) {
    debugLog('❌ =============== ERROR SAVING TEST RESULT ===============');
    debugLog(`Error type: ${error.constructor.name}`);
    debugLog(`Error message: ${error.message}`);
    debugLog(`Stack trace: ${error.stack}`);
    
    // Try to get more error details
    if (error instanceof Error) {
      debugLog(`Error name: ${error.name}`);
      debugLog(`Error cause: ${error.cause}`);
      // @ts-ignore
      if (error.code) debugLog(`Error code: ${error.code}`);
    }
    
    throw error;
  }
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

  // Register after:spec handler
  debugLog('🔵 Registering after:spec handler...');
  on('after:spec', async (spec, results) => {
    debugLog('🔵 AFTER:SPEC WAS TRIGGERED!');
    debugLog(`🔵 Spec: ${JSON.stringify(spec, null, 2)}`);
    debugLog(`🔵 Results: ${JSON.stringify(results, null, 2)}`);

    // Report each test result
    if (results && results.tests) {
      for (const test of results.tests) {
        try {
          debugLog(`Reporting test: ${test.title}`);
          const testData = {
            title: test.title.join(' '),
            state: test.state,
            duration: test.duration,
            err: test.error,
            environment: config.env.environment || 'production',
            timestamp: new Date().toISOString(),
          };

          await saveTestResult(testData);
        } catch (error) {
          debugLog(`Failed to report test ${test.title}: ${error}`);
          if (error instanceof Error) {
            debugLog(`Stack trace: ${error.stack}`);
          }
        }
      }
    } else {
      debugLog('❌ No test results found in the spec results');
    }
  });
  
  // Also try the after:run event
  debugLog('🔵 Registering after:run handler...');
  on('after:run', async (results) => {
    debugLog('🔵 AFTER:RUN WAS TRIGGERED!');
    debugLog(`🔵 Run results: ${JSON.stringify(results, null, 2)}`);
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
