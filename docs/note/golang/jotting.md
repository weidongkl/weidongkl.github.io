# Golang 随笔

## 1. 错误处理

在 Go 中，错误处理通常有两种方式：

### 1.1 普通函数

使用返回值返回一个 `error` 类型：

```go
func doSomething() (Result, error) {
    // ...
}
```

### 1.2 结构体方法

- 一种方式是像普通函数一样，直接返回一个 `error`。
- 另一种做法是，在结构体中增加一个 `error` 字段，在方法中设置这个字段的值。

```go
type MyService struct {
    err error
}

func (s *MyService) Do() {
    // ...
    s.err = errors.New("something went wrong")
}
```

------

## 2. Go 中何时使用 `chan`

在 Go 中，`chan` 是处理并发的核心工具之一，但并不是所有场景都适合使用它。以下是使用 `chan` 的建议与注意事项：

### 2.1 推荐使用的场景

#### 2.1.1 异步操作 / 并发任务

函数中开启 goroutine 异步执行任务，通过返回的 `chan` 返回结果：

```go
func asyncAdd(a, b int) <-chan int {
    result := make(chan int)
    go func() {
        result <- a + b
        close(result)
    }()
    return result
}
```

#### 2.1.2 流式数据传递

当函数生成一系列数据（如读取文件、流数据、分页 API 等），使用 `chan` 可以边生成边消费：

```go
func generate(n int) <-chan int {
    out := make(chan int)
    go func() {
        for i := 0; i < n; i++ {
            out <- i
        }
        close(out)
    }()
    return out
}
```

#### 2.1.3 信号同步

当只需传递一个"完成"或"信号"，可以使用 `chan struct{}`：

```go
done := make(chan struct{})
go func() {
    // 做一些事
    done <- struct{}{}
}()
<-done
```

### 2.2 不推荐的场景

- **只为传递一个返回值时**：返回值即可，无需增加复杂度。
- **同步计算场景**：没必要用 `chan` 包装同步调用。
- **为"函数式编程"风格强行引入 `chan`**：Go 强调简洁，不宜滥用。

------

## 3. 变量初始化的两种方式

在 Go 库中，变量初始化有两种常见写法，它们在执行时机上有重要区别：

### 3.1 变量声明时初始化
```go
var (
    std = New()
)
```

### 3.2 在 `init()` 函数中初始化
```go
var std *Logger

func init() {
    std = New()
}
```

### 3.3 主要区别

| 特性           | 变量声明初始化                             | init() 函数初始化                                      |
| -------------- | ------------------------------------------ | ------------------------------------------------------ |
| **初始化时机** | 在 `main` 函数执行**之前**，程序初始化阶段 | 在 `main` 函数执行**之前**，但在变量声明初始化**之后** |
| **执行顺序**   | 在 `init()` 函数**之前**执行               | 所有 `init()` 函数按照导入顺序执行                     |
| **代码简洁性** | 更简洁                                     | 相对冗长                                               |
| **灵活性**     | 适合简单初始化                             | 适合复杂初始化逻辑                                     |

### 3.4 执行顺序示例

```go
package main

import "fmt"

var (
    a = func() int {
        fmt.Println("var initialization")
        return 1
    }()
)

func init() {
    fmt.Println("init function")
}

func main() {
    fmt.Println("main function")
}
```

输出：
```
var initialization
init function
main function
```

### 3.5 使用建议

- **简单初始化**：使用 `var std = New()`，代码更简洁
- **复杂初始化**：需要在 `init()` 中执行多步操作或错误处理时
- **依赖其他包初始化**：如果依赖其他包的 `init()` 完成，需要在 `init()` 中初始化

------

## 4. `go mod tidy` 报错 GOSUMDB

当你遇到如下报错：

```bash
verifying module: invalid GOSUMDB: malformed verifier id
```

可能是 `go.sum` 校验失败。检查环境变量如下：

```bash
$ go env GOSUMDB
sum.golang.org

$ go env GOPROXY
https://goproxy.cn,direct
```

可尝试：

- 清空 `go.sum` 后重新运行 `go mod tidy`
- 切换 GOPROXY 为官方代理或关闭校验：`GOSUMDB=off`

------

## 5. 空接口 `interface{}` 与任意类型

在 Go 中，空接口 `interface{}` 表示任意类型，类似于 Java 的 `Object`，但更加简洁高效。

### 5.1 类型断言与转换

```go
var arr = [3]int{1, 2, 3}
value, ok := interface{}(arr).([3]int)
```

- `ok` 为 `true` 表示类型断言成功，`value` 即具体类型。
- 否则 `ok` 为 `false`。

## 6. 空结构体 `struct{}`

- 不占内存空间
- 在并发中常用于信号传递

```go
ch := make(chan struct{})
ch <- struct{}{}
```

------

## 7. if 判断语法简化

Go 支持在 `if` 条件前定义变量：

```go
if n := "abc"; x < 0 {
    println(n[1])
}
```

等价于：

```go
n := "abc"
if x < 0 {
    println(n[1])
}
```

> 注意：`else if` 与 `else` 的左大括号应与条件语句在同一行。

------
