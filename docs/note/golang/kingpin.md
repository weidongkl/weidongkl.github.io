# `kingpin` 用法

## 1. 简介

`kingpin` 是一个用于解析命令行参数的 Golang 库，提供类似 `flag` 但更强大和直观的 API，支持子命令、默认值、环境变量等。

## 2. 安装

```sh
go get github.com/alecthomas/kingpin
```

## 3. 基本用法

### **3.1 使用默认 App**

`kingpin` 提供了默认的 `kingpin.CommandLine`，可以直接使用全局方法定义参数。

```go
package main

import (
	"fmt"
	"os"
	"github.com/alecthomas/kingpin"
)

var (
	name = kingpin.Flag("name", "输入你的名字。").Short('n').Default("World").String()
	age  = kingpin.Flag("age", "输入你的年龄。").Int()
)

func main() {
	kingpin.Parse()
	fmt.Printf("Hello %s! You are %d years old.\n", *name, *age)
}
```

**运行示例：**

```sh
./example --name=Alice --age=30
```

------

### **3.2 定义命令行参数（使用 `New` 方法）**

```go
package main

import (
	"fmt"
	"os"
	"github.com/alecthomas/kingpin"
)

func main() {
	app := kingpin.New("example", "示例应用程序。")
	name := app.Flag("name", "输入你的名字。").Short('n').Default("World").String()
	age := app.Flag("age", "输入你的年龄。").Int()

	kingpin.MustParse(app.Parse(os.Args[1:]))

	fmt.Printf("Hello %s! You are %d years old.\n", *name, *age)
}
```

**运行示例：**

```sh
./example --name=Alice --age=30
```

------

### **3.3 使用子命令**

```go
package main

import (
	"fmt"
	"os"
	"github.com/alecthomas/kingpin"
)

func main() {
	app := kingpin.New("app", "一个支持子命令的示例。")
	
	// 定义子命令 `greet`
	greetCmd := app.Command("greet", "打招呼。")
	name := greetCmd.Flag("name", "你的名字。").Default("World").String()

	// 定义子命令 `bye`
	byeCmd := app.Command("bye", "告别。")
	goodbye := byeCmd.Flag("message", "告别消息。").Default("Goodbye!").String()

	switch kingpin.MustParse(app.Parse(os.Args[1:])) {
	case greetCmd.FullCommand():
		fmt.Printf("Hello, %s!\n", *name)
	case byeCmd.FullCommand():
		fmt.Println(*goodbye)
	}
}
```

**运行示例：**

```sh
./app greet --name=Bob
./app bye --message="See you!"
```

------

### **3.4 绑定环境变量**

```go
package main

import (
	"fmt"
	"os"
	"github.com/alecthomas/kingpin"
)

func main() {
	app := kingpin.New("env-example", "示例环境变量支持。")
	name := app.Flag("name", "你的名字。").Envar("USER_NAME").Default("Anonymous").String()

	kingpin.MustParse(app.Parse(os.Args[1:]))

	fmt.Println("Hello,", *name)
}
```

**运行示例：**

```sh
export USER_NAME=Charlie
./env-example
```

------

### **3.5 处理布尔标志**

```go
package main

import (
	"fmt"
	"os"
	"github.com/alecthomas/kingpin"
)

func main() {
	app := kingpin.New("bool-flag", "布尔标志示例。")
	verbose := app.Flag("verbose", "开启详细模式。").Short('v').Bool()

	kingpin.MustParse(app.Parse(os.Args[1:]))

	if *verbose {
		fmt.Println("Verbose mode enabled")
	} else {
		fmt.Println("Verbose mode disabled")
	}
}
```

**运行示例：**

```sh
./bool-flag --verbose
./bool-flag -v
```

------

### **3.6 解析列表参数**

```go
package main

import (
	"fmt"
	"os"
	"github.com/alecthomas/kingpin"
)

func main() {
	app := kingpin.New("list-example", "解析列表参数示例。")
	items := app.Flag("items", "输入多个项。").Strings()

	kingpin.MustParse(app.Parse(os.Args[1:]))

	fmt.Println("Items:", *items)
}
```

**运行示例：**

```sh
./list-example --items=apple --items=banana --items=cherry
```

## 4. 其他高级用法

### **4.1 自定义解析器**

可以使用 `kingpin.Action()` 在解析参数后执行特定逻辑。

```go
package main

import (
	"fmt"
	"os"
	"github.com/alecthomas/kingpin"
)

func main() {
	app := kingpin.New("custom-action", "示例：使用自定义解析逻辑。")
	name := app.Flag("name", "输入你的名字。").String()

	app.Action(func(c *kingpin.ParseContext) error {
		fmt.Println("解析完成，欢迎", *name)
		return nil
	})

	kingpin.MustParse(app.Parse(os.Args[1:]))
}
```

## 5. 总结

`kingpin` 提供了一种简单易用且功能强大的命令行解析方式，适用于各种 CLI 应用。

### **特点总结**

✅ 支持子命令 ✅ 支持环境变量 ✅ 友好的 API 设计 ✅ 丰富的参数类型支持 ✅ 自动生成帮助文档

如果需要构建复杂的命令行工具，`kingpin` 是一个值得推荐的选择。
