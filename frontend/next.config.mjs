/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/users/:path*",
        destination: "http://localhost:8000/user/:path*",
      },
      {
        source: "/api/shorten",
        destination: "http://localhost:8000/shorten",
      },
      {
        source: "/api/codes",
        destination: "http://localhost:8000/codes",
      },
    ];
  },
};

export default nextConfig;

