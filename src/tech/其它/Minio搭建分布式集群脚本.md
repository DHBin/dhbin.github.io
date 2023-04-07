---
date: 2023-04-07
category:
  - 其它
tag:
  - Minio
---

# Minio搭建分布式集群脚本

## 下载

```shell
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
```

创建文件夹`min-data{1..4}`、`logs`

```
.
├── logs
│   ├── minio-9001.log
│   ├── minio-9002.log
│   ├── minio-9003.log
│   └── minio-9004.log
├── mc
├── min-data1
├── min-data2
├── min-data3
├── min-data4
├── minio
├── run.sh
└── stop.sh
```

## 脚本

> run.sh

```shell
#!/bin/bash

MINIO_HOME=/home/lbx/apps/minio
MINIO_HOST=x.x.x.x
#accesskey and secretkey
ACCESS_KEY=minio 
SECRET_KEY=minio123

for i in {01..04}; do
    CI=true MINIO_ACCESS_KEY=${ACCESS_KEY} MINIO_SECRET_KEY=${SECRET_KEY} nohup ${MINIO_HOME}/minio  server --address "${MINIO_HOST}:90${i}" --console-address "${MINIO_HOST}:190${i}" http://${MINIO_HOST}:9001/home/lbx/apps/minio/min-data1 http://${MINIO_HOST}:9002/home/lbx/apps/minio/min-data2 http://${MINIO_HOST}:9003/home/lbx/apps/minio/min-data3 http://${MINIO_HOST}:9004/home/lbx/apps/minio/min-data4 > ${MINIO_HOME}/logs/minio-90${i}.log 2>&1 &
done
```

> stop.sh

```shell
#!/bin/bash

kill -15 `pidof minio`
```



# 参考

[Minio新版本部署问题处理(is part of root disk, will not be used)](https://my.oschina.net/knshsg/blog/5559386)

[MinIO | Code and downloads to create high performance object storage](https://min.io/download#/linux)

[MinIO 的分布式部署 - Mason技术记录 ](https://www.cnblogs.com/masonlee/p/12811784.html)