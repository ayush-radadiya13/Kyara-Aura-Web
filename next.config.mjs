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
    ],
  },
};

export default nextConfig;
