# Linux系统触发异常重启的方法

## 1.  核心方法概览

| 方法类别     | 具体手段                   | 权限要求  | 风险等级 | 适用场景            |
| ------------ | -------------------------- | --------- | -------- | ------------------- |
| **内核崩溃** | SysRq触发、内核模块panic   | root      | 高       | kdump测试、内核调试 |
| **系统调用** | reboot()系统调用、kill信号 | root/user | 中高     | 程序异常测试        |
| **硬件模拟** | 内核oops、内存破坏         | root      | 极高     | 驱动开发测试        |
| **资源耗尽** | fork炸弹、内存耗尽         | user/root | 中       | 系统稳定性测试      |

## 2. 具体操作命令与示例

### 2.1. SysRq魔术键触发（推荐用于kdump测试）
这是最可控的内核崩溃触发方式。

```bash
# 1. 检查SysRq是否启用 (0=禁用, 1=启用)
cat /proc/sys/kernel/sysrq

# 2. 如果未启用，临时启用（重启失效）
echo 1 | sudo tee /proc/sys/kernel/sysrq

# 3. 触发内核崩溃（立即重启）
echo c | sudo tee /proc/sysrq-trigger

# 替代方案：触发系统立即重启
echo b | sudo tee /proc/sysrq-trigger
```

**特点**：
- 如果kdump配置正确，此方法可生成完整的vmcore文件
- 相对“干净”的崩溃，有助于调试分析
- 需要内核编译时开启CONFIG_MAGIC_SYSRQ

### 2.2. 通过内核模块触发panic
创建并加载一个简单内核模块来触发崩溃。

```c
// crash_module.c
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Test");

static int __init crash_init(void)
{
    printk(KERN_EMERG "Triggering kernel panic...\n");
    panic("Test kernel panic from module");
    return 0;
}

static void __exit crash_exit(void)
{
    printk(KERN_INFO "Goodbye\n");
}

module_init(crash_init);
module_exit(crash_exit);
```

编译加载：
```bash
# 创建Makefile
obj-m += crash_module.o

# 编译模块
make -C /lib/modules/$(uname -r)/build M=$(PWD) modules

# 加载模块（立即触发崩溃）
sudo insmod crash_module.ko
```

### 2.3. 系统调用触发
#### 使用C程序调用reboot()
```c
// force_reboot.c
#include <unistd.h>
#include <linux/reboot.h>
#include <sys/reboot.h>

int main() {
    // 立即重启，不同步或卸载文件系统
    reboot(LINUX_REBOOT_CMD_RESTART);
    return 0;
}
```
编译执行：`gcc -o force_reboot force_reboot.c && sudo ./force_reboot`

#### 使用kill发送致命信号
```bash
# 向init进程(pid 1)发送KILL信号
sudo kill -9 1

# 向自己发送段错误信号
kill -11 $$
```

### 2.4. 资源耗尽触发
#### Fork炸弹（谨慎使用）
```bash
# Bash版本（会使系统迅速无响应）
:(){ :|:& };:

# 更简单的版本
fork(){ fork | fork & }; fork
```

#### 内存耗尽
```bash
# 使用dd消耗内存（根据系统内存调整）
sudo dd if=/dev/zero of=/dev/null bs=1G

# 使用stress工具（需安装）
stress --vm 1 --vm-bytes $(free -g | awk 'NR==2{print $2}')G --vm-keep
```

#### 耗尽inode或磁盘空间
```bash
# 创建大量小文件耗尽inode
for i in {1..100000}; do touch /tmp/file_$i; done

# 填满磁盘
sudo dd if=/dev/zero of=/fill bs=1M count=10000
```

### 2.5. 硬件/驱动层面触发
#### 触发内核oops（可恢复）
```bash
# 尝试写入NULL指针
sudo echo 1 > /proc/sys/kernel/panic_on_oops
echo 1 | sudo tee /proc/sys/kernel/panic_on_oops  # 使oops触发panic

# 触发除零错误（通过模块）
# 或直接操作设备文件
sudo dd if=/dev/random of=/dev/mem bs=1k count=1
```

#### 移除关键模块
```bash
# 卸载文件系统模块（可能导致数据损坏）
sudo rmmod ext4

# 卸载网络驱动
sudo rmmod e1000
```

## 3. 防护与监控建议
即使是在测试环境，也应设置防护措施：

### 3.1. 使用cgroups限制影响范围
```bash
# 创建cgroup限制内存
sudo cgcreate -g memory:test_crash
sudo cgset -r memory.limit_in_bytes=100M test_crash

# 在cgroup中运行危险命令
sudo cgexec -g memory:test_crash bash -c "dangerous_command"
```

### 3.2. 使用ulimit限制资源
```bash
# 限制进程数
ulimit -u 50  # 最多50个进程

# 限制核心转储大小
ulimit -c 0    # 禁止核心转储
```

### 3.3. 使用虚拟机隔离
```bash
# 使用libvirt创建测试虚拟机
virt-install --name crash-test --memory 1024 --disk size=10 --cdrom /path/to/iso

# 创建快照（执行前）
virsh snapshot-create-as crash-test pre-crash-state
```

## 4. 测试结果验证
触发异常重启后，检查以下日志验证结果：

### 4.1. 检查系统日志
```bash
# 查看内核环形缓冲区
dmesg | tail -50

# 查看系统日志
journalctl --since "5 minutes ago" | grep -i "panic\|crash\|oops"

# 特定日志文件
cat /var/log/messages | tail -100
```

### 4.2. 检查kdump捕获情况
```bash
# 检查vmcore是否生成
ls -lh /var/crash/$(date +%Y-%m-%d)*/

# 检查kdump状态
systemctl status kdump

# 查看内核命令行参数
cat /proc/cmdline | grep crashkernel
```

### 4.3. 验证监控告警
- 检查监控系统是否收到宕机告警
- 验证恢复时间是否符合SLA要求
- 检查日志聚合系统是否记录了崩溃信息

## 5. 故障排除
如果方法无效，检查以下配置：

### SysRq未生效
```bash
# 永久启用SysRq（编辑/etc/sysctl.conf）
echo "kernel.sysrq = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### kdump未触发
```bash
# 检查kdump配置
kdump-config show

# 检查预留内存
cat /proc/iomem | grep -i crash

# 测试kdump配置
kdump-config test
```

