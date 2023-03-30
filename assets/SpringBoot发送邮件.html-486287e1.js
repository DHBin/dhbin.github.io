import{_ as e,X as a,Y as t,Z as n,$ as i,a0 as l,a1 as c,C as o}from"./framework-dc96d9cf.js";const p={},u=c(`<h1 id="spring-boot中怎么发送各种格式的邮件" tabindex="-1"><a class="header-anchor" href="#spring-boot中怎么发送各种格式的邮件" aria-hidden="true">#</a> Spring boot中怎么发送各种格式的邮件</h1><h1 id="纯文本邮件" tabindex="-1"><a class="header-anchor" href="#纯文本邮件" aria-hidden="true">#</a> 纯文本邮件</h1><div class="language-JAVA line-numbers-mode" data-ext="JAVA"><pre class="language-JAVA"><code>@Autowired
JavaMailSender mailSender;

public void sendSimpleMail() {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(&quot;xx158@qq.com&quot;);    // 发件人
    message.setTo(&quot;1020641638@qq.com&quot;); // 收件人
    message.setSubject(&quot;标题&quot;);
    message.setText(&quot;内容&quot;);
    mailSender.send(message);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="html格式邮件" tabindex="-1"><a class="header-anchor" href="#html格式邮件" aria-hidden="true">#</a> html格式邮件</h1><div class="language-JAVA line-numbers-mode" data-ext="JAVA"><pre class="language-JAVA"><code>public void sendSimpleMail(String to, String subject, String content) {
    //true表示需要创建一个multipart message
    MimeMessage message = mailSender.createMimeMessage();
    try {
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);  //true代表内容为Html
        mailSender.send(message);
        logger.info(&quot;html邮件发送成功&quot;);
    } catch (MessagingException e) {
        logger.error(&quot;发送失败&quot;, e);
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="带附件邮件" tabindex="-1"><a class="header-anchor" href="#带附件邮件" aria-hidden="true">#</a> 带附件邮件</h1><div class="language-JAVA line-numbers-mode" data-ext="JAVA"><pre class="language-JAVA"><code>public void sendAttachmentsMail(String to, String subject, String content, String filePath) {
    MimeMessage message = mailSender.createMimeMessage();
    try {
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        FileSystemResource file = new FileSystemResource(new File(filePath));
        String fileName = filePath.substring(filePath.lastIndexOf(File.separator));
        helper.addAttachment(fileName, file);   //添加附件，可多个
        mailSender.send(message);
        logger.info(&quot;带附件的邮件已经发送。&quot;);
    } catch (MessagingException e) {
        logger.error(&quot;发送带附件的邮件时发生异常！&quot;, e);
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="内嵌资源邮件" tabindex="-1"><a class="header-anchor" href="#内嵌资源邮件" aria-hidden="true">#</a> 内嵌资源邮件</h1><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">sendInlineResourceMail</span><span class="token punctuation">(</span><span class="token class-name">String</span> <span class="token keyword">to</span><span class="token punctuation">,</span> <span class="token class-name">String</span> subject<span class="token punctuation">,</span> <span class="token class-name">String</span> content<span class="token punctuation">,</span> <span class="token class-name">String</span> rscPath<span class="token punctuation">,</span> <span class="token class-name">String</span> rscId<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">MimeMessage</span> message <span class="token operator">=</span> mailSender<span class="token punctuation">.</span><span class="token function">createMimeMessage</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token class-name">MimeMessageHelper</span> helper <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">MimeMessageHelper</span><span class="token punctuation">(</span>message<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        helper<span class="token punctuation">.</span><span class="token function">setFrom</span><span class="token punctuation">(</span>from<span class="token punctuation">)</span><span class="token punctuation">;</span>
        helper<span class="token punctuation">.</span><span class="token function">setTo</span><span class="token punctuation">(</span><span class="token keyword">to</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        helper<span class="token punctuation">.</span><span class="token function">setSubject</span><span class="token punctuation">(</span>subject<span class="token punctuation">)</span><span class="token punctuation">;</span>
        helper<span class="token punctuation">.</span><span class="token function">setText</span><span class="token punctuation">(</span>content<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">FileSystemResource</span> res <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">FileSystemResource</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">File</span><span class="token punctuation">(</span>rscPath<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        helper<span class="token punctuation">.</span><span class="token function">addInline</span><span class="token punctuation">(</span>rscId<span class="token punctuation">,</span> res<span class="token punctuation">)</span><span class="token punctuation">;</span>   <span class="token comment">//内嵌资源ID与资源</span>
        mailSender<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span>message<span class="token punctuation">)</span><span class="token punctuation">;</span>
        logger<span class="token punctuation">.</span><span class="token function">info</span><span class="token punctuation">(</span><span class="token string">&quot;嵌入静态资源的邮件已经发送。&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">MessagingException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        logger<span class="token punctuation">.</span><span class="token function">error</span><span class="token punctuation">(</span><span class="token string">&quot;发送嵌入静态资源的邮件时发生异常！&quot;</span><span class="token punctuation">,</span> e<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="设置别名" tabindex="-1"><a class="header-anchor" href="#设置别名" aria-hidden="true">#</a> 设置别名</h1><div class="language-JAVA line-numbers-mode" data-ext="JAVA"><pre class="language-JAVA"><code>MailMessage.setFrom(&quot;别名&lt;邮箱地址&gt;&quot;);

//例子：
// HOW ARE YOU 就是别名
MailMessage.setFrom(&quot;HOW ARE YOU&lt;xx158@qq.com&gt;&quot;);

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料" aria-hidden="true">#</a> 参考资料</h1>`,12),r={href:"https://www.cnblogs.com/ityouknow/p/6823356.html",target:"_blank",rel:"noopener noreferrer"};function d(m,v){const s=o("ExternalLinkIcon");return a(),t("div",null,[u,n("p",null,[n("a",r,[i("springboot(十)：邮件服务"),l(s)])])])}const b=e(p,[["render",d],["__file","SpringBoot发送邮件.html.vue"]]);export{b as default};
