---
date: 2022-11-06 22:25:00
category:
  - Redis
tag:
  - Docker
  - Redis
---

# Docker搭建redis集群

## 脚本

创建节点数据

```shell
for port in $(seq 1 6); \
do \
mkdir -p ./node-${port}/conf
touch ./node-${port}/conf/redis.conf
cat << EOF > ./node-${port}/conf/redis.conf
port 800${port}
bind 0.0.0.0
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-ip 10.8.46.98
cluster-announce-port 800${port}
cluster-announce-bus-port 1800${port}
appendonly yes
EOF
done
```

## 启动

```shell
# 容器1
docker run --name redis-1 \
-v `pwd`/node-1/data:/data \
-v `pwd`/node-1/conf/redis.conf:/etc/redis/redis.conf \
-d --net host  redis:5.0.12 redis-server /etc/redis/redis.conf

# 容器2
docker run --name redis-2 \
-v `pwd`/node-2/data:/data \
-v `pwd`/node-2/conf/redis.conf:/etc/redis/redis.conf \
-d --net host  redis:5.0.12 redis-server /etc/redis/redis.conf

# 容器3
docker run --name redis-3 \
-v `pwd`/node-3/data:/data \
-v `pwd`/node-3/conf/redis.conf:/etc/redis/redis.conf \
-d --net host  redis:5.0.12 redis-server /etc/redis/redis.conf

# 容器4
docker run --name redis-4 \
-v `pwd`/node-4/data:/data \
-v `pwd`/node-4/conf/redis.conf:/etc/redis/redis.conf \
-d --net host  redis:5.0.12 redis-server /etc/redis/redis.conf

# 容器5
docker run --name redis-5 \
-v `pwd`/node-5/data:/data \
-v `pwd`/node-5/conf/redis.conf:/etc/redis/redis.conf \
-d --net host  redis:5.0.12 redis-server /etc/redis/redis.conf

# 容器6
docker run --name redis-6 \
-v `pwd`/node-6/data:/data \
-v `pwd`/node-6/conf/redis.conf:/etc/redis/redis.conf \
-d --net host  redis:5.0.12 redis-server /etc/redis/redis.conf
```

## 停止

```bash
docker stop redis-1
docker stop redis-2
docker stop redis-3
docker stop redis-4
docker stop redis-5
docker stop redis-6
```

## 删除

```plain
for port in $(seq 1 6); \                                                                                                                                                                                  
do \                                                                                                                                                                                                       
docker stop redis-${port}                                                                                                                                                                                  
docker rm redis-${port}                                                                                                                                                                                    
done
```

## docker-compose版本

```yaml
version: '3.1'
services:
  # redis1配置
  redis1:
    image: redis:6.2.5
    container_name: redis-1
    volumes:
      - ./node-1/conf/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "8001:8001"
      - "18001:18001"
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
  # redis2配置
  redis2:
    image: redis:6.2.5
    container_name: redis-2
    volumes:
      - ./node-2/conf/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "8002:8002"
      - "18002:18002"
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
  # redis3配置
  redis3:
    image: redis:6.2.5
    container_name: redis-3
    volumes:
      - ./node-3/conf/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "8003:8003"
      - "18003:18003"
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
  # redis4配置
  redis4:
    image: redis:6.2.5
    container_name: redis-4
    volumes:
      - ./node-4/conf/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "8004:8004"
      - "18004:18004"
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
  # redis5配置
  redis5:
    image: redis:6.2.5
    container_name: redis-5
    volumes:
      - ./node-5/conf/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "8005:8005"
      - "18005:18005"
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
  # redis6配置
  redis6:
    image: redis:6.2.5
    container_name: redis-6
    volumes:
      - ./node-6/conf/redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "8006:8006"
      - "18006:18006"
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]

#redis-cli --cluster create 192.168.1.110:8001 192.168.1.110:8002 192.168.1.110:8003 192.168.1.110:8004 192.168.1.110:8005 192.168.1.110:8006 --cluster-replicas 0
```

## 资料

[Docker搭建Redis Cluster集群 ](https://cloud.tencent.com/developer/article/1838120)