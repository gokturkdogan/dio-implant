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
      {
        protocol: "https",
        hostname: "www.dioimplant.com",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "www.dioimplant.com",
        pathname: "/file/**",
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
      {
        source: "/digital-solutions/dio-navi/full-arch",
        destination: "/digital-solutions/full-arch",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
