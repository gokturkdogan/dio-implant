import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/drjz8v617/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/kurumsal/hakkimizda",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
