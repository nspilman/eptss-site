const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  "collectCoverage": true,
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: [
		'pages/**/*.{js,jsx,ts,tsx}',
		'components/**/**/*.{js,jsx,ts,tsx}',
		'!src/redux/**/index.ts',
		'!**/src/components/**/*.stories.+(js|ts|tsx)',
		'!**/__tests__/**',
		'!**/node_modules/**',
		'!**/.next/**',
		'!**/build/**',
	],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
