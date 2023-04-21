import{_ as t,X as l,Y as d,Z as e,$ as n,a0 as s,a1 as a,C as c}from"./framework-dc96d9cf.js";const r={},o=a(`<h1 id="clickhouse添加bitmap分页函数" tabindex="-1"><a class="header-anchor" href="#clickhouse添加bitmap分页函数" aria-hidden="true">#</a> Clickhouse添加bitmap分页函数</h1><h2 id="起因" tabindex="-1"><a class="header-anchor" href="#起因" aria-hidden="true">#</a> 起因</h2><p>在做标签引擎的时候，我们在采用了bitmap存储对象id，基础的结构如下</p><table><thead><tr><th>标签类型</th><th>标签值</th><th>对象id bitmap</th></tr></thead><tbody><tr><td>性别</td><td>男</td><td>[1,2,3]</td></tr><tr><td>性别</td><td>女</td><td>[8,9,10]</td></tr></tbody></table><p>表如下：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">create</span> <span class="token keyword">table</span> <span class="token keyword">if</span> <span class="token operator">not</span> <span class="token keyword">exists</span> label_string_local <span class="token keyword">on</span> cluster clickhouse_cluster
<span class="token punctuation">(</span>
    label_type  String <span class="token keyword">comment</span> <span class="token string">&#39;标签id&#39;</span><span class="token punctuation">,</span>
    label_value String <span class="token keyword">comment</span> <span class="token string">&#39;标签值&#39;</span><span class="token punctuation">,</span>
    object_bitmap AggregateFunction<span class="token punctuation">(</span>groupBitmap<span class="token punctuation">,</span> UInt32<span class="token punctuation">)</span> <span class="token keyword">comment</span> <span class="token string">&#39;标签值&#39;</span>
<span class="token punctuation">)</span>
    <span class="token keyword">engine</span> <span class="token operator">=</span> AggregatingMergeTree <span class="token keyword">PARTITION</span> <span class="token keyword">BY</span> label_type
        <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> <span class="token punctuation">(</span>label_type<span class="token punctuation">,</span> label_value<span class="token punctuation">)</span>
        SETTINGS index_granularity <span class="token operator">=</span> <span class="token number">8192</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>到后面需求要求对对象id分页返回，问题就来了，clickhouse的官方没有bitmap的分页函数，最原始的解决方案就是把bitmap整个返回，在应用层对bitmap进行切割，这样导致接口的性能急剧下降。开始萌生了个大胆的想法，给clickhouse添加bitmap分页函数</p><h2 id="开干" tabindex="-1"><a class="header-anchor" href="#开干" aria-hidden="true">#</a> 开干</h2><p>通过阅读Clickhouse的源码，步骤如下：</p><ol><li>实现分页</li></ol>`,10),u=e("code",null,"RoaringBitmapWithSmallSet ",-1),p={href:"https://github.com/RoaringBitmap/CRoaring.git",target:"_blank",rel:"noopener noreferrer"},m=e("code",null,"RoaringBitmapWithSmallSet",-1),v=a(`<div class="language-c++ line-numbers-mode" data-ext="c++"><pre class="language-c++"><code>   UInt64 rb_offset_limit(UInt64 offset, UInt64 limit, RoaringBitmapWithSmallSet &amp; r1) const
    {
        if (limit == 0 || offset &gt;= size())
            return 0;

        if (isSmall())
        {
            UInt64 count = 0;
            UInt64 offset_count = 0;
            auto it = small.begin();
            for (;it != small.end() &amp;&amp; offset_count &lt; offset; ++it)
                ++offset_count;

            for (;it != small.end() &amp;&amp; count &lt; limit; ++it, ++count)
                r1.add(it-&gt;getValue());
            return count;
        }
        else
        {
            UInt64 count = 0;
            UInt64 offset_count = 0;
            auto it = rb-&gt;begin();
            for (;it != rb-&gt;end() &amp;&amp; offset_count &lt; offset; ++it)
                ++offset_count;

            for (;it != rb-&gt;end() &amp;&amp; count &lt; limit; ++it, ++count)
                r1.add(*it);
            return count;
        }
    }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>Clickhouse函数定义</li></ol><p>在<code>FunctionsBitmap.h</code>定义Clickhouse函数</p><div class="language-c++ line-numbers-mode" data-ext="c++"><pre class="language-c++"><code>struct BitmapSubsetOffsetLimitImpl
{
public:
    static constexpr auto name = &quot;subBitmap&quot;;
    template &lt;typename T&gt;
    static void apply(
        const AggregateFunctionGroupBitmapData&lt;T&gt; &amp; bitmap_data_0,
        UInt64 range_start,
        UInt64 range_end,
        AggregateFunctionGroupBitmapData&lt;T&gt; &amp; bitmap_data_2)
        {
        bitmap_data_0.rbs.rb_offset_limit(range_start, range_end, bitmap_data_2.rbs);
        }
};

using FunctionBitmapSubsetOffsetLimit = FunctionBitmapSubset&lt;BitmapSubsetOffsetLimitImpl&gt;;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="3"><li>Clickhouse函数注册</li></ol><p>在<code>FunctionsBitmap.cpp</code>注册函数</p><div class="language-c++ line-numbers-mode" data-ext="c++"><pre class="language-c++"><code>#include &lt;Functions/FunctionFactory.h&gt;

// TODO include this last because of a broken roaring header. See the comment inside.
#include &lt;Functions/FunctionsBitmap.h&gt;


namespace DB
{

void registerFunctionsBitmap(FunctionFactory &amp; factory)
{
    ...
    factory.registerFunction&lt;FunctionBitmapSubsetOffsetLimit&gt;();
    ...
}
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7),b={href:"https://github.com/ClickHouse/ClickHouse/pull/27234",target:"_blank",rel:"noopener noreferrer"},g=e("h2",{id:"后续",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#后续","aria-hidden":"true"},"#"),n(" 后续")],-1),h=e("p",null,[n("后面又来了个需求，要求标签能够修改，这又炸了，Clickhosue是不支持修改的，bitmap采用的数据结构是"),e("code",null,"AggregateFunction(groupBitmap, UInt32)"),n("，groupBitmap的合并逻辑是或运算，内部Clickhosue开发了一种新的数据结构"),e("code",null,"xor_groupBitmap"),n("，支持合并逻辑异或运算，变相支持删除操作，考虑这部分并不通用，所以没有开源出来")],-1);function k(_,f){const i=c("ExternalLinkIcon");return l(),d("div",null,[o,e("p",null,[n("在Clickhouse中bitmap指向的class是"),u,n("，bitmap底层使用的是RoaringBitmap，github地址："),e("a",p,[n("https://github.com/RoaringBitmap/CRoaring.git"),s(i)]),n(" ，"),m,n("对rb进行了包装，在这个类下添加分页函数")]),v,e("p",null,[n("这样就完事了，最终这部分的代码提交到了Clickhosue仓库，最终得到了合并，"),e("a",b,[n("https://github.com/ClickHouse/ClickHouse/pull/27234"),s(i)])]),g,h])}const y=t(r,[["render",k],["__file","Clickhouse添加bitmap分页函数.html.vue"]]);export{y as default};
