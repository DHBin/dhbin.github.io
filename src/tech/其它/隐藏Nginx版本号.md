---
date: 2018-09-18 11:23:00
tag:
 - Nginx
---

# 隐藏Nginx版本号

默认情况下，Nginx会在头信息中加入nginx的版本号，这样会暴露安全性的问题

# 关闭

打开Nginx的配置文件

```sh
$ vim /etc/nginx/nginx.conf
```

加入

```
server_tokens off;
```

