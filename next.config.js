/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // This tells Next.js it's okay to load images from your Supabase storage
    // and from placeholder websites.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        // IMPORTANT: Replace this with your actual Supabase project reference ID
        protocol: 'https',
        hostname: 'YOUR_SUPABASE_ID.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
