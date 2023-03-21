---
date: 2019-08-24 10:28:00
---


# Mysql中的Null值


在大对数编程语言中，逻辑表达式的值只有两种：True，False。但是在关系型数据库中的逻辑表达式并非两种，而是三值逻辑的表达式(True、False、Unknown)。

```mysql
select null = 1;
```

执行结果：

```mysql
+----------+
| null = 1 |
+----------+
|     NULL |
+----------+
1 row in set (0.01 sec)
```

```mysql
select null = null;
```

执行结果：

```mysql
+-------------+
| null = null |
+-------------+
|        NULL |
+-------------+
1 row in set (0.00 sec)
```

出乎意料的是`null = 1`返回的是null，而`null = null`返回的也是null，而不是1。对于返回值是null的情况，应该将它视为unknown的情况，即表示未知。在不同的语句下unknown表示不同的值

## ON

unknown被视为False

## GROUP BY

group by会把null值分到一组

## ORDER BY

order by会把null值排列在一起