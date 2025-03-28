# Go 并发编程

## 1. 概述

在 Go 语言的并发编程中，主要有两种方式在多个 goroutine 之间共享数据：

- 使用 `channel` 进行通信，避免共享内存带来的竞争问题。
- 使用 `sync.Mutex` 进行加锁，保护共享变量的并发安全。

此外，`select` 语句可以用于监听多个 `channel`，实现非阻塞通信和超时控制。

------

## 2. Channel 方式

### 2.1 Channel 的特点

- 避免竞争：`channel` 通过消息传递，而不是共享变量，减少数据竞争的可能性。
- 更符合 Go 语言哲学。
- 代码更简洁：避免手动加锁和解锁。

### 2.2 示例：使用 `channel` 进行 goroutine 通信

```go
package main

import (
	"fmt"
	"time"
)

func worker(ch chan int) {
	for val := range ch {
		fmt.Println("Received:", val)
	}
}

func main() {
	ch := make(chan int)

	go worker(ch)

	for i := 0; i < 5; i++ {
		ch <- i
	}

	close(ch)
	time.Sleep(time.Second)
}
```

### 2.3 Channel 的适用场景

- 任务队列（生产者-消费者模型）。
- 多个 worker 处理任务，避免共享变量。
- 限制并发任务的数量。

------

## 3. select 结合 channel 用法

`select` 语句允许从多个 `channel` 读取数据，或者在通道无数据时执行默认操作。

### 3.1 示例：使用 `select` 监听多个 `channel`

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

### 3.2 代码解析

- `select` 监听 `ch1` 和 `ch2`，哪个 `channel` 先有数据，就会执行对应的 `case`。
- 如果 3 秒内没有消息到达，则 `case <-time.After(3 * time.Second)` 触发，防止永久阻塞。

### 3.3 适用场景

- 监听多个 `channel`，避免阻塞。
- 超时控制：如 `time.After` 结合 `select` 限制请求时间。

------

## 4. sync.Mutex 方式

当需要多个 goroutine 访问同一个变量时，可以使用 `sync.Mutex` 进行加锁，以确保并发安全。

### 4.1 示例：使用 `sync.Mutex` 保护共享变量

```go
package main

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu    sync.Mutex
	value int
}

func (c *Counter) Increment() {
	c.mu.Lock()
	c.value++
	c.mu.Unlock()
}

func (c *Counter) GetValue() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.value
}

func main() {
	var wg sync.WaitGroup
	counter := &Counter{}

	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			counter.Increment()
		}()
	}

	wg.Wait()
	fmt.Println("Final Counter Value:", counter.GetValue())
}
```

------

## 5. channel vs mutex 选择

| 方式      | 适用场景                       | 代码复杂度         | 性能 |
| --------- | ------------------------------ | ------------------ | ---- |
| `channel` | 任务分发、goroutine 之间的通信 | 简单               | 略低 |
| `mutex`   | 共享变量保护、适用于高频访问   | 复杂（需手动加锁） | 高   |

------

## 6. 结合 channel 和 mutex

在某些情况下，可以结合 `channel` 和 `mutex`：

- 用 `channel` 进行 goroutine 之间的任务调度。
- 用 `mutex` 保护共享数据，避免竞态条件。

### 6.1 示例：使用 `channel` 控制并发，`mutex` 保护共享变量

```go
package main

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu    sync.Mutex
	value int
}

func (c *Counter) Increment() {
	c.mu.Lock()
	c.value++
	c.mu.Unlock()
}

func (c *Counter) GetValue() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.value
}

func worker(id int, ch chan struct{}, counter *Counter, wg *sync.WaitGroup) {
	defer wg.Done()
	<-ch // 等待信号
	counter.Increment()
	fmt.Println("Worker", id, "incremented counter")
}

func main() {
	var wg sync.WaitGroup
	counter := &Counter{}
	ch := make(chan struct{}, 3) // 限制最大并发 3 个 worker

	for i := 0; i < 5; i++ {
		wg.Add(1)
		go worker(i, ch, counter, &wg)
	}

	// 启动 3 个 worker
	for i := 0; i < 3; i++ {
		ch <- struct{}{}
	}

	wg.Wait()
	fmt.Println("Final Counter Value:", counter.GetValue())
}
```

------

## 7. 结论

- 如果主要是 goroutine 之间的通信，使用 `channel`（更安全，避免锁竞争）。
- 如果是多个 goroutine 操作同一个变量，使用 `mutex`（更高效）。
- 如果要限制并发数，二者可以结合使用，如 `channel` 控制并发，`mutex` 保护数据。
- `select` 适用于监听多个 `channel` 和超时控制。

推荐做法：

- 优先考虑 `channel`，符合 Go 语言风格。
- 如果性能瓶颈明显（高频数据访问），使用 `sync.Mutex` 进行优化。
- 如果有并发控制需求，可以结合 `channel` 和 `mutex`。
- `select` 适用于监听多个 `channel` 和超时控制。

------

## 8. 参考资料

- [官方 `sync` 包文档](https://pkg.go.dev/sync)
- [官方 `channel` 文档](https://golang.org/ref/spec#Channel_types)
- [Go `select` 语法](https://go.dev/ref/spec#Select_statements)
