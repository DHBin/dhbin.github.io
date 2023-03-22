---
date: 2020-01-06
category:
  - Java
tag:
  - 原理
---

# Java String::intern方法

了解一个方法的作用，最直接的方法就是看这个方法的 java doc

```java
    /**
     * Returns a canonical representation for the string object.
     * <p>
     * A pool of strings, initially empty, is maintained privately by the
     * class <code>String</code>.
     * <p>
     * When the intern method is invoked, if the pool already contains a
     * string equal to this <code>String</code> object as determined by
     * the {@link #equals(Object)} method, then the string from the pool is
     * returned. Otherwise, this <code>String</code> object is added to the
     * pool and a reference to this <code>String</code> object is returned.
     * <p>
     * It follows that for any two strings <code>s</code> and <code>t</code>,
     * <code>s.intern()&nbsp;==&nbsp;t.intern()</code> is <code>true</code>
     * if and only if <code>s.equals(t)</code> is <code>true</code>.
     * <p>
     * All literal strings and string-valued constant expressions are
     * interned. String literals are defined in &sect;3.10.5 of the
     * <a href="http://java.sun.com/docs/books/jls/html/">Java Language
     * Specification</a>
     *
     * @return  a string that has the same contents as this string, but is
     *          guaranteed to be from a pool of unique strings.
     */
    public native String intern();
```

从上面代码块中得知，String::intern 方法是一个 native 方法，其底层实现是通过 c/cpp 实现的。当调用 intern 方法时，如果池已经包含一个等于此 String 对象的字符串（用 equals (Object) 方法确定），则返回池中的字符串。否则，将此 String 对象添加到池中，并返回此 String 对象的引用。 它遵循以下规则：对于任意两个字符串 s 和 t，当且仅当 s.equals (t) 为 true 时，s.intern () == t.intern () 才为 true。然而在 JDK6 与 JDK7 + 由于虚拟机的调整，`intern` 返回的对象有所不同。

> 仅讨论 hotspot 的实现

下面代码在 JDK6 与 JDK8 中会有不同的结果。

> "java" 在 `java.io.PrintStream.Version` 中出现过，在虚拟机启动时就加载到这个类。

```java
/**
 * @author donghaibin
 * @date 2020/1/6
 */
public class InternTest {

    public static void main(String[] args) {
        StringBuilder builder = new StringBuilder();
        String str1 = builder.append("dhbin").append(".cn").toString();
        StringBuilder builder1 = new StringBuilder();
        String str2 = builder1.append("ja").append("va").toString();
        System.out.println(str1 == str1.intern());
        System.out.println(str2 == str2.intern());
    }
    
}
```



## JDK6

```
false
false
```

JDK6 还保留着永久代（对 JAVA 虚拟机规范中的方法区的实现），字符串常量池在永久代中。当执行 `intern` 方法时，首先判断永久代中字符串常量池中是否存在该字符串，如果存在返回字符串常量池中的字符串对象实例，否则复制首次出现的实例到字符串常量池，并返回。返回的字符串在永久代中，StringBuilder 创建的对象在堆中，所以是两个不同的对象。



## JDK8

```
true
false
```

JDK7 以后逐渐废除了永久代，把原本放在永久代的**字符串常量池**、**静态变量**等移至**堆**中，到了 JDK8 就完全废除了永久代，把 JDK7 中永久代还剩余的内容（主要是类信息）全部移到了**元空间**中。

```java
System.out.println(str1 == str1.intern()); //true
```

上面代码之所以为 true，是因为字符串常量池就在堆中，首次出现就记录一下引用。因此 `intern` 返回的对象与 StringBuilder 创建出来的是同一个引用。