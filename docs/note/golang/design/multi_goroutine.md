# Golang 多goroutine交互模型

## 1. channel 交互

使用channel 在 goroutine 间进行通信和同步操作

```go
package main

import (
	"fmt"
	"time"
)

// SetRulesRequest 表示设置规则的请求结构
type SetRulesRequest struct {
	NewRules []string
	Response chan error // 用于同步返回是否成功
}

// Aggregator 用于管理规则并支持并发设置
type Aggregator struct {
	rules        []string
	setRulesChan chan *SetRulesRequest
	stopChan     chan struct{}
}

// SetRules 是向 aggregator 发送新规则的接口
func (a *Aggregator) SetRules(r []string) error {
	req := &SetRulesRequest{
		NewRules: r,
		Response: make(chan error),
	}
	a.setRulesChan <- req
	return <-req.Response // 等待响应结束
}

// Run 启动 aggregator 的工作协程
func (a *Aggregator) Run() {
	for {
		select {
		case req := <-a.setRulesChan:
			a.rules = req.NewRules
			fmt.Println("Updated rules:", a.rules)
			req.Response <- nil // 成功响应
		case <-a.stopChan:
			return
		}
	}
}

// Stop 关闭 aggregator 的后台协程
func (a *Aggregator) Stop() {
	close(a.stopChan)
}

func main() {
	aggregator := &Aggregator{
		rules:        []string{},
		setRulesChan: make(chan *SetRulesRequest),
		stopChan:     make(chan struct{}),
	}

	go aggregator.Run()

	// 模拟使用
	time.Sleep(500 * time.Millisecond)
	aggregator.SetRules([]string{"a", "b", "c"})
	aggregator.SetRules([]string{"d", "e", "f"})

	// 停止后台协程
	aggregator.Stop()
}
```

 **🔍 说明重点：**

- 通信模型：调用者通过 `SetRules` 向 `Aggregator` 的 channel 发送数据，然后通过一个 `Response` channel 同步等待执行结果。
- 响应式设计：Aggregator 处理请求后通过 channel 回复，避免竞态。
- 易扩展性：你可以将更多操作（如查询、追加等）封装成不同的 request 结构体，并通过不同 channel 或类型区分处理。

## 2.  增加 channel 状态判断 

### 2.1. 理解 channel 行为

发送端（`ch <- v`）向已关闭 channel 发送数据：

- 会 panic！

接收端（`<-chan`）读取已关闭 channel：

- 不会 panic，
- **立即返回零值**
  - **第二个返回值判断是否关闭**。即：`v, ok := <-ch`，如果 `ok == false`，说明 channel 已关闭。
  - 不判断。即: `v := <-ch`，立即返回零值，无法判断 channel 是否关闭。
- 即：`v, ok := <-ch`，如果 `ok == false`，说明 channel 已关闭。

**举例**

```go
package main

import (
	"log"
	"time"
)

func main() {
	//ch := make(chan int, 2)
	ch := make(chan int)
	go func() {
		ch <- 20
		time.Sleep(1 * time.Second)
		defer close(ch)
	}()
	// 只接收数据，不检查通道状态
	rules := <-ch
	log.Println("Rules:", rules) // 输出：14:47:31 Rules: 20
	rules = <-ch
	log.Println("Rules:", rules) // 输出：14:47:32 Rules: 0
	rules = <-ch
	log.Println("Rules:", rules) // 输出：14:47:32 Rules: 0
	// 读取时检查通道是否仍然开放
	rules, open := <-ch
	log.Println("Rules:", rules, "Open:", open) // 输出：14:46:39 Rules: 20 Open: true
	rules, open = <-ch
	log.Println("Rules:", rules, "Open:", open) // 输出：14:46:40 Rules: 0 Open: false
	rules, open = <-ch
	log.Println("Rules:", rules, "Open:", open) // 输出：14:46:40 Rules: 0 Open: false
}

```

### 2.2. 使用判断channel 优化示例

**✅ 特性亮点：**

1. 安全关闭 goroutine：
   - `setRulesChan` 和 `stopChan` 都支持关闭，防止死锁或 panic。
2. 带 `ok` 判断防止接收已关闭的 channel 导致数据为 nil。
3. 封装清晰： `Run()` 执行逻辑清晰，`Stop()` 方法负责安全退出和资源清理。

```go
package main

import (
	"fmt"
	"time"
)

// 请求结构体，设置规则并通过 Response 返回结果
type SetRulesRequest struct {
	NewRules []string
	Response chan error
}

// 聚合器结构
type Aggregator struct {
	rules        []string
	setRulesChan chan *SetRulesRequest
	stopChan     chan struct{}
	doneChan     chan struct{} // 通知主线程已退出
}

// Run 启动 Aggregator 的工作协程
func (a *Aggregator) Run() {
	defer close(a.doneChan) // 通知主线程：后台协程已退出

	for {
		select {
		case req, ok := <-a.setRulesChan:
			if !ok {
				fmt.Println("setRulesChan closed, exiting Run()")
				return
			}
			a.rules = req.NewRules
			fmt.Println("Updated rules:", a.rules)
			// 响应调用者
			req.Response <- nil

		case <-a.stopChan:
			fmt.Println("Received stop signal, exiting Run()")
			return
		}
	}
}

// SetRules 发送规则请求
func (a *Aggregator) SetRules(r []string) error {
	req := &SetRulesRequest{
		NewRules: r,
		Response: make(chan error),
	}

	select {
	case a.setRulesChan <- req:
		return <-req.Response
	case <-a.stopChan:
		return fmt.Errorf("aggregator is shutting down")
	}
}

// Stop 关闭 aggregator，确保 goroutine 优雅退出
func (a *Aggregator) Stop() {
	close(a.stopChan)     // 通知退出
	close(a.setRulesChan) // 防止阻塞在 <-setRulesChan
	<-a.doneChan          // 等待后台处理完成
	fmt.Println("Aggregator stopped gracefully")
}

func main() {
	aggregator := &Aggregator{
		rules:        []string{},
		setRulesChan: make(chan *SetRulesRequest),
		stopChan:     make(chan struct{}),
		doneChan:     make(chan struct{}),
	}

	go aggregator.Run()

	time.Sleep(500 * time.Millisecond)
	aggregator.SetRules([]string{"a", "b", "c"})
	aggregator.SetRules([]string{"x", "y", "z"})

	aggregator.Stop()
}
```

## 3. 支持 `context.Context`

🧠 为啥用 `context.Context`？

- 防止调用者被永久阻塞：例如 aggregator goroutine 迟迟不响应。
- 可设置 timeout 或 cancel，适合服务端编程模型。
- 可组合多种取消方式（定时取消 + 主动取消）。

✅ 增强功能：

1. `SetRules` 支持超时 / 取消（避免卡死等待响应）。
2. `context.Context` 控制响应等待过程。
3. 依然保留 graceful shutdown 支持（`Stop()`）。

```go
package main

import (
	"context"
	"fmt"
	"time"
)

// 请求结构体，设置规则并通过 Response 返回结果
type SetRulesRequest struct {
	NewRules []string
	Response chan error
}

// 聚合器结构体
type Aggregator struct {
	rules        []string
	setRulesChan chan *SetRulesRequest
	stopChan     chan struct{}
	doneChan     chan struct{}
}

// Run 启动 aggregator 的工作协程
func (a *Aggregator) Run() {
	defer close(a.doneChan)

	for {
		select {
		case req, ok := <-a.setRulesChan:
			if !ok {
				fmt.Println("setRulesChan closed, exiting Run()")
				return
			}
			a.rules = req.NewRules
			fmt.Println("Updated rules:", a.rules)
			req.Response <- nil

		case <-a.stopChan:
			fmt.Println("Received stop signal, exiting Run()")
			return
		}
	}
}

// SetRulesCtx 支持 context 超时 / 取消控制
func (a *Aggregator) SetRulesCtx(ctx context.Context, rules []string) error {
	req := &SetRulesRequest{
		NewRules: rules,
		Response: make(chan error, 1), // 非阻塞回写
	}
	// 模拟耗时操作
	time.Sleep(2 * time.Millisecond)
	select {
	case a.setRulesChan <- req:
		// 等待响应 or context 超时
		select {
		case err := <-req.Response:
			return err
		case <-ctx.Done():
			return fmt.Errorf("set rules timeout or cancelled: %w", ctx.Err())
		}
	case <-a.stopChan:
		return fmt.Errorf("aggregator shutting down")
	case <-ctx.Done():
		return fmt.Errorf("send timeout or cancelled: %w", ctx.Err())
	}
}

// Stop 优雅关闭
func (a *Aggregator) Stop() {
	close(a.stopChan)
	close(a.setRulesChan)
	<-a.doneChan
	fmt.Println("Aggregator stopped gracefully")
}

func main() {
	aggregator := &Aggregator{
		rules:        []string{},
		setRulesChan: make(chan *SetRulesRequest),
		stopChan:     make(chan struct{}),
		doneChan:     make(chan struct{}),
	}

	go aggregator.Run()

	// 模拟正常调用
	ctx := context.Background()
	aggregator.SetRulesCtx(ctx, []string{"a", "b", "c"})

	// 模拟带 timeout 的调用（1ms 会超时）
	ctxTimeout, cancel := context.WithTimeout(context.Background(), 1*time.Millisecond)
	defer cancel()
	err := aggregator.SetRulesCtx(ctxTimeout, []string{"should", "fail", "fast"})
	if err != nil {
		fmt.Println("Timeout err:", err)
	}

	// 正常调用
	ctx2, cancel2 := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel2()
	aggregator.SetRulesCtx(ctx2, []string{"x", "y", "z"})

	aggregator.Stop()
}
```

##  4. [CommandHandler 模式](https://refactoringguru.cn/design-patterns/command/go/example)

**CommandHandler 模式**是命令模式（Command Pattern）的一种实现方式，常用于将请求（命令）与处理逻辑解耦，从而提高系统的灵活性和可扩展性。它通过将命令封装为对象，并由专门的 `CommandHandler` 负责执行这些命令，使得系统能够更轻松地管理命令的生命周期、支持撤销/重做操作、实现事务管理或异步处理。

**核心概念**

1. Command（命令）
   - 定义一个接口或抽象类，声明执行命令的方法（如 `execute()`）。
   - 具体命令类实现该接口，封装请求的具体逻辑。
2. CommandHandler（命令处理器）
   - 负责接收命令对象并调用其 `execute()` 方法。
   - 可以扩展为支持命令的调度、排队、事务管理或异步执行。
3. Invoker（调用者）
   - 触发命令的对象，通常持有对 `CommandHandler` 的引用。
4. Receiver（接收者）
   - 执行命令实际逻辑的对象，命令对象通过依赖注入或组合的方式与接收者交互。

**🎯 目标：**

- 支持不同类型请求的统一处理通道
- 类似“命令模式”：将操作封装为一个结构体
- 可扩展、可测试、context 支持、graceful shutdown

**✅ 架构设计：**

```
+--------------------+
|    CommandHandler  |
|--------------------|
| chan Command       |<----------- Send()
| goroutine: dispatch|     (通用异步接口)
+--------------------+
        |
        V
+--------------------+
|    Command (接口)  |<-- 多种请求实现：
| Execute(context)   |     - SetRulesCommand
+--------------------+     - GetRulesCommand
                          - AppendRulesCommand

```

**✨ 通用实现（含 SetRules 和 GetRules）：**

```go
package main

import (
	"context"
	"errors"
	"fmt"
)

// Command 是所有请求的接口
type Command interface {
	Execute(ctx context.Context, h *Handler)
	Done() <-chan struct{}
	Err() error
}

// Handler 管理状态和调度命令执行
type Handler struct {
	rules   []string
	cmdChan chan Command
	stop    chan struct{}
	done    chan struct{}
}

// 基础命令结构
type baseCommand struct {
	err  error
	done chan struct{}
}

func (c *baseCommand) Done() <-chan struct{} {
	return c.done
}
func (c *baseCommand) Err() error {
	return c.err
}

// SetRulesCommand 设置规则
type SetRulesCommand struct {
	baseCommand
	NewRules []string
}

func (c *SetRulesCommand) Execute(ctx context.Context, h *Handler) {
	defer close(c.done)
	h.rules = c.NewRules
	fmt.Println("SetRulesCommand executed:", h.rules)
}

// GetRulesCommand 获取规则
type GetRulesCommand struct {
	baseCommand
	Result chan []string
}

func (c *GetRulesCommand) Execute(ctx context.Context, h *Handler) {
	defer close(c.done)
	c.Result <- h.rules
	close(c.Result)
}

func NewHandler() *Handler {
	return &Handler{
		rules:   []string{},
		cmdChan: make(chan Command),
		stop:    make(chan struct{}),
		done:    make(chan struct{}),
	}
}

// Run 启动处理循环
func (h *Handler) Run() {
	defer close(h.done)
	for {
		select {
		case cmd := <-h.cmdChan:
			ctx := context.Background() // 可支持 ctx 控制
			cmd.Execute(ctx, h)
		case <-h.stop:
			return
		}
	}
}

// Send 提交命令（带超时支持）
func (h *Handler) Send(ctx context.Context, cmd Command) error {
	select {
	case h.cmdChan <- cmd:
		select {
		case <-cmd.Done():
			return cmd.Err()
		case <-ctx.Done():
			return ctx.Err()
		}
	case <-h.stop:
		return errors.New("handler is stopped")
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Stop 优雅关闭
func (h *Handler) Stop() {
	close(h.stop)
	<-h.done
}

func main() {
	handler := NewHandler()
	go handler.Run()

	ctx := context.Background()
	setCmd := &SetRulesCommand{
		baseCommand: baseCommand{done: make(chan struct{})},
		NewRules:    []string{"a", "b", "c"},
	}
	handler.Send(ctx, setCmd)

	// 获取规则
	getCmd := &GetRulesCommand{
		baseCommand: baseCommand{done: make(chan struct{})},
		Result:      make(chan []string, 1),
	}
	handler.Send(ctx, getCmd)

	fmt.Println("Current rules:", <-getCmd.Result)

	handler.Stop()
}

```

**✅ 泛型式响应的 `ResultCommand[T]` 设计**

实现目标：

1. 命令支持携带强类型返回值（例如：`[]string`、`int`、bool 等）；
2. 支持 context 控制；
3. 解耦命令发送与执行，**类型安全** 的异步响应；
4. 易扩展、结构清晰。

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"time"
)

// 通用 Command 接口
type Command interface {
	Execute(context.Context, *Handler)
	Done() <-chan struct{}
	Err() error
}

// Handler：命令处理器
type Handler struct {
	rules   []string
	cmdChan chan Command
	stop    chan struct{}
	done    chan struct{}
}

func NewHandler() *Handler {
	return &Handler{
		rules:   []string{},
		cmdChan: make(chan Command),
		stop:    make(chan struct{}),
		done:    make(chan struct{}),
	}
}

func (h *Handler) Run() {
	defer close(h.done)
	for {
		select {
		case cmd := <-h.cmdChan:
			cmd.Execute(context.Background(), h)
		case <-h.stop:
			return
		}
	}
}

func (h *Handler) Stop() {
	close(h.stop)
	<-h.done
}

// Send 支持泛型命令发送
func (h *Handler) Send(ctx context.Context, cmd Command) error {
	select {
	case h.cmdChan <- cmd:
		select {
		case <-cmd.Done():
			return cmd.Err()
		case <-ctx.Done():
			return ctx.Err()
		}
	case <-ctx.Done():
		return ctx.Err()
	case <-h.stop:
		return errors.New("handler stopped")
	}
}

// 泛型命令 ResultCommand[T]
// --------------------------------
type ResultCommand[T any] struct {
	result  T
	err     error
	done    chan struct{}
	resultC chan T
}

func NewResultCommand[T any]() *ResultCommand[T] {
	return &ResultCommand[T]{
		done:    make(chan struct{}),
		resultC: make(chan T, 1), // 非阻塞写入
	}
}

func (c *ResultCommand[T]) Done() <-chan struct{} { return c.done }
func (c *ResultCommand[T]) Err() error            { return c.err }

// Wait 等待结果
func (c *ResultCommand[T]) Wait(ctx context.Context) (T, error) {
	select {
	case <-ctx.Done():
		var zero T
		return zero, ctx.Err()
	case res := <-c.resultC:
		return res, c.err
	}
}

// --------------------------------
// 示例命令：GetRulesCommand 返回 []string
// --------------------------------
type GetRulesCommand struct {
	*ResultCommand[[]string]
}

func NewGetRulesCommand() *GetRulesCommand {
	return &GetRulesCommand{
		ResultCommand: NewResultCommand[[]string](),
	}
}

func (c *GetRulesCommand) Execute(ctx context.Context, h *Handler) {
	defer close(c.done)
	c.result = h.rules
	c.resultC <- h.rules
}

// --------------------------------
// 示例命令：SetRulesCommand
// --------------------------------
type SetRulesCommand struct {
	newRules []string
	done     chan struct{}
	err      error
}

func NewSetRulesCommand(rules []string) *SetRulesCommand {
	return &SetRulesCommand{
		newRules: rules,
		done:     make(chan struct{}),
	}
}

func (c *SetRulesCommand) Execute(ctx context.Context, h *Handler) {
	defer close(c.done)
	h.rules = c.newRules
	fmt.Println("Rules updated:", h.rules)
}

func (c *SetRulesCommand) Done() <-chan struct{} { return c.done }
func (c *SetRulesCommand) Err() error            { return c.err }

// 🧪 Main 演示：SetRules 和 GetRules 泛型返回
func main() {
	h := NewHandler()
	go h.Run()

	ctx := context.Background()

	// Set rules
	setCmd := NewSetRulesCommand([]string{"x", "y", "z"})
	_ = h.Send(ctx, setCmd)

	// Get rules
	getCmd := NewGetRulesCommand()
	_ = h.Send(ctx, getCmd)

	rules, err := getCmd.Wait(ctx)
	if err != nil {
		fmt.Println("GetRules error:", err)
	} else {
		fmt.Println("Got rules:", rules)
	}

	// 超时测试
	timeoutCtx, cancel := context.WithTimeout(ctx, 1*time.Millisecond)
	defer cancel()

	getCmd2 := NewGetRulesCommand()
	_ = h.Send(timeoutCtx, getCmd2)

	rules2, err := getCmd2.Wait(timeoutCtx)
	fmt.Println("With timeout:", rules2, err)

	h.Stop()
}
```

输出示例：

```bash
Rules updated: [x y z]
Got rules: [x y z]
With timeout: [] context deadline exceeded
```

**📦 可扩展示例命令**

- `GetStatsCommand struct{ ResultCommand[map[string]int] }`
- `FlushToDiskCommand struct{ ResultCommand[bool] }`
- `LoadConfigCommand struct{ ResultCommand[Config] }`
- `AppendRulesCommand struct{ Rules []string }`
