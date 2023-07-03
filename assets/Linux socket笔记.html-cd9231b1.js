import{_ as s}from"./plugin-vue_export-helper-c27b6911.js";import{r as l,o as r,c as t,a as n,b as i,d,e as c}from"./app-f1812a7b.js";const a={},v=c(`<h1 id="linux-socket笔记" tabindex="-1"><a class="header-anchor" href="#linux-socket笔记" aria-hidden="true">#</a> Linux socket笔记</h1><p>linux socket创建tcp连接例子</p><h1 id="代码" tabindex="-1"><a class="header-anchor" href="#代码" aria-hidden="true">#</a> 代码</h1><div class="language-c++ line-numbers-mode" data-ext="c++"><pre class="language-c++"><code>#include &lt;iostream&gt;
#include &lt;stdio.h&gt;
#include &lt;string.h&gt;
#include &lt;stdlib.h&gt;
#include &lt;unistd.h&gt;
#include &lt;arpa/inet.h&gt;
#include &lt;sys/socket.h&gt;
#include &lt;netinet/in.h&gt;


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

    if (client &lt; 0) {
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
    if (bind(client, (struct sockaddr *) &amp;server_addr, sizeof(server_addr)) &lt; 0) {
        cout &lt;&lt; &quot;=&gt; 绑定socket异常&quot; &lt;&lt; endl;
        exit(1);
    }


    // 设置监听
    listen(client, SOMAXCONN);

    struct sockaddr_in client_addr{};
    socklen_t client_addr_len = sizeof(client_addr);
    int server;
    while (true) {
        server = accept(client, (struct sockaddr *) &amp;client_addr, &amp;client_addr_len);

        if (server &lt; 0) {
            cout &lt;&lt; &quot;=&gt; accept 错误&quot; &lt;&lt; endl;
            exit(1);
        }
        // todo 写怎么接收数据
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="资料" tabindex="-1"><a class="header-anchor" href="#资料" aria-hidden="true">#</a> 资料</h1>`,5),u={href:"http://c.biancheng.net/view/2123.html",target:"_blank",rel:"noopener noreferrer"},o={href:"https://www.jianshu.com/p/676506ad2057",target:"_blank",rel:"noopener noreferrer"},m={href:"https://www.cnblogs.com/life2refuel/p/5277111.html",target:"_blank",rel:"noopener noreferrer"},b={href:"https://github.com/EZLippi/Tinyhttpd",target:"_blank",rel:"noopener noreferrer"};function _(h,p){const e=l("ExternalLinkIcon");return r(),t("div",null,[v,n("p",null,[n("a",u,[i("Socket入门资料"),d(e)])]),n("p",null,[n("a",o,[i("Linux_socket编程入门（C++）"),d(e)])]),n("p",null,[n("a",m,[i("C 实现一个简易的Http服务器"),d(e)])]),n("p",null,[n("a",b,[i("Tinyhttpd源码"),d(e)])])])}const g=s(a,[["render",_],["__file","Linux socket笔记.html.vue"]]);export{g as default};
