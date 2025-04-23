package microkernel

import (
	"context"
	"errors"
	"fmt"
	"microkernel/logger"
	"os"
	"sync"
	"time"
)

// MicroKernel 微内核核心
type MicroKernel struct {
	// 注册的服务通道
	services map[string]*serviceMeta // 去除meta后可以直接修改，services map 就同步修改了
	// 保护 services 的并发访问
	// 重命名mutex 为mu
	mu sync.RWMutex
	// 全局事件总线
	eventCh chan Event
	// 日志
	log *logger.Logger
}

// NewMicroKernel 创建微内核实例
func NewMicroKernel() *MicroKernel {
	return &MicroKernel{
		services: make(map[string]*serviceMeta),
		eventCh:  make(chan Event, 100),
		log:      logger.NewLogger("kernel", logger.INFO, os.Stdout),
	}
}

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

// StartAll 启动所有服务
func (k *MicroKernel) StartAll() error {
	sorted, err := k.topoSort()
	if err != nil {
		return err
	}
	fmt.Println("Starting all services...")
	fmt.Println("Services:", sorted)
	for _, name := range sorted {
		err := k.StartService(name)
		if err != nil {
			return err
		}
	}
	return nil
}

// StopAll 停止所有服务
func (k *MicroKernel) StopAll() error {
	sorted, err := k.topoSort()
	if err != nil {
		return err
	}
	fmt.Println("Stopping all services...")
	// 逆序停止服务
	for i := len(sorted) - 1; i >= 0; i-- {
		err := k.StopService(sorted[i])
		if err != nil {
			return err
		}
	}
	return nil
}

func (k *MicroKernel) topoSort() ([]string, error) {
	k.mu.RLock()
	defer k.mu.RUnlock()

	visited := make(map[string]bool)
	temp := make(map[string]bool)
	var result []string
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

// Push 发送事件到内核（模拟 IPC）
// SendEvent 重命名为 Push
func (k *MicroKernel) Push(evt Event) {
	k.eventCh <- evt
}

// Send 处理事件（模拟服务间通信）
// HandleEvent 重命名为 Send
func (k *MicroKernel) Send(evt Event) (msg Reply) {
	k.mu.RLock()
	defer k.mu.RUnlock()
	fmt.Printf("[MicroKernel] Send Event to %s: %s\n", evt.To, evt.Content)

	if meta, ok := k.services[evt.To]; ok {
		return meta.svc.Handle(evt)
	} else {
		return Reply{Code: 404, Message: "Not found service", Data: ""}
	}
}

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

// ReplaceService 热更新服务
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
		svc:   newSvc,
		deps:  newSvc.Dependencies(),
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
