---
date: 2020-07-02 17:05:00
category:
  - Java
tag:
 - Spring
---

# Spring事务分析

## Propagation

- REQUIRED：支持当前事务，如果当前没有事务，就新建一个事务。这是最常见的选择。 
- SUPPORTS：支持当前事务，如果当前没有事务，就以非事务方式执行。 
- MANDATORY：支持当前事务，如果当前没有事务，就抛出异常。 
- REQUIRES_NEW：新建事务，如果当前存在事务，把当前事务挂起。 
- NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。 
- NEVER：以非事务方式执行，如果当前存在事务，则抛出异常。 
- NESTED：支持当前事务，如果当前事务存在，则执行一个嵌套事务，如果当前没有事务，就新建一个事务。



Spring中默认Propagation是REQUIRED



## TransactionSynchronizationManager

- getCurrentTransactionName: 获取当前事务名

## 事务失效情景

### Propagation配置失效

Spring的事务是基于Aop实现的，因为调用同一类下的方法会导致Aop失效，所以使用@Transactional配置同一个类下的不同方法，且嵌套调用，会导致配置失效。下面看个例子

```java
public class A {
	
    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void x() {
    	y();
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRES_NEW)
    public void y() {
    	
    }
}
```

期望是y方法被调用时会挂起当前事务，并新建事务。但是x中调用y情况就不一样了，因为Aop失效，y上配置的@Transactional就没有效果了，所以y并不会新建一个事务执行，而是走了x的事务。
