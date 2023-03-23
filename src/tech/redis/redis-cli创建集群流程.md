---
date: 2022-11-12 22:42:00
category:
  - Redis
tag:
  - Redis
---

# redis-cli创建集群流程

1. 先通过CLUSTER INFO获取节点是否开启集群模式
2. cluster addslots为每个master添加槽点
3. CLUSTER REPLICATE为每个replicate节点与master关联
4. cluster set-config-epoch为每个节点设置不同epoch
5. cluster meet把节点关联起来

