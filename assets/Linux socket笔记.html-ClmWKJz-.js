import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as d,o as l,c,a as n,b as i,d as t,e as r}from"./app-Bq0Sc4vP.js";const a={},o=r(`<h1 id="linux-socket笔记" tabindex="-1"><a class="header-anchor" href="#linux-socket笔记"><span>Linux socket笔记</span></a></h1><p>linux socket创建tcp连接例子</p><h1 id="代码" tabindex="-1"><a class="header-anchor" href="#代码"><span>代码</span></a></h1><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;iostream&gt;
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="资料" tabindex="-1"><a class="header-anchor" href="#资料"><span>资料</span></a></h1>`,5),v={href:"http://c.biancheng.net/view/2123.html",target:"_blank",rel:"noopener noreferrer"},u={href:"https://www.jianshu.com/p/676506ad2057",target:"_blank",rel:"noopener noreferrer"},m={href:"https://www.cnblogs.com/life2refuel/p/5277111.html",target:"_blank",rel:"noopener noreferrer"},_={href:"https://github.com/EZLippi/Tinyhttpd",target:"_blank",rel:"noopener noreferrer"};function p(b,h){const e=d("ExternalLinkIcon");return l(),c("div",null,[o,n("p",null,[n("a",v,[i("Socket入门资料"),t(e)])]),n("p",null,[n("a",u,[i("Linux_socket编程入门（C++）"),t(e)])]),n("p",null,[n("a",m,[i("C 实现一个简易的Http服务器"),t(e)])]),n("p",null,[n("a",_,[i("Tinyhttpd源码"),t(e)])])])}const x=s(a,[["render",p],["__file","Linux socket笔记.html.vue"]]),f=JSON.parse('{"path":"/tech/%E7%BD%91%E7%BB%9C/Linux%20socket%E7%AC%94%E8%AE%B0.html","title":"Linux socket笔记","lang":"zh-CN","frontmatter":{"date":"2019-04-30T16:44:00.000Z","category":["网络"],"tag":["Linux","Socket","IO"],"description":"Linux socket笔记 linux socket创建tcp连接例子 代码 资料 Socket入门资料 Linux_socket编程入门（C++） C 实现一个简易的Http服务器 Tinyhttpd源码","head":[["meta",{"property":"og:url","content":"https://dhbin.cn/tech/%E7%BD%91%E7%BB%9C/Linux%20socket%E7%AC%94%E8%AE%B0.html"}],["meta",{"property":"og:site_name","content":"HB技术栈"}],["meta",{"property":"og:title","content":"Linux socket笔记"}],["meta",{"property":"og:description","content":"Linux socket笔记 linux socket创建tcp连接例子 代码 资料 Socket入门资料 Linux_socket编程入门（C++） C 实现一个简易的Http服务器 Tinyhttpd源码"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-22T17:33:14.000Z"}],["meta",{"property":"article:author","content":"DHB"}],["meta",{"property":"article:tag","content":"Linux"}],["meta",{"property":"article:tag","content":"Socket"}],["meta",{"property":"article:tag","content":"IO"}],["meta",{"property":"article:published_time","content":"2019-04-30T16:44:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-03-22T17:33:14.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Linux socket笔记\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2019-04-30T16:44:00.000Z\\",\\"dateModified\\":\\"2023-03-22T17:33:14.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"DHB\\",\\"url\\":\\"https://dhbin.cn\\"}]}"]]},"headers":[],"git":{"createdTime":1679384580000,"updatedTime":1679506394000,"contributors":[{"name":"dhb","email":"xx158@qq.com","commits":1},{"name":"donghaibin","email":"xx158@qq.com","commits":1}]},"readingTime":{"minutes":1.01,"words":304},"localizedDate":"2019年4月30日","excerpt":"\\n<p>linux socket创建tcp连接例子</p>\\n<h1>代码</h1>\\n<div class=\\"language-c++\\" data-ext=\\"c++\\" data-title=\\"c++\\"><pre class=\\"language-c++\\"><code>#include &lt;iostream&gt;\\n#include &lt;stdio.h&gt;\\n#include &lt;string.h&gt;\\n#include &lt;stdlib.h&gt;\\n#include &lt;unistd.h&gt;\\n#include &lt;arpa/inet.h&gt;\\n#include &lt;sys/socket.h&gt;\\n#include &lt;netinet/in.h&gt;\\n\\n\\nusing namespace std;\\n\\nint main() {\\n    int client;\\n\\n    /*\\n     * socket函数的方法签名\\n     * int socket (int __family, int __type, int __protocol)\\n     * __family     定义协议族\\n     * __type       定义数据传输方式/套接字类型\\n     * __protocol   定义传输协议\\n     *\\n     * 返回值是文件描述符\\n     *\\n     * */\\n    client = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);\\n\\n    if (client &lt; 0) {\\n        cout &lt;&lt; \\"=&gt; 连接失败\\" &lt;&lt; endl;\\n    }\\n\\n    /*\\n    * 位于netinet/in.h\\n    * 将套接字和IP、端口判断\\n    *\\n    * */\\n    struct sockaddr_in server_addr{};\\n    // 使用IPv4\\n    server_addr.sin_family = AF_INET;\\n    // 端口\\n    server_addr.sin_port = htons(1500);\\n    // IP地址\\n    server_addr.sin_addr.s_addr = htons(INADDR_ANY);\\n\\n    /*\\n     * struct sockaddr* 位于socket.h\\n     * bind()签名\\n     * int bind (int, const struct sockaddr *__my_addr, socklen_t __addrlen);\\n     * 第一个参数：socket文件描述符\\n     * 第二个参数：struct sockaddr*\\n     * 第三个参数：struct sockaddr* 长度\\n     * */\\n    if (bind(client, (struct sockaddr *) &amp;server_addr, sizeof(server_addr)) &lt; 0) {\\n        cout &lt;&lt; \\"=&gt; 绑定socket异常\\" &lt;&lt; endl;\\n        exit(1);\\n    }\\n\\n\\n    // 设置监听\\n    listen(client, SOMAXCONN);\\n\\n    struct sockaddr_in client_addr{};\\n    socklen_t client_addr_len = sizeof(client_addr);\\n    int server;\\n    while (true) {\\n        server = accept(client, (struct sockaddr *) &amp;client_addr, &amp;client_addr_len);\\n\\n        if (server &lt; 0) {\\n            cout &lt;&lt; \\"=&gt; accept 错误\\" &lt;&lt; endl;\\n            exit(1);\\n        }\\n        // todo 写怎么接收数据\\n    }\\n}\\n</code></pre></div>","autoDesc":true}');export{x as comp,f as data};
