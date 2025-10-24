import { defineConfig } from "cypress";
import { baseConfig } from './cypress.config.base';
import fs from 'fs';
import path from 'path';

const debugLog = (message: string) => {
  fs.appendFileSync(path.join(__dirname, 'cypress-debug.log'), `${new Date().toISOString()}: ${message}\n`);
};

debugLog('🟣 Production config loading...');
debugLog(`🟣 Base config: ${JSON.stringify(baseConfig, null, 2)}`);

export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    setupNodeEvents: async (on, config) => {
      debugLog('🟣 Production setupNodeEvents called');
      
      // First run base config's setupNodeEvents
      if (baseConfig.e2e?.setupNodeEvents) {
        debugLog('🟣 Calling base config setupNodeEvents');
        await baseConfig.e2e.setupNodeEvents(on, config);
      } else {
        debugLog('❌ Base config setupNodeEvents not found!');
      }
      
      // Then add any production-specific setup
      debugLog('🟣 Adding production-specific setup');
      config.env = config.env || {};
      config.env.environment = 'production';
      
      // Register our own after:spec handler just in case
      on('after:spec', async (spec, results) => {
        debugLog('🟣 Production after:spec triggered');
        debugLog(`🟣 Spec: ${JSON.stringify(spec, null, 2)}`);
        debugLog(`🟣 Results: ${JSON.stringify(results, null, 2)}`);
      });
      
      return config;
    },
    baseUrl: "https://everyoneplaysthesamesong.com",
    env: {
      ...baseConfig.e2e?.env,
      environment: 'production'
    }
  }
});
