/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = (
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000"
    ).replace(/\/$/, "");

    return [
      {
        source: "/api/users/:path*",
        destination: `${backendUrl}/user/:path*`,
      },
      {
        source: "/api/shorten",
        destination: `${backendUrl}/shorten`,
      },
      {
        source: "/api/codes",
        destination: `${backendUrl}/codes`,
      },
      {
        source: "/api/urls/:id",
        destination: `${backendUrl}/:id`,
      },
    ];
  },
};

export default nextConfig;
