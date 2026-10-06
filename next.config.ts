import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  // 静态导出没有图片优化服务：用自定义 loader 从构建前生成的宽度变体里挑图（见 lib/image-loader.ts）。
  images: { loader: "custom", loaderFile: "./lib/image-loader.ts" },
  trailingSlash: true,
  // Edge often uses localhost while Chrome uses 127.0.0.1 — allow both in dev HMR.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default config;
