package kernel

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"
)

// Service 定义微内核的服务接口
// 使用接口定义代替固定的struct,低耦合设计。
type Service interface {
	Start() error
	Stop() error
	Name() string
	Handle(Event) Reply
}

// Kernel 微内核核心
type Kernel struct {
	// 注册的服务通道
	services map[string]Service
	// 保护 services 的并发访问
	// 重命名mutex 为mu
	mu sync.RWMutex
	// 全局事件总线
	eventCh chan Event
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

// Reply 定义内核事件回复
type Reply struct {
	Code    int    // 0 表示成功，非0表示错误码
	Message string // 描述信息
	Data    string // 可选负载
}

// NewKernel 创建微内核实例
func NewKernel() *Kernel {
	return &Kernel{
		services: make(map[string]Service),
		eventCh:  make(chan Event, 100),
	}
}

// Register 注册服务
// 重命名 RegisterService 为 Register
func (k *Kernel) Register(svc Service) error {
	k.mu.Lock()
	defer k.mu.Unlock()

	name := svc.Name()
	if _, ok := k.services[name]; ok {
		return errors.New("service already registered")
	}
	k.services[name] = svc
	fmt.Println("Registered:", svc.Name())
	return nil
}

// StartAll 启动所有服务
func (k *Kernel) StartAll() error {
	k.mu.RLock()
	defer k.mu.RUnlock()

	for _, s := range k.services {
		if err := s.Start(); err != nil {
			return err
		}
	}
	return nil
}

// StopAll 停止所有服务
func (k *Kernel) StopAll() error {
	k.mu.RLock()
	defer k.mu.RUnlock()

	var err error
	for _, s := range k.services {
		if e := s.Stop(); e != nil {
			err = e
		}
	}
	return err
}

// Push 发送事件到内核（模拟 IPC）
// SendEvent 重命名为 Push
func (k *Kernel) Push(evt Event) {
	k.eventCh <- evt
}

// Send 处理事件（模拟服务间通信）
// HandleEvent 重命名为 Send
func (k *Kernel) Send(evt Event) (msg Reply) {
	k.mu.RLock()
	defer k.mu.RUnlock()
	fmt.Printf("[Kernel] Send Event to %s: %s\n", evt.To, evt.Content)

	if svc, ok := k.services[evt.To]; ok {
		return svc.Handle(evt)
	} else {
		return Reply{Code: 404, Message: "Not found service", Data: ""}
	}
}

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
