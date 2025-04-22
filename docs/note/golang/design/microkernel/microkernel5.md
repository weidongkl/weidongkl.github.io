---
sidebar_position: 5
---
# microkernel 设计5

## 1. 目标

- 服务状态管理
- 单独服务管理
- 优化项目结构

## 2. 代码改动

### 2.1 Kernel（核心）

定义服务状态和服务元数据

```go
// kernel/service.go
// ServiceState 定义微内核服务状态
type ServiceState int

// 使用iota枚举类型，自动计算枚举值
const (
	Created ServiceState = iota
	Running
	Stopped
)

// ServiceState.String()
func (s ServiceState) String() string {
	// 状态转换成字符串
	// 其中[...]表示让编译器自动计算数组的长度
	return [...]string{"Created", "Running", "Stopped"}[s]
}

// serviceMeta 定义微内核服务元数据
type serviceMeta struct {
	svc   Service
	state ServiceState
}

```

单个服务管理

```go
// kernel/kernel.go

func (k *MicroKernel) StartService(name string) error {
	k.mu.Lock()
	defer k.mu.Unlock()
	meta, ok := k.services[name]
	if !ok {
		return errors.New("service not registered")
	}
	if meta.state == Running {
		return errors.New("service already started")
	}
	if err := meta.svc.Start(); err != nil {
		return err
	}
	meta.state = Running
	fmt.Println("Started:", meta.svc.Name())
	return nil
}

func (k *MicroKernel) StopService(name string) error {
	k.mu.Lock()
	defer k.mu.Unlock()
	meta, ok := k.services[name]
	if !ok {
		return errors.New("service not registered")
	}
	if meta.state == Stopped {
		return errors.New("service already stopped")
	}
	if err := meta.svc.Stop(); err != nil {
		return err
	}
	meta.state = Stopped
	fmt.Println("Stopped:", meta.svc.Name())
	return nil
}

```

Listen 增加服务状态判断，未运行的服务，不再处理消息

```go
// Listen 事件循环（处理服务间通信）
// 监听事件，处理服务间通信
// 重命名 EventLoop 为 Listen
func (k *MicroKernel) Listen(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case evt := <-k.eventCh:
			fmt.Printf("[MicroKernel] Event from %s: - %s\n", evt.From, evt.Content)
			// 发送给 MicroKernel 自己
			if evt.To == "" {
				if evt.ReplyCh != nil {
					evt.ReplyCh <- Reply{Code: 0, Message: "Handled by kernel", Data: "ok"}
				}
				continue
			}
			// 路由到目标服务
			k.mu.RLock()
			meta, ok := k.services[evt.To]
			k.mu.RUnlock()

			if !ok || meta.state != Running {
				if evt.ReplyCh != nil {
					evt.ReplyCh <- Reply{Code: 404, Message: "service unavailable", Data: ""}
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
			}(meta.svc, evt)
		}
	}
}

```

---

### 2.2 运行结果

```bash
Registered: logger
Registered: echo
Starting all services...
[logger] starting...
[echo] starting...
[logger] LOG: Hello, Microkernel!
[MicroKernel] Event from logger: - Hello, Microkernel!
[logger] got reply from kernel: Handled by kernel
[logger] LOG: Hello, Echo!
[MicroKernel] Event from logger: - Hello, Echo!
[logger] got reply from kernel: echo service handled
[MicroKernel] Send Event to unknown: Hello, Log!
{404 Not found service }
[logger] stopping...
[echo] stopping...
```

查看[完整代码](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/microkernel/microkernel5)

