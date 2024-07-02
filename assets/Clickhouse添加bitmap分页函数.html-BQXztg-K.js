import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as e,c as t,e as a}from"./app-Bq0Sc4vP.js";const s={},i=a(`<h1 id="clickhouse添加bitmap分页函数" tabindex="-1"><a class="header-anchor" href="#clickhouse添加bitmap分页函数"><span>Clickhouse添加bitmap分页函数</span></a></h1><h2 id="起因" tabindex="-1"><a class="header-anchor" href="#起因"><span>起因</span></a></h2><p>在做标签引擎的时候，我们在采用了bitmap存储对象id，基础的结构如下</p><table><thead><tr><th>标签类型</th><th>标签值</th><th>对象id bitmap</th></tr></thead><tbody><tr><td>性别</td><td>男</td><td>[1,2,3]</td></tr><tr><td>性别</td><td>女</td><td>[8,9,10]</td></tr></tbody></table><p>表如下：</p><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token keyword">create</span> <span class="token keyword">table</span> <span class="token keyword">if</span> <span class="token operator">not</span> <span class="token keyword">exists</span> label_string_local <span class="token keyword">on</span> cluster clickhouse_cluster
<span class="token punctuation">(</span>
    label_type  String <span class="token keyword">comment</span> <span class="token string">&#39;标签id&#39;</span><span class="token punctuation">,</span>
    label_value String <span class="token keyword">comment</span> <span class="token string">&#39;标签值&#39;</span><span class="token punctuation">,</span>
    object_bitmap AggregateFunction<span class="token punctuation">(</span>groupBitmap<span class="token punctuation">,</span> UInt32<span class="token punctuation">)</span> <span class="token keyword">comment</span> <span class="token string">&#39;标签值&#39;</span>
<span class="token punctuation">)</span>
    <span class="token keyword">engine</span> <span class="token operator">=</span> AggregatingMergeTree <span class="token keyword">PARTITION</span> <span class="token keyword">BY</span> label_type
        <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> <span class="token punctuation">(</span>label_type<span class="token punctuation">,</span> label_value<span class="token punctuation">)</span>
        SETTINGS index_granularity <span class="token operator">=</span> <span class="token number">8192</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>到后面需求要求对对象id分页返回，问题就来了，clickhouse的官方没有bitmap的分页函数，最原始的解决方案就是把bitmap整个返回，在应用层对bitmap进行切割，这样导致接口的性能急剧下降。开始萌生了个大胆的想法，给clickhouse添加bitmap分页函数</p><h2 id="开干" tabindex="-1"><a class="header-anchor" href="#开干"><span>开干</span></a></h2><p>通过阅读Clickhouse的源码，步骤如下：</p><ol><li>实现分页</li></ol><p>在Clickhouse中bitmap指向的class是<code>RoaringBitmapWithSmallSet </code>，bitmap底层使用的是RoaringBitmap，github地址：https://github.com/RoaringBitmap/CRoaring.git ，<code>RoaringBitmapWithSmallSet</code>对rb进行了包装，在这个类下添加分页函数</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>   UInt64 rb_offset_limit(UInt64 offset, UInt64 limit, RoaringBitmapWithSmallSet &amp; r1) const
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>Clickhouse函数定义</li></ol><p>在<code>FunctionsBitmap.h</code>定义Clickhouse函数</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>struct BitmapSubsetOffsetLimitImpl
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="3"><li>Clickhouse函数注册</li></ol><p>在<code>FunctionsBitmap.cpp</code>注册函数</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><pre class="language-c++"><code>#include &lt;Functions/FunctionFactory.h&gt;

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样就完事了，最终这部分的代码提交到了Clickhosue仓库，最终得到了合并，https://github.com/ClickHouse/ClickHouse/pull/27234</p><h2 id="后续" tabindex="-1"><a class="header-anchor" href="#后续"><span>后续</span></a></h2><p>后面又来了个需求，要求标签能够修改，这又炸了，Clickhosue是不支持修改的，bitmap采用的数据结构是<code>AggregateFunction(groupBitmap, UInt32)</code>，groupBitmap的合并逻辑是或运算，内部Clickhosue开发了一种新的数据结构<code>xor_groupBitmap</code>，支持合并逻辑异或运算，变相支持删除操作，考虑这部分并不通用，所以没有开源出来</p>`,21),l=[i];function c(o,d){return e(),t("div",null,l)}const u=n(s,[["render",c],["__file","Clickhouse添加bitmap分页函数.html.vue"]]),m=JSON.parse(`{"path":"/tech/clickhouse/Clickhouse%E6%B7%BB%E5%8A%A0bitmap%E5%88%86%E9%A1%B5%E5%87%BD%E6%95%B0.html","title":"Clickhouse添加bitmap分页函数","lang":"zh-CN","frontmatter":{"date":"2023-04-07T00:00:00.000Z","category":["Clickhouse"],"tag":["源码","Clickhouse"],"star":100,"sticky":100,"description":"Clickhouse添加bitmap分页函数 起因 在做标签引擎的时候，我们在采用了bitmap存储对象id，基础的结构如下 表如下： 到后面需求要求对对象id分页返回，问题就来了，clickhouse的官方没有bitmap的分页函数，最原始的解决方案就是把bitmap整个返回，在应用层对bitmap进行切割，这样导致接口的性能急剧下降。开始萌生了个大...","head":[["meta",{"property":"og:url","content":"https://dhbin.cn/tech/clickhouse/Clickhouse%E6%B7%BB%E5%8A%A0bitmap%E5%88%86%E9%A1%B5%E5%87%BD%E6%95%B0.html"}],["meta",{"property":"og:site_name","content":"HB技术栈"}],["meta",{"property":"og:title","content":"Clickhouse添加bitmap分页函数"}],["meta",{"property":"og:description","content":"Clickhouse添加bitmap分页函数 起因 在做标签引擎的时候，我们在采用了bitmap存储对象id，基础的结构如下 表如下： 到后面需求要求对对象id分页返回，问题就来了，clickhouse的官方没有bitmap的分页函数，最原始的解决方案就是把bitmap整个返回，在应用层对bitmap进行切割，这样导致接口的性能急剧下降。开始萌生了个大..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-04-21T01:01:40.000Z"}],["meta",{"property":"article:author","content":"DHB"}],["meta",{"property":"article:tag","content":"源码"}],["meta",{"property":"article:tag","content":"Clickhouse"}],["meta",{"property":"article:published_time","content":"2023-04-07T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-04-21T01:01:40.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Clickhouse添加bitmap分页函数\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-04-07T00:00:00.000Z\\",\\"dateModified\\":\\"2023-04-21T01:01:40.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"DHB\\",\\"url\\":\\"https://dhbin.cn\\"}]}"]]},"headers":[{"level":2,"title":"起因","slug":"起因","link":"#起因","children":[]},{"level":2,"title":"开干","slug":"开干","link":"#开干","children":[]},{"level":2,"title":"后续","slug":"后续","link":"#后续","children":[]}],"git":{"createdTime":1680854044000,"updatedTime":1682038900000,"contributors":[{"name":"dhb","email":"xx158@qq.com","commits":2}]},"readingTime":{"minutes":1.9,"words":571},"localizedDate":"2023年4月7日","excerpt":"\\n<h2>起因</h2>\\n<p>在做标签引擎的时候，我们在采用了bitmap存储对象id，基础的结构如下</p>\\n<table>\\n<thead>\\n<tr>\\n<th>标签类型</th>\\n<th>标签值</th>\\n<th>对象id bitmap</th>\\n</tr>\\n</thead>\\n<tbody>\\n<tr>\\n<td>性别</td>\\n<td>男</td>\\n<td>[1,2,3]</td>\\n</tr>\\n<tr>\\n<td>性别</td>\\n<td>女</td>\\n<td>[8,9,10]</td>\\n</tr>\\n</tbody>\\n</table>\\n<p>表如下：</p>\\n<div class=\\"language-sql\\" data-ext=\\"sql\\" data-title=\\"sql\\"><pre class=\\"language-sql\\"><code><span class=\\"token keyword\\">create</span> <span class=\\"token keyword\\">table</span> <span class=\\"token keyword\\">if</span> <span class=\\"token operator\\">not</span> <span class=\\"token keyword\\">exists</span> label_string_local <span class=\\"token keyword\\">on</span> cluster clickhouse_cluster\\n<span class=\\"token punctuation\\">(</span>\\n    label_type  String <span class=\\"token keyword\\">comment</span> <span class=\\"token string\\">'标签id'</span><span class=\\"token punctuation\\">,</span>\\n    label_value String <span class=\\"token keyword\\">comment</span> <span class=\\"token string\\">'标签值'</span><span class=\\"token punctuation\\">,</span>\\n    object_bitmap AggregateFunction<span class=\\"token punctuation\\">(</span>groupBitmap<span class=\\"token punctuation\\">,</span> UInt32<span class=\\"token punctuation\\">)</span> <span class=\\"token keyword\\">comment</span> <span class=\\"token string\\">'标签值'</span>\\n<span class=\\"token punctuation\\">)</span>\\n    <span class=\\"token keyword\\">engine</span> <span class=\\"token operator\\">=</span> AggregatingMergeTree <span class=\\"token keyword\\">PARTITION</span> <span class=\\"token keyword\\">BY</span> label_type\\n        <span class=\\"token keyword\\">ORDER</span> <span class=\\"token keyword\\">BY</span> <span class=\\"token punctuation\\">(</span>label_type<span class=\\"token punctuation\\">,</span> label_value<span class=\\"token punctuation\\">)</span>\\n        SETTINGS index_granularity <span class=\\"token operator\\">=</span> <span class=\\"token number\\">8192</span><span class=\\"token punctuation\\">;</span>\\n</code></pre></div>","autoDesc":true}`);export{u as comp,m as data};
