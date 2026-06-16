/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow accessing the dev server via these origins (e.g. when using 127.0.0.1 or LAN IP).
  allowedDevOrigins: ["127.0.0.1", "localhost", "10.35.184.21"],
};

export default nextConfig;
