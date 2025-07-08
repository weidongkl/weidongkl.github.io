# Linux 无法访问网址排查方法

当一台机器无法访问某个网址时，可按以下步骤进行系统化定位，从 DNS 到服务端逐层排查问题。

---

## 1. 检查网络连通性

### 1.1 确认 DNS 是否正常解析

```bash
nslookup example.com
dig example.com +short
```

* 若失败，尝试指定公共 DNS：

  ```bash
  nslookup example.com 8.8.8.8
  ```

* 检查系统配置：

  ```bash
  cat /etc/resolv.conf
  ```

### 1.2 测试 IP 连通性

先获取解析到的 IP，再测试连接：

```bash
ping <目标IP>
curl -v http://<目标IP>  # 绕过域名测试
```

* 若 IP 能 ping 通而域名不通 → DNS 问题或 Host 头配置错误
* 若 IP 也无法连通 → 网络中断或被防火墙拦截

### 1.3 路由路径追踪

通过路由追踪工具观察网络路径是否中断：

```bash
traceroute example.com         # 基本路由追踪
mtr -n example.com             # 实时、图形化路由分析（需安装）
```

* 若中间跳数卡住或超时，可能是：

  * 中间网络节点故障
  * 某跳存在防火墙丢包
  * 目标服务部署在云服务中禁止 ICMP

---

## 2. 检查服务端端口与协议

### 2.1 测试目标端口是否开放

```bash
telnet example.com 80     # HTTP
telnet example.com 443    # HTTPS
# 或使用 nc（推荐）
nc -zv example.com 80
nc -zv example.com 443
```

* 连接失败可能是：

  * 服务端未监听该端口
  * 中间网络路径或本机出站防火墙阻断

### 2.2 模拟 Web 请求并调试

```bash
curl -v http://example.com
curl -vk https://example.com    # 忽略 HTTPS 证书验证
wget --debug http://example.com
```

* 常见错误提示及原因：

  | 错误信息                    | 可能原因      |
  | ----------------------- | --------- |
  | Could not resolve host  | DNS 解析失败  |
  | Connection refused      | 服务未监听或被拦截 |
  | Connection timed out    | 网络或防火墙问题  |
  | SSL certificate problem | 证书无效或过期   |

---

## 3. 检查本地代理、路由、防火墙配置

### 3.1 检查代理设置

```bash
env | grep -i proxy
```

* 若不希望通过代理访问：

  ```bash
  unset http_proxy https_proxy
  ```

### 3.2 查看防火墙规则和网络路由

```bash
sudo iptables -L -n
sudo firewall-cmd --list-all  # RHEL/CentOS 系
ip route show                 # 路由表
```

### 3.3 路由追踪（重复用于排查路由变化）

若前面未执行 `traceroute`，此处也可以执行：

```bash
traceroute example.com
```

---

## 4. 服务端状态与网络策略

### 4.1 判断服务是否宕机

使用第三方站点检测服务端可用性：

```bash
curl https://downforeveryoneorjustme.com/example.com
```

### 4.2 测试是否本地网络被屏蔽

* 换用手机热点、VPN 或其他网络测试是否可以访问
* 企业网络或运营商可能屏蔽了部分站点或端口

---

## 5. 高级诊断工具

### 5.1 网络抓包分析

```bash
sudo tcpdump -i any host example.com -w capture.pcap
```

* 用 Wireshark 打开 `.pcap` 文件

  * 看 DNS 查询是否成功
  * 看 TCP 是否三次握手成功
  * 看是否存在 RST、ICMP 错误等

### 5.2 检查 HTTPS 证书有效性

```bash
openssl s_client -connect example.com:443 -showcerts
```

* 验证证书链、证书是否过期、是否为目标域名颁发

---

## 6. 更多

### 6.1 常见问题排查汇总表

| **现象**          | **可能原因**           | **建议解决方案**                         |
| --------------- | ------------------ | ---------------------------------- |
| 无法解析域名          | DNS 配置错误/运营商污染     | 更换为公共 DNS，如 8.8.8.8，检查 resolv.conf |
| ping 通但 curl 超时 | 服务端未监听端口/HTTP 服务异常 | 检查目标服务状态或网络防火墙规则                   |
| HTTPS 证书报错      | 证书过期/域名不匹配         | 查看证书详情，必要时加 `-k` 忽略（临时方案）          |
| 企业网络访问失败        | 网络策略限制/HTTPS 检查    | 切换网络、使用 VPN 或 Shadowsocks 测试       |

---

### 6.2 快速修复方法

1. **切换浏览器或设备**（排除缓存或用户配置）

2. **重启网络服务**

   ```bash
   sudo systemctl restart NetworkManager  # RHEL/CentOS 7+
   ```

3. **刷新 DNS 缓存**

   ```bash
   sudo systemd-resolve --flush-caches    # systemd
   sudo dscacheutil -flushcache           # macOS
   ```

---

### 6.3 快速排查脚本

```bash
#!/bin/bash
domain=$1
ip=$(dig +short $domain | head -n1)

echo "🔍 检查 DNS"
dig $domain +short || exit 1

echo "📡 Ping 测试: $ip"
ping -c 4 $ip || echo "❌ Ping 失败"

echo "🧭 路由追踪"
traceroute $domain || echo "❌ Traceroute 失败"

echo "📦 Curl 测试"
curl -v --max-time 5 http://$domain || echo "❌ Curl 请求失败"

echo "🔗 端口检查"
nc -zv $domain 80
nc -zv $domain 443
```
