import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as s,c as a,e}from"./app-Bq0Sc4vP.js";const t={},p=e(`<h1 id="jdk7-hashmap" tabindex="-1"><a class="header-anchor" href="#jdk7-hashmap"><span>JDK7-HashMap</span></a></h1><h1 id="前言" tabindex="-1"><a class="header-anchor" href="#前言"><span>前言</span></a></h1><p>现在一般都JDK8了，为什么还要说JDK7呢。因为JDK7和JDK8的hashmap实现不一样，JDK7是用数组+链表实现的，而JDK8是红黑树。学习都是个慢慢渐进的过程。</p><h1 id="实现" tabindex="-1"><a class="header-anchor" href="#实现"><span>实现</span></a></h1><p>时间复杂度：</p><table><thead><tr><th></th><th>读取</th><th>插入</th><th>删除</th></tr></thead><tbody><tr><td>数组</td><td>O(1)</td><td>O(n)</td><td>O(n)</td></tr><tr><td>链表</td><td>O(n)</td><td>O(1)</td><td>O(1)</td></tr></tbody></table><p>上面提到JDK7是用数组+链表实现的，为什么这样做呢？我们知道数组读取速度快，插入慢，而链表读取慢，插入快，hashmap就是充分利用了数组读取快和链表插入快的特点。数组存着元素的下标，元素插入链表中。那么下标怎么生成呢，hashmap嘛，那肯定是和hashcode有关系，我们生成hashcode看看是啥样的。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Main</span> <span class="token punctuation">{</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">String</span> key <span class="token operator">=</span> <span class="token string">&quot;code&quot;</span> <span class="token operator">+</span> i<span class="token punctuation">;</span>
            <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>key<span class="token punctuation">.</span><span class="token function">hashCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>94834659
94834660
94834661
94834662
94834663
94834664
94834665
94834666
94834667
94834668
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>看到hashcode的值非常大，如果用于当下标的话，数组就要非常大才能把这些元素给存起来，性能也是大打折扣，那有什么办法缩小一点呢，我想到的一种是取余（JDK并不是这么干）</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Main</span> <span class="token punctuation">{</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">String</span> key <span class="token operator">=</span> <span class="token string">&quot;code&quot;</span> <span class="token operator">+</span> i<span class="token punctuation">;</span>
            <span class="token keyword">int</span> hashCode <span class="token operator">=</span> key<span class="token punctuation">.</span><span class="token function">hashCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">int</span> index <span class="token operator">=</span> hashCode <span class="token operator">%</span> <span class="token number">8</span><span class="token punctuation">;</span>
            <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>index<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>3
4
5
6
7
0
1
2
3
4
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下标就控制在8的范围内了，但是又出现了另一个问题：hash冲突了，存在了两个3，两个4。这种情况怎么处理呢？下标一直的都插入到一个链表中，新元素放在头部。（为什么插入头部？因为链表结构插入数据在头部是最快的，只需将指针指向旧的链表即可）</p><p>插入后数据结构如下图：</p><p><img src="http://lc-dnchthtq.cn-n1.lcfile.com/fb8c6b10d48a4b5634cc/手写JDK7HashMap.png" alt=""></p><h1 id="代码" tabindex="-1"><a class="header-anchor" href="#代码"><span>代码</span></a></h1><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * 手写简单的hashMap（1.7版）
 *
 * <span class="token keyword">@author</span> DHB
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyHashMap</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">K</span><span class="token punctuation">,</span> <span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>

    <span class="token doc-comment comment">/**
     * 元素表
     */</span>
    <span class="token keyword">private</span> <span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">K</span><span class="token punctuation">,</span> <span class="token class-name">V</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">[</span><span class="token punctuation">]</span> table<span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 容量
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token keyword">final</span> <span class="token class-name">Integer</span> <span class="token constant">CAPACITY</span> <span class="token operator">=</span> <span class="token number">8</span><span class="token punctuation">;</span>
    <span class="token doc-comment comment">/**
     * 大小
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> size <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">MyHashMap</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>table <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Entry</span><span class="token punctuation">[</span><span class="token constant">CAPACITY</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 获取大小
     *
     * <span class="token keyword">@return</span> 大小
     */</span>
    <span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>size<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>


    <span class="token doc-comment comment">/**
     * 根据key获取value
     *
     * <span class="token keyword">@param</span> <span class="token parameter">key</span> jey
     * <span class="token keyword">@return</span> 元素
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">V</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token class-name">K</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> index <span class="token operator">=</span> <span class="token function">obtainIndex</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">K</span><span class="token punctuation">,</span> <span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> entry <span class="token operator">=</span> table<span class="token punctuation">[</span>index<span class="token punctuation">]</span><span class="token punctuation">;</span> entry <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">;</span> entry <span class="token operator">=</span> entry<span class="token punctuation">.</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>entry<span class="token punctuation">.</span>k<span class="token punctuation">.</span><span class="token function">equals</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">return</span> entry<span class="token punctuation">.</span>v<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 插入，当存在这个key的时候会替换，并且返回
     *
     * <span class="token keyword">@param</span> <span class="token parameter">key</span>   key
     * <span class="token keyword">@param</span> <span class="token parameter">value</span> value
     * <span class="token keyword">@return</span> 旧的元素
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">V</span> <span class="token function">put</span><span class="token punctuation">(</span><span class="token class-name">K</span> key<span class="token punctuation">,</span> <span class="token class-name">V</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> index <span class="token operator">=</span> <span class="token function">obtainIndex</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">K</span><span class="token punctuation">,</span> <span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> entry <span class="token operator">=</span> table<span class="token punctuation">[</span>index<span class="token punctuation">]</span><span class="token punctuation">;</span> entry <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">;</span> entry <span class="token operator">=</span> entry<span class="token punctuation">.</span>next<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>entry<span class="token punctuation">.</span>k<span class="token punctuation">.</span><span class="token function">equals</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token class-name">V</span> oldValue <span class="token operator">=</span> entry<span class="token punctuation">.</span>v<span class="token punctuation">;</span>
                entry<span class="token punctuation">.</span>v <span class="token operator">=</span> value<span class="token punctuation">;</span>
                <span class="token keyword">return</span> oldValue<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token function">addEntry</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">,</span> index<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 添加Entry
     *
     * <span class="token keyword">@param</span> <span class="token parameter">key</span>   key
     * <span class="token keyword">@param</span> <span class="token parameter">value</span> value
     * <span class="token keyword">@param</span> <span class="token parameter">index</span> 下标位置
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">addEntry</span><span class="token punctuation">(</span><span class="token class-name">K</span> key<span class="token punctuation">,</span> <span class="token class-name">V</span> value<span class="token punctuation">,</span> <span class="token keyword">int</span> index<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        table<span class="token punctuation">[</span>index<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Entry</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">,</span> table<span class="token punctuation">[</span>index<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        size<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 通过key获取插入的位置
     *
     * <span class="token keyword">@param</span> <span class="token parameter">key</span> key
     * <span class="token keyword">@return</span> 获取位置
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> <span class="token function">obtainIndex</span><span class="token punctuation">(</span><span class="token class-name">K</span> key<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> hashCode <span class="token operator">=</span> key<span class="token punctuation">.</span><span class="token function">hashCode</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> hashCode <span class="token operator">%</span> <span class="token number">8</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 链表数据结构
     *
     * <span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">&lt;</span>K<span class="token punctuation">&gt;</span></span> key
     * <span class="token keyword">@param</span> <span class="token class-name"><span class="token punctuation">&lt;</span>V<span class="token punctuation">&gt;</span></span> value
     */</span>
    <span class="token keyword">class</span> <span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">K</span><span class="token punctuation">,</span> <span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>

        <span class="token keyword">public</span> <span class="token class-name">Entry</span><span class="token punctuation">(</span><span class="token class-name">K</span> k<span class="token punctuation">,</span> <span class="token class-name">V</span> v<span class="token punctuation">,</span> <span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">K</span><span class="token punctuation">,</span> <span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> next<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">this</span><span class="token punctuation">.</span>k <span class="token operator">=</span> k<span class="token punctuation">;</span>
            <span class="token keyword">this</span><span class="token punctuation">.</span>v <span class="token operator">=</span> v<span class="token punctuation">;</span>
            <span class="token keyword">this</span><span class="token punctuation">.</span>next <span class="token operator">=</span> next<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">private</span> <span class="token class-name">K</span> k<span class="token punctuation">;</span>
        <span class="token keyword">private</span> <span class="token class-name">V</span> v<span class="token punctuation">;</span>
        <span class="token doc-comment comment">/**
         * 指向下一个元素
         */</span>
        <span class="token keyword">private</span> <span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">K</span><span class="token punctuation">,</span> <span class="token class-name">V</span><span class="token punctuation">&gt;</span></span> next<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h1><p>上面的代码很粗糙，但能大概了解了HashMap的工作原理。有很多问题没有解决，下一个笔记再说，先抛出问题。</p><ul><li>HashMap的键值可以为Null吗？原理是什么？</li><li>HashMap扩容机制是怎么样的，JDK7和JDK8有什么不同？</li><li>JDK8中的HashMap有哪些改动？</li><li>JDK8中为什么要使用红黑树？</li><li>为什么重写对象的Equal方法时，要重写HashCode方法，跟HashMap有什么关系吗？</li><li>HashMap是线程安全的吗？遇到ConcurrentModificationException异常吗？为什么？出现怎么解决？</li><li>在使用HashMap的过程中我们应该注意些什么问题？</li></ul>`,22),c=[p];function o(l,i){return s(),a("div",null,c)}const r=n(t,[["render",o],["__file","JDK7-HashMap.html.vue"]]),k=JSON.parse('{"path":"/tech/java/JDK7-HashMap.html","title":"JDK7-HashMap","lang":"zh-CN","frontmatter":{"date":"2019-05-09T18:00:00.000Z","category":["Java"],"tag":["算法"],"description":"JDK7-HashMap 前言 现在一般都JDK8了，为什么还要说JDK7呢。因为JDK7和JDK8的hashmap实现不一样，JDK7是用数组+链表实现的，而JDK8是红黑树。学习都是个慢慢渐进的过程。 实现 时间复杂度： 上面提到JDK7是用数组+链表实现的，为什么这样做呢？我们知道数组读取速度快，插入慢，而链表读取慢，插入快，hashmap就是充...","head":[["meta",{"property":"og:url","content":"https://dhbin.cn/tech/java/JDK7-HashMap.html"}],["meta",{"property":"og:site_name","content":"HB技术栈"}],["meta",{"property":"og:title","content":"JDK7-HashMap"}],["meta",{"property":"og:description","content":"JDK7-HashMap 前言 现在一般都JDK8了，为什么还要说JDK7呢。因为JDK7和JDK8的hashmap实现不一样，JDK7是用数组+链表实现的，而JDK8是红黑树。学习都是个慢慢渐进的过程。 实现 时间复杂度： 上面提到JDK7是用数组+链表实现的，为什么这样做呢？我们知道数组读取速度快，插入慢，而链表读取慢，插入快，hashmap就是充..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"http://lc-dnchthtq.cn-n1.lcfile.com/fb8c6b10d48a4b5634cc/%E6%89%8B%E5%86%99JDK7HashMap.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-22T17:33:14.000Z"}],["meta",{"property":"article:author","content":"DHB"}],["meta",{"property":"article:tag","content":"算法"}],["meta",{"property":"article:published_time","content":"2019-05-09T18:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-03-22T17:33:14.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"JDK7-HashMap\\",\\"image\\":[\\"http://lc-dnchthtq.cn-n1.lcfile.com/fb8c6b10d48a4b5634cc/%E6%89%8B%E5%86%99JDK7HashMap.png\\"],\\"datePublished\\":\\"2019-05-09T18:00:00.000Z\\",\\"dateModified\\":\\"2023-03-22T17:33:14.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"DHB\\",\\"url\\":\\"https://dhbin.cn\\"}]}"]]},"headers":[],"git":{"createdTime":1679384580000,"updatedTime":1679506394000,"contributors":[{"name":"dhb","email":"xx158@qq.com","commits":1}]},"readingTime":{"minutes":3.15,"words":945},"localizedDate":"2019年5月9日","excerpt":"\\n<h1>前言</h1>\\n<p>现在一般都JDK8了，为什么还要说JDK7呢。因为JDK7和JDK8的hashmap实现不一样，JDK7是用数组+链表实现的，而JDK8是红黑树。学习都是个慢慢渐进的过程。</p>\\n<h1>实现</h1>\\n<p>时间复杂度：</p>\\n<table>\\n<thead>\\n<tr>\\n<th></th>\\n<th>读取</th>\\n<th>插入</th>\\n<th>删除</th>\\n</tr>\\n</thead>\\n<tbody>\\n<tr>\\n<td>数组</td>\\n<td>O(1)</td>\\n<td>O(n)</td>\\n<td>O(n)</td>\\n</tr>\\n<tr>\\n<td>链表</td>\\n<td>O(n)</td>\\n<td>O(1)</td>\\n<td>O(1)</td>\\n</tr>\\n</tbody>\\n</table>","autoDesc":true}');export{r as comp,k as data};
