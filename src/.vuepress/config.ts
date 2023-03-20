import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "DHB",
      description: "博客",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
