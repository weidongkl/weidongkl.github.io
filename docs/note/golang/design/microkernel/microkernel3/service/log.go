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

func (l *LogService) Handle(msg string) string {
	fmt.Printf("[%s] LOG handle kernel event: %s\n", l.name, msg)
	return fmt.Sprintf("[%s] LOG Handle: %s\n", l.name, msg)
}

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
}

func (l *LogService) Log(msg string) {
	l.logCh <- msg
}
