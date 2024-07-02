import{_ as p}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as c,o,c as i,a as s,b as n,d as t,e}from"./app-Bq0Sc4vP.js";const l={},u=e('<h1 id="动态执行代码逻辑" tabindex="-1"><a class="header-anchor" href="#动态执行代码逻辑"><span>动态执行代码逻辑</span></a></h1><p>动态执行逻辑的方法据我所知有一下两种方式</p><ul><li>QLExpress</li><li>Groovy</li></ul><h1 id="qlexpress" tabindex="-1"><a class="header-anchor" href="#qlexpress"><span>QLExpress</span></a></h1><p>QLExpress是阿里开源的动态脚本执行的项目。 由阿里的电商业务规则、表达式（布尔组合）、特殊数学公式计算（高精度）、语法分析、脚本二次定制等强需求而设计的一门动态脚本引擎解析工具。 在阿里集团有很强的影响力，同时为了自身不断优化、发扬开源贡献精神，于2012年开源。</p><p>https://github.com/alibaba/QLExpress</p><blockquote><p>这种方案在配置上感觉不太方便，原因是没有IDE支持、某些JAVA语法不支持。。。</p></blockquote><h1 id="groovy" tabindex="-1"><a class="header-anchor" href="#groovy"><span>Groovy</span></a></h1><blockquote><p>来着百度百科</p></blockquote>',9),r={href:"https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E6%9C%BA",target:"_blank",rel:"noopener noreferrer"},d={href:"https://baike.baidu.com/item/%E5%8A%A8%E6%80%81%E8%AF%AD%E8%A8%80",target:"_blank",rel:"noopener noreferrer"},k={href:"https://baike.baidu.com/item/%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1",target:"_blank",rel:"noopener noreferrer"},m={href:"https://baike.baidu.com/item/%E8%84%9A%E6%9C%AC%E8%AF%AD%E8%A8%80",target:"_blank",rel:"noopener noreferrer"},v={href:"https://baike.baidu.com/item/%E9%97%AD%E5%8C%85",target:"_blank",rel:"noopener noreferrer"},b={href:"https://baike.baidu.com/item/JVM",target:"_blank",rel:"noopener noreferrer"},g={href:"https://baike.baidu.com/item/Spring",target:"_blank",rel:"noopener noreferrer"},y=e(`<h2 id="原理" tabindex="-1"><a class="header-anchor" href="#原理"><span>原理</span></a></h2><p>通过Groovy提供的GroovyClassLoader把源代码动态加载编译成Class，Class再实例化成对象</p><h2 id="动手实现" tabindex="-1"><a class="header-anchor" href="#动手实现"><span>动手实现</span></a></h2><p>依赖</p><div class="language-xml line-numbers-mode" data-ext="xml" data-title="xml"><pre class="language-xml"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.codehaus.groovy<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>groovy<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>3.0.0-rc-1<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
<span class="token comment">&lt;!--hutool 工具包，不是核心--&gt;</span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>cn.hutool<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>hutool-all<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span>
	<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>5.0.3<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol><li>创建动态脚本工厂,<code>inject</code>方法用于扩展。</li></ol><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">cn<span class="token punctuation">.</span>dhbin<span class="token punctuation">.</span>dynamic</span><span class="token punctuation">;</span>

<span class="token keyword">import</span> <span class="token import"><span class="token namespace">cn<span class="token punctuation">.</span>hutool<span class="token punctuation">.</span>core<span class="token punctuation">.</span>util<span class="token punctuation">.</span></span><span class="token class-name">StrUtil</span></span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token import"><span class="token namespace">cn<span class="token punctuation">.</span>hutool<span class="token punctuation">.</span>crypto<span class="token punctuation">.</span></span><span class="token class-name">SecureUtil</span></span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token import"><span class="token namespace">groovy<span class="token punctuation">.</span>lang<span class="token punctuation">.</span></span><span class="token class-name">GroovyClassLoader</span></span><span class="token punctuation">;</span>

<span class="token keyword">import</span> <span class="token import"><span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span>concurrent<span class="token punctuation">.</span></span><span class="token class-name">ConcurrentHashMap</span></span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * 动态脚本工厂
 * 作用：
 * 通过字符串源码生成Class
 * Class -&gt; 实例
 *
 * <span class="token keyword">@author</span> donghaibin
 * <span class="token keyword">@date</span> 2019/11/19
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DynamicFactory</span> <span class="token punctuation">{</span>

	<span class="token doc-comment comment">/**
	 * 单例
	 */</span>
	<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token class-name">DynamicFactory</span> dynamicFactory <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">DynamicFactory</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token doc-comment comment">/**
	 * groovy类加载器
	 */</span>
	<span class="token keyword">private</span> <span class="token class-name">GroovyClassLoader</span> groovyClassLoader <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">GroovyClassLoader</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token doc-comment comment">/**
	 * 缓存Class
	 */</span>
	<span class="token keyword">private</span> <span class="token class-name">ConcurrentHashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">Class</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">&gt;</span></span> classCache <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ConcurrentHashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token doc-comment comment">/**
	 * 获取单例
	 *
	 * <span class="token keyword">@return</span> 实例
	 */</span>
	<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token class-name">DynamicFactory</span> <span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> dynamicFactory<span class="token punctuation">;</span>
	<span class="token punctuation">}</span>


	<span class="token doc-comment comment">/**
	 * 加载创建实例，prototype
	 *
	 * <span class="token keyword">@param</span> <span class="token parameter">codeSource</span> 源代码
	 * <span class="token keyword">@return</span> 实例
	 * <span class="token keyword">@throws</span> <span class="token reference"><span class="token class-name">Exception</span></span> 异常
	 */</span>
	<span class="token keyword">public</span> <span class="token class-name">IScript</span> <span class="token function">loadNewInstance</span><span class="token punctuation">(</span><span class="token class-name">String</span> codeSource<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">Exception</span> <span class="token punctuation">{</span>
		<span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token class-name">StrUtil</span><span class="token punctuation">.</span><span class="token function">isNotBlank</span><span class="token punctuation">(</span>codeSource<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> aClass <span class="token operator">=</span> <span class="token function">getCodeSourceClass</span><span class="token punctuation">(</span>codeSource<span class="token punctuation">)</span><span class="token punctuation">;</span>
			<span class="token keyword">if</span> <span class="token punctuation">(</span>aClass <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
				<span class="token class-name">Object</span> instance <span class="token operator">=</span> aClass<span class="token punctuation">.</span><span class="token function">newInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
				<span class="token keyword">if</span> <span class="token punctuation">(</span>instance <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
					<span class="token keyword">if</span> <span class="token punctuation">(</span>instance <span class="token keyword">instanceof</span> <span class="token class-name">IScript</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
						<span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">inject</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">IScript</span><span class="token punctuation">)</span> instance<span class="token punctuation">)</span><span class="token punctuation">;</span>
						<span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token class-name">IScript</span><span class="token punctuation">)</span> instance<span class="token punctuation">;</span>
					<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
						<span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token class-name">StrUtil</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token string">&quot;创建实例失败，[{}]不是IScript的子类&quot;</span><span class="token punctuation">,</span> instance<span class="token punctuation">.</span><span class="token function">getClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
					<span class="token punctuation">}</span>
				<span class="token punctuation">}</span>
			<span class="token punctuation">}</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;创建实例失败，instance is null&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>

	<span class="token doc-comment comment">/**
	 * code text -&gt; class
	 * 通过类加载器生成class
	 *
	 * <span class="token keyword">@param</span> <span class="token parameter">codeSource</span> 源代码
	 * <span class="token keyword">@return</span> class
	 */</span>
	<span class="token keyword">private</span> <span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> <span class="token function">getCodeSourceClass</span><span class="token punctuation">(</span><span class="token class-name">String</span> codeSource<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token class-name">String</span> md5 <span class="token operator">=</span> <span class="token class-name">SecureUtil</span><span class="token punctuation">.</span><span class="token function">md5</span><span class="token punctuation">(</span>codeSource<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token class-name">Class</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span></span> aClass <span class="token operator">=</span> classCache<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>md5<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token keyword">if</span> <span class="token punctuation">(</span>aClass <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			aClass <span class="token operator">=</span> groovyClassLoader<span class="token punctuation">.</span><span class="token function">parseClass</span><span class="token punctuation">(</span>codeSource<span class="token punctuation">)</span><span class="token punctuation">;</span>
			classCache<span class="token punctuation">.</span><span class="token function">putIfAbsent</span><span class="token punctuation">(</span>md5<span class="token punctuation">,</span> aClass<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">return</span> aClass<span class="token punctuation">;</span>
	<span class="token punctuation">}</span>


	<span class="token doc-comment comment">/**
	 * 对script对象处理
	 *
	 * <span class="token keyword">@param</span> <span class="token parameter">script</span> <span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">IScript</span></span><span class="token punctuation">}</span>
	 */</span>
	<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">inject</span><span class="token punctuation">(</span><span class="token class-name">IScript</span> script<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token comment">// to do something</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>定义脚本模板</li></ol><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">cn<span class="token punctuation">.</span>dhbin<span class="token punctuation">.</span>dynamic</span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * 脚本接口，所有脚本实现该接口的<span class="token punctuation">{</span><span class="token keyword">@link</span> <span class="token reference"><span class="token class-name">IScript</span><span class="token punctuation">#</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span></span><span class="token punctuation">}</span>方法
 *
 * <span class="token keyword">@author</span> donghaibin
 * <span class="token keyword">@date</span> 2019/11/19
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">IScript</span> <span class="token punctuation">{</span>

	<span class="token doc-comment comment">/**
	 * 具体逻辑
	 *
	 * <span class="token keyword">@param</span> <span class="token parameter">param</span> 参数
	 * <span class="token keyword">@return</span> 执行结果
	 */</span>
	<span class="token class-name">String</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token class-name">String</span> param<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="3"><li>脚本执行器</li></ol><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">cn<span class="token punctuation">.</span>dhbin<span class="token punctuation">.</span>dynamic</span><span class="token punctuation">;</span>

<span class="token keyword">import</span> <span class="token import"><span class="token namespace">java<span class="token punctuation">.</span>util<span class="token punctuation">.</span>concurrent<span class="token punctuation">.</span></span><span class="token class-name">ConcurrentHashMap</span></span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * <span class="token keyword">@author</span> donghaibin
 * <span class="token keyword">@date</span> 2019/11/19
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ScriptExecutor</span> <span class="token punctuation">{</span>

	<span class="token doc-comment comment">/**
	 * 缓存实例
	 */</span>
	<span class="token keyword">private</span> <span class="token class-name">ConcurrentHashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">,</span> <span class="token class-name">IScript</span><span class="token punctuation">&gt;</span></span> objCache <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ConcurrentHashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token doc-comment comment">/**
	 * 执行脚本
	 *
	 * <span class="token keyword">@param</span> <span class="token parameter">id</span> 实例Id
	 * <span class="token keyword">@return</span> 运行结果
	 */</span>
	<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token class-name">String</span> id<span class="token punctuation">,</span> <span class="token class-name">String</span> param<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token class-name">IScript</span> script <span class="token operator">=</span> objCache<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token keyword">if</span> <span class="token punctuation">(</span>script <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token string">&quot;未找到实例, id = [&quot;</span> <span class="token operator">+</span> id <span class="token operator">+</span> <span class="token string">&quot;]&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
			<span class="token keyword">return</span> script<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span>param<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>

	<span class="token doc-comment comment">/**
	 * 注册实例
	 *
	 * <span class="token keyword">@param</span> <span class="token parameter">id</span> 实例id
	 * <span class="token keyword">@param</span> <span class="token parameter">script</span> 实例
	 * <span class="token keyword">@return</span> 返回前一个实例，如果为null，则是新插入
	 */</span>
	<span class="token keyword">public</span> <span class="token class-name">IScript</span> <span class="token function">register</span><span class="token punctuation">(</span><span class="token class-name">String</span> id<span class="token punctuation">,</span> <span class="token class-name">IScript</span> script<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> objCache<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span>id<span class="token punctuation">,</span> script<span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>

	<span class="token doc-comment comment">/**
	 * 移除实例
	 *
	 * <span class="token keyword">@param</span> <span class="token parameter">id</span> 实例id
	 * <span class="token keyword">@return</span> 移除的实例
	 */</span>
	<span class="token keyword">public</span> <span class="token class-name">IScript</span> <span class="token function">remove</span><span class="token punctuation">(</span><span class="token class-name">String</span> id<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token keyword">return</span> objCache<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>


<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>到这里，就基本实现了脚本的加载-实例化-执行。下面测试</p><h2 id="编写脚本" tabindex="-1"><a class="header-anchor" href="#编写脚本"><span>编写脚本</span></a></h2><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">cn<span class="token punctuation">.</span>dhbin<span class="token punctuation">.</span>dynamic</span><span class="token punctuation">;</span>

<span class="token keyword">import</span> <span class="token import"><span class="token namespace">org<span class="token punctuation">.</span>slf4j<span class="token punctuation">.</span></span><span class="token class-name">Logger</span></span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token import"><span class="token namespace">org<span class="token punctuation">.</span>slf4j<span class="token punctuation">.</span></span><span class="token class-name">LoggerFactory</span></span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * <span class="token keyword">@author</span> donghaibin
 * <span class="token keyword">@date</span> 2019/11/19
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SimpleScript</span> <span class="token keyword">implements</span> <span class="token class-name">IScript</span><span class="token punctuation">{</span>

	<span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Logger</span> log <span class="token operator">=</span> <span class="token class-name">LoggerFactory</span><span class="token punctuation">.</span><span class="token function">getLogger</span><span class="token punctuation">(</span><span class="token class-name">SimpleScript</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token annotation punctuation">@Override</span>
	<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token class-name">String</span> param<span class="token punctuation">)</span> <span class="token punctuation">{</span>
		log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;输入的参数是:[{}]&quot;</span><span class="token punctuation">,</span> param<span class="token punctuation">)</span><span class="token punctuation">;</span>
		log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;你好世界&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token keyword">return</span> <span class="token string">&quot;hello world&quot;</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>

<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="测试用例" tabindex="-1"><a class="header-anchor" href="#测试用例"><span>测试用例</span></a></h2><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">package</span> <span class="token namespace">com<span class="token punctuation">.</span>pig4cloud<span class="token punctuation">.</span>pig<span class="token punctuation">.</span>sms<span class="token punctuation">.</span>dynamic</span><span class="token punctuation">;</span>

<span class="token keyword">import</span> <span class="token import"><span class="token namespace">lombok<span class="token punctuation">.</span>extern<span class="token punctuation">.</span>slf4j<span class="token punctuation">.</span></span><span class="token class-name">Slf4j</span></span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token import"><span class="token namespace">org<span class="token punctuation">.</span>junit<span class="token punctuation">.</span>jupiter<span class="token punctuation">.</span>api<span class="token punctuation">.</span></span><span class="token class-name">Test</span></span><span class="token punctuation">;</span>

<span class="token doc-comment comment">/**
 * <span class="token keyword">@author</span> donghaibin
 * <span class="token keyword">@date</span> 2019/11/19
 */</span>
<span class="token annotation punctuation">@Slf4j</span>
<span class="token keyword">class</span> <span class="token class-name">DynamicFactoryTest</span> <span class="token punctuation">{</span>

	<span class="token annotation punctuation">@Test</span>
	<span class="token keyword">void</span> <span class="token function">runWithExecutor</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">Exception</span> <span class="token punctuation">{</span>
		<span class="token class-name">DynamicFactory</span> dynamicFactory <span class="token operator">=</span> <span class="token class-name">DynamicFactory</span><span class="token punctuation">.</span><span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token class-name">ScriptExecutor</span> executor <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ScriptExecutor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token class-name">String</span> codeSource <span class="token operator">=</span> <span class="token string">&quot;package cn.dhbin.dynamic;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;import org.slf4j.Logger;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;import org.slf4j.LoggerFactory;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;/**\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot; * @author donghaibin\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot; * @date 2019/11/19\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot; */\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;public class SimpleScript implements IScript{\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\tprivate static final Logger log = LoggerFactory.getLogger(SimpleScript.class);\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t@Override\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\tpublic String run(String param) {\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t\\tlog.info(\\&quot;输入的参数是:[{}]\\&quot;, param);\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t\\tlog.info(\\&quot;你好世界\\&quot;);\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t\\treturn \\&quot;hello world\\&quot;;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t}\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;}\\n&quot;</span><span class="token punctuation">;</span>
		<span class="token class-name">IScript</span> script <span class="token operator">=</span> dynamicFactory<span class="token punctuation">.</span><span class="token function">loadNewInstance</span><span class="token punctuation">(</span>codeSource<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token class-name">String</span> id <span class="token operator">=</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">;</span>
		executor<span class="token punctuation">.</span><span class="token function">register</span><span class="token punctuation">(</span>id<span class="token punctuation">,</span> script<span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token class-name">String</span> result <span class="token operator">=</span> executor<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span>id<span class="token punctuation">,</span> <span class="token string">&quot;abc&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
			log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;结果:[{}]&quot;</span><span class="token punctuation">,</span> result<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>

	<span class="token punctuation">}</span>

	<span class="token annotation punctuation">@Test</span>
	<span class="token keyword">void</span> <span class="token function">runWithoutExecutor</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">Exception</span><span class="token punctuation">{</span>
		<span class="token class-name">DynamicFactory</span> dynamicFactory <span class="token operator">=</span> <span class="token class-name">DynamicFactory</span><span class="token punctuation">.</span><span class="token function">getInstance</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token class-name">String</span> codeSource <span class="token operator">=</span> <span class="token string">&quot;package cn.dhbin.dynamic;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;import org.slf4j.Logger;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;import org.slf4j.LoggerFactory;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;/**\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot; * @author donghaibin\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot; * @date 2019/11/19\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot; */\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;public class SimpleScript implements IScript{\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\tprivate static final Logger log = LoggerFactory.getLogger(SimpleScript.class);\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t@Override\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\tpublic String run(String param) {\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t\\tlog.info(\\&quot;输入的参数是:[{}]\\&quot;, param);\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t\\tlog.info(\\&quot;你好世界\\&quot;);\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t\\treturn \\&quot;hello world\\&quot;;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\t}\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;\\n&quot;</span> <span class="token operator">+</span>
			<span class="token string">&quot;}\\n&quot;</span><span class="token punctuation">;</span>

		<span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
			<span class="token class-name">IScript</span> script <span class="token operator">=</span> dynamicFactory<span class="token punctuation">.</span><span class="token function">loadNewInstance</span><span class="token punctuation">(</span>codeSource<span class="token punctuation">)</span><span class="token punctuation">;</span>
			<span class="token class-name">String</span> result <span class="token operator">=</span> script<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token string">&quot;abc&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
			log<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;结果:[{}]&quot;</span><span class="token punctuation">,</span> result<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
	<span class="token punctuation">}</span>


<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="执行结果" tabindex="-1"><a class="header-anchor" href="#执行结果"><span>执行结果</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>11:19:32.243 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.255 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.255 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.255 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.255 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.255 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.255 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.255 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.256 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.256 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.256 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.256 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.256 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.256 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.256 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.256 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
11:19:32.256 [main] INFO cn.dhbin.dynamic.SimpleScript - 输入的参数是:[abc]
11:19:32.256 [main] INFO cn.dhbin.dynamic.SimpleScript - 你好世界
11:19:32.256 [main] INFO cn.dhbin.dynamic.DynamicFactoryTest - 结果:[hello world]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>两个用例执行的结果都一样，区别就是一个使用了执行器。这样做的目的是提高运行效率，执行器缓存了实例对象，不用每次执行都实例化。</p><h1 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h1><p>Groovy这种方案其实是从<code>xxl-job</code>这个定时任务项目中提取出来的。它还扩展了Spring的几个注解，能从Spring的容器中加载Bean并使用。项目链接： https://gitee.com/xuxueli0323/xxl-job</p>`,21),h={href:"https://gitee.com/xuxueli0323/xxl-job/blob/master/xxl-job-core/src/main/java/com/xxl/job/core/glue/impl/SpringGlueFactory.java",target:"_blank",rel:"noopener noreferrer"},w=s("h1",{id:"思考",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#思考"},[s("span",null,"思考")])],-1),q=s("p",null,"通过groovy动态加载Class，再结合Spring的生命周期，是否可以实现动态添加Bean？是否可以实现动态添加Controller？",-1);function S(f,x){const a=c("ExternalLinkIcon");return o(),i("div",null,[u,s("p",null,[n("Groovy 是 用于Java"),s("a",r,[n("虚拟机"),t(a)]),n("的一种敏捷的"),s("a",d,[n("动态语言"),t(a)]),n("，它是一种成熟的"),s("a",k,[n("面向对象"),t(a)]),n("编程语言，既可以用于面向对象编程，又可以用作纯粹的"),s("a",m,[n("脚本语言"),t(a)]),n("。使用该种语言不必编写过多的代码，同时又具有"),s("a",v,[n("闭包"),t(a)]),n("和动态语言中的其他特性。")]),s("p",null,[n("Groovy是"),s("a",b,[n("JVM"),t(a)]),n("的一个替代语言（替代是指可以用 Groovy 在Java平台上进行 Java 编程），使用方式基本与使用 Java代码的方式相同，该语言特别适合与"),s("a",g,[n("Spring"),t(a)]),n("的动态语言支持一起使用，设计时充分考虑了Java集成，这使 Groovy 与 Java 代码的互操作很容易。（注意：不是指Groovy替代java，而是指Groovy和java很好的结合编程。")]),y,s("p",null,[s("a",h,[n("SpringGlueFactory"),t(a)])]),w,q])}const E=p(l,[["render",S],["__file","动态执行代码逻辑.html.vue"]]),_=JSON.parse('{"path":"/tech/java/%E5%8A%A8%E6%80%81%E6%89%A7%E8%A1%8C%E4%BB%A3%E7%A0%81%E9%80%BB%E8%BE%91.html","title":"动态执行代码逻辑","lang":"zh-CN","frontmatter":{"date":"2019-11-19T11:29:00.000Z","category":["Java"],"tag":["Groovy","动态加载"],"description":"动态执行代码逻辑 动态执行逻辑的方法据我所知有一下两种方式 QLExpress Groovy QLExpress QLExpress是阿里开源的动态脚本执行的项目。 由阿里的电商业务规则、表达式（布尔组合）、特殊数学公式计算（高精度）、语法分析、脚本二次定制等强需求而设计的一门动态脚本引擎解析工具。 在阿里集团有很强的影响力，同时为了自身不断优化、发扬...","head":[["meta",{"property":"og:url","content":"https://dhbin.cn/tech/java/%E5%8A%A8%E6%80%81%E6%89%A7%E8%A1%8C%E4%BB%A3%E7%A0%81%E9%80%BB%E8%BE%91.html"}],["meta",{"property":"og:site_name","content":"HB技术栈"}],["meta",{"property":"og:title","content":"动态执行代码逻辑"}],["meta",{"property":"og:description","content":"动态执行代码逻辑 动态执行逻辑的方法据我所知有一下两种方式 QLExpress Groovy QLExpress QLExpress是阿里开源的动态脚本执行的项目。 由阿里的电商业务规则、表达式（布尔组合）、特殊数学公式计算（高精度）、语法分析、脚本二次定制等强需求而设计的一门动态脚本引擎解析工具。 在阿里集团有很强的影响力，同时为了自身不断优化、发扬..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-22T17:33:14.000Z"}],["meta",{"property":"article:author","content":"DHB"}],["meta",{"property":"article:tag","content":"Groovy"}],["meta",{"property":"article:tag","content":"动态加载"}],["meta",{"property":"article:published_time","content":"2019-11-19T11:29:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-03-22T17:33:14.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"动态执行代码逻辑\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2019-11-19T11:29:00.000Z\\",\\"dateModified\\":\\"2023-03-22T17:33:14.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"DHB\\",\\"url\\":\\"https://dhbin.cn\\"}]}"]]},"headers":[{"level":2,"title":"原理","slug":"原理","link":"#原理","children":[]},{"level":2,"title":"动手实现","slug":"动手实现","link":"#动手实现","children":[]},{"level":2,"title":"编写脚本","slug":"编写脚本","link":"#编写脚本","children":[]},{"level":2,"title":"测试用例","slug":"测试用例","link":"#测试用例","children":[]},{"level":2,"title":"执行结果","slug":"执行结果","link":"#执行结果","children":[]}],"git":{"createdTime":1679384580000,"updatedTime":1679506394000,"contributors":[{"name":"dhb","email":"xx158@qq.com","commits":1},{"name":"donghaibin","email":"xx158@qq.com","commits":1}]},"readingTime":{"minutes":5.85,"words":1755},"localizedDate":"2019年11月19日","excerpt":"\\n<p>动态执行逻辑的方法据我所知有一下两种方式</p>\\n<ul>\\n<li>QLExpress</li>\\n<li>Groovy</li>\\n</ul>\\n<h1>QLExpress</h1>\\n<p>QLExpress是阿里开源的动态脚本执行的项目。 由阿里的电商业务规则、表达式（布尔组合）、特殊数学公式计算（高精度）、语法分析、脚本二次定制等强需求而设计的一门动态脚本引擎解析工具。 在阿里集团有很强的影响力，同时为了自身不断优化、发扬开源贡献精神，于2012年开源。</p>\\n<p>https://github.com/alibaba/QLExpress</p>\\n<blockquote>\\n<p>这种方案在配置上感觉不太方便，原因是没有IDE支持、某些JAVA语法不支持。。。</p>\\n</blockquote>","autoDesc":true}');export{E as comp,_ as data};
