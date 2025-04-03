# Golang `runtime/debug` 用法

`runtime/debug` 是 Go 标准库中用于调试和运行时信息收集的重要包，提供了多种实用功能。下面我将详细介绍其主要功能和用法：

## 1. 内存和垃圾回收相关操作

强制垃圾回收

```go
debug.GC()  // 显式触发一次垃圾回收
```

强制将未使用的内存返回给操作系统。

> 注意：Go 会自动做内存管理，这个函数一般用于调试或特殊情况。

```go
debug.FreeOSMemory()  // 将未使用的内存返回给操作系统
```

设置垃圾回收器的触发频率。

- 默认值是 100，表示内存分配增长 100% 就触发 GC。
- 设置为负数会关闭 GC。

```go
// 设置GC目标百分比（默认100）
// 值越大GC越不频繁，但内存使用更多
debug.SetGCPercent(200)

// Go 1.19+ 设置内存软限制
debug.SetMemoryLimit(512 * 1024 * 1024)  // 512MB
```

读取GC统计信息

```go
var stats debug.GCStats
debug.ReadGCStats(&stats)

fmt.Printf("上次GC时间: %v\n", stats.LastGC)
fmt.Printf("GC总次数: %d\n", stats.NumGC)
fmt.Printf("GC总暂停时间: %v\n", stats.PauseTotal)
fmt.Printf("最近GC暂停时间: %v\n", stats.Pause)
```

生成堆转储

```go
func writeHeapDump(filename string) error {
    f, err := os.Create(filename)
    if err != nil {
        return err
    }
    defer f.Close()
    
    return debug.WriteHeapDump(f.Fd())  // 需要文件描述符
}
```

## 2. 堆栈信息操作

获取当前调用栈

```go
stack := debug.Stack()  // 返回[]byte
fmt.Printf("%s\n", stack)
```

打印当前的堆栈信息（stack trace），常用于调试 panic 或 goroutine 调度问题。

```go
// 打印对应goroutine 堆栈
debug.PrintStack()
```

设置最大堆栈深度

> 设置每个 goroutine 的最大堆栈大小。一般调试 goroutine stack 溢出问题才用。

```go
debug.SetMaxStack(64 * 1024 * 1024)  // 64MB
```

示例：

```go
package main

import (
	"fmt"
	"runtime/debug"
	"time"
)

func main() {
	fmt.Println("Start")
	go func() {
		defer func() {
			fmt.Println("Recovered")
		}()
		fmt.Println("Hello World")
		debug.PrintStack()
	}()
	time.Sleep(1 * time.Second)
	debug.PrintStack()
	fmt.Println("End")
}

```

设置panic堆栈跟踪级别

```go
// 可选值: "none", "single", "all", "system", "crash"
debug.SetTraceback("all")  // 显示所有goroutine的堆栈
```

## 3. 构建信息读取

读取模块构建信息

```go
package main

import (
	"fmt"
	"github.com/sirupsen/logrus"
	"runtime/debug"
)

func main() {
	logrus.Info("Hello World")
	bi, ok := debug.ReadBuildInfo()
	if ok {
		fmt.Printf("Go Version: %s\n", bi.GoVersion)
		fmt.Printf("Main Module: %s@%s\n", bi.Main.Path, bi.Main.Version)

		for _, dep := range bi.Deps {
			fmt.Printf("Dependency: %s@%s\n", dep.Path, dep.Version)
		}
		for _, set := range bi.Settings {
			fmt.Printf("Settings: %s@%s\n", set.Key, set.Value)
		}
	}
}
```

打印如下：

```bash
INFO[0000] Hello World                                  
Go Version: go1.20.4
Main Module: demo@(devel)
Dependency: github.com/sirupsen/logrus@v1.9.3
Dependency: golang.org/x/sys@v0.29.0
Settings: -buildmode@exe
Settings: -compiler@gc
Settings: CGO_ENABLED@1
Settings: CGO_CFLAGS@
Settings: CGO_CPPFLAGS@
Settings: CGO_CXXFLAGS@
Settings: CGO_LDFLAGS@
Settings: GOARCH@amd64
Settings: GOOS@linux
Settings: GOAMD64@v1
Settings: vcs@git
Settings: vcs.revision@47a4d73f30696cd2bf2ec09a16f6d3ba7ae563e6
Settings: vcs.time@2025-04-07T09:35:26Z
Settings: vcs.modified@false
$ git log
commit 47a4d73f30696cd2bf2ec09a16f6d3ba7ae563e6 (HEAD -> master)
Author: Your Name <you@example.com>
Date:   Mon Apr 7 17:35:26 2025 +0800

    1
```

## 4. 实际应用示例

### 4.1. 内存监控工具
```go
func monitorMemory(threshold uint64) {
    for {
        var m runtime.MemStats
        runtime.ReadMemStats(&m)
        
        if m.Alloc > threshold {
            debug.FreeOSMemory()
            debug.GC()
            
            f, _ := os.Create("heapdump.out")
            debug.WriteHeapDump(f.Fd())
            f.Close()
            
            return
        }
        time.Sleep(5 * time.Second)
    }
}
```

### 4.2. 增强的panic处理
```go
func setupPanicRecovery() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Fprintf(os.Stderr, "Panic: %v\n", r)
            debug.PrintStack()
            
            // 保存堆栈到文件
            stack := debug.Stack()
            os.WriteFile("panic.log", stack, 0644)
            
            os.Exit(1)
        }
    }()
    
    // 应用主逻辑
    runApplication()
}
```

### 4.3. 构建信息展示
```go
func showVersion() {
    bi, ok := debug.ReadBuildInfo()
    if !ok {
        fmt.Println("无法获取构建信息")
        return
    }
    
    fmt.Printf("应用: %s\n版本: %s\nGo版本: %s\n",
        bi.Main.Path, 
        bi.Main.Version,
        bi.GoVersion)
    
    fmt.Println("\n依赖项:")
    for _, dep := range bi.Deps {
        fmt.Printf("- %s@%s\n", dep.Path, dep.Version)
    }
}
```

## 5. 注意事项

1. `WriteHeapDump` 功能在不同平台上表现可能不同
2. 设置过高的 `SetGCPercent` 可能导致内存使用过多
3. `SetMemoryLimit` 仅在 Go 1.19+ 可用
4. 生产环境中谨慎使用 `FreeOSMemory`，可能导致性能下降

`runtime/debug` 包是 Go 开发者工具箱中的重要组成部分，特别适用于：
- 内存泄漏调试
- 性能问题诊断
- 构建版本管理
- 生产环境问题排查
- 自定义错误处理机制

通过合理使用这些功能，可以显著提升 Go 应用程序的可调试性和可靠性。
