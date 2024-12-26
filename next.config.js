/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type checking during builds
  typescript: {
    ignoreBuildErrors: true
  },
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true
  },
  // Image optimization
  images: {
    domains: [
      'woo.groovygallerydesigns.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'woo.groovygallerydesigns.com',
        pathname: '/wp-content/uploads/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Sitemap configuration
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap',
        },
        {
          source: '/sitemap-:type.xml',
          destination: '/api/sitemap/:type',
        }
      ]
    };
  },
  // Ensure consistent trailing slashes
  trailingSlash: true,
  // Enable compression
  compress: true,
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/icons-material', '@mui/material'],
  },
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packagePath = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                return packagePath ? `npm.${packagePath[1].replace('@', '')}` : 'vendor';
              },
              chunks: 'all',
              minChunks: 1,
            },
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig