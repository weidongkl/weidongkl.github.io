# Go sync.Pool 用法文档

`sync.Pool` 是 Go 标准库中提供的一个对象池，用于存储和复用临时对象，减少内存分配和 GC 压力。

## 1. 概念

`sync.Pool` 是一个可以存储和复用临时对象的并发安全容器，主要特点：

- 适用于缓存频繁创建和销毁的对象
- 自动扩容和收缩，无需手动管理大小
- 并发安全，多个 goroutine 可以安全使用
- 对象可能在任何时候被 GC 回收

## 2. 基本用法

### 2.1 创建 Pool

```go
var pool = &sync.Pool{
    New: func() interface{} {
        return &MyObject{} // 创建新对象的函数
    },
}
```

### 2.2 获取对象

```go
obj := pool.Get().(*MyObject) // 从池中获取对象，类型断言
```

### 2.3 放回对象

```go
pool.Put(obj) // 将对象放回池中
```

## 3. 完整示例

```go
package main

import (
    "fmt"
    "sync"
)

type ExpensiveObject struct {
    Data string
}

func main() {
    pool := &sync.Pool{
        New: func() interface{} {
            fmt.Println("Creating new ExpensiveObject")
            return &ExpensiveObject{Data: "initial data"}
        },
    }

    // 获取对象
    obj1 := pool.Get().(*ExpensiveObject)
    fmt.Println("Object 1:", obj1.Data)

    // 修改后放回
    obj1.Data = "modified data"
    pool.Put(obj1)

    // 再次获取，可能得到之前放回的对象
    obj2 := pool.Get().(*ExpensiveObject)
    fmt.Println("Object 2:", obj2.Data) // 输出 "modified data"

    // 获取新对象（如果之前没有放回）
    obj3 := pool.Get().(*ExpensiveObject)
    fmt.Println("Object 3:", obj3.Data) // 输出 "initial data"
}
```

## 4. 使用场景

1. **高频率创建/销毁的对象**：如 HTTP 请求的缓冲区
2. **大内存对象复用**：减少 GC 压力
3. **临时对象复用**：如解析 JSON 时的临时结构体

## 5. 最佳实践

1. **不要假设对象状态**：从 Pool 获取的对象可能是新创建的，也可能是之前用过的
2. **重置对象状态**：放回 Pool 前应重置对象状态
3. **适合短生命周期对象**：Pool 中的对象可能被 GC 回收
4. **不适用于持久对象**：不适合缓存数据库连接等长生命周期对象

## 6. 高级用法

### 6.1 带重置功能的 Pool

```go
type ResettableObject struct {
    Buffer []byte
}

func (o *ResettableObject) Reset() {
    o.Buffer = o.Buffer[:0] // 重用底层数组
}

var pool = sync.Pool{
    New: func() interface{} {
        return &ResettableObject{Buffer: make([]byte, 0, 1024)}
    },
}

func GetBuffer() *ResettableObject {
    obj := pool.Get().(*ResettableObject)
    obj.Reset() // 确保状态干净
    return obj
}

func PutBuffer(obj *ResettableObject) {
    pool.Put(obj)
}
```

### 6.2 性能敏感场景的优化

```go
var (
    pool = sync.Pool{
        New: func() interface{} {
            buf := make([]byte, 512)
            return &buf
        },
    }
)

func processRequest(data []byte) {
    bufPtr := pool.Get().(*[]byte)
    defer pool.Put(bufPtr)
    
    buf := *bufPtr
    // 使用 buf 处理数据...
}
```

## 7. 注意事项

1. **不要保存对 Pool 中对象的引用**：放回后应立即停止使用
2. **Pool 大小不受控**：由运行时自动管理
3. **不适合存储固定数量的资源**：如数据库连接池
4. **GC 会清空 Pool**：每次 GC 后 Pool 会被清空

`sync.Pool` 是 Go 中优化内存分配的重要工具，合理使用可以显著提高程序性能，特别是在高并发场景下。