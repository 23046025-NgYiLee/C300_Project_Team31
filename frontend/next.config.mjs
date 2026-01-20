/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Keep linting but ignore config warnings
  },
};

export default nextConfig;
