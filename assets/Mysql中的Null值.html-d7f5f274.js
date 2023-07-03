import{_ as e}from"./plugin-vue_export-helper-c27b6911.js";import{o as l,c as n,e as s}from"./app-f1812a7b.js";const a={},d=s(`<h1 id="mysql中的null值" tabindex="-1"><a class="header-anchor" href="#mysql中的null值" aria-hidden="true">#</a> Mysql中的Null值</h1><p>在大对数编程语言中，逻辑表达式的值只有两种：True，False。但是在关系型数据库中的逻辑表达式并非两种，而是三值逻辑的表达式(True、False、Unknown)。</p><div class="language-mysql line-numbers-mode" data-ext="mysql"><pre class="language-mysql"><code>select null = 1;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>执行结果：</p><div class="language-mysql line-numbers-mode" data-ext="mysql"><pre class="language-mysql"><code>+----------+
| null = 1 |
+----------+
|     NULL |
+----------+
1 row in set (0.01 sec)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-mysql line-numbers-mode" data-ext="mysql"><pre class="language-mysql"><code>select null = null;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>执行结果：</p><div class="language-mysql line-numbers-mode" data-ext="mysql"><pre class="language-mysql"><code>+-------------+
| null = null |
+-------------+
|        NULL |
+-------------+
1 row in set (0.00 sec)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>出乎意料的是<code>null = 1</code>返回的是null，而<code>null = null</code>返回的也是null，而不是1。对于返回值是null的情况，应该将它视为unknown的情况，即表示未知。在不同的语句下unknown表示不同的值</p><h2 id="on" tabindex="-1"><a class="header-anchor" href="#on" aria-hidden="true">#</a> ON</h2><p>unknown被视为False</p><h2 id="group-by" tabindex="-1"><a class="header-anchor" href="#group-by" aria-hidden="true">#</a> GROUP BY</h2><p>group by会把null值分到一组</p><h2 id="order-by" tabindex="-1"><a class="header-anchor" href="#order-by" aria-hidden="true">#</a> ORDER BY</h2><p>order by会把null值排列在一起</p>`,15),i=[d];function r(u,c){return l(),n("div",null,i)}const v=e(a,[["render",r],["__file","Mysql中的Null值.html.vue"]]);export{v as default};
