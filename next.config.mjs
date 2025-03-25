/** @type {import('next').NextConfig} */
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

export default nextConfig;
