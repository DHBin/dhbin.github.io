---
date: 2019-01-09 22:01:00
---

# Docker常用命令记录

记录使用一些使用过的Docker命令


# 停止所有的container

> 这样才能够删除其中的images：

```sh
docker stop $(docker ps -a -q)

```

> 如果想要删除所有container的话再加一个指令：

```sh
docker rm $(docker ps -a -q)

```

# 查看当前有些什么images

```sh
docker images

```

# 删除images

> 通过image的id来指定删除谁

```sh
docker rmi <image id>

```

# 想要删除untagged images

> 就是那些id为None的image的话可以用

```sh
docker rmi $(docker images | grep "^<none>" | awk "{print $3}")
```

# 要删除全部image

```sh
docker rmi $(docker images -q)
```

