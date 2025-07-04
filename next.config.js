const { withNextVideo } = require('next-video/process')

module.exports = {
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['img.freepik.com', 'veterinaire-tour-hassan.com'],
    unoptimized: true,
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  env: {
    HOST_API: process.env.NEXT_PUBLIC_HOST_API,
    HOST_DOMAIN: process.env.NEXT_PUBLIC_HOST_DOMAIN,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};
