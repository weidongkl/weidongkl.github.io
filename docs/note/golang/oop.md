# Go 中的继承与多态

Go 没有传统面向对象语言里的继承机制，而是通过 **结构体组合（嵌入）** 与 **接口** 来实现代码复用与多态。理解这一点是学习 Go 面向对象编程的关键。

------

## 1. 基本概念

- **组合 (Composition)**
   Go 推荐使用 **结构体嵌入** 来实现代码复用，而不是继承。
- **接口 (Interface)**
   Go 的多态是基于接口的。只要一个类型实现了接口定义的方法，就可以作为该接口的实例。
- **方法分派 (Method Dispatch)**
  - **接口调用方法** → 运行时根据动态类型进行分派（真正的多态）。
  - **结构体方法内部调用** → 只根据接收者的静态类型，不会自动转发到“子类覆盖”的方法。

------

## 2. 常见模式

在 Go 中，想要实现类似“继承 + 虚函数”的效果，通常有三种模式：

1. **子类完全重写父类方法**
2. **父类持有函数指针（回调方式）**
3. **父类持有接口（Self Reference 技巧）**

下面分别介绍。

------

### 2.1 子类完全重写父类方法（最直观方式）

子类在实现接口时，直接提供完整逻辑，不依赖父类方法。

#### 示例代码

```go
package main

import "fmt"

// DataCollector 定义数据收集器接口
type DataCollector interface {
	CollectData()
}

// BaseCollector 基础收集器
type BaseCollector struct{}

func (b *BaseCollector) CollectData() {
	fmt.Println("BaseCollector: 收集数据")
}

// NetworkCollector 网络收集器
type NetworkCollector struct{}

// 子类完全实现接口，不依赖 BaseCollector 的实现
func (n *NetworkCollector) CollectData() {
	fmt.Println("NetworkCollector: 收集网络数据")
}

func main() {
	var c DataCollector

	c = &BaseCollector{}
	c.CollectData()

	c = &NetworkCollector{}
	c.CollectData()
}

// Output:
// BaseCollector: 收集数据
// NetworkCollector: 收集网络数据
```

**特点**：

- 简单直接。
- 父类的实现完全不会被使用。
- 适合子类逻辑与父类差异很大的场景。

------

### 2.2 父类持有函数指针（回调方式）

父类提供框架逻辑，并在关键步骤调用一个 **回调函数指针**。子类只需将自己的方法注入父类，即可在父类逻辑中“回调”子类方法。

#### 示例代码

```go
package main

import "fmt"

// DataCollector 接口
type DataCollector interface {
	CollectData()
}

// BaseCollector 基础收集器
type BaseCollector struct {
	doCollect func()
}

func (b *BaseCollector) CollectData() {
	fmt.Println("BaseCollector: 开始收集数据")
	b.ProcessData()
}

func (b *BaseCollector) ProcessData() {
	fmt.Println("BaseCollector: 处理数据")
	if b.doCollect != nil {
		b.doCollect() // 回调子类逻辑
	}
}

// NetworkCollector 网络收集器
type NetworkCollector struct {
	*BaseCollector
}

func (n *NetworkCollector) ProcessData() {
	fmt.Println("NetworkCollector: 处理网络数据")
}

func main() {
	networkCollector := &NetworkCollector{
		BaseCollector: &BaseCollector{},
	}

	// 注入子类方法
	networkCollector.doCollect = networkCollector.ProcessData

	networkCollector.CollectData()
}

// Output:
// BaseCollector: 开始收集数据
// BaseCollector: 处理数据
// NetworkCollector: 处理网络数据
```

**特点**：

- 父类提供框架，子类只需注入自定义逻辑。
- 不依赖接口，更加灵活。
- 缺点是需要手动注入回调，易出错。

------

### 2.3 父类持有接口（Self Reference 技巧）

父类中持有一个接口类型的指针（通常是自己），在方法中通过接口调用，从而触发动态分派。

#### 示例代码

```go
package main

import "fmt"

// DataCollector 接口
type DataCollector interface {
	CollectData()
	ProcessData()
}

// BaseCollector 基础收集器
type BaseCollector struct {
	owner DataCollector // 持有接口，指向自己或子类
}

func (b *BaseCollector) CollectData() {
	fmt.Println("BaseCollector: 开始收集数据")
	b.owner.ProcessData() // 通过接口调用，触发动态分派
}

func (b *BaseCollector) ProcessData() {
	fmt.Println("BaseCollector: 处理数据")
}

// NetworkCollector 网络收集器
type NetworkCollector struct {
	*BaseCollector
}

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

**特点**：

- 父类逻辑可复用，子类方法能动态分派。
- 模拟了传统 OOP 的“虚函数”效果。
- 缺点是需要写构造函数，并小心循环引用问题。

------

## 3. 三种模式对比

| 模式                    | 特点                         | 适用场景                           |
| ----------------------- | ---------------------------- | ---------------------------------- |
| **子类完全重写方法**    | 简单直接，父类逻辑完全不用   | 子类逻辑与父类完全不同             |
| **函数指针回调方式**    | 父类框架+子类注入逻辑，灵活  | 父类框架为主，子类只定制部分逻辑   |
| **Self Reference 技巧** | 父类逻辑可复用，支持动态分派 | 类似模板方法模式，子类覆盖部分逻辑 |

------

## 4. 总结

- Go 倡导 **组合优于继承**。
- 如果只是复用代码，直接用结构体嵌入即可。
- 如果需要类似“虚函数”的效果，可以考虑：
  - 简单情况：**函数指针回调**
  - 框架式逻辑：**Self Reference 技巧**
- 如果子类逻辑与父类差别很大，不妨直接 **重写方法**，更清晰。


