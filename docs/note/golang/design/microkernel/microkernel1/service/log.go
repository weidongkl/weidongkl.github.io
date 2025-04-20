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

func (l *LogService) run() {
	for {
		select {
		case <-l.stopCh:
			return
		case log := <-l.logCh:
			fmt.Printf("[%s] LOG: %s\n", l.name, log)
			// 模拟发送事件到内核
			l.kernel.SendEvent(kernel.Event{
				From:    l.name,
				Type:    "log",
				Content: log,
			})
		}
	}
}

func (l *LogService) Log(msg string) {
	l.logCh <- msg
}
