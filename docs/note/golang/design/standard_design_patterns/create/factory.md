---
sidebar_position: 1
---

# 工厂模式（Factory Pattern）

## 1. 概述

工厂模式是一种创建型设计模式，目的是**将对象的创建过程与使用过程分离**，从而降低代码耦合、增强扩展性。

在 Go 中，虽然没有类和继承，但可以通过接口 + 工厂函数/结构来实现相同思想。

---

## 2. 简单工厂（Simple Factory）

### 2.1 示例：图形创建器

```go
package main

import "fmt"

// 接口
type Shape interface {
	Draw()
}

// 实现类
type Circle struct{}
func (c Circle) Draw() { fmt.Println("Drawing Circle") }

type Square struct{}
func (s Square) Draw() { fmt.Println("Drawing Square") }

// 简单工厂
func ShapeFactory(shapeType string) Shape {
	switch shapeType {
	case "circle":
		return Circle{}
	case "square":
		return Square{}
	default:
		return nil
	}
}

func main() {
	s1 := ShapeFactory("circle")
	s2 := ShapeFactory("square")
	s1.Draw()
	s2.Draw()
}
```

### 2.2 示例：网络连接

```go
// 连接接口
type Conn interface {
    Send([]byte) error
    Receive() ([]byte, error)
}

// 简单工厂实现
func NewConn(network string, addr string) (Conn, error) {
    switch network {
    case "tcp":
        return &TCPConn{addr: addr}, nil
    case "unix":
        return &UnixConn{path: addr}, nil
    case "http":
        return &HTTPConn{url: addr}, nil
    default:
        return nil, fmt.Errorf("unsupported network")
    }
}

// 使用示例
func main() {
    conn, _ := NewConn("http", "https://api.example.com")
    conn.Send([]byte("GET /"))
}
```

### 2.3 优缺点

- ✅ 简单直接，适合小规模使用
- ❌ 增加新类型要修改工厂，违反开闭原则（`OCP`）

------

## 3. 工厂方法（Factory Method）

### 3.1 示例：数据库连接器

```go
package main

import "fmt"

// 接口
type DBConnector interface {
	Connect()
}

// 实现
type MySQLConnector struct{}
func (m MySQLConnector) Connect() { fmt.Println("MySQL connected") }

type PostgresConnector struct{}
func (p PostgresConnector) Connect() { fmt.Println("Postgres connected") }

// 工厂接口
type DBFactory interface {
	CreateConnector() DBConnector
}

// 实现工厂
type MySQLFactory struct{}
func (f MySQLFactory) CreateConnector() DBConnector { return MySQLConnector{} }

type PostgresFactory struct{}
func (f PostgresFactory) CreateConnector() DBConnector { return PostgresConnector{} }

func main() {
	var factory DBFactory
	factory = MySQLFactory{}
	conn := factory.CreateConnector()
	conn.Connect()

	factory = PostgresFactory{}
	conn = factory.CreateConnector()
	conn.Connect()
}
```

### 3.2 示例：日志系统

```go
// 日志接口
type Logger interface {
    Log(level string, msg string)
}

// 工厂接口
type LoggerFactory interface {
    Create() Logger
}

// 文件日志实现
type FileLogger struct {
    path string
}

func (f *FileLogger) Log(level, msg string) {
    // 实现文件写入
}

type FileLoggerFactory struct {
    path string
}

func (f *FileLoggerFactory) Create() Logger {
    return &FileLogger{path: f.path}
}

// 控制台日志实现
type ConsoleLogger struct{}

func (c *ConsoleLogger) Log(level, msg string) {
    fmt.Printf("[%s] %s\n", level, msg)
}

type ConsoleLoggerFactory struct{}

func (f *ConsoleLoggerFactory) Create() Logger {
    return &ConsoleLogger{}
}

// 使用示例
func getLoggerFactory(env string) LoggerFactory {
    if env == "production" {
        return &FileLoggerFactory{path: "/var/log/app.log"}
    }
    return &ConsoleLoggerFactory{}
}

func main() {
    factory := getLoggerFactory(os.Getenv("APP_ENV"))
    logger := factory.Create()
    logger.Log("INFO", "application started")
}
```



### 3.3 优缺点

- ✅ 遵循开闭原则，新增类型无需改旧代码
- ❌ 类（结构）增多，代码结构复杂

------

## 4. 抽象工厂（Abstract Factory）

### 4.1 示例：UI 工厂（按钮 + 文本框）

```go
package main

import "fmt"

// 产品接口族
type Button interface {
	Paint()
}
type Textbox interface {
	Draw()
}

// Windows 系列
type WindowsButton struct{}
func (WindowsButton) Paint() { fmt.Println("Windows Button") }

type WindowsTextbox struct{}
func (WindowsTextbox) Draw() { fmt.Println("Windows Textbox") }

// Mac 系列
type MacButton struct{}
func (MacButton) Paint() { fmt.Println("Mac Button") }

type MacTextbox struct{}
func (MacTextbox) Draw() { fmt.Println("Mac Textbox") }

// 抽象工厂接口
type GUIFactory interface {
	CreateButton() Button
	CreateTextbox() Textbox
}

// 具体工厂
type WindowsFactory struct{}
func (WindowsFactory) CreateButton() Button { return WindowsButton{} }
func (WindowsFactory) CreateTextbox() Textbox { return WindowsTextbox{} }

type MacFactory struct{}
func (MacFactory) CreateButton() Button { return MacButton{} }
func (MacFactory) CreateTextbox() Textbox { return MacTextbox{} }

// 使用
func main() {
	var factory GUIFactory

	factory = WindowsFactory{}
	factory.CreateButton().Paint()
	factory.CreateTextbox().Draw()

	factory = MacFactory{}
	factory.CreateButton().Paint()
	factory.CreateTextbox().Draw()
}
```

### 4.2 优缺点

- ✅ 保证一组产品的一致性（同属一个系统）
- ❌ 扩展产品族困难（需要修改接口）

------

## 5. 函数式工厂（Functional Factory）

```go
package main

import "fmt"

type Animal interface {
	Speak()
}

type Dog struct{}
func (Dog) Speak() { fmt.Println("Woof!") }

type Cat struct{}
func (Cat) Speak() { fmt.Println("Meow!") }

var animalRegistry = make(map[string]func() Animal)

func RegisterAnimal(name string, factory func() Animal) {
	animalRegistry[name] = factory
}

func GetAnimal(name string) Animal {
	if f, ok := animalRegistry[name]; ok {
		return f()
	}
	return nil
}

func main() {
	RegisterAnimal("dog", func() Animal { return Dog{} })
	RegisterAnimal("cat", func() Animal { return Cat{} })

	GetAnimal("dog").Speak()
	GetAnimal("cat").Speak()
}
```

### 5.1 优点

- ✅ 高度解耦，便于插件化开发
- ✅ 新增产品无需改动旧工厂逻辑

------

## 6.  工厂模式应用场景

- ✅ 日志、数据库、配置适配器
- ✅ 插件系统、驱动层抽象
- ✅ UI 工具包的主题/皮肤切换

------

## 7. 小结对比

| 类型       | 是否可扩展 | 简洁性 | 应用范围   |
| ---------- | ---------- | ------ | ---------- |
| 简单工厂   | ❌ 不易扩展 | ✅      | 小项目     |
| 工厂方法   | ✅          | ✅      | 通用       |
| 抽象工厂   | ✅（产品）  | ❌      | 系列产品   |
| 函数式注册 | ✅          | ✅      | 插件式架构 |
