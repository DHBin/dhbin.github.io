---
date: 2023-04-07
category:
  - Clickhouse
tag:
  - 源码
  - Clickhouse
star: 100
sticky: 100
---

# Clickhouse添加bitmap分页函数

## 起因

在做标签引擎的时候，我们在采用了bitmap存储对象id，基础的结构如下

| 标签类型 | 标签值 | 对象id bitmap |
| -------- | ------ | ------------- |
| 性别     | 男     | [1,2,3]       |
| 性别     | 女     | [8,9,10]      |

表如下：

```sql
create table if not exists label_string_local on cluster clickhouse_cluster
(
    label_type  String comment '标签id',
    label_value String comment '标签值',
    object_bitmap AggregateFunction(groupBitmap, UInt32) comment '标签值'
)
    engine = AggregatingMergeTree PARTITION BY label_type
        ORDER BY (label_type, label_value)
        SETTINGS index_granularity = 8192;
```

到后面需求要求对对象id分页返回，问题就来了，clickhouse的官方没有bitmap的分页函数，最原始的解决方案就是把bitmap整个返回，在应用层对bitmap进行切割，这样导致接口的性能急剧下降。开始萌生了个大胆的想法，给clickhouse添加bitmap分页函数

## 开干

通过阅读Clickhouse的源码，步骤如下：

1. 实现分页

在Clickhouse中bitmap指向的class是`RoaringBitmapWithSmallSet `，bitmap底层使用的是RoaringBitmap，github地址：https://github.com/RoaringBitmap/CRoaring.git，`RoaringBitmapWithSmallSet`对rb进行了包装，在这个类下添加分页函数

```c++
   UInt64 rb_offset_limit(UInt64 offset, UInt64 limit, RoaringBitmapWithSmallSet & r1) const
    {
        if (limit == 0 || offset >= size())
            return 0;

        if (isSmall())
        {
            UInt64 count = 0;
            UInt64 offset_count = 0;
            auto it = small.begin();
            for (;it != small.end() && offset_count < offset; ++it)
                ++offset_count;

            for (;it != small.end() && count < limit; ++it, ++count)
                r1.add(it->getValue());
            return count;
        }
        else
        {
            UInt64 count = 0;
            UInt64 offset_count = 0;
            auto it = rb->begin();
            for (;it != rb->end() && offset_count < offset; ++it)
                ++offset_count;

            for (;it != rb->end() && count < limit; ++it, ++count)
                r1.add(*it);
            return count;
        }
    }
```

2. Clickhouse函数定义

在`FunctionsBitmap.h`定义Clickhouse函数

```c++
struct BitmapSubsetOffsetLimitImpl
{
public:
    static constexpr auto name = "subBitmap";
    template <typename T>
    static void apply(
        const AggregateFunctionGroupBitmapData<T> & bitmap_data_0,
        UInt64 range_start,
        UInt64 range_end,
        AggregateFunctionGroupBitmapData<T> & bitmap_data_2)
        {
        bitmap_data_0.rbs.rb_offset_limit(range_start, range_end, bitmap_data_2.rbs);
        }
};

using FunctionBitmapSubsetOffsetLimit = FunctionBitmapSubset<BitmapSubsetOffsetLimitImpl>;
```

3. Clickhouse函数注册

在`FunctionsBitmap.cpp`注册函数

```c++
#include <Functions/FunctionFactory.h>

// TODO include this last because of a broken roaring header. See the comment inside.
#include <Functions/FunctionsBitmap.h>


namespace DB
{

void registerFunctionsBitmap(FunctionFactory & factory)
{
    ...
    factory.registerFunction<FunctionBitmapSubsetOffsetLimit>();
    ...
}
}
```

这样就完事了，最终这部分的代码提交到了Clickhosue仓库，最终得到了合并，https://github.com/ClickHouse/ClickHouse/pull/27234

## 后续

后面又来了个需求，要求标签能够修改，这又炸了，Clickhosue是不支持修改的，bitmap采用的数据结构是`AggregateFunction(groupBitmap, UInt32)`，groupBitmap的合并逻辑是或运算，内部Clickhosue开发了一种新的数据结构`xor_groupBitmap`，支持合并逻辑异或运算，变相支持删除操作，考虑这部分并不通用，所以没有开源出来