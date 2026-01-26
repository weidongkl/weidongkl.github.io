# 内核模块与用户空间交互方式

------

## 1. 概览

内核模块与用户空间程序的交互，本质是通过 Linux 提供的统一抽象接口完成的，核心目标包括：

1. 用户向内核传递控制与配置
2. 内核向用户暴露状态与事件
3. 内核与用户进行高性能数据交换

Linux 提供了多种交互机制，每种机制适用于不同场景。

| 交互方式 | 类型         | 主要用途            |
| -------- | ------------ | ------------------- |
| procfs   | 文件系统抽象 | 调试 / 状态展示     |
| sysfs    | 文件系统抽象 | 设备属性 / 参数配置 |
| 字符设备 | 设备抽象     | 流式数据            |
| ioctl    | 设备抽象     | 控制指令            |
| netlink  | Socket 抽象  | 系统级通信          |
| mmap     | 内存抽象     | 零拷贝共享          |
| eBPF map | 现代内核机制 | 现代安全交互        |

------

## 2. procfs 方式

### 2.1 原理说明

procfs 是内核暴露内部状态的一种虚拟文件系统：

- 不存在真实磁盘文件
- read/write 触发内核回调函数
- 主要用于状态展示与调试

---

### 2.2 数据流模型

用户态 read/write → VFS → proc_ops → 内核函数

------

### 2.3  Demo

#### 2.3.1 内核模块代码

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/proc_fs.h>
#include <linux/uaccess.h>

#define PROC_NAME "my_proc"

static ssize_t my_read(struct file *file, char __user *buf,
                       size_t count, loff_t *ppos)
{
    return simple_read_from_buffer(buf, count, ppos,
                                   "hello from kernel\n", 18);
}

static const struct proc_ops ops = {
    .proc_read = my_read,
};

static int __init my_init(void)
{
    proc_create(PROC_NAME, 0444, NULL, &ops);
    return 0;
}

static void __exit my_exit(void)
{
    remove_proc_entry(PROC_NAME, NULL);
}

module_init(my_init);
module_exit(my_exit);
MODULE_LICENSE("GPL");
```

------

#### 2.3.2 用户空间访问

```bash
cat /proc/my_proc
```

------

### 2.4  适用场景

- 调试接口
- 临时状态输出
- 教学与实验

------

## 3. sysfs 方式

### 3.1 原理说明

sysfs 以 kobject 为核心，每个文件代表一个内核对象属性。

适合场景：

- 配置参数
- 开关控制

---

### 3.2 数据模型

kobject → attribute → sysfs file

------

### 3.3  Demo

#### 3.3.1 内核模块代码

```c
#include <linux/module.h>
#include <linux/kobject.h>
#include <linux/sysfs.h>

static int my_value;

static ssize_t value_show(struct kobject *kobj,
                          struct kobj_attribute *attr, char *buf)
{
    return sprintf(buf, "%d\n", my_value);
}

static ssize_t value_store(struct kobject *kobj,
                           struct kobj_attribute *attr,
                           const char *buf, size_t count)
{
    kstrtoint(buf, 10, &my_value);
    return count;
}

static struct kobj_attribute value_attr =
    __ATTR(value, 0664, value_show, value_store);

static struct kobject *my_kobj;

static int __init my_init(void)
{
    my_kobj = kobject_create_and_add("my_sysfs", kernel_kobj);
    sysfs_create_file(my_kobj, &value_attr.attr);
    return 0;
}

static void __exit my_exit(void)
{
    kobject_put(my_kobj);
}

module_init(my_init);
module_exit(my_exit);
MODULE_LICENSE("GPL");
```

------

#### 3.3.2 用户空间访问

```bash
echo 42 > /sys/kernel/my_sysfs/value
cat /sys/kernel/my_sysfs/value
```

------

### 3.3 适用场景

- 模块参数
- 设备配置
- 功能开关

------

## 4. 字符设备 read/write

### 4.1 原理说明

通过 VFS 抽象设备为文件（ `/dev/xxx` 暴露设备文件，支持流式读写）：

- open/read/write
- file_operations 回调

------

### 4.2 Demo

#### 4.2.1 内核模块代码

```c
#include <linux/module.h>
#include <linux/fs.h>

#define DEV_NAME "mydev"
static int major;

static ssize_t my_read(struct file *f, char __user *buf,
                       size_t len, loff_t *off)
{
    return simple_read_from_buffer(buf, len, off,
                                   "hello dev\n", 10);
}

static struct file_operations fops = {
    .read = my_read,
};

static int __init my_init(void)
{
    major = register_chrdev(0, DEV_NAME, &fops);
    return 0;
}

static void __exit my_exit(void)
{
    unregister_chrdev(major, DEV_NAME);
}

module_init(my_init);
module_exit(my_exit);
MODULE_LICENSE("GPL");
```

------

#### 4.2.2 用户空间访问

```bash
mknod /dev/mydev c <major> 0
cat /dev/mydev
```

------

## 5. ioctl 控制接口

### 5.1 原理说明

ioctl 用于设备控制命令扩展。

------

### 5.2  Demo

#### 5.2.1 公共头文件

```c
#define MY_IOCTL_SET _IOW('k', 1, int)
```

------

#### 5.2.2 内核模块核心代码

```c
static long my_ioctl(struct file *f,
                     unsigned int cmd,
                     unsigned long arg)
{
    int val;
    switch (cmd) {
    case MY_IOCTL_SET:
        copy_from_user(&val, (int __user *)arg, sizeof(val));
        printk("val=%d\n", val);
        break;
    }
    return 0;
}
```

------

#### 5.2.3 用户空间调用

```c
int val = 100;
ioctl(fd, MY_IOCTL_SET, &val);
```

------

## 6. Netlink Socket

### 6.1 原理说明

Netlink 是内核与用户空间的消息总线，支持异步通信和多播。

------

### 6.2 Demo

#### 6.2.1 内核模块

```c
#include <net/sock.h>
#include <linux/netlink.h>

#define NETLINK_TEST 31
static struct sock *nl_sk;

static int __init my_init(void)
{
    nl_sk = netlink_kernel_create(&init_net, NETLINK_TEST, NULL);
    return 0;
}
```

------

#### 6.2.2 用户空间

```c
socket(AF_NETLINK, SOCK_RAW, NETLINK_TEST);
```

------

## 7. mmap 共享内存

### 7.1 原理说明

用户态映射内核内存页：

- 零拷贝
- 高性能
- 共享地址空间

------

### 7.2 Demo

#### 7.2.1 内核模块核心逻辑

```c
static int my_mmap(struct file *f, struct vm_area_struct *vma)
{
    return remap_pfn_range(vma,
        vma->vm_start,
        virt_to_phys(buffer) >> PAGE_SHIFT,
        PAGE_SIZE,
        vma->vm_page_prot);
}
```

------

#### 7.2.2 用户空间

```c
char *p = mmap(NULL, PAGE_SIZE,
               PROT_READ, MAP_SHARED, fd, 0);
```

------

## 8. eBPF 方式

### 8.1 原理说明

eBPF 允许在不加载内核模块的情况下安全扩展内核行为。

------

### 8.2  Demo

#### 8.2.1 BPF Map 定义

```c
struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, 1);
    __type(key, int);
    __type(value, int);
} my_map SEC(".maps");
```

------

#### 8.2.2 用户空间访问

```c
bpf_map_lookup_elem(fd, &key, &value);
```

------

## 9. 选型建议

| 需求类型 | 推荐方式 |
| -------- | -------- |
| 参数配置 | sysfs    |
| 设备控制 | ioctl    |
| 状态输出 | procfs   |
| 异步事件 | netlink  |
| 大数据   | mmap     |
| 安全扩展 | eBPF     |

------

## 10. 总结

内核与用户空间通信机制的演进路径为：

procfs → sysfs/ioctl → netlink → mmap → eBPF

体现了三个趋势：

1. 接口结构化
2. 通信事件化
3. 数据零拷贝化

最终目标是：

高性能、安全性、可维护性、系统级可观测性