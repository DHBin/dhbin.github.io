---
date: 2019-11-16 10:38:00
---

# 使用Frp内网穿透rdp端口

# 工具

Frp是一个可用于内网穿透的高性能的反向代理应用，支持 tcp, udp 协议，为 http 和 https 应用协议提供了额外的能力，且尝试性支持了点对点穿透。

# 前提条件

- 一台有公网的服务器

# 方法

在frp的releases页面下载符合你的操作系统的包。我本地是Windows，云服务器是Linux。

## 服务端server

1. 编辑frps.ini

```
# frps.ini
[common]
bind_port = 7000
```

2. 启动frps

```sh
./frps -c ./frps.ini
```

输出日志如下就是正常的

```
2019/11/15 17:45:43 [I] [service.go:141] frps tcp listen on 0.0.0.0:7000
2019/11/15 17:45:43 [I] [root.go:205] start frps success
```

## 客户端client

我的电脑是Windows10，下载frp_x.xx.x_windows_amd64.zip

1. 编辑frpc.ini

```
# frpc.ini
[common]
# 修改成服务端Ip
server_addr = x.x.x.x
server_port = 7000

[rdp]
type = tcp
local_ip = 127.0.0.1
# 修改成RDP协议的端口,默认是3389
local_port = 3389
remote_port = 6000
```

2. 启动frpc

```
frpc.exe -c frpc.ini
```

这样就可以通过ip:remote_port远程了。自我感觉使用体验比向日葵和Termviwer还好

# 拓展

Frp不仅有这个的作用，更多看官方文档。

https://github.com/fatedier/frp/blob/master/README_zh.md