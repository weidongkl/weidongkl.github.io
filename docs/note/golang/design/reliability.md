# Golang 可靠性编程指南  
本文档聚焦于**高可靠性 Go 应用的设计原则与实践**，涵盖错误处理、资源管理、并发控制等核心场景。

---

## 1. 错误处理：显式捕获与传递
```go
// 永远忽略错误 = 埋下定时炸弹
func ReadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        // 追加上下文信息向上传递
        return nil, fmt.Errorf("read config failed: %w", err)
    }
    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("parse config failed: %w", err)
    }
    return &cfg, nil
}

// 调用方必须处理错误
cfg, err := ReadConfig("config.json")
if err != nil {
    log.Fatalf("Fatal error: %v", err) // 或优雅降级
}
```

---

## 2. 资源管理：`defer` 确保释放
```go
func ProcessFile(path string) error {
    file, err := os.Open(path)
    if err != nil {
        return err
    }
    defer file.Close() // 无论函数如何退出都会执行

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        // 处理数据
    }
    return scanner.Err() // 返回扫描错误
}
```
> **关键点**：对数据库连接、网络句柄等资源同样适用。

---

## 3. 并发安全：避免竞态条件
```go
type SafeCounter struct {
    mu    sync.Mutex
    count int
}

func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock() // defer 解锁确保异常安全
    c.count++
}

// 使用 sync/atomic 的无锁优化
var atomicCount int64
atomic.AddInt64(&atomicCount, 1) // 原子操作
```
> **检测工具**：`go run -race your_app.go`

---

## 4. 超时控制：防止无限阻塞
```go
func FetchData(ctx context.Context, url string) ([]byte, error) {
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    return io.ReadAll(resp.Body)
}

// 调用方设置超时
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()
data, err := FetchData(ctx, "https://api.example.com")
```

---

## 5. 优雅退出：信号处理与清理
```go
func main() {
    stop := make(chan os.Signal, 1)
    signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

    server := &http.Server{Addr: ":8080"}
    go func() {
        if err := server.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    <-stop // 阻塞等待终止信号
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := server.Shutdown(ctx); err != nil { // 优雅关闭
        log.Printf("Forced shutdown: %v", err)
    }
}
```

---

## 6. 防御性编程：输入校验
```go
func ValidateInput(input UserInput) error {
    if input.Email == "" {
        return errors.New("email cannot be empty")
    }
    if !strings.Contains(input.Email, "@") {
        return errors.New("invalid email format")
    }
    if input.Age < 18 {
        return errors.New("age must be >= 18")
    }
    return nil
}

// 在入口处强制校验
err := ValidateInput(req.Data)
if err != nil {
    http.Error(w, err.Error(), http.StatusBadRequest)
    return
}
```

---

## 7. 测试覆盖率：验证可靠性
```go
// 单元测试 + 错误注入
func TestReadConfig_FileNotExist(t *testing.T) {
    _, err := ReadConfig("non_existent.json")
    if err == nil {
        t.Fatal("Expected error but got nil")
    }
    if !os.IsNotExist(err) {
        t.Errorf("Unexpected error: %v", err)
    }
}

// 压力测试
func BenchmarkConcurrentIncrement(b *testing.B) {
    counter := SafeCounter{}
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            counter.Increment()
        }
    })
}
```
> **目标**：核心逻辑覆盖率 > 80%，错误分支必须覆盖。

---

## **最佳实践总结**
| 原则           | 实现方式                    |
| -------------- | --------------------------- |
| **快速失败**   | 输入校验前置 + 立即返回错误 |
| **资源零泄漏** | `defer` + 上下文取消传播    |
| **并发安全**   | `sync.Mutex` / `atomic`     |
| **超时控制**   | `context.WithTimeout`       |
| **优雅终止**   | 信号处理 + 清理协程         |
| **可观测性**   | 结构化日志 + Metrics 埋点   |

> **工具链**：  
> - 竞态检测：`go build -race`  
> - 性能分析：`pprof` + `go tool trace`  
> - 依赖检查：`go mod why`/`go mod vendor`  

通过严格执行以上规范，可显著提升 Go 服务的可靠性水平。
