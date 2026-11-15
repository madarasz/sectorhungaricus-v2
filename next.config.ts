import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // E2E tests build into a separate directory, so the build does not break a running `next dev`
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Note: redirects() doesn't work with output: 'export'
  // Production redirects are handled by public/_redirects (Netlify)
  // Development fallback is handled by not-found.tsx
};

export default nextConfig;
