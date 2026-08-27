import type { NextConfig } from 'next';
import path from 'path';
import dotenv from 'dotenv';

function loadEnv() {
  const env = process.env.ENV?.toLocaleLowerCase() ?? 'local';
  const envFile = `./.env.${env}`;
  const result = dotenv.config({ path: envFile, override: true });

  const status = result.error ? `⚠  ${result.error.message}` : `✓  loaded ${envFile}`;
  const variableCount = Object.keys(result.parsed ?? {}).length;
  console.log(`\n[next.config] env\n${status} (${variableCount} variables)\n`);
}

loadEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['leadertools.local', 'cdc-login.gsusa.local'],
  serverExternalPackages: ['ioredis'],
  images: {
    loaderFile: './src/lib/imageLoader.ts',
  },
  env: {
    BUILD_DATE: new Date().toISOString(),
  },
  sassOptions: {
    loadPaths: [path.join(process.cwd(), 'src', 'styles')],
    includePaths: [path.join(process.cwd(), 'src', 'styles')],
    additionalData: `@use "global" as *;`,
  },
  turbopack: {},
};

export default nextConfig;
