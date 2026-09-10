/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2xsxph8kpxj0f.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'bydharmdemo-axccgqis.manus.space',
      },
      {
        protocol: 'https',
        hostname: 'files.manuscdn.com',
      },
    ],
  },
};

module.exports = nextConfig;
