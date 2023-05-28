---
date: 2023-05-29 00:14:00
category:
  - Java
tag:
  - Apisix
  - Java
---

# apisix基于docker开发java插件

## 环境准备

apisix不支持windows，加上apisix的runner插件使用的协议不支持windows，所以需要在Linux环境下开发，有两个选择

1. 使用Linux服务器部署apisix，通过ssh远程开发
2. 使用windows + wsl2，本地开发【推荐】

两种方案IDEA都支持



使用docker快速搭建开发环境

```sh
git clone https://github.com/apache/apisix-docker.git
```

在`example`文件夹中提供`docker-compose.yml`脚本，但需要简单地调整才能支持java runner的开发

1.修改`apisix_conf/config.yaml`，添加以下内容

```yaml
ext-plugin:
  path_for_test: /tmp/runner.sock
```

2.修改`docker-compose.yml`，在apisix的volumes中添加/tmp映射

```yaml
  apisix:
    volumes:
      ...
      - ./apisix_conf/tmp:/tmp:rw
```



这么配置的原因是apisix的runner插件使用的协议是Unix_domain_socket，这个协议在windows上不支持，配置文件夹映射也是为了把sock文件共享，让在容器中的apisix能通过sock文件与宿主机通信

## 插件开发

引入apisix java runner的jar包

```xml
<dependency>
    <groupId>org.apache.apisix</groupId>
    <artifactId>apisix-runner-starter</artifactId>
    <version>0.4.0</version>
</dependency>
```



启动类

```java
// 启动类中添加扫描org.apache.apisix.plugin.runner包
@SpringBootApplication(scanBasePackages = {"com.example", "org.apache.apisix.plugin.runner"})
public class DemoApplication {

    public static void main(String[] args) {
        new SpringApplicationBuilder(DemoApplication.class)
                .web(WebApplicationType.NONE)
                .run(args);
    }

}

```



Filter开发

```java
@Component
@Slf4j
public class DemoFilter implements PluginFilter {


    @Override
    public String name() {
        return "DemoFilter";
    }

    @Override
    public void filter(HttpRequest request, HttpResponse response, PluginFilterChain chain) {
        log.warn("demo filter");
        chain.filter(request, response);
    }

}
```



就这样，一个简单的apisix java插件就完成了，从apisix配置路由插件，就可以把流量经过插件处理，下面是一个例子：



>  创建upstream

```bash
curl --location --request PUT 'http://127.0.0.1:9180/apisix/admin/upstreams/1' \
--header 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' \
--header 'Content-Type: application/json' \
--data '{
  "type": "roundrobin",
  "nodes": {
    "httpbin.org:80": 1
  }
}'
```

> 创建router

```bash
curl --location --request PUT 'http://127.0.0.1:9180/apisix/admin/routes/1' \
--header 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' \
--header 'Content-Type: application/json' \
--data '{
    "methods": [
        "GET", "POST"
    ],
    "uri": "/anything/*",
    "upstream_id": "1",
    "plugins": {
        "ext-plugin-pre-req": {
            "conf": [
                {
                    "name": "DemoFilter",
                    "value": "bar"
                }
            ]
        }
    }
}'
```

conf中的name需要与`PluginFilter#name`一致，apisix是这个名字找到对于的过滤器的

> 测试

```sh
curl --location --request POST 'http://127.0.0.1:9080/anything/get?foo1=bar1&foo2=bar2'
```

### PluginFilter详解

```java
public interface PluginFilter {

    /**
     * 插件的名称，配置中通过该名称找到对于的过滤器
     *
     * @return the name of plugin filter
     */
    String name();

    /**
     * 过滤器责任链执行的方法，在这个方法上可以对请求、响应处理，
     * 这个方法的生命周期在apisix的两个插件上会被调用到，分别是
     * 1. ext-plugin-pre-req：内置插件执行之前
     * 2. ext-plugin-post-req：内置插件执行之后
     * <p>
     * do the plugin filter chain
     *
     * @param request  the request form APISIX http请求信息
     * @param response the response for APISIX 如果在这个response中设置了http状态码、body、header，请求将不会向下传递，比如不会向下游服务转发
     * @param chain    the chain of filters 过滤器责任链
     */
    default void filter(HttpRequest request, HttpResponse response, PluginFilterChain chain) {
    }

    /**
     * 和filter的功能一样，但被调用的生命周期不一样，会在ext-plugin-post-resp插件中配置才会被
     * 调用
     * <p>
     * filtering after the upstream response is complete
     *
     * @param request  context of the upstream return
     * @param response modify the context of the upstream response
     */
    default void postFilter(PostRequest request, PostResponse response, PluginFilterChain chain) {
    }

    /**
     * 是否需要获取nginx的变量，比如remote_addr、server_port
     * <p>
     * declare in advance the nginx variables that you want to use in the plugin
     *
     * @return the nginx variables as list
     */
    default List<String> requiredVars() {
        return null;
    }

    /**
     * 是否需要请求体
     * <p>
     * need request body in plugins or not
     *
     * @return true if need request body
     */
    default Boolean requiredBody() {
        return false;
    }

    /**
     * 是否需要响应体
     * <p>
     * need response body of upstream server in plugins or not
     *
     * @return true if need response body
     */
    default Boolean requiredRespBody() {
        return false;
    }
}
```



### 生命周期

1. ext-plugin-pre-req
2. ext-plugin-post-req
3. ext-plugin-post-resp



![external-plugin](https://cdn.dhbin.cn/202305290012195.png)

## 网关平替评估

先说结果：**支持平替gateway、zuul，但目前apisix提供的java插件没有达到生产级别，存在性能问题，需要定制开发**



问题1：`PluginFilter`写死了是否需要请求体、响应体，不能动态根据需要判断是否获取，当文件传输等大数据输出也获取body的话，导致严重的性能问题

问题2：apisix对于runner插件热更新能力较弱



### 问题1解决方案

需要解决**问题1**，先要了解apisix与java之间是怎么交互的，从下图知道apisix与runner的交互大致分为两步

1. 先转发http，不带body、nginx变量信息，如果不需要扩展信息直接返回
2. 如果需要的话，直到获取要所有需要的扩展信息才返回

![apisix与runner交互图](https://cdn.dhbin.cn/202305290012539.png)

目前的问题就是，PluginFilter的三个方法请求，并没有传递request、response信息让用户动态判断是否需要获取控制信息

- requiredBody
- requiredVars
- requiredRespBody

![apisix-plugin-filter](https://cdn.dhbin.cn/202305290012112.png)



怎么解决？我们要在判断是否需要body的时候，能取到request/response的信息用作判断即可。



apisix的java runner插件实现是基于netty做的，以下是插件的几个关键Handler

- LoggingHandler：日志输出
- PayloadEncoder：数据编码（bean -> bytes）
- BinaryProtocolDecoder：tcp粘包、粘包处理器（LengthFieldBasedFrameDecoder），协议切割
- PayloadDecoder：数据解码（bytes -> bean）
- **PrepareConfHandler**：处理**RPC_PREPARE_CONF**消息
- **RpcCallHandler**：处理**RPC_EXTRA_INFO**、**RPC_HTTP_REQ_CALL**、**RPC_HTTP_RESP_CALL**消息
- ExceptionCaughtHandler：异常处理



处理流程如下：

![](https://cdn.dhbin.cn/202305290012478.png)



处理判断是否需要扩展信息的关键代码在`org.apache.apisix.plugin.runner.handler.RpcCallHandler#fetchExtraInfo`，如下

```java
private void handleHttpReqCall(ChannelHandlerContext ctx, HttpRequest request) {
    cleanCtx();

    // save HttpCallRequest
    currReq = request;
    currResp = new HttpResponse(currReq.getRequestId());

    confToken = currReq.getConfToken();
    A6Conf conf = cache.getIfPresent(confToken);
    if (Objects.isNull(conf)) {
        logger.warn("cannot find conf token: {}", confToken);
        errorHandle(ctx, Code.CONF_TOKEN_NOT_FOUND);
        return;
    }

    PluginFilterChain chain = conf.getChain();

    // here we pre-read parameters in the req to
    // prevent confusion over the read/write index of the req.
    preReadReq();

    // if the filter chain is empty, then return the response directly
    if (Objects.isNull(chain) || 0 == chain.getFilters().size()) {
        ChannelFuture future = ctx.writeAndFlush(currResp);
        future.addListeners(ChannelFutureListener.FIRE_EXCEPTION_ON_FAILURE);
        return;
    }

    // 这里判断需要的扩展信息
    Boolean[] result = fetchExtraInfo(ctx, chain);
    if (Objects.isNull(result)) {
        return;
    }
    if (!result[0] && !result[1]) {
        // 如果不需要扩展信息直接执行过滤器链
        doFilter(ctx);
    }
}

private Boolean[] fetchExtraInfo(ChannelHandlerContext ctx, PluginFilterChain chain) {
    // fetch the nginx variables
    Set<String> varKeys = new HashSet<>();
    boolean requiredReqBody = false;
    boolean requiredVars = false;
    boolean requiredRespBody = false;

    // 执行过滤器链
    for (PluginFilter filter : chain.getFilters()) {
        // 获取需要的nginx参数
        Collection<String> vars = filter.requiredVars();
        if (!CollectionUtils.isEmpty(vars)) {
            varKeys.addAll(vars);
            requiredVars = true;
        }

        // 判断是否需要request body
        if (filter.requiredBody() != null && filter.requiredBody()) {
            requiredReqBody = true;
        }

        // 判断是否需要response body
        if (filter.requiredRespBody() != null && filter.requiredRespBody()) {
            requiredRespBody = true;
        }
    }

    // fetch the nginx vars
    ...

        // fetch the request body
        ...

        // fetch the response body
        ...

        return new Boolean[]{requiredVars, requiredReqBody, requiredRespBody};
}
```

从源码中知道，apisix与插件的交互的方式是先发起RPC_HTTP_REQ_CALL请求，这请求是不带body等参数的，通过filter定义的方法判断是否需要扩展信息，再从apisix上取回，但问题就是判断的方法没有支持传递request、reponse让方法判断，解决这个问题的方案就是扩展`PluginFilter`，如下：

```java
/**
 * 扩展Plugin支持动态判断是否需要扩展信息
 *
 * @author dhb
 */
public interface ExtPluginFilter extends PluginFilter {


    /**
     * 需要获取的nginx参数
     *
     * @param request  request
     * @param response response
     * @return 参数名集合
     */
    default List<String> requiredVars(HttpRequest request, HttpResponse response) {
        return null;
    }


    /**
     * 需要获取的nginx参数
     *
     * @param request  post request
     * @param response post response
     * @return 参数名集合
     */
    default List<String> requiredVars(PostRequest request, PostResponse response) {
        return null;
    }

    /**
     * 判断是否需要请求体
     *
     * @param request  request
     * @param response response
     */
    default void requiredBody(HttpRequest request, HttpResponse response) {
    }


    /**
     * 判断是否需要请求体
     *
     * @param request  post request
     * @param response post response
     */
    default void requiredBody(PostRequest request, PostResponse response) {
    }


    /**
     * 判断是否需要响应体
     *
     * @param request  request
     * @param response response
     */
    default void requiredRespBody(HttpRequest request, HttpResponse response) {
    }

    /**
     * 判断是否需要响应体
     *
     * @param request  post request
     * @param response post response
     */
    default void requiredRespBody(PostRequest request, PostResponse response) {
    }
}

```

重写`RpcCallHandler#fetchExtraInfo`方法的处理逻辑，判断是`ExtPluginFilter`执行控制的方法。



### 问题2解决方案

apisix提供的java热更新方案是监听文件夹内的java文件是否有变化，如果更新通过动态编译+自定义类加载器+BeanDefinitionRegistry，实现Filter的动态替换，但这个能力比较弱，同时也存在一些问题，比如

- 更新需要添加依赖jar包是无法加载进去
- 替换bean不是原子操作存在间隙获取不到filter
- 带有缓存机制，目前版本没有清理缓存

解决方案：

- 监听改变事件、获取更新的版本信息，通过UrlClassLoader动态加载，并清理缓存。但替换bean不好解决，需要加锁



解决方案二：

我们一般在k8s上部署，但需要更新版本时，重做镜像，通过k8s的能力滚动更新，不需要热更新的功能



## 扩展

### 传输协议

```
+-----------+------------+---------+
| 消息类型   |    数据长度  |   数据   |
+-----------+------------+---------+
| 1 byte    | 3 bytes    | x bytes |
+-----------+------------+---------+


消息类型：

配置的更新推送标识
RPC_PREPARE_CONF = 1,
http请求
RPC_HTTP_REQ_CALL = 2,
扩展信息
RPC_EXTRA_INFO = 3,
下游http响应后
RPC_HTTP_RESP_CALL = 4,

https://github.com/apache/apisix/blob/master/apisix/constants.lua#L20


数据长度用3个字节标识，最大2^24-1，数据最大能传输16Mb，但官网中写着最大值是8M,不知道是写错了还是我理解错了
```

![](https://cdn.dhbin.cn/202305290012598.png)

## 测试方案

- 单元测试：junit + mockito
- 集成测试：testcontainer