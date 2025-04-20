---
sidebar_position: 3
---
# microkernel 设计3

## 1. 目标

- 服务 能**读取 Kernel 的返回信息**

实现方法参考链接：

- [gitee](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/multi_goroutine.md)
- [weidongkl.github.io](https://weidongkl.github.io/docs/note/golang/design/multi_goroutine/)

---

## 2. 代码改动

可以为每个 Service 提供一个专属的响应通道（channel），内核通过这个通道将处理结果或反馈信息“推送”回去。

- 每次发送消息附带一个 `ReplyCh`。
- 内核在收到消息后通过该通道写回响应。
- Service 读取 `ReplyCh` 获取反馈。

### 2.1 Kernel（核心）

事件增加读取返回的channel

```go
// kernel/kernel.go
// Event 定义内核事件（用于服务间通信）
type Event struct {
	To      string
	From    string
	Type    string
	Content string
	// 增加响应通道
	ReplyCh chan string
}
```

listen 增加返回值得写入

```go
// kernel/kernel.go
func (k *Kernel) Listen(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case evt := <-k.eventCh:
			fmt.Printf("[Kernel] Event from %s: %s - %s\n", evt.From, evt.Type, evt.Content)
            // 增加返回的写入
			if evt.ReplyCh != nil {
				evt.ReplyCh <- fmt.Sprintf("ack: %s", evt.Content)
			}
		}
	}
}
```



---

### 2.2 LogService 

服务增加返回的读取

```go
func (l *LogService) run() {
	for {
		select {
		case <-l.stopCh:
			return
		case log := <-l.logCh:
			fmt.Printf("[%s] LOG: %s\n", l.name, log)
			// 模拟发送事件到内核
			replyCh := make(chan string, 1)
			l.kernel.Push(kernel.Event{
				From:    l.name,
				Type:    "log",
				Content: log,
				ReplyCh: replyCh,
			})
			// 等待内核回应
			reply := <-replyCh
			fmt.Printf("[%s] got reply from kernel: %s\n", l.Name(), reply)
		}
	}
}// service/log.go
// service 增加Handle接口实现
func (l *LogService) Handle(msg string) string {
	fmt.Printf("[%s] LOG handle kernel event: %s\n", l.name, msg)
	return fmt.Sprintf("[%s] LOG Handle: %s\n", l.name, msg)
}
```

---

### 2.3 运行结果
```
Registered: logger
[logger] starting...
[logger] LOG: Hello, Microkernel!
[Kernel] Event from logger: log - Hello, Microkernel!
[logger] got reply from kernel: ack: Hello, Microkernel!
[Kernel] Send Event to logger: Hello, Log!
[logger] LOG handle kernel event: Hello, Log!
[logger] stopping...
```

查看[完整代码](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/microkernel/microkernel3)

