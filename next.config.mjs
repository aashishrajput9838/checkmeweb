/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['tesseract.js', 'pdf-parse-new', 'firebase-admin'],
}

export default nextConfig
// Triggering config refresh for auth fixes

