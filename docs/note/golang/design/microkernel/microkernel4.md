---
sidebar_position: 4
---
# microkernel 设计4

## 1. 目标

- **服务间通信（通过内核转发）** 
- **标准化消息协议结构**  
  支持状态码、错误、数据负载。
- **异步+超时机制**  
  服务发出请求时可以设置超时时间，避免长期阻塞。

## 2. 代码改动

### 2.1 Kernel（核心）

定义标准消息格式

- Reply 包含code/message/Data
- Event ReplyCh 使用标准格式的Reply

```go
// kernel/kernel.go
// Reply 定义内核事件回复
type Reply struct {
	Code    int    // 0 表示成功，非0表示错误码
	Message string // 描述信息
	Data    string // 可选负载
}
// Event 定义内核事件（用于服务间通信）
type Event struct {
	To      string
	From    string
	Type    string
	Content string
	// 增加响应通道,使用 chan Reply，提高回复的灵活性
	ReplyCh chan Reply
	// 可选：超时时间
	TimeoutMs int
}
```

服务改造

- handle 从处理字符串修改为处理事件，返回标准Reply

```go
// kernel/kernel.go
// Service 定义微内核的服务接口
// 使用接口定义代替固定的struct,低耦合设计。
type Service interface {
	Start() error
	Stop() error
	Name() string
	Handle(Event) Reply
}
```

Listen 路由和事件总线设计

```go
// Listen 事件循环（处理服务间通信）
// 监听事件，处理服务间通信
// 重命名 EventLoop 为 Listen
func (k *Kernel) Listen(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case evt := <-k.eventCh:
			fmt.Printf("[Kernel] Event from %s: - %s\n", evt.From, evt.Content)
			// 发送给 Kernel 自己
			if evt.To == "" {
				if evt.ReplyCh != nil {
					evt.ReplyCh <- Reply{Code: 0, Message: "Handled by kernel", Data: "ok"}
				}
				continue
			}
			// 路由到目标服务
			k.mu.RLock()
			svc, ok := k.services[evt.To]
			k.mu.RUnlock()

			if !ok {
				if evt.ReplyCh != nil {
					evt.ReplyCh <- Reply{Code: 404, Message: "Service not found", Data: ""}
				}
				continue
			}
			// 调用目标服务处理，并返回
			go func(s Service, m Event) {
				result := s.Handle(m)
				if m.ReplyCh != nil {
					select {
					case m.ReplyCh <- result:
					case <-time.After(time.Duration(m.TimeoutMs) * time.Millisecond):
						m.ReplyCh <- Reply{Code: 408, Message: "timeout", Data: ""}
					}
				}
			}(svc, evt)
		}
	}
}
```

---

### 2.2 LogService 

根据count随机分发（Push 指定了发送位置）

```go
func (l *LogService) run() {
	var count = 1
	for {
		count++
		select {
		case <-l.stopCh:
			return
		case log := <-l.logCh:
			fmt.Printf("[%s] LOG: %s\n", l.name, log)
			// 模拟发送事件到内核
			replyCh := make(chan kernel.Reply, 1)
			if count%2 == 0 {
				l.kernel.Push(kernel.Event{
					From:      l.name,
					Type:      "log",
					Content:   log,
					ReplyCh:   replyCh,
					TimeoutMs: 1000,
				})
			} else {
				l.kernel.Push(kernel.Event{
					From:      l.name,
					Type:      "log",
					To:        "echo",
					Content:   log,
					ReplyCh:   replyCh,
					TimeoutMs: 1000,
				})
			}
			// 等待内核回应
			reply := <-replyCh
			fmt.Printf("[%s] got reply from kernel: %s\n", l.Name(), reply.Message)
		}
	}
}
```

---

### 2.3 增加另一个类似的EchoService

```go
func (e *EchoService) Handle(evt kernel.Event) kernel.Reply {
	return kernel.Reply{Code: 0, Message: "echo service handled", Data: fmt.Sprintf("from %s: %s", evt.From, evt.Content)}
}
```

### 2.4 运行结果

```bash
Registered: logger
# 注册另一个服务
Registered: echo
[logger] starting...
[echo] starting...
[logger] LOG: Hello, Microkernel!
[Kernel] Event from logger: - Hello, Microkernel!
[logger] got reply from kernel: Handled by kernel
[logger] LOG: Hello, Echo!
[Kernel] Event from logger: - Hello, Echo!
# 转发到echoService 处理
[logger] got reply from kernel: echo service handled
[Kernel] Send Event to logger: Hello, Log!
[logger] LOG handle kernel event: Hello, Log!
[logger] stopping...
[echo] stopping...

```

查看[完整代码](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/microkernel/microkernel4)

