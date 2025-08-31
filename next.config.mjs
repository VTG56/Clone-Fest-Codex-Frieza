/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // top-level
  output: 'export',      // top-level
  images: {
    unoptimized: true,   // only image-specific configs go here
  },
};

export default nextConfig;
