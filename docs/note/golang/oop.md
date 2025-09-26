# Go 中的继承与多态

## 1. 基本概念

- **组合 (Composition)**：Go 没有传统 OOP 的继承，而是通过 **结构体嵌入**实现代码复用。

- **接口 (Interface)**：Go 的多态是通过接口实现的。不同类型只要实现了相同的方法，就能被当作接口使用。

- **方法分派**：

  - **接口调用方法** → 运行时根据动态类型分派（真正的多态）。

  - **结构体接收者内部调用方法** → 只根据接收者的静态类型，不会自动转发到“子类覆盖”的方法。

    > 在父类方法里调用自己的方法，不会自动触发子类重写的版本。

------

## 2. 常见模式

### 2.1 子类完全重写父类方法

在子类中实现 `CollectData`，自行调用自己的 `ProcessData`。
 这是最直观的方式。

```go
func (n *NetworkCollector) CollectData() {
    fmt.Println("BaseCollector: 开始收集数据")
    n.ProcessData() // 调用 NetworkCollector.ProcessData
}
```

------

### 2.2 父类持有一个接口指针（Self Reference 技巧）

通过在父类中保存一个 `DataCollector` 接口，让方法调用时走接口，从而触发动态分派。

> 这是模拟“虚函数”的常见技巧。

#### 完整示例：

问题代码：

```go
package main

import "fmt"

// DataCollector 定义数据收集器接口
type DataCollector interface {
	CollectData()
}

// BaseCollector 基础收集器实现
type BaseCollector struct{}

// CollectData 实现数据收集接口
func (b *BaseCollector) CollectData() {
	fmt.Println("BaseCollector: 开始收集数据")
	b.ProcessData() // 调用动态分派的 ProcessData 方法
}

// ProcessData 基础的数据处理方法
func (b *BaseCollector) ProcessData() {
	fmt.Println("BaseCollector: 处理数据")
}

// NetworkCollector 网络数据收集器，继承 BaseCollector
type NetworkCollector struct {
	*BaseCollector
}

// ProcessData 覆盖基础的数据处理方法
func (n *NetworkCollector) ProcessData() {
	fmt.Println("NetworkCollector: 处理网络数据")
}

func main() {
	// 创建网络收集器实例
	networkCollector := &NetworkCollector{
		BaseCollector: &BaseCollector{},
	}

	// 将具体实现转换为接口类型
	var collector DataCollector = networkCollector

	// 通过接口调用收集方法
	collector.CollectData()
}
// Output
// BaseCollector: 开始收集数据
// BaseCollector: 处理数据
```

继承代码：

```go
package main

import "fmt"

// DataCollector 定义数据收集器接口
type DataCollector interface {
	CollectData()
	ProcessData()
}

// BaseCollector 基础收集器实现
type BaseCollector struct {
	owner DataCollector // 持有外层接口
}

// CollectData 实现数据收集接口
func (b *BaseCollector) CollectData() {
	fmt.Println("BaseCollector: 开始收集数据")
	b.owner.ProcessData() // 通过接口调用，触发动态分派
}

// ProcessData 基础的数据处理方法
func (b *BaseCollector) ProcessData() {
	fmt.Println("BaseCollector: 处理数据")
}

// NetworkCollector 网络数据收集器，嵌入 BaseCollector
type NetworkCollector struct {
	*BaseCollector
}

// ProcessData 覆盖基础的数据处理方法
func (n *NetworkCollector) ProcessData() {
	fmt.Println("NetworkCollector: 处理网络数据")
}

// 构造函数：注入 self reference
func NewNetworkCollector() *NetworkCollector {
	n := &NetworkCollector{}
	base := &BaseCollector{owner: n}
	n.BaseCollector = base
	return n
}

func main() {
	collector := NewNetworkCollector()
	var c DataCollector = collector
	c.CollectData()
}

// Output:
// BaseCollector: 开始收集数据
// NetworkCollector: 处理网络数据
```

------

## 3. 模式对比总结

| 模式                    | 特点                             | 适用场景                             |
| ----------------------- | -------------------------------- | ------------------------------------ |
| **子类重写方法**        | 简单直接，最清晰                 | 子类逻辑完全不同，父类逻辑不再适用   |
| **Self Reference 技巧** | 父类逻辑可复用，动态分派子类方法 | 父类提供通用框架，子类只定制部分行为 |

> - Go 的设计哲学是 **组合优于继承**。如果要频繁用“虚函数”风格的继承，说明可能需要重新思考设计。
> - 如果逻辑框架必须由父类掌控（类似模板方法模式），就可以用 **Self Reference 技巧**来实现多态。
