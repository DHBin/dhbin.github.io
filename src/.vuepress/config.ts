import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "HB技术栈",
      description: "博客",
    },
  },

  theme,
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
  // Enable it with pwa
  // shouldPrefetch: false,
});
