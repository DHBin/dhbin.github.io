import { hopeTheme } from "vuepress-theme-hope";
import { blogNavbar } from "./navbar/index.js";
import { techSidebar } from "./sidebar/index.js";

export default hopeTheme({
  hostname: "https://dhbin.cn",

  author: {
    name: "DHB",
    url: "https://dhbin.cn",
  },

  iconAssets: "iconfont",

  logo: "/logo.png",

  repo: "dhbin/dhbin.cn",

  docsDir: "docs",

  blog: {},

  sidebarSorter: (infoA, infoB) => {
    // 先按类型排序
    let sortByType = infoA.type.localeCompare(infoB.type)
    if (sortByType != 0) {
      return sortByType
    }
    // 按标题排序
    return infoA.title.localeCompare(infoB.title)
  },

  locales: {
    /**
     * Chinese locale config
     */
    "/": {
      // navbar
      navbar: blogNavbar,

      // sidebar
      sidebar: techSidebar,

      footer: '<a href="https://beian.miit.gov.cn/" rel="noopener noreferrer" target="_blank">粤ICP备2021046732号</a>',

      displayFooter: true,

      blog: {
        description: "后端开发者<br><i>ClickHouse Contributor</i><br><i>Spring Cloud Alibaba Contributor</i>",
        intro: "/intro.html",
      },

      // page meta
      metaLocales: {
        editLink: "在 GitHub 上编辑此页",
      },
      editLink: false
    },
  },

  encrypt: {
    config: {

    },
  },

  plugins: {
    blog: true,

    comment: {
      provider: "Giscus",
      repo: "DHBin/dhbin.github.io",
      repoId: "R_kgDOJL_DyQ",
      category: "Announcements",
      categoryId: "DIC_kwDOJL_Dyc4CVB62",
      mapping: "og:title"
    },

    // all features are enabled for demo, only preserve features you need here
    mdEnhance: {
      align: true,
      attrs: true,
      chart: true,
      codetabs: true,
      demo: true,
      echarts: true,
      figure: true,
      flowchart: true,
      gfm: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      katex: true,
      mark: true,
      mermaid: true,
      playground: {
        presets: ["ts", "vue"],
      },
      revealJs: ["highlight", "math", "search", "notes", "zoom"],
      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      vPre: true,
      vuePlayground: true,
    },

    // uncomment these if you want a PWA
    // pwa: {
    //   favicon: "/favicon.ico",
    //   cacheHTML: true,
    //   cachePic: true,
    //   appendBase: true,
    //   apple: {
    //     icon: "/assets/icon/apple-icon-152.png",
    //     statusBarColor: "black",
    //   },
    //   msTile: {
    //     image: "/assets/icon/ms-icon-144.png",
    //     color: "#ffffff",
    //   },
    //   manifest: {
    //     icons: [
    //       {
    //         src: "/assets/icon/chrome-mask-512.png",
    //         sizes: "512x512",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-mask-192.png",
    //         sizes: "192x192",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //     ],
    //     shortcuts: [
    //       {
    //         name: "Demo",
    //         short_name: "Demo",
    //         url: "/demo/",
    //         icons: [
    //           {
    //             src: "/assets/icon/guide-maskable.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  },
});
