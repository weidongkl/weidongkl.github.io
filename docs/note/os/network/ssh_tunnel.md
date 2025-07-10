# ssh反向隧道让隔离主机外网

## 1. 场景描述与目标

| 角色             | 网络状态                          |
| ---------------- | --------------------------------- |
| 机器 A（跳板机） | 可访问互联网，可通过 SSH 连接到 B |
| 机器 B（隔离机） | 无法访问互联网，无法主动连接 A    |

目标：让 B 能访问外网（如 curl、yum、apt、wget 可用），通过 A 的网络代理出网。

***

## 2. 方法概览（SSH 反向 SOCKS5 隧道）

思路：

1.  在机器 A 上运行本地 SOCKS5 代理；
2.  通过 SSH 将 A 的代理端口反向转发给 B；
3.  在 B 上配置本地 `localhost:1080` 为 SOCKS5 代理访问外网。

***

## 3. 手动方式（临时测试用）

### 3.1 A 上运行本地 SOCKS5 代理

```bash
ssh -q -N -D 1080 localhost
```

监听本地 `127.0.0.1:1080`，提供 SOCKS5 服务。

### 3.2 A 上建立反向 SSH 隧道到 B

```bash
ssh -fNT -R 1080:localhost:1080 user@B_IP
```

含义：

*   B 的 1080 → A 的 localhost:1080；
*   B 上的 `localhost:1080` 实际就是 A 上的代理服务。

### 3.3 B 上测试访问

```bash
curl -x socks5://localhost:1080 http://ip.sb
```

或设置环境变量：

```bash
export http_proxy="socks5://localhost:1080"
export https_proxy="socks5://localhost:1080"
```

如成功，应输出 A 的公网 IP。

***

## 4. 自动化部署脚本与服务

### 4.1 脚本 `/etc/ssh-tunnel/reverse-socks-tunnel.sh`

```bash
#!/bin/bash

REMOTE_USER="buser"
REMOTE_HOST="192.168.100.2"
REMOTE_PORT="1080"
LOCAL_SOCKS_PORT="1080"

if ! pgrep -f "ssh -D ${LOCAL_SOCKS_PORT}" >/dev/null; then
    nohup ssh -q -N -D ${LOCAL_SOCKS_PORT} localhost >/dev/null 2>&1 &
fi

sleep 1

autossh -M 0 -fNT -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \
    -R ${REMOTE_PORT}:localhost:${LOCAL_SOCKS_PORT} \
    ${REMOTE_USER}@${REMOTE_HOST}
```

### 4.2 systemd 服务 `/etc/systemd/system/ssh-reverse-tunnel.service`

```ini
[Unit]
Description=SSH Reverse SOCKS5 Tunnel to Machine B
After=network.target

[Service]
ExecStart=/etc/ssh-tunnel/reverse-socks-tunnel.sh
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target
```

### 4.3 启动服务

```bash
chmod +x /etc/ssh-tunnel/reverse-socks-tunnel.sh
systemctl daemon-reexec
systemctl enable --now ssh-reverse-tunnel.service
```

***

## 5. 常见错误排查

| 问题                                                        | 原因                               | 解决方法                                                     |
| ----------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| curl: (7) Unable to receive initial SOCKS5 response         | A 未运行 SOCKS5 或隧道未连通       | 检查是否启动 `ssh -D`、是否建立 `-R` 隧道                    |
| B 无法连接 localhost:1080                                   | 隧道未建立成功或已断开             | 用 \`ss -tnlp                                                |
| A 本地 SOCKS5 失败                                          | 端口冲突或 ssh 命令错误            | 用 `pgrep -af "ssh -D"` 检查代理是否正常运行                 |
| Warning: remote port forwarding failed for listen port 1080 | 远程端口被占用/sshd 配置不允许转发 | 端口占用可切换端口/sshd 配置可以打开如下配置，允许转发：<br />`GatewayPorts yes`<br />` AllowTcpForwarding yes` |

***

## 6. 安全建议

*   在 B 的 `sshd_config` 中限制允许 SSH 用户；
*   使用专用用户仅用于隧道转发；
*   可启用公钥认证，禁用密码登录。

***

## 7. 拓展建议

*   在 B 上安装 `proxychains` 使任意命令走代理；
*   使用 `redsocks` + `iptables` 将系统流量透明转发至 SOCKS5；
*   可用 VPN 替代 SSH 隧道（如 Tailscale、Zerotier）实现全网互通。