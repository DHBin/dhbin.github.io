---
date: 2023-07-28 20:11:00
category:
  - Redis
tag:
  - Redis
  - Iptables
---

# 解决redis集群内部ip问题

## 背景

服务上云，内网的redis集群，通过ip映射的方式把redis的端口映射到公网（白名单），公网的机器通过lettuce等客户端连接的时候，lettuce客户端的集群模式是先通过cluster nodes 获取节点拓扑 ，在操作key的时候先通过算法定位到key在哪个节点，获取key如果重定向到其它节点的话，就会从对应的节点获取。这就会导致获取到的ip是内网的ip，公网连接不上的问题，以下是通过iptables的方式解决。

<!-- more -->

## 验证环境

使用docker创建3个redis，并关联成集群

```shell
# 生成3个redis
for port in $(seq 1 3); \
do \
mkdir -p ./node-${port}/conf
touch ./node-${port}/conf/redis.conf
cat << EOF > ./node-${port}/conf/redis.conf
port 800${port}
bind 0.0.0.0
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-port 800${port}
cluster-announce-bus-port 1800${port}
appendonly yes
EOF
done

# 运行3个redis

sudo docker run --name redis-1 \
-v `pwd`/node-1/data:/data \
-v `pwd`/node-1/conf/redis.conf:/etc/redis/redis.conf \
-d -p 8001:8001 redis:5.0.12 redis-server /etc/redis/redis.conf

sudo docker run --name redis-2 \
-v `pwd`/node-2/data:/data \
-v `pwd`/node-2/conf/redis.conf:/etc/redis/redis.conf \
-d -p 8002:8002 redis:5.0.12 redis-server /etc/redis/redis.conf

sudo docker run --name redis-3 \
-v `pwd`/node-3/data:/data \
-v `pwd`/node-3/conf/redis.conf:/etc/redis/redis.conf \
-d -p 8003:8003 redis:5.0.12 redis-server /etc/redis/redis.conf


# 关联集群，ip以实际ip为准
redis-cli --cluster create 172.17.0.2:8001 172.17.0.3:8002 172.17.0.4:8003  --cluster-replicas 0
```



ip映射关系：

```shell
10.8.46.40:8001 -- 172.17.0.2:8001
10.8.46.40:8002 -- 172.17.0.3:8002
10.8.46.40:8002 -- 172.17.0.4:8003
```



## 测试

在另一台机器（10.8.46.51）访问：

```shell
sudo docker run -it --rm --net host redis redis-cli -c -h 10.8.46.40 -p 8001
```



执行get请求ip访问不通

```shell
$ sudo docker run -it --rm --net host redis redis-cli -c -h 10.8.46.40 -p 8001
10.8.46.40:8001> get a
-> Redirected to slot [15495] located at 172.17.0.4:8003
Could not connect to Redis at 172.17.0.4:8003: No route to host
(3.05s)
not connected>
```



添加iptables规则

```shell
sudo iptables -t nat -A OUTPUT -d 172.17.0.2 -p tcp --dport 8001 -j DNAT --to-destination 10.8.46.40:8001
sudo iptables -t nat -A OUTPUT -d 172.17.0.3 -p tcp --dport 8002 -j DNAT --to-destination 10.8.46.40:8002
sudo iptables -t nat -A OUTPUT -d 172.17.0.4 -p tcp --dport 8003 -j DNAT --to-destination 10.8.46.40:8003
```



```shell
$ sudo iptables -t nat -nvL --line-number
Chain PREROUTING (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1       95  6219 DOCKER     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ADDRTYPE match dst-type LOCAL

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1        0     0 DOCKER     all  --  *      *       0.0.0.0/0           !127.0.0.0/8          ADDRTYPE match dst-type LOCAL
2        0     0 DNAT       tcp  --  *      *       0.0.0.0/0            172.17.0.2           tcp dpt:8001 to:10.8.46.40:8001
3        0     0 DNAT       tcp  --  *      *       0.0.0.0/0            172.17.0.3           tcp dpt:8002 to:10.8.46.40:8002
4        0     0 DNAT       tcp  --  *      *       0.0.0.0/0            172.17.0.4           tcp dpt:8003 to:10.8.46.40:8003

Chain POSTROUTING (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1        6   360 MASQUERADE  all  --  *      !docker0  172.17.0.0/16        0.0.0.0/0           

Chain DOCKER (2 references)
num   pkts bytes target     prot opt in     out     source               destination         
1        0     0 RETURN     all  --  docker0 *       0.0.0.0/0            0.0.0.0/0 
```



访问正常，因为网络是通的了，就不需要访问10.8.46.40了，可以直接访问172.17.0.2

```shell
$ sudo docker run -it --rm --net host redis redis-cli -c -h 10.8.46.40 -p 8001
10.8.46.40:8001> get a
-> Redirected to slot [15495] located at 172.17.0.4:8003
"123"
172.17.0.4:8003> 
```



```shell
$ sudo iptables -t nat -nvL --line-number
Chain PREROUTING (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1       95  6219 DOCKER     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ADDRTYPE match dst-type LOCAL

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         

Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1        0     0 DOCKER     all  --  *      *       0.0.0.0/0           !127.0.0.0/8          ADDRTYPE match dst-type LOCAL

Chain POSTROUTING (policy ACCEPT 0 packets, 0 bytes)
num   pkts bytes target     prot opt in     out     source               destination         
1        6   360 MASQUERADE  all  --  *      !docker0  172.17.0.0/16        0.0.0.0/0           

Chain DOCKER (2 references)
num   pkts bytes target     prot opt in     out     source               destination         
1        0     0 RETURN     all  --  docker0 *       0.0.0.0/0            0.0.0.0/0 
```
