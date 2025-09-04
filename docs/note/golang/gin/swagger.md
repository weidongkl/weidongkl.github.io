# Gin + Swagger 

## 1. Swagger 简介

Swagger（现称 OpenAPI）是一套 **API 文档规范与工具链**，能够：

- 自动生成接口文档，保持与代码同步。
- 提供可交互的 API 调试页面。
- 提升前后端协作效率。

在 Go 语言 Gin 框架中，常用的 Swagger 工具是 **swaggo/gin-swagger**。

------

## 2. 环境准备

### 2.1 安装 Go 环境

要求 Go 版本 ≥ 1.18。

```bash
go version
```

### 2.2 安装 swag 工具

用于解析注释并生成文档。

```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

确保 `$GOPATH/bin` 在环境变量中。

### 2.3 安装 Gin Swagger 依赖

```bash
go get -u github.com/swaggo/gin-swagger
go get -u github.com/swaggo/files
```

------

## 3. 项目初始化

### 3.1 目录结构

```go
 go mod init gin-swagger-demo
```

```
gin-swagger-demo/
├── main.go
├── go.mod
└── docs/   # swag init 自动生成
```

### 3.2 示例代码

```go
package main

import (
	_ "gin-swagger-demo/docs" // docs 由 swag init 生成

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Gin Swagger 示例 API
// @version 1.0
// @description 这是一个 Gin 框架结合 Swagger 的示例项目。
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url  http://www.example.com/support
// @contact.email support@example.com

// @license.name Apache 2.0
// @license.url  http://www.apache.org/licenses/LICENSE-2.0.html

// /////@host 0.0.0.0:8080 //cors validate
// @BasePath /api/v1
// @schemes http https
func main() {
	r := gin.Default()

	v1 := r.Group("/api/v1")
	{
		v1.GET("/hello", HelloHandler)
		v1.GET("/user/:id", GetUser)
	}

	// Swagger 路由
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.Run(":8080")
}

// HelloHandler 示例接口
// @Summary 打招呼接口
// @Description 返回 Hello World
// @Tags 示例
// @Produce json
// @Success 200 {string} string "ok"
// @Router /hello [get]
func HelloHandler(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Hello World"})
}

// User 用户结构体
type User struct {
	ID    int    `json:"id" example:"1"`               // 用户ID
	Name  string `json:"name" example:"Tom"`           // 用户名
	Email string `json:"email" example:"tom@test.com"` // 邮箱
}

// HTTPError 错误响应
type HTTPError struct {
	Code    int    `json:"code" example:"400"`     // 错误码
	Message string `json:"message" example:"错误信息"` // 错误信息
}

// GetUser 获取用户
// @Summary 获取用户
// @Description 根据 ID 获取用户信息
// @Tags 用户
// @Accept json
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} User "成功返回用户"
// @Failure 400 {object} HTTPError "请求错误"
// @Router /user/{id} [get]
func GetUser(c *gin.Context) {
	c.JSON(200, User{ID: 1, Name: "Tom", Email: "tom@test.com"})
}

```

------

## 4. 生成并访问 Swagger

### 4.1 生成文档

```bash
swag init
```

会生成 `docs/` 目录：

- `docs.go`
- `swagger.json`
- `swagger.yaml`

### 4.2 启动服务

```bash
go run main.go
```

浏览器访问：

```
http://localhost:8080/swagger/index.html
```

即可看到交互式接口文档。

------

## 5. Swagger 注释详解

### 5.1 全局注释

写在 `main.go` 顶部或 `main()` 前。

| 标签              | 作用       | 示例                                          |
| ----------------- | ---------- | --------------------------------------------- |
| `@title`          | 文档标题   | `// @title 用户管理 API`                      |
| `@version`        | 版本号     | `// @version 1.0`                             |
| `@description`    | 描述       | `// @description 用户相关接口`                |
| `@termsOfService` | 服务条款   | `// @termsOfService http://swagger.io/terms/` |
| `@contact.name`   | 联系人     | `// @contact.name API Support`                |
| `@contact.url`    | 联系人网址 | `// @contact.url http://example.com`          |
| `@contact.email`  | 联系邮箱   | `// @contact.email support@example.com`       |
| `@license.name`   | 许可证名   | `// @license.name Apache 2.0`                 |
| `@license.url`    | 许可证链接 | `// @license.url http://apache.org`           |
| `@host`           | 主机       | `// @host localhost:8080`                     |
| `@BasePath`       | 路由前缀   | `// @BasePath /api/v1`                        |
| `@schemes`        | 协议       | `// @schemes http https`                      |

------

### 5.2 接口注释

写在 handler 前。

| 标签           | 作用         | 示例                               |
| -------------- | ------------ | ---------------------------------- |
| `@Summary`     | 接口简述     | `// @Summary 获取用户`             |
| `@Description` | 接口详细说明 | `// @Description 根据 ID 获取用户` |
| `@Tags`        | 分组         | `// @Tags 用户`                    |
| `@Accept`      | 请求类型     | `// @Accept json`                  |
| `@Produce`     | 返回类型     | `// @Produce json`                 |
| `@Router`      | 路由         | `// @Router /user/{id} [get]`      |

------

### 5.3 请求参数注释

```go
// @Param id path int true "用户ID"
// @Param name query string false "用户名"
// @Param token header string true "认证Token"
// @Param file formData file true "上传文件"
// @Param body body User true "用户信息"
```

| 格式     | 说明     | 示例                                   |
| -------- | -------- | -------------------------------------- |
| path     | 路径参数 | `id path int true "用户ID"`            |
| query    | 查询参数 | `name query string false "用户名"`     |
| header   | 请求头   | `token header string true "认证Token"` |
| formData | 表单参数 | `file formData file true "上传文件"`   |
| body     | 请求体   | `body body User true "用户信息"`       |

------

### 5.4 响应注释

```go
// @Success 200 {object} User "成功返回用户"
// @Success 201 {array} User "返回用户列表"
// @Failure 400 {string} string "请求参数错误"
// @Failure 404 {object} HTTPError "找不到资源"
// @Failure 500 {string} string "服务器内部错误"
```

| 格式                 | 说明         | 示例                     |
| -------------------- | ------------ | ------------------------ |
| `{object} User`      | 返回对象     | `200 {object} User`      |
| `{array} User`       | 返回数组     | `201 {array} User`       |
| `{string} string`    | 返回字符串   | `400 {string} string`    |
| `{object} HTTPError` | 返回错误对象 | `404 {object} HTTPError` |

------

### 5.5 结构体注释

```go
// User 用户结构体
type User struct {
	ID    int    `json:"id" example:"1"`        // 用户ID
	Name  string `json:"name" example:"Tom"`    // 用户名
	Email string `json:"email" example:"tom@example.com"` // 邮箱
}
```

- `json:"id"` → JSON 字段名
- `example:"1"` → Swagger UI 示例值

------

## 6. 最佳实践

1. 每个接口必须有 `@Summary` 和 `@Router`。
2. 使用 `@Tags` 做接口分组，方便查找。
3. 数据模型结构体写好 `json` 标签和 `example`。
4. 生产环境建议关闭 `/swagger` 路由，仅开发环境使用。
5. 代码修改后重新执行 `swag init` 保持文档同步。

------

## 7. 常见问题

- **Q: `command not found: swag`**
   👉 没有把 `$GOPATH/bin` 加入环境变量。

- **Q: Swagger 页面空白**
   👉 检查路由：

  ```go
  r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
  ```

- **Q: 注释不生效**
   👉 注释必须紧贴函数，格式严格，注意大小写。

------

## 8. 总结

通过 `swaggo`，我们可以让 Gin 项目中的接口自动生成 **交互式 API 文档**，大大提升了开发与协作效率。
 掌握全局注释、接口注释、参数和响应的写法后，就能在实际项目中高效使用 Swagger。
