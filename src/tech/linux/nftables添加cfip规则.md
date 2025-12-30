---
date: 2025-12-30 10:55:00
category:
  - Linux
tag:
 - Linux
 - Nftables
---

# nftables添加cfip规则

拉取cf ip写入到配置文件, 不存在`/etc/nftables.d`先手动mkdir创建一下

```sh
#!/usr/bin/env sh
set -eu

DIR="/etc/nftables.d"
OUT4="${DIR}/cf-set-v4.nft"
OUT6="${DIR}/cf-set-v6.nft"

mkdir -p "$DIR"

tmp4="$(mktemp)"
tmp6="$(mktemp)"

# v4 set block
{
  echo "set cf_ipv4 {"
  echo "        type ipv4_addr;"
  echo "        flags interval;"
  echo "        elements = {"
  curl -fsSL https://www.cloudflare.com/ips-v4 \
    | awk 'NF{print "                " $0 ","}'
  echo "        }"
  echo "}"
} > "$tmp4"

# v6 set block
{
  echo "set cf_ipv6 {"
  echo "        type ipv6_addr;"
  echo "        flags interval;"
  echo "        elements = {"
  curl -fsSL https://www.cloudflare.com/ips-v6 \
    | awk 'NF{print "                " $0 ","}'
  echo "        }"
  echo "}"
} > "$tmp6"

install -m 0644 "$tmp4" "$OUT4"
install -m 0644 "$tmp6" "$OUT6"
rm -f "$tmp4" "$tmp6"
```



生成的配置文件类似

```
set cf_ipv4 {
        type ipv4_addr;
        flags interval;
        elements = {
                173.245.48.0/20,
                103.21.244.0/22,
                103.22.200.0/22,
                103.31.4.0/22,
                141.101.64.0/18,
                108.162.192.0/18,
                190.93.240.0/20,
                188.114.96.0/20,
                197.234.240.0/22,
                198.41.128.0/17,
                162.158.0.0/15,
                104.16.0.0/13,
                104.24.0.0/14,
                172.64.0.0/13,
                131.0.72.0/22,
        }
}
```





修改`/etc/nftables.conf`

```
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
        include "/etc/nftables.d/cf-set-v4.nft"
        include "/etc/nftables.d/cf-set-v6.nft"

        chain input {
                type filter hook input priority filter;
                iif lo accept;
                ct state established,related accept;

                # SSH
                tcp dport 22 accept;
                
                # ---- HTTP 80 only Cloudflare ----
                tcp dport 80 ip  saddr @cf_ipv4 accept;
                tcp dport 80 ip6 saddr @cf_ipv6 accept;
                tcp dport 80 drop;
        }

        chain forward {
                type filter hook forward priority filter;
        }

        chain output {
                type filter hook output priority filter;
        }
}
```



使其生效

```bash
nft -f /etc/nftables.conf
```



 检查规则集合是否正确

```bash
nft list set inet filter cf_ipv6
nft list set inet filter cf_ipv4
```



检查nftables是否启动

```bash
systemctl status nftables
systemctl enable nftables
systemctl restart nftables
```

