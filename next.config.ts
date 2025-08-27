import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Note: redirects() doesn't work with output: 'export'
  // Production redirects are handled by public/_redirects (Netlify)
  // Development fallback is handled by not-found.tsx
};

export default nextConfig;
