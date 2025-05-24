# Go 方法转发规则 

在 Go 中，**方法转发**（Method Forwarding）是指将结构体的方法调用委托给其内部字段或内嵌类型的方法。是否需要显式转发取决于结构体如何组合其他类型（接口或具体类型）。  

---

## 1. 需要显式方法转发的情况  
当结构体将其他类型作为 **普通字段**（非内嵌）时，必须手动实现方法转发。  

### 1.1 普通字段（非内嵌）
示例：结构体包含 `sync.WaitGroup` 字段

```go
type Wait struct {
    wg sync.WaitGroup // 普通字段（非内嵌）
}

// 必须手动实现方法转发
func (w *Wait) Wait() {
    w.wg.Wait() // 显式调用
}

func (w *Wait) Add(delta int) {
    w.wg.Add(delta)
}

func (w *Wait) Done() {
    w.wg.Done()
}
```
调用方式

```go
w := Wait{}
w.Add(1)  // 必须通过自定义方法调用
w.Wait()  // 必须通过自定义方法调用
```

适用场景

- 需要控制方法访问权限（如只暴露部分方法）。
- 需要修改或增强原有方法的行为（如添加日志、校验逻辑）。

---

### 1.2 结构体包含接口字段（非内嵌）
如果结构体包含一个接口字段（而非内嵌），也必须手动转发方法：
```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type MyReader struct {
    r Reader // 普通字段（非内嵌）
}

// 必须手动实现 Read 方法
func (m *MyReader) Read(p []byte) (n int, err error) {
    return m.r.Read(p)
}
```

调用方式

```go
mr := MyReader{r: someReader}
mr.Read(data) // 调用自定义的 Read 方法
```

---

## 2. 不需要显式方法转发的情况  
当结构体 **内嵌（Embed）** 其他类型（接口或具体类型）时，Go 会自动继承其方法，无需手动转发。

### 2.1 内嵌具体类型（自动继承方法）
示例：内嵌 `sync.WaitGroup`

```go
type Wait struct {
    sync.WaitGroup // 内嵌（非字段）
}

// 无需手动实现 Wait()、Add()、Done()
```
调用方式

```go
w := Wait{}
w.Add(1)  // 直接调用继承的方法
w.Wait()  // 直接调用继承的方法
```

适用场景

- 希望直接暴露所有方法，无需额外控制。
- 减少重复代码，简化结构体定义。

---

### 2.2 内嵌接口（自动委托）
如果结构体内嵌一个接口，它会自动继承该接口的所有方法，并委托给当前赋值的接口实现：
```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type MyReader struct {
    Reader // 内嵌接口
}

// 无需手动实现 Read()
```

调用方式

```go
mr := MyReader{r: someReader} // someReader 必须实现 Reader
mr.Read(data) // 自动委托给 someReader.Read()
```

适用场景

- 实现 **装饰器模式**（Decorator Pattern），动态替换底层实现。
- 依赖注入（Dependency Injection），运行时决定具体实现。

---

## 3. 总结对比
| **情况**                   | **是否需要手动转发？** | **示例**            | **适用场景**                     |
| -------------------------- | ---------------------- | ------------------- | -------------------------------- |
| **普通字段（非内嵌）**     | ✅ 需要                 | `wg sync.WaitGroup` | 需要控制方法访问或增强逻辑       |
| **内嵌具体类型**           | ❌ 不需要               | `sync.WaitGroup`    | 直接暴露所有方法，减少重复代码   |
| **普通接口字段（非内嵌）** | ✅ 需要                 | `r Reader`          | 需要显式管理方法调用             |
| **内嵌接口**               | ❌ 不需要               | `Reader`            | 动态委托，如装饰器模式或依赖注入 |

---

## 4. 最佳实践
- **使用内嵌（Embedding）**：如果希望直接暴露所有方法，减少样板代码。
- **使用普通字段**：如果需要控制方法访问或增强行为（如日志、校验）。
- **避免过度内嵌**：内嵌过多可能导致方法冲突或代码难以维护。

---

## 5. 补充说明
- **方法冲突**：如果结构体同时内嵌多个类型，且它们有相同的方法名，必须显式解决冲突（Go 不会自动选择）。
- **封装性**：内嵌会暴露所有方法，可能破坏封装性，需谨慎使用。

