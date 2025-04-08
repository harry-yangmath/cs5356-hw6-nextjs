import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', 'vercel.app']
    }
  },
  images: {
    domains: ['localhost', 'vercel.app']
  }
}

export default nextConfig