import { defineUserConfig } from "vuepress";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
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
  plugins: [
    docsearchPlugin({
      appId: 'OZEIJ2LCLA',
      apiKey: 'f9a056d506baba509dc762fd42407c3a',
      indexName: 'dhbin',
    })
  ]
  // Enable it with pwa
  // shouldPrefetch: false,
});
