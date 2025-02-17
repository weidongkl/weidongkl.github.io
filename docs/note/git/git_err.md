# git 错误

## 1. tls 连接错误

#### 报错如下：

```bash
gnutls_handshake() failed: The TLS connection was non-properly terminated.
```

#### 解决方法：

关闭代理设置

```bash
unset all_proxy
unset http_proxy
unset https_proxy
```

#### 排查方法：

报错是tls相关，猜测原因如下：

1. 证书问题：过期。。。
2. 协议或加密套不匹配
3. 网络问题

**证书问题排查：**

1. 通过浏览器查看证书信息，看证书是否受信任。
2. 使用`openssl s_client -connect <server>:<port> -showcerts` 查看证书信息

**设置调试日志排查**

启用GnuTLS 的调试日志，查看详细的握手过程：

```bash
export GNUTLS_DEBUG_LEVEL=3
# 使用`gnutls-cli -p <port> <server> -V` 
```

**通过关闭ssl认证测试是否可以下载**

```bash
GIT_SSL_NO_VERIFY=1 git clone http:gitrepo
```

**通过关闭所有代理，测试是否是代理导致的网络问题**

显示关闭代理可以下载。也可以通过ssh来下载。ssh可以规避该问题。

