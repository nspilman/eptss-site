import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
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
  // Additional config options for the Sentry Webpack plugin
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions); 