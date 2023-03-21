---
date: 2019-07-04 15:15:00
---

# Mysql避免全表update

在测试的时候忘记写where条件导致全表更新的话，可以收拾包袱走人了

下面这条语句可以开启检查，当没有加where时拦截下来

```mysql
set sql_safe_updates=1;
```

关闭：

```mysql
set sql_safe_updates=0;
```

