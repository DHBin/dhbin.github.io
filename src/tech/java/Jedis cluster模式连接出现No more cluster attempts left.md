---
date: 2023-04-10
category:
  - Java
tag:
  - Java
  - Jedis
  - Redis
---

# Jedis cluster模式连接出现No more cluster attempts left

同事在测试环境jedis cluster模式出现`redis.clients.jedis.exceptions.JedisClusterMaxAttemptsException: No more cluster attempts left.`报错，找到我帮忙定位下问题

![](https://cdn.dhbin.cn/202304102012717.png)

通过堆栈信息找到对应的源码位置`redis.clients.jedis.JedisClusterCommand#runWithRetries`

```java
  private T runWithRetries(final int slot, int attempts, boolean tryRandomNode, JedisRedirectionException redirect) {
    if (attempts <= 0) {
      throw new JedisClusterMaxAttemptsException("No more cluster attempts left.");
    }
    ...
  }
```

从源码中分析得到，在测试`attempts`次之后就会抛出`No more cluster attempts left`的异常，根据源码下文有两种异常会导致重试

- JedisConnectionException：连接redis出现异常
- JedisRedirectionException：redis重定向会抛出的异常，比如MOVE

![](https://cdn.dhbin.cn/202304102012522.png)

在对应的位置打上断点，运行出现问题的接口，出现以下报错

![](https://cdn.dhbin.cn/202304102012155.png)

问题就很明显了，`ERR Client sent AUTH, but no password is set`，意思是项目配置设置了密码，但是这个redis节点没有设置密码，是运维的同学漏配置了

