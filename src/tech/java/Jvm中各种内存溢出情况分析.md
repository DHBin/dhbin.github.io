---
date: 2020-01-20 13:23:00
category:
  - Java
tag:
  - Jvm
---



# Jvm中各种内存溢出情况分析



> 本文以 JDK8 来研究讨论，其它 JDK 可能有不同的结果。

<!-- more -->

oom 即 OutOfMemoryError，出现这个报错的主要原因是**内存空间不足以装下数据导致抛出异常**。要探讨 JVM 出现 oom 的情况，首先要了解下 jvm 的内存模型。

![jmm.png](https://cdn.dhbin.cn/374980155.png)

上图中每个区域都可能出现 oom，除此之外还有**直接内存（direct memory）**溢出。



# 堆溢出

java 堆用于存储对象实例，只要不断地产生对象，并且**保证 GC Roots 到对象之间有可达路径来避免垃圾回收机制清除这些对象**，那么在对象数量达到最大堆的容量限制后就会产生内存溢出异常。



## 可达性分析算法

判断对象是否可以回收采用的是可达性分析算法，只要被 gc roots 引用的对象就不会被回收。那么 gc root 有那几种？一个对象可以属于多个 root，GC root 有几下种：
・Class - 由系统类加载器 (system class loader) 加载的对象，这些类是不能够被回收的，他们可以以静态字段的方式保存持有其它对象。我们需要注意的一点就是，通过用户自定义的类加载器加载的类，除非相应的 java.lang.Class 实例以其它的某种（或多种）方式成为 roots，否则它们并不是 roots

・Thread - 活着的线程

・Stack Local - Java 方法的 local 变量或参数

・JNI Local - JNI 方法的 local 变量或参数

・JNI Global - 全局 JNI 引用

・Monitor Used - 用于同步的监控对象

・Held by JVM - 用于 JVM 特殊目的由 GC 保留的对象，但实际上这个与 JVM 的实现是有关的。可能已知的一些类型是：系统类加载器、一些 JVM 知道的重要的异常类、一些用于处理异常的预分配对象以及一些自定义的类加载器等。然而，JVM 并没有为这些对象提供其它的信息，因此就只有留给分析分员去确定哪些是属于 "JVM 持有" 的了。



## 例子

```java
import java.util.ArrayList;
import java.util.List;

/**
 * VM args: -Xmx20m -Xms20m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath={HeapDump文件目录}
 *
 * @author donghaibin
 * @date 2020/1/20
 */
public class HeapOomTest {

    static class OomObject {

    }

    public static void main(String[] args) {
        List<OomObject> oomObjects = new ArrayList<>();
        while (true) {
            oomObjects.add(new OomObject());
        }
    }


}
```

运行结果：

```
java.lang.OutOfMemoryError: Java heap space
Dumping heap to java_pid56168.hprof ...
Heap dump file created [28216756 bytes in 0.077 secs]
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
    at java.util.Arrays.copyOf(Arrays.java:3210)
    at java.util.Arrays.copyOf(Arrays.java:3181)
    at java.util.ArrayList.grow(ArrayList.java:265)
    at java.util.ArrayList.ensureExplicitCapacity(ArrayList.java:239)
    at java.util.ArrayList.ensureCapacityInternal(ArrayList.java:231)
    at java.util.ArrayList.add(ArrayList.java:462)
    at jvm.HeapOomTest.main(HeapOomTest.java:21)

Process finished with exit code 1
```

![img](https://cdn.dhbin.cn/1025183087.png)

通过 mat 内存分析工具打开 dump 出来的文件，如果是内存泄漏，查看泄漏对象到 gc roots 的引用链，找到泄漏对象是通过怎样的路径与 gc roots 相关联并导致垃圾收集器无法自动回收它们的，就能比较准确定位出泄漏代码的位置。如果不是内存泄漏，换句话说，就是堆里的内存必须存活，那就考虑增大堆的大小、代码上检查是否有对象生命周期过长，尝试减少程序运行期的内存消耗。



# 虚拟机栈与本地方法栈溢出

Hotshot 不区分虚拟机栈和本地方法栈，因此，通过 - Xoss 参数设置本地方法栈的大小实际上是无效的。栈容量只能通过 **-Xss** 参数设定。关于虚拟机栈和本地方法栈的溢出，在 Java 虚拟机规范中描述了两种异常：

- 线程执行深度大于虚拟机所允许的深度时，将抛出 StackOverflowError
- 如果虚拟机在扩展栈时无法申请到足够的内存空间，将抛出 OutOfMemoryError

运行一个线程就会创建一个虚拟机栈，每个方法的调用对应栈中的栈帧



### StackOverflowError 例子

递归执行 stackLeek 方法，每次向栈中压入一个栈帧，当大于虚拟机所需要的允许时就抛出异常

```java
/**
 * Vm args: -Xss128k
 *
 * @author donghaibin
 * @date 2020/1/20
 */
public class StackOomTest {

    private static int stackLength = 1;

    public void stackLeek() {
        stackLength++;
        stackLeek();
    }

    public static void main(String[] args) {
        StackOomTest stackOomTest = new StackOomTest();
        try {
            stackOomTest.stackLeek();
        } catch (Throwable throwable) {
            System.out.println("stack length: " + stackLength);
            throw throwable;
        }
    }

}
```

运行结果：

```
stack length: 1885
Exception in thread "main" java.lang.StackOverflowError
    at jvm.StackOomTest.stackLeek(StackOomTest.java:15)
    at jvm.StackOomTest.stackLeek(StackOomTest.java:15)
    ...
    at jvm.StackOomTest.stackLeek(StackOomTest.java:15)
```



## OutOfMemoryError 例子

操作系统为每个进程分配内存是有限制的，譬如 32 位的 Windows 限制为 2G。虚拟机提供参数控制堆和方法区这两部分内存大小，剩下的内存由虚拟机栈和本地方法栈**瓜分**。**分配给进程的总内存减去最大堆内存减去方法区，程序计数器占用的内存小，可以忽略，剩下的就是虚拟机栈和本地方法栈的内存大小。**