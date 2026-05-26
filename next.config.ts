/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pics.avs.io',
      },
    ],
  },
};

module.exports = nextConfig;