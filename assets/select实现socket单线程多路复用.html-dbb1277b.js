import{_ as n,W as i,X as e,a0 as s}from"./framework-5f3abea5.js";const l={},d=s(`<h1 id="linux-select实现socket单线程多路复用" tabindex="-1"><a class="header-anchor" href="#linux-select实现socket单线程多路复用" aria-hidden="true">#</a> Linux select实现socket单线程多路复用</h1><p>select版本比阻塞版本的性能起码高了3倍+</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># select版本</span>
dhb@dev:~/下载/webbench-1.5$ webbench <span class="token parameter variable">-c</span> <span class="token number">1000</span> <span class="token parameter variable">-t</span> <span class="token number">30</span> http://127.0.0.1:1500/t
Webbench - Simple Web Benchmark <span class="token number">1.5</span>
Copyright <span class="token punctuation">(</span>c<span class="token punctuation">)</span> Radim Kolar <span class="token number">1997</span>-2004, GPL Open Source Software.

Benchmarking: GET http://127.0.0.1:1500/t
<span class="token number">1000</span> clients, running <span class="token number">30</span> sec.

<span class="token assign-left variable">Speed</span><span class="token operator">=</span><span class="token number">735248</span> pages/min, <span class="token number">269580</span> bytes/sec.
Requests: <span class="token number">367610</span> susceed, <span class="token number">14</span> failed.

<span class="token comment"># 阻塞版本</span>
dhb@dev:~/下载/webbench-1.5$ webbench <span class="token parameter variable">-c</span> <span class="token number">1000</span> <span class="token parameter variable">-t</span> <span class="token number">30</span> http://127.0.0.1:1500/t
Webbench - Simple Web Benchmark <span class="token number">1.5</span>
Copyright <span class="token punctuation">(</span>c<span class="token punctuation">)</span> Radim Kolar <span class="token number">1997</span>-2004, GPL Open Source Software.

Benchmarking: GET http://127.0.0.1:1500/t
<span class="token number">1000</span> clients, running <span class="token number">30</span> sec.

<span class="token assign-left variable">Speed</span><span class="token operator">=</span><span class="token number">261244</span> pages/min, <span class="token number">95729</span> bytes/sec.
Requests: <span class="token number">130540</span> susceed, <span class="token number">82</span> failed.

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="代码" tabindex="-1"><a class="header-anchor" href="#代码" aria-hidden="true">#</a> 代码</h1><div class="language-c++ line-numbers-mode" data-ext="c++"><pre class="language-c++"><code>#include &lt;iostream&gt;
#include &lt;cstdio&gt;
#include &lt;cstring&gt;
#include &lt;cstdlib&gt;
#include &lt;unistd.h&gt;
#include &lt;arpa/inet.h&gt;
#include &lt;sys/socket.h&gt;
#include &lt;netinet/in.h&gt;


using namespace std;

#define BUFFER_SIZE 512
#define SEND_STR &quot;HTTP/1.1 200 OK\\r\\n\\r\\nok&quot;
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
    char c = &#39;\\0&#39;;
    int n;

    while ((i &lt; size - 1) &amp;&amp; (c != &#39;\\n&#39;)) {
        /*
         * 当没有数据时这里会阻塞
         * */
        n = recv(socket, &amp;c, 1, 0);
        /* DEBUG printf(&quot;%02X\\n&quot;, c); */
        if (n &gt; 0) {
            if (c == &#39;\\r&#39;) {
                n = recv(socket, &amp;c, 1, MSG_PEEK);
                /* DEBUG printf(&quot;%02X\\n&quot;, c); */
                if ((n &gt; 0) &amp;&amp; (c == &#39;\\n&#39;))
                    recv(socket, &amp;c, 1, 0);
                else
                    c = &#39;\\n&#39;;
            }
            buffer[i] = c;
            i++;
        } else
            c = &#39;\\n&#39;;
    }
    buffer[i] = &#39;\\0&#39;;
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

    if (server_fd &lt; 0) {
        cout &lt;&lt; &quot;=&gt; 连接失败&quot; &lt;&lt; endl;
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
    if ((bind_error = bind(server_fd, (struct sockaddr *) &amp;server_addr, sizeof(server_addr))) &lt; 0) {
        cout &lt;&lt; &quot;=&gt; 绑定socket异常:&quot; &lt;&lt; bind_error &lt;&lt; endl;
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
    while (!isspace(buffer[i]) &amp;&amp; i &lt; sizeof(method) - 1) {
        method[i] = buffer[i];
        i++;
    }
    j = i;
    method[i] = &#39;\\0&#39;;
    cout &lt;&lt; &quot;请求方法:&quot; &lt;&lt; method &lt;&lt; endl;
    /*================== 解析请求方法 ==================*/


    /*================== 解析url ==================*/

    i = 0;
    /* 跳过空格 */
    while (isspace(buffer[j]) &amp;&amp; (j &lt; len))
        j++;

    while (!isspace(buffer[j]) &amp;&amp; (i &lt; sizeof(url) - 1) &amp;&amp; (j &lt; len)) {
        url[i] = buffer[j];
        i++;
        j++;
    }
    url[i] = &#39;\\0&#39;;
    cout &lt;&lt; &quot;URL：&quot; &lt;&lt; url &lt;&lt; endl;
    /*================== 解析url ==================*/

    while ((len = get_line(client, buffer, BUFFER_SIZE))) {
        if (buffer[0] != &#39;\\n&#39;) {
            cout &lt;&lt; buffer;
            /* 设置Content-Length:的长度，截断数组取Content-Length的值 */
            buffer[15] = &#39;\\0&#39;;
            if (strcasecmp(buffer, &quot;Content-Length:&quot;) == 0) {
                char *stop;
                content_length = strtol(&amp;(buffer[16]), &amp;stop, 10);
            }
            memset(buffer, 0, len);
        } else {
            break;
        }
    }
    /*================== 解析请求数据 ==================*/
    // 置零，下面读取请求数据
    len = 0;
    if (content_length &gt; 0) {
        do {
            int tmp = recv(client, buffer, BUFFER_SIZE, 0);
            len += tmp;
            cout &lt;&lt; buffer &lt;&lt; endl;
            memset(buffer, 0, tmp);
        } while (len != content_length);
    }
    /*================== 解析请求数据 ==================*/
    if (strcmp(key, url) == 0) {
        system(&quot;git pull&quot;);
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
        cout &lt;&lt; &quot;i running&quot; &lt;&lt; endl;
        FD_ZERO(&amp;fd_read_set);
        FD_SET(server_fd, &amp;fd_read_set);

        tv.tv_sec = 30;
        tv.tv_usec = 0;

        for (int i = 0; i &lt; BACKLOG; ++i) {
            if (fd_set[i] != 0) {
                FD_SET(fd_set[i], &amp;fd_read_set);
            }
        }


        ret = select(max_socket + 1, &amp;fd_read_set, NULL, NULL, &amp;tv);

        if (ret &lt; 0) {
            cout &lt;&lt; &quot;select&quot; &lt;&lt; endl;
            break;
        } else if (ret == 0) {
            cout &lt;&lt; &quot;timeout&quot; &lt;&lt; endl;
            continue;
        }

        tmp = 0;
        for (int j = 0; j &lt; connect_amount; ++j) {
            if (FD_ISSET(fd_set[j], &amp;fd_read_set)) {
                handler(fd_set[j], argv[2], buffer);
                FD_CLR(fd_set[j], &amp;fd_read_set);
                fd_set[j] = 0;
                tmp++;
            }
        }
        connect_amount -= tmp;


        if (FD_ISSET(server_fd, &amp;fd_read_set)) {
            client = accept(server_fd, (struct sockaddr *) &amp;client_addr, &amp;client_addr_len);
            if (client &lt;= 0) {
                cout &lt;&lt; &quot;=&gt; accept 错误&quot; &lt;&lt; endl;
                continue;
            }

            if (connect_amount &lt; BACKLOG) {
                fd_set[connect_amount++] = client;
                if (client &gt; max_socket) {
                    max_socket = client;
                }
            }
        }

    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="分析" tabindex="-1"><a class="header-anchor" href="#分析" aria-hidden="true">#</a> 分析</h1><p>有空再写</p>`,7),v=[d];function a(r,c){return i(),e("div",null,v)}const u=n(l,[["render",a],["__file","select实现socket单线程多路复用.html.vue"]]);export{u as default};
