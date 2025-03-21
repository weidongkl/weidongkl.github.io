# `os/exec` 用法

## 1. `os/exec` 包简介

`os/exec` 包提供了运行外部命令的方法，允许 Go 程序执行系统命令并与之交互。

## 2. `exec.Command` 基本用法

`exec.Command` 用于创建一个代表外部命令的 `Cmd` 结构。

### 2.1 获取stdout和stderr

```go
package main

import (
	"fmt"
	"os/exec"
)

func main() {
	cmd := exec.Command("ls", "-l") // 在 Linux/macOS 上列出当前目录内容
    // 获取正确和错误输出
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println(string(output))
}
```

### 2.2 只获取stdout

```go
package main

import (
	"fmt"
	"os/exec"
)

func main() {
	cmd := exec.Command("ls", "-l")
	output, err := cmd.Output()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Output:", string(output))
}
```



## 3. 高级用法

### 3.1 使用cmd.Stdout

```go
package main

import (
	"bytes"
	"fmt"
	"os/exec"
)

func main() {
	cmd := exec.Command("echo", "Hello, World!")

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
	}
	fmt.Println("Output:", out.String())
}
```

### 3.2 使用 `StdoutPipe`

`StdoutPipe` 允许我们以流式方式读取命令的标准输出。

```go
package main

import (
	"bufio"
	"fmt"
	"os/exec"
)

func main() {
	cmd := exec.Command("ping", "baidu.com", "-c", "30")
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Println("Error creating StdoutPipe:", err)
		return
	}

	if err := cmd.Start(); err != nil {
		fmt.Println("Error starting command:", err)
		return
	}

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		fmt.Println("Output line:", scanner.Text())
	}

	if err := cmd.Wait(); err != nil {
		fmt.Println("Error waiting for command:", err)
	}
}
```

### 3.3 传递输入 (`stdin`)

```go
package main

import (
	"bytes"
	"fmt"
	"os/exec"
)

func main() {
	cmd := exec.Command("cat")

	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stdin = bytes.NewBufferString("Hello from stdin!")

	if err := cmd.Run(); err != nil {
		fmt.Println("Error:", err)
	}
	fmt.Println("Output:", out.String())
}
```

### 3.4 设置环境变量

```go
cmd := exec.Command("printenv")
cmd.Env = append(cmd.Env, "MY_VAR=HelloWorld")
```

### 3.5 运行带超时的命令

```go
package main

import (
	"context"
	"fmt"
	"os/exec"
	"time"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "sleep", "5")
	if err := cmd.Run(); err != nil {
		fmt.Println("Command timed out or failed:", err)
	}
}
```

### 3.6 增加错误判断

```go
package utils

import (
	"os"
	"os/exec"
	"strings"
)

// Run executes a shell command without capturing its output.
func Run(command string) error {
	cmd := prepareCommand(command)
	return cmd.Run()
}

// RunWithOutput executes a shell command and returns its combined stdout and stderr output.
func RunWithOutput(command string) ([]byte, error) {
	cmd := prepareCommand(command)
	return cmd.CombinedOutput()
}

// RunWithExitCode executes a shell command and returns its output along with the exit code.
func RunWithExitCode(command string) ([]byte, int, error) {
	cmd := prepareCommand(command)
	output, err := cmd.CombinedOutput()
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			return output, exitErr.ExitCode(), err
		}
		return output, -1, err
	}
	return output, 0, nil
}

// prepareCommand initializes an *exec.Cmd with environment variables.
func prepareCommand(command string) *exec.Cmd {
	args := strings.Fields(command)
	if len(args) == 0 {
		return exec.Command("") // 处理空字符串情况，避免 panic
	}
	cmd := exec.Command(args[0], args[1:]...)
	cmd.Env = append(os.Environ(), "LC_ALL=C", "LANG=C")
	return cmd
}
```

### 3.7 使用管道连接多个命令

```go
package main
// echo "hello world!" | grep World
import (
	"bytes"
	"fmt"
	"os/exec"
)

func main() {
	cmd1 := exec.Command("echo", "Hello, World!")
	cmd2 := exec.Command("grep", "World")

	// 创建管道
	pipe, err := cmd1.StdoutPipe()
	if err != nil {
		fmt.Println("Error creating pipe:", err)
		return
	}
	cmd2.Stdin = pipe

	var out bytes.Buffer
	cmd2.Stdout = &out

	// 启动第一个命令
	if err := cmd1.Start(); err != nil {
		fmt.Println("Error starting cmd1:", err)
		return
	}

	// 启动第二个命令
	if err := cmd2.Start(); err != nil {
		fmt.Println("Error starting cmd2:", err)
		return
	}

	// 等待所有命令完成
	if err := cmd1.Wait(); err != nil {
		fmt.Println("Error waiting for cmd1:", err)
		return
	}
	if err := cmd2.Wait(); err != nil {
		fmt.Println("Error waiting for cmd2:", err)
		return
	}

	fmt.Println("Filtered Output:", out.String())
}
```

## 4. 结论

- `exec.Command` 用于创建并运行外部命令。
- `Stdout` 和 `Stderr` 可以用于捕获命令输出。
- `StdoutPipe` 适用于流式读取命令输出。
- `Output()` 仅获取标准输出，而 `CombinedOutput()` 同时获取标准输出和标准错误。
- `Stdin` 可以用于传递输入数据。
- `exec.CommandContext` 可用于超时控制。

`os/exec` 包适用于需要在 Go 代码中执行外部命令的场景，例如自动化任务、系统管理和数据处理。
