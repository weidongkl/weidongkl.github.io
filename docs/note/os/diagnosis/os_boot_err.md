# Linux 启动失败问题排查与修复记录

## 1. 问题描述

系统在启动过程中出现如下错误，无法正常进入用户态：

```text
Failed to switch root: Failed to determine whether root path '/sysroot' contains an OS tree: Input/output error
initrd-switch-root.service: Main process exited, code=exited, status=1/FAILURE
```

系统因此进入 Emergency Mode。

------

## 2. 系统环境

- 内核版本：`4.18.0-500.el8.x86_64`

- 根文件系统：XFS

- 根逻辑卷：`/dev/mapper/weidong-root`

- 启动参数（`/proc/cmdline`）：

  ```text
  root=/dev/mapper/weidong-root ro crashkernel=auto rd.lvm.lv=weidong/root
  ```

------

## 3. 排查过程

这个错误通常由根文件系统挂载失败导致。常见原因可能是：

- 根分区设备标识错误（UUID/LABEL 不匹配）

- 根文件系统损坏

- 存储设备未正常识别（驱动缺失或硬件问题）

- LVM/RAID/加密卷未解锁或未激活

### 3.1 查看分区挂载情况

```bash
lsblk -f
```

确认 `weidong-root` 存在，文件系统为 `xfs`，但尝试访问 `/sysroot` 报错：

```bash
ls /sysroot
# 报错：Input/output error
```

如果是一个正常的 Linux 系统根目录，应该包含 `etc`, `bin`, `lib`, `usr`, `var` 等目录。

尝试 `cd`、`file` 也失败，提示 “Not a directory”。

### 3.2 尝试挂载根分区

```bash
mount /dev/mapper/weidong-root /sysroot
# 提示已经挂载或 I/O 错误
```

### 3.3 文件系统检查尝试

尝试使用 `fsck` 报错不支持：

```bash
fsck /sysroot
# fsck.ext2: No such file or directory
```

改用 XFS 工具：

```bash
xfs_repair /dev/mapper/weidong-root
# 报错：Device or resource busy
```

说明该设备正被系统占用。

出现 `cd /sysroot: Not a directory` 和 I/O error，极大可能是根文件系统损坏或设备发生硬件层错误。

当前无法运行 `xfs_repair` 的原因是设备 busy。

------

## 4. 解决方案

### 4.1 方法一：在 Emergency Shell 修复

1. 卸载 `/sysroot`：

   ```bash
   umount -l /sysroot
   ```

2. 执行文件系统修复：

   ```bash
   xfs_repair /dev/mapper/weidong-root
   ```

3. 修复完成后重新挂载验证：

   ```bash
   mount /dev/mapper/weidong-root /sysroot
   ls /sysroot
   ```

4. 如果目录结构正常，可直接重启：

   ```bash
   reboot
   ```

### 4.2 方法二：使用 LiveCD 修复（推荐）

1. 启动进入 LiveCD（如 RHEL、CentOS、openEuler 安装盘）。

2. 激活 LVM 卷组：

   ```bash
   lvm vgchange -ay
   ```

3. 卸载已有挂载点：

   ```bash
   umount -l /mnt/sysroot
   ```

4. 修复文件系统：

   ```bash
   xfs_repair /dev/mapper/weidong-root
   ```

5. 验证挂载：

   ```bash
   mount /dev/mapper/weidong-root /mnt
   ls /mnt
   ```

6. 可选：若需修复引导或更新 initramfs：

   ```bash
   mount --bind /dev /mnt/dev
   mount --bind /proc /mnt/proc
   mount --bind /sys /mnt/sys
   chroot /mnt
   dracut -f
   ```

7. 重启系统：

   ```bash
   reboot
   ```

------

## 5. 总结与建议

- 本次故障由 `/dev/mapper/weidong-root` 使用的 XFS 文件系统损坏引起，导致 `/sysroot` 无法识别为有效的操作系统根路径。

- 推荐使用 `xfs_repair` 进行修复，前提是设备未被占用。

- 建议定期检测磁盘健康：

  ```bash
  smartctl -a /dev/sda
  ```

- 若发现大量 `I/O error`、`buffer error` 等内核日志，建议尽早备份数据并更换硬盘。


