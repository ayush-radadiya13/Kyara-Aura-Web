/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "kayraaura.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "kayraaura.up.railway.app",
      },
      {
        protocol: "http",
        hostname: "web-production-c0abc.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "web-production-c0abc.up.railway.app",
      },
    ],
  },
};

export default nextConfig;
