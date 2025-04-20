---
sidebar_position: 2
---
# microkernel 设计2

[microkernel 设计1](./microkernel1) 目前只支持服务发送消息，内核接受消息。

在本章节，我会增加内核发送消息到服务

## 1. 目标

- 内核发送消息到服务

---

## 2. 代码改动

### 2.1 Kernel（核心）

服务增加消息处理方法

```go
// kernel/kernel.go
type Service interface {
	Start() error
	Stop() error
	Name() string
    // 增加消息处理方法
	Handle(msg string) string
}
```
事件增加发送地址

```go
// kernel/kernel.go
// Event 定义内核事件（用于服务间通信）
type Event struct {
	To      string
	From    string
	Type    string
	Content string
}
```

内核发送事件到服务

```go
// kernel/kernel.go
// HandleEvent 处理事件（模拟服务间通信）
func (k *Kernel) HandleEvent(evt Event) (msg string) {
	k.mutex.RLock()
	defer k.mutex.RUnlock()

	if svc, ok := k.services[evt.To]; ok {
		return svc.Handle(evt.Content)
	}
	return "service not found"
}
```



---

### 2.2 LogService 

增加Handle方法实现

```go
// service/log.go
// service 增加Handle接口实现
func (l *LogService) Handle(msg string) string {
	fmt.Printf("[%s] LOG handle kernel event: %s\n", l.name, msg)
	return fmt.Sprintf("[%s] LOG Handle: %s\n", l.name, msg)
}
```

---

### 2.3 主程序（运行微内核 + 服务）

kernel发送消息到service

```go
// main.go
// 6. microKernel 发送事件到指定服务
	microKernel.HandleEvent(kernel.Event{
		From:    "microKernel",
		To:      "logger",
		Type:    "log",
		Content: "Hello, Log!",
	})
	time.Sleep(1 * time.Millisecond)
```

---

### 2.4 运行结果
```
[logger] starting...
[logger] LOG: Hello, Microkernel!
[Kernel] Event from logger: log - Hello, Microkernel!
[logger] LOG handle kernel event: Hello, Log!
[logger] stopping...
```

查看[完整代码](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/microkernel/microkernel2)
