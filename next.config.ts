import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright", "playwright-core"],
  images: {
    remotePatterns: [
      // Woolworths product CDN
      { protocol: "https", hostname: "cdn0.woolworths.media" },
      { protocol: "https", hostname: "cdn1.woolworths.media" },
      // ALDI Adobe Scene7 CDN
      { protocol: "https", hostname: "dm.apac.cms.aldi.cx" },
      // IGA / Metcash CDN
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "metcash.com" },
      { protocol: "https", hostname: "**.igashop.com.au" },
      { protocol: "https", hostname: "**.metcash.com" },
    ],
  },
};

export default nextConfig;
