import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /* Prefer this repo as tracing root when multiple package-lock files exist on the machine */
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [{ source: "/products.html", destination: "/products", permanent: true }];
  },
};

export default nextConfig;
