import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Edge often uses localhost while Chrome uses 127.0.0.1 — allow both in dev HMR.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default config;
