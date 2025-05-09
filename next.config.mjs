/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  
  // For production, we want to enable these checks
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Image optimization
  images: {
    domains: ['mutatio.dev'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  
  // CSS handling
  transpilePackages: ['next'],
  webpack: (config) => {
    // Ensure CSS modules work properly
    const cssRule = config.module.rules.find(rule => 
      rule.test && rule.test.toString().includes('.css')
    );
    
    if (cssRule) {
      const cssModuleRule = cssRule.oneOf?.find(rule => 
        rule.use && Array.isArray(rule.use) && 
        rule.use.some(u => u.loader && u.loader.includes('css-loader'))
      );
      
      if (cssModuleRule && cssModuleRule.use) {
        const cssLoader = cssModuleRule.use.find(u => u.loader && u.loader.includes('css-loader'));
        if (cssLoader && cssLoader.options) {
          // Ensure CSS modules are enabled
          cssLoader.options.modules = {
            ...cssLoader.options.modules,
            auto: true
          };
        }
      }
    }
    
    return config;
  }
}

export default nextConfig
