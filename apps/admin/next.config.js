const nextConfig = {
  reactStrictMode: true,
  basePath: '/admin',
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
      ? 'https://everyoneplaysthesamesong.com'
      : 'http://localhost:3000',
    NEXT_PUBLIC_BASE_PATH: '/admin'
  },
  // Temporarily disable turbopack for CSS processing compatibility
  // turbopack: {
  //   root: process.cwd(),
  // },
};

export default nextConfig;
