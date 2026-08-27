import type { StorybookConfig } from "@storybook/nextjs-vite";
import { mergeConfig } from "vite";
import svgr from "vite-plugin-svgr"; // <-- import the plugin
import path from "path";
import { fileURLToPath } from "url";

// eslint-disable-next-line no-restricted-globals
const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y"
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public", "../src/assets", "./public"],
  // @ts-ignore
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [svgr()],
      resolve: {
        alias: {
          '@styles': path.resolve(dirname, '../src/styles'),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            includePaths: [path.resolve(dirname, '../src/styles')],
            additionalData: `@use "@styles/global.scss" as *;`
          },
        },
      },
    });
  },
};

export default config;
