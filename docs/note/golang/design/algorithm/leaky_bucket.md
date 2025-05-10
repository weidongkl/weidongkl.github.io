# Leaky Bucket（漏桶）算法

## 1. 概述

**Leaky Bucket**（漏桶）是一种**流量整形和速率限制算法**，常用于：

* 流量整形（Traffic Shaping）
* 速率限制（Rate Limiting）
* 网络流量控制
* 平滑突发流量

> 本质思想：**请求以任意速率进入桶中，但以固定速率流出处理**

---

## 2. 基本原理

**组成部分**

| 组成         | 描述                                     |
| ------------ | ---------------------------------------- |
| 漏桶         | 一个容量为 `capacity` 的容器             |
| 漏水速率     | 每 `interval` 时间漏出一个请求           |
| 请求处理     | 请求到来时尝试进入桶中                   |

**工作流程**

1. 漏桶以固定速率漏水（处理请求）
2. 桶最多只能容纳 `N` 个请求（即桶容量）
3. 当请求到来时：
   * 如果桶未满：请求进入桶中排队
   * 如果桶已满：拒绝/丢弃请求（视策略而定）

---

## 3. 与令牌桶（Token Bucket）区别

| 项目             | Leaky Bucket           | Token Bucket             |
| ---------------- | ---------------------- | ------------------------ |
| 控制策略         | 严格固定速率输出       | 允许一定突发流量         |
| 是否支持突发流量 | ❌ 不支持               | ✅ 支持                   |
| 实现复杂度       | 较简单                 | 较复杂                   |
| 应用场景         | 网络整形、严格速率控制 | 限制平均速率但允许突发   |

---

## 4. 代码实现示例（Golang）

### 基础实现（非并发安全）

```go
type LeakyBucket struct {
	capacity    int           // 桶容量
	remaining  int           // 当前剩余容量
	leakRate   time.Duration // 漏水速率
	lastLeak   time.Time     // 上次漏水时间
}

func NewLeakyBucket(capacity int, leakRate time.Duration) *LeakyBucket {
	return &LeakyBucket{
		capacity:   capacity,
		remaining:  capacity,
		leakRate:  leakRate,
		lastLeak:  time.Now(),
	}
}

func (lb *LeakyBucket) Allow() bool {
	now := time.Now()
	elapsed := now.Sub(lb.lastLeak)
	
	// 计算这段时间应该漏出的水量
	leaked := int(elapsed / lb.leakRate)
	if leaked > 0 {
		lb.remaining += leaked
		if lb.remaining > lb.capacity {
			lb.remaining = lb.capacity
		}
		lb.lastLeak = now
	}
	
	if lb.remaining <= 0 {
		return false
	}
	// allow 一次，减一个可用容量
	lb.remaining--
	return true
}
```

### 并发安全实现

```go
type ConcurrentLeakyBucket struct {
	capacity    int
	remaining  int
	leakRate   time.Duration
	lastLeak   time.Time
    // 增加锁
	mu         sync.Mutex
}

func (lb *ConcurrentLeakyBucket) Allow() bool {
    // 增加锁
	lb.mu.Lock()
	defer lb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(lb.lastLeak)
	leaked := int(elapsed / lb.leakRate)
	
	if leaked > 0 {
		lb.remaining += leaked
		if lb.remaining > lb.capacity {
			lb.remaining = lb.capacity
		}
		lb.lastLeak = now
	}
	
	if lb.remaining <= 0 {
		return false
	}
	
	lb.remaining--
	return true
}
```

### 带队列的实现（不丢弃请求）

```go
type QueuedLeakyBucket struct {
	queue      chan struct{}    // 请求队列
	leakRate   time.Duration    // 处理速率
	stopChan   chan struct{}    // 停止信号
	wg         sync.WaitGroup   // 等待组
}

func NewQueuedLeakyBucket(capacity int, leakRate time.Duration) *QueuedLeakyBucket {
	lb := &QueuedLeakyBucket{
		queue:    make(chan struct{}, capacity),
		leakRate: leakRate,
		stopChan: make(chan struct{}),
	}
	
	lb.wg.Add(1)
	go lb.leak()
	
	return lb
}

func (lb *QueuedLeakyBucket) leak() {
	defer lb.wg.Done()
	
	ticker := time.NewTicker(lb.leakRate)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			select {
			case <-lb.queue: // 处理一个请求
			default:         // 队列为空
			}
		case <-lb.stopChan:
			return
		}
	}
}

func (lb *QueuedLeakyBucket) Add() bool {
	select {
	case lb.queue <- struct{}{}:
		return true
	default:
		return false
	}
}

func (lb *QueuedLeakyBucket) Stop() {
	close(lb.stopChan)
	lb.wg.Wait()
}
```

---

## 5. 应用场景

### API 速率限制

```go
bucket := NewLeakyBucket(10, time.Second) // 每秒最多10个请求

func handler(w http.ResponseWriter, r *http.Request) {
	if !bucket.Allow() {
		http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
		return
	}
	// 处理请求
}
```

### 网络流量整形

```go
// 限制上传速度为1MB/s
bucket := NewLeakyBucket(1024*1024, time.Second)

func writeData(data []byte) {
	for len(data) > 0 {
		chunkSize := min(len(data), 4096)
		if !bucket.AllowN(chunkSize) { // 需要实现AllowN方法
			time.Sleep(10 * time.Millisecond)
			continue
		}
		// 写入数据
		data = data[chunkSize:]
	}
}
```

---

## 6. 优缺点

✅ **优点**

* 严格限制处理速率，保护下游系统
* 平滑突发流量，避免系统过载
* 实现相对简单

❌ **缺点**

* 无法应对突发流量（所有请求都会被限速）
* 实时性要求高时可能不够精确
* 长时间高负载可能导致请求延迟增加

---

## 7. 变种与扩展

### 7.1 分层漏桶（Hierarchical Leaky Bucket）

```go
type HierarchicalBucket struct {
	buckets []*LeakyBucket
}

func (hb *HierarchicalBucket) Allow() bool {
	for _, bucket := range hb.buckets {
		if !bucket.Allow() {
			return false
		}
	}
	return true
}
```

### 7.2 动态速率漏桶

```go
type DynamicLeakyBucket struct {
	capacity    int
	remaining  int
	leakRate   time.Duration
	lastLeak   time.Time
	mu         sync.Mutex
}

func (dlb *DynamicLeakyBucket) SetRate(newRate time.Duration) {
	dlb.mu.Lock()
	defer dlb.mu.Unlock()
	dlb.leakRate = newRate
}
```

### 7.3 带权重的漏桶

```go
type WeightedLeakyBucket struct {
	capacity    int
	remaining  int
	leakRate   time.Duration
	lastLeak   time.Time
	mu         sync.Mutex
}

func (wlb *WeightedLeakyBucket) AllowN(weight int) bool {
	wlb.mu.Lock()
	defer wlb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(wlb.lastLeak)
	leaked := int(elapsed / wlb.leakRate)
	
	if leaked > 0 {
		wlb.remaining += leaked
		if wlb.remaining > wlb.capacity {
			wlb.remaining = wlb.capacity
		}
		wlb.lastLeak = now
	}
	
	if wlb.remaining < weight {
		return false
	}
	
	wlb.remaining -= weight
	return true
}
```

---

## 8. 最佳实践

1. **监控指标**：记录请求通过率、拒绝率和等待时间
2. **动态调整**：根据系统负载动态调整漏桶参数
3. **分级限流**：结合多级漏桶实现复杂限流策略
4. **优雅降级**：被限流的请求提供友好提示或降级服务
5. **分布式扩展**：在分布式系统中使用Redis等实现分布式漏桶
