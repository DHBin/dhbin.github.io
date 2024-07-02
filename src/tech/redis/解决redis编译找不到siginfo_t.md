---
date: 2024-07-02 23:44:00
category:
  - Redis
tag:
  - 源码
  - Redis
---

# 解决redis编译找不到siginfo_t

编译redis出现
```
server.h:2757:30: error: unknown type name ‘siginfo_t’
 2757 | void sigsegvHandler(int sig, siginfo_t *info, void *secret);
```



打开`Makefile`找到FINAL_CFLAGS在后面追加`-D_POSIX_C_SOURCE=199309L`

最终FINAL_CFLAGS为

```makefile
FINAL_CFLAGS=$(STD) $(WARN) $(OPT) $(DEBUG) $(CFLAGS) $(REDIS_CFLAGS) -D_POSIX_C_SOURCE=199309L
```

然后

```
make clean
make
```

 ## 资料

 [unknown type name 'siginfo_t' with Clang using _POSIX_C_SOURCE 2, why?](https://stackoverflow.com/questions/22912674/unknown-type-name-siginfo-t-with-clang-using-posix-c-source-2-why)