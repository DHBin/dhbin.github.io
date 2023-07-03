import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e}from"./app-f1812a7b.js";const t={},p=e(`<h1 id="数据结构01-普通链表" tabindex="-1"><a class="header-anchor" href="#数据结构01-普通链表" aria-hidden="true">#</a> 数据结构01-普通链表</h1><h2 id="基础知识" tabindex="-1"><a class="header-anchor" href="#基础知识" aria-hidden="true">#</a> 基础知识</h2><p>链表是比较常用的一个数据结构，在JAVA中的实现是LinkedList，但是在C的标准库中并没有内置的链表可供使用，所以redis实现了一套。我们知道数组的内存地址是连续的，最大的特征是支持随机访问，所以数组的读时间复杂度是O(1)，但是在写的场景时间复杂度是O(N)，在某个位置插入一条数据，需要把这个位置后的所有数据向后移动一位，在内存不足时还需要重新申请内存。</p><p>而链表的内存结构是不连续的，不支持随机访问，当需要读取某个位置的数据时，需要从头遍历到尾部才能实现，所有读是O(N)；对链表写入操作时，因为两个节点的内存都是独立不连续的，在这中间插入数据的时候，只要把next、prev指针重新指向即可，所以写是O(1)。这就是数组和链表的基础知识，我们看下在redis中的具体实现是怎么样的吧！</p><h2 id="普通链表" tabindex="-1"><a class="header-anchor" href="#普通链表" aria-hidden="true">#</a> 普通链表</h2><h3 id="redis中链表实现" tabindex="-1"><a class="header-anchor" href="#redis中链表实现" aria-hidden="true">#</a> redis中链表实现</h3><p>在redis源码中链表有三个关键的结构体，list、listNode、listIter，具体如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 链表中的节点，双端链表节点 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">listNode</span> <span class="token punctuation">{</span>
    <span class="token comment">/* 指向前一个节点 */</span>
    <span class="token keyword">struct</span> <span class="token class-name">listNode</span> <span class="token operator">*</span>prev<span class="token punctuation">;</span>
    <span class="token comment">/* 指向下一个节点 */</span>
    <span class="token keyword">struct</span> <span class="token class-name">listNode</span> <span class="token operator">*</span>next<span class="token punctuation">;</span>
    <span class="token comment">/* 节点的值 */</span>
    <span class="token keyword">void</span> <span class="token operator">*</span>value<span class="token punctuation">;</span>
<span class="token punctuation">}</span> listNode<span class="token punctuation">;</span>

<span class="token comment">/* 迭代器 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">listIter</span> <span class="token punctuation">{</span>
    listNode <span class="token operator">*</span>next<span class="token punctuation">;</span>
    <span class="token keyword">int</span> direction<span class="token punctuation">;</span>
<span class="token punctuation">}</span> listIter<span class="token punctuation">;</span>

<span class="token comment">/* 链表 */</span>
<span class="token keyword">typedef</span> <span class="token keyword">struct</span> <span class="token class-name">list</span> <span class="token punctuation">{</span>
    <span class="token comment">/* 链表的头节点 */</span>
    listNode <span class="token operator">*</span>head<span class="token punctuation">;</span>
    <span class="token comment">/* 链表的尾节点 */</span>
    listNode <span class="token operator">*</span>tail<span class="token punctuation">;</span>
    <span class="token comment">/* 节点值复制函数 */</span>
    <span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">(</span><span class="token operator">*</span>dup<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>ptr<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">/* 节点值释放函数 */</span>
    <span class="token keyword">void</span> <span class="token punctuation">(</span><span class="token operator">*</span>free<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>ptr<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">/* 节点值对比函数 */</span>
    <span class="token keyword">int</span> <span class="token punctuation">(</span><span class="token operator">*</span>match<span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>ptr<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>key<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">/* 链表长度 */</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">long</span> len<span class="token punctuation">;</span>
<span class="token punctuation">}</span> list<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>把三个结构体的关系图如下：</p><figure><img src="https://cdn.dhbin.cn/1634612085510-736cb149-b7f7-4f15-8e4f-112e5c549145.jpeg" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><h3 id="创建链表" tabindex="-1"><a class="header-anchor" href="#创建链表" aria-hidden="true">#</a> 创建链表</h3><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>list <span class="token operator">*</span><span class="token function">listCreate</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* 定义链表的结构体 */</span>
    <span class="token keyword">struct</span> <span class="token class-name">list</span> <span class="token operator">*</span>list<span class="token punctuation">;</span>

    <span class="token comment">/* 分配空间 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>list <span class="token operator">=</span> <span class="token function">zmalloc</span><span class="token punctuation">(</span><span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token operator">*</span>list<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token comment">/* 把头部和尾部初始化为NULL */</span>
    list<span class="token operator">-&gt;</span>head <span class="token operator">=</span> list<span class="token operator">-&gt;</span>tail <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token comment">/* 长度 */</span>
    list<span class="token operator">-&gt;</span>len <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    list<span class="token operator">-&gt;</span>dup <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    list<span class="token operator">-&gt;</span>free <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    list<span class="token operator">-&gt;</span>match <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> list<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="清空链表" tabindex="-1"><a class="header-anchor" href="#清空链表" aria-hidden="true">#</a> 清空链表</h3><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">listEmpty</span><span class="token punctuation">(</span>list <span class="token operator">*</span>list<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">long</span> len<span class="token punctuation">;</span>
    listNode <span class="token operator">*</span>current<span class="token punctuation">,</span> <span class="token operator">*</span>next<span class="token punctuation">;</span>

    current <span class="token operator">=</span> list<span class="token operator">-&gt;</span>head<span class="token punctuation">;</span>
    len <span class="token operator">=</span> list<span class="token operator">-&gt;</span>len<span class="token punctuation">;</span>
    <span class="token comment">/* 遍历链表 */</span>
    <span class="token keyword">while</span><span class="token punctuation">(</span>len<span class="token operator">--</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/* 获取下一个节点 */</span>
        next <span class="token operator">=</span> current<span class="token operator">-&gt;</span>next<span class="token punctuation">;</span>
        <span class="token comment">/* 如果当前节点的释放函数不是空的话，调用释放函数对节点的值进行释放 */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>list<span class="token operator">-&gt;</span>free<span class="token punctuation">)</span> list<span class="token operator">-&gt;</span><span class="token function">free</span><span class="token punctuation">(</span>current<span class="token operator">-&gt;</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">/* 释放当前节点 */</span>
        <span class="token function">zfree</span><span class="token punctuation">(</span>current<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">/* 把下一个节点复制给当前节点，下一次遍历使用 */</span>
        current <span class="token operator">=</span> next<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token comment">/* 把头部和尾部清空 */</span>
    list<span class="token operator">-&gt;</span>head <span class="token operator">=</span> list<span class="token operator">-&gt;</span>tail <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token comment">/* 把长度赋值为0 */</span>
    list<span class="token operator">-&gt;</span>len <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="头部插入" tabindex="-1"><a class="header-anchor" href="#头部插入" aria-hidden="true">#</a> 头部插入</h3><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 在链表头部插入，O(1) */</span>
list <span class="token operator">*</span><span class="token function">listAddNodeHead</span><span class="token punctuation">(</span>list <span class="token operator">*</span>list<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>value<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* 创建一个节点 */</span>
    listNode <span class="token operator">*</span>node<span class="token punctuation">;</span>

    <span class="token comment">/* 给创建的节点分配内存 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>node <span class="token operator">=</span> <span class="token function">zmalloc</span><span class="token punctuation">(</span><span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token operator">*</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token comment">/* 把值放到节点里面去 */</span>
    node<span class="token operator">-&gt;</span>value <span class="token operator">=</span> value<span class="token punctuation">;</span>
    <span class="token comment">/* 如果链表的长度是0的话 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>list<span class="token operator">-&gt;</span>len <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/* 链表的头部和尾部的指针都指向这个节点 */</span>
        list<span class="token operator">-&gt;</span>head <span class="token operator">=</span> list<span class="token operator">-&gt;</span>tail <span class="token operator">=</span> node<span class="token punctuation">;</span>
        <span class="token comment">/* 节点的下一个节点和上一个节点都是NULL */</span>
        node<span class="token operator">-&gt;</span>prev <span class="token operator">=</span> node<span class="token operator">-&gt;</span>next <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">/* 因为是在头部插入，所以prev节点是NULL */</span>
        node<span class="token operator">-&gt;</span>prev <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
        <span class="token comment">/* 把节点的下一个节点指向链表的头部节点 */</span>
        node<span class="token operator">-&gt;</span>next <span class="token operator">=</span> list<span class="token operator">-&gt;</span>head<span class="token punctuation">;</span>
        <span class="token comment">/* 把原头部节点的上一个节点指向新创建的这个节点 */</span>
        list<span class="token operator">-&gt;</span>head<span class="token operator">-&gt;</span>prev <span class="token operator">=</span> node<span class="token punctuation">;</span>
        <span class="token comment">/* 把链表的头部节点换成新创建的这个节点 */</span>
        list<span class="token operator">-&gt;</span>head <span class="token operator">=</span> node<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token comment">/* 链表长度+1 */</span>
    list<span class="token operator">-&gt;</span>len<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> list<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="尾部插入" tabindex="-1"><a class="header-anchor" href="#尾部插入" aria-hidden="true">#</a> 尾部插入</h3><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 在链表尾部插入 O(1) */</span>
list <span class="token operator">*</span><span class="token function">listAddNodeTail</span><span class="token punctuation">(</span>list <span class="token operator">*</span>list<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>value<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* 创建一个节点 */</span>
    listNode <span class="token operator">*</span>node<span class="token punctuation">;</span>

    <span class="token comment">/* 给创建的节点分配内存 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>node <span class="token operator">=</span> <span class="token function">zmalloc</span><span class="token punctuation">(</span><span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token operator">*</span>node<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

    <span class="token comment">/* 把值放到节点里面去 */</span>
    node<span class="token operator">-&gt;</span>value <span class="token operator">=</span> value<span class="token punctuation">;</span>
    <span class="token comment">/* 如果链表的长度是0的话 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>list<span class="token operator">-&gt;</span>len <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/* 链表的头部和尾部的指针都指向这个节点 */</span>
        list<span class="token operator">-&gt;</span>head <span class="token operator">=</span> list<span class="token operator">-&gt;</span>tail <span class="token operator">=</span> node<span class="token punctuation">;</span>
        <span class="token comment">/* 节点的下一个节点和上一个节点都是NULL */</span>
        node<span class="token operator">-&gt;</span>prev <span class="token operator">=</span> node<span class="token operator">-&gt;</span>next <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">/* 新建节点的上一个节点指向链表的原尾部节点 */</span>
        node<span class="token operator">-&gt;</span>prev <span class="token operator">=</span> list<span class="token operator">-&gt;</span>tail<span class="token punctuation">;</span>
        <span class="token comment">/* 因为是尾部插入，所以节点的下一个节点是空 */</span>
        node<span class="token operator">-&gt;</span>next <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
        <span class="token comment">/* 把链表的原尾部节点的下一个节点指向新创建的这个节点 */</span>
        list<span class="token operator">-&gt;</span>tail<span class="token operator">-&gt;</span>next <span class="token operator">=</span> node<span class="token punctuation">;</span>
        <span class="token comment">/* 把链表的尾部节点指向新建的这个节点 */</span>
        list<span class="token operator">-&gt;</span>tail <span class="token operator">=</span> node<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token comment">/* 链表长度+1 */</span>
    list<span class="token operator">-&gt;</span>len<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> list<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="链表查找" tabindex="-1"><a class="header-anchor" href="#链表查找" aria-hidden="true">#</a> 链表查找</h3><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 查找 */</span>
listNode <span class="token operator">*</span><span class="token function">listSearchKey</span><span class="token punctuation">(</span>list <span class="token operator">*</span>list<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>key<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* 链表迭代器 */</span>
    listIter iter<span class="token punctuation">;</span>
    <span class="token comment">/* 节点 */</span>
    listNode <span class="token operator">*</span>node<span class="token punctuation">;</span>

    <span class="token comment">/* 创建迭代器 */</span>
    <span class="token function">listRewind</span><span class="token punctuation">(</span>list<span class="token punctuation">,</span> <span class="token operator">&amp;</span>iter<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">/* 遍历链表 */</span>
    <span class="token keyword">while</span><span class="token punctuation">(</span><span class="token punctuation">(</span>node <span class="token operator">=</span> <span class="token function">listNext</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>iter<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/* 如果链表有设置对比函数，则使用对比函数对比 */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>list<span class="token operator">-&gt;</span>match<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>list<span class="token operator">-&gt;</span><span class="token function">match</span><span class="token punctuation">(</span>node<span class="token operator">-&gt;</span>value<span class="token punctuation">,</span> key<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">return</span> node<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token comment">/* 判断返回 */</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token operator">==</span> node<span class="token operator">-&gt;</span>value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">return</span> node<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="使用建议" tabindex="-1"><a class="header-anchor" href="#使用建议" aria-hidden="true">#</a> 使用建议</h3><p>从源码中得知链表的添加数据的速度是很快的，在不需要读取某个位置的值并且新增数据的操作比较多的情况下考虑使用链表数据结构。</p><h2 id="快速链表" tabindex="-1"><a class="header-anchor" href="#快速链表" aria-hidden="true">#</a> 快速链表</h2><p>比链表更优的实现，后面补充</p>`,24),o=[p];function c(l,i){return s(),a("div",null,o)}const d=n(t,[["render",c],["__file","数据结构01-普通链表.html.vue"]]);export{d as default};
