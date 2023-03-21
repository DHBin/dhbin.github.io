---
date: 2019-05-01 20:23:00
---

# Linux select实现socket单线程多路复用


select版本比阻塞版本的性能起码高了3倍+

```sh
# select版本
dhb@dev:~/下载/webbench-1.5$ webbench -c 1000 -t 30 http://127.0.0.1:1500/t
Webbench - Simple Web Benchmark 1.5
Copyright (c) Radim Kolar 1997-2004, GPL Open Source Software.

Benchmarking: GET http://127.0.0.1:1500/t
1000 clients, running 30 sec.

Speed=735248 pages/min, 269580 bytes/sec.
Requests: 367610 susceed, 14 failed.

# 阻塞版本
dhb@dev:~/下载/webbench-1.5$ webbench -c 1000 -t 30 http://127.0.0.1:1500/t
Webbench - Simple Web Benchmark 1.5
Copyright (c) Radim Kolar 1997-2004, GPL Open Source Software.

Benchmarking: GET http://127.0.0.1:1500/t
1000 clients, running 30 sec.

Speed=261244 pages/min, 95729 bytes/sec.
Requests: 130540 susceed, 82 failed.

```

# 代码

```c++
#include <iostream>
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netinet/in.h>


using namespace std;

#define BUFFER_SIZE 512
#define SEND_STR "HTTP/1.1 200 OK\r\n\r\nok"
#define BACKLOG 5

int get_line(int, char *, int);

int create_listen(int);

void handler(int, char *, char *);


/**********************************************************************/
/* Get a line from a socket, whether the line ends in a newline,
 * carriage return, or a CRLF combination.  Terminates the string read
 * with a null character.  If no newline indicator is found before the
 * end of the buffer, the string is terminated with a null.  If any of
 * the above three line terminators is read, the last character of the
 * string will be a linefeed and the string will be terminated with a
 * null character.
 * Parameters: the socket descriptor
 *             the buffer to save the data in
 *             the size of the buffer
 * Returns: the number of bytes stored (excluding null)
 * https://github.com/EZLippi/Tinyhttpd/blob/master/httpd.c
 * */
/**********************************************************************/
int get_line(int socket, char *buffer, int size) {
    int i = 0;
    char c = '\0';
    int n;

    while ((i < size - 1) && (c != '\n')) {
        /*
         * 当没有数据时这里会阻塞
         * */
        n = recv(socket, &c, 1, 0);
        /* DEBUG printf("%02X\n", c); */
        if (n > 0) {
            if (c == '\r') {
                n = recv(socket, &c, 1, MSG_PEEK);
                /* DEBUG printf("%02X\n", c); */
                if ((n > 0) && (c == '\n'))
                    recv(socket, &c, 1, 0);
                else
                    c = '\n';
            }
            buffer[i] = c;
            i++;
        } else
            c = '\n';
    }
    buffer[i] = '\0';
    return (i);
}


/**********************************************************************/
/*
 * 创建socket连接并监听，使用ipv4协议
 *
 * 参数:
 *      port 端口号
 * */
/**********************************************************************/
int create_listen(int port) {
    int server_fd;

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
    server_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);

    if (server_fd < 0) {
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
    server_addr.sin_port = htons(port);
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
    int bind_error;
    if ((bind_error = bind(server_fd, (struct sockaddr *) &server_addr, sizeof(server_addr))) < 0) {
        cout << "=> 绑定socket异常:" << bind_error << endl;
        close(server_fd);
        exit(1);
    }


    // 设置监听
    listen(server_fd, SOMAXCONN);
    return server_fd;
}

void handler(int client, char* key, char *buffer) {

    int len;
    int content_length = -1;
    char method[255];
    char url[255];
    /*
     * i： 数组偏移量
     * j： 行数偏移量
     * */
    size_t i, j;
    i = 0;

    /* 读取报文第一行 */
    len = get_line(client, buffer, BUFFER_SIZE);
    /*================== 解析请求方法 ==================*/
    while (!isspace(buffer[i]) && i < sizeof(method) - 1) {
        method[i] = buffer[i];
        i++;
    }
    j = i;
    method[i] = '\0';
    cout << "请求方法:" << method << endl;
    /*================== 解析请求方法 ==================*/


    /*================== 解析url ==================*/

    i = 0;
    /* 跳过空格 */
    while (isspace(buffer[j]) && (j < len))
        j++;

    while (!isspace(buffer[j]) && (i < sizeof(url) - 1) && (j < len)) {
        url[i] = buffer[j];
        i++;
        j++;
    }
    url[i] = '\0';
    cout << "URL：" << url << endl;
    /*================== 解析url ==================*/

    while ((len = get_line(client, buffer, BUFFER_SIZE))) {
        if (buffer[0] != '\n') {
            cout << buffer;
            /* 设置Content-Length:的长度，截断数组取Content-Length的值 */
            buffer[15] = '\0';
            if (strcasecmp(buffer, "Content-Length:") == 0) {
                char *stop;
                content_length = strtol(&(buffer[16]), &stop, 10);
            }
            memset(buffer, 0, len);
        } else {
            break;
        }
    }
    /*================== 解析请求数据 ==================*/
    // 置零，下面读取请求数据
    len = 0;
    if (content_length > 0) {
        do {
            int tmp = recv(client, buffer, BUFFER_SIZE, 0);
            len += tmp;
            cout << buffer << endl;
            memset(buffer, 0, tmp);
        } while (len != content_length);
    }
    /*================== 解析请求数据 ==================*/
    if (strcmp(key, url) == 0) {
        system("git pull");
    }
    send(client, SEND_STR, sizeof(SEND_STR), 0);
    close(client);
}


/**********************************************************************/
/*
 * 功能：监听端口，接收http协议，当url与参数2匹配时执行git pull
 *
 * 注：写这个程序主要是为了学习socket和http协议，进而了解tomcat的io模型
 *
 * 参数1： 端口号
 * 参数2： url地址
 * */
/**********************************************************************/
int main(int argc, char **argv) {
    int server_fd = create_listen(atoi(argv[1]));

    int max_socket = server_fd;
    struct sockaddr_in client_addr{};
    struct timeval tv{};
    socklen_t client_addr_len = sizeof(client_addr);
    int client;
    char buffer[BUFFER_SIZE];
    int connect_amount = 0;

    fd_set fd_read_set;
    int fd_set[BACKLOG] = { 0 };
    int ret;
    int tmp;
    while (true) {
        cout << "i running" << endl;
        FD_ZERO(&fd_read_set);
        FD_SET(server_fd, &fd_read_set);

        tv.tv_sec = 30;
        tv.tv_usec = 0;

        for (int i = 0; i < BACKLOG; ++i) {
            if (fd_set[i] != 0) {
                FD_SET(fd_set[i], &fd_read_set);
            }
        }


        ret = select(max_socket + 1, &fd_read_set, NULL, NULL, &tv);

        if (ret < 0) {
            cout << "select" << endl;
            break;
        } else if (ret == 0) {
            cout << "timeout" << endl;
            continue;
        }

        tmp = 0;
        for (int j = 0; j < connect_amount; ++j) {
            if (FD_ISSET(fd_set[j], &fd_read_set)) {
                handler(fd_set[j], argv[2], buffer);
                FD_CLR(fd_set[j], &fd_read_set);
                fd_set[j] = 0;
                tmp++;
            }
        }
        connect_amount -= tmp;


        if (FD_ISSET(server_fd, &fd_read_set)) {
            client = accept(server_fd, (struct sockaddr *) &client_addr, &client_addr_len);
            if (client <= 0) {
                cout << "=> accept 错误" << endl;
                continue;
            }

            if (connect_amount < BACKLOG) {
                fd_set[connect_amount++] = client;
                if (client > max_socket) {
                    max_socket = client;
                }
            }
        }

    }
}
```

# 分析

有空再写