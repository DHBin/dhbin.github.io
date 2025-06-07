import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  head: [
    [
      "script",
      {
        async: true,
        crossorigin: "anonymous",
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9257985378957520",
      },
    ],
  ],

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
