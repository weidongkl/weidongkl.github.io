---
sidebar_position: 9
---
# microkernel 设计9

服务状态持久化

## 1. 目标

- 服务状态在 `Stop()` 或热替换时 **导出 + 加密 + 写入磁盘**
- 注册服务时若检测到磁盘中有状态，则 **读取 + 解密 + 导入**
- 每个服务有自己的状态文件（支持多服务）

## 2. 状态存储设计

### 2.1 存储文件设计

- 存储目录：`/var/lib/microkernel/state/`（示例）
- 文件名：`<service_name>.state`
- 文件内容：已加密的字节流

### 2.2 状态管理模块：`StateStore`

```go
type StateStore struct {
    dir     string
    crypter Crypter
}

func NewStateStore(dir string, crypter Crypter) *StateStore {
    return &StateStore{dir: dir, crypter: crypter}
}

func (s *StateStore) path(name string) string {
    return filepath.Join(s.dir, name+".state")
}

func (s *StateStore) Save(name string, state any) error {
    encrypted, err := s.crypter.Encrypt(state)
    if err != nil {
        return err
    }
    if err := os.MkdirAll(s.dir, 0755); err != nil {
        return err
    }
    return os.WriteFile(s.path(name), encrypted, 0600)
}

func (s *StateStore) Load(name string) (any, error) {
    data, err := os.ReadFile(s.path(name))
    if err != nil {
        return nil, err
    }
    return s.crypter.Decrypt(data)
}

func (s *StateStore) Exists(name string) bool {
    _, err := os.Stat(s.path(name))
    return err == nil
}
```



## 3. 内核集成

### 3.1 kernel 初始化集成`StateStore`

```go
type MicroKernel struct {
    ...
    stateStore *StateStore
}

func NewMicroKernelWithState(store *StateStore) *MicroKernel {
    return &MicroKernel{
        services: make(map[string]*serviceMeta),
        stateStore: store,
        logger: NewLogger("kernel", INFO, os.Stdout),
    }
}
```

### 3.2 注册服务时尝试自动加载状态

```go
// Register 注册服务
// 重命名 RegisterService 为 Register
func (k *MicroKernel) Register(svc Service) error {
	k.mu.Lock()
	defer k.mu.Unlock()
	// name 可以放在锁前面，优化性能
	name := svc.Name()
	// 增加状态导入
	// 如果使用的接口，这边就使用的接口方法
	if k.stateStore != nil && k.stateStore.Exists(name) {
		// 查看服务是否支持状态导入
		// 状态导入不要求每个服务必须实现
		// 如果没有实现，就直接忽略
		if importer, ok := svc.(Importable); ok {
			raw, err := k.stateStore.Load(name)
			if err != nil {
				return fmt.Errorf("state load failed: %w\n", err)
			}
			err = importer.ImportState(raw)
			if err != nil {
				return fmt.Errorf("state import failed: %w\n", err)
			}
			fmt.Printf("State migrated for service %s\n", name)
		}
	}
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

### 3.3 停止服务时，保存状态

```go
func (k *MicroKernel) StopService(name string) error {
	k.mu.Lock()
	defer k.mu.Unlock()
	meta, ok := k.services[name]
	if !ok {
		return errors.New("service not registered")
	}
	if meta.state == Stopped {
		return errors.New("service already stopped")
	}
	// 增加状态导出判断
	if exporter, ok := meta.svc.(Exportable); ok && k.stateStore != nil {
		if err := k.stateStore.Save(name, exporter.ExportState()); err == nil {
			fmt.Printf("State persisted for %s\n", name)
		}
	}
	if err := meta.svc.Stop(); err != nil {
		return err
	}
	meta.state = Stopped
	fmt.Println("Stopped:", meta.svc.Name())
	return nil
}
```

### 3.4 定时持久化状态

```go
func (k *MicroKernel) Listen(ctx context.Context) {
	// 间隔可以加在kernel的struct中，也可以使用方法来获取
	ticker := time.NewTicker(2 * time.Second)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			fmt.Println("Timed writing state")
			if k.stateStore != nil {
				for name, meta := range k.services {
					if meta.state == Running {
						if exporter, ok := meta.svc.(Exportable); ok {
							if err := k.stateStore.Save(name, exporter.ExportState()); err == nil {
								fmt.Printf("State persisted for %s\n", name)
							}
						}
					}
				}
			}
```

## 4. main

```go
crypter := microkernel.NewAESCrypter([]byte("1234567890123456"))
	store := microkernel.NewStateStore("./state", crypter)
	// 1. 创建微内核
	microKernel := microkernel.NewMicroKernel(store) // 增加加密存储
```

### 4.1 运行结果

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
[MicroKernel] Send Event to echo: Hello, Log!
{0 echo service handled from microKernel: Hello, Log!}
[echo] stopping...
Stopped old version of echo
Encrypted state migrated for service echo
[2025-04-26 19:47:00.801] [INFO] [echo] [echov2] starting...

Started new version of echo
[MicroKernel] Send Event to echo: Hello, Log!
[echo] count is 10
{0 echo v2 service handled from microKernel: Hello, Log!}
[MicroKernel] Event from main: - log
v2 reply: {0 Handled by kernel ok}
Stopping all services...
[logger] stopping...
Stopped: logger
[echov2] stopping...
Stopped: echo
```

查看[完整代码](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/microkernel/microkernel9)

