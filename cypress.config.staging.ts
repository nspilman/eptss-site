import { baseConfig } from './cypress.config.base';

export default {
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: "https://staging.everyoneplaysthesamesong.com", // TODO: set up staging environment
    env: {
      ...baseConfig.e2e?.env,
      environment: 'staging'
    }
  }
};
