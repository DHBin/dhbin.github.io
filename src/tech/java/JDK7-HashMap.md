---
date: 2019-05-09 18:00:00
category:
  - Java
tag:
  - 算法
---

# JDK7-HashMap

# 前言

现在一般都JDK8了，为什么还要说JDK7呢。因为JDK7和JDK8的hashmap实现不一样，JDK7是用数组+链表实现的，而JDK8是红黑树。学习都是个慢慢渐进的过程。


# 实现

时间复杂度：

|      | 读取 | 插入 | 删除 |
| ---- | ---- | ---- | ---- |
| 数组 | O(1) | O(n) | O(n) |
| 链表 | O(n) | O(1) | O(1) |

上面提到JDK7是用数组+链表实现的，为什么这样做呢？我们知道数组读取速度快，插入慢，而链表读取慢，插入快，hashmap就是充分利用了数组读取快和链表插入快的特点。数组存着元素的下标，元素插入链表中。那么下标怎么生成呢，hashmap嘛，那肯定是和hashcode有关系，我们生成hashcode看看是啥样的。

```java
public class Main {

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            String key = "code" + i;
            System.out.println(key.hashCode());
        }
    }
}
```

输出：

```
94834659
94834660
94834661
94834662
94834663
94834664
94834665
94834666
94834667
94834668
```

看到hashcode的值非常大，如果用于当下标的话，数组就要非常大才能把这些元素给存起来，性能也是大打折扣，那有什么办法缩小一点呢，我想到的一种是取余（JDK并不是这么干）

```java
public class Main {

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            String key = "code" + i;
            int hashCode = key.hashCode();
            int index = hashCode % 8;
            System.out.println(index);
        }
    }
}
```

输出：

```
3
4
5
6
7
0
1
2
3
4
```

下标就控制在8的范围内了，但是又出现了另一个问题：hash冲突了，存在了两个3，两个4。这种情况怎么处理呢？下标一直的都插入到一个链表中，新元素放在头部。（为什么插入头部？因为链表结构插入数据在头部是最快的，只需将指针指向旧的链表即可）

插入后数据结构如下图：

![](http://lc-dnchthtq.cn-n1.lcfile.com/fb8c6b10d48a4b5634cc/%E6%89%8B%E5%86%99JDK7HashMap.png)

# 代码

```java
/**
 * 手写简单的hashMap（1.7版）
 *
 * @author DHB
 */
public class MyHashMap<K, V> {

    /**
     * 元素表
     */
    private Entry<K, V>[] table;
    /**
     * 容量
     */
    private static final Integer CAPACITY = 8;
    /**
     * 大小
     */
    private int size = 0;

    public MyHashMap() {
        this.table = new Entry[CAPACITY];
    }

    /**
     * 获取大小
     *
     * @return 大小
     */
    public int size() {
        return this.size;
    }


    /**
     * 根据key获取value
     *
     * @param key jey
     * @return 元素
     */
    public V get(K key) {
        int index = obtainIndex(key);
        for (Entry<K, V> entry = table[index]; entry != null; entry = entry.next) {
            if (entry.k.equals(key)) {
                return entry.v;
            }
        }
        return null;
    }

    /**
     * 插入，当存在这个key的时候会替换，并且返回
     *
     * @param key   key
     * @param value value
     * @return 旧的元素
     */
    public V put(K key, V value) {
        int index = obtainIndex(key);
        for (Entry<K, V> entry = table[index]; entry != null; entry = entry.next) {
            if (entry.k.equals(key)) {
                V oldValue = entry.v;
                entry.v = value;
                return oldValue;
            }
        }
        addEntry(key, value, index);
        return null;
    }

    /**
     * 添加Entry
     *
     * @param key   key
     * @param value value
     * @param index 下标位置
     */
    private void addEntry(K key, V value, int index) {
        table[index] = new Entry(key, value, table[index]);
        size++;
    }

    /**
     * 通过key获取插入的位置
     *
     * @param key key
     * @return 获取位置
     */
    private int obtainIndex(K key) {
        int hashCode = key.hashCode();
        return hashCode % 8;
    }

    /**
     * 链表数据结构
     *
     * @param <K> key
     * @param <V> value
     */
    class Entry<K, V> {

        public Entry(K k, V v, Entry<K, V> next) {
            this.k = k;
            this.v = v;
            this.next = next;
        }

        private K k;
        private V v;
        /**
         * 指向下一个元素
         */
        private Entry<K, V> next;
    }

}
```

# 总结

上面的代码很粗糙，但能大概了解了HashMap的工作原理。有很多问题没有解决，下一个笔记再说，先抛出问题。

- HashMap的键值可以为Null吗？原理是什么？
- HashMap扩容机制是怎么样的，JDK7和JDK8有什么不同？
- JDK8中的HashMap有哪些改动？
- JDK8中为什么要使用红黑树？
- 为什么重写对象的Equal方法时，要重写HashCode方法，跟HashMap有什么关系吗？
- HashMap是线程安全的吗？遇到ConcurrentModificationException异常吗？为什么？出现怎么解决？
- 在使用HashMap的过程中我们应该注意些什么问题？