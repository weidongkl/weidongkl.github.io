# Token Bucket（令牌桶）算法

## 1. 概述

**Token Bucket**（令牌桶）是一种**流量控制算法**，常用于：

* 限速（Rate Limiting）；
* 拒绝服务保护（DoS 防御）；
* API 调用频控；
* 网络带宽整形（如 Linux 中的 tc）。

> 本质思想：**按照一定速率产生“令牌”，只有拿到令牌的请求才能继续处理。**

---

## 2. 基本原理

**组成部分**

| 组成         | 描述                                     |
| ------------ | ---------------------------------------- |
| 令牌桶       | 一个容量为 `capacity` 的容器，存放“令牌” |
| 令牌生成速率 | 每 `interval` 时间放入一个令牌           |
| 请求获取令牌 | 请求到来时尝试从桶中获取一个令牌         |

**工作流程**

1. 令牌桶按照固定速率产生令牌（如每秒 1 个）。
2. 桶最多只能容纳 `N` 个令牌（即桶容量）。
3. 当请求到来时：

   * 如果桶里有令牌：消耗一个令牌，允许处理；
   * 如果桶是空的：拒绝/排队/等待（视策略而定）。

---

## 3. 与漏桶（Leaky Bucket）区别

| 项目             | Token Bucket             | Leaky Bucket           |
| ---------------- | ------------------------ | ---------------------- |
| 控制策略         | 控制突发（允许瞬时高峰） | 平滑处理               |
| 是否支持突发流量 | ✅ 支持                   | ❌ 不支持               |
| 应用场景         | 限制速率，但允许瞬时爆发 | 网络整形，严格速率控制 |

---

## 4. 代码实现示例（Golang）

下面是一个简化的 Token Bucket 示例：

```go
type TokenBucket struct {
	tokens chan struct{}
}

func NewTokenBucket(rate time.Duration, capacity int) *TokenBucket {
	tb := &TokenBucket{
		tokens: make(chan struct{}, capacity),
	}
	// 初始化填满桶
	for i := 0; i < capacity; i++ {
		tb.tokens <- struct{}{}
	}
	// 定时产生令牌
	go func() {
		ticker := time.NewTicker(rate)
		defer ticker.Stop()
		for range ticker.C {
			select {
			case tb.tokens <- struct{}{}:
			default: // 桶满了就丢弃新令牌
			}
		}
	}()
	return tb
}

func (tb *TokenBucket) Allow() bool {
	select {
	case <-tb.tokens:
		return true
	default:
		return false
	}
}
```

---

## 5. 应用场景

防止用户频繁访问 API，限制为“每秒 5 次”：

```go
bucket := NewTokenBucket(200*time.Millisecond, 5)
if !bucket.Allow() {
	http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
	return
}
```

---

## 6. 优缺点

✅ **优点**

* 控制速率，避免系统过载；
* 支持突发流量；
* 实现简单，高效。

❌ **缺点**

* 对于极端高并发（几万 QPS），可能需使用更高性能结构（如令牌时间戳队列）；
* 实时性不高时，限流精度受 `ticker` 精度影响。

## 7. 带优先级的Token Bucket算法

为实现 **带优先级的 Token Bucket（令牌桶）算法**，我们可以设计多个“桶”，每个桶代表一个优先级队列，然后用调度器（Scheduler）进行按比例或者优先权调度。

###  7.1每个优先级一个桶

- 高优先级桶：高速率、先获取；
- 低优先级桶：低速率、调度器最后处理；
- 桶之间独立生成令牌。

### 7.2 调度器获取令牌时按优先级顺序尝试

```
                ┌────────┐
                │ Client │
                └───┬────┘
                    │ 请求
            ┌───────▼────────┐
            │  PriorityLimiter │
            └───────┬────────┘
                    ▼
        ┌────────┬─────────┬────────┐
        │  High  │  Mid    │  Low   │
        │ Bucket │ Bucket  │ Bucket │
        └────────┴─────────┴────────┘
```

------

### 7.3  目标特性

- 高优先级请求尽可能快获得处理；
- 所有请求都有公平竞争机会（防止低优饥饿）；
- 支持动态调整优先级。

### 7.4 示例

**基础桶**，和之前代码相同

```go
type TokenBucket struct {
	tokens chan struct{}
}

func NewTokenBucket(rate time.Duration, capacity int) *TokenBucket {
	tb := &TokenBucket{
		tokens: make(chan struct{}, capacity),
	}
	// 填满令牌桶
	for i := 0; i < capacity; i++ {
		tb.tokens <- struct{}{}
	}
	// 定期生成令牌
	go func() {
		ticker := time.NewTicker(rate)
		defer ticker.Stop()
		for range ticker.C {
			select {
			case tb.tokens <- struct{}{}:
			default:
			}
		}
	}()
	return tb
}

func (tb *TokenBucket) TryTake() bool {
	select {
	case <-tb.tokens:
		return true
	default:
		return false
	}
}
```

**带调度器的多级优先限流器**

```go
type Priority int

const (
	High Priority = iota
	Medium
	Low
)

func (p Priority) String() string {
	switch p {
	case High:
		return "HIGH"
	case Medium:
		return "MEDIUM"
	case Low:
		return "LOW"
	default:
		return "UNKNOWN"
	}
}

type PriorityLimiter struct {
	buckets map[Priority]*TokenBucket
	order   []Priority // 调度顺序：High → Medium → Low
}

func NewPriorityLimiter() *PriorityLimiter {
	return &PriorityLimiter{
		buckets: map[Priority]*TokenBucket{
			High:   NewTokenBucket(50*time.Millisecond, 10),
			Medium: NewTokenBucket(200*time.Millisecond, 5),
			Low:    NewTokenBucket(500*time.Millisecond, 2),
		},
		order: []Priority{High, Medium, Low},
	}
}

// TryAllow 会按优先级顺序尝试令牌
func (pl *PriorityLimiter) TryAllow() bool {
	for _, p := range pl.order {
		if pl.buckets[p].TryTake() {
			return true
		}
	}
	return false
}

// 或者：TryAllowWithPriority 指定优先级
func (pl *PriorityLimiter) TryAllowWithPriority(p Priority) bool {
	return pl.buckets[p].TryTake()
}
```

**使用示例**

```go
limiter := NewPriorityLimiter()

// 高优请求
if !limiter.TryAllowWithPriority(High) {
	fmt.Println("High priority request was throttled.")
}

// 低优请求：可能被拒
if !limiter.TryAllowWithPriority(Low) {
	fmt.Println("Low priority request throttled.")
}
```


