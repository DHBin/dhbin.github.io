---
date: 2018-09-20 10:25:00
---

# 解决Nginx出现forbidden (13: Permission denied)

Nginx访问目录时报Permission denied权限不足

```sh
xxxxx is forbidden (13: Permission denied), client: xxxx
```

# 解决方法

1. 打开Nginx配置文件

   ```sh
   $ vim /etc/nginx/nginx.conf
   ```

2. 修改user

   ```nginx
   #user www-data;
   user root;
   worker_processes auto;
   pid /run/nginx.pid;
   ```

3. 重载Nginx

   ```sh
   $ nginx -s reload
   ```

