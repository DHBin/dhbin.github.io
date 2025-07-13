import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,b as e,o as i}from"./app-CqnfWZLp.js";const l={};function p(d,s){return i(),a("div",null,s[0]||(s[0]=[e(`<h1 id="mysql生产死锁问题定位" tabindex="-1"><a class="header-anchor" href="#mysql生产死锁问题定位"><span>Mysql生产死锁问题定位</span></a></h1><p>生产上一个消费mq消息的服务出现了死锁问题，通过命令获取到的mysql日志如下：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-"><span class="line"><span>=====================================</span></span>
<span class="line"><span>2023-06-28 09:53:31 0x7f6ca09ff700 INNODB MONITOR OUTPUT</span></span>
<span class="line"><span>=====================================</span></span>
<span class="line"><span>Per second averages calculated from the last 33 seconds</span></span>
<span class="line"><span>-----------------</span></span>
<span class="line"><span>BACKGROUND THREAD</span></span>
<span class="line"><span>-----------------</span></span>
<span class="line"><span>srv_master_thread loops: 266272 srv_active, 0 srv_shutdown, 10930955 srv_idle</span></span>
<span class="line"><span>srv_master_thread log flush and writes: 0</span></span>
<span class="line"><span>----------</span></span>
<span class="line"><span>SEMAPHORES</span></span>
<span class="line"><span>----------</span></span>
<span class="line"><span>OS WAIT ARRAY INFO: reservation count 1616097</span></span>
<span class="line"><span>OS WAIT ARRAY INFO: signal count 2061102</span></span>
<span class="line"><span>RW-shared spins 2022619, rounds 2302798, OS waits 232184</span></span>
<span class="line"><span>RW-excl spins 1889177, rounds 12494241, OS waits 93099</span></span>
<span class="line"><span>RW-sx spins 351310, rounds 2586746, OS waits 51797</span></span>
<span class="line"><span>Spin rounds per wait: 1.14 RW-shared, 6.61 RW-excl, 7.36 RW-sx</span></span>
<span class="line"><span>------------------------</span></span>
<span class="line"><span>LATEST DETECTED DEADLOCK</span></span>
<span class="line"><span>------------------------</span></span>
<span class="line"><span>2023-06-27 21:38:31 0x7f6ca0387700</span></span>
<span class="line"><span>*** (1) TRANSACTION:</span></span>
<span class="line"><span>TRANSACTION 96847162, ACTIVE 0 sec inserting</span></span>
<span class="line"><span>mysql tables in use 1, locked 1</span></span>
<span class="line"><span>LOCK WAIT 3 lock struct(s), heap size 1136, 2 row lock(s), undo log entries 1</span></span>
<span class="line"><span>MySQL thread id 3169079, OS thread handle 140104549562112, query id 320067350 10.245.0.173 mdm update</span></span>
<span class="line"><span>insert into table (...) values (...)</span></span>
<span class="line"><span>*** (1) WAITING FOR THIS LOCK TO BE GRANTED:</span></span>
<span class="line"><span>RECORD LOCKS space id 12940 page no 2287 n bits 376 index org_code of table \`db\`.\`table\` trx id 96847162 lock_mode X locks gap before rec insert intention waiting</span></span>
<span class="line"><span>Record lock, heap no 292 PHYSICAL RECORD: n_fields 2; compact format; info bits 0</span></span>
<span class="line"><span> 0: len 10; hex 32323232323437393237; asc 2222247927;;</span></span>
<span class="line"><span> 1: len 30; hex 326339653430386538383935663563313031383864366334656464343166; asc 2c9e408e8895f5c10188d6c4edd41f; (total 32 bytes);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>*** (2) TRANSACTION:</span></span>
<span class="line"><span>TRANSACTION 96847161, ACTIVE 0 sec inserting</span></span>
<span class="line"><span>mysql tables in use 1, locked 1</span></span>
<span class="line"><span>3 lock struct(s), heap size 1136, 2 row lock(s), undo log entries 1</span></span>
<span class="line"><span>MySQL thread id 3169075, OS thread handle 140104521250560, query id 320067349 10.245.0.173 mdm update</span></span>
<span class="line"><span>insert into table (...) values (...)</span></span>
<span class="line"><span>*** (2) HOLDS THE LOCK(S):</span></span>
<span class="line"><span>RECORD LOCKS space id 12940 page no 2287 n bits 376 index org_code of table \`db\`.\`table\` trx id 96847161 lock_mode X locks gap before rec</span></span>
<span class="line"><span>Record lock, heap no 292 PHYSICAL RECORD: n_fields 2; compact format; info bits 0</span></span>
<span class="line"><span> 0: len 10; hex 32323232323437393237; asc 2222247927;;</span></span>
<span class="line"><span> 1: len 30; hex 326339653430386538383935663563313031383864366334656464343166; asc 2c9e408e8895f5c10188d6c4edd41f; (total 32 bytes);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>*** (2) WAITING FOR THIS LOCK TO BE GRANTED:</span></span>
<span class="line"><span>RECORD LOCKS space id 12940 page no 2287 n bits 376 index org_code of table \`db\`.\`table\` trx id 96847161 lock_mode X locks gap before rec insert intention waiting</span></span>
<span class="line"><span>Record lock, heap no 292 PHYSICAL RECORD: n_fields 2; compact format; info bits 0</span></span>
<span class="line"><span> 0: len 10; hex 32323232323437393237; asc 2222247927;;</span></span>
<span class="line"><span> 1: len 30; hex 326339653430386538383935663563313031383864366334656464343166; asc 2c9e408e8895f5c10188d6c4edd41f; (total 32 bytes);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>*** WE ROLL BACK TRANSACTION (2)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>代码sql</p><div class="language-sql line-numbers-mode" data-highlighter="shiki" data-ext="sql" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code class="language-sql"><span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"># 删除数据</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">delete</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> \`db\`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">\`table\`</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> where</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> org_code </span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;">=</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> ?</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"># 新增数据</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">insert into</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;"> \`db\`</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">\`table\`</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> values</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(...)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>原因：org_code这个字段上存在索引，RC事务级别会产生间隙锁把相邻的位置锁住，多条消息过来多线程消费导致锁相互持有最终导致死锁</p><p>解决方法: 在业务允许的情况下，减低mysql事务隔离级别到RR</p>`,7)]))}const r=n(l,[["render",p]]),o=JSON.parse('{"path":"/tech/mysql/Mysql%E7%94%9F%E4%BA%A7%E6%AD%BB%E9%94%81%E9%97%AE%E9%A2%98%E5%AE%9A%E4%BD%8D.html","title":"Mysql生产死锁问题定位","lang":"zh-CN","frontmatter":{"date":"2023-07-03T00:00:00.000Z","category":["Mysql"],"tag":["Mysql","deadlock"],"description":"生产上一个消费mq消息的服务出现了死锁问题，通过命令获取到的mysql日志如下：","head":[["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Mysql生产死锁问题定位\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-07-03T00:00:00.000Z\\",\\"dateModified\\":\\"2023-11-08T06:40:34.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"DHB\\",\\"url\\":\\"https://dhbin.cn\\"}]}"],["meta",{"property":"og:url","content":"https://dhbin.cn/tech/mysql/Mysql%E7%94%9F%E4%BA%A7%E6%AD%BB%E9%94%81%E9%97%AE%E9%A2%98%E5%AE%9A%E4%BD%8D.html"}],["meta",{"property":"og:site_name","content":"HB技术栈"}],["meta",{"property":"og:title","content":"Mysql生产死锁问题定位"}],["meta",{"property":"og:description","content":"生产上一个消费mq消息的服务出现了死锁问题，通过命令获取到的mysql日志如下："}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-11-08T06:40:34.000Z"}],["meta",{"property":"article:tag","content":"deadlock"}],["meta",{"property":"article:tag","content":"Mysql"}],["meta",{"property":"article:published_time","content":"2023-07-03T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-11-08T06:40:34.000Z"}]]},"git":{"createdTime":1699425634000,"updatedTime":1699425634000,"contributors":[{"name":"dhb","username":"dhb","email":"xx158@qq.com","commits":1,"url":"https://github.com/dhb"}]},"readingTime":{"minutes":1.89,"words":567},"excerpt":"\\n<p>生产上一个消费mq消息的服务出现了死锁问题，通过命令获取到的mysql日志如下：</p>\\n","autoDesc":true}');export{r as comp,o as data};
