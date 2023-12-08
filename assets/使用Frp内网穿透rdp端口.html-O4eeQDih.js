import{_ as a}from"./plugin-vue_export-helper-x3n3nnut.js";import{r,o as n,c as d,a as e,b as s,d as l,e as t}from"./app-Z5wCtR9B.js";const c={},o=t(`<h1 id="使用frp内网穿透rdp端口" tabindex="-1"><a class="header-anchor" href="#使用frp内网穿透rdp端口" aria-hidden="true">#</a> 使用Frp内网穿透rdp端口</h1><h1 id="工具" tabindex="-1"><a class="header-anchor" href="#工具" aria-hidden="true">#</a> 工具</h1><p>Frp是一个可用于内网穿透的高性能的反向代理应用，支持 tcp, udp 协议，为 http 和 https 应用协议提供了额外的能力，且尝试性支持了点对点穿透。</p><h1 id="前提条件" tabindex="-1"><a class="header-anchor" href="#前提条件" aria-hidden="true">#</a> 前提条件</h1><ul><li>一台有公网的服务器</li></ul><h1 id="方法" tabindex="-1"><a class="header-anchor" href="#方法" aria-hidden="true">#</a> 方法</h1><p>在frp的releases页面下载符合你的操作系统的包。我本地是Windows，云服务器是Linux。</p><h2 id="服务端server" tabindex="-1"><a class="header-anchor" href="#服务端server" aria-hidden="true">#</a> 服务端server</h2><ol><li>编辑frps.ini</li></ol><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># frps.ini
[common]
bind_port = 7000
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>启动frps</li></ol><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>./frps <span class="token parameter variable">-c</span> ./frps.ini
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>输出日志如下就是正常的</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>2019/11/15 17:45:43 [I] [service.go:141] frps tcp listen on 0.0.0.0:7000
2019/11/15 17:45:43 [I] [root.go:205] start frps success
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="客户端client" tabindex="-1"><a class="header-anchor" href="#客户端client" aria-hidden="true">#</a> 客户端client</h2><p>我的电脑是Windows10，下载frp_x.xx.x_windows_amd64.zip</p><ol><li>编辑frpc.ini</li></ol><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># frpc.ini
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>启动frpc</li></ol><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>frpc.exe -c frpc.ini
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这样就可以通过ip:remote_port远程了。自我感觉使用体验比向日葵和Termviwer还好</p><h1 id="拓展" tabindex="-1"><a class="header-anchor" href="#拓展" aria-hidden="true">#</a> 拓展</h1><p>Frp不仅有这个的作用，更多看官方文档。</p>`,23),p={href:"https://github.com/fatedier/frp/blob/master/README_zh.md",target:"_blank",rel:"noopener noreferrer"};function v(h,u){const i=r("ExternalLinkIcon");return n(),d("div",null,[o,e("p",null,[e("a",p,[s("https://github.com/fatedier/frp/blob/master/README_zh.md"),l(i)])])])}const x=a(c,[["render",v],["__file","使用Frp内网穿透rdp端口.html.vue"]]);export{x as default};
