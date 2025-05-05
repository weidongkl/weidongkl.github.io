---
sidebar_position: 3
---

# 开闭原则(OCP)

## 1. 开闭原则简介

**开闭原则(Open/Closed Principle, OCP)** 是SOLID原则中的第二个原则，由Bertrand Meyer提出。其核心思想是：

> 软件实体（类、模块、函数等）应该对扩展开放，对修改关闭。

在Go语言中，这一原则主要通过**接口(interface)**和**组合(composition)**来实现。

## 2. OCP的核心概念

- **对扩展开放**：允许在不修改现有代码的情况下添加新功能
- **对修改关闭**：现有代码应尽可能不被修改，以保持稳定性
- **抽象是关键**：通过抽象建立灵活的基础结构

## 3. Go语言中的OCP实现方式

### 3.1 使用接口实现OCP

```go
// 支付方式接口 - 抽象层
type PaymentMethod interface {
    Pay(amount float64) error
}

// 信用卡支付实现
type CreditCardPayment struct{}

func (c *CreditCardPayment) Pay(amount float64) error {
    fmt.Printf("支付 %.2f 元使用信用卡\n", amount)
    return nil
}

// 支付宝支付实现
type AlipayPayment struct{}

func (a *AlipayPayment) Pay(amount float64) error {
    fmt.Printf("支付 %.2f 元使用支付宝\n", amount)
    return nil
}

// 支付处理器 - 对修改关闭
type PaymentProcessor struct {
    method PaymentMethod
}

func (p *PaymentProcessor) ProcessPayment(amount float64) error {
    return p.method.Pay(amount)
}
```

### 3.2 添加新支付方式（扩展）

```go
// 新增微信支付 - 扩展而非修改
type WeChatPayment struct{}

func (w *WeChatPayment) Pay(amount float64) error {
    fmt.Printf("支付 %.2f 元使用微信支付\n", amount)
    return nil
}

// 使用方式
func main() {
    processor := &PaymentProcessor{method: &WeChatPayment{}}
    processor.ProcessPayment(100.50)
}
```

## 4. 违反OCP的示例与重构

### 4.1 违反OCP的代码

```go
type PaymentType int

const (
    CreditCard PaymentType = iota
    Alipay
)

// 直接依赖具体实现
func ProcessPayment(paymentType PaymentType, amount float64) error {
    switch paymentType {
    case CreditCard:
        fmt.Printf("支付 %.2f 元使用信用卡\n", amount)
    case Alipay:
        fmt.Printf("支付 %.2f 元使用支付宝\n", amount)
    default:
        return fmt.Errorf("不支持的支付方式")
    }
    return nil
}
```

**问题**：每次新增支付方式都需要修改ProcessPayment函数

### 4.2 重构为符合OCP的代码

```go
// 使用接口抽象
type PaymentMethod interface {
    Pay(amount float64) error
}

// 注册支付方式的处理器
type PaymentHandler struct {
    methods map[string]PaymentMethod
}

func (h *PaymentHandler) Register(name string, method PaymentMethod) {
    h.methods[name] = method
}

func (h *PaymentHandler) Process(name string, amount float64) error {
    if method, ok := h.methods[name]; ok {
        return method.Pay(amount)
    }
    return fmt.Errorf("支付方式未注册")
}
```

## 5. Go语言中实践OCP的高级技巧

### 5.1 函数选项模式(Functional Options)

```go
type Server struct {
    host string
    port int
    timeout time.Duration
}

type Option func(*Server)

func WithHost(host string) Option {
    return func(s *Server) {
        s.host = host
    }
}

func WithPort(port int) Option {
    return func(s *Server) {
        s.port = port
    }
}

func NewServer(opts ...Option) *Server {
    s := &Server{
        host:    "localhost",
        port:    8080,
        timeout: 30 * time.Second,
    }
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

### 5.2 中间件模式

```go
type Handler func(http.ResponseWriter, *http.Request)

func LoggingMiddleware(next Handler) Handler {
    return func(w http.ResponseWriter, r *http.Request) {
        log.Printf("请求开始: %s %s", r.Method, r.URL.Path)
        next(w, r)
        log.Printf("请求结束: %s %s", r.Method, r.URL.Path)
    }
}

func AuthMiddleware(next Handler) Handler {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Header.Get("Authorization") == "" {
            http.Error(w, "未授权", http.StatusUnauthorized)
            return
        }
        next(w, r)
    }
}
```

## 6. OCP的实际应用场景

1. **支付系统**（如上面的示例）
2. **日志系统**（文件日志、控制台日志、网络日志等）
3. **数据存储**（MySQL、MongoDB、Redis等）
4. **通知系统**（邮件、短信、微信通知等）
5. **中间件管道**（Web中间件、RPC拦截器等）

## 7. OCP的日志系统

- 控制台输出
- 文件输出
- 未来可以轻松添加网络日志

### 7.1 基础设计

#### 7.1.1 定义日志接口（抽象层）

```go
// Logger 日志接口 - 核心抽象
type Logger interface {
    Log(level string, message string) error
    Close() error
}
```

#### 7.1.2 实现具体日志输出

**控制台日志输出**

```go
// ConsoleLogger 控制台日志实现
type ConsoleLogger struct {
    // 可以添加需要的字段，如是否彩色输出等
}

func NewConsoleLogger() *ConsoleLogger {
    return &ConsoleLogger{}
}

func (c *ConsoleLogger) Log(level string, message string) error {
    _, err := fmt.Printf("[%s] %s\n", level, message)
    return err
}

func (c *ConsoleLogger) Close() error {
    // 控制台日志无需关闭资源
    return nil
}
```

**文件日志输出**

```go
// FileLogger 文件日志实现
type FileLogger struct {
    file *os.File
}

func NewFileLogger(filename string) (*FileLogger, error) {
    file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        return nil, err
    }
    return &FileLogger{file: file}, nil
}

func (f *FileLogger) Log(level string, message string) error {
    _, err := fmt.Fprintf(f.file, "[%s] %s %s\n", time.Now().Format("2006-01-02 15:04:05"), level, message)
    return err
}

func (f *FileLogger) Close() error {
    return f.file.Close()
}
```

### 7.2 组合日志器（支持多种输出）

```go
// CompositeLogger 组合多个日志输出
type CompositeLogger struct {
    loggers []Logger
}

func NewCompositeLogger(loggers ...Logger) *CompositeLogger {
    return &CompositeLogger{loggers: loggers}
}

func (c *CompositeLogger) Log(level string, message string) error {
    for _, logger := range c.loggers {
        if err := logger.Log(level, message); err != nil {
            return err
        }
    }
    return nil
}

func (c *CompositeLogger) Close() error {
    for _, logger := range c.loggers {
        if err := logger.Close(); err != nil {
            return err
        }
    }
    return nil
}
```

### 7.3 使用工厂方法创建日志器

```go
// LoggerType 定义日志类型
type LoggerType string

const (
    LoggerConsole LoggerType = "console"
    LoggerFile    LoggerType = "file"
    // 未来可以添加 LoggerNetwork
)

// LoggerConfig 日志配置
type LoggerConfig struct {
    Type     LoggerType
    FilePath string // 仅文件日志需要
}

// NewLoggerFromConfig 根据配置创建日志器
func NewLoggerFromConfig(config LoggerConfig) (Logger, error) {
    switch config.Type {
    case LoggerConsole:
        return NewConsoleLogger(), nil
    case LoggerFile:
        return NewFileLogger(config.FilePath)
    default:
        return nil, fmt.Errorf("未知的日志类型: %s", config.Type)
    }
}
```

### 7.4 添加网络日志输出（扩展示例）

未来需要添加网络日志时，只需新增实现，无需修改现有代码：

```go
// NetworkLogger 网络日志实现
type NetworkLogger struct {
    endpoint string
    client   *http.Client
}

func NewNetworkLogger(endpoint string) *NetworkLogger {
    return &NetworkLogger{
        endpoint: endpoint,
        client:   &http.Client{Timeout: 5 * time.Second},
    }
}

func (n *NetworkLogger) Log(level string, message string) error {
    data := map[string]string{
        "level":   level,
        "message": message,
        "time":    time.Now().Format(time.RFC3339),
    }
    jsonData, _ := json.Marshal(data)
    
    resp, err := n.client.Post(n.endpoint, "application/json", bytes.NewBuffer(jsonData))
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode >= 400 {
        return fmt.Errorf("日志服务器返回错误状态码: %d", resp.StatusCode)
    }
    return nil
}

func (n *NetworkLogger) Close() error {
    // 可以在这里关闭长连接等资源
    return nil
}
```

## 7.5 完整使用示例

```go
func main() {
    // 创建控制台日志器
    consoleLogger := NewConsoleLogger()
    
    // 创建文件日志器
    fileLogger, err := NewFileLogger("app.log")
    if err != nil {
        panic(err)
    }
    
    // 创建组合日志器
    compositeLogger := NewCompositeLogger(consoleLogger, fileLogger)
    
    // 使用日志
    compositeLogger.Log("INFO", "应用程序启动")
    compositeLogger.Log("WARN", "这是一个警告信息")
    compositeLogger.Log("ERROR", "发生了一个错误")
    
    // 关闭所有日志器
    if err := compositeLogger.Close(); err != nil {
        fmt.Printf("关闭日志器时出错: %v\n", err)
    }
    
    // 未来添加网络日志
    networkLogger := NewNetworkLogger("http://log-server.example.com/log")
    extendedLogger := NewCompositeLogger(consoleLogger, fileLogger, networkLogger)
    extendedLogger.Log("INFO", "这条日志会输出到控制台、文件和网络")
    extendedLogger.Close()
}
```

## 8. 总结

- OCP的核心是通过抽象来隔离变化
- 在Go中主要使用接口和组合来实现OCP
- 函数选项模式和中间件模式是实践OCP的优雅方式
- 平衡原则：不要过度设计，只为预期的变化做抽象

**好的设计应该像插件系统一样工作 - 通过添加新代码而非修改现有代码来扩展功能**。