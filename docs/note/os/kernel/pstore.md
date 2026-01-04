# pstore 

## 1. 概述

在服务器与 Linux 系统稳定性分析中，**系统异常重启、内核 panic/oops** 往往发生在现场不可复现的环境中。为了在系统重启后仍能获取关键内核日志，Linux 内核提供了 **pstore（Persistent Storage）** 机制。

本文目标：

- 系统性说明 pstore 的工作机制与能力边界
- 对比主流 pstore backend 的适用场景
- 给出 **ramoops 的工程级落地方案**
- 总结常见误区与排障思路，形成可复用实践文档

------

## 2. pstore 是什么

pstore 是 Linux 内核中的一个**崩溃日志持久化框架**，用于在以下场景中保存关键内核信息，并在下次启动后提供给用户态读取：

- kernel panic
- kernel oops
- 部分平台上的 emergency restart

pstore 会在系统再次启动后，将持久化的数据通过一个伪文件系统暴露：

```
/sys/fs/pstore
```

### 2.1 pstore 能保存什么

常见记录类型包括：

- `dmesg-*`：panic / oops 时的内核日志
- `console-*`：控制台输出
- `ftrace-*`：函数跟踪数据（较少使用）
- `pmsg-*`：用户态通过 pstore 接口主动写入的数据

### 2.2 pstore 的能力边界（重要）

- pstore **不是实时日志系统**
- pstore **不等同于 kdump**
- 正常的 `reboot` / `shutdown` **不会产生 pstore 日志**

触发语义总结：

| 场景                         | 是否产生 pstore 记录 |
| ---------------------------- | -------------------- |
| kernel panic                 | 是                   |
| kernel oops                  | 是                   |
| echo c > /proc/sysrq-trigger | 是                   |
| 正常 reboot                  | 否                   |
| poweroff                     | 否                   |

------

## 3. pstore 架构与工作模型

pstore 本身不提供存储能力，而是一个 **框架层（core）+ 后端驱动（backend）** 的模型。

```
+---------------------+
|  pstore core        |
|  (何时写 / 写什么)  |
+----------+----------+
           |
           v
+---------------------+
|  backend driver     |
|  efi / erst / ram   |
+----------+----------+
           |
           v
+---------------------+
|  persistent medium  |
|  NVRAM / FW / RAM   |
+---------------------+
```

工作流程：

1. 内核启动阶段初始化 pstore core
2. 探测并绑定一个可用 backend
3. 系统发生 panic / oops 时写入数据
4. 下次启动时挂载 pstore FS
5. 用户态从 `/sys/fs/pstore` 读取日志

**关键结论**：

> pstore 是否可用，完全取决于 backend 是否成功初始化。

------

## 4. pstore backend 选型总览

| backend | 依赖       | 典型环境   | 断电后保留 | 工程常见度   |
| ------- | ---------- | ---------- | ---------- | ------------ |
| efi     | UEFI NVRAM | VM / PC    | 部分       | 中           |
| erst    | ACPI ERST  | 物理服务器 | 是         | 高（服务器） |
| ramoops | 预留内存   | VM / 裸机  | 否         | 非常高       |

------

## 5. EFI pstore

### 5.1 机制说明

EFI pstore 使用 **UEFI Runtime Variable（NVRAM）** 保存日志。

特点：

- 实现简单
- 不需要预留内存
- 单条记录与总容量都较小
- NVRAM 写入次数有限

适用场景：

- 虚拟机
- 无 ERST 支持的平台
- 调试或开发环境

不适用场景：

- 高频 panic
- 大规模日志留存

### 5.2 内核与启动配置

内核配置：

```
CONFIG_PSTORE=y
CONFIG_EFI=y
CONFIG_EFI_VARS=y
CONFIG_EFI_VARS_PSTORE=y
```

启动参数：

```
pstore.backend=efi
```

### 5.3 运行态验证

```
dmesg | grep -i pstore
```

期望：

```
pstore: using EFI persistent storage
```

------

## 6. ERST pstore

### 6.1 机制说明

ERST（Error Record Serialization Table）是 ACPI APEI 规范的一部分，由 BIOS / 固件实现。

特点：

- 存储由平台固件管理
- 容量相对充足
- **断电后仍可保留数据**
- 主要存在于服务器级硬件

> ERST 是唯一真正意义上“跨断电可靠”的 pstore backend。

### 6.2 内核与环境要求

```
CONFIG_PSTORE=y
CONFIG_ACPI_APEI=y
CONFIG_ACPI_APEI_ERST=y
CONFIG_PSTORE_ERST=y
```

检测方式：

```
ls /sys/firmware/acpi/tables | grep ERST
```

### 6.3 初始化验证

```
dmesg | grep -i erst
```

期望：

```
pstore: using ACPI ERST
```

------

## 7. ramoops

ramoops 通过**预留一段物理内存**模拟持久化存储，是最通用、最可控的 pstore backend。

### 7.1 特点与适用场景

特点：

- 不依赖 BIOS / 固件
- 适用于 VM / 裸机 / CI
- 配置灵活
- 断电后数据丢失

适合：

- panic / oops 定位
- 内核开发
- 自动化测试环境

------

### 7.2 ramoops 内存预留原则

预留内存必须满足：

- 真实物理地址
- 连续
- 启动早期可用
- 不被 buddy / slab 管理

**工程推荐策略**：

1. 优先复用已有 ramoops 预留区
2. 否则：
   - 从 `/proc/iomem` 中选择一段较大的 `System RAM`
   - 从该段尾部划出 **2MB**
   - 使用 `memmap` 标记为 reserved

不推荐：

- 随机选择地址
- 覆盖 `crashkernel`
- 覆盖 firmware / device memory

------

### 7.3 memmap 配置（只负责预留内存）

```
memmap=0x200000!0xXXXXXXXX
```

RHEL 示例：

```
grubby --update-kernel=ALL \
  --args="memmap=0x200000!0xXXXXXXXX"
```

> memmap 只做一件事：**阻止内核使用该段内存**。

------

### 7.4 ramoops 模块参数配置

`/etc/modprobe.d/ramoops.conf`：

```
options ramoops \
  mem_address=0xXXXXXXXX \
  mem_size=0x200000 \
  record_size=0x2000
```

并确保模块自动加载：

```
echo ramoops > /etc/modules-load.d/ramoops.conf
```

------

### 7.5 生效流程

1. 配置 memmap
2. 配置 ramoops 参数
3. reboot
4. ramoops 加载并绑定 pstore
5. pstore FS 挂载

------

### 7.6 运行态验证

```
dmesg | grep -i pstore
ls /sys/fs/pstore
```

期望：

```
pstore: using ramoops backend
```

------

### 7.7 常见问题分析

| 现象           | 原因                |
| -------------- | ------------------- |
| 启动卡死       | memmap 覆盖关键内存 |
| 无 pstore 文件 | 内存未成功预留      |
| 文件存在但为空 | 未发生 panic / oops |
| 日志很小       | record_size 过小    |
| 每次覆盖       | mem_size 不足       |

------

## 8. 使用与测试

### 8.1 查看 pstore

```
mount | grep pstore
ls /sys/fs/pstore
```

### 8.2 模拟 panic（测试用）

```
echo c > /proc/sysrq-trigger
```

重启后检查 pstore 目录。

------

## 9.  总结

pstore 是定位 Linux 内核异常重启的重要基础设施。工程实践中：

- **服务器优先 ERST**
- **通用环境首选 ramoops**
- 明确触发语义，避免误判

合理配置后，pstore 可以在绝大多数 panic 场景下提供第一手证据。
