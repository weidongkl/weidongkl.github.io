package service

import (
	"fmt"
	"microkernel/logger"
	"microkernel/microkernel"
	"os"
)

type EchoServiceV2 struct {
	name   string
	kernel *microkernel.MicroKernel
	stopCh chan struct{}
	log    *logger.Logger
}

func (e *EchoServiceV2) Dependencies() []string {
	return nil
}

func NewEchoServiceV2(kernel *microkernel.MicroKernel) *EchoServiceV2 {
	return &EchoServiceV2{
		name:   "echo",
		kernel: kernel,
		stopCh: make(chan struct{}),
		log:    logger.NewLogger("echo", logger.INFO, os.Stdout),
	}
}

func (e *EchoServiceV2) Start() error {
	//fmt.Printf("[%sv2] starting...\n", e.name)
	e.log.Infof("[%sv2] starting...\n", e.name)
	go e.run()
	return nil
}

func (e *EchoServiceV2) Stop() error {
	fmt.Printf("[%sv2] stopping...\n", e.name)
	close(e.stopCh)
	return nil
}

func (e *EchoServiceV2) Name() string {
	return e.name
}

func (e *EchoServiceV2) Handle(evt microkernel.Event) microkernel.Reply {
	return microkernel.Reply{Code: 0, Message: "echo v2 service handled", Data: fmt.Sprintf("from %s: %s", evt.From, evt.Content)}
}

func (e *EchoServiceV2) run() {
	for {
		select {
		case <-e.stopCh:
			return
		}
	}
}
