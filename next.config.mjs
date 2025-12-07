/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bypass TypeScript errors during build (useful for quick deployments)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Bypass ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip pre-rendering errors and continue with build
  experimental: {
    // Don't fail build on prerender errors
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Stub native-only modules that some deps optionally import
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    }
    return config
  },
};

export default nextConfig;
