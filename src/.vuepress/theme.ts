import { hopeTheme } from "vuepress-theme-hope";
import { blogNavbar } from "./navbar/index.js";
import { techSidebar } from "./sidebar/index.js";

export default hopeTheme({
  hostname: "https://dhbin.cn",

  author: {
    name: "DHB",
    url: "https://dhbin.cn",
  },

  iconAssets: "iconify",

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

      footer: '<a href="https://beian.miit.gov.cn/" rel="noopener noreferrer" target="_blank">粤ICP备2021046732号</a> | <a href="https://linux.do/?source=dhbin_cn" rel="noopener noreferrer" target="_blank">LinuxDo 新的理想型社区</a>',

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

    docsearch: {
      appId: 'OZEIJ2LCLA',
      apiKey: 'f9a056d506baba509dc762fd42407c3a',
      indexName: 'dhbin',
    },
  },
});
