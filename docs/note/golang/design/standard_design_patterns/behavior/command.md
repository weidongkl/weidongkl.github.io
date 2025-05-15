# Go 语言命令行模式

## 1. 概述

命令行模式(Command Pattern)是一种行为设计模式，它将请求封装为对象，从而使你可以使用不同的请求、队列或日志请求来参数化其他对象，同时支持可撤销的操作。

**主要优点**：

- **解耦**：将请求发送者与接收者解耦
- **可扩展**：容易添加新命令，无需修改现有代码
- **组合**：可以将多个命令组合成一个复合命令
- **支持撤销**：可以实现命令的撤销和重做功能

## 2. 基础实现

### 2.1 核心接口与结构

```go
// Command 接口定义了命令执行方法
type Command interface {
	Execute() error
}

// Invoker 调用者，负责执行命令
type Invoker struct {
	commands []Command
}

func (i *Invoker) AddCommand(cmd Command) {
	i.commands = append(i.commands, cmd)
}

func (i *Invoker) ExecuteCommands() error {
	for _, cmd := range i.commands {
		if err := cmd.Execute(); err != nil {
			return err
		}
	}
	return nil
}
```

### 2.2 具体命令示例

```go
// 打印消息命令
type PrintCommand struct {
	message string
}

func (p *PrintCommand) Execute() error {
	fmt.Println("执行打印命令:", p.message)
	return nil
}

// 创建文件命令
type CreateFileCommand struct {
	filename string
	content  string
}

func (c *CreateFileCommand) Execute() error {
	file, err := os.Create(c.filename)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.WriteString(c.content)
	return err
}
```

### 2.3 使用示例

```go
func main() {
	invoker := &Invoker{}

	// 添加并执行命令
	invoker.AddCommand(&PrintCommand{message: "Hello, Command Pattern!"})
	invoker.AddCommand(&CreateFileCommand{
		filename: "demo.txt",
		content:  "Command Pattern Example",
	})

	if err := invoker.ExecuteCommands(); err != nil {
		fmt.Println("执行失败:", err)
		return
	}

	fmt.Println("所有命令执行成功")
}
```

## 3. 高级功能实现

### 3.1 支持撤销操作

```go
// 扩展Command接口
type UndoableCommand interface {
	Command
	Undo() error
}

// 创建文件命令(支持撤销)
type AdvancedCreateFileCommand struct {
	filename string
	content  string
	created  bool // 标记文件是否已创建
}

func (c *AdvancedCreateFileCommand) Execute() error {
	file, err := os.Create(c.filename)
	if err != nil {
		return err
	}
	defer file.Close()

	if _, err := file.WriteString(c.content); err != nil {
		return err
	}

	c.created = true
	return nil
}

func (c *AdvancedCreateFileCommand) Undo() error {
	if !c.created {
		return nil
	}
	return os.Remove(c.filename)
}
```

### 3.2 命令历史记录

```go
type CommandHistory struct {
	commands []UndoableCommand
}

func (h *CommandHistory) Push(cmd UndoableCommand) {
	h.commands = append(h.commands, cmd)
}

func (h *CommandHistory) Pop() UndoableCommand {
	if len(h.commands) == 0 {
		return nil
	}

	cmd := h.commands[len(h.commands)-1]
	h.commands = h.commands[:len(h.commands)-1]
	return cmd
}

func (h *CommandHistory) UndoLast() error {
	cmd := h.Pop()
	if cmd == nil {
		return nil
	}
	return cmd.Undo()
}
```

## 4. 实际应用：CLI框架

### 4.1 CLI命令接口

```go
type CLICommand interface {
	Name() string               // 命令名称
	Description() string        // 命令描述
	SetupFlags(*flag.FlagSet)   // 设置命令行标志
	Execute([]string) error     // 执行命令
}


type HelpCommand struct {
	commands map[string]CLICommand
}

func (h *HelpCommand) Name() string {
	return "help"
}

func (h *HelpCommand) Description() string {
	return "显示帮助信息"
}

func (h *HelpCommand) SetupFlags(fs *flag.FlagSet) {
	// 不需要设置标志
}

func (h *HelpCommand) Execute(args []string) error {
	fmt.Println("可用命令:")
	for _, cmd := range h.commands {
		fmt.Printf("- %s: %s\n", cmd.Name(), cmd.Description())
	}
	return nil
}

```

### 4.2 示例命令实现

```go
// 计算器命令
type CalculatorCommand struct {
	op    string
	left  float64
	right float64
}

func (c *CalculatorCommand) Name() string {
	return "calc"
}

func (c *CalculatorCommand) Description() string {
	return "简单计算器"
}

func (c *CalculatorCommand) SetupFlags(fs *flag.FlagSet) {
	fs.StringVar(&c.op, "op", "+", "运算符(+, -, *, /)")
	fs.Float64Var(&c.left, "left", 0, "左操作数")
	fs.Float64Var(&c.right, "right", 0, "右操作数")
}

func (c *CalculatorCommand) Execute(args []string) error {
	var result float64

	switch c.op {
	case "+":
		result = c.left + c.right
	case "-":
		result = c.left - c.right
	case "*":
		result = c.left * c.right
	case "/":
		if c.right == 0 {
			return fmt.Errorf("除数不能为零")
		}
		result = c.left / c.right
	default:
		return fmt.Errorf("不支持的操作符: %s", c.op)
	}

	fmt.Printf("结果: %.2f %s %.2f = %.2f\n", c.left, c.op, c.right, result)
	return nil
}
```

### 4.3 CLI应用框架

```go
type CLIApplication struct {
	commands map[string]CLICommand
}

func NewCLIApplication() *CLIApplication {
	app := &CLIApplication{
		commands: make(map[string]CLICommand),
	}

	// 注册命令
	app.RegisterCommand(&CalculatorCommand{})
	// help 最后注册，保证help 命令可以显示所有的帮助
	app.RegisterCommand(&HelpCommand{commands: app.commands})

	return app
}
func (a *CLIApplication) RegisterCommand(cmd CLICommand) {
	a.commands[cmd.Name()] = cmd
}

func (a *CLIApplication) Run() error {
	if len(os.Args) < 2 {
		return fmt.Errorf("必须指定命令，使用 'help' 查看可用命令")
	}

	cmdName := os.Args[1]
	cmd, ok := a.commands[cmdName]
	if !ok {
		return fmt.Errorf("未知命令: %s", cmdName)
	}

	fs := flag.NewFlagSet(cmdName, flag.ExitOnError)
	cmd.SetupFlags(fs)
	if err := fs.Parse(os.Args[2:]); err != nil {
		return err
	}

	return cmd.Execute(fs.Args())
}
//./main  calc -left 2 -op - -right 2
// 结果: 2.00 - 2.00 = 0.00
```

## 5. 最佳实践

1. **保持命令简单**：每个命令应该只做一件事
2. **良好的错误处理**：提供清晰的错误信息
3. **文档完善**：为每个命令提供详细的帮助信息
4. **测试覆盖**：为每个命令编写单元测试
5. **并发安全**：如果命令可能并发执行，确保线程安全

## 6. 总结

命令行模式是构建灵活、可扩展CLI应用的强大工具。通过Go语言的接口特性，我们可以优雅地实现这一模式。从简单命令到复杂CLI框架，命令行模式都能提供良好的结构和扩展性。
