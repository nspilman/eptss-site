import { baseConfig } from './cypress.config.base';

export default {
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: "http://localhost:3000",
    env: {
      ...baseConfig.e2e?.env,
      environment: 'local'
    }
  }
};
