// import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@eptss/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
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
    serverActions: {
      bodySizeLimit: '52mb', // Increased from 1mb default to support audio file uploads up to 50mb
    },
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
      // Legacy signup redirect
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
      // Redirect legacy routes to cover project
      {
        source: '/voting',
        destination: '/projects/cover/voting',
        permanent: false,
      },
      {
        source: '/voting/:slug',
        destination: '/projects/cover/voting/:slug',
        permanent: false,
      },
      {
        source: '/submit',
        destination: '/projects/cover/submit',
        permanent: false,
      },
      {
        source: '/submit/:roundId',
        destination: '/projects/cover/submit/:roundId',
        permanent: false,
      },
      {
        source: '/sign-up',
        destination: '/projects/cover/sign-up',
        permanent: false,
      },
      {
        source: '/sign-up/:slug',
        destination: '/projects/cover/sign-up/:slug',
        permanent: false,
      },
      {
        source: '/round/:slug',
        destination: '/projects/cover/round/:slug',
        permanent: false,
      },
      {
        source: '/rounds',
        destination: '/projects/cover/rounds',
        permanent: false,
      },
      {
        source: '/discussions',
        destination: '/projects/cover/discussions',
        permanent: false,
      },
      {
        source: '/reporting',
        destination: '/projects/cover/reporting',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
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