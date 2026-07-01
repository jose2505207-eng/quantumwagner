const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy.
 *
 * Shipped as **Report-Only** (see headers() below) because this legacy app relies
 * on Next's inline hydration/runtime scripts and the Solana wallet-adapter stack,
 * which would require a strict nonce pipeline to enforce safely. Report-Only lets
 * the policy be observed (and violations collected) without breaking the app;
 * flip the header name to `Content-Security-Policy` once inline scripts are
 * nonce'd. The rest of the security headers below ARE enforced.
 *
 * connect-src intentionally allows https:/wss: so Solana RPC endpoints and the
 * Pyth Hermes price oracle (both operator-configurable URLs) and wallet-adapter
 * websockets are reachable without hard-coding every provider origin.
 */
const csp = [
  "default-src 'self'",
  // Next injects inline bootstrap/hydration scripts; wallet adapters eval in dev.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // RPC (Solana), Pyth Hermes, wallet websockets — operator-configured origins.
  "connect-src 'self' https: wss:",
  // Wallet adapters open provider popups as separate windows, not frames; deny
  // framing of our own pages and disallow embedding untrusted frames.
  "frame-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

/** Security headers applied to every response (enforced), plus report-only CSP. */
const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Cross-origin isolation guards; keep resource sharing same-origin by default.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // HSTS only in production (never send it over plain HTTP / localhost).
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        // Apply security headers to every route (pages, assets, API).
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Type errors now FAIL the build (the project is type-clean as of this commit).
  // ESLint is still not enforced at build time because the legacy codebase has
  // pre-existing lint warnings; run `npm run lint` separately. Flip this off
  // once lint is clean.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // config options
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "shorturl.at",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
      },
    ],
  },
};

export default nextConfig;
