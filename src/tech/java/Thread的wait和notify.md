---
date: 2019-07-11 00:42:00
---

# Thread的wait和notify

当不同线程之间需要通信时，就要使用到wait和notify这两个方法

## wait的作用

让线程进入阻塞状态，并且会释放线程占有的锁，并交出CPU执行权限。

## nofity

 唤醒等待队列中的某个线程，如果时多个线程同时等待并不能指定唤醒某个线程，这有CPU来决定

## notifyAll

这个方法则是唤醒等待队列中的所有线程

# 实践

> 实现一个容器，提供get和size两个方法，些两个线程，线程1添加10个元素到容器中，线程2实现监控元素的个数，当个数大于5时，线程2给出提示并结束

## 代码

```java
package cn.dhbin;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 实现一个容器，提供get和size两个方法，些两个线程，线程1添加10个元素到容器中，
 * 线程2实现监控元素的个数，当个数大于5时，线程2给出提示并结束
 * 使用Thread的wait和notify实现
 *
 * @author dhb
 */
public class Container1 {

    /**
     * 容器
     */
    private volatile List<Object> list = new ArrayList<>();


    public void add(Object obj) {
        list.add(obj);
    }

    public int size() {
        return list.size();
    }


    public static void main(String[] args) throws InterruptedException {
        Container1 c = new Container1();
        Object lock = new Object();

        /*
        * 监控大小的线程必须先执行，因为如果添加元素线程先执行的话，添加元素线程
        * 取到了锁并不释放，监控大小的线程就无法加入while块
        * */
        new Thread(() -> {
            synchronized (lock) {
                while (c.size() != 5) {
                    try {
                        lock.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    System.out.println("容器到达5个，结束");
                    // 唤醒添加元素线程
                    lock.notify();
                }
            }
        }).start();

        TimeUnit.SECONDS.sleep(1);

        new Thread(() -> {
            synchronized (lock) {
                for (int i = 0; i < 10; i++) {
                    c.add(new Object());
                    System.out.println(Thread.currentThread().getName() + "---" + i);
                    try {
                        TimeUnit.SECONDS.sleep(1);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    if (c.size() == 5) {
                        // 通知监控大小线程，notify并不会释放锁
                        lock.notify();
                        try {
                            // wait让出cpu，让监控大小线程执行
                            lock.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        }).start();

    }
}

```



# 资料

[Java并发编程（一）Thread详解](https://juejin.im/post/5bbc9311f265da0ac6696d06)