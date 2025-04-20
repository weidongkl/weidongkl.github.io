package kernel

import (
	"context"
	"errors"
	"fmt"
	"sync"
)

// Service 定义微内核的服务接口
// 使用接口定义代替固定的struct,低耦合设计。
type Service interface {
	Start() error
	Stop() error
	Name() string
	Handle(msg string) string
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
func (k *Kernel) Send(evt Event) (msg string) {
	k.mu.RLock()
	defer k.mu.RUnlock()

	if svc, ok := k.services[evt.To]; ok {
		return svc.Handle(evt.Content)
	}
	return "service not found"
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
			fmt.Printf("[Kernel] Event from %s: %s - %s\n", evt.From, evt.Type, evt.Content)
		}
	}
}
