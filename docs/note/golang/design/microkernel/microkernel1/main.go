package main

import (
	"context"
	"microkernel/kernel"
	"microkernel/service"
	"time"
)

func main() {
	// 1. 创建微内核
	kernel := kernel.NewKernel()

	// 2. 注册服务
	logSvc := service.NewLogService("logger", kernel)
	if err := kernel.RegisterService(logSvc); err != nil {
		panic(err)
	}

	// 3. 启动所有服务
	if err := kernel.StartAll(); err != nil {
		panic(err)
	}

	// 4. 启动事件循环
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go kernel.EventLoop(ctx)

	// 5. 测试日志服务
	logSvc.Log("Hello, Microkernel!")
	time.Sleep(1 * time.Second)

	// 6. 停止所有服务
	if err := kernel.StopAll(); err != nil {
		panic(err)
	}
}
