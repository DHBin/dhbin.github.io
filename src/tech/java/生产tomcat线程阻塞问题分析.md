---
date: 2023-03-29 17:16:00
category:
  - Java
tag:
  - 问题排查
  - Druid
---

# 生产tomcat线程阻塞问题分析

## 现象

当大量的请求到服务，过一会，服务无法响应请求，k8s配置了健康检查，服务被k8s重启

## 分析

让运维的同学把thread和heap dump了下来，打开一看，全部tomcat的线程阻塞在Druid连接池上

### 线程情况

![image-20230329092255788_1](https://cdn.dhbin.cn/202303291704461.png)

所有的tomcat线程堵塞在`com.alibaba.druid.pool.DruidDataSource.takeLast`，该方法是从Druid的连接池取出连接，当线程池没有空闲的时候，一直阻塞等待。

### 堆文件分析

![heap](https://cdn.dhbin.cn/202303291703621.png)

- notEmptyWaitThreadPeak：当前等待连接池的线程数
- poolingCount：连接池中的连接数
- maxActive：连接池的最大容量
- activeCount：当前活跃（在执行sql的连接）数

通过上图知道在一个容量为8的连接池中，有200个线程在等待一个poolingCount为0的连接池，刚好对应上tomcat的连接数

## 解决

项目使用了ShardingSphere做分表分库，在配置ShardingSphere时，没有对每个数据库配置连接池大小，使用了默认配置，默认maxActive最大为8，当有慢sql阻塞的时候，很容易就出现整个服务阻塞，应当增大连接池的大小

项目中配置了`spring.datasource.druid.max-active`大小，但是shardingsphere不兼容该配置，需要像一下方式配置

```properties
spring.shardingsphere.datasource.<datasource-name>.max-active = xxx
```







