import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    nodeMiddleware: true,
    serverActions: true,
  },
  images: {
    domains: ['localhost', 'vercel.app']
  }
}

export default nextConfig