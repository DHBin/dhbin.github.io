---
date: 2020-04-27 08:23:00
---

# Docker CE一键安装脚本 && docker-compose国内源安装

```
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

docker-compose
```
DOCKER_COMPOSE_VERSION=1.25.5
curl -L https://get.daocloud.io/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

# 更多

http://get.daocloud.io/