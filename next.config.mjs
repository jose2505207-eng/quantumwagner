/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
