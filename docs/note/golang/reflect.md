# Golang Reflect 

## 1. 概述

Go 的反射机制允许程序在运行时动态地检查和操作变量的类型和值。标准库中的 `reflect` 包提供了操作类型（`reflect.Type`）和值（`reflect.Value`）的接口，支持结构体字段、方法、标签的访问与修改，广泛用于泛型处理、序列化、ORM 等通用框架中。

### 典型应用场景：

- 操作接口类型变量
- 解析结构体标签（struct tag）
- 实现通用工具，如 JSON 编码器、ORM 框架等

### 核心功能：

1. 类型检查：获取变量的类型信息
2. 值操作：读取和修改变量值
3. 方法调用：动态调用结构体方法
4. 字段操作：访问和设置结构体字段
5. 创建实例：动态创建变量

### 局限与风险：

- **性能开销大**：大约慢 10 倍
- **类型不安全**：编译期无法检查类型错误
- **调试困难**：动态代码可读性差
- **并发安全性差**：`reflect.Value` 不是并发安全的

### 使用建议：

- 优先使用接口和类型断言替代反射

  ```go
  if u, ok := x.(User); ok {
      // 比反射更快
  }
  ```

- 在需要动态处理字段或标签时使用反射

- 性能敏感场景下应提前生成代码

- `reflect.Value` 不可并发共享使用

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
	var num int32 = 42
	typeInfo := reflect.TypeOf(num)
	valueInfo := reflect.ValueOf(num)

	fmt.Println("Type:", typeInfo)                   // int32
	fmt.Println("Value:", valueInfo)                 // 42
    fmt.Println(valueInfo.Int())                     // 42
	fmt.Println("typeInfo Kind:", typeInfo.Kind())   // int32
	fmt.Println("valueInfo Kind:", valueInfo.Kind()) // int32
	// 如果reflect.Value 是一个 指针 或 接口，reflect.Value.Elem()会返回指针/接口指向的 底层值
	// 如果 reflect.Value 是 普通类型（如 int32），调用 Elem() 就会触发这个 panic
	//fmt.Println("Type:", typeInfo.Elem())  // panic: reflect: Elem of invalid type int32
	//fmt.Println("Value:", valueInfo.Elem())
	typeInfo = reflect.TypeOf(&num)
	valueInfo = reflect.ValueOf(&num)
	fmt.Println("Point Type:", typeInfo)                   // *int
	fmt.Println("Point Value:", valueInfo)                 // 0xc...
	fmt.Println("Point typeInfo Kind:", typeInfo.Kind())   // ptr
	fmt.Println("Point valueInfo Kind:", valueInfo.Kind()) // ptr
	fmt.Println("Point typeInfo Elem:", typeInfo.Elem())   // int32
	fmt.Println("Point valueInfo Elem:", valueInfo.Elem()) // 42
}

```

## 2.2 类型检查

```go
func checkType(x interface{}) {
    t := reflect.TypeOf(x)
    switch t.Kind() {
    case reflect.Int:
        fmt.Println("Integer type")
    case reflect.String:
        fmt.Println("String type")
    case reflect.Struct:
        fmt.Println("Struct type")
    }
}
```

## 3. 反射修改变量值

要通过反射修改变量值，必须满足两个条件：

- `reflect.Value` 包装的是**指针**

- `.Elem().CanSet()` 返回 `true`

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
	// 只有struct类型才需要遍历
	if typeInfo.Kind() != reflect.Struct {
		fmt.Println("Not a struct")
		return
	}
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

## 5. 动态调用方法

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

## 6. 动态创建变量和结构体实例

使用 `reflect.New()` 可以动态创建任意类型的实例，并返回一个指向新值的 `reflect.Value`。

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
	// 获取类型
	t := reflect.TypeOf(Person{})
	// 创建新实例（返回的是 *Person 的 Value）
	v := reflect.New(t)

	// 访问并设置字段值（通过 Elem 获取底层结构体）
	elem := v.Elem()
	elem.FieldByName("Name").SetString("Alice")
	elem.FieldByName("Age").SetInt(28)

	// 转换为 interface{}，然后断言为目标类型
	p := v.Interface().(*Person)
	fmt.Printf("New Person: %+v\n", p) // &{Name:Alice Age:28}
}
```

------

## 7. 动态创建函数（MakeFunc）

使用 `reflect.MakeFunc` 可以动态创建一个函数。适用于需要在运行时生成或替换函数逻辑的场景。

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	// 创建一个 func(int, int) int 类型的函数
	fnType := reflect.TypeOf(func(a, b int) int { return 0 })

	// 创建函数实现
	fnValue := reflect.MakeFunc(fnType, func(args []reflect.Value) []reflect.Value {
		a := args[0].Int()
		b := args[1].Int()
		return []reflect.Value{reflect.ValueOf(int(a * b))}
	})

	// 将 reflect.Value 转换为实际函数
	multiply := fnValue.Interface().(func(int, int) int)
	fmt.Println("Result:", multiply(6, 7)) // 42
}
```

------

## 8. 类型判断与接口实现检查

反射支持在运行时判断类型是否实现了某个接口或是否为某种类型。

```go
package main

import (
	"fmt"
	"reflect"
)

type Reader interface {
	Read() string
}

type File struct{}

func (f File) Read() string { return "reading..." }

func main() {
	var f File

	tReader := reflect.TypeOf((*Reader)(nil)).Elem() // 接口类型
	tFile := reflect.TypeOf(f)

	fmt.Println("File implements Reader:", tFile.Implements(tReader)) // true

	// 类型比较
	fmt.Println("Is struct:", tFile.Kind() == reflect.Struct) // true
}
```

## 9. `reflect` + `unsafe`：底层优化技巧

`reflect.Value` 提供了强大的抽象，但在频繁调用时可能引发较多的堆分配和运行时检查，性能不佳。
 通过 `unsafe.Pointer` 可以绕过这些限制，**直接操作内存地址**，实现更快的访问和修改。

------

### 9.1 快速访问结构体字段

假设我们有一个结构体：

```go
User struct {
	ID   int64
	Name string
}
```

目标：**在不知道字段名字的前提下**，高效读取/设置某字段值。

使用 `unsafe` 获取字段地址并修改

```go
package main

import (
	"fmt"
	"reflect"
	"unsafe"
)

type User struct {
	ID   int64
	Name string
}

func main() {
	u := User{ID: 100, Name: "Alice"}

	// 获取结构体指针的 reflect.Value
	v := reflect.ValueOf(&u).Elem()
	field := v.FieldByName("ID")

	// 获取字段的偏移量（相对结构体起始地址）
	offset := field.UnsafeAddr() - v.UnsafeAddr()

	// 获取结构体起始地址
	base := unsafe.Pointer(v.UnsafeAddr())

	// 偏移计算字段地址
	idPtr := (*int64)(unsafe.Pointer(uintptr(base) + offset))

	// 修改字段
	*idPtr = 999

	fmt.Printf("Modified User: %+v\n", u) // ID: 999
}
```

注意事项：

- **`UnsafeAddr()` 只能用于地址可导出的字段**（结构体字段首字母需大写）。
- `reflect.ValueOf(&u).Elem()` 的结果必须是可寻址的。

------

### 9.2 零拷贝类型转换（struct ↔ bytes）

这个技巧用于在性能敏感场景中避免内存复制（如网络协议、序列化解码等）：

```go
package main

import (
	"fmt"
	"reflect"
	"unsafe"
)

type Packet struct {
	Header uint16
	Length uint16
}

func main() {
	// 构造原始结构体
	p := Packet{Header: 0xABCD, Length: 0x1234}

	// struct -> []byte (零拷贝)
	size := unsafe.Sizeof(p)
	sliceHeader := &reflect.SliceHeader{
		Data: uintptr(unsafe.Pointer(&p)),
		Len:  int(size),
		Cap:  int(size),
	}
	byteView := *(*[]byte)(unsafe.Pointer(sliceHeader))

	fmt.Printf("Raw bytes: % x\n", byteView)

	// []byte -> struct (零拷贝反射)
	// 假设 byteView 是合法的 Packet 内存
	p2 := *(*Packet)(unsafe.Pointer(&byteView[0]))
	fmt.Printf("Decoded Packet: %+v\n", p2)
}
```

注意事项：

- 避免对 `byteView` 做扩容操作（会破坏原始内存）
- 使用前应确认内存对齐与结构布局（可用 `go tool compile -S` 检查）

------

### 9.3 性能对比

```go
func BenchmarkReflectSet(b *testing.B) {
	u := User{}
	v := reflect.ValueOf(&u).Elem().FieldByName("ID")
	for i := 0; i < b.N; i++ {
		v.SetInt(int64(i))
	}
}

func BenchmarkUnsafeSet(b *testing.B) {
	u := User{}
	v := reflect.ValueOf(&u).Elem()
	offset := v.FieldByName("ID").UnsafeAddr() - v.UnsafeAddr()
	base := unsafe.Pointer(v.UnsafeAddr())
	idPtr := (*int64)(unsafe.Pointer(uintptr(base) + offset))

	for i := 0; i < b.N; i++ {
		*idPtr = int64(i)
	}
}
```

**结果：**

- unsafe 设置操作通常快 2~5 倍（无类型检查）
- 但维护成本高，存在 panic / 崩溃风险

------

### 9.4 使用建议

| 项目     | 反射 (`reflect`)   | 不安全优化 (`unsafe.Pointer`)      |
| -------- | ------------------ | ---------------------------------- |
| 可读性   | ✅ 好               | ❌ 极差（需手动维护偏移）           |
| 安全性   | ✅ 安全             | ❌ 易错（容易非法访问/对齐问题）    |
| 性能     | ❌ 慢               | ✅ 快（绕过抽象）                   |
| 适用场景 | 业务逻辑、通用工具 | 高性能核心模块（序列化、内存池等） |
