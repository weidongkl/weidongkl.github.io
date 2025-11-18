# FORTIFY

## 1. FORTIFY_SOURCE 的概念

**FORTIFY_SOURCE** 是 GCC / Clang 与 libc（glibc 或 fortify-headers）协作的安全机制，用于在 **编译期（Compile-time）** 和 **运行期（Runtime）** 检测以下典型风险：

- 缓冲区溢出（Buffer Overflow）
- 越界写（Out-of-bounds Write）
- 不安全字符串操作
- 错误的 memcpy/memmove 长度
- 危险格式化输出（sprintf）

FORTIFY 在编译阶段，会利用优化器（如 `-O2`）识别 **目标缓冲区大小**，并自动替换为安全的版本（如 `__builtin___memcpy_chk`）。

------

## 2. 启用 FORTIFY_SOURCE

FORTIFY 依赖优化级别（必须 `-O1` 或更高），建议使用：

```sh
-D_FORTIFY_SOURCE=2 -O2
```

常用级别：

| 值                  | 要求         | 意义                     |
| ------------------- | ------------ | ------------------------ |
| `_FORTIFY_SOURCE=0` | 无           | 禁用加固                 |
| `_FORTIFY_SOURCE=1` | `-O1` 或更高 | 基本加固（运行期检查）   |
| `_FORTIFY_SOURCE=2` | `-O2` 或更高 | 最高加固（编译期更严格） |

------

## 3. FORTIFY 的作用原理

1. **编译时介入**
   - 条件：开启优化 (`-O1`/`-O2`) 并定义 `_FORTIFY_SOURCE` 宏。
   - 预处理器开始工作。
2. **函数替换**
   - Glibc 头文件将不安全函数（如 `strcpy`）替换为安全版本（如 `__strcpy_chk`）。
3. **边界检查**
   - 安全版本函数在执行前，会检查**目标缓冲区大小**是否足够。
4. **运行时处理**
   - **检查通过**：正常执行，性能损耗极低。
   - **检查失败**：立即终止程序，抛出错误并生成核心转储。

## 4. 能加固的典型函数

**字符串类**

- `strcpy`, `strncpy`
- `strcat`, `strncat`
- `strlen`, `stpcpy`, `strlcpy`（不同 libc）

**内存类**

- `memcpy`, `memmove`, `memset`

**I/O 相关**

（取决于 libc）

- `read`, `write`
- `pread`, `pwrite`
- `gets`（禁止使用）

**格式化输出类**

- `sprintf`, `vsprintf`
- `snprintf`（附加检查）

------

## 5.示例

```c
#include <string.h>
#include <stdio.h>

void foo(char *input) {
    char buf[10];
    strcpy(buf, input); // 如果 input 长度超过 9，就会发生缓冲区溢出
    printf("%s\n", buf);
}

int main(int argc, char *argv[]) {
    if (argc > 1) {
        foo(argv[1]);
    }
    return 0;
}
```

**不使用 `_FORTIFY_SOURCE` 编译：**

```bash
$ gcc main.c 
$ ./a.out  12
12
$ ./a.out  12345678910
12345678910
Segmentation fault (core dumped)
# 硬件/操作系统层面（CPU/MMU）错误
```

**使用 `_FORTIFY_SOURCE=2` 编译**

```bash
$ gcc -O2 -D_FORTIFY_SOURCE=2 main.c 
$ ./a.out 12
12
$ ./a.out 12345678910
*** buffer overflow detected ***: terminated
Aborted (core dumped)
# 软件/编译器层面（Glibc）错误

```

------

## 6. FORTIFY_SOURCE 的常见局限

1. 必须依赖优化器，否则对象大小无法推导
2. 无法覆盖所有内存错误（UB、Use-after-free 等）
3. 检查仅限编译器能“看到”的目标缓冲区
4. 不适用于动态大小的结构（如 malloc 返回的指针没有静态大小信息）

可与以下手段结合：

- ASan（AddressSanitizer）
- UBSan（UndefinedBehaviorSanitizer）
- Stack Protector
- Stack Clash 防护

FORTIFY 是最轻量级的安全加固方式。

