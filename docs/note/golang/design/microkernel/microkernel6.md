---
sidebar_position: 6
---
# microkernel 设计6

## 1. 目标

- 支持服务依赖关系管理

## 2. 代码改动

### 2.1 Kernel（核心）

定义服务依赖关系。依赖的是服务名称

```go
// kernel/service.go

// Service 定义微内核的服务接口
// 使用接口定义代替固定的struct,低耦合设计。
type Service interface {
	Start() error
	Stop() error
	Name() string
	Handle(Event) Reply
	// Dependencies 返回依赖服务名称
	Dependencies() []string // 新增接口
}

// serviceMeta 定义微内核服务元数据
type serviceMeta struct {
    svc   Service
    state ServiceState
    // 存储依赖，也可以不使用，直接使用svc.Dependencies
    deps  []string
}
```

注册Register增加deps

```go
// kernel/kernel.go

// Register 注册服务
// 重命名 RegisterService 为 Register
func (k *MicroKernel) Register(svc Service) error {
	k.mu.Lock()
	defer k.mu.Unlock()

	name := svc.Name()
	if _, ok := k.services[name]; ok {
		return errors.New("service already registered")
	}
	k.services[name] = &serviceMeta{
		svc:   svc,
		state: Created,
		deps:  svc.Dependencies(),
	}
	fmt.Println("Registered:", svc.Name())
	return nil
}
```

启动服务和停止服务增加拓扑排序

```go
// kernel/kernel.go
func (k *MicroKernel) topoSort() ([]string, error) {
    k.mu.RLock()
    defer k.mu.RUnlock()

    visited := make(map[string]bool)
    temp := make(map[string]bool)
    result := []string{}
    var visit func(string) error

    visit = func(name string) error {
        if temp[name] {
            return fmt.Errorf("circular dependency at %s", name)
        }
        if visited[name] {
            return nil
        }
        temp[name] = true
        meta, ok := k.services[name]
        if !ok {
            return fmt.Errorf("service %s not registered", name)
        }
        for _, dep := range meta.deps {
            if err := visit(dep); err != nil {
                return err
            }
        }
        visited[name] = true
        temp[name] = false
        result = append(result, name)
        return nil
    }

    for name := range k.services {
        if !visited[name] {
            if err := visit(name); err != nil {
                return nil, err
            }
        }
    }

    return result, nil
}

func (k *MicroKernel) StartAll() error {
    sorted, err := k.topoSort()
    // ...
    for _, name := range sorted {
        if err := k.StartService(name); err != nil {
            // ...
        }
    }
    return nil
}
```
---

### 2.2 服务

服务增加依赖方法实现

```go
func (l *LogService) Dependencies() []string {
	return []string{"echo"}
}
```

### 2.3 运行结果

```bash
Registered: logger
Registered: echo
Starting all services...
Services: [echo logger]
[echo] starting...
Started: echo
[logger] starting...
Started: logger
[logger] LOG: Hello, Microkernel!
[MicroKernel] Event from logger: - Hello, Microkernel!
[logger] got reply from kernel: Handled by kernel
[logger] LOG: Hello, Echo!
[MicroKernel] Event from logger: - Hello, Echo!
[logger] got reply from kernel: echo service handled
[MicroKernel] Send Event to unknown: Hello, Log!
{404 Not found service }
Stopping all services...
[logger] stopping...
Stopped: logger
[echo] stopping...
Stopped: echo
```

查看[完整代码](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/microkernel/microkernel6)

