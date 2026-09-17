import type {NextConfig} from 'next';
const media = new URL(process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5050');
const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {root: __dirname},
  images: {remotePatterns: [{protocol:media.protocol === 'https:' ? 'https' : 'http',hostname:media.hostname,port:media.port,pathname:'/uploads/**'}]},
};
export default nextConfig;
