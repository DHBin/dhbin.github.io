import{_ as a}from"./plugin-vue_export-helper-x3n3nnut.js";import{r as e,o as t,c as i,a as n,b as p,d as c,e as l}from"./app-Z5wCtR9B.js";const o={},r=l(`<h1 id="docker搭建redis集群" tabindex="-1"><a class="header-anchor" href="#docker搭建redis集群" aria-hidden="true">#</a> Docker搭建redis集群</h1><h2 id="脚本" tabindex="-1"><a class="header-anchor" href="#脚本" aria-hidden="true">#</a> 脚本</h2><p>创建节点数据</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token keyword">for</span> <span class="token for-or-select variable">port</span> <span class="token keyword">in</span> <span class="token variable"><span class="token variable">$(</span><span class="token function">seq</span> <span class="token number">1</span> <span class="token number">6</span><span class="token variable">)</span></span><span class="token punctuation">;</span> <span class="token punctuation">\\</span>
<span class="token keyword">do</span> <span class="token punctuation">\\</span>
<span class="token function">mkdir</span> <span class="token parameter variable">-p</span> ./node-<span class="token variable">\${port}</span>/conf
<span class="token function">touch</span> ./node-<span class="token variable">\${port}</span>/conf/redis.conf
<span class="token function">cat</span> <span class="token operator">&lt;&lt;</span> <span class="token string">EOF<span class="token bash punctuation"> <span class="token operator">&gt;</span> ./node-<span class="token variable">\${port}</span>/conf/redis.conf</span>
port 800<span class="token variable">\${port}</span>
bind 0.0.0.0
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-ip 10.8.46.98
cluster-announce-port 800<span class="token variable">\${port}</span>
cluster-announce-bus-port 1800<span class="token variable">\${port}</span>
appendonly yes
EOF</span>
<span class="token keyword">done</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="启动" tabindex="-1"><a class="header-anchor" href="#启动" aria-hidden="true">#</a> 启动</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 容器1</span>
<span class="token function">docker</span> run <span class="token parameter variable">--name</span> redis-1 <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-1/data:/data <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-1/conf/redis.conf:/etc/redis/redis.conf <span class="token punctuation">\\</span>
<span class="token parameter variable">-d</span> <span class="token parameter variable">--net</span> <span class="token function">host</span>  redis:5.0.12 redis-server /etc/redis/redis.conf

<span class="token comment"># 容器2</span>
<span class="token function">docker</span> run <span class="token parameter variable">--name</span> redis-2 <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-2/data:/data <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-2/conf/redis.conf:/etc/redis/redis.conf <span class="token punctuation">\\</span>
<span class="token parameter variable">-d</span> <span class="token parameter variable">--net</span> <span class="token function">host</span>  redis:5.0.12 redis-server /etc/redis/redis.conf

<span class="token comment"># 容器3</span>
<span class="token function">docker</span> run <span class="token parameter variable">--name</span> redis-3 <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-3/data:/data <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-3/conf/redis.conf:/etc/redis/redis.conf <span class="token punctuation">\\</span>
<span class="token parameter variable">-d</span> <span class="token parameter variable">--net</span> <span class="token function">host</span>  redis:5.0.12 redis-server /etc/redis/redis.conf

<span class="token comment"># 容器4</span>
<span class="token function">docker</span> run <span class="token parameter variable">--name</span> redis-4 <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-4/data:/data <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-4/conf/redis.conf:/etc/redis/redis.conf <span class="token punctuation">\\</span>
<span class="token parameter variable">-d</span> <span class="token parameter variable">--net</span> <span class="token function">host</span>  redis:5.0.12 redis-server /etc/redis/redis.conf

<span class="token comment"># 容器5</span>
<span class="token function">docker</span> run <span class="token parameter variable">--name</span> redis-5 <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-5/data:/data <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-5/conf/redis.conf:/etc/redis/redis.conf <span class="token punctuation">\\</span>
<span class="token parameter variable">-d</span> <span class="token parameter variable">--net</span> <span class="token function">host</span>  redis:5.0.12 redis-server /etc/redis/redis.conf

<span class="token comment"># 容器6</span>
<span class="token function">docker</span> run <span class="token parameter variable">--name</span> redis-6 <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-6/data:/data <span class="token punctuation">\\</span>
<span class="token parameter variable">-v</span> <span class="token variable"><span class="token variable">\`</span><span class="token builtin class-name">pwd</span><span class="token variable">\`</span></span>/node-6/conf/redis.conf:/etc/redis/redis.conf <span class="token punctuation">\\</span>
<span class="token parameter variable">-d</span> <span class="token parameter variable">--net</span> <span class="token function">host</span>  redis:5.0.12 redis-server /etc/redis/redis.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="停止" tabindex="-1"><a class="header-anchor" href="#停止" aria-hidden="true">#</a> 停止</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">docker</span> stop redis-1
<span class="token function">docker</span> stop redis-2
<span class="token function">docker</span> stop redis-3
<span class="token function">docker</span> stop redis-4
<span class="token function">docker</span> stop redis-5
<span class="token function">docker</span> stop redis-6
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="删除" tabindex="-1"><a class="header-anchor" href="#删除" aria-hidden="true">#</a> 删除</h2><div class="language-plain line-numbers-mode" data-ext="plain"><pre class="language-plain"><code>for port in $(seq 1 6); \\                                                                                                                                                                                  
do \\                                                                                                                                                                                                       
docker stop redis-\${port}                                                                                                                                                                                  
docker rm redis-\${port}                                                                                                                                                                                    
done
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="docker-compose版本" tabindex="-1"><a class="header-anchor" href="#docker-compose版本" aria-hidden="true">#</a> docker-compose版本</h2><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token string">&#39;3.1&#39;</span>
<span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token comment"># redis1配置</span>
  <span class="token key atrule">redis1</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis<span class="token punctuation">:</span>6.2.5
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> redis<span class="token punctuation">-</span><span class="token number">1</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./node<span class="token punctuation">-</span>1/conf/redis.conf<span class="token punctuation">:</span>/usr/local/etc/redis/redis.conf
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;8001:8001&quot;</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;18001:18001&quot;</span>
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;redis-server&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/usr/local/etc/redis/redis.conf&quot;</span><span class="token punctuation">]</span>
  <span class="token comment"># redis2配置</span>
  <span class="token key atrule">redis2</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis<span class="token punctuation">:</span>6.2.5
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> redis<span class="token punctuation">-</span><span class="token number">2</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./node<span class="token punctuation">-</span>2/conf/redis.conf<span class="token punctuation">:</span>/usr/local/etc/redis/redis.conf
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;8002:8002&quot;</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;18002:18002&quot;</span>
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;redis-server&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/usr/local/etc/redis/redis.conf&quot;</span><span class="token punctuation">]</span>
  <span class="token comment"># redis3配置</span>
  <span class="token key atrule">redis3</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis<span class="token punctuation">:</span>6.2.5
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> redis<span class="token punctuation">-</span><span class="token number">3</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./node<span class="token punctuation">-</span>3/conf/redis.conf<span class="token punctuation">:</span>/usr/local/etc/redis/redis.conf
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;8003:8003&quot;</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;18003:18003&quot;</span>
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;redis-server&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/usr/local/etc/redis/redis.conf&quot;</span><span class="token punctuation">]</span>
  <span class="token comment"># redis4配置</span>
  <span class="token key atrule">redis4</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis<span class="token punctuation">:</span>6.2.5
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> redis<span class="token punctuation">-</span><span class="token number">4</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./node<span class="token punctuation">-</span>4/conf/redis.conf<span class="token punctuation">:</span>/usr/local/etc/redis/redis.conf
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;8004:8004&quot;</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;18004:18004&quot;</span>
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;redis-server&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/usr/local/etc/redis/redis.conf&quot;</span><span class="token punctuation">]</span>
  <span class="token comment"># redis5配置</span>
  <span class="token key atrule">redis5</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis<span class="token punctuation">:</span>6.2.5
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> redis<span class="token punctuation">-</span><span class="token number">5</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./node<span class="token punctuation">-</span>5/conf/redis.conf<span class="token punctuation">:</span>/usr/local/etc/redis/redis.conf
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;8005:8005&quot;</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;18005:18005&quot;</span>
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;redis-server&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/usr/local/etc/redis/redis.conf&quot;</span><span class="token punctuation">]</span>
  <span class="token comment"># redis6配置</span>
  <span class="token key atrule">redis6</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis<span class="token punctuation">:</span>6.2.5
    <span class="token key atrule">container_name</span><span class="token punctuation">:</span> redis<span class="token punctuation">-</span><span class="token number">6</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./node<span class="token punctuation">-</span>6/conf/redis.conf<span class="token punctuation">:</span>/usr/local/etc/redis/redis.conf
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;8006:8006&quot;</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;18006:18006&quot;</span>
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;redis-server&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/usr/local/etc/redis/redis.conf&quot;</span><span class="token punctuation">]</span>

<span class="token comment">#redis-cli --cluster create 192.168.1.110:8001 192.168.1.110:8002 192.168.1.110:8003 192.168.1.110:8004 192.168.1.110:8005 192.168.1.110:8006 --cluster-replicas 0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="资料" tabindex="-1"><a class="header-anchor" href="#资料" aria-hidden="true">#</a> 资料</h2>`,13),u={href:"https://cloud.tencent.com/developer/article/1838120",target:"_blank",rel:"noopener noreferrer"};function d(k,v){const s=e("ExternalLinkIcon");return t(),i("div",null,[r,n("p",null,[n("a",u,[p("Docker搭建Redis Cluster集群 "),c(s)])])])}const f=a(o,[["render",d],["__file","Docker搭建redis集群.html.vue"]]);export{f as default};
