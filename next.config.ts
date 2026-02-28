import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js <Image> to serve from Vercel Blob's CDN hostname
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
