---
date: 2019-04-30 16:44:00
category:
  - 网络
tag:
 - Linux
 - Socket
 - IO
---

# Linux socket笔记

linux socket创建tcp连接例子

# 代码

```c++
#include <iostream>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netinet/in.h>


using namespace std;

int main() {
    int client;

    /*
     * socket函数的方法签名
     * int socket (int __family, int __type, int __protocol)
     * __family     定义协议族
     * __type       定义数据传输方式/套接字类型
     * __protocol   定义传输协议
     *
     * 返回值是文件描述符
     *
     * */
    client = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);

    if (client < 0) {
        cout << "=> 连接失败" << endl;
    }

    /*
    * 位于netinet/in.h
    * 将套接字和IP、端口判断
    *
    * */
    struct sockaddr_in server_addr{};
    // 使用IPv4
    server_addr.sin_family = AF_INET;
    // 端口
    server_addr.sin_port = htons(1500);
    // IP地址
    server_addr.sin_addr.s_addr = htons(INADDR_ANY);

    /*
     * struct sockaddr* 位于socket.h
     * bind()签名
     * int bind (int, const struct sockaddr *__my_addr, socklen_t __addrlen);
     * 第一个参数：socket文件描述符
     * 第二个参数：struct sockaddr*
     * 第三个参数：struct sockaddr* 长度
     * */
    if (bind(client, (struct sockaddr *) &server_addr, sizeof(server_addr)) < 0) {
        cout << "=> 绑定socket异常" << endl;
        exit(1);
    }


    // 设置监听
    listen(client, SOMAXCONN);

    struct sockaddr_in client_addr{};
    socklen_t client_addr_len = sizeof(client_addr);
    int server;
    while (true) {
        server = accept(client, (struct sockaddr *) &client_addr, &client_addr_len);

        if (server < 0) {
            cout << "=> accept 错误" << endl;
            exit(1);
        }
        // todo 写怎么接收数据
    }
}
```

# 资料

[Socket入门资料](http://c.biancheng.net/view/2123.html)

[Linux_socket编程入门（C++）](https://www.jianshu.com/p/676506ad2057)

[C 实现一个简易的Http服务器](https://www.cnblogs.com/life2refuel/p/5277111.html)

[Tinyhttpd源码](https://github.com/EZLippi/Tinyhttpd)

