import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://everyoneplaysthesamesong.com' // replace with your actual production domain
      : 'http://localhost:3000'
  },
  sentry: {
    hideSourceMaps: true,
  },
  async redirects() {
    return [
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
    ]
  }
};

const sentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);