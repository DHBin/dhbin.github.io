---
date: 2019-01-09 13:31:00
category:
  - Java
tag:
 - Spring
 - 源码
---

# Spring Boot源码编译

Spring Boot源码编译

# fork spring boot[可选]

我fork一个Spring boot到自己的github上，主要是为了把阅读源码时添加的一些注释push上去，所以这一步是可选的。



# clone spring boot

1、把Spring boot源码克隆下来

```sh
git clone https://github.com/DHBin/spring-boot.git
```

官方地址是https://github.com/spring-projects/spring-boot

2、同步2.1.x分支

```sh
git checkout -b 2.1.x origin/2.1.x
```

为了不污染原来的版本，创建新的分支

```shell
git checkout -b 2.1.x_learn
```

上传GitHub

```sh
git push origin HEAD -u
```

期间可能需要登录GitHub账号，出现一下信息证明分支创建成功

```
Total 0 (delta 0), reused 0 (delta 0)
remote:
remote: Create a pull request for '2.1.x_learn' on GitHub by visiting:
remote:      https://github.com/DHBin/spring-boot/pull/new/2.1.x_learn
remote:
To https://github.com/DHBin/spring-boot.git
 * [new branch]            HEAD -> 2.1.x_learn
Branch '2.1.x_learn' set up to track remote branch '2.1.x_learn' from 'origin'.
```

# 编译

前期准备

- 下载maven并配置好环境，切换国内源



执行命令

```sh
mvn -Dmaven.test.skip=true -Dmaven.compile.fork=true -Dmaven.test.failure.ignore=true clean install
```



- -Dmaven.test.skip=true           跳过测试
- -Dmaven.compile.fork             多线程
- -Dmaven.test.failure.ignore      忽略测试错误



如果没有意外编译就成功了



# 遇到问题



1. 编译spring-boot-gradle-plugin时执行一些测试用例，导致报错。

   解决方法：

   ```sh
   rm -rf spring-boot-project/spring-boot-tools/spring-boot-gradle-plugin/src/test/java
   ```

   再编译，编译成功后执行

   ```sh
   git checkout spring-boot-project/spring-boot-tools/spring-boot-gradle-plugin/src/test/java
   ```

   恢复



# 参考资料

[IDEA 编译运行 Spring Boot 2.0 源码](https://my.oschina.net/dabird/blog/1942112)
