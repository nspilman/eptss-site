const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    html: '<!DOCTYPE html><html><head></head><body></body></html>',
    url: 'http://localhost',
    pretendToBeVisual: true,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ['<rootDir>/cypress/'],
  collectCoverage: true,
  moduleDirectories: ["node_modules", "<rootDir>/"],
  collectCoverageFrom: [
    "./components/**/**/*.{js,jsx,ts,tsx}",
    "services/**/*.{js,jsx,ts,tsx}",
    "!**/__tests__/**",
    "!**/node_modules/**",
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
