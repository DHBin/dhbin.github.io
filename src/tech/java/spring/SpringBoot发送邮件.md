---
date: 2018-08-03 22:25:00
---

# Spring boot中怎么发送各种格式的邮件

# 纯文本邮件

```JAVA
@Autowired
JavaMailSender mailSender;

public void sendSimpleMail() {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom("xx158@qq.com");    // 发件人
    message.setTo("1020641638@qq.com"); // 收件人
    message.setSubject("标题");
    message.setText("内容");
    mailSender.send(message);
}
```

# html格式邮件

```JAVA
public void sendSimpleMail(String to, String subject, String content) {
    //true表示需要创建一个multipart message
    MimeMessage message = mailSender.createMimeMessage();
    try {
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);  //true代表内容为Html
        mailSender.send(message);
        logger.info("html邮件发送成功");
    } catch (MessagingException e) {
        logger.error("发送失败", e);
    }
}

```

# 带附件邮件

```JAVA
public void sendAttachmentsMail(String to, String subject, String content, String filePath) {
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
        logger.info("带附件的邮件已经发送。");
    } catch (MessagingException e) {
        logger.error("发送带附件的邮件时发生异常！", e);
    }
}

```

# 内嵌资源邮件

```java
public void sendInlineResourceMail(String to, String subject, String content, String rscPath, String rscId) {
    MimeMessage message = mailSender.createMimeMessage();
    try {
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        FileSystemResource res = new FileSystemResource(new File(rscPath));
        helper.addInline(rscId, res);   //内嵌资源ID与资源
        mailSender.send(message);
        logger.info("嵌入静态资源的邮件已经发送。");
    } catch (MessagingException e) {
        logger.error("发送嵌入静态资源的邮件时发生异常！", e);
    }
}

```

# 设置别名

```JAVA
MailMessage.setFrom("别名<邮箱地址>");

//例子：
// HOW ARE YOU 就是别名
MailMessage.setFrom("HOW ARE YOU<xx158@qq.com>");

```

# 参考资料

[springboot(十)：邮件服务](https://www.cnblogs.com/ityouknow/p/6823356.html)
