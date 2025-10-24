const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Ensure PostCSS processes CSS files
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dialog',
      'drizzle-orm'
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://admin.everyoneplaysthesamesong.com'
      : 'http://localhost:3001'
  },
  // Temporarily disable turbopack for CSS processing compatibility
  // turbopack: {
  //   root: process.cwd(),
  // },
};

export default nextConfig;
