---
sidebar_position: 7
---
# microkernel 设计7

## 1. 目标

- 支持服务热更新
- 所有服务和内核通过统一接口打印日志
  - 时间戳、服务名、级别（INFO/WARN/ERROR）
  - 动态控制日志级别
  - 输出到 `stdout`、文件、远程服务等
- xxx

## 2. 代码改动

### 2.1 Kernel（核心）

新增`ReplaceService` 用于热替换服务

```go
// kernel/kernel.go
func (k *MicroKernel) ReplaceService(newSvc Service) error {
    k.mu.Lock()
    defer k.mu.Unlock()

    name := newSvc.Name()
    oldMeta, exists := k.services[name]

    if exists && oldMeta.state == Running {
        // 停止旧服务
        oldMeta.svc.Stop()
        fmt.Printf("Stopped old version of %s\n", name)
    }

    // 替换服务实现，重建元信息
    k.services[name] = &serviceMeta{
        svc:  newSvc,
        deps: newSvc.Dependencies(),
        state: Created,
    }

    // 重启服务（如旧服务在运行）
    if exists && oldMeta.state == Running {
        newSvc.Start()
        k.services[name].state = Running
        fmt.Printf("Started new version of %s\n", name)
    } else {
        fmt.Printf("Registered new version of %s (not started)\n", name)
    }

    return nil
}
```

注册Register增加deps

```go
// kernel/kernel.go

// Register 注册服务
// 重命名 RegisterService 为 Register
func (k *MicroKernel) Register(svc Service) error {
	k.mu.Lock()
	defer k.mu.Unlock()

	name := svc.Name()
	if _, ok := k.services[name]; ok {
		return errors.New("service already registered")
	}
	k.services[name] = &serviceMeta{
		svc:   svc,
		state: Created,
		deps:  svc.Dependencies(),
	}
	fmt.Println("Registered:", svc.Name())
	return nil
}
```

启动服务和停止服务增加拓扑排序

```go
// kernel/kernel.go
func (k *MicroKernel) topoSort() ([]string, error) {
    k.mu.RLock()
    defer k.mu.RUnlock()

    visited := make(map[string]bool)
    temp := make(map[string]bool)
    result := []string{}
    var visit func(string) error

    visit = func(name string) error {
        if temp[name] {
            return fmt.Errorf("circular dependency at %s", name)
        }
        if visited[name] {
            return nil
        }
        temp[name] = true
        meta, ok := k.services[name]
        if !ok {
            return fmt.Errorf("service %s not registered", name)
        }
        for _, dep := range meta.deps {
            if err := visit(dep); err != nil {
                return err
            }
        }
        visited[name] = true
        temp[name] = false
        result = append(result, name)
        return nil
    }

    for name := range k.services {
        if !visited[name] {
            if err := visit(name); err != nil {
                return nil, err
            }
        }
    }

    return result, nil
}

func (k *MicroKernel) StartAll() error {
    sorted, err := k.topoSort()
    // ...
    for _, name := range sorted {
        if err := k.StartService(name); err != nil {
            // ...
        }
    }
    return nil
}
```
---

### 2.2 日志服务

日志服务设计

```go
type LogLevel int

const (
    INFO LogLevel = iota
    WARN
    ERROR
)

type Logger struct {
    mu      sync.Mutex
    level   LogLevel
    service string
    out     io.Writer
}
```

方法实现

```go
func NewLogger(service string, level LogLevel, out io.Writer) *Logger {
    return &Logger{
        service: service,
        level:   level,
        out:     out,
    }
}

func (l *Logger) logf(level LogLevel, format string, args ...any) {
    if level < l.level {
        return
    }
    l.mu.Lock()
    defer l.mu.Unlock()
    levelStr := [...]string{"INFO", "WARN", "ERROR"}[level]
    msg := fmt.Sprintf(format, args...)
    ts := time.Now().Format("2006-01-02 15:04:05.000")
    fmt.Fprintf(l.out, "[%s] [%s] [%s] %s\n", ts, levelStr, l.service, msg)
}

func (l *Logger) Infof(format string, args ...any)  { l.logf(INFO, format, args...) }
func (l *Logger) Warnf(format string, args ...any)  { l.logf(WARN, format, args...) }
func (l *Logger) Errorf(format string, args ...any) { l.logf(ERROR, format, args...) }
```

服务中使用

```go
type EchoServiceV3 struct {
    log *Logger
}

func NewEchoServiceV3() *EchoServiceV3 {
    return &EchoServiceV3{
        log: NewLogger("echo", INFO, os.Stdout),
    }
}

//...
func (e *EchoServiceV3) Start() {
    e.log.Infof("started")
}
```

### 2.3 main

热替换服务

```go
// 7. 热替换服务
	// 热更新为 V2
	_ = microKernel.ReplaceService(service.NewEchoServiceV2(microKernel))

	// 测试 V2 行为
	replyCh2 := make(chan microkernel.Reply, 1)
	microKernel.Push(microkernel.Event{
		From:      "main",
		Type:      "log",
		Content:   "log",
		ReplyCh:   replyCh2,
		TimeoutMs: 1000,
	})
	fmt.Println("v2 reply:", <-replyCh2)

```



### 2.4 运行结果

```bash
Registered: logger
Registered: echo
Starting all services...
Services: [echo logger]
[echo] starting...
Started: echo
[logger] starting...
Started: logger
[logger] LOG: Hello, Microkernel!
[MicroKernel] Event from logger: - Hello, Microkernel!
[logger] got reply from kernel: Handled by kernel
[logger] LOG: Hello, Echo!
[MicroKernel] Event from logger: - Hello, Echo!
[logger] got reply from kernel: echo service handled
[MicroKernel] Send Event to unknown: Hello, Log!
{404 Not found service }
[echo] stopping...
Stopped old version of echo
[2025-04-23 21:46:11.935] [INFO] [echo] [echov2] starting...

Started new version of echo
[MicroKernel] Event from main: - log
v2 reply: {0 Handled by kernel ok}
Stopping all services...
[logger] stopping...
Stopped: logger
[echov2] stopping...
[log] stopping
Stopped: echo
Registered: logger
Registered: echo
Starting all services...
Services: [echo logger]
[echo] starting...
Started: echo
[logger] starting...
Started: logger
[logger] LOG: Hello, Microkernel!
[MicroKernel] Event from logger: - Hello, Microkernel!
[logger] got reply from kernel: Handled by kernel
[logger] LOG: Hello, Echo!
[MicroKernel] Event from logger: - Hello, Echo!
[logger] got reply from kernel: echo service handled
[MicroKernel] Send Event to unknown: Hello, Log!
{404 Not found service }
Stopping all services...
[logger] stopping...
Stopped: logger
[echo] stopping...
Stopped: echo
```

查看[完整代码](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/microkernel/microkernel7)

