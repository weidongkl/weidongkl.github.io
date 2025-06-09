# Docker 网络 无法连接远程 IP 的问题定位

## 1. 问题背景

在进行镜像构建时，`Dockerfile` 中包含如下命令：
```dockerfile
RUN curl http://<远程IP>:<端口>/something
```
现象如下：

- 宿主机上执行 curl 能正常连接；
- 在执行 docker build 时，报 curl: connection timed out；
- 初步判断是构建过程中容器的网络无法连接到远程 IP。

## 2. 问题分析过程

### 2.1 Docker build 默认网络环境

Docker build 默认使用 Docker 的隔离网络（如 bridge 模式）进行构建。该网络与宿主机隔离，使用 NAT 转发规则与外界通信。容器中 curl 命令失败而宿主机成功，说明问题出在 Docker 的默认网络隔离环境。

### 2.2 使用宿主机网络验证

通过如下命令将容器构建过程改为使用宿主机网络：
```bash
docker build --network=host -t myimage .
```
测试结果显示可以成功连接远程 IP。

结论：容器默认网络无法连通目标 IP，而使用宿主网络可以，问题定位在 Docker 网络配置或转发规则上。

### 2.3 检查 NAT 转发链表（iptables）

`Docker` 使用 `iptables` 管理 NAT 转发规则。如果这些规则丢失，容器无法访问外部网络。

执行命令：
```bash
sudo iptables -t nat -L
```
观察 NAT 表中的链是否存在 `DOCKER`。如 `DOCKER` 链缺失，则说明转发规则未初始化或被清除。

### 2.4 重启 Docker 服务

执行以下命令重启 `Docker` 服务，强制重新加载转发规则：
```bash
sudo systemctl restart docker
```
随后再次检查 `NAT` 表：
```bash
sudo iptables -t nat -L
```
结果显示 `DOCKER` 链已恢复，容器网络规则加载正常。

### 2.5 再次测试容器网络访问

重新执行 `docker build`，容器内可以访问远程 `IP`，说明网络访问已恢复正常。

## 3. 问题总结

| 项目             | 说明 |
|------------------|------|
| 问题现象         | `docker build` 中网络访问失败，宿主机可连接 |
| 原因             | `iptables` 中 `DOCKER chain` 缺失，导致容器网络规则异常 |
| 临时解决方案     | 使用 `--network=host` 参数构建镜像 |
| 根本解决方法     | 重启 `Docker` 服务，恢复 `NAT` 转发规则 |
| 检查命令         | `sudo iptables -t nat -L` |
| 恢复命令         | `sudo systemctl restart docker` |

## 4. 后续建议

### 4.1 切换为 iptables-legacy

在 `RHEL8+`、`openEuler`、`CentOS Stream` 等系统中，默认使用 `nftables`，可能与 Docker 不兼容。建议切换为 `iptables-legacy`：
```bash
sudo alternatives --set iptables /usr/sbin/iptables-legacy
```
### 4.2 检查防火墙和安全策略

确认 `firewalld`、`SELinux` 或其他安全策略未主动清除 `NAT` 表中 `DOCKER` 链。

### 4.3 稳定性建议

如频繁出现该问题，建议将网络策略中对 Docker NAT 链的依赖最小化，或使用自定义网络驱动进行替代。

