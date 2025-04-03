# Golang 并发编程

在 Golang 中，多协程 goroutine之间的交互主要通过以下几种方式实现：

------

## 1. Channel（推荐方式）

Golang 提供了 **channel** 作为 goroutine 之间通信的主要方式。它是线程安全的，并且可以避免数据竞争。

### 1.1 Channel 的特点

- 避免竞争：`channel` 通过消息传递，而不是共享变量，减少数据竞争的可能性。
- 更符合 Go 语言哲学。
- 代码更简洁：避免手动加锁和解锁。

### 1.2 基础示例：

```go
package main

import (
	"fmt"
	"time"
)

func worker(ch chan string) {
	time.Sleep(2 * time.Second)
	ch <- "任务完成"
}

func main() {
	ch := make(chan string) // 创建一个无缓冲 channel
	go worker(ch)           // 启动 goroutine

	fmt.Println("等待任务完成...")
	msg := <-ch // 接收数据（阻塞）
	fmt.Println("收到消息:", msg)
}
```

**解释**：

- `ch := make(chan string)` 创建了一个无缓冲的 channel。
- `go worker(ch)` 启动一个协程 `worker`，并通过 channel 发送消息。
- `msg := <-ch` 在主线程阻塞等待，直到 `worker` 发送数据。

### 1.3 select 结合 channel 用法

`select` 语句允许从多个 `channel` 读取数据，或者在通道无数据时执行默认操作。

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	// 启动 goroutine 向 ch1 发送数据
	go func() {
		time.Sleep(2 * time.Second)
		ch1 <- "Message from ch1"
	}()

	// 启动 goroutine 向 ch2 发送数据
	go func() {
		time.Sleep(1 * time.Second)
		ch2 <- "Message from ch2"
	}()

	// `select` 监听多个 `channel`
	select {
	case msg1 := <-ch1:
		fmt.Println("Received:", msg1)
	case msg2 := <-ch2:
		fmt.Println("Received:", msg2)
	case <-time.After(3 * time.Second):
		fmt.Println("Timeout: No message received")
	}
}
```

**代码解析**

- `select` 监听 `ch1` 和 `ch2`，哪个 `channel` 先有数据，就会执行对应的 `case`。
- 如果 3 秒内没有消息到达，则 `case <-time.After(3 * time.Second)` 触发，防止永久阻塞。

**使用场景**

- 监听多个 `channel`，避免阻塞。
- 超时控制：如 `time.After` 结合 `select` 限制请求时间。

### 1.4 Channel 的适用场景

- 任务队列（生产者-消费者模型）。
- 多个 worker 处理任务，避免共享变量。
- 限制并发任务的数量。

------

## 2. sync.WaitGroup`

如果多个 goroutine 需要同步执行完毕后再继续，`sync.WaitGroup` 是一种简单的方法。

**示例：**

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done() // 执行完成后减少计数
	fmt.Printf("Worker %d 开始工作...\n", id)
	time.Sleep(2 * time.Second)
	fmt.Printf("Worker %d 完成工作!\n", id)
}

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Add(1)           // 增加计数
		go worker(i, &wg)   // 启动 goroutine
	}

	wg.Wait() // 等待所有任务完成
	fmt.Println("所有任务完成")
}
```

**解释**：

- `wg.Add(1)` 增加计数，每个 goroutine 开始时调用一次。
- `defer wg.Done()` 在 goroutine 结束时减少计数。
- `wg.Wait()` 阻塞主线程，直到所有 `wg.Done()` 调用完毕。

------

## 3.  `sync.Mutex`  

当多个 goroutine 需要修改共享数据时，可以使用 `sync.Mutex` 防止竞态条件（race condition）。

**示例：**

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	counter int
	mu      sync.Mutex
)

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	mu.Lock()
	counter++
	fmt.Printf("Worker %d 计数: %d\n", id, counter)
	mu.Unlock()
}

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go worker(i, &wg)
	}

	wg.Wait()
	fmt.Println("最终计数:", counter)
}
```

**解释**：

- `mu.Lock()` 保护 `counter`，防止多个 goroutine 并发修改时发生竞态条件。
- `mu.Unlock()` 释放锁，允许其他 goroutine 继续执行。

------

## 4.  `sync.Cond` 进行事件通知

`sync.Cond` 适用于等待某个条件满足后再执行的场景，例如多个线程等待某个事件触发。

**示例**：

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	ready = false
	cond  = sync.NewCond(&sync.Mutex{})
)

func worker(id int) {
	cond.L.Lock()
	for !ready {
		cond.Wait() // 等待条件变为 true
	}
	fmt.Printf("Worker %d 开始工作!\n", id)
	cond.L.Unlock()
}

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			worker(id)
		}(i)
	}

	time.Sleep(2 * time.Second)

	// 触发事件
	cond.L.Lock()
	ready = true
	cond.L.Unlock()
	cond.Broadcast() // 通知所有等待的 goroutine

	wg.Wait()
}
```

**解释**：

- `cond.Wait()` 等待条件 `ready == true`。
- `cond.Broadcast()` 唤醒所有等待的 goroutine。

------

## 5.  `sync.Once` 

`sync.Once` 确保某个操作在多个 goroutine 中只执行一次，例如初始化操作。

**示例**：

```go
package main

import (
	"fmt"
	"sync"
)

var once sync.Once

func initialize() {
	fmt.Println("初始化操作")
}

func worker(wg *sync.WaitGroup) {
	defer wg.Done()
	once.Do(initialize)
	fmt.Println("Worker 执行")
}

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go worker(&wg)
	}

	wg.Wait()
}
```

**解释**：

- `once.Do(initialize)` 确保 `initialize()` 只执行一次，无论多少个 goroutine 访问它。

------

## 6.  `atomic` 

对于简单的数值操作，可以使用 `sync/atomic` 提供的原子操作代替 `sync.Mutex`，提升性能。

### 示例：

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

var counter int64

func worker(wg *sync.WaitGroup) {
	defer wg.Done()
	atomic.AddInt64(&counter, 1) // 原子递增
}

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go worker(&wg)
	}
	wg.Wait()
	fmt.Println("最终计数:", counter)
}
```

**解释**：

- `atomic.AddInt64(&counter, 1)` 确保 `counter` 在多个 goroutine 中安全递增，无需使用 `sync.Mutex`。

------

## 7.  `context` 

`context.Context` 适用于控制多个 goroutine 的生命周期，例如超时、取消任务等。

### 示例：

```go
package main

import (
	"context"
	"fmt"
	"time"
)

func worker(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			fmt.Println("Worker 任务超时，退出")
			return
		default:
			fmt.Println("Worker 正在工作...")
			time.Sleep(500 * time.Millisecond)
		}
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	go worker(ctx)

	time.Sleep(3 * time.Second) // 主线程等待
	fmt.Println("主线程退出")
}
```

**解释**：

- `context.WithTimeout` 2 秒后会自动取消 `ctx`，通知 `worker` 退出。

------

## **总结**

| 方式      | 适用场景                     |
| --------- | ---------------------------- |
| Channel   | 安全的数据传递，避免竞态条件 |
| WaitGroup | 等待多个 goroutine 结束      |
| Mutex     | 保护共享资源，防止竞态       |
| Cond      | 事件触发，等待通知           |
| Once      | 只执行一次（单例模式）       |
| Atomic    | 高效数值计算，无锁并发       |
| Context   | 超时、取消任务               |

- 如果主要是 goroutine 之间的通信，使用 `channel`（更安全，避免锁竞争）。
- 如果是多个 goroutine 操作同一个变量，使用 `mutex`（更高效）。
- 如果要限制并发数，二者可以结合使用，如 `channel` 控制并发，`mutex` 保护数据。
- `select` 适用于监听多个 `channel` 和超时控制。

推荐做法：

- 优先考虑 `channel`，符合 Go 语言风格。
- 如果性能瓶颈明显（高频数据访问），使用 `sync.Mutex` 进行优化。
- 如果有并发控制需求，可以结合 `channel` 和 `mutex`。
- `select` 适用于监听多个 `channel` 和超时控制。
