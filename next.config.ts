import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/studio",
        destination: "/studio/structure/plattform",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
