/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,
  
  // Optimize build performance
  swcMinify: true,
  
  // Experimental features for better performance
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,
    
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/accordion',
      '@radix-ui/alert-dialog',
      '@radix-ui/aspect-ratio',
      '@radix-ui/avatar',
      '@radix-ui/checkbox',
      '@radix-ui/collapsible',
      '@radix-ui/context-menu',
      '@radix-ui/dialog',
      '@radix-ui/dropdown-menu',
      '@radix-ui/hover-card',
      '@radix-ui/label',
      '@radix-ui/menubar',
      '@radix-ui/navigation-menu',
      '@radix-ui/popover',
      '@radix-ui/progress',
      '@radix-ui/radio-group',
      '@radix-ui/scroll-area',
      '@radix-ui/select',
      '@radix-ui/separator',
      '@radix-ui/slider',
      '@radix-ui/switch',
      '@radix-ui/tabs',
      '@radix-ui/toast',
      '@radix-ui/toggle',
      '@radix-ui/tooltip',
      'date-fns',
      'react-hook-form',
      'axios',
      'formik',
      'yup',
      'recharts',
      'lodash'
    ],
    
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    
    // Parallel routes for better performance
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    domains: [
      'localhost',
      'pmcs.site',
      'api.pmcs.site'
    ],
    // Use sharp for better image optimization
    sharp: process.env.NODE_ENV === 'production',
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      }
    ];
  },
  
  // Rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://pmcs.site'}/api/:path*`,
      }
    ];
  },
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
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
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([[\\/]|$)/
                )[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
  
  // Compression
  compress: true,
  
  // Generate source maps only in development
  productionBrowserSourceMaps: false,
  
  // Output configuration
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    // Don't fail build on TypeScript errors in production
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // ESLint configuration
  eslint: {
    // Don't run ESLint during production builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
