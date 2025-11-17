# Go 文件路径安全编码

## 1. `filepath.Abs` 与 `filepath.Clean` 的核心差异

### 1.1 `filepath.Clean` —— 路径字符串清理（推荐用于安全检查）

* **作用**：标准化路径字符串（去掉 `./`、`../`、多余斜杠等）。
* **不依赖文件系统**或当前工作目录（CWD）。
* **输出可预期、行为稳定**。
* **安全角度**：✅ 可通过 gosec G304 检查。

示例：

```go
cleaned := filepath.Clean("./safe/dir/../../etc/passwd")
// 输出：etc/passwd（相对路径，被清理但未绝对化）
```

### 1.2 `filepath.Abs` —— 转换为绝对路径（不推荐用于安全检查）

* **作用**：将相对路径转换为绝对路径。
* **依赖当前工作目录**（CWD）。
* **相同输入 → 不同 CWD → 不同输出**。
* **安全角度**：❌ 被 gosec G304 视为风险（不稳定行为）。

示例：

```go
// CWD = /home/user
abs1, _ := filepath.Abs("./file.txt")  // /home/user/file.txt

os.Chdir("/tmp")
abs2, _ := filepath.Abs("./file.txt")  // /tmp/file.txt
```

---

## 2. 路径安全风险示例：CWD 可变导致检查失效

```go
package main

import (
    "os"
    "path/filepath"
)

func main() {
    safeRoot := "./safe/dir"
    unsafePath := "../../etc/passwd"

    combined := safeRoot + "/" + unsafePath
    println("Combined:", combined)

    // 第一次绝对路径（基于原本 CWD）
    abs1, _ := filepath.Abs(combined)
    println("Absolute:", abs1)

    // 改变 CWD 后，相同输入得到完全不同的路径
    os.Chdir("/tmp")
    abs2, _ := filepath.Abs(combined)
    println("New Absolute:", abs2)
}
```

可能的输出：

```
Combined: ./safe/dir/../../etc/passwd
Absolute: /home/user/project/etc/passwd
New Absolute: /tmp/etc/passwd
```

**结论：** 使用 `filepath.Abs` 做安全路径检查是**不可靠的**。

---

## 3. 安全编码最佳实践

### 3.1 ❌ 危险方式（错误示例）

依赖 `filepath.Abs` + `HasPrefix`：

```go
func unsafeCheck(userInput, root string) bool {
    absPath, _ := filepath.Abs(filepath.Join(root, userInput))
    return strings.HasPrefix(absPath, root)  // 不可靠
}
```

---

### 3.2 ✅ 安全方式 1：Clean + 强制以 "/" 开头 + 前缀校验

```go
func safeJoinAndCheck(root, userInput string) (string, error) {
    cleanInput := filepath.Clean("/" + userInput) // 防止逃逸
    fullPath := filepath.Join(root, cleanInput)
    finalPath := filepath.Clean(fullPath)

    if !strings.HasPrefix(finalPath, filepath.Clean(root)) {
        return "", fmt.Errorf("路径遍历攻击: %s", userInput)
    }
    return finalPath, nil
}
```

优点：

* 不依赖 CWD
* 输出稳定
* 可通过静态分析

---

### 3.3 ✅ 安全方式 2：使用 `filepath.Rel` 检测是否逃逸

```go
func safePathJoin(root, userInput string) (string, error) {
    cleanInput := filepath.Clean(userInput)
    fullPath := filepath.Join(root, cleanInput)

    rel, err := filepath.Rel(root, fullPath)
    if err != nil {
        return "", err
    }

    if strings.HasPrefix(rel, "..") {
        return "", fmt.Errorf("非法路径: %s", userInput)
    }

    return fullPath, nil
}
```

优点：

* 官方建议的判断方式
* 易读、可维护

---

## 4. 实际应用示例：处理文件上传路径

```go
package main

import (
    "fmt"
)

func main() {
    safeRoot := "/var/www/uploads"

    tests := []string{
        "normal.txt",
        "../secret.txt",
        "../../etc/passwd",
        "subdir/../../escape.txt",
    }

    for _, input := range tests {
        safe, err := safeJoinAndCheck(safeRoot, input)
        if err != nil {
            fmt.Printf("❌ 拒绝: %-20s → %v\n", input, err)
        } else {
            fmt.Printf("✅ 允许: %-20s → %s\n", input, safe)
        }
    }
}
```

示例输出：

```
✅ 允许: normal.txt           → /var/www/uploads/normal.txt
❌ 拒绝: ../secret.txt        → 路径遍历攻击: ../secret.txt
❌ 拒绝: ../../etc/passwd     → 路径遍历攻击: ../../etc/passwd
❌ 拒绝: subdir/../../escape.txt → 路径遍历攻击: subdir/../../escape.txt
```

---

## 5. 关键要点总结

1. **不要使用 `filepath.Abs` 作为安全检查依据**

   * 行为受 CWD 影响 → 不可预测
   * 会触发 gosec G304

2. **优先使用 `filepath.Clean` 预处理用户输入**

3. **验证路径必须在安全根目录内**

   * 使用 `HasPrefix`（需注意 Clean 后）
   * 或使用 `filepath.Rel`（更安全）

4. **强制用户路径从根开始**

   * `filepath.Clean("/" + userInput)`

5. **防御目录遍历攻击**

   * 不信任用户输入
   * 严格限定根目录
   * 发现不合法路径时应记录日志
