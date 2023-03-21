---
date: 2021-01-15 15:28:00
---

# 简单几步！Windows下Clion结合docker调试openjdk8源码

> 废话不多说，开干！

原理是通过Docker编译openjdk，然后结合clion通过gdbserver远程调试

##  环境需求

- Clion
- Docker

我测试的版本

Docker for windows : `Docker version 20.10.2, build 2291f61`

Clion : `2020.3.1`

#  构建镜像

```bash
git clone https://e.coding.net/javalistcn/openjdk/build-openjdk-8.git
cd  build-openjdk-8
docker build -t build-openjdk-8 .
```

##  运行

```bash
docker run -it --name build-openjdk-8 -p 1234:1234 build-openjdk-8
```

> 1234端口用于gdbserver 这个非常重要！！！

##  编译

进入到容器后执行

```bash
cd jdk-jdk8-b120/

# 删除adjust-mflags.sh的67行，不然编译会报错
sed -i '67d' hotspot/make/linux/makefiles/adjust-mflags.sh

bash ./configure --with-target-bits=64 --with-debug-level=slowdebug --enable-debug-symbols --with-boot-jdk=/openjdk/java-se-7u75-ri --with-freetype-include=/usr/include/freetype2/ --with-freetype-lib=/usr/lib/x86_64-linux-gnu ZIP_DEBUGINFO_FILES=0
```

正常输出

```
====================================================
A new configuration has been successfully created in
/openjdk/jdk-jdk8-b120/build/linux-x86_64-normal-server-slowdebug
using configure arguments '--with-target-bits=64 --with-debug-level=slowdebug --enable-debug-symbols --with-boot-jdk=/openjdk/java-se-7u75-ri --with-freetype-include=/usr/include/freetype2/ --with-freetype-lib=/usr/lib/x86_64-linux-gnu ZIP_DEBUGINFO_FILES=0'.

Configuration summary:
* Debug level:    slowdebug
* JDK variant:    normal
* JVM variants:   server
* OpenJDK target: OS: linux, CPU architecture: x86, address length: 64

Tools summary:
* Boot JDK:       openjdk version "1.7.0_75" OpenJDK Runtime Environment (build 1.7.0_75-b13) OpenJDK 64-Bit Server VM (build 24.75-b04, mixed mode)  (at /openjdk/java-se-7u75-ri)
* C Compiler:     gcc-5 (Ubuntu 5.4.0-6ubuntu1~16.04.12) 5.4.0 version 20160609 (at /usr/bin/gcc-5)
* C++ Compiler:   g++-5 (Ubuntu 5.4.0-6ubuntu1~16.04.12) 5.4.0 version 20160609 (at /usr/bin/g++-5)

Build performance summary:
* Cores to use:   4
* Memory limit:   12698 MB
* ccache status:  not installed (consider installing)

Build performance tip: ccache gives a tremendous speedup for C++ recompilations.
You do not have ccache installed. Try installing it.
You might be able to fix this by running 'sudo apt-get install ccache'.
```

```bash
make all DISABLE_HOTSPOT_OS_VERSION_CHECK=OK ZIP_DEBUGINFO_FILES=0
```

一杯咖啡时间过后看到一下内容输出就大功告成了。

```
----- Build times -------
Start 2021-01-15 00:57:13
End   2021-01-15 01:05:57
00:00:27 corba
00:00:14 demos
00:01:40 docs
00:02:15 hotspot
00:00:18 images
00:00:17 jaxp
00:00:20 jaxws
00:02:31 jdk
00:00:30 langtools
00:00:12 nashorn
00:08:44 TOTAL
-------------------------
Finished building OpenJDK for target 'all'
```

## Clion配置

把`jdk-jdk8-b120.tar.gz`解压，用clion打开项目（open -> 选择jdk-jdk8-b120目录）

添加GDB Remote Debug配置如下图

![](https://imgkr2.cn-bj.ufileos.com/802200f7-8207-4a14-bb60-b9c25f034761.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=RNqVlvKrjJ0USEtSwsPaZj5kIw8%253D&Expires=1610773857)

进入容器，cd到`/openjdk/jdk-jdk8-b120/build/linux-x86_64-normal-server-slowdebug/jdk/bin`，执行`gdbserver`

```bash
gdbserver :1234 ./java
```

正常输出

```
Process ./java created; pid = 5642
Listening on port 1234
```

下一步
![](https://imgkr2.cn-bj.ufileos.com/11fa784a-fd90-4f93-abed-fe619a65d6cc.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&Signature=S%252BrRHBbHdxm3cjs8U7ypLT4x7Og%253D&Expires=1610773856)


等待一会儿，程序就停在断点上了。

![](https://static01.imgkr.com/temp/381539d2acf34a07a0127584264b0396.png)


后面的操作就和idea一样了，但是如果没了解过gdb的可以找找资料学习下。

## 总结

### 步骤
```
1. git clone https://e.coding.net/javalistcn/openjdk/build-openjdk-8.git
2. cd  build-openjdk-8
3. docker build -t build-openjdk-8 .
4. cd jdk-jdk8-b120/
5. sed -i '67d' hotspot/make/linux/makefiles/adjust-mflags.sh
6. bash ./configure --with-target-bits=64 --with-debug-level=slowdebug --enable-debug-symbols --with-boot-jdk=/openjdk/java-se-7u75-ri --with-freetype-include=/usr/include/freetype2/ --with-freetype-lib=/usr/lib/x86_64-linux-gnu ZIP_DEBUGINFO_FILES=0
7. make all DISABLE_HOTSPOT_OS_VERSION_CHECK=OK ZIP_DEBUGINFO_FILES=0
8. 配置clion
9. 运行gdbserver
```

![](https://image-static.segmentfault.com/235/214/2352149115-600132dbe57c7)
