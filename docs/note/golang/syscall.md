# Golang `sys/unix syscall` 

## 1. 简介

`golang.org/x/sys/unix` 是 Go 官方提供的一个扩展包，专门用于执行 Unix/Linux 相关的系统调用。它是 `syscall` 包的替代方案，提供更丰富的功能，并保持持续维护和更新。

## 2. 安装

`sys` 不是 Go 标准库的一部分，需要手动安装：

```sh
go get golang.org/x/sys/unix
```

------

## 3. 常见 Golang `golang.org/x/sys/unix` 

## 1. 简介

`golang.org/x/sys/unix` 是 Go 官方提供的一个扩展包，专门用于执行 Unix/Linux 相关的系统调用。它是 `syscall` 包的替代方案，提供更丰富的功能，并保持持续维护和更新。

## 2. 安装

`sys` 不是 Go 标准库的一部分，需要手动安装：

```sh
go get golang.org/x/sys/unix
```

------

## 3. 常见 `unix` 用法

### 3.1 获取进程 ID

```go
package main

import (
	"fmt"
	"golang.org/x/sys/unix"
)

func main() {
	pid := unix.Getpid()
	fmt.Println("当前进程 ID:", pid)

	ppid := unix.Getppid()
	fmt.Println("父进程 ID:", ppid)
}
```

------

### 3.2 文件操作

#### 3.2.1 使用 `unix.Open` 读取文件

```go
package main

import (
	"fmt"
	"golang.org/x/sys/unix"
)

func main() {
	fd, err := unix.Open("test.txt", unix.O_RDONLY, 0)
	if err != nil {
		fmt.Println("打开文件失败:", err)
		return
	}
	defer unix.Close(fd)

	var buf [100]byte
	n, err := unix.Read(fd, buf[:])
	if err != nil {
		fmt.Println("读取文件失败:", err)
		return
	}
	fmt.Println("文件内容:", string(buf[:n]))
}
```

------

### 3.3 进程控制

#### 3.3.1 创建子进程

```go
package main

import (
	"fmt"
	"golang.org/x/sys/unix"
)

func main() {
	binary := "/bin/ls"
	args := []string{"ls", "-l"}

	err := unix.Exec(binary, args, nil)
	if err != nil {
		fmt.Println("执行失败:", err)
	}
}
```

------

### 3.4 信号处理

#### 3.4.1 发送信号

```go
package main

import (
	"fmt"
	"golang.org/x/sys/unix"
	"time"
)

func main() {
	pid := unix.Getpid()
	fmt.Println("当前进程 ID:", pid)

	go func() {
		time.Sleep(2 * time.Second)
		unix.Kill(pid, unix.SIGTERM)
	}()
}
```

------

### 3.5 内存管理

#### 3.5.1 `mmap` 映射文件

```go
package main

import (
	"fmt"
	"os"
	"golang.org/x/sys/unix"
	"unsafe"
)

func main() {
	file, err := os.OpenFile("test.txt", os.O_RDWR, 0666)
	if err != nil {
		fmt.Println("打开文件失败:", err)
		return
	}
	defer file.Close()

	fi, _ := file.Stat()
	size := fi.Size()

	data, err := unix.Mmap(int(file.Fd()), 0, int(size), unix.PROT_READ, unix.MAP_SHARED)
	if err != nil {
		fmt.Println("mmap 失败:", err)
		return
	}

	fmt.Println("文件内容:", *(*string)(unsafe.Pointer(&data)))
}
```

------

## 4. `unix` 作为 `syscall` 的替代方案

| 功能     | `syscall` (已废弃)         | `x/sys/unix` (推荐) |
| -------- | -------------------------- | ------------------- |
| 进程管理 | ✅                          | ✅                   |
| 文件操作 | ✅                          | ✅                   |
| 信号处理 | ✅                          | ✅                   |
| 兼容性   | ❌ 仅限 Linux/macOS/Windows | ✅ 跨平台更好        |
| 未来维护 | ❌ 停止维护                 | ✅ 推荐使用          |

示例（`x/sys/unix` 替代 `syscall`）：

```go
import "golang.org/x/sys/unix"

func main() {
	unix.Getpid()  // 替代 syscall.Getpid()
}
```

------

## 5. 结论

- **`syscall` 适用于低级系统调用**，但已被废弃。
- **建议使用 `golang.org/x/sys/unix`**，因为 `syscall` 不再维护。
- **适用于需要直接操作系统资源**（如 `mmap`、`fork`、`exec`、`signal`）。
- **不适用于一般应用开发**，Go 提供的标准库 `os`、`io`、`net` 足够大多数场景。

------

### 6. 参考

- [官方文档](https://pkg.go.dev/golang.org/x/sys/unix)
- [GitHub 代码库](https://github.com/golang/sys)

## ** `unix` 用法**

### **3.1 获取进程 ID**

```go
package main

import (
	"fmt"
	"golang.org/x/sys/unix"
)

func main() {
	pid := unix.Getpid()
	fmt.Println("当前进程 ID:", pid)

	ppid := unix.Getppid()
	fmt.Println("父进程 ID:", ppid)
}
```

------

### **3.2 文件操作**

#### **3.2.1 使用 `unix.Open` 读取文件**

```go
package main

import (
	"fmt"
	"golang.org/x/sys/unix"
)

func main() {
	fd, err := unix.Open("test.txt", unix.O_RDONLY, 0)
	if err != nil {
		fmt.Println("打开文件失败:", err)
		return
	}
	defer unix.Close(fd)

	var buf [100]byte
	n, err := unix.Read(fd, buf[:])
	if err != nil {
		fmt.Println("读取文件失败:", err)
		return
	}
	fmt.Println("文件内容:", string(buf[:n]))
}
```

------

### **3.3 进程控制**

#### **3.3.1 创建子进程**

```go
package main

import (
	"fmt"
	"golang.org/x/sys/unix"
)

func main() {
	binary := "/bin/ls"
	args := []string{"ls", "-l"}

	err := unix.Exec(binary, args, nil)
	if err != nil {
		fmt.Println("执行失败:", err)
	}
}
```

------

### **3.4 信号处理**

#### **3.4.1 发送信号**

```go
package main

import (
	"fmt"
	"golang.org/x/sys/unix"
	"time"
)

func main() {
	pid := unix.Getpid()
	fmt.Println("当前进程 ID:", pid)

	go func() {
		time.Sleep(2 * time.Second)
		unix.Kill(pid, unix.SIGTERM)
	}()
}
```

------

### **3.5 内存管理**

#### **3.5.1 `mmap` 映射文件**

```go
package main

import (
	"fmt"
	"os"
	"golang.org/x/sys/unix"
	"unsafe"
)

func main() {
	file, err := os.OpenFile("test.txt", os.O_RDWR, 0666)
	if err != nil {
		fmt.Println("打开文件失败:", err)
		return
	}
	defer file.Close()

	fi, _ := file.Stat()
	size := fi.Size()

	data, err := unix.Mmap(int(file.Fd()), 0, int(size), unix.PROT_READ, unix.MAP_SHARED)
	if err != nil {
		fmt.Println("mmap 失败:", err)
		return
	}

	fmt.Println("文件内容:", *(*string)(unsafe.Pointer(&data)))
}
```

------

## **4. `unix` 作为 `syscall` 的替代方案**

| 功能     | `syscall` (已废弃)         | `x/sys/unix` (推荐) |
| -------- | -------------------------- | ------------------- |
| 进程管理 | ✅                          | ✅                   |
| 文件操作 | ✅                          | ✅                   |
| 信号处理 | ✅                          | ✅                   |
| 兼容性   | ❌ 仅限 Linux/macOS/Windows | ✅ 跨平台更好        |
| 未来维护 | ❌ 停止维护                 | ✅ 推荐使用          |

示例（`x/sys/unix` 替代 `syscall`）：

```go
import "golang.org/x/sys/unix"

func main() {
	unix.Getpid()  // 替代 syscall.Getpid()
}
```

------

## **5. 结论**

- **`syscall` 适用于低级系统调用**，但已被废弃。
- **建议使用 `golang.org/x/sys/unix`**，因为 `syscall` 不再维护。
- **适用于需要直接操作系统资源**（如 `mmap`、`fork`、`exec`、`signal`）。
- **不适用于一般应用开发**，Go 提供的标准库 `os`、`io`、`net` 足够大多数场景。

------

### **6. 参考**

- [官方文档](https://pkg.go.dev/golang.org/x/sys/unix)
- [GitHub 代码库](https://github.com/golang/sys)
