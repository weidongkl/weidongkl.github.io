# Golang sync.Cond

## 1. 概述

`sync.Cond` 是 Go 标准库中提供的一种条件变量，用于协调多个 goroutine 之间的同步。它允许一组 goroutine 在满足特定条件时被唤醒执行。

## 2. 基本概念

### 2.1 条件变量

条件变量是一种同步原语，它：
- 允许 goroutine 在某个条件不满足时挂起（等待）
- 当条件可能满足时，通知等待的 goroutine 检查条件

### 2.2 Cond 结构

```go
type Cond struct {
    noCopy noCopy
    L Locker // 关联的互斥锁
    notify  notifyList
}
```

## 3. 核心方法

### 3.1 创建 Cond

```go
func NewCond(l Locker) *Cond
```

示例：
```go
var mu sync.Mutex
cond := sync.NewCond(&mu)
```

### 3.2 Wait 方法

```go
func (c *Cond) Wait()
```
- 必须先获取关联的锁
- 调用时会释放锁并挂起当前 goroutine
- 被唤醒时会重新获取锁

### 3.3 Signal 方法

```go
func (c *Cond) Signal()
```
- 唤醒一个等待的 goroutine

### 3.4 Broadcast 方法

```go
func (c *Cond) Broadcast()
```
- 唤醒所有等待的 goroutine

## 4. 使用模式

### 4.1 基本使用模式

```go
mu.Lock()
// 检查条件
for !condition() {  // for 防止虚假唤醒,或者多个协程被唤醒，只能执行一个
    cond.Wait()
}
// 条件满足，执行操作
mu.Unlock()
```

### 4.2 生产者-消费者示例

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var (
	queue []int
	lock  = sync.Mutex{}
	cond  = sync.NewCond(&lock)
)

func consumer(id int) {
	for {
		cond.L.Lock()
		for len(queue) == 0 {
			cond.Wait()
		}
		item := queue[0]
		queue = queue[1:]
		fmt.Printf("Consumer %d got item: %d\n", id, item)
		cond.L.Unlock()
		time.Sleep(500 * time.Millisecond)
	}
}

func producer() {
	for i := 0; i < 5; i++ {
		cond.L.Lock()
		queue = append(queue, i)
		fmt.Printf("Producer added item: %d\n", i)
		cond.Signal() // 或 cond.Broadcast()
		cond.L.Unlock()
		// 等待消费。这样确保生成一个后，消费完一个才继续执行下一个生成。
		// 否则，
		time.Sleep(1 * time.Second)
	}
}

func main() {
	for i := 0; i < 2; i++ {
		go consumer(i)
	}
	producer()
	//time.Sleep(10 * time.Second)
}

```

## 5. 注意事项

1. **必须持有锁时调用 Wait**:
   - Wait 会在调用时释放锁，但在返回前会重新获取锁

2. **条件检查应使用循环**:
   - 被唤醒后应重新检查条件，因为可能有虚假唤醒

3. **Signal 和 Broadcast 的区别**:
   - Signal 只唤醒一个等待的 goroutine
   - Broadcast 唤醒所有等待的 goroutine

4. **性能考虑**:
   - 在大多数情况下，channel 可能是更简单的选择
   - Cond 适用于复杂的条件等待场景

## 6. 最佳实践

1. **封装条件检查**:
   ```go
   func (s *Shared) waitForCondition() {
       s.mu.Lock()
       defer s.mu.Unlock()
       for !s.condition {
           s.cond.Wait()
       }
   }
   ```

2. **使用 defer 释放锁**:
   - 确保在 Wait 返回后锁会被释放

3. **避免过度使用**:
   - 在简单场景下优先考虑 channel

## 7. 与 channel 的对比

| 特性             | `sync.Cond`           | `channel`                      |
| ---------------- | --------------------- | ------------------------------ |
| 信号通知         | ✅                     | ✅（缓冲通道或 select + close） |
| 多等待者唤醒控制 | ✅（Signal/Broadcast） | ❌                              |
| 队列机制         | ❌（需自己实现）       | ✅                              |
| 简单协程通信     | ❌                     | ✅                              |

> 推荐优先使用 channel，除非必须使用 `Cond` 的信号语义。

## 8. 总结

`sync.Cond` 是 Go 中处理复杂同步问题的强大工具，但需要谨慎使用。理解其工作原理和正确使用模式对于编写正确的并发程序至关重要。