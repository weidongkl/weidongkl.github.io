package service

import (
	"fmt"
	"microkernel/kernel"
)

type EchoService struct {
	name   string
	kernel *kernel.Kernel
	stopCh chan struct{}
}

func NewEchoService(name string, kernel *kernel.Kernel) *EchoService {
	return &EchoService{
		name:   name,
		kernel: kernel,
		stopCh: make(chan struct{}),
	}
}

func (e *EchoService) Start() error {
	fmt.Printf("[%s] starting...\n", e.name)
	go e.run()
	return nil
}

func (e *EchoService) Stop() error {
	fmt.Printf("[%s] stopping...\n", e.name)
	close(e.stopCh)
	return nil
}

func (e *EchoService) Name() string {
	return e.name
}

func (e *EchoService) Handle(evt kernel.Event) kernel.Reply {
	return kernel.Reply{Code: 0, Message: "echo service handled", Data: fmt.Sprintf("from %s: %s", evt.From, evt.Content)}
}

func (e *EchoService) run() {
	for {
		select {
		case <-e.stopCh:
			return
		}
	}
}
