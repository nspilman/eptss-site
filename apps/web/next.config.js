// import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable webpack cache persistence to reduce build artifact size
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV === 'production') {
      config.cache = false;
    }
    return config;
  },
  // Optimize bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-tooltip',
      'drizzle-orm',
      '@supabase/supabase-js',
      '@sentry/nextjs',
      'date-fns'
    ],
  },
  // Reduce serverless function size by excluding unnecessary files
  outputFileTracingIncludes: {
    '/api/**/*': [],
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      'node_modules/webpack',
      'node_modules/terser',
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://everyoneplaysthesamesong.com' // replace with your actual production domain
      : 'http://localhost:3000'
  },
  turbopack: {
    root: process.cwd(),
  },
  // PPR requires Next.js canary - uncomment when upgrading:
  // experimental: {
  //   ppr: 'incremental',
  // },
  async redirects() {
    return [
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://api.everyoneplaysthesamesong.com/api/:path*'
          : 'http://localhost:3002/api/:path*',
      },
      // Admin rewrites handled differently in dev vs prod
      ...(process.env.NODE_ENV !== 'production' ? [
        {
          source: '/admin/:path*',
          destination: 'http://localhost:3001/:path*',
        }
      ] : []),
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

// const sentryWebpackPluginOptions = {
//   silent: true, // Suppresses all logs
//   // For all available options, see:
//   // https://github.com/getsentry/sentry-webpack-plugin#options.
//   org: process.env.SENTRY_ORG,
//   project: process.env.SENTRY_PROJECT,
// };

// const sentryBuildOptions = {
//   hideSourceMaps: true,
// };

// Temporarily disable Sentry to reduce bundle size
export default nextConfig;
// export default withSentryConfig(nextConfig, sentryWebpackPluginOptions, sentryBuildOptions);