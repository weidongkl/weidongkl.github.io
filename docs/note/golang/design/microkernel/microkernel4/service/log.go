package service

import (
	"fmt"
	"microkernel/kernel"
)

// LogService 日志服务
type LogService struct {
	name   string
	kernel *kernel.Kernel
	logCh  chan string
	stopCh chan struct{}
}

func NewLogService(name string, kernel *kernel.Kernel) *LogService {
	return &LogService{
		name:   name,
		kernel: kernel,
		logCh:  make(chan string, 100),
		stopCh: make(chan struct{}),
	}
}

func (l *LogService) Start() error {
	fmt.Printf("[%s] starting...\n", l.name)
	go l.run()
	return nil
}

func (l *LogService) Stop() error {
	fmt.Printf("[%s] stopping...\n", l.name)
	close(l.stopCh)
	return nil
}

func (l *LogService) Name() string {
	return l.name
}

func (l *LogService) Handle(evt kernel.Event) kernel.Reply {
	fmt.Printf("[%s] LOG handle kernel event: %s\n", l.name, evt.Content)
	// return chan kernel.Reply
	//msg := make(chan kernel.Reply, 1)
	//msg <- kernel.Reply{Code: 0, Message: "Logged", Data: evt.Content}
	//close(msg)
	// 支持超时保护
	//go func() {
	//	defer close(msg)
	//	select {
	//	case msg <- kernel.Reply{...}: // 正常发送
	//	case <-time.After(100 * time.Millisecond): // 超时保护
	//		msg <- kernel.Reply{Code: -1, Message: "Timeout"}
	//	}
	//}()
	return kernel.Reply{Code: 0, Message: "Logged", Data: evt.Content}
}

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

func (l *LogService) Log(msg string) {
	l.logCh <- msg
}
