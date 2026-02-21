/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
}
module.exports = nextConfig
