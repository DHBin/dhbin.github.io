---
date: 2021-01-06 10:18:00
category:
  - Java
tag:
  - Jvm
  - 源码
---

# openjdk是怎么启动jvm的

java.c:1458



`InitializeJVM`函数初始化jvm虚拟机，



`JavaMain`以新的线程启动jvm

![jvm](https://cdn.dhbin.cn/202303301038617.svg+xml)

.h标识不同的系统实现方式不同



- java.c:LoadJavaVM 加载libjvm.so动态链接库
- java.c:ParseArguments 解析参数，找出mode(运行模式：main class、jar file)、what（主类）等等
- java.h:JVMInit 主要执行`ContinueInNewThread`
- java.c:ContinueInNewThread 创建java main方法的参数，并执行`ContinueInNewThread0`
- java.h:ContinueInNewThread0 新建一个线程执行`JavaMain`函数，并阻塞（调用`pthread_join`）
- java.c:JavaMain

- - 调用`InitializeJVM`创建jvm
  - Main找出java主类（这里不一定是main方法，javaFX就没有main方法）
  - 构建主类的参数
  - 执行main方法



```c
JavaVM *vm = 0;
JNIEnv *env = 0;
//&ifn 是 InvocationFunctions
// 创建jvm虚拟机
typedef jint (JNICALL *CreateJavaVM_t)(JavaVM **pvm, void **env, void *args);
typedef jint (JNICALL *GetDefaultJavaVMInitArgs_t)(void *args);
typedef jint (JNICALL *GetCreatedJavaVMs_t)(JavaVM **vmBuf, jsize bufLen, jsize *nVMs);
args = {version = 65538, nOptions = 2, option
    0s = 0x55555576eaf0, ignoreUnrecognized = 0 '\000'}
InitializeJVM(&vm, &env, &ifn);
//-Dsun.java.launcher=SUN_STANDARD
//-Djava.class.path=.
//-Dsun.java.command=spring-boot-demo-0.0.1-SNAPSHOT.jar
//-Dsun.java.launcher=SUN_STANDARD
```



# Jvm启动步骤



`java.c:JLI_Launch`是程序的入口，执行下面的逻辑



```c
// 加载虚拟机动态链接库，即libjvm.so
LoadJavaVM(jvmpath, &ifn);
// 新建一个线程运行JavaMain
int JVMInit(InvocationFunctions* ifn, jlong threadStackSize, int argc, char **argv,int mode, char *what, int ret);
// 创建虚拟机InitializeJVM -> 获取Main类LoadMainClass -> 获取java应用的入参CreateApplicationArgs
int JNICALL JavaMain(void * _args);
```



## 如何获取Main方法



```c
// java.c
static jclass LoadMainClass(JNIEnv *env, int mode, char *name);
// 查找sun/launcher/LauncherHelper类
// GetLauncherHelperClass -> GetLauncherHelperClass -> FindBootStrapClass -> findBootClass
```



FindBootStrapClass实现原理



```c
// findBootClass函数签名
typedef jclass (JNICALL FindClassFromBootLoader_t(JNIEnv *env, const char *name));
```



1. dlsym(RTLD_DEFAULT, "JVM_FindClassFromBootLoader")获取到findBootClass函数
2. 通过findBootClass(JNIEnv *env, const char* classname)查询返回



获取main方法的步骤



1. 获取到sun/launcher/LauncherHelper类
2. 获取到LauncherHelper类中的checkAndLoadMain(ZILjava/lang/String;)Ljava/lang/Class;方法
3. 



## 模拟openjdk创建jvm虚拟机



```c
#include <dlfcn.h>
#include "jni.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>

// libjvm.so的路径
const char* jvmpath = "/home/dev/jdk/jdk8u275-b01/jre/lib/amd64/server/libjvm.so";

// 创建jvm虚拟机，libjvm.so中的函数，位于jni.h中
typedef jint (JNICALL *CreateJavaVM_t)(JavaVM **pvm, void **env, void *args);

CreateJavaVM_t createJavaVM;

// 加载libjvm.so动态链接库
void LoadJavaVM(const char*);
// 初始化jvm
void InitializeJVM(JavaVM **, JNIEnv **, JavaVMInitArgs *);
// 运行hello world
void* JavaMain(void*);

int main() {
  // 1、加载jvm链接库
  LoadJavaVM(jvmpath);
  // 2、解析参数 -- 这一步忽略不实现


  // 创建新的线程执行JavaMain，包含初始化jvm和运行main方法
  pthread_t tid;
  pthread_create(&tid, NULL, JavaMain, NULL);
  pthread_join(tid, NULL);
  return 0;
}


void LoadJavaVM(const char *jvmpath) {
  if (createJavaVM != NULL) {
    return;
  }
  void *libjvm;
  libjvm = dlopen(jvmpath, RTLD_NOW + RTLD_GLOBAL);
  if (libjvm != NULL) {
    printf("加载jvm动态链接库成功。\n");
  } else {
    printf("加载jvm动态链接库失败。\n");
    exit(1);
  }
  createJavaVM = (CreateJavaVM_t*)dlsym(libjvm, "JNI_CreateJavaVM");
  if (createJavaVM != NULL) {
    printf("获取createJavaVM函数成功\n");
  } else {
    printf("获取createJavaVM函数失败\n");
    exit(1);
  }
}

void InitializeJVM(JavaVM **pvm, JNIEnv **penv, JavaVMInitArgs *args) {
  jint ret = createJavaVM(pvm, (void**)penv, args);
  if (ret == 1) {
    printf("创建jvm虚拟机失败\n");
    exit(1);
  } else {
    printf("创建jvm虚拟机成功\n");
  }
}

void* JavaMain(void *_args) {
  // 3、初始化JVM
  JavaVM *vm = 0;
  JNIEnv *env = 0;
  JavaVMOption *options;
  options = (JavaVMOption*)malloc(2 * sizeof(JavaVMOption));
  options[0].optionString = "-Djava.class.path=.";
  options[1].optionString = "-Dsun.java.launcher=SUN_STANDARD";
  //options[2].optionString = "-Dsun.java.command=spring-boot-demo-0.0.1-SNAPSHOT.jar";
  //options[3].optionString = "-Dsun.java.launcher.pid=";
  JavaVMInitArgs args;
  memset(&args, 0, sizeof(args));
  args.version  = JNI_VERSION_1_2;
  args.nOptions = 2;
  args.options  = options;
  args.ignoreUnrecognized = JNI_FALSE;
  InitializeJVM(&vm, &env, &args);

  // 4、运行main 方法

  jclass mainClass = (*env)->FindClass(env, "Main");
  jmethodID mainId = (*env)->GetStaticMethodID(env, mainClass, "main", "([Ljava/lang/String;)V");
  /* 执行main方法 */
  (*env)->CallStaticVoidMethod(env, mainClass, mainId);
}
```