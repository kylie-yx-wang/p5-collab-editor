import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['yjs', 'lib0', 'y-websocket'],
  /* config options here */
};

export default nextConfig;
