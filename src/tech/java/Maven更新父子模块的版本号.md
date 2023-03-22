---
date: 2018-09-20 14:59:00
category:
  - Java
tag:
  - Maven
---

# Maven更新父子模块的版本号

设置父子版本号

```sh
$ mvn versions:set -DnewVersion=[版本]
```

<!-- more -->

更新子模块版本号

```sh
$ mvn versions:update-child-modules
```

提交更新

```sh
$ mvn versions:commit
```
