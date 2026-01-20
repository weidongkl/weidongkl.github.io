# Linux Bridge Networking

## 1. What Is Linux Bridge?

**Linux Bridge（网桥）** 是 Linux 内核中实现的 **二层（Layer 2）虚拟交换机**。

- 工作在 **数据链路层（Ethernet）**
- 依据 **MAC 地址** 转发数据帧
- 行为类似于物理交换机（Switch）

> Linux Bridge = 内核里的二层交换机

------

## 2. Why Linux Bridge?

典型需求：

- 多个 **网络命名空间（Namespace）/ 容器 / 虚拟机** 互通
- 将虚拟网络接入宿主机物理网络
- 模拟局域网（二层广播域）

对比：

| 方案              | 层级  | 特点                 |
| ----------------- | ----- | -------------------- |
| Linux Bridge      | L2    | 简单、稳定、支持广播 |
| veth pair         | L2    | 点对点，不是交换     |
| Router / ip route | L3    | 需要 IP 路由         |
| OVS               | L2/L3 | 更复杂，支持 SDN     |

------

## 3. Core Components

一个 Linux Bridge 网络，至少包含：

```
[ veth / eth ] ─┐
[ veth / tap ] ─┼── br0 (bridge)
[ veth / eth ] ─┘
```

核心对象：

| 组件          | 作用               |
| ------------- | ------------------ |
| bridge（br0） | 虚拟交换机         |
| port          | 接入 bridge 的网卡 |
| FDB           | MAC → port 转发表  |

------

## 4. Basic Usage

### 1️⃣ 创建 bridge

```bash
ip link add br0 type bridge
ip link set br0 up
```

### 2️⃣ 创建 veth pair

```bash
ip link add veth-a type veth peer name veth-b
```

### 3️⃣ 接入 bridge

```bash
ip link set veth-a master br0
ip link set veth-a up
ip link set veth-b up
```

> veth-b 通常会被放入 namespace / 容器中

------

## 5. Frame Forwarding Mechanics

### 1️⃣ FDB（Forwarding Database）

Bridge 内核维护一张表：

```
MAC Address  →  Port
```

- **学习（Learning）**：
  - 收到帧，记录 `src MAC → ingress port`
- **转发（Forwarding）**：
  - 查 `dst MAC`
  - 命中 → 单播
  - 未命中 → 泛洪（flood）

### 2️⃣ 广播 / 未知单播

- ARP
- DHCP
- 未学习到 MAC

👉 会 **向除入端口外的所有 port 转发**

------

## 6. End-to-End Frame Path

以容器 A ping 容器 B 为例：

```
container A
  ↓ veth
host namespace
  ↓ bridge br0
  ↓ 查 FDB
  ↓ veth
container B
```

内核路径（简化）：

```
br_handle_frame()
  ├─ br_fdb_update()
  ├─ br_fdb_find()
  ├─ br_forward()
```

------

## 7. Relationship with Layer 3 (IP)

⚠️ **Bridge 本身不关心 IP**

- 只处理 Ethernet frame
- IP / TCP / UDP 是 payload

但：

- 可以给 bridge 配 IP（三层网关）

```bash
ip addr add 192.168.1.1/24 dev br0
```

用途：

- 宿主机 ↔ 容器通信
- bridge 作为默认网关

------

## 8. Spanning Tree Protocol (STP)

### 为什么需要 STP？

- 多 bridge / 多链路
- 防止二层环路

### 启用 STP

```bash
ip link set br0 type bridge stp_state 1
```

> Docker 默认关闭 STP（拓扑简单）

------

## 9. Linux Bridge vs Open vSwitch

| 对比项 | Linux Bridge | Open vSwitch    |
| ------ | ------------ | --------------- |
| 复杂度 | 低           | 高              |
| 性能   | 好           | 更好（DPDK）    |
| 可编程 | 少           | 强（OpenFlow）  |
| 云原生 | 基础         | 主流（K8s/SDN） |

------

## 10. Containers: Docker / Podman

### Docker bridge 网络

```bash
docker network create mynet
```

本质：

- 创建一个 `br-xxxx`
- 容器通过 veth 接入
- Docker 管理 IPAM + iptables

### 端口是否冲突？

❌ **不会**（容器内部端口隔离）

冲突只发生在：

- `-p 8080:80`
- 映射到宿主机端口

------

## 11. Bridge and Netfilter

默认情况：

- L2 流量 **不走 iptables**

开启 bridge-nf：

```bash
sysctl net.bridge.bridge-nf-call-iptables=1
```

用途：

- Kubernetes
- CNI 网络策略

------

## 12. Common Questions

### Q1：Bridge 是用户态还是内核态？

✅ 内核态（net/bridge）

### Q2：性能瓶颈？

- FDB 查找
- 广播泛洪
- iptables / conntrack

### Q3：一个 bridge 多大规模？

- 几百到上千端口可行
- 超大规模 → OVS / SDN

------

## 13. Debugging Cheat Sheet

```bash
bridge link           # 查看端口
bridge fdb show       # MAC 表
ip -d link show br0   # bridge 详细信息
brctl show            # 传统工具
```

------

## 14. One-Sentence Summary

> **Linux Bridge 是内核里的二层交换机，通过 veth/tap 把 namespace、容器、虚拟机连接成一个虚拟局域网。**

------

## 15. Teaching Diagrams

### 图 1：Bridge + veth + namespace 拓扑图

```
+-------------------+        +-------------------+
|   container A    |        |   container B    |
|  netns A         |        |  netns B         |
|   eth0           |        |   eth0           |
+----|--------------+        +-------|-----------+
     | veth-a                        | veth-b
     |                               |
---------------- host namespace -----------------
     |                               |
     |        +-----------------+    |
     +--------|     br0         |----+
              |  Linux Bridge   |
              +-----------------+
```

要点：

- Bridge 只看 **MAC**
- 所有 veth 端口处于同一二层广播域

------

### 图 2：单个数据帧的内核转发路径

```
NIC / veth RX
   ↓
br_handle_frame()
   ↓ 学习 src MAC
br_fdb_update()
   ↓ 查找 dst MAC
br_fdb_find()
   ↓
命中 → br_forward()
未知 → br_flood()
```

------

## 16. Teaching Demo: Mini Docker Bridge

> 目标：不用 Docker / Podman，只用 ip 命令，理解 bridge 网络

### Step 1：创建 bridge

```bash
ip link add br-demo type bridge
ip link set br-demo up
```

### Step 2：创建两个 namespace

```bash
ip netns add ns1
ip netns add ns2
```

### Step 3：创建 veth 并接入 bridge

```bash
ip link add veth1 type veth peer name veth1-br
ip link add veth2 type veth peer name veth2-br

ip link set veth1 netns ns1
ip link set veth2 netns ns2

ip link set veth1-br master br-demo
ip link set veth2-br master br-demo

ip link set veth1-br up
ip link set veth2-br up

ip netns exec ns1 ip link set lo up
ip netns exec ns2 ip link set lo up
```

### Step 4：配置 IP

```bash
ip netns exec ns1 ip addr add 10.0.0.2/24 dev veth1
ip netns exec ns2 ip addr add 10.0.0.3/24 dev veth2

ip netns exec ns1 ip link set veth1 up
ip netns exec ns2 ip link set veth2 up
```

### Step 5：验证

```bash
ip netns exec ns1 ping 10.0.0.3
bridge fdb show br-demo
```

你已经复刻了：

> **Docker bridge 网络的 80% 本质**

------

## 17. Bridge / OVS / macvlan / ipvlan Comparison

### 1️⃣ 总览对比表

| 方案         | 工作层 | 是否二层 | 是否广播 | 典型场景     |
| ------------ | ------ | -------- | -------- | ------------ |
| Linux Bridge | L2     | ✅        | ✅        | Docker / VM  |
| Open vSwitch | L2/L3  | ✅        | ✅        | K8s / 云网络 |
| macvlan      | L2     | ✅        | ❌        | 高性能直通   |
| ipvlan       | L3     | ❌        | ❌        | 大规模容器   |

------

### 2️⃣ Linux Bridge

优点：

- 简单、稳定、内核原生
- 支持广播、ARP、DHCP

缺点：

- 广播风暴风险
- 可编程性弱

适合：

- 单机容器
- 教学 / 学习网络原理

------

### 3️⃣ Open vSwitch（OVS）

```
veth → ovs datapath → flow table → action
```

特点：

- Flow-based forwarding
- OpenFlow / eBPF / DPDK

适合：

- Kubernetes CNI
- 云厂商 VPC

一句话：

> Bridge 的「可编程 + 工业级版本」

------

### 4️⃣ macvlan

```
eth0
 ├─ macvlan A (独立 MAC)
 ├─ macvlan B
```

特点：

- 每个容器一个 MAC
- **绕过 bridge**

限制：

- 父接口无法和子接口通信（默认）

适合：

- 极致性能
- 直连物理网络

------

### 5️⃣ ipvlan

```
eth0 (一个 MAC)
 ├─ ipvlan A (IP 区分)
 ├─ ipvlan B
```

特点：

- 不学习 MAC
- 依赖 L3 转发

适合：

- 大规模容器
- 云原生高密度节点

------

## 18. Selection Summary

- 🧪 学习 / 教学：**Linux Bridge**
- 🐳 Docker 默认：**Linux Bridge**
- ☁️ 云 / K8s：**OVS / eBPF CNI**
- 🚀 极致性能：**macvlan / ipvlan**

