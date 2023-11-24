---
date: 2023-11-24 10:21:00
category:
- Java
tag:
  - Arthas
---


# arthas特殊用法

官方issue中提供的特殊用法：https://github.com/alibaba/arthas/issues/71

idea插件：[arthas idea](https://plugins.jetbrains.com/plugin/13581-arthas-idea)

<!--more-->

## mvc项目获取spring配置

```
watch org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter invokeHandlerMethod '{target.getApplicationContext().getEnvironment().getProperty("spring.datasource.url")}'  -n 5  -x 3
```

## feign获取请求url

```
watch feign.Client$Default execute '{params,returnObj,throwExp}'  -n 5  -x 3 
```