---
date: 2023-03-31 10:33:00
category:
  - 其他
---



# 用Vuepress重构博客

原本使用`typecho`作为博客系统，最近服务器快到期了，调研了一下发现`vuepress`还不错，所以把博客迁移到了vuepress

## 前期准备

- 一个备案的域名
- github page：做静态页面托管
- github Discussions：评论
- cdn加速|存储：使用七牛云
- algolia：全文搜索
- picGo：图床上传工具
- typora：md编辑器，结合picGo一起使用，体验非常不错

## 架构

![架构](https://cdn.dhbin.cn/202303311119202.png)

