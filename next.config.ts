import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Profile Pictures
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub Profile Pictures
      },
    ],
  },
  serverExternalPackages: ['yt-search', 'cheerio'],
};

export default nextConfig;
