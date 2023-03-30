---
date: 2021-01-05 15:54:13
category:
  - Java
tag:
  - Jvm
  - 源码
---

# Thread实现原理

## 什么是线程

线程在Linux系统中也称做轻量级进程（LWP），是调度资源的最小单元，不同的线程间共享进程[1]中的数据，



[1] 进程是分配资源的最小单元。

## Java线程

java线程中的native方法具体实现在 `jvm.cpp` 中，在 `jdk/src/java.base/share/native/libjava/Thread.c` 中是这样定义的。

```c
static JNINativeMethod methods[] = {
    {"start0",           "()V",        (void *)&JVM_StartThread},
    {"stop0",            "(" OBJ ")V", (void *)&JVM_StopThread},
    {"isAlive",          "()Z",        (void *)&JVM_IsThreadAlive},
    {"suspend0",         "()V",        (void *)&JVM_SuspendThread},
    {"resume0",          "()V",        (void *)&JVM_ResumeThread},
    {"setPriority0",     "(I)V",       (void *)&JVM_SetThreadPriority},
    {"yield",            "()V",        (void *)&JVM_Yield},
    {"sleep",            "(J)V",       (void *)&JVM_Sleep},
    {"currentThread",    "()" THD,     (void *)&JVM_CurrentThread},
    {"countStackFrames", "()I",        (void *)&JVM_CountStackFrames},
    {"interrupt0",       "()V",        (void *)&JVM_Interrupt},
    {"isInterrupted",    "(Z)Z",       (void *)&JVM_IsInterrupted},
    {"holdsLock",        "(" OBJ ")Z", (void *)&JVM_HoldsLock},
    {"getThreads",        "()[" THD,   (void *)&JVM_GetAllThreads},
    {"dumpThreads",      "([" THD ")[[" STE, (void *)&JVM_DumpThreads},
    {"setNativeName",    "(" STR ")V", (void *)&JVM_SetNativeThreadName},
};
```

### start实现

| 类/函数                  | 作用     | 位置                                                         |
| ------------------------ | -------- | ------------------------------------------------------------ |
| MutexLocker::MutexLocker | mutex锁  | /jdk-jdk-9-181/hotspot/src/share/vm/runtime/mutexLocker.hpp:163 |
| JNIHandles               |          | /jdk-jdk-9-181/hotspot/src/share/vm/runtime/jniHandles.hpp:269 |
| os::start_thread         | 开启线程 | jdk-jdk-9-181/hotspot/src/share/vm/runtime/os.cpp:774        |

断点位置

```plain
JVM_StartThread(JNIEnv*, jobject) at /home/dev/jdk/jdk-jdk-9-181/hotspot/src/share/vm/prims/jvm.cpp:2843
os::create_thread(Thread*, os::ThreadType, unsigned long) at /home/dev/jdk/jdk-jdk-9-181/hotspot/src/os/linux/vm/os_linux.cpp:698
JVM_StartThread(JNIEnv*, jobject) at /home/dev/jdk/jdk-jdk-9-181/hotspot/src/share/vm/prims/jvm.cpp:2777
```

## 生命周期

![生命周期](https://cdn.dhbin.cn/202303301044086.png)