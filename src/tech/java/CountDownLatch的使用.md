---
date: 2019-07-11 23:44:00
category:
  - Java
tag:
  - 线程
  - 锁

---

# CountDownLatch的使用

>  实现一个容器，提供get和size两个方法，些两个线程，线程1添加10个元素到容器中，线程2实现监控元素的个数，当个数大于5时，线程2给出提示并结束

接着这个问题，上一篇笔记的实现方法是用synchronized、wait和notify实现的，这种实现方式比较重，当不涉及同步，只是涉及线程通信的时候，那有没有更好的实现方法呢？（这不是废话吗）

# CountDownLatch

CountDownLatch是一个非常实用的多线程控制的工具。常用的几个方法：

```java
//实例化一个倒数器，count是指定计数个数
CountDownLatch(int count)
// 当count不等于0时，一直阻塞
void await()
// count - 1  操作
void countDown()
```



接下来用CountDownLatch来完成上面的题目

## 代码

```java
public class Container2 {

    /**
     * 容器，volatile保证可见性
     */
    volatile List<Object> list = new ArrayList<>();

    /**
     * 添加元素方法
     *
     * @param object obj
     */
    public void add(Object object) {
        list.add(object);
    }

    /**
     * 返回容器大小
     *
     * @return 容器大小
     */
    public int size() {
        return list.size();
    }


    private static CountDownLatch countDownLatch = new CountDownLatch(1);

    public static void main(String[] args) {
        Container2 container1 = new Container2();

        new Thread(() -> {
            if (container1.size() != 5) {
                try {
                    countDownLatch.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("容器到达5个，结束");
            }
        }).start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                System.out.println(Thread.currentThread().getName() + "---" + i);
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                container1.add(new Object());
                if (container1.size() == 5) {
                    countDownLatch.countDown();
                }
            }
        }).start();
    }
}
```