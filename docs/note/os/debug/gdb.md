# GDB 调试工具

## 1. GDB 概述

GDB（GNU Debugger）是一个强大的调试工具，广泛用于调试C、C++、Fortran等编程语言编写的程序。GDB可以在程序运行时执行控制，帮助开发人员诊断程序中的错误。

### 1.1 GDB的历史和发展
GDB 是由 Free Software Foundation 开发和维护的，最早由 Richard Stallman 和 Roland H. Pesch 在 1986 年开始设计。如今，GDB已经成为Linux及其他操作系统上最广泛使用的调试工具。

### 1.2 GDB应用场景
* 软件开发：用于程序调试和性能优化
* 嵌入式开发：调试在嵌入式系统上运行的应用程序
* 远程调试：通过网络调试远程机器上的程序
* 多线程调试：在多线程环境下调试并发问题

## 2. GDB安装

### 2.1 使用包管理器安装
```bash
yum install gdb
```

### 2.2 源码编译安装
（详细编译安装步骤）

## 3. GDB 基本功能

### 3.1 启动GDB
```bash
# 启动gdb调试程序
$ gdb <your_program>
# 开始程序运行。`run`后面的参数会像进程正常执行一样传递给进程。通常，我们会在设置好断点之后。执行此命令
$ run
```

### 3.2 调试带参数的程序
#### 方法1：直接传递参数
```bash
(gdb) run arg1 arg2 arg3
```

#### 方法2：使用set args
```bash
(gdb) set args arg1 arg2 arg3
(gdb) run
```

#### 方法3：修改命令行参数
```bash
(gdb) set args new_arg1 new_arg2
(gdb) run
```

### 3.3 调试运行中的进程
```bash
# 可以直接-p 指定pid
$ gdb -p pid
# 也可以启动gdb 后，attach pid
$ gdb -q
(gdb) <pid>
```

### 3.4 基本调试命令
| 命令           | 功能描述               |
| -------------- | ---------------------- |
| b/break        | 设置断点               |
| r/run          | 开始程序运行           |
| start          | 在main函数开始前停止   |
| c/continue     | 继续执行直到下一个断点 |
| n/next         | 单步执行(不进入函数)   |
| s/step         | 单步执行(进入函数)     |
| p/print        | 打印变量的值           |
| l/list         | 查看源代码             |
| bt/backtrace   | 显示调用栈             |
| until location | 执行到指定位置         |
| fini/finish    | 执行完成当前函数       |
| q/quit         | 退出gdb                |

### 3.5 断点管理
#### 设置断点

通过 `break` 命令在特定位置设置断点（如函数或代码行）。

```bash
(gdb) break <function_name>
(gdb) break <file_name>:<line_number>
```

#### 条件断点
```bash
(gdb) break file:line if condition
```

#### 命令断点

```bash
(gdb) break <function_name> command
```

#### 查看断点

```bash
(gdb) info breakpoints
```

#### 删除断点
```bash
(gdb) delete breakpoint_num
```

### 3.6 变量查看与修改
#### 查看变量
```bash
(gdb) print <variable_name>
# 查看当前函数的局部变量
(gdb) info locals
# 查看当前函数的参数
(gdb) info args
```

#### 修改变量
```bash
(gdb) set variable=value
```

#### 查看内存

```bash
(gdb) x/10x <memory_address>
```

#### 示例

```bash
$ # gdb -q  ./a.out 
Reading symbols from ./a.out...
(gdb) l
1       #include <signal.h>
2       #include <stdlib.h>
3       #include <stdio.h>
4
5       int main() {
6               int a;
7               a=10;
8            printf("Hello World\n");
9            printf("%d\n",a);
10          return 0;
(gdb) b 8
Breakpoint 1 at 0x401145: file main.c, line 8.
(gdb) r
Starting program: /home/a.out 
[Thread debugging using libthread_db enabled]
Breakpoint 1, main () at main.c:8
8            printf("Hello World\n");
(gdb) p a
$1 = 10
(gdb) info locals
a = 10
(gdb) set var a=11
(gdb) p a
$2 = 11
(gdb) p &a
$3 = (int *) 0x7fffffffe23c
(gdb) x 0x7fffffffe23c
0x7fffffffe23c: 0x0000000b
(gdb) x/10x 0x7fffffffe23c
0x7fffffffe23c: 0x0000000b      0x00000001      0x00000000      0xf7c29590
0x7fffffffe24c: 0x00007fff      0x00000000      0x00000000      0x00401136
0x7fffffffe25c: 0x00000000      0x00000000
(gdb) n
Hello World
9            printf("%d\n",a);
(gdb) 
11
10          return 0;
(gdb) 
```

## 4. 高级调试技巧

### 4.1 多进程调试
```bash
# 使用 `inferior` 命令切换不同进程进行调试
(gdb) inferior <process_id>
# `follow-fork-mode` 参数用来设置gdb跟踪父进程还是子进程
# `set follow-fork-mode parent` 在fork之后，调试父进程，这也是gdb的默认值
(gdb) set follow-fork-mode child/parent
# gdb是否控制未调试的进程
# `set detach-on-fork on` gdb默认值，gdb不控制未调试的进
(gdb) set detach-on-fork on/off
```

### 4.2 多线程调试
```bash
# 使用 `info threads` 命令查看当前程序中的所有线程。
(gdb) info threads
# 使用 `thread` 命令切换到特定线程。
(gdb) thread thread_id
(gdb) break location thread thread_id
```

### 4.3 观察点(Watchpoints)
```bash
# 标记观察断点，监控数值更改（wirte）
(gdb) watch expression or variable
# 标记观察断点，监控数值读取（read）
(gdb) rwatch expression or variable
# 标记观察断点。同时监控数据读取与更改（read and write）
(gdb) awatch expression or variable
```

示例

```bash
$ gdb -q a.out
Reading symbols from a.out...done.
(gdb) l
1	#include <stdio.h>
2
3	int get_sum(int n) {
4	    int sum = 0, i;
5	    for (i = 0; i < n; i++) {
6	        sum += i;
7	    }
8	    return sum;
9	}
10
(gdb) b 6
Breakpoint 1 at 0x4005ad: file main.c, line 6.
(gdb) r
Starting program: /tmp/a.out
Missing separate debuginfos, use: yum debuginfo-install glibc-2.28-164.el8.x86_64

Breakpoint 1, get_sum (n=100) at main.c:6
6	        sum += i;
(gdb) watch i==99
Hardware watchpoint 2: i==99
(gdb) clear 6
Deleted breakpoint 1
(gdb) c
Continuing.

Hardware watchpoint 2: i==99

Old value = 0
New value = 1
0x00000000004005b7 in get_sum (n=100) at main.c:5
5	    for (i = 0; i < n; i++) {
(gdb) p i
$1 = 99
(gdb) p sum
$2 = 4851
```

### 4.4 捕获点(Catchpoints)

[参考链接](https://c.biancheng.net/view/8199.html)

```bash
# 用捕捉断点监控某一事件的发生，等同于在程序中该事件发生的位置打普通断点。
(gdb) catch event
```

> 普通断点作用于程序中的某一行，当程序运行至此行时停止执行，观察断点作用于某一变量或表达式，当该变量（表达式）的值发生改变时，程序暂停。而捕捉断点的作用是，监控程序中某一事件的发生，例如程序发生某种异常时、某一动态库被加载时等等，一旦目标时间发生，则程序停止执行。

### 4.5 自动化调试

```bash
# 使用 `source` 命令执行 GDB 脚本，实现自动化调试。
(gdb) source <script_file>
```

### 4.6 远程调试

```bash
# GDB支持与远程系统调试，使用 `target remote` 命令连接远程程序。
(gdb) target remote <hostname>:<port>
```

### 4.7 切换栈帧

f 切换

```bash
(gdb) bt                                                                                                      
#0  add (low=1, high=10) at test1.c:5                                                                         
#1  0x00000000004005e6 in main (argc=1, argv=0x7fffffffe408) at test1.c:12                                    
(gdb) frame 1
#1  0x00000000004005e6 in main (argc=1, argv=0x7fffffffe408) at test1.c:12                                    
12          result[0] = add(1,10);
(gdb) f 1
#1  0x00000000004005e6 in main (argc=1, argv=0x7fffffffe408) at test1.c:12
12          result[0] = add(1,10);
(gdb) i locals 
result = {-134224088, 32767, 0, 0}
```

## 5. 调试信息与符号

### 5.1 编译时添加调试信息
```bash
# -O0禁用优化，可以帮助调试代码
gcc -O0 -g program.c -o program
```

### 5.2 分离调试信息
```bash
# 拷贝elf中的调试信息到debug文件
objcopy --only-keep-debug program program.debug
# 瘦身二进制程序
strip --strip-debug program
```

### 5.3 加载调试信息

运行时加载

```bash
(gdb) symbol-file program.debug
```

提前做好关联，无需运行时加载

```bash
$ objcopy --add-gnu-debuglink=program.debug program
$ objdump  -s -j .gnu_debuglink program

program:     file format elf64-x86-64

Contents of section .gnu_debuglink:
 0000 70726f67 72616d2e 64656275 67000000  program.debug...
 0010 cb07fc34      
```



## 6. 调试案例

### 6.1 段错误调试
```bash
(gdb) run
(gdb) bt
```

### 6.2 内存泄漏检查
（结合valgrind使用）

### 6.3 死锁检测
（多线程调试示例）

## 7. GDB 实现原理

### 7.1 ptrace系统调用
GDB通过ptrace系统调用实现进程控制：
```c
long ptrace(enum __ptrace_request request, pid_t pid, void *addr, void *data);
```

### 7.2 断点实现原理
* 将断点处指令替换为int 3
* 保存原始指令
* 触发SIGTRAP信号

## 8. 参考资源

* GNU GDB官方文档
* 《The Art of Debugging with GDB, DDD, and Eclipse》
* GDB Cheat Sheet

