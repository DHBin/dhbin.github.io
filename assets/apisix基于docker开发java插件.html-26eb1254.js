import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e}from"./app-f1812a7b.js";const t={},p=e(`<h1 id="apisix基于docker开发java插件" tabindex="-1"><a class="header-anchor" href="#apisix基于docker开发java插件" aria-hidden="true">#</a> apisix基于docker开发java插件</h1><h2 id="环境准备" tabindex="-1"><a class="header-anchor" href="#环境准备" aria-hidden="true">#</a> 环境准备</h2><p>apisix不支持windows，加上apisix的runner插件使用的协议不支持windows，所以需要在Linux环境下开发，有两个选择</p><ol><li>使用Linux服务器部署apisix，通过ssh远程开发</li><li>使用windows + wsl2，本地开发【推荐】</li></ol><p>两种方案IDEA都支持</p><p>使用docker快速搭建开发环境</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> clone https://github.com/apache/apisix-docker.git
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>在<code>example</code>文件夹中提供<code>docker-compose.yml</code>脚本，但需要简单地调整才能支持java runner的开发</p><p>1.修改<code>apisix_conf/config.yaml</code>，添加以下内容</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">ext-plugin</span><span class="token punctuation">:</span>
  <span class="token key atrule">path_for_test</span><span class="token punctuation">:</span> /tmp/runner.sock
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>2.修改<code>docker-compose.yml</code>，在apisix的volumes中添加/tmp映射</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>  <span class="token key atrule">apisix</span><span class="token punctuation">:</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">...</span>
      <span class="token punctuation">-</span> ./apisix_conf/tmp<span class="token punctuation">:</span>/tmp<span class="token punctuation">:</span>rw
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这么配置的原因是apisix的runner插件使用的协议是Unix_domain_socket，这个协议在windows上不支持，配置文件夹映射也是为了把sock文件共享，让在容器中的apisix能通过sock文件与宿主机通信</p><h2 id="插件开发" tabindex="-1"><a class="header-anchor" href="#插件开发" aria-hidden="true">#</a> 插件开发</h2><p>引入apisix java runner的jar包</p><div class="language-xml line-numbers-mode" data-ext="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.apache.apisix<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>apisix-runner-starter<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>0.4.0<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>启动类</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 启动类中添加扫描org.apache.apisix.plugin.runner包</span>
<span class="token annotation punctuation">@SpringBootApplication</span><span class="token punctuation">(</span>scanBasePackages <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token string">&quot;com.example&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;org.apache.apisix.plugin.runner&quot;</span><span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DemoApplication</span> <span class="token punctuation">{</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">new</span> <span class="token class-name">SpringApplicationBuilder</span><span class="token punctuation">(</span><span class="token class-name">DemoApplication</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">web</span><span class="token punctuation">(</span><span class="token class-name">WebApplicationType</span><span class="token punctuation">.</span><span class="token constant">NONE</span><span class="token punctuation">)</span>
                <span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span>args<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Filter开发</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Component</span>
<span class="token annotation punctuation">@Slf4j</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DemoFilter</span> <span class="token keyword">implements</span> <span class="token class-name">PluginFilter</span> <span class="token punctuation">{</span>


    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;DemoFilter&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">filter</span><span class="token punctuation">(</span><span class="token class-name">HttpRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">HttpResponse</span> response<span class="token punctuation">,</span> <span class="token class-name">PluginFilterChain</span> chain<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        log<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token string">&quot;demo filter&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        chain<span class="token punctuation">.</span><span class="token function">filter</span><span class="token punctuation">(</span>request<span class="token punctuation">,</span> response<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>就这样，一个简单的apisix java插件就完成了，从apisix配置路由插件，就可以把流量经过插件处理，下面是一个例子：</p><blockquote><p>创建upstream</p></blockquote><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">--location</span> <span class="token parameter variable">--request</span> PUT <span class="token string">&#39;http://127.0.0.1:9180/apisix/admin/upstreams/1&#39;</span> <span class="token punctuation">\\</span>
<span class="token parameter variable">--header</span> <span class="token string">&#39;X-API-KEY: edd1c9f034335f136f87ad84b625c8f1&#39;</span> <span class="token punctuation">\\</span>
<span class="token parameter variable">--header</span> <span class="token string">&#39;Content-Type: application/json&#39;</span> <span class="token punctuation">\\</span>
<span class="token parameter variable">--data</span> <span class="token string">&#39;{
  &quot;type&quot;: &quot;roundrobin&quot;,
  &quot;nodes&quot;: {
    &quot;httpbin.org:80&quot;: 1
  }
}&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>创建router</p></blockquote><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">--location</span> <span class="token parameter variable">--request</span> PUT <span class="token string">&#39;http://127.0.0.1:9180/apisix/admin/routes/1&#39;</span> <span class="token punctuation">\\</span>
<span class="token parameter variable">--header</span> <span class="token string">&#39;X-API-KEY: edd1c9f034335f136f87ad84b625c8f1&#39;</span> <span class="token punctuation">\\</span>
<span class="token parameter variable">--header</span> <span class="token string">&#39;Content-Type: application/json&#39;</span> <span class="token punctuation">\\</span>
<span class="token parameter variable">--data</span> <span class="token string">&#39;{
    &quot;methods&quot;: [
        &quot;GET&quot;, &quot;POST&quot;
    ],
    &quot;uri&quot;: &quot;/anything/*&quot;,
    &quot;upstream_id&quot;: &quot;1&quot;,
    &quot;plugins&quot;: {
        &quot;ext-plugin-pre-req&quot;: {
            &quot;conf&quot;: [
                {
                    &quot;name&quot;: &quot;DemoFilter&quot;,
                    &quot;value&quot;: &quot;bar&quot;
                }
            ]
        }
    }
}&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>conf中的name需要与<code>PluginFilter#name</code>一致，apisix是这个名字找到对于的过滤器的</p><blockquote><p>测试</p></blockquote><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">--location</span> <span class="token parameter variable">--request</span> POST <span class="token string">&#39;http://127.0.0.1:9080/anything/get?foo1=bar1&amp;foo2=bar2&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="pluginfilter详解" tabindex="-1"><a class="header-anchor" href="#pluginfilter详解" aria-hidden="true">#</a> PluginFilter详解</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">PluginFilter</span> <span class="token punctuation">{</span>

    <span class="token doc-comment comment">/**
     * 插件的名称，配置中通过该名称找到对于的过滤器
     *
     * <span class="token keyword">@return</span> the name of plugin filter
     */</span>
    <span class="token class-name">String</span> <span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 过滤器责任链执行的方法，在这个方法上可以对请求、响应处理，
     * 这个方法的生命周期在apisix的两个插件上会被调用到，分别是
     * 1. ext-plugin-pre-req：内置插件执行之前
     * 2. ext-plugin-post-req：内置插件执行之后
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
     * do the plugin filter chain
     *
     * <span class="token keyword">@param</span> <span class="token parameter">request</span>  the request form APISIX http请求信息
     * <span class="token keyword">@param</span> <span class="token parameter">response</span> the response for APISIX 如果在这个response中设置了http状态码、body、header，请求将不会向下传递，比如不会向下游服务转发
     * <span class="token keyword">@param</span> <span class="token parameter">chain</span>    the chain of filters 过滤器责任链
     */</span>
    <span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">filter</span><span class="token punctuation">(</span><span class="token class-name">HttpRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">HttpResponse</span> response<span class="token punctuation">,</span> <span class="token class-name">PluginFilterChain</span> chain<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 和filter的功能一样，但被调用的生命周期不一样，会在ext-plugin-post-resp插件中配置才会被
     * 调用
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
     * filtering after the upstream response is complete
     *
     * <span class="token keyword">@param</span> <span class="token parameter">request</span>  context of the upstream return
     * <span class="token keyword">@param</span> <span class="token parameter">response</span> modify the context of the upstream response
     */</span>
    <span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">postFilter</span><span class="token punctuation">(</span><span class="token class-name">PostRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">PostResponse</span> response<span class="token punctuation">,</span> <span class="token class-name">PluginFilterChain</span> chain<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 是否需要获取nginx的变量，比如remote_addr、server_port
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
     * declare in advance the nginx variables that you want to use in the plugin
     *
     * <span class="token keyword">@return</span> the nginx variables as list
     */</span>
    <span class="token keyword">default</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">requiredVars</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 是否需要请求体
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
     * need request body in plugins or not
     *
     * <span class="token keyword">@return</span> true if need request body
     */</span>
    <span class="token keyword">default</span> <span class="token class-name">Boolean</span> <span class="token function">requiredBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 是否需要响应体
     * <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>
     * need response body of upstream server in plugins or not
     *
     * <span class="token keyword">@return</span> true if need response body
     */</span>
    <span class="token keyword">default</span> <span class="token class-name">Boolean</span> <span class="token function">requiredRespBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="生命周期" tabindex="-1"><a class="header-anchor" href="#生命周期" aria-hidden="true">#</a> 生命周期</h3><ol><li>ext-plugin-pre-req</li><li>ext-plugin-post-req</li><li>ext-plugin-post-resp</li></ol><figure><img src="https://cdn.dhbin.cn/202305290012195.png" alt="external-plugin" tabindex="0" loading="lazy"><figcaption>external-plugin</figcaption></figure><h2 id="网关平替评估" tabindex="-1"><a class="header-anchor" href="#网关平替评估" aria-hidden="true">#</a> 网关平替评估</h2><p>先说结果：<strong>支持平替gateway、zuul，但目前apisix提供的java插件没有达到生产级别，存在性能问题，需要定制开发</strong></p><p>问题1：<code>PluginFilter</code>写死了是否需要请求体、响应体，不能动态根据需要判断是否获取，当文件传输等大数据输出也获取body的话，导致严重的性能问题</p><p>问题2：apisix对于runner插件热更新能力较弱</p><h3 id="问题1解决方案" tabindex="-1"><a class="header-anchor" href="#问题1解决方案" aria-hidden="true">#</a> 问题1解决方案</h3><p>需要解决<strong>问题1</strong>，先要了解apisix与java之间是怎么交互的，从下图知道apisix与runner的交互大致分为两步</p><ol><li>先转发http，不带body、nginx变量信息，如果不需要扩展信息直接返回</li><li>如果需要的话，直到获取要所有需要的扩展信息才返回</li></ol><figure><img src="https://cdn.dhbin.cn/202305290012539.png" alt="apisix与runner交互图" tabindex="0" loading="lazy"><figcaption>apisix与runner交互图</figcaption></figure><p>目前的问题就是，PluginFilter的三个方法请求，并没有传递request、response信息让用户动态判断是否需要获取控制信息</p><ul><li>requiredBody</li><li>requiredVars</li><li>requiredRespBody</li></ul><figure><img src="https://cdn.dhbin.cn/202305290012112.png" alt="apisix-plugin-filter" tabindex="0" loading="lazy"><figcaption>apisix-plugin-filter</figcaption></figure><p>怎么解决？我们要在判断是否需要body的时候，能取到request/response的信息用作判断即可。</p><p>apisix的java runner插件实现是基于netty做的，以下是插件的几个关键Handler</p><ul><li>LoggingHandler：日志输出</li><li>PayloadEncoder：数据编码（bean -&gt; bytes）</li><li>BinaryProtocolDecoder：tcp粘包、粘包处理器（LengthFieldBasedFrameDecoder），协议切割</li><li>PayloadDecoder：数据解码（bytes -&gt; bean）</li><li><strong>PrepareConfHandler</strong>：处理<strong>RPC_PREPARE_CONF</strong>消息</li><li><strong>RpcCallHandler</strong>：处理<strong>RPC_EXTRA_INFO</strong>、<strong>RPC_HTTP_REQ_CALL</strong>、<strong>RPC_HTTP_RESP_CALL</strong>消息</li><li>ExceptionCaughtHandler：异常处理</li></ul><p>处理流程如下：</p><figure><img src="https://cdn.dhbin.cn/202305290012478.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>处理判断是否需要扩展信息的关键代码在<code>org.apache.apisix.plugin.runner.handler.RpcCallHandler#fetchExtraInfo</code>，如下</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">handleHttpReqCall</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">HttpRequest</span> request<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">cleanCtx</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// save HttpCallRequest</span>
    currReq <span class="token operator">=</span> request<span class="token punctuation">;</span>
    currResp <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HttpResponse</span><span class="token punctuation">(</span>currReq<span class="token punctuation">.</span><span class="token function">getRequestId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    confToken <span class="token operator">=</span> currReq<span class="token punctuation">.</span><span class="token function">getConfToken</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">A6Conf</span> conf <span class="token operator">=</span> cache<span class="token punctuation">.</span><span class="token function">getIfPresent</span><span class="token punctuation">(</span>confToken<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">Objects</span><span class="token punctuation">.</span><span class="token function">isNull</span><span class="token punctuation">(</span>conf<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        logger<span class="token punctuation">.</span><span class="token function">warn</span><span class="token punctuation">(</span><span class="token string">&quot;cannot find conf token: {}&quot;</span><span class="token punctuation">,</span> confToken<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">errorHandle</span><span class="token punctuation">(</span>ctx<span class="token punctuation">,</span> <span class="token class-name">Code</span><span class="token punctuation">.</span><span class="token constant">CONF_TOKEN_NOT_FOUND</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token class-name">PluginFilterChain</span> chain <span class="token operator">=</span> conf<span class="token punctuation">.</span><span class="token function">getChain</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// here we pre-read parameters in the req to</span>
    <span class="token comment">// prevent confusion over the read/write index of the req.</span>
    <span class="token function">preReadReq</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// if the filter chain is empty, then return the response directly</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">Objects</span><span class="token punctuation">.</span><span class="token function">isNull</span><span class="token punctuation">(</span>chain<span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token number">0</span> <span class="token operator">==</span> chain<span class="token punctuation">.</span><span class="token function">getFilters</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ChannelFuture</span> future <span class="token operator">=</span> ctx<span class="token punctuation">.</span><span class="token function">writeAndFlush</span><span class="token punctuation">(</span>currResp<span class="token punctuation">)</span><span class="token punctuation">;</span>
        future<span class="token punctuation">.</span><span class="token function">addListeners</span><span class="token punctuation">(</span><span class="token class-name">ChannelFutureListener</span><span class="token punctuation">.</span><span class="token constant">FIRE_EXCEPTION_ON_FAILURE</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 这里判断需要的扩展信息</span>
    <span class="token class-name">Boolean</span><span class="token punctuation">[</span><span class="token punctuation">]</span> result <span class="token operator">=</span> <span class="token function">fetchExtraInfo</span><span class="token punctuation">(</span>ctx<span class="token punctuation">,</span> chain<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">Objects</span><span class="token punctuation">.</span><span class="token function">isNull</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>result<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>result<span class="token punctuation">[</span><span class="token number">1</span><span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 如果不需要扩展信息直接执行过滤器链</span>
        <span class="token function">doFilter</span><span class="token punctuation">(</span>ctx<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token class-name">Boolean</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token function">fetchExtraInfo</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">PluginFilterChain</span> chain<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// fetch the nginx variables</span>
    <span class="token class-name">Set</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> varKeys <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HashSet</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">boolean</span> requiredReqBody <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token keyword">boolean</span> requiredVars <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>
    <span class="token keyword">boolean</span> requiredRespBody <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

    <span class="token comment">// 执行过滤器链</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">PluginFilter</span> filter <span class="token operator">:</span> chain<span class="token punctuation">.</span><span class="token function">getFilters</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 获取需要的nginx参数</span>
        <span class="token class-name">Collection</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> vars <span class="token operator">=</span> filter<span class="token punctuation">.</span><span class="token function">requiredVars</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token class-name">CollectionUtils</span><span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span>vars<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            varKeys<span class="token punctuation">.</span><span class="token function">addAll</span><span class="token punctuation">(</span>vars<span class="token punctuation">)</span><span class="token punctuation">;</span>
            requiredVars <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 判断是否需要request body</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>filter<span class="token punctuation">.</span><span class="token function">requiredBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> filter<span class="token punctuation">.</span><span class="token function">requiredBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            requiredReqBody <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 判断是否需要response body</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>filter<span class="token punctuation">.</span><span class="token function">requiredRespBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> filter<span class="token punctuation">.</span><span class="token function">requiredRespBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            requiredRespBody <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// fetch the nginx vars</span>
    <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>

        <span class="token comment">// fetch the request body</span>
        <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>

        <span class="token comment">// fetch the response body</span>
        <span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span>

        <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">Boolean</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">{</span>requiredVars<span class="token punctuation">,</span> requiredReqBody<span class="token punctuation">,</span> requiredRespBody<span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从源码中知道，apisix与插件的交互的方式是先发起RPC_HTTP_REQ_CALL请求，这请求是不带body等参数的，通过filter定义的方法判断是否需要扩展信息，再从apisix上取回，但问题就是判断的方法没有支持传递request、reponse让方法判断，解决这个问题的方案就是扩展<code>PluginFilter</code>，如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 扩展Plugin支持动态判断是否需要扩展信息
 *
 * <span class="token keyword">@author</span> dhb
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">ExtPluginFilter</span> <span class="token keyword">extends</span> <span class="token class-name">PluginFilter</span> <span class="token punctuation">{</span>


    <span class="token doc-comment comment">/**
     * 需要获取的nginx参数
     *
     * <span class="token keyword">@param</span> <span class="token parameter">request</span>  request
     * <span class="token keyword">@param</span> <span class="token parameter">response</span> response
     * <span class="token keyword">@return</span> 参数名集合
     */</span>
    <span class="token keyword">default</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">requiredVars</span><span class="token punctuation">(</span><span class="token class-name">HttpRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">HttpResponse</span> response<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>


    <span class="token doc-comment comment">/**
     * 需要获取的nginx参数
     *
     * <span class="token keyword">@param</span> <span class="token parameter">request</span>  post request
     * <span class="token keyword">@param</span> <span class="token parameter">response</span> post response
     * <span class="token keyword">@return</span> 参数名集合
     */</span>
    <span class="token keyword">default</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token function">requiredVars</span><span class="token punctuation">(</span><span class="token class-name">PostRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">PostResponse</span> response<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 判断是否需要请求体
     *
     * <span class="token keyword">@param</span> <span class="token parameter">request</span>  request
     * <span class="token keyword">@param</span> <span class="token parameter">response</span> response
     */</span>
    <span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">requiredBody</span><span class="token punctuation">(</span><span class="token class-name">HttpRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">HttpResponse</span> response<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>


    <span class="token doc-comment comment">/**
     * 判断是否需要请求体
     *
     * <span class="token keyword">@param</span> <span class="token parameter">request</span>  post request
     * <span class="token keyword">@param</span> <span class="token parameter">response</span> post response
     */</span>
    <span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">requiredBody</span><span class="token punctuation">(</span><span class="token class-name">PostRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">PostResponse</span> response<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>


    <span class="token doc-comment comment">/**
     * 判断是否需要响应体
     *
     * <span class="token keyword">@param</span> <span class="token parameter">request</span>  request
     * <span class="token keyword">@param</span> <span class="token parameter">response</span> response
     */</span>
    <span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">requiredRespBody</span><span class="token punctuation">(</span><span class="token class-name">HttpRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">HttpResponse</span> response<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 判断是否需要响应体
     *
     * <span class="token keyword">@param</span> <span class="token parameter">request</span>  post request
     * <span class="token keyword">@param</span> <span class="token parameter">response</span> post response
     */</span>
    <span class="token keyword">default</span> <span class="token keyword">void</span> <span class="token function">requiredRespBody</span><span class="token punctuation">(</span><span class="token class-name">PostRequest</span> request<span class="token punctuation">,</span> <span class="token class-name">PostResponse</span> response<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重写<code>RpcCallHandler#fetchExtraInfo</code>方法的处理逻辑，判断是<code>ExtPluginFilter</code>执行控制的方法。</p><h3 id="问题2解决方案" tabindex="-1"><a class="header-anchor" href="#问题2解决方案" aria-hidden="true">#</a> 问题2解决方案</h3><p>apisix提供的java热更新方案是监听文件夹内的java文件是否有变化，如果更新通过动态编译+自定义类加载器+BeanDefinitionRegistry，实现Filter的动态替换，但这个能力比较弱，同时也存在一些问题，比如</p><ul><li>更新需要添加依赖jar包是无法加载进去</li><li>替换bean不是原子操作存在间隙获取不到filter</li><li>带有缓存机制，目前版本没有清理缓存</li></ul><p>解决方案：</p><ul><li>监听改变事件、获取更新的版本信息，通过UrlClassLoader动态加载，并清理缓存。但替换bean不好解决，需要加锁</li></ul><p>解决方案二：</p><p>我们一般在k8s上部署，但需要更新版本时，重做镜像，通过k8s的能力滚动更新，不需要热更新的功能</p><h2 id="扩展" tabindex="-1"><a class="header-anchor" href="#扩展" aria-hidden="true">#</a> 扩展</h2><h3 id="传输协议" tabindex="-1"><a class="header-anchor" href="#传输协议" aria-hidden="true">#</a> 传输协议</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>+-----------+------------+---------+
| 消息类型   |    数据长度  |   数据   |
+-----------+------------+---------+
| 1 byte    | 3 bytes    | x bytes |
+-----------+------------+---------+


消息类型：

配置的更新推送标识
RPC_PREPARE_CONF = 1,
http请求
RPC_HTTP_REQ_CALL = 2,
扩展信息
RPC_EXTRA_INFO = 3,
下游http响应后
RPC_HTTP_RESP_CALL = 4,

https://github.com/apache/apisix/blob/master/apisix/constants.lua#L20


数据长度用3个字节标识，最大2^24-1，数据最大能传输16Mb，但官网中写着最大值是8M,不知道是写错了还是我理解错了
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://cdn.dhbin.cn/202305290012598.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h2 id="测试方案" tabindex="-1"><a class="header-anchor" href="#测试方案" aria-hidden="true">#</a> 测试方案</h2><ul><li>单元测试：junit + mockito</li><li>集成测试：testcontainer</li></ul>`,67),i=[p];function l(c,o){return s(),a("div",null,i)}const d=n(t,[["render",l],["__file","apisix基于docker开发java插件.html.vue"]]);export{d as default};
