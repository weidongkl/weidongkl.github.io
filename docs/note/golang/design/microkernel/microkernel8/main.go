package main

import (
	"context"
	"fmt"
	"microkernel/microkernel"
	"microkernel/service"
	"time"
)

func main() {
	// 1. 创建微内核
	microKernel := microkernel.NewMicroKernel()
	// 2. 注册服务
	logSvc := service.NewLogService(microKernel)
	if err := microKernel.Register(logSvc); err != nil {
		panic(err)
	}
	// 增加EchoService服务注册
	echoSvc := service.NewEchoService(microKernel)
	if err := microKernel.Register(echoSvc); err != nil {
		panic(err)
	}
	// 3. 启动所有服务
	if err := microKernel.StartAll(); err != nil {
		panic(err)
	}

	// 4. 启动事件循环
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go microKernel.Listen(ctx)

	// 5. 测试日志服务
	logSvc.Log("Hello, Microkernel!")
	time.Sleep(1 * time.Millisecond)
	// 第二次
	logSvc.Log("Hello, Echo!")

	time.Sleep(1 * time.Second)
	// 6. microKernel 发送事件到指定服务
	fmt.Println(microKernel.Send(microkernel.Event{
		From:    "microKernel",
		To:      "echo",
		Type:    "unknown",
		Content: "Hello, Log!",
	}))
	time.Sleep(1 * time.Millisecond)
	// 7. 热替换服务
	// 热更新为 V2
	//_ = microKernel.ReplaceService(service.NewEchoServiceV2(microKernel))
	aesKey := []byte("1234567890123456") // 16 字节对称密钥
	microKernel.ReplaceServiceEncrypted(service.NewEchoServiceV2(microKernel), microkernel.NewAESCrypter(aesKey))
	fmt.Println(microKernel.Send(microkernel.Event{
		From:    "microKernel",
		To:      "echo",
		Type:    "unknown",
		Content: "Hello, Log!",
	}))
	// 测试 V2 行为
	replyCh2 := make(chan microkernel.Reply, 1)
	microKernel.Push(microkernel.Event{
		From:      "main",
		Type:      "log",
		Content:   "log",
		ReplyCh:   replyCh2,
		TimeoutMs: 1000,
	})
	fmt.Println("v2 reply:", <-replyCh2)

	// 8. 停止所有服务
	if err := microKernel.StopAll(); err != nil {
		panic(err)
	}
}
