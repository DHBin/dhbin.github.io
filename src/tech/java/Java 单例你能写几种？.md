---
date: 2019-05-29 20:40:00
category:
  - Java
---

# Java 单例你能写几种？

原文链接：[Java 单例你能写几种？](https://mp.weixin.qq.com/s/BIKRJy6-Z8H5jFyweB9QtA)

- 一. 什么是单例模式
- 二. 单例模式的特点
- 三. 单例模式VS静态类
- 四. 单例模式的实现

------

# 一. 什么是单例模式

因进程需要，有时我们只需要某个类同时保留一个对象，不希望有更多对象，此时，我们则应考虑单例模式的设计。

# 二. 单例模式的特点

1. 单例模式只能有一个实例。
2. 单例类必须创建自己的唯一实例。
3. 单例类必须向其他对象提供这一实例。

# 三. 单例模式VS静态类

在知道了什么是单例模式后，我想你一定会想到静态类，“既然只使用一个对象，为何不干脆使用静态类？”，这里我会将单例模式和静态类进行一个比较。

1. 单例可以继承和被继承，方法可以被override，而静态方法不可以。
2. 静态方法中产生的对象会在执行后被释放，进而被GC清理，不会一直存在于内存中。
3. 静态类会在第一次运行时初始化，单例模式可以有其他的选择，即可以延迟加载。
4. 基于2， 3条，由于单例对象往往存在于DAO层（例如sessionFactory），如果反复的初始化和释放，则会占用很多资源，而使用单例模式将其常驻于内存可以更加节约资源。
5. 静态方法有更高的访问效率。
6. 单例模式很容易被测试。

几个关于静态类的误解：

误解一：静态方法常驻内存而实例方法不是。

实际上，特殊编写的实例方法可以常驻内存，而静态方法需要不断初始化和释放。

误解二：静态方法在堆(heap)上，实例方法在栈(stack)上。

实际上，都是加载到特殊的不可写的代码内存区域中。

静态类和单例模式情景的选择：

情景一：不需要维持任何状态，仅仅用于全局访问，此时更适合使用静态类。

情景二：需要维持一些特定的状态，此时更适合使用单例模式。

# 四. 单例模式的实现

## 1.懒汉模式（**线程不安全**）

```java
public class SingletonDemo {
    private static SingletonDemo instance;
    private SingletonDemo(){

    }
    public static SingletonDemo getInstance(){
        if(instance==null){
            instance=new SingletonDemo();
        }
        return instance;
    }
}
```

如上，通过提供一个静态的对象instance，利用private权限的构造方法和getInstance()方法来给予访问者一个单例。

缺点是，没有考虑到线程安全，可能存在多个访问者同时访问，并同时构造了多个对象的问题。之所以叫做懒汉模式，主要是因为此种方法可以非常明显的lazy loading。

针对懒汉模式线程不安全的问题，我们自然想到了，在getInstance()方法前加锁，于是就有了第二种实现。

## 1.线程安全的懒汉模式（**线程安全**）

```java
public class SingletonDemo {
    private static SingletonDemo instance;
    private SingletonDemo(){

    }
    public static synchronized SingletonDemo getInstance(){
        if(instance==null){
            instance=new SingletonDemo();
        }
        return instance;
    }
}
```

然而并发其实是一种特殊情况，大多时候这个锁占用的额外资源都浪费了，这种打补丁方式写出来的结构效率很低。

## 2.饿汉模式（**线程安全**）

```java
public class SingletonDemo {
    private static SingletonDemo instance=new SingletonDemo();
    private SingletonDemo(){

    }
    public static SingletonDemo getInstance(){
        return instance;
    }
}
```

直接在运行这个类的时候进行一次loading，之后直接访问。显然，这种方法没有起到lazy loading的效果，考虑到前面提到的和静态类的对比，这种方法只比静态类多了一个内存常驻而已。

## 3.静态类内部加载（**线程安全**）

```java
public class SingletonDemo {
    private static class SingletonHolder{
        private static SingletonDemo instance=new SingletonDemo();
    }
    private SingletonDemo(){
        System.out.println("Singleton has loaded");
    }
    public static SingletonDemo getInstance(){
        return SingletonHolder.instance;
    }
}
```

使用内部类的好处是，静态内部类不会在单例加载时就加载，而是在调用getInstance()方法时才进行加载，达到了类似懒汉模式的效果，而这种方法又是线程安全的。

## 4.枚举方法（**线程安全**）

```java
enum SingletonDemo{
    INSTANCE;
    public void otherMethods(){
        System.out.println("Something");
    }
}
```

Effective Java作者Josh Bloch 提倡的方式，在我看来简直是来自神的写法。解决了以下三个问题：

(1)自由串行化。

(2)保证只有一个实例。

(3)线程安全。

如果我们想调用它的方法时，仅需要以下操作：

```java
public class Hello {
    public static void main(String[] args){
        SingletonDemo.INSTANCE.otherMethods();
    }
}
```

这种充满美感的代码真的已经终结了其他一切实现方法了。

Josh Bloch 对这个方法的评价：
这种写法在功能上与共有域方法相近，但是它更简洁，无偿地提供了串行化机制，绝对防止对此实例化，即使是在面对复杂的串行化或者反射攻击的时候。虽然这中方法还没有广泛采用，但是单元素的枚举类型已经成为实现Singleton的最佳方法。
枚举单例这种方法问世以来，许多分析文章都称它是实现单例的最完美方法——写法超级简单，而且又能解决大部分的问题。
不过我个人认为这种方法虽然很优秀，但是它仍然不是完美的——比如，在需要继承的场景，它就不适用了。

## 5.双重校验锁法（**通常线程安全，低概率不安全**）

```java
public class SingletonDemo {
    private static SingletonDemo instance;
    private SingletonDemo(){
        System.out.println("Singleton has loaded");
    }
    public static SingletonDemo getInstance(){
        if(instance==null){
            synchronized (SingletonDemo.class){
                if(instance==null){
                    instance=new SingletonDemo();
                }
            }
        }
        return instance;
    }
}
```

接下来我解释一下在并发时，双重校验锁法会有怎样的情景：

STEP 1. 线程A访问getInstance()方法，因为单例还没有实例化，所以进入了锁定块。

STEP 2. 线程B访问getInstance()方法，因为单例还没有实例化，得以访问接下来代码块，而接下来代码块已经被线程1锁定。

STEP 3. 线程A进入下一判断，因为单例还没有实例化，所以进行单例实例化，成功实例化后退出代码块，解除锁定。

STEP 4. 线程B进入接下来代码块，锁定线程，进入下一判断，因为已经实例化，退出代码块，解除锁定。

STEP 5. 线程A获取到了单例实例并返回，线程B没有获取到单例并返回还没有初始化完成对象，如果使用可能有问题。

理论上双重校验锁法是线程安全的，并且，这种方法实现了lazyloading。

## 6.第七种终极版 （volatile）

对于6中Double-Check这种可能出现的问题（当然这种概率已经非常小了，但毕竟还是有的嘛~），解决方案是：只需要给instance的声明加上volatile关键字即可，volatile版本如下：

```java
public class Singleton{
    private volatile static Singleton singleton = null;
    private Singleton()  {    }
    public static Singleton getInstance()   {
        if (singleton== null)  {
            synchronized (Singleton.class) {
                if (singleton== null)  {
                    singleton= new Singleton();
                }
            }
        }
        return singleton;
    }
}
```

volatile关键字的一个作用是禁止指令重排，把instance声明为volatile之后，对它的写操作就会有一个内存屏障（什么是内存屏障？），这样，在它的赋值完成之前，就不用会调用读操作。
注意：volatile阻止的不singleton = newSingleton()这句话内部[1-2-3]的指令重排，而是保证了在一个写操作（[1-2-3]）完成之前，不会调用读操作（if (instance == null)）。
也就彻底防止了6中的问题发生。

## 7.使用ThreadLocal实现单例模式（**线程安全**）

```java
public class Singleton {
    private static final ThreadLocal<Singleton> tlSingleton =
            new ThreadLocal<Singleton>() {
                @Override
                protected Singleton initialValue() {
                    return new Singleton();
                }
            };
    /**
     * Get the focus finder for this thread.
     */
    public static Singleton getInstance() {
        return tlSingleton.get();
    }
    // enforce thread local access
    private Singleton() {}
}
```

ThreadLocal会为每一个线程提供一个独立的变量副本，从而隔离了多个线程对数据的访问冲突。对于多线程资源共享的问题，同步机制采用了“以时间换空间”的方式，而ThreadLocal采用了“以空间换时间”的方式。前者仅提供一份变量，让不同的线程排队访问，而后者为每一个线程都提供了一份变量，因此可以同时访问而互不影响。

## 8.使用CAS锁实现（**线程安全**）

```java
/**
 * 更加优美的Singleton, 线程安全的
 */
public class Singleton {
 /** 利用AtomicReference */
 private static final AtomicReference<Singleton> INSTANCE = new AtomicReference<Singleton>();
 /**
  * 私有化
  */
 private Singleton(){
 }
 /**
  * 用CAS确保线程安全
  */
 public static final Singleton getInstance(){
  for (;;) {
   Singleton current = INSTANCE.get();
            if (current != null) {
                return current;
            }
            current = new Singleton();
            if (INSTANCE.compareAndSet(null, current)) {
                return current;
            }
        }
 }

 public static void main(String[] args) {
  Singleton singleton1 = Singleton.getInstance();
  Singleton singleton2 = Singleton.getInstance();
     System.out.println(singleton1 == singleton2);
 }
}
```

## 9.对象池实现（线程安全）

> 这种在原文中没有，笔者自己加的

用一个Map容器把对象存起来。实现引用hutool中的代码

```java
/**
 * 单例类<br>
 * 提供单例对象的统一管理，当调用get方法时，如果对象池中存在此对象，返回此对象，否则创建新对象返回<br>
 * 注意：单例针对的是类和对象，因此get方法第一次调用时创建的对象始终唯一，也就是说就算参数变更，返回的依旧是第一次创建的对象
 * 
 * @author loolly
 *
 */
public final class Singleton {
	private static Map<Class<?>, Object> pool = new ConcurrentHashMap<>();

	private Singleton() {
	}

	/**
	 * 获得指定类的单例对象<br>
	 * 对象存在于池中返回，否则创建，每次调用此方法获得的对象为同一个对象<br>
	 * 注意：单例针对的是类和对象，因此get方法第一次调用时创建的对象始终唯一，也就是说就算参数变更，返回的依旧是第一次创建的对象
	 * 
	 * @param <T> 单例对象类型
	 * @param clazz 类
	 * @param params 构造方法参数
	 * @return 单例对象
	 */
	@SuppressWarnings("unchecked")
	public static <T> T get(Class<T> clazz, Object... params) {
		T obj = (T) pool.get(clazz);

		if (null == obj) {
			synchronized (Singleton.class) {
				obj = (T) pool.get(clazz);
				if (null == obj) {
					obj = ReflectUtil.newInstance(clazz, params);
					pool.put(clazz, obj);
				}
			}
		}

		return obj;
	}

	/**
	 * 获得指定类的单例对象<br>
	 * 对象存在于池中返回，否则创建，每次调用此方法获得的对象为同一个对象<br>
	 * 注意：单例针对的是类和对象，因此get方法第一次调用时创建的对象始终唯一，也就是说就算参数变更，返回的依旧是第一次创建的对象
	 * 
	 * @param <T> 单例对象类型
	 * @param className 类名
	 * @param params 构造参数
	 * @return 单例对象
	 */
	public static <T> T get(String className, Object... params) {
		final Class<T> clazz = ClassUtil.loadClass(className);
		return get(clazz, params);
	}

	/**
	 * 将已有对象放入单例中，其Class做为键
	 * 
	 * @param obj 对象
	 * @since 4.0.7
	 */
	public static void put(Object obj) {
		pool.put(obj.getClass(), obj);
	}

	/**
	 * 移除指定Singleton对象
	 * 
	 * @param clazz 类
	 */
	public static void remove(Class<?> clazz) {
		pool.remove(clazz);
	}

	/**
	 * 清除所有Singleton对象
	 */
	public static void destroy() {
		pool.clear();
	}
}

```

[链接](https://www.hutool.cn/docs/#/core/%E8%AF%AD%E8%A8%80%E7%89%B9%E6%80%A7/%E5%8D%95%E4%BE%8B%E5%B7%A5%E5%85%B7-Singleton)

