import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@goldpulse/database', '@goldpulse/crawler', '@goldpulse/types'],
};

export default nextConfig;

