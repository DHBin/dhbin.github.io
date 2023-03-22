---
date: 2022-10-25 14:31:00
category:
  - Linux
tag:
 - Linux
---

# Linux dump内存

> 在分析netty堆外内存泄漏的时候，想查看堆外内存存储了些什么，所以写了这个小工具。确实gdb也可以实现，但gdb会处理其它信号，可能会影响程序的正常运行。生产配合arthas一起食用

<!-- more -->

```c
#include <sys/ptrace.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <unistd.h>

#define long_size sizeof(long)

int main(int argc, char *argv[]) {
  if (argc != 4) {
    printf("usages:\n\tdump pid addr_offset bytes_len\nexmaple:\n\tdump 1 0xfab00113868 10\n");
    return -1;
  }
  pid_t pid = atoi(argv[1]);
  long addr = strtol(argv[2], NULL, 10);
  int bytes_len = atoi(argv[3]);

  ptrace(PTRACE_ATTACH,pid,NULL,NULL);
  wait(NULL);
  char chars[bytes_len];
  int count = bytes_len / long_size;
  int copyed_size = 0;
  int offset;
  for(int i = 0; i < count; i++) {
    offset = long_size * i;
    long buff = ptrace(PTRACE_PEEKTEXT, pid, addr + offset, NULL);
    if (buff == -1) {
      if (errno)  fprintf(stderr, "err: %s\n", strerror(errno));
      return -1;
    }
    memcpy(chars + offset, &buff, long_size);
    copyed_size += long_size;
  }
  if (copyed_size < bytes_len) {
    offset = long_size * count;
    long buff = ptrace(PTRACE_PEEKTEXT, pid, addr + offset, NULL);
    if (buff == -1) {
      if (errno)  fprintf(stderr, "err: %s\n", strerror(errno));
      return -1;
    }
    memcpy(chars + offset, &buff, bytes_len - copyed_size);
  }

  write(STDOUT_FILENO, chars, bytes_len);
  ptrace(PTRACE_DETACH,pid,NULL,NULL);
}
```

```makefile
all:
        gcc dump.c -static -o dump

clean:
        rm ./dump
```
![linux_dump_mem](https://cdn.dhbin.cn/linux_dump_mem.jpg)
