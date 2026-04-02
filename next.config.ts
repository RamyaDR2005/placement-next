import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for bare-metal / Docker deployment
  output: "standalone",

  // Move serverComponentsExternalPackages to the correct location
  serverExternalPackages: ["nodemailer", "@prisma/client", "@aws-sdk/client-s3"],

  // Image optimization — allow any https source (covers R2, CDN, Google avatars)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // Performance
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
