# Golang Unix Socket 服务
## 1. Unix Socket 简介

Unix Domain Socket (UDS) 是一种进程间通信(IPC)机制，特点：
- 仅限同一主机上的进程通信
- 通过文件系统路径标识
- 比TCP本地环回更快(绕过网络协议栈)
- 通过文件权限控制访问

优势：
- 高性能：比localhost TCP快约2倍
- 安全性：文件系统权限控制
- 资源占用少：无端口冲突问题

---

## 2. 使用标准库 net/http 实现

### 2.1 基础实现

```go
package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	// 配置
	socketPath := "/tmp/http.sock"
	
	// 清理旧socket
	if err := os.RemoveAll(socketPath); err != nil {
		log.Fatalf("清理socket失败: %v", err)
	}

	// 创建监听器
	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		log.Fatalf("监听失败: %v", err)
	}
	defer func() {
		listener.Close()
		os.Remove(socketPath)
	}()

	// 设置文件权限(可选)
	if err := os.Chmod(socketPath, 0770); err != nil {
		log.Printf("设置权限失败: %v", err)
	}

	// 注册路由
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from Unix Socket HTTP Server!\n")
	})
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// 配置服务器
	server := &http.Server{
		Handler: mux,
	}

	// 优雅关闭
	setupGracefulShutdown(server)

	// 启动服务
	log.Printf("Server listening on unix socket: %s", socketPath)
	if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
		log.Fatalf("服务异常: %v", err)
	}
}

func setupGracefulShutdown(server *http.Server) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	
	go func() {
		<-sigChan
		log.Println("接收到终止信号，关闭服务器...")
		if err := server.Close(); err != nil {
			log.Printf("服务器关闭错误: %v", err)
		}
	}()
}
```

### 2.2 高级配置

```go
// 在http.Server配置中添加
server := &http.Server{
	Handler:      mux,
	ReadTimeout:  10 * time.Second,
	WriteTimeout: 10 * time.Second,
	IdleTimeout:  60 * time.Second,
}
```

---

## 3. 使用 Gin 框架实现

### 3.1 基础实现

```go
package main

import (
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	// 配置
	socketPath := "/tmp/gin.sock"
	
	// 清理旧socket
	if err := os.RemoveAll(socketPath); err != nil {
		log.Fatalf("清理socket失败: %v", err)
	}

	// 创建监听器
	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		log.Fatalf("监听失败: %v", err)
	}
	defer func() {
		listener.Close()
		os.Remove(socketPath)
	}()

	// 设置文件权限
	if err := os.Chmod(socketPath, 0770); err != nil {
		log.Printf("设置权限失败: %v", err)
	}

	// 初始化Gin
	router := gin.New()
	
	// 中间件
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// 路由
	router.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Hello from Gin Unix Socket Server!")
	})
	
	router.GET("/api/data", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Data retrieved",
			"data":    []string{"item1", "item2", "item3"},
		})
	})

	// 配置服务器
	server := &http.Server{
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// 优雅关闭
	setupGracefulShutdown(server)

	// 启动服务
	log.Printf("Gin server listening on unix socket: %s", socketPath)
	if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
		log.Fatalf("服务异常: %v", err)
	}
}
```

### 3.2 生产环境建议

```go
// 在生产环境中使用ReleaseMode
gin.SetMode(gin.ReleaseMode)

// 添加健康检查端点
router.GET("/health", func(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy"})
})

// 添加监控中间件
router.Use(monitoringMiddleware())

func monitoringMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)
		log.Printf("请求 %s 耗时 %v", c.Request.URL.Path, duration)
	}
}
```

---

## 4. 客户端连接方式

### 4.1 标准HTTP客户端

```go
func main() {
	transport := &http.Transport{
		Dial: func(_, _ string) (net.Conn, error) {
			return net.Dial("unix", "/tmp/http.sock")
		},
	}

	client := &http.Client{
		Transport: transport,
		Timeout:   5 * time.Second,
	}

	resp, err := client.Get("http://unix/health")
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println("响应:", string(body))
}
```

### 4.2 通用Socket客户端

```go
func main() {
	conn, err := net.Dial("unix", "/tmp/http.sock")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	// 构造HTTP请求
	request := "GET / HTTP/1.1\r\nHost: unix\r\n\r\n"
	_, err = conn.Write([]byte(request))
	if err != nil {
		log.Fatal(err)
	}

	// 读取响应
	response, err := io.ReadAll(conn)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("响应:", string(response))
}
```

---

## 5. 性能优化建议

1. **连接池配置**：
   ```go
   transport := &http.Transport{
       Dial: func(_, _ string) (net.Conn, error) {
           return net.Dial("unix", socketPath)
       },
       MaxIdleConns:        100,
       IdleConnTimeout:     90 * time.Second,
       TLSHandshakeTimeout: 10 * time.Second,
   }
   ```

2. **Gin性能优化**：
   - 使用`gin.SetMode(gin.ReleaseMode)`
   - 避免在热路径中使用反射
   - 使用`c.AbortWithStatus()`而不是`return`来终止请求

3. **服务器配置**：
   - 适当调整`ReadTimeout`和`WriteTimeout`
   - 考虑使用`http.TimeoutHandler`添加全局超时

4. **监控指标**：
   - 添加Prometheus或OpenTelemetry监控
   - 记录请求延迟和错误率

---

## 6. 常见问题解答

**Q1: 如何调试Unix Socket通信问题？**

A1:
- 使用`nc -U /tmp/your.sock`测试基本连接
- 检查socket文件权限`ls -l /tmp/your.sock`
- 使用`strace`跟踪系统调用

**Q2: 如何处理"address already in use"错误？**

A2:
- 确保程序退出时删除socket文件
- 添加错误处理自动清理旧socket
- 使用`lsof -U | grep your.sock`查找占用进程

**Q3: 如何限制客户端访问？**

A3:
- 设置严格的文件权限(如0700)
- 使用系统组权限控制
- 在应用层添加认证

**Q4: Unix Socket与TCP性能对比如何？**

A4:
- 延迟降低约30-50%
- 吞吐量提高约20-30%
- CPU使用率降低约10-20%

---

## 7. 实际应用场景

1. **容器间通信**：
   - Docker/Kubernetes环境中容器间高效通信
   - 通过共享volume挂载socket文件

2. **反向代理集成**：
   ```nginx
   server {
       listen 8080;
       location / {
           proxy_pass http://unix:/tmp/http.sock;
       }
   }
   ```

3. **微服务架构**：
   - 同一主机上的服务间通信
   - 替代gRPC的TCP传输

4. **特权服务**：
   - 仅限本机访问的管理接口
   - 高安全性要求的内部通信

5. **高性能API网关**：
   - 网关与后端服务间的高速通道
   - 减少网络协议栈开销

---

## 总结

Unix Socket为Golang服务提供了高性能的本地通信方案。无论是使用标准库还是Gin框架，实现起来都相对简单。关键注意点包括：

1. 妥善管理socket文件生命周期
2. 设置适当的文件权限
3. 客户端使用正确的连接方式
4. 生产环境添加适当的监控和日志

通过本培训文档，您应该能够：
- 理解Unix Socket的工作原理
- 实现基于Unix Socket的HTTP服务
- 编写对应的客户端代码
- 部署生产级Unix Socket服务
- 诊断常见问题
