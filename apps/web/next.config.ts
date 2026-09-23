import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@goldpulse/database', '@goldpulse/crawler', '@goldpulse/types'],
  webpack: (config) => {
    // Vô hiệu hóa resolve symlinks để tránh lỗi readlink EINVAL trên Windows / OneDrive
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
