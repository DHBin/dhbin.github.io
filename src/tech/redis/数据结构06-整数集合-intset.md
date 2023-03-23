---
date: 2021-12-07 11:32:00
category:
  - Redis
tag:
  - Redis
---



# 数据结构06-整数集合-intset

## 数据结构

整数集合的实现相对比较简单，我们看下它的数据结构

```c
/* 整数集合的数据结构 */
typedef struct intset {
    uint32_t encoding; /* 编码，该编码决定了contents数组的int类型，支持16位、32位、64位 */
    uint32_t length; /* 元素长度 */
    int8_t contents[]; /* 元素，元素的类型不是int8_t，而是根据encoding动态强制转换 */
} intset;
```

`intset`由3个字段组成，`encoding`表示`contents`数组的真实数据类型，支持有符号16位int、有符号32位int、有符号64位int。分别对应

- INTSET_ENC_INT16
- INTSET_ENC_INT32
- INTSET_ENC_INT64

`length`表示该集合包含元素的数量

`contents[]`数组定义成了int8_t类型，但是其真实的数据类型是由encoding决定的，在操作的时候会强制转换。

## 实现细节

在redis中整数集合定义了以下Api

```c
/* 初始化一个整数集合 */
intset *intsetNew(void);
/* 向整数集合中添加一个整数 */
intset *intsetAdd(intset *is, int64_t value, uint8_t *success);
/* 向整数集合中移除一个整数 */
intset *intsetRemove(intset *is, int64_t value, int *success);
/* 断言整数集合是否包含一个整数 */
uint8_t intsetFind(intset *is, int64_t value);
/* 随机返回一个整数 */
int64_t intsetRandom(intset *is);
/* 按位置获取一个整数 */
uint8_t intsetGet(intset *is, uint32_t pos, int64_t *value);
/* 返回整数集合的长度 */
uint32_t intsetLen(const intset *is);
/* 返回整数集合的字节数 */
size_t intsetBlobLen(intset *is);
/* 验证整数集合完整性 */
int intsetValidateIntegrity(const unsigned char *is, size_t size, int deep);
```

### 初始化

```c
/* Create an empty intset. */
/* 创建一个空的整数集合 */
intset *intsetNew(void) {
    /* 为整数集合分配空间 */
    intset *is = zmalloc(sizeof(intset));
    /* 指定初始化的编码为INTSET_ENC_INT16，16位int */
    is->encoding = intrev32ifbe(INTSET_ENC_INT16);
    /* 长度初始化为0 */
    is->length = 0;
    return is;
}
```

### 插入数据

整数集合在每次插入数据都会对数组进行扩容的操作，并且会保证集合的有序。当新插入的数字比当前集合支持的最大值还要大的话，会进行修改编码的操作，修改了编码就需要对原来的数据从新都按照新的数据类型重新插入到集合中，插入的方式采用从尾部向前插入，不覆盖原来的数据。

```c
/* Insert an integer in the intset */
intset *intsetAdd(intset *is, int64_t value, uint8_t *success) {
    // 获取待插入的值的编码
    uint8_t valenc = _intsetValueEncoding(value);
    uint32_t pos;
    if (success) *success = 1;

    /* Upgrade encoding if necessary. If we need to upgrade, we know that
     * this value should be either appended (if > 0) or prepended (if < 0),
     * because it lies outside the range of existing values. */
    /* 新插入的值类型超过了原来的类型的最大值，需要升级操作 */
    if (valenc > intrev32ifbe(is->encoding)) {
        /* This always succeeds, so we don't need to curry *success. */
        return intsetUpgradeAndAdd(is,value);
    } else {
        /* Abort if the value is already present in the set.
         * This call will populate "pos" with the right position to insert
         * the value when it cannot be found. */
        /* 搜索元素在集合中的位置，如果存在直接返回，否则取得元素的位置，继续操作 */
        if (intsetSearch(is,value,&pos)) {
            if (success) *success = 0;
            return is;
        }

        is = intsetResize(is,intrev32ifbe(is->length)+1);
        // 移动数组，腾出位置给新插入的数据
        if (pos < intrev32ifbe(is->length)) intsetMoveTail(is,pos,pos+1);
    }

    /* 插入数据 */
    _intsetSet(is,pos,value);
    /* 长度+1 */
    is->length = intrev32ifbe(intrev32ifbe(is->length)+1);
    return is;
}
```

### 删除数据

删除的逻辑很简单，找到对应的位置，删除，然后移动数组的位置，缩容，长度-1。

```c
/* Delete integer from intset */
intset *intsetRemove(intset *is, int64_t value, int *success) {
    /* 获取元素的编码 */
    uint8_t valenc = _intsetValueEncoding(value);
    uint32_t pos;
    if (success) *success = 0;

    /* 元素的编码在集合的编码范围内 && 集合存在该元素 */
    if (valenc <= intrev32ifbe(is->encoding) && intsetSearch(is,value,&pos)) {
        uint32_t len = intrev32ifbe(is->length);

        /* We know we can delete */
        if (success) *success = 1;

        /* Overwrite value with tail and update length */
        /* 先前移动一个位置 */
        if (pos < (len-1)) intsetMoveTail(is,pos+1,pos);
        /* 缩小数组的容量 */
        is = intsetResize(is,len-1);
        /* 长度-1 */
        is->length = intrev32ifbe(len-1);
    }
    return is;
}
```

### 搜索

搜索的实现会先对搜索值是否大于集合中最大值或者小于集合的最小值判断，符合条件的会直接返回不存在。否则因为数组是有序的，采用二分法对数据遍历，查找是否存在。

```c
/* Search for the position of "value". Return 1 when the value was found and
 * sets "pos" to the position of the value within the intset. Return 0 when
 * the value is not present in the intset and sets "pos" to the position
 * where "value" can be inserted. */
static uint8_t intsetSearch(intset *is, int64_t value, uint32_t *pos) {
    int min = 0, max = intrev32ifbe(is->length)-1, mid = -1;
    int64_t cur = -1;

    /* The value can never be found when the set is empty */
    /* 如果集合是空的，直接返回 */
    if (intrev32ifbe(is->length) == 0) {
        if (pos) *pos = 0;
        return 0;
    } else {
        /* Check for the case where we know we cannot find the value,
         * but do know the insert position. */
        /* 如果大于最大值，小于最小值，直接返回 */
        if (value > _intsetGet(is,max)) {
            if (pos) *pos = intrev32ifbe(is->length);
            return 0;
        } else if (value < _intsetGet(is,0)) {
            if (pos) *pos = 0;
            return 0;
        }
    }

    /* 遍历数组 */
    while(max >= min) {
        mid = ((unsigned int)min + (unsigned int)max) >> 1;
        cur = _intsetGet(is,mid);
        if (value > cur) {
            min = mid+1;
        } else if (value < cur) {
            max = mid-1;
        } else {
            break;
        }
    }

    /* 找到了 */
    if (value == cur) {
        if (pos) *pos = mid;
        return 1;
    } else {
        if (pos) *pos = min;
        return 0;
    }
}
```