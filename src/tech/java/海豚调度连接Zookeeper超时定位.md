---
date: 2023-04-06
category:
  - Java
tag:
  - 问题排查
  - 海豚调度
  - Zookeeper
---

# 海豚调度连接Zookeeper超时定位

## 过程

在本地启动海豚调度的服务，出现zookeeper connect timeout异常，但是检查zookeeper节点都是正常的。经过一轮分析，发现个大坑！！！



海豚调度的zookeeper配置信息：

```properties
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

registry.plugin.name=zookeeper
registry.servers=x.x.x.x:2181
registry.namespace=dolphinscheduler
registry.base.sleep.time.ms=60
registry.max.sleep.ms=300
registry.max.retries=5
registry.session.timeout.ms=30000
registry.connection.timeout.ms=7500
registry.block.until.connected.wait=600
registry.digest=
```

异常启动日志如下：



```
Caused by: org.apache.dolphinscheduler.registry.api.RegistryException: zookeeper connect timeout
	at org.apache.dolphinscheduler.plugin.registry.zookeeper.ZookeeperRegistry.start(ZookeeperRegistry.java:111) ~[classes/:na]
	at org.apache.dolphinscheduler.service.registry.RegistryClient.start(RegistryClient.java:291) ~[classes/:na]
	at org.apache.dolphinscheduler.service.registry.RegistryClient.afterConstruct(RegistryClient.java:81) ~[classes/:na]
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:1.8.0_332]
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62) ~[na:1.8.0_332]
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:1.8.0_332]
	at java.lang.reflect.Method.invoke(Method.java:498) ~[na:1.8.0_332]
	at org.springframework.beans.factory.annotation.InitDestroyAnnotationBeanPostProcessor$LifecycleElement.invoke(InitDestroyAnnotationBeanPostProcessor.java:389) ~[spring-beans-5.3.12.jar:5.3.12]
	at org.springframework.beans.factory.annotation.InitDestroyAnnotationBeanPostProcessor$LifecycleMetadata.invokeInitMethods(InitDestroyAnnotationBeanPostProcessor.java:333) ~[spring-beans-5.3.12.jar:5.3.12]
	at org.springframework.beans.factory.annotation.InitDestroyAnnotationBeanPostProcessor.postProcessBeforeInitialization(InitDestroyAnnotationBeanPostProcessor.java:157) ~[spring-beans-5.3.12.jar:5.3.12]
	... 45 common frames omitted
```







在配置文件中其中一个关键的配置：registry.block.until.connected.wait，意思是curator等待zookeeper连接超时，超过这个时间的话，异常退出。



海豚调度连接zookeeper关键代码

```java
    public void start(Map<String, String> config) {
        CuratorFrameworkFactory.Builder builder =
            CuratorFrameworkFactory.builder()
                                   .connectString(SERVERS.getParameterValue(config.get(SERVERS.getName())))
                                   .retryPolicy(buildRetryPolicy(config))
                                   .namespace(NAME_SPACE.getParameterValue(config.get(NAME_SPACE.getName())))
                                   .sessionTimeoutMs(SESSION_TIMEOUT_MS.getParameterValue(config.get(SESSION_TIMEOUT_MS.getName())))
                                   .connectionTimeoutMs(CONNECTION_TIMEOUT_MS.getParameterValue(config.get(CONNECTION_TIMEOUT_MS.getName())));

        String digest = DIGEST.getParameterValue(config.get(DIGEST.getName()));
        if (!Strings.isNullOrEmpty(digest)) {
            buildDigest(builder, digest);
        }
        client = builder.build();

        client.start();
        try {
            // 这行！！！等待连接，超出配置时间异常退出
            if (!client.blockUntilConnected(BLOCK_UNTIL_CONNECTED_WAIT_MS.getParameterValue(config.get(BLOCK_UNTIL_CONNECTED_WAIT_MS.getName())), MILLISECONDS)) {
                client.close();
                throw new RegistryException("zookeeper connect timeout");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RegistryException("zookeeper connect error", e);
        }
    }
```



那么，既然是因为等待超时导致的异常，尝试调整registry.block.until.connected.wait，从600ms修改到60000ms，也就60s，启动！！！等待大概20秒左右，正常启动了。真见鬼！！！这种情况下，我开始怀疑是不是网络有问题，开始抓包。



发现程序初始化完成，开始连接zookeeper，但迟迟没有发送tcp握手包，在这情况下，我开始怀疑代码的问题了。



通过分析zookeeper的源码，找出了慢的关键代码

```java
        private void startConnect(InetSocketAddress addr) throws IOException {
            // initializing it for new connection
            saslLoginFailed = false;
            state = States.CONNECTING;

            // 在这！！！
            setName(getName().replaceAll("\\(.*\\)",
                    "(" + addr.getHostName() + ":" + addr.getPort() + ")"));
            if (ZooKeeperSaslClient.isEnabled()) {
                try {
                    zooKeeperSaslClient = new ZooKeeperSaslClient(SaslServerPrincipal.getServerPrincipal(addr));
                } catch (LoginException e) {
                    // An authentication error occurred when the SASL client tried to initialize:
                    // for Kerberos this means that the client failed to authenticate with the KDC.
                    // This is different from an authentication error that occurs during communication
                    // with the Zookeeper server, which is handled below.
                    LOG.warn("SASL configuration failed: " + e + " Will continue connection to Zookeeper server without "
                      + "SASL authentication, if Zookeeper server allows it.");
                    eventThread.queueEvent(new WatchedEvent(
                      Watcher.Event.EventType.None,
                      Watcher.Event.KeeperState.AuthFailed, null));
                    saslLoginFailed = true;
                }
            }
            logStartConnect(addr);

            clientCnxnSocket.connect(addr);
        }
```

从上面的代码看到setName这个方法，作用是修改线程名称的，其中调用了addr.getHostName()，罪魁祸首就是这个！！！





java.net.InetSocketAddress#getHostName，作用是获取主机名称，如果在初始化这个对象的时候，传入的hostname是一个域名，那么可以直接返回，但是！！！！如果是一个ip地址的话，那问题就来了。



如果是一个ip地址，getHostName可以通过ip地址去反查域名，这个操作不常见，原理是通过DNS查询PTR记录，但一般来说DNS服务器是没有这个记录，所以查询不到，查询不到就会从本地的hosts文件找，在都找不到的情况下，这过程大概会阻塞个20秒，海豚设置的创建连接超时是600ms，所以必定失败。



解决方法：

1. 如果要用ip的话，在DNS服务器添加该ip的PTR记录。但，这不是很现实
2. 在本地的host文件中添加解析信息（推荐）

例子：

```plain
x.x.x.x my-zookeeper
```

然后~~~就正常了。问题到这里就解决了，所以在用zookeeper的时候，推荐使用域名的方式，不然就有可能出现连接zookeeper非常慢！！！



## 进阶

getHostName这个方法到底做了什么操作？



getHostName的源码中会调用到java.net.InetAddress#getHostFromNameService获取主机名称

```java
    private static String getHostFromNameService(InetAddress addr, boolean check) {
        String host = null;
        for (NameService nameService : nameServices) {
            try {
                // first lookup the hostname
                // 关键代码在这
                host = nameService.getHostByAddr(addr.getAddress());

                /* check to see if calling code is allowed to know
                 * the hostname for this IP address, ie, connect to the host
                 */
                if (check) {
                    SecurityManager sec = System.getSecurityManager();
                    if (sec != null) {
                        sec.checkConnect(host, -1);
                    }
                }

                /* now get all the IP addresses for this hostname,
                 * and make sure one of them matches the original IP
                 * address. We do this to try and prevent spoofing.
                 */

                InetAddress[] arr = InetAddress.getAllByName0(host, check);
                boolean ok = false;

                if(arr != null) {
                    for(int i = 0; !ok && i < arr.length; i++) {
                        ok = addr.equals(arr[i]);
                    }
                }

                //XXX: if it looks a spoof just return the address?
                if (!ok) {
                    host = addr.getHostAddress();
                    return host;
                }

                break;

            } catch (SecurityException e) {
                host = addr.getHostAddress();
                break;
            } catch (UnknownHostException e) {
                host = addr.getHostAddress();
                // let next provider resolve the hostname
            }
        }

        return host;
    }
```



最终会调用到java.net.Inet4AddressImpl#getHostByAddr方法

```java
public native String getHostByAddr(byte[] addr) throws UnknownHostException;
```

native方法，翻jdk源码，定位到一下代码

```c
/*
 * Class:     java_net_Inet6AddressImpl
 * Method:    getHostByAddr
 * Signature: (I)Ljava/lang/String;
 */
JNIEXPORT jstring JNICALL
Java_java_net_Inet6AddressImpl_getHostByAddr(JNIEnv *env, jobject this,
                                            jbyteArray addrArray) {

    jstring ret = NULL;

#ifdef AF_INET6
    char host[NI_MAXHOST+1];
    int error = 0;
    int len = 0;
    jbyte caddr[16];

    struct sockaddr_in him4;
    struct sockaddr_in6 him6;
    struct sockaddr *sa;

    /*
     * For IPv4 addresses construct a sockaddr_in structure.
     */
    if ((*env)->GetArrayLength(env, addrArray) == 4) {
        jint addr;
        (*env)->GetByteArrayRegion(env, addrArray, 0, 4, caddr);
        addr = ((caddr[0]<<24) & 0xff000000);
        addr |= ((caddr[1] <<16) & 0xff0000);
        addr |= ((caddr[2] <<8) & 0xff00);
        addr |= (caddr[3] & 0xff);
        memset((void *) &him4, 0, sizeof(him4));
        him4.sin_addr.s_addr = (uint32_t) htonl(addr);
        him4.sin_family = AF_INET;
        sa = (struct sockaddr *) &him4;
        len = sizeof(him4);
    } else {
        /*
         * For IPv6 address construct a sockaddr_in6 structure.
         */
        (*env)->GetByteArrayRegion(env, addrArray, 0, 16, caddr);
        memset((void *) &him6, 0, sizeof(him6));
        memcpy((void *)&(him6.sin6_addr), caddr, sizeof(struct in6_addr) );
        him6.sin6_family = AF_INET6;
        sa = (struct sockaddr *) &him6 ;
        len = sizeof(him6) ;
    }

    // 关键代码在这。。。。
    error = getnameinfo(sa, len, host, NI_MAXHOST, NULL, 0,
                        NI_NAMEREQD);

    if (!error) {
        ret = (*env)->NewStringUTF(env, host);
    }
#endif /* AF_INET6 */

    if (ret == NULL) {
        JNU_ThrowByName(env, JNU_JAVANETPKG "UnknownHostException", NULL);
    }

    return ret;
}
```

在Linux中，getnameinfo是glibc的一个函数，作用就是获取主机信息

那么在glibc的代码中，关键的代码如下：

https://github.com/lattera/glibc/blob/master/inet/getnameinfo.c

```c
/* Convert host name, AF_INET/AF_INET6 case, name only.  */
static int
gni_host_inet_name (struct scratch_buffer *tmpbuf,
		    const struct sockaddr *sa, socklen_t addrlen,
		    char *host, socklen_t hostlen, int flags)
{
  int herrno;
  struct hostent th;
  struct hostent *h = NULL;
  if (sa->sa_family == AF_INET6)
    {
      const struct sockaddr_in6 *sin6p = (const struct sockaddr_in6 *) sa;
      while (__gethostbyaddr_r (&sin6p->sin6_addr, sizeof(struct in6_addr),
				AF_INET6, &th, tmpbuf->data, tmpbuf->length,
				&h, &herrno))
	if (herrno == NETDB_INTERNAL && errno == ERANGE)
	  {
	    if (!scratch_buffer_grow (tmpbuf))
	      {
		__set_h_errno (herrno);
		return EAI_MEMORY;
	      }
	  }
	else
	  break;
    }
  else
    {
      const struct sockaddr_in *sinp = (const struct sockaddr_in *) sa;
      // 关键代码在这
      while (__gethostbyaddr_r (&sinp->sin_addr, sizeof(struct in_addr),
				AF_INET, &th, tmpbuf->data, tmpbuf->length,
				&h, &herrno))
	if (herrno == NETDB_INTERNAL && errno == ERANGE)
	    {
	      if (!scratch_buffer_grow (tmpbuf))
		{
		  __set_h_errno (herrno);
		  return EAI_MEMORY;
		}
	    }
	else
	  break;
    }
```

好了，不追下去了，看到while语句块，大概是在这里阻塞了10几20秒。。。