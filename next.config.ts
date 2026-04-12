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
        source: "/favicon.ico",
        destination:
          "https://res.cloudinary.com/drjz8v617/image/upload/w_32,h_32,c_pad,f_png,q_auto/dio-logo-original.webp",
        permanent: false,
      },
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
      {
        source: "/katalog",
        destination: "/kataloglar",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
