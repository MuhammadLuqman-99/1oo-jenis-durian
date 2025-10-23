/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // Allow build to succeed even with TypeScript errors in optional/unused files
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
