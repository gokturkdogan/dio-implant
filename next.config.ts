import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["turkey-map-react"],
  images: {
    // Görseller Cloudinary'de boyutlandırılır (bkz. lib/image-loader.ts).
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
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
      // /favicon.ico artık public/favicon.ico olarak statik sunuluyor (fonksiyon çalışmaz).
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
