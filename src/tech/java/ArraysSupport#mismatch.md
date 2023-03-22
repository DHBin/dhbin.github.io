---
date: 2022-07-15 10:21:00
category:
- Java
tag:
  - 算法
---

# ArraysSupport#mismatch



## 前言

在研究elasticsearch排序插件的时候，自研的排序算法产生的数值远远大于64位数字的最大值，所以只能选择字符串排序。

## 字符串数字排序

字符串是按ASCII编码排序的，对于数字排序是存在问题的。比如有一下这些数字字符串：1、2、4、12、3，排序的结果就是1、12、2、3、4。这不符合数字排序的预期，这也正是原先在做solr的时候没有选择字符串排序的原因。在查询资料的时候，找到这个贴子 https://discuss.elastic.co/t/sorting-a-string-field-numerically/9489/7 其中提供了一种方法：把数字的位数追加到原数字的前面，追加的数字需要有占位符，比如已知最长的位数不超过100，追加的数字就是有两位，01、02、12这样。为什么需要这样呢？因为在对比字符串的原理是从0下标开始取出字符做对比，先取出位数做对比就能解决数字字符串排序的问题。

## 排序优化

elasticsearch把字符串类型统一存储为byte数组，所以字符串的对比实际上就是byte数组的对比。到这里，我产生了一个疑问，es的底层是怎么对比byte数组的？这关系到字符串排序的性能。脑子里的答案就是一个for循环遍历两个数组一一对比，最后发现在JDK8的确是这么实现的，但是es最低版本要求已经是jdk11，jdk9的时候就对数组的对比进行了优化。源码如下：

```java
    public static int compare(byte[] a, byte[] b) {
        if (a == b)
            return 0;
        if (a == null || b == null)
            return a == null ? -1 : 1;

        // 关键的代码在这里
        int i = ArraysSupport.mismatch(a, b,
                                       Math.min(a.length, b.length));
        if (i >= 0) {
            return Byte.compare(a[i], b[i]);
        }

        return a.length - b.length;
    }
    public static int mismatch(byte[] a,
                               byte[] b,
                               int length) {
        // ISSUE: defer to index receiving methods if performance is good
        // assert length <= a.length
        // assert length <= b.length

        int i = 0;
        // 因为long类型是8byte
        if (length > 7) {
            if (a[0] != b[0])
                return 0;
            // 关键代码在这
            i = vectorizedMismatch(
                    a, Unsafe.ARRAY_BYTE_BASE_OFFSET,
                    b, Unsafe.ARRAY_BYTE_BASE_OFFSET,
                    length, LOG2_ARRAY_BYTE_INDEX_SCALE);
            if (i >= 0)
                return i;
            // Align to tail
            i = length - ~i;
//            assert i >= 0 && i <= 7;
        }
        // Tail < 8 bytes
        for (; i < length; i++) {
            if (a[i] != b[i])
                return i;
        }
        return -1;
    }
    public static int vectorizedMismatch(Object a, long aOffset,
                                         Object b, long bOffset,
                                         int length,
                                         int log2ArrayIndexScale) {
        // assert a.getClass().isArray();
        // assert b.getClass().isArray();
        // assert 0 <= length <= sizeOf(a)
        // assert 0 <= length <= sizeOf(b)
        // assert 0 <= log2ArrayIndexScale <= 3

        int log2ValuesPerWidth = LOG2_ARRAY_LONG_INDEX_SCALE - log2ArrayIndexScale;
        int wi = 0;
        for (; wi < length >> log2ValuesPerWidth; wi++) {
            long bi = ((long) wi) << LOG2_ARRAY_LONG_INDEX_SCALE;
            long av = U.getLongUnaligned(a, aOffset + bi);
            long bv = U.getLongUnaligned(b, bOffset + bi);
            if (av != bv) {
                long x = av ^ bv;
                int o = BIG_ENDIAN
                        ? Long.numberOfLeadingZeros(x) >> (LOG2_BYTE_BIT_SIZE + log2ArrayIndexScale)
                        : Long.numberOfTrailingZeros(x) >> (LOG2_BYTE_BIT_SIZE + log2ArrayIndexScale);
                return (wi << log2ValuesPerWidth) + o;
            }
        }
        // 省略其它代码...
    }
```

### 原理

分两种情况：

情况一：数组的长度小于8，直接for循环对比

情况二：数组长度大于等于8

我们知道数组在内存中是以一块连续的内存存储的，这样就可以把8bytes数据转成long类型来对比。假设一个数组的长度是24bytes，所以jdk8的方法时间复杂度是O(24)，jdk9的方法是O(24 / 8)  = O(3)。减少了循环的次数。



那问题就来了，jdk是如何把byte[]转long类型的，在常规的开发没有这个操作呀，如果是for循环8次再转long，这复杂度也没有减低呀，确实，jdk采用了更骚的方法。Unsafe类，这个类如其名，是不安全的，能够像C/C++语言一样操作内存，上面使用到的关键API是`Unsafe#getLongUnaligned(java.lang.Object, long)`，参数1传入数组，参数2传入偏移量

```java
/**
 * @author dhb
 */
public class LongOpt {

    public static void main(String[] args) {
        Unsafe unsafe = UnsafeUtil.UNSAFE;

        byte[] bytes = "0200000001000000".getBytes(StandardCharsets.UTF_8);
        // Unsafe.ARRAY_BYTE_BASE_OFFSET是数组头部数据大小，把这个加上就是数组元素的初始位置
        long l1 = unsafe.getLong(bytes, Unsafe.ARRAY_BYTE_BASE_OFFSET);
        // +8的原因是long的长度是8个字节
        long l2 = unsafe.getLong(bytes, Unsafe.ARRAY_BYTE_BASE_OFFSET + 8);
        System.out.println(l1); // 3472328296227680816
        System.out.println(l2); // 3472328296227680560
    }


}
```

取数的问题解决了，还有另一个问题：怎么定位到是那一个下标元素不同的？

02000000

01000000

上面两组字符串，用肉眼看就知道是第二位不同，但当转成了long类型，是怎么找出是第二位的呢？答案是两个数异或运算之后，大端序从左往右，小端序从右往左（内存存储大小端不清楚的可以百度了解下），零的个数就是下标位置，比如`02000000 ^ 01000000`的结果是`01000000`这是大端存储顺序，下标就是1，就能快速定位到不同的元素取出对比。

## 总结

- 过长的数字除了可以使用BigInteger以外，还可以采用追加位数的方式
- 对比数组可以取更多的元素对比，提前结束
- Unsafe类的运用，这个还有很多更强大的功能，在开发中如果非必要不要轻易使用。