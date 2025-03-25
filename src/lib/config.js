// Configuration settings for the application
const config = {
  // Upload API endpoint - uses the environment variable from next.config.mjs
  uploadApiUrl:
    process.env.NEXT_PUBLIC_UPLOAD_API_URL || "http://localhost:4000",

  // Other configuration settings can be added here
};

export default config;
