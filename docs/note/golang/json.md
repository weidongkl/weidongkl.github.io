# Golang JSON 解析

## 1. Golang 默认 JSON 解析 (`encoding/json`)

Golang 标准库提供 `encoding/json` 包，可用于解析和生成 JSON 数据。

**示例：解析 JSON 到 `map[string]interface{}`**

```go
package main

import (
	"encoding/json"
	"fmt"
)

func main() {
	jsonData := `{"name": "Alice", "age": 25}`
	var result map[string]interface{}
	err := json.Unmarshal([]byte(jsonData), &result)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Name:", result["name"].(string))
	fmt.Println("Age:", result["age"].(float64))
}
```

**优缺点对比**

| 优点                 | 缺点                       |
| -------------------- | -------------------------- |
| 官方库，稳定可靠     | 需要手动类型断言           |
| 无需额外依赖         | 性能相对较低               |
| 适用于简单 JSON 解析 | 解析大 JSON 结构时性能不足 |

***

## 2. 第三方 JSON 解析库

### **2.1 `github.com/tidwall/gjson`（高效 JSON 读取）**

**安装：**

```sh
go get github.com/tidwall/gjson
```

**示例：**

```go
package main

import (
	"fmt"
	"github.com/tidwall/gjson"
)

func main() {
	jsonData := `{"name": "Alice", "age": 25}`
	if !gjson.Valid(jsonData) {
		fmt.Println("Invalid JSON data")
		return
	}
	if gjson.Get(jsonData, "name").Exists() {
		fmt.Println("Name field exists")
	} else {
		fmt.Println("Name field does not exist")
	}
	name := gjson.Get(jsonData, "name")
	age := gjson.Get(jsonData, "age").Int()
	fmt.Println("Name:", name.String())
	fmt.Println("Age:", age)
}
```

### **优缺点对比**

| 优点               | 缺点           |
| ------------------ | -------------- |
| 解析速度快         | 不能修改 JSON  |
| 支持 JSONPath 查询 | 适用于只读场景 |
| 代码简洁           | -              |

***

### **2.2 `github.com/json-iterator/go`（高性能 JSON 解析）**

**安装：**

```sh
go get github.com/json-iterator/go
```

**示例：**

```go
package main

import (
	"fmt"
	jsoniter "github.com/json-iterator/go"
)

func main() {
	var json = jsoniter.ConfigCompatibleWithStandardLibrary
	jsonData := `{"name": "Alice", "age": 25}`
	var result map[string]interface{}
	json.Unmarshal([]byte(jsonData), &result)
	fmt.Println("Name:", result["name"])
	fmt.Println("Age:", result["age"])
}
```

### **优缺点对比**

| 优点                             | 缺点                            |
| -------------------------------- | ------------------------------- |
| 兼容 `encoding/json`，可直接替换 | 解析 JSON 数组不如 `gjson` 简洁 |
| 性能比 `encoding/json` 高        | -                               |

***

### **2.3 `github.com/buger/jsonparser`（流式 JSON 解析）**

**安装：**

```sh
go get github.com/buger/jsonparser
```

**示例：**

```go
package main

import (
	"fmt"
	"github.com/buger/jsonparser"
)

func main() {
	jsonData := []byte(`{"name": "Alice", "age": 25}`)
	name, _ := jsonparser.GetString(jsonData, "name")
	age, _ := jsonparser.GetInt(jsonData, "age")
	fmt.Println("Name:", name)
	fmt.Println("Age:", age)
}
```

### **优缺点对比**

| 优点                      | 缺点                |
| ------------------------- | ------------------- |
| 适用于大 JSON 文件解析    | 不能修改 JSON       |
| 直接操作 `[]byte`，性能高 | 代码较 `gjson` 复杂 |

***

## 3. JSON 解析库对比

| 库                 | 适用场景         | 优势                        | 劣势                       |
| ------------------ | ---------------- | --------------------------- | -------------------------- |
| `encoding/json`    | 普通 JSON 解析   | 官方库，稳定                | 解析速度较慢，需要类型断言 |
| `gjson`            | 只读 JSON 数据   | 语法简洁，性能高            | 不能修改 JSON              |
| `json-iterator/go` | 高性能 JSON 解析 | 可直接替换标准库            | 解析 JSON 数组较繁琐       |
| `buger/jsonparser` | 解析大 JSON      | 直接操作 `[]byte`，流式解析 | 代码较复杂                 |

***

## **总结与推荐**

*   **只读取 JSON 数据**（不修改）：✅ `gjson`
*   **需要高性能 JSON 解析**：✅ `json-iterator/go`
*   **解析大 JSON 文件**（如日志）：✅ `buger/jsonparser`
*   **通用解析（兼容性好）**：✅ `encoding/json`

根据具体需求选择合适的库，以提高 JSON 处理效率。
