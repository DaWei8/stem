import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    config.output.webassemblyModuleFilename = isServer
      ? './../static/wasm/[modulehash].wasm'
      : 'static/wasm/[modulehash].wasm';

    return config;
  },
};

export default nextConfig;
