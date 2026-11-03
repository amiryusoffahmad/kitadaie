/** @type {import('next').NextConfig} */
import withPWA from "next-pwa";
import defaultRuntimeCaching from "next-pwa/cache.js";

const nextConfig = {
  serverExternalPackages: ["knex"],
  // Configure environment variables for the upload API
  env: {
    NEXT_PUBLIC_UPLOAD_API_URL:
      process.env.NODE_ENV === "production"
        ? "https://upload.kitadaie.com"
        : "http://localhost:4000",
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "upload.kitadaie.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  // output: "standalone",
  // trailingSlash: false,
  // assetPrefix:
  //   process.env.NODE_ENV === "production" ? "https://dev.kitadaie.com" : "",
  // api: {
  //   bodyParser: {
  //     sizeLimit: "10mb", // Set the maximum body size for API routes
  //   },
  //   responseLimit: false,
  // },
};

// Apply PWA configuration
const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable in development
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Do not persist personalized content or admin drafts in the service worker.
      urlPattern: ({ url }) => /^\/(?:api\/(?:auth|content|admin\/content)|sign-in|articles|bulletin|admin-content)(?:\/|$)/.test(url.pathname),
      handler: 'NetworkOnly',
    },
    ...defaultRuntimeCaching,
  ],
});

export default pwaConfig(nextConfig);
