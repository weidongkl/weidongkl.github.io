# Golang Validator

## 1. 简介

`validator` 是 Go 语言中一个强大的数据验证库，它提供结构体字段标签验证功能，并支持自定义验证规则。

## 2. 安装

```sh
go get github.com/go-playground/validator/v10
```

## 3. 基本使用

```go
package main

import (
	"fmt"
	"github.com/go-playground/validator/v10"
)

type User struct {
	Name  string `validate:"required"`
	Age   int    `validate:"gte=18,lte=65"`
	Email string `validate:"required,email"`
}

func main() {
	validate := validator.New()

	user := User{
		Name:  "",
		Age:   17,
		Email: "invalid-email",
	}

	err := validate.Struct(user)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Println("Validation error:", err)
		}
	} else {
		fmt.Println("Validation passed")
	}
}
```

## 4. 常见的内置验证标签

| 标签              | 描述                            |
| ----------------- | ------------------------------- |
| required          | 必填字段                        |
| email             | 必须是合法的邮箱格式            |
| gte=X             | 大于等于 X                      |
| lte=X             | 小于等于 X                      |
| min=X             | 字符串、切片、映射的最小长度    |
| max=X             | 字符串、切片、映射的最大长度    |
| len=X             | 长度必须等于 X                  |
| url               | 必须是合法的 URL                |
| numeric           | 必须是数字                      |
| alphanum          | 仅允许字母和数字                |
| alpha             | 仅允许字母                      |
| contains=X        | 必须包含 X 子串                 |
| startswith=X      | 必须以 X 开头                   |
| endswith=X        | 必须以 X 结尾                   |
| lowercase         | 必须为小写                      |
| uppercase         | 必须为大写                      |
| ipv4              | 必须是合法的 IPv4 地址          |
| ipv6              | 必须是合法的 IPv6 地址          |
| boolean           | 必须是布尔值                    |
| datetime=layout   | 必须是指定格式的日期时间        |
| base64            | 必须是 Base64 编码格式          |
| hexcolor          | 必须是十六进制颜色代码          |
| uuid              | 必须是合法的 UUID               |
| json              | 必须是合法的 JSON 字符串        |
| ascii             | 仅允许 ASCII 字符               |
| printascii        | 仅允许可打印 ASCII 字符         |
| multibyte         | 允许多字节字符                  |
| containsany=chars | 必须包含 chars 中的至少一个字符 |
| excludesall=chars | 不能包含 chars 中的任何字符     |
| excludes=X        | 不能包含 X 子串                 |
| isdefault         | 必须是字段类型的默认值          |
| dive              | 用于切片或者map的验证           |

## 5. 自定义验证

可以自定义验证规则，例如验证字符串是否为 "hello":

```go
func helloValidator(fl validator.FieldLevel) bool {
	return fl.Field().String() == "hello"
}

func main() {
	validate := validator.New()
	validate.RegisterValidation("hello", helloValidator)

	type Test struct {
		Msg string `validate:"hello"`
	}
	t := Test{Msg: "world"}

	err := validate.Struct(t)
	if err != nil {
		fmt.Println("Validation failed:", err)
	} else {
		fmt.Println("Validation passed")
	}
}
```

## 6. 结构体嵌套验证

```go
type Address struct {
	City    string `validate:"required"`
	ZipCode string `validate:"numeric"`
}

type Person struct {
	Name    string  `validate:"required"`
	Age     int     `validate:"gte=18"`
	Address Address `validate:"required"`
}
```

`required` 关键字表示深入到嵌套结构体中进行验证。

## 7. 处理错误信息

```go
if err != nil {
	for _, e := range err.(validator.ValidationErrors) {
		fmt.Printf("Field %s failed on '%s' tag\n", e.Field(), e.Tag())
	}
}
```

## 8. 结论

`validator` 提供了丰富的验证功能，适用于 Go 项目中的输入校验场景，可以结合 `gin` 或其他 Web 框架进行 API 参数验证，提高数据的可靠性。
