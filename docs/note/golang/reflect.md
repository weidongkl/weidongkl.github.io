# Golang Reflect 

## 1. 反射（Reflect）概述

反射是 Go 语言中的一个强大特性，允许程序在运行时检查和操作变量的类型和值。 `reflect` 包提供了一系列 API，使得开发者可以动态获取变量的信息、修改变量的值，并在一定程度上实现动态调用。

**适用场景：**

- 处理接口类型的变量
- 解析结构体标签（struct tag）
- 生成通用工具，如序列化、反序列化、ORM 框架等

**reflect 包的核心功能：**

1. **类型检查**：获取变量的类型信息。
2. **值操作**：获取和修改变量的值。
3. **方法调用**：动态调用结构体的方法。
4. **字段操作**：动态访问和修改结构体的字段。
5. **创建实例**：通过反射创建新的变量实例。

## 2. 反射的基本类型

在 `reflect` 包中，主要有两个核心类型：

- `reflect.Type`：表示变量的类型（`TypeOf` 获取）
- `reflect.Value`：表示变量的值（`ValueOf` 获取）

## 2.1 获取变量的类型和值

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	var num int = 42
	typeInfo := reflect.TypeOf(num)
	valueInfo := reflect.ValueOf(num)

	fmt.Println("Type:", typeInfo)   // int
	fmt.Println("Value:", valueInfo) // 42
	typeInfo = reflect.TypeOf(&num)
	valueInfo = reflect.ValueOf(&num)
	fmt.Println("Point Type:", typeInfo)   // *int
	fmt.Println("Point Value:", valueInfo) // 0xc00010a000
}
```

## 3. 反射修改变量值

反射可以修改变量的值，但前提是 `reflect.Value` 必须是可设置的（`CanSet()` 方法返回 `true`）。

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	var num int = 42
	// 传递指针才能修改原值
	// 此时的valueInfo是一个reflect.Value类型。代表num指针
	valueInfo := reflect.ValueOf(&num)
	// 此时的valueElem是一个reflect.Value类型。代表num的值
	valueElem := valueInfo.Elem()
	/*
	 * 当你需要通过指针修改原始变量的值时，你需要先获取指针的 reflect.Value，
	 * 然后通过 .Elem() 方法获取到实际的值并进行操作。
	 */
	if valueElem.CanSet() {
		valueElem.SetInt(100)
	}
	fmt.Println("Modified value:", num) // 100
}
```

## 4. 反射处理结构体

### 4.1 获取结构体字段信息

```go
package main

import (
	"fmt"
	"reflect"
)

type Person struct {
	Name string
	Age  int
}

func main() {
	p := Person{Name: "Alice", Age: 30}
	typeInfo := reflect.TypeOf(p)
	// NumField returns the number of fields in the struct.
	// It panics if the type of v is not a struct.
	for i := 0; i < typeInfo.NumField(); i++ {
		field := typeInfo.Field(i)
		fmt.Printf("Field Name: %s, Type: %s\n", field.Name, field.Type)
	}
}
```

### 4.2 解析结构体标签（Tag）

结构体字段可以带有标签，用于元数据存储，如 JSON、数据库映射等。

```go
package main

import (
	"fmt"
	"reflect"
)

type User struct {
	ID   int    `json:"id" yaml:"id"`
	Name string `json:"name"`
}

func main() {
	typeInfo := reflect.TypeOf(User{})
	for i := 0; i < typeInfo.NumField(); i++ {
		field := typeInfo.Field(i)
		// 打印字段标签
		fmt.Printf("Field Tag: %s\n", field.Tag)
		tag := field.Tag.Get("json")
		fmt.Printf("Field: %s, JSON Tag: %s\n", field.Name, tag)
	}
}
```

## 5. 反射调用方法

有参数调用

```go
package main

import (
	"fmt"
	"reflect"
)

type Calculator struct{}

func (c Calculator) Add(a, b int) int {
	return a + b
}

func main() {
	calc := Calculator{}
	method := reflect.ValueOf(calc).MethodByName("Add")
	args := []reflect.Value{reflect.ValueOf(10), reflect.ValueOf(20)}
	result := method.Call(args)

	fmt.Println("Result:", result[0].Int()) // 30
}
```

无参数调用

```go
package main

import (
	"fmt"
	"reflect"
)

type User struct {
	Name string
}

func (u User) SayHello() {
	fmt.Println("Hello,", u.Name)
}

func main() {
	u := User{Name: "Alice"}
	v := reflect.ValueOf(u)
	method := v.MethodByName("SayHello")
	method.Call(nil) // 输出: Hello, Alice
}
```

## 6. 反射的局限性

- 代码可读性降低，调试难度增大
- 性能损耗，相比普通方法调用慢10倍以上

## 7. 反射最佳实践

- 只有在动态需求时使用反射，避免滥用
- 使用 `interface{}` 和 `switch` 语句作为反射的替代方案
- 结合 `json`、`protobuf` 等库时，合理利用 `reflect` 提取字段信息
