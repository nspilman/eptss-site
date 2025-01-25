import { baseConfig } from './cypress.config.base';

export default {
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: "https://everyoneplaysthesamesong.com",
    env: {
      ...baseConfig.e2e?.env,
      environment: 'production'
    }
  }
};
