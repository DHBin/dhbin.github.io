---
date: 2019-07-03 23:31:00
---

# Ubuntu安装Nginx-源码编译方式

1.77.1 http://nginx.org/download/nginx-1.17.1.tar.gz

## 下载

```sh
$ weget http://nginx.org/download/nginx-1.17.1.tar.gz
```

## 解压

```sh
$ tar -zxvf nginx-1.17.1.tar.gz
```

## 安装

```
$ ./configure
```

如果出现下面报错

```
checking for PCRE library ... not found
checking for PCRE library in /usr/local/ ... not found
checking for PCRE library in /usr/include/pcre/ ... not found
checking for PCRE library in /usr/pkg/ ... not found
checking for PCRE library in /opt/local/ ... not found
```

安装pcre依赖

```sh
$ wget https://nchc.dl.sourceforge.net/project/pcre/pcre/8.43/pcre-8.43.tar.gz

$ cd pcre-8.43

$ ./configure
# 编译
$ make
# 安装
$ make install
```

安装zlib

```sh
$ sudo apt install zlib1g-dev
```

## 错误记录

```
./nginx: error while loading shared libraries: libpcre.so.1: cannot open shared object file: No such file or directory
```

解决方法：

```sh
$ ln -s /usr/local/lib/libpcre.so.1 /lib/x86_64-linux-gnu/
```