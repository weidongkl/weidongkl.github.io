package service

import (
	"fmt"
	"microkernel/microkernel"
)

type EchoService struct {
	name   string
	kernel *microkernel.MicroKernel
	stopCh chan struct{}
}

func (e *EchoService) Dependencies() []string {
	return nil
}

func NewEchoService(kernel *microkernel.MicroKernel) *EchoService {
	return &EchoService{
		name:   "echo",
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

func (e *EchoService) Handle(evt microkernel.Event) microkernel.Reply {
	return microkernel.Reply{Code: 0, Message: "echo service handled", Data: fmt.Sprintf("from %s: %s", evt.From, evt.Content)}
}

func (e *EchoService) run() {
	for {
		select {
		case <-e.stopCh:
			return
		}
	}
}
