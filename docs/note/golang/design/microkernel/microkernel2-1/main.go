package main

import (
	"context"
	"microkernel/kernel"
	"microkernel/service"
	"time"
)

func main() {
	// 1. 创建微内核
	microKernel := kernel.NewKernel()

	// 2. 注册服务
	logSvc := service.NewLogService("logger", microKernel)
	if err := microKernel.RegisterService(logSvc); err != nil {
		panic(err)
	}

	// 3. 启动所有服务
	if err := microKernel.StartAll(); err != nil {
		panic(err)
	}

	// 4. 启动事件循环
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go microKernel.EventLoop(ctx)

	// 5. 测试日志服务
	logSvc.Log("Hello, Microkernel!")
	time.Sleep(1 * time.Millisecond)
	// 6. microKernel 发送事件到指定服务
	microKernel.HandleEvent(kernel.Event{
		From:    "microKernel",
		To:      "logger",
		Type:    "log",
		Content: "Hello, Log!",
	})
	time.Sleep(1 * time.Millisecond)

	// 7. 停止所有服务
	if err := microKernel.StopAll(); err != nil {
		panic(err)
	}
}
