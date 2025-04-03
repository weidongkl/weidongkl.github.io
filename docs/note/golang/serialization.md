# Golang 序列化/反序列化

## 1. 引言

在 Golang 中，序列化（Serialization）和反序列化（Deserialization）是数据持久化和网络传输的关键技术。默认情况下，`encoding/json` 标准库可以处理大部分常见的 JSON 数据格式。但在复杂业务场景中，我们可能需要对数据格式、字段校验、嵌套类型等进行定制化处理。
 本培训文档旨在介绍如何通过实现 `json.Marshaler` 和 `json.Unmarshaler` 接口，实现对自定义类型的灵活处理，涵盖常见及进阶场景。

## 2. 标准库的序列化支持

### 2.1 JSON序列化
```go
import "encoding/json"

func main() {
    p := Person{"Alice", 30}
    
    // 序列化
    data, err := json.Marshal(p)
    
    // 反序列化
    var p2 Person
    err = json.Unmarshal(data, &p2)
}
```

### 2.2 结构体标签
```go
type Product struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"created_at,omitempty"`
}
```

## 3. 自定义类型序列化

通过实现 `json.Marshaler` 接口，可以自定义对象转换为 `JSON `的逻辑。类似的，通过实现`yaml.Marshaler`接口，可以自定义对象转化为 `yaml`的逻辑。

接口实现中，还可以增加校验规则，实现类似`validate`的效果

```go
type Person struct {
	Name string
	Age  int
}

// 自定义反序列化，加入数据校验
func (p *Person) UnmarshalJSON(data []byte) error {
	var temp struct {
		FullName string `json:"full_name"`
		Age      int    `json:"age"`
	}
	if err := json.Unmarshal(data, &temp); err != nil {
		return err
	}
	if temp.Age < 0 || temp.Age > 150 {
		return errors.New("age must be between 0 and 150")
	}
```

### 3.1 实现Marshaler接口
```go
type CustomDate time.Time

func (cd CustomDate) MarshalJSON() ([]byte, error) {
    return json.Marshal(time.Time(cd).Format("2006-01-02"))
}
```

### 3.2 实现Unmarshaler接口
```go
func (cd *CustomDate) UnmarshalJSON(data []byte) error {
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    t, err := time.Parse("2006-01-02", s)
    if err != nil {
        return err
    }
    *cd = CustomDate(t)
    return nil
}
```

## 4. 复合类型处理
### 4.1 嵌套结构体
```go
type Order struct {
    ID       int       `json:"id"`
    Products []Product `json:"products"`
    Date     CustomDate `json:"date"`
}
```

### 4.2 接口类型处理
```go
type Shape interface {
    Area() float64
}

type Circle struct {
    Radius float64 `json:"radius"`
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

// 自定义序列化逻辑
func (c *Circle) MarshalJSON() ([]byte, error) {
    type Alias Circle
    return json.Marshal(&struct {
        Type string `json:"type"`
        *Alias
    }{
        Type:  "circle",
        Alias: (*Alias)(c),
    })
}
```

## 5. 性能优化
### 5.1 使用缓冲池
```go
var bufferPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func MarshalWithPool(v interface{}) ([]byte, error) {
    buf := bufferPool.Get().(*bytes.Buffer)
    defer bufferPool.Put(buf)
    buf.Reset()
    
    encoder := json.NewEncoder(buf)
    if err := encoder.Encode(v); err != nil {
        return nil, err
    }
    return buf.Bytes(), nil
}
```

### 5.2 使用第三方库
- json-iterator: 兼容标准库的高性能实现
- easyjson: 代码生成方案
- protobuf: 二进制序列化方案

## 6. 常见问题解决
### 6.1 循环引用问题
```go
type Node struct {
    Value int     `json:"value"`
    Next  *Node   `json:"next,omitempty"` // 使用omitempty避免无限递归
}
```

### 6.2 时间格式处理
```go
type Timestamp time.Time

func (t *Timestamp) UnmarshalJSON(b []byte) error {
    s := strings.Trim(string(b), "\"")
    tm, err := time.Parse(time.RFC3339, s)
    if err != nil {
        return err
    }
    *t = Timestamp(tm)
    return nil
}
```

## 7. 测试验证
### 7.1 单元测试示例
```go
func TestCustomDate_MarshalJSON(t *testing.T) {
    cd := CustomDate(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC))
    data, err := json.Marshal(cd)
    assert.Nil(t, err)
    assert.Equal(t, `"2023-01-01"`, string(data))
}

func TestCustomDate_UnmarshalJSON(t *testing.T) {
    var cd CustomDate
    err := json.Unmarshal([]byte(`"2023-01-01"`), &cd)
    assert.Nil(t, err)
    assert.Equal(t, 2023, time.Time(cd).Year())
}
```

## 8. 最佳实践
1. 始终处理错误返回值
2. 对敏感字段使用`json:"-"`
3. 使用omitempty处理可选字段
4. 对大对象使用流式处理（json.Decoder）
5. 避免在Marshal/Unmarshal方法中修改共享状态

## 附录：完整示例
```go
package main

import (
    "encoding/json"
    "fmt"
    "time"
)

type CustomDate time.Time

func (cd CustomDate) MarshalJSON() ([]byte, error) {
    return json.Marshal(time.Time(cd).Format("2006-01-02"))
}

func (cd *CustomDate) UnmarshalJSON(data []byte) error {
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    t, err := time.Parse("2006-01-02", s)
    if err != nil {
        return err
    }
    *cd = CustomDate(t)
    return nil
}

type Event struct {
    Name      string     `json:"name"`
    EventDate CustomDate `json:"event_date"`
}

func main() {
    event := Event{
        Name:      "Go Conference",
        EventDate: CustomDate(time.Now()),
    }

    data, _ := json.Marshal(event)
    fmt.Println(string(data)) // {"name":"Go Conference","event_date":"2023-07-20"}

    var newEvent Event
    _ = json.Unmarshal(data, &newEvent)
    fmt.Printf("%+v\n", newEvent) // {Name:Go Conference EventDate:2023-07-20 00:00:00 +0000 UTC}
}
```

secret 密码示例:

```go
package web

import (
	"encoding/json"
	"errors"
)

/*
 *  Secret 用于存储敏感信息的结构体，实现 yaml.Marshaler、json.Marshaler、yaml.Unmarshaler、json.Unmarshaler 接口，
 *  用于在 YAML 和 JSON 文件中隐藏敏感信息，并实现加密和解密功能。
 *  我们在开发中，对需要yaml，和json处理的数据，可以采用类似的方法
 */

// Secret 用于存储敏感信息的结构体
type Secret struct {
	value string
}

// NewSecret 创建新的 Secret
func NewSecret(val string) Secret {
	return Secret{value: val}
}

// MarshalYAML 实现 yaml.Marshaler 接口
func (s Secret) MarshalYAML() (interface{}, error) {
	//if s.value != "" {
	//	return "<secret>", nil
	//}
	//return nil, nil
	return "<secret>", nil
}

// MarshalJSON 实现 json.Marshaler 接口
func (s Secret) MarshalJSON() ([]byte, error) {
	return []byte("<secret>"), nil
}

// UnmarshalYAML 实现 yaml.Unmarshaler 接口
func (s *Secret) UnmarshalYAML(unmarshal func(interface{}) error) error {
	if s == nil {
		return errors.New("cannot unmarshal into nil Secret")
	}
	// 可以通过定义一个中间类型，如 plain，来避免递归调用
	//type plain Secret // 定义 plain 为 Secret 的别名
	//return unmarshal((*plain)(s)) // 将 s 转换为 *plain 类型，避免递归调用
	// 也可以直接定义一个string变量，然后通过json.Unmarshal()方法将数据解析到该变量中
	// 这样相当于调用的是string 的unmarshal方法,避免了递归调用
	var raw string
	if err := unmarshal(&raw); err != nil {
		return err
	}
	s.value = raw
	return nil
}

// UnmarshalJSON 实现 json.Unmarshaler 接口
func (s *Secret) UnmarshalJSON(data []byte) error {
	if s == nil {
		return errors.New("cannot unmarshal into nil Secret")
	}

	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	s.value = raw
	return nil
}

// Get 返回实际值，减少直接暴露
func (s Secret) Get() string {
	return s.value
}
```
