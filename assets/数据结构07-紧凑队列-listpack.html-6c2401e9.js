import{_ as s,W as a,X as e,a1 as t,a0 as n}from"./framework-5f3abea5.js";const p={},o=n('<h1 id="数据结构07-紧凑队列-listpack" tabindex="-1"><a class="header-anchor" href="#数据结构07-紧凑队列-listpack" aria-hidden="true">#</a> 数据结构07-紧凑队列-listpack</h1><h2 id="结构" tabindex="-1"><a class="header-anchor" href="#结构" aria-hidden="true">#</a> 结构</h2><figure><img src="https://cdn.dhbin.cn/202303232009654.svg+xml" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure>',3),l=n(`<h2 id="插入" tabindex="-1"><a class="header-anchor" href="#插入" aria-hidden="true">#</a> 插入</h2><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* Insert, delete or replace the specified element &#39;ele&#39; of length &#39;len&#39; at
 * the specified position &#39;p&#39;, with &#39;p&#39; being a listpack element pointer
 * obtained with lpFirst(), lpLast(), lpNext(), lpPrev() or lpSeek().
 *
 * The element is inserted before, after, or replaces the element pointed
 * by &#39;p&#39; depending on the &#39;where&#39; argument, that can be LP_BEFORE, LP_AFTER
 * or LP_REPLACE.
 *
 * If &#39;ele&#39; is set to NULL, the function removes the element pointed by &#39;p&#39;
 * instead of inserting one.
 *
 * Returns NULL on out of memory or when the listpack total length would exceed
 * the max allowed size of 2^32-1, otherwise the new pointer to the listpack
 * holding the new element is returned (and the old pointer passed is no longer
 * considered valid)
 *
 * If &#39;newp&#39; is not NULL, at the end of a successful call &#39;*newp&#39; will be set
 * to the address of the element just added, so that it will be possible to
 * continue an interation with lpNext() and lpPrev().
 *
 * For deletion operations (&#39;ele&#39; set to NULL) &#39;newp&#39; is set to the next
 * element, on the right of the deleted one, or to NULL if the deleted element
 * was the last one.
 *
 * 插入、删除、替换的实现都是这个函数，当ele是NULL时，表示移除*p位置的元素,
 * p也是一个基准位置，在这个节点之前、之后插入等等
 * */</span>
<span class="token keyword">unsigned</span> <span class="token keyword">char</span> <span class="token operator">*</span><span class="token function">lpInsert</span><span class="token punctuation">(</span><span class="token keyword">unsigned</span> <span class="token keyword">char</span> <span class="token operator">*</span>lp<span class="token punctuation">,</span> <span class="token keyword">unsigned</span> <span class="token keyword">char</span> <span class="token operator">*</span>ele<span class="token punctuation">,</span> <span class="token class-name">uint32_t</span> size<span class="token punctuation">,</span> <span class="token keyword">unsigned</span> <span class="token keyword">char</span> <span class="token operator">*</span>p<span class="token punctuation">,</span> <span class="token keyword">int</span> where<span class="token punctuation">,</span> <span class="token keyword">unsigned</span> <span class="token keyword">char</span> <span class="token operator">*</span><span class="token operator">*</span>newp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">char</span> intenc<span class="token punctuation">[</span>LP_MAX_INT_ENCODING_LEN<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">char</span> backlen<span class="token punctuation">[</span>LP_MAX_BACKLEN_SIZE<span class="token punctuation">]</span><span class="token punctuation">;</span>

    <span class="token class-name">uint64_t</span> enclen<span class="token punctuation">;</span> <span class="token comment">/* The length of the encoded element. */</span>

    <span class="token comment">/* An element pointer set to NULL means deletion, which is conceptually
     * replacing the element with a zero-length element. So whatever we
     * get passed as &#39;where&#39;, set it to LP_REPLACE. */</span>
    <span class="token comment">/* 如果ele是NULL，默认该操作是删除 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ele <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> where <span class="token operator">=</span> LP_REPLACE<span class="token punctuation">;</span>

    <span class="token comment">/* If we need to insert after the current element, we just jump to the
     * next element (that could be the EOF one) and handle the case of
     * inserting before. So the function will actually deal with just two
     * cases: LP_BEFORE and LP_REPLACE.
     *
     * 如果需要在列表中已存在的元素之前插入数据，我们先找到这已存在的元素的位置，
     * 然后按在之后插入处理
     * */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>where <span class="token operator">==</span> LP_AFTER<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        p <span class="token operator">=</span> <span class="token function">lpSkip</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span>
        where <span class="token operator">=</span> LP_BEFORE<span class="token punctuation">;</span>
        <span class="token function">ASSERT_INTEGRITY</span><span class="token punctuation">(</span>lp<span class="token punctuation">,</span> p<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* Store the offset of the element &#39;p&#39;, so that we can obtain its
     * address again after a reallocation. */</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">long</span> poff <span class="token operator">=</span> p<span class="token operator">-</span>lp<span class="token punctuation">;</span>

    <span class="token comment">/* Calling lpEncodeGetType() results into the encoded version of the
     * element to be stored into &#39;intenc&#39; in case it is representable as
     * an integer: in that case, the function returns LP_ENCODING_INT.
     * Otherwise if LP_ENCODING_STR is returned, we&#39;ll have to call
     * lpEncodeString() to actually write the encoded string on place later.
     *
     * Whatever the returned encoding is, &#39;enclen&#39; is populated with the
     * length of the encoded element. */</span>
    <span class="token keyword">int</span> enctype<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ele<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/*
         * enctype: 数据类型，0-int 1-字符串
         * intenc:  当enctype为0时，该值有用，表示编码后的int
         * enclen:  数据长度 内存结构：（标识 | 数据长度 | 数据）
         * */</span>
        enctype <span class="token operator">=</span> <span class="token function">lpEncodeGetType</span><span class="token punctuation">(</span>ele<span class="token punctuation">,</span>size<span class="token punctuation">,</span>intenc<span class="token punctuation">,</span><span class="token operator">&amp;</span>enclen<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        enctype <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
        enclen <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* We need to also encode the backward-parsable length of the element
     * and append it to the end: this allows to traverse the listpack from
     * the end to the start. */</span>
    <span class="token comment">/* 计算出元素尾部的长度的字节长度，同时构建好backlen */</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">long</span> backlen_size <span class="token operator">=</span> ele <span class="token operator">?</span> <span class="token function">lpEncodeBacklen</span><span class="token punctuation">(</span>backlen<span class="token punctuation">,</span>enclen<span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token comment">/* 旧的列表字节总长度 */</span>
    <span class="token class-name">uint64_t</span> old_listpack_bytes <span class="token operator">=</span> <span class="token function">lpGetTotalBytes</span><span class="token punctuation">(</span>lp<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">uint32_t</span> replaced_len  <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>where <span class="token operator">==</span> LP_REPLACE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">/* [头部][数据]的长度 */</span>
        replaced_len <span class="token operator">=</span> <span class="token function">lpCurrentEncodedSizeUnsafe</span><span class="token punctuation">(</span>p<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">/* [尾部长度]：代表前面数据的长度 */</span>
        replaced_len <span class="token operator">+=</span> <span class="token function">lpEncodeBacklen</span><span class="token punctuation">(</span><span class="token constant">NULL</span><span class="token punctuation">,</span>replaced_len<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">ASSERT_INTEGRITY_LEN</span><span class="token punctuation">(</span>lp<span class="token punctuation">,</span> p<span class="token punctuation">,</span> replaced_len<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* 新的列表字节长度
     * old_listpack_bytes：旧的列表字节数
     * enclen：元素数据编码后的字节数
     * backlen_size：储存尾部长度的字节数
     * */</span>
    <span class="token class-name">uint64_t</span> new_listpack_bytes <span class="token operator">=</span> old_listpack_bytes <span class="token operator">+</span> enclen <span class="token operator">+</span> backlen_size
                                  <span class="token operator">-</span> replaced_len<span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>new_listpack_bytes <span class="token operator">&gt;</span> UINT32_MAX<span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>

    <span class="token comment">/* We now need to reallocate in order to make space or shrink the
     * allocation (in case &#39;when&#39; value is LP_REPLACE and the new element is
     * smaller). However we do that before memmoving the memory to
     * make room for the new element if the final allocation will get
     * larger, or we do it after if the final allocation will get smaller. */</span>

    <span class="token keyword">unsigned</span> <span class="token keyword">char</span> <span class="token operator">*</span>dst <span class="token operator">=</span> lp <span class="token operator">+</span> poff<span class="token punctuation">;</span> <span class="token comment">/* May be updated after reallocation. */</span>

    <span class="token comment">/* Realloc before: we need more room. */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>new_listpack_bytes <span class="token operator">&gt;</span> old_listpack_bytes <span class="token operator">&amp;&amp;</span>
        new_listpack_bytes <span class="token operator">&gt;</span> <span class="token function">lp_malloc_size</span><span class="token punctuation">(</span>lp<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>lp <span class="token operator">=</span> <span class="token function">lp_realloc</span><span class="token punctuation">(</span>lp<span class="token punctuation">,</span>new_listpack_bytes<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
        dst <span class="token operator">=</span> lp <span class="token operator">+</span> poff<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* Setup the listpack relocating the elements to make the exact room
     * we need to store the new one. */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>where <span class="token operator">==</span> LP_BEFORE<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">memmove</span><span class="token punctuation">(</span>dst<span class="token operator">+</span>enclen<span class="token operator">+</span>backlen_size<span class="token punctuation">,</span>dst<span class="token punctuation">,</span>old_listpack_bytes<span class="token operator">-</span>poff<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span> <span class="token comment">/* LP_REPLACE. */</span>
        <span class="token keyword">long</span> lendiff <span class="token operator">=</span> <span class="token punctuation">(</span>enclen<span class="token operator">+</span>backlen_size<span class="token punctuation">)</span><span class="token operator">-</span>replaced_len<span class="token punctuation">;</span>
        <span class="token function">memmove</span><span class="token punctuation">(</span>dst<span class="token operator">+</span>replaced_len<span class="token operator">+</span>lendiff<span class="token punctuation">,</span>
                dst<span class="token operator">+</span>replaced_len<span class="token punctuation">,</span>
                old_listpack_bytes<span class="token operator">-</span>poff<span class="token operator">-</span>replaced_len<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* Realloc after: we need to free space. */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>new_listpack_bytes <span class="token operator">&lt;</span> old_listpack_bytes<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>lp <span class="token operator">=</span> <span class="token function">lp_realloc</span><span class="token punctuation">(</span>lp<span class="token punctuation">,</span>new_listpack_bytes<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token keyword">return</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
        dst <span class="token operator">=</span> lp <span class="token operator">+</span> poff<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* Store the entry. */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>newp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token operator">*</span>newp <span class="token operator">=</span> dst<span class="token punctuation">;</span>
        <span class="token comment">/* In case of deletion, set &#39;newp&#39; to NULL if the next element is
         * the EOF element. */</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>ele <span class="token operator">&amp;&amp;</span> dst<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span> <span class="token operator">==</span> LP_EOF<span class="token punctuation">)</span> <span class="token operator">*</span>newp <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>ele<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>enctype <span class="token operator">==</span> LP_ENCODING_INT<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">/* 因为int类型在lpEncodeGetType函数中已经编码好了，所以直接拷贝到内存中 */</span>
            <span class="token function">memcpy</span><span class="token punctuation">(</span>dst<span class="token punctuation">,</span>intenc<span class="token punctuation">,</span>enclen<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token comment">/* 对字符串类型的数据编码 */</span>
            <span class="token function">lpEncodeString</span><span class="token punctuation">(</span>dst<span class="token punctuation">,</span>ele<span class="token punctuation">,</span>size<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        dst <span class="token operator">+=</span> enclen<span class="token punctuation">;</span>
        <span class="token function">memcpy</span><span class="token punctuation">(</span>dst<span class="token punctuation">,</span>backlen<span class="token punctuation">,</span>backlen_size<span class="token punctuation">)</span><span class="token punctuation">;</span>
        dst <span class="token operator">+=</span> backlen_size<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">/* Update header. 更新紧凑链表的头部信息 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>where <span class="token operator">!=</span> LP_REPLACE <span class="token operator">||</span> ele <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">uint32_t</span> num_elements <span class="token operator">=</span> <span class="token function">lpGetNumElements</span><span class="token punctuation">(</span>lp<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>num_elements <span class="token operator">!=</span> LP_HDR_NUMELE_UNKNOWN<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>ele<span class="token punctuation">)</span>
                <span class="token function">lpSetNumElements</span><span class="token punctuation">(</span>lp<span class="token punctuation">,</span>num_elements<span class="token operator">+</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">else</span>
                <span class="token function">lpSetNumElements</span><span class="token punctuation">(</span>lp<span class="token punctuation">,</span>num_elements<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token function">lpSetTotalBytes</span><span class="token punctuation">(</span>lp<span class="token punctuation">,</span>new_listpack_bytes<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">if</span> <span class="token expression"><span class="token number">0</span></span></span>
    <span class="token comment">/* This code path is normally disabled: what it does is to force listpack
     * to return *always* a new pointer after performing some modification to
     * the listpack, even if the previous allocation was enough. This is useful
     * in order to spot bugs in code using listpacks: by doing so we can find
     * if the caller forgets to set the new pointer where the listpack reference
     * is stored, after an update. */</span>
    <span class="token keyword">unsigned</span> <span class="token keyword">char</span> <span class="token operator">*</span>oldlp <span class="token operator">=</span> lp<span class="token punctuation">;</span>
    lp <span class="token operator">=</span> <span class="token function">lp_malloc</span><span class="token punctuation">(</span>new_listpack_bytes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">memcpy</span><span class="token punctuation">(</span>lp<span class="token punctuation">,</span>oldlp<span class="token punctuation">,</span>new_listpack_bytes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>newp<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">unsigned</span> <span class="token keyword">long</span> offset <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token operator">*</span>newp<span class="token punctuation">)</span><span class="token operator">-</span>oldlp<span class="token punctuation">;</span>
        <span class="token operator">*</span>newp <span class="token operator">=</span> lp <span class="token operator">+</span> offset<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token comment">/* Make sure the old allocation contains garbage. */</span>
    <span class="token function">memset</span><span class="token punctuation">(</span>oldlp<span class="token punctuation">,</span><span class="token char">&#39;A&#39;</span><span class="token punctuation">,</span>new_listpack_bytes<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">lp_free</span><span class="token punctuation">(</span>oldlp<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">endif</span></span>

    <span class="token keyword">return</span> lp<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2);function c(i,u){return a(),e("div",null,[o,t(" more "),l])}const d=s(p,[["render",c],["__file","数据结构07-紧凑队列-listpack.html.vue"]]);export{d as default};
