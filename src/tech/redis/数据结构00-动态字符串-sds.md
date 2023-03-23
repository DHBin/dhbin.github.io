---
date: 2021-12-06 22:11:00
category:
  - Redis
tag:
  - Redis
  - 算法
---

# 数据结构00-动态字符串-sds

## 数据结构

在3.2版本之前，动态字符串的结构是这样的。

```c
struct sdshdr {
    // buf数组的长度
    unsigned int len;
    // buf数组还剩空间
    unsigned int free;
    char buf[];
};
```

在3.2版本，redis对sds进行了内存占用优化，结构改成了这样。没错，会根据字符串的长度对于不同的结构体。



```c
/* Note: sdshdr5 is never used, we just access the flags byte directly.
 * However is here to document the layout of type 5 SDS strings. */
struct __attribute__ ((__packed__)) sdshdr5 {
    unsigned char flags; /* 3 lsb of type, and 5 msb of string length */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len; /* used */
    uint8_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr16 {
    uint16_t len; /* used */
    uint16_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr32 {
    uint32_t len; /* used */
    uint32_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len; /* used */
    uint64_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
```

`__attribute__ ((__packed__))`是编译器特性，作用是取消内存对齐我们可以先忽略。简化一下如下

```c
/* 长度小于32(1<<5)使用这个结构体，用户创建字符串不会使用这个结构体，直接使用sdsdhr8
 sdshdr5会在内部的一些地方使用，比如key
*/
struct sdshdr5 {
    unsigned char flags; /* 低3位存储类型, 高5位存储字符串长度 */
    char buf[];
};

/* 长度小于256(1<<8)使用这个结构体 */
struct sdshdr8 {
    uint8_t len; /* buf已使用长度 */
    uint8_t alloc; /* buf字节数，不包括最后的'\0'，buf[]的字节数 = alloc + 1 */
    unsigned char flags; /* 低3位存储类型, 高5位未使用 */
    char buf[];
};

/* 长度小于65536(1<<16)使用这个结构体 */
struct sdshdr16 {
    uint16_t len; /* buf已使用长度 */
    uint16_t alloc; /* buf字节数，不包括最后的'\0'，buf[]的字节数 = alloc + 1 */
    unsigned char flags; /* 低3位存储类型, 高5位未使用 */
    char buf[];
};

/* 长度小于4,294,967,296(1<<32)使用这个结构体 */
struct sdshdr32 {
    uint32_t len; /* buf已使用长度 */
    uint32_t alloc; /* buf字节数，不包括最后的'\0'，buf[]的字节数 = alloc + 1 */
    unsigned char flags; /* 低3位存储类型, 高5位未使用 */
    char buf[];
};

/* 长度小于18,446,744,073,709,551,616(1<<64)使用这个结构体，但是redis中的字符串占用内存限制在
 512M，所以没用用到这个结构体
*/
struct sdshdr64 {
    uint64_t len; /* buf已使用长度 */
    uint64_t alloc; /* buf字节数，不包括最后的'\0'，buf[]的字节数 = alloc + 1 */
    unsigned char flags; /* 低3位存储类型, 高5位未使用 */
    char buf[];
};
```

可以看出3.2版本之前，len和free都是unsigned int，各占4个字节。在3.2版本之后，按不同长度分了5种结构体，sdshdr8与旧版的sdshdr就差了8（4 * 2）个字节，内存占用更少了。



## 巧妙的设计

### 复用标准库函数

对外使用的数据结构还是一个sds，是char*的别名，结构如下

```c
typedef char *sds;
```

是一个 char 指针，能兼容使用c语言标准库中的函数，但与一般的 char 真正不一样的是，sds 是带有头信息的，也就是各种 sdshdr，这里涉及C指针的知识，指针[-1]能获取上一个内存位置的字段。



![img](https://cdn.dhbin.cn/1634544764893-df6bde20-6160-4845-9415-73ea1efacf5b.jpeg)



获取头信息的方式，`sds[-1]`获取`flags（类型）`，通过 flags 获取到真实的 sdshdr，计算出 sdshdr 数据结构的长度x，sds的指针地址 - x 就是sdshdr。

### 位存储

`unsigned char flags;`标志字段，这里的设计也比较巧妙，在比较看重内存的程序中都会有这样子的设计出现，`unsigned char`代表一个字节，也就是8位。为什么使用3位就能标识5种结构体呢，我们看下源码中的定义

```c
#define SDS_TYPE_5  0
#define SDS_TYPE_8  1
#define SDS_TYPE_16 2
#define SDS_TYPE_32 3
#define SDS_TYPE_64 4
#define SDS_TYPE_MASK 7
```

5、8、16、32、64的结构体分别对应数字0、1、2、3、4，在二进制中，三个bit的排列组合如下

```plain
000 --- SDS_TYPE_5
001 --- SDS_TYPE_8
010 --- SDS_TYPE_16
011 --- SDS_TYPE_32
100 --- SDS_TYPE_64

111 --- SDS_TYPE_MASK

还有101、110、111未使用
```

用3个bits就能表示8种状态，如果使用8个char类型的话就需要64bits的内存空间。



SDS_TYPE_MASK是掩码，`flags & SDS_TYPE_MASK`就是类型编码

### 容量扩容策略

扩容关键代码：

```c
sds sdsMakeRoomFor(sds s, size_t addlen) {
    void *sh, *newsh;
    /* 可用空间 */
    size_t avail = sdsavail(s);
    /* 长度 */
    size_t len, newlen;
    /* 获取类型 */
    char type, oldtype = s[-1] & SDS_TYPE_MASK;
    int hdrlen;
    size_t usable;

    /* Return ASAP if there is enough space left. */
    /* 如果可用空间>=需要添加的空间，直接返回 */
    if (avail >= addlen) return s;

    len = sdslen(s);
    /* sh是sds 首部（hdr）信息的指针地址 */
    sh = (char*)s-sdsHdrSize(oldtype);
    /* 计算新的长度 */
    newlen = (len+addlen);
    assert(newlen > len);   /* Catch size_t overflow */
    /* 新的长度小于 1024*1024（1M）的话，扩容到新的长度的两倍 */
    if (newlen < SDS_MAX_PREALLOC)
        newlen *= 2;
    else
        /* 新的长度大于等于 1024*1024（1M）的话，新的长度加上 1024*1024（1M） */
        newlen += SDS_MAX_PREALLOC;

    /* 通过新的长度获取类型 */
    type = sdsReqType(newlen);

    /* Don't use type 5: the user is appending to the string and type 5 is
     * not able to remember empty space, so sdsMakeRoomFor() must be called
     * at every appending operation. */
    /* 这里把SDS_TYPE_5转成SDS_TYPE_8，原因是type 5的数据结构没有记录剩余的空间，
     * 如果扩容需要更多的操作
     * */
    if (type == SDS_TYPE_5) type = SDS_TYPE_8;

    /* 计算首部长度 */
    hdrlen = sdsHdrSize(type);
    assert(hdrlen + newlen + 1 > len);  /* Catch size_t overflow */
    /* 旧的类型与新的类型一致 */
    if (oldtype==type) {
        /* 因为类型一致，扩容后把旧的sh复制到新的内存空间中 */
        newsh = s_realloc_usable(sh, hdrlen+newlen+1, &usable);
        if (newsh == NULL) return NULL;
        /* 首部地址 + 首部的长度 = char* */
        s = (char*)newsh+hdrlen;
    } else {
        /* Since the header size changes, need to move the string forward,
         * and can't use realloc */
        /* 类型不一致，重新分配一个sh */
        newsh = s_malloc_usable(hdrlen+newlen+1, &usable);
        if (newsh == NULL) return NULL;
        /* 把char*复制到新的内存空间中 */
        memcpy((char*)newsh+hdrlen, s, len+1);
        /* 把旧的释放 */
        s_free(sh);
        /* 首部地址 + 首部的长度 = char* */
        s = (char*)newsh+hdrlen;
        /* 设置类型 */
        s[-1] = type;
        /* 设置长度 */
        sdssetlen(s, len);
    }
    /* 可用空间 = 总空间 - 首部长度 - 1，-1的原因是char*尾部会追加一个'\0'，需要把这个去掉 */
    usable = usable-hdrlen-1;
    if (usable > sdsTypeMaxSize(type))
        usable = sdsTypeMaxSize(type);
    /* 设置可用空间，alloc的单位是Byte */
    sdssetalloc(s, usable);
    return s;
}
```

如果新的长度小于1M，扩容到新的长度的两倍，新的长度大于等于1M的话，新的长度加上1M。就是长度大于等于1M之后，1M递增。



例子：

- newLen = 50，根据上面的算法，newLen = newLen * 2，结果是100
- newLen =  (1024 * 1024)，根据上面的算法，newLen = newLen + (1024 * 1024)，结果是(1024 * 1024) + (1024 * 1024)



优点：

- 预分配内存，减少内存重新分配，提升性能

缺点：

- 需要更多的内存

### 容量缩容策略

```c
sds sdsRemoveFreeSpace(sds s) {
    void *sh, *newsh;
    char type, oldtype = s[-1] & SDS_TYPE_MASK;
    int hdrlen, oldhdrlen = sdsHdrSize(oldtype);
    size_t len = sdslen(s);
    size_t avail = sdsavail(s);
    sh = (char*)s-oldhdrlen;

    /* Return ASAP if there is no space left. */
    if (avail == 0) return s;

    /* Check what would be the minimum SDS header that is just good enough to
     * fit this string. */
    type = sdsReqType(len);
    hdrlen = sdsHdrSize(type);

    /* If the type is the same, or at least a large enough type is still
     * required, we just realloc(), letting the allocator to do the copy
     * only if really needed. Otherwise if the change is huge, we manually
     * reallocate the string to use the different header type. */
    if (oldtype==type || type > SDS_TYPE_8) {
        newsh = s_realloc(sh, oldhdrlen+len+1);
        if (newsh == NULL) return NULL;
        s = (char*)newsh+oldhdrlen;
    } else {
        newsh = s_malloc(hdrlen+len+1);
        if (newsh == NULL) return NULL;
        memcpy((char*)newsh+hdrlen, s, len+1);
        s_free(sh);
        s = (char*)newsh+hdrlen;
        s[-1] = type;
        sdssetlen(s, len);
    }
    sdssetalloc(s, len);
    return s;
}
```

缩容的关键代码和扩容的代码差不多，都是相同类型的话，申请一块新的内存空间，把旧的所有内容复制过去，不一致的话，申请一块内存空间，重新赋值长度、类型、可用空间，把char*复制过去。



sds长度缩小的函数：

- sdstrim
- sdssubstr
- sdsrange
- sdsclear

在这些函数中，sds的长度减小了，但是不会实时收缩buff[]的长度，buff的缩小有专门的函数`sdsRemoveFreeSpace`，调用这个函数才会真实地缩小buff的长度，惰性释放。字符串缩容在对外部使用的字符串并不会使用，而是在内部调用，比如发送给服务端的命令参数。