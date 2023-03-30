import{_ as e,X as n,Y as i,a1 as a}from"./framework-dc96d9cf.js";const s={},d=a(`<h1 id="简单几步-windows下clion结合docker调试openjdk8源码" tabindex="-1"><a class="header-anchor" href="#简单几步-windows下clion结合docker调试openjdk8源码" aria-hidden="true">#</a> 简单几步！Windows下Clion结合docker调试openjdk8源码</h1><blockquote><p>废话不多说，开干！</p></blockquote><p>原理是通过Docker编译openjdk，然后结合clion通过gdbserver远程调试</p><h2 id="环境需求" tabindex="-1"><a class="header-anchor" href="#环境需求" aria-hidden="true">#</a> 环境需求</h2><ul><li>Clion</li><li>Docker</li></ul><p>我测试的版本</p><p>Docker for windows : <code>Docker version 20.10.2, build 2291f61</code></p><p>Clion : <code>2020.3.1</code></p><h1 id="构建镜像" tabindex="-1"><a class="header-anchor" href="#构建镜像" aria-hidden="true">#</a> 构建镜像</h1><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> clone https://e.coding.net/javalistcn/openjdk/build-openjdk-8.git
<span class="token builtin class-name">cd</span>  build-openjdk-8
<span class="token function">docker</span> build <span class="token parameter variable">-t</span> build-openjdk-8 <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="运行" tabindex="-1"><a class="header-anchor" href="#运行" aria-hidden="true">#</a> 运行</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">docker</span> run <span class="token parameter variable">-it</span> <span class="token parameter variable">--name</span> build-openjdk-8 <span class="token parameter variable">-p</span> <span class="token number">1234</span>:1234 build-openjdk-8
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>1234端口用于gdbserver 这个非常重要！！！</p></blockquote><h2 id="编译" tabindex="-1"><a class="header-anchor" href="#编译" aria-hidden="true">#</a> 编译</h2><p>进入到容器后执行</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> jdk-jdk8-b120/

<span class="token comment"># 删除adjust-mflags.sh的67行，不然编译会报错</span>
<span class="token function">sed</span> <span class="token parameter variable">-i</span> <span class="token string">&#39;67d&#39;</span> hotspot/make/linux/makefiles/adjust-mflags.sh

<span class="token function">bash</span> ./configure --with-target-bits<span class="token operator">=</span><span class="token number">64</span> --with-debug-level<span class="token operator">=</span>slowdebug --enable-debug-symbols --with-boot-jdk<span class="token operator">=</span>/openjdk/java-se-7u75-ri --with-freetype-include<span class="token operator">=</span>/usr/include/freetype2/ --with-freetype-lib<span class="token operator">=</span>/usr/lib/x86_64-linux-gnu <span class="token assign-left variable">ZIP_DEBUGINFO_FILES</span><span class="token operator">=</span><span class="token number">0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>正常输出</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>====================================================
A new configuration has been successfully created in
/openjdk/jdk-jdk8-b120/build/linux-x86_64-normal-server-slowdebug
using configure arguments &#39;--with-target-bits=64 --with-debug-level=slowdebug --enable-debug-symbols --with-boot-jdk=/openjdk/java-se-7u75-ri --with-freetype-include=/usr/include/freetype2/ --with-freetype-lib=/usr/lib/x86_64-linux-gnu ZIP_DEBUGINFO_FILES=0&#39;.

Configuration summary:
* Debug level:    slowdebug
* JDK variant:    normal
* JVM variants:   server
* OpenJDK target: OS: linux, CPU architecture: x86, address length: 64

Tools summary:
* Boot JDK:       openjdk version &quot;1.7.0_75&quot; OpenJDK Runtime Environment (build 1.7.0_75-b13) OpenJDK 64-Bit Server VM (build 24.75-b04, mixed mode)  (at /openjdk/java-se-7u75-ri)
* C Compiler:     gcc-5 (Ubuntu 5.4.0-6ubuntu1~16.04.12) 5.4.0 version 20160609 (at /usr/bin/gcc-5)
* C++ Compiler:   g++-5 (Ubuntu 5.4.0-6ubuntu1~16.04.12) 5.4.0 version 20160609 (at /usr/bin/g++-5)

Build performance summary:
* Cores to use:   4
* Memory limit:   12698 MB
* ccache status:  not installed (consider installing)

Build performance tip: ccache gives a tremendous speedup for C++ recompilations.
You do not have ccache installed. Try installing it.
You might be able to fix this by running &#39;sudo apt-get install ccache&#39;.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">make</span> all <span class="token assign-left variable">DISABLE_HOTSPOT_OS_VERSION_CHECK</span><span class="token operator">=</span>OK <span class="token assign-left variable">ZIP_DEBUGINFO_FILES</span><span class="token operator">=</span><span class="token number">0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>一杯咖啡时间过后看到一下内容输出就大功告成了。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>----- Build times -------
Start 2021-01-15 00:57:13
End   2021-01-15 01:05:57
00:00:27 corba
00:00:14 demos
00:01:40 docs
00:02:15 hotspot
00:00:18 images
00:00:17 jaxp
00:00:20 jaxws
00:02:31 jdk
00:00:30 langtools
00:00:12 nashorn
00:08:44 TOTAL
-------------------------
Finished building OpenJDK for target &#39;all&#39;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="clion配置" tabindex="-1"><a class="header-anchor" href="#clion配置" aria-hidden="true">#</a> Clion配置</h2><p>把<code>jdk-jdk8-b120.tar.gz</code>解压，用clion打开项目（open -&gt; 选择jdk-jdk8-b120目录）</p><p>添加GDB Remote Debug配置如下图</p><figure><img src="https://imgkr2.cn-bj.ufileos.com/802200f7-8207-4a14-bb60-b9c25f034761.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&amp;Signature=RNqVlvKrjJ0USEtSwsPaZj5kIw8%3D&amp;Expires=1610773857" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>进入容器，cd到<code>/openjdk/jdk-jdk8-b120/build/linux-x86_64-normal-server-slowdebug/jdk/bin</code>，执行<code>gdbserver</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>gdbserver :1234 ./java
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>正常输出</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>Process ./java created; pid = 5642
Listening on port 1234
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>下一步 <img src="https://imgkr2.cn-bj.ufileos.com/11fa784a-fd90-4f93-abed-fe619a65d6cc.png?UCloudPublicKey=TOKEN_8d8b72be-579a-4e83-bfd0-5f6ce1546f13&amp;Signature=S%2BrRHBbHdxm3cjs8U7ypLT4x7Og%3D&amp;Expires=1610773856" alt="" loading="lazy"></p><p>等待一会儿，程序就停在断点上了。</p><figure><img src="https://static01.imgkr.com/temp/381539d2acf34a07a0127584264b0396.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>后面的操作就和idea一样了，但是如果没了解过gdb的可以找找资料学习下。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><h3 id="步骤" tabindex="-1"><a class="header-anchor" href="#步骤" aria-hidden="true">#</a> 步骤</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>1. git clone https://e.coding.net/javalistcn/openjdk/build-openjdk-8.git
2. cd  build-openjdk-8
3. docker build -t build-openjdk-8 .
4. cd jdk-jdk8-b120/
5. sed -i &#39;67d&#39; hotspot/make/linux/makefiles/adjust-mflags.sh
6. bash ./configure --with-target-bits=64 --with-debug-level=slowdebug --enable-debug-symbols --with-boot-jdk=/openjdk/java-se-7u75-ri --with-freetype-include=/usr/include/freetype2/ --with-freetype-lib=/usr/lib/x86_64-linux-gnu ZIP_DEBUGINFO_FILES=0
7. make all DISABLE_HOTSPOT_OS_VERSION_CHECK=OK ZIP_DEBUGINFO_FILES=0
8. 配置clion
9. 运行gdbserver
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="https://image-static.segmentfault.com/235/214/2352149115-600132dbe57c7" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure>`,37),l=[d];function r(t,c){return n(),i("div",null,l)}const u=e(s,[["render",r],["__file","Windows下Clion结合docker调试openjdk8源码.html.vue"]]);export{u as default};
