---
date: 2023-11-08 13:31:00
category:
  - Java
tag:
 - Spring
 - Spring Gateway
---


# Spring Gateway堆外内存溢出问题定位


公司使用Spring Gateway作为业务网关，一直存在一个堆外内存泄露的疑难杂症。从同事手上接手过来后最终解决了这个问题。

<!-- more -->

## 分析

一般地，netty的堆外内存泄露可以通过加上`-Dio.netty.leakDetection.level=PARANOID`参数，然后去压测观察是否有打印内存泄露的情况，很不幸的是，我们尝试过没有效果，没有打印。

然后，因为jdk的版本很旧，尝试过升级jdk的版本，但是问题依旧


产线的有很多k8s集群，集群下的Gateway因为某些业务的原因独立给部署一套网关使用。通过观察，有些网关服务一个月都不会发生oom重启，有的甚至几个小时就会发生一次（得益于k8s的能力，基本上对业务无感）。

这里就比较有点意思了，观察经常oom的那个网关，发现这里的请求普遍响应数据比较大，这时就开始怀疑在网关与下游服务响应处理的代码是否存在内存泄露的问题了。


抓住这一点，在本地环境模拟这种情况。

## 动手

待补充

## 解决

最终，定位到是以下代码导致了堆外内存泄露

```java
public class Oom extends ServerHttpResponseDecorator {
    
    public Oom(ServerHttpResponse delegate) {
        super(delegate);
    }

    @Override
    @NonNull
    public Mono<Void> writeWith(@NonNull Publisher<? extends DataBuffer> body) {
        Flux<? extends DataBuffer> flux = Flux.from(body);
        return super.writeWith(flux.buffer().map(dataBuffers -> {
            DataBufferFactory dataBufferFactory = getDelegate().bufferFactory();
            DataBuffer join = dataBufferFactory.join(dataBuffers);
            byte[] content = new byte[join.readableByteCount()];
            join.read(content);
            DataBufferUtils.release(join);
            // 忽略其他处理
            return dataBufferFactory.wrap(content);
        }));
    }
}
```

咋一看，似乎没有什么问题，新建的buffer也回收了。问题在哪呢，`flux.buffer()` buffer这个操作符的作用是把Flux的所有DataBuffer读取出来保存到List里面，关键源码如下

```java
reactor.core.publisher.FluxBuffer.BufferExactSubscriber#onNext

@Override
public void onNext(T t) {
    if (done) {
        Operators.onNextDropped(t, actual.currentContext());
        return;
    }

    C b = buffer;
    if (b == null) {
        try {
            b = Objects.requireNonNull(bufferSupplier.get(),
                    "The bufferSupplier returned a null buffer");
        }
        catch (Throwable e) {
            Context ctx = actual.currentContext();
            onError(Operators.onOperatorError(s, e, t, ctx));
            Operators.onDiscard(t, ctx); //this is in no buffer
            return;
        }
        buffer = b;
    }
    // b是一个列表，消费到的t会添加到b中
    b.add(t);

    if (b.size() == size) {
        buffer = null;
        actual.onNext(b);
    }
}

```

一般情况下，databuffer会被上面`dataBufferFactory.join`回收，但是，在请求被取消或者错误的情况下，并不会执行到`map`这个方法中，导致添加到List中的

Databuffer不能够被回收。

解决也很简单，继续看源码

```java
reactor.core.publisher.FluxBuffer.BufferExactSubscriber#onError

@Override
public void onError(Throwable t) {
    if (done) {
        Operators.onErrorDropped(t, actual.currentContext());
        return;
    }
    done = true;
    actual.onError(t);
    Operators.onDiscardMultiple(buffer, actual.currentContext());
}

@Override
public void cancel() {
    s.cancel();
    Operators.onDiscardMultiple(buffer, this.ctx);
}
```

在取消或者出现错误的事件中，会把Databuffer回调给`onDiscard`事件，所以把代码改成如下就解决了

```java

@Override
@NonNull
public Mono<Void> writeWith(@NonNull Publisher<? extends DataBuffer> body) {
    Flux<? extends DataBuffer> flux = Flux.from(body);
    return super.writeWith(flux.buffer().map(dataBuffers -> {
        DataBufferFactory dataBufferFactory = getDelegate().bufferFactory();
        DataBuffer join = dataBufferFactory.join(dataBuffers);
        byte[] content = new byte[join.readableByteCount()];
        join.read(content);
        DataBufferUtils.release(join);
        // 忽略其他处理
        return dataBufferFactory.wrap(content);
    })
    // 监听discard事件，把Databuffer回收
    .doOnDiscard(DataBuffer.class, DataBufferUtils::release));
}

```

上面的代码其实只是解决了oom的问题，但是更要考虑的是为什么需要把所有的body读取出来，如果是做日志记录的话，应该需要对body的内容进行截断，因为body的大小是不可控的。

这需要从业务上去优化。