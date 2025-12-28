# 普通用户执行 `mount` 的方法

## 1. 为什么认为 mount 需要 root

在 **不使用命名空间（namespace）** 的情况下：

- `mount(2)` 需要 `CAP_SYS_ADMIN`
- `CAP_SYS_ADMIN` 仅宿主机 `root` 拥有
- 普通用户执行 `mount` → `EPERM`

示例：

```bash
$ mount -t proc proc /mnt
mount: permission denied
```

这一结论在 **传统 Linux 环境中是完全正确的**。

------

## 2. 关键转折：user namespace 的引入

Linux 从 3.8 起引入 **user namespace**，它带来了一个根本变化：

> **权限（capability）被限定在 namespace 内部，而不是全局**

### user namespace 的核心语义

- 每个 user namespace 有自己的：
  - UID / GID 视图
  - capability 集合
- 在 **user namespace 内 UID=0 的进程**：
  - 被视为 `root`
  - 拥有该 namespace 内的 `CAP_SYS_ADMIN`

⚠️ 注意：
**这些权限不会逃逸到宿主机**

------

## 3. 普通用户 mount 的必要条件

普通用户想要成功执行 `mount`，必须满足 **以下条件**：

### 3.1 必须在 user namespace 中

```text
CLONE_NEWUSER
```

并且：

- 将当前用户映射为 namespace 内的 `uid=0`
- 获得 namespace 内的 capabilities

------

### 3.2 必须在 mount namespace 中

```text
CLONE_NEWNS
```

原因：

- mount 操作会修改 mount table
- 不允许普通用户修改 **宿主机 mount namespace**

------

### 3.3 mount 必须发生在 namespace 内

完整逻辑：

```
宿主机普通用户
  ↓ clone(CLONE_NEWUSER | CLONE_NEWNS)
namespace 内：
  uid = 0
  CAP_SYS_ADMIN (namespace 内)
  mount(...)
```

------

## 4. Go 示例：[普通用户成功 mount 的最小代码](./mount.go)

```go
cmd.SysProcAttr = &syscall.SysProcAttr{
    Cloneflags: syscall.CLONE_NEWUSER | syscall.CLONE_NEWNS,

    UidMappings: []syscall.SysProcIDMap{
        {
            ContainerID: 0,
            HostID:      os.Getuid(),
            Size:        1,
        },
    },

    GidMappingsEnableSetgroups: false,
    GidMappings: []syscall.SysProcIDMap{
        {
            ContainerID: 0,
            HostID:      os.Getgid(),
            Size:        1,
        },
    },
}
```

在子进程中：

```go
unix.Mount("proc", "/proc", "proc", 0, "")
```

✔️ 普通用户可成功执行
✔️ 只影响当前 namespace
✔️ 不污染宿主机

------

## 5. 哪些 mount 可以成功？

在 **user namespace + mount namespace** 中，内核对 mount 进行了限制。

### 5.1 通常允许的 mount 类型

| 类型                           | 说明                                    |
| ------------------------------ | --------------------------------------- |
| `proc`                         | 专门为 namespace 设计的内核虚拟文件系统 |
| `tmpfs`                        | 基于内存的文件系统，无设备文件          |
| bind mount（用户有权限的路径） | 路径级别映射，不创建新文件系统          |
| `sysfs`（部分内核）            | 内核控制接口文件系统，强受限            |
| **Union / Overlay filesystem** | 多目录合并的联合文件系统，特权敏感      |

示例：

```go
unix.Mount("tmpfs", "/tmp", "tmpfs", 0, "")
```

------

### 5.2 明确禁止的 mount

| mount 类型                | 原因                     |
| ------------------------- | ------------------------ |
| block device (`/dev/sda`) | 需要宿主机 CAP_SYS_ADMIN |
| NFS / CIFS                | 特权操作                 |
| 宿主机任意路径（无权限）  | VFS 权限检查             |

内核执行 **双重校验**：

1. namespace 内 capability
2. 文件系统 / VFS 权限

------

## 6. 常见失败原因排查

### 6.1 user namespace 被禁用

```bash
sysctl kernel.unprivileged_userns_clone
```

必须为：

```text
kernel.unprivileged_userns_clone = 1
```

------

### 6.2 未创建新的 mount namespace

```go
Cloneflags: CLONE_NEWNS  // 必须
```

否则 mount 发生在宿主 namespace → `EPERM`

------

### 6.3 LSM 限制

- SELinux
- AppArmor
- Android / ChromeOS

这些系统可能显式禁止 unprivileged mount。

------

## 7. 现实世界中的应用

该机制正是以下技术的基础：

- bubblewrap (bwrap)
- Flatpak
- rootless Docker / Podman
- rootless container
- 沙箱执行器 / 安全运行时

本质模式：

```text
普通用户
 → user namespace (root)
 → mount namespace
 → mount proc / tmpfs / bind
```

------

## 8. 总结

> **不是“普通用户可以 mount”**
> **而是“普通用户在 user namespace 中作为 root，可以 mount”**

这是 Linux namespace 设计中 **最关键、也最容易被误解的一点**。

