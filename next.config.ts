import type { NextConfig } from "next";

/**
 * Security headers live here rather than in `vercel.json` so they apply on any
 * host and are testable with `next dev`. Platform-only settings (deploy region)
 * stay in `vercel.json`.
 *
 * No `Content-Security-Policy` yet: the pre-paint theme script in the root
 * layout is inline, so a strict policy needs a per-request nonce and middleware.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },
};

export default nextConfig;
