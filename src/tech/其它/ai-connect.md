---
date: 2024-11-05
category:
  - Project
tag:
  - Openai
  - Chatgpt
---

# 一个开源的chatgpt镜像|ai-connect  


新开发的一个小玩意，目前支持chatgpt镜像


<!--more-->

## 计划

- [ ] chatgpt
  - [x] 镜像基本功能
  - [ ] 会话隔离
  - [ ] 转发代理
- [ ] 管理面板
  - [ ] 基础用户管理
  - [ ] chatgpt token管理
  
- [ ] Claude
  - [ ] 镜像基本功能



项目地址：https://github.com/DHBin/ai-connect



## 使用

```shell
# 生成配置文件
cp example.json config.json
# 启动服务
ai-connect chatgpt --mirror
```



## 配置文件

```json
{
  "chatgpt": {
    "mirror": {
      "address": ":80",
      "tls": {
        "enabled": false,
        "key": "./tls/key.pem",
        "cert": "./tls/cert.pem"
      },
      "tokens": {
        "9090": "eyJhbGciOi"
      }
    }
  }
}
```

`tokens`: accessToken映射



例子：[https://oai.253282.xyz/?token=9090](https://oai.253282.xyz/?token=9090)



docker镜像：`ghcr.io/dhbin/ai-connect`

