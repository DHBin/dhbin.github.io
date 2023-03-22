---
date: 2019-01-09 13:25:00
tag:
 - Maven
---

# utuntu 18.04.1安装maven记录

# 下载

在官网下载maven



地址：http://maven.apache.org/download.cgi



下面以apache-maven-3.6.0-bin.tar.gz为例



# 解压与移动目录

1. 解压

```sh
tar zxvf apache-maven-3.6.0-bin.tar.gz
```

2. 移动

我个人习惯把软件放在/opt目录下

```sh
sudo mv apache-maven-3.6.0 /opt
```



# 配置环境

> 在这里复习下linux的知识，在用户目录下的.bashrc文件是仅当前用户可见的，而/etc/profile是所有用户都可见。



```sh
vim ~/.bashrc
```

在最后加入

```shell
export PATH=/opt/apache-maven-3.6.0/bin:$PATH
```

然后执行下面命令，使配置信息生效

```shell
source ~/.bashrc
```



# 测试

执行

```shell
mvn -v
```

输出以下内容则正常

```
Apache Maven 3.6.0 (97c98ec64a1fdfee7767ce5ffb20918da4f719f3; 2018-10-25T02:41:47+08:00)
Maven home: /opt/apache-maven-3.6.0
Java version: 10.0.2, vendor: Oracle Corporation, runtime: /usr/lib/jvm/java-11-openjdk-amd64
Default locale: zh_CN, platform encoding: UTF-8
OS name: "linux", version: "4.15.0-42-generic", arch: "amd64", family: "unix"
```

# 个性化

以下内容全部是修改apache-maven-3.6.0/conf/settings.xml文件



> 切换源

在国情下，自带的源可能会有连接不上的情况，所以切换回国内的比较好，而且比较快。



找到mirrors标签在中间加入

```xml
<mirror>
	<id>AliMaven</id>
	<name>aliyun maven</name>
	<url>http://maven.aliyun.com/nexus/content/groups/public/</url>
	<mirrorOf>central</mirrorOf>        
</mirror>
```



> 修改本地仓库位置

修改localRepository标签



我修改到用户目录下的maven/repository



当目录不存在时，执行以下命令创建（主要是我想记住-p 多级目录参数）

```shell
mkdir -p ~/maven/repository
```

然后在settings.xml中修改localRepository为

```xml
<localRepository>${user.home}/maven/respository</localRepository>
```
