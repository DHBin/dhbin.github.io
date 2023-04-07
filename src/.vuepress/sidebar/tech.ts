import { sidebar } from "vuepress-theme-hope";

export const techSidebar = sidebar({
  "/tech/": [
    "",
    {
      text: "Java",
      prefix: "java",
      collapsible: true,
      children: "structure"
    },
    {
      text: "Redis",
      prefix: "redis",
      collapsible: true,
      children: "structure"
    },
    {
      text: "Linux",
      prefix: "linux",
      collapsible: true,
      children: "structure"
    },
    {
      text: "Clickhouse",
      prefix: "clickhouse",
      collapsible: true,
      children: "structure"
    },
    {
      text: "网络",
      prefix: "网络",
      collapsible: true,
      children: "structure"
    },
    {
      text: "其它",
      prefix: "其它",
      collapsible: true,
      children: "structure"
    }
  ],
  "/": [],
});
