import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@pqina/pintura", 
    "@pqina/react-pintura",
    "filerobot-image-editor",
    "react-filerobot-image-editor"
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chatterbackend.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      }
    ]
  }
};

export default nextConfig;
