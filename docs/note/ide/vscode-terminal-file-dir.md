# VS Code 文件所在目录打开终端

## 1. 场景说明

在 VS Code 中打开终端时，默认终端路径通常是**工作区根目录**。
为了更方便地执行与当前文件相关的命令（如运行、编译、调试），我们希望**终端自动在当前文件所在目录打开**。

---

## 2. 设置方法

### 2.1 打开 VS Code 设置

* 快捷键：`Ctrl + ,`
* 或通过菜单：
  **文件 → 首选项 → 设置**

---

### 2.2 搜索设置项

在搜索框输入：

```
terminal.integrated.cwd
```

---

### 2.3 修改设置值

将其设置为：

```
${fileDirname}
```

这样，终端会在每次打开时自动定位到当前文件所在的目录。

---

### 2.4 效果演示

假设你打开了文件：

```
/home/user/project/src/main.go
```

当你按下：

```
Ctrl + Shift + `
```

VS Code 将在：

```
/home/user/project/src/
```

自动打开终端，而不是工作区根目录。

---

## 3. 可用变量参考

| 变量                           | 含义          |
| ---------------------------- | ----------- |
| `${file}`                    | 当前打开文件的完整路径 |
| `${fileDirname}`             | 当前文件所在目录    |
| `${workspaceFolder}`         | 当前工作区根目录    |
| `${relativeFile}`            | 文件相对工作区的路径  |
| `${workspaceFolderBasename}` | 工作区文件夹名     |

---

## 4. 进阶提示

如果你经常需要不同方式打开终端（例如：

* 一个在当前文件目录
* 一个在项目根目录），
  可以配合 **自定义快捷键（keybindings.json）** 使用，例如：

```json
[
  {
    "key": "ctrl+alt+t",
    "command": "workbench.action.terminal.new",
    "args": { "cwd": "${fileDirname}" }
  },
  {
    "key": "ctrl+alt+shift+t",
    "command": "workbench.action.terminal.new",
    "args": { "cwd": "${workspaceFolder}" }
  }
]
```

---

## 5. 总结

| 步骤 | 操作                           |
| -- | ---------------------------- |
| 1  | 打开设置 `Ctrl+,`                |
| 2  | 搜索 `terminal.integrated.cwd` |
| 3  | 设置值为 `${fileDirname}`        |
| 4  | 打开终端即可在文件所在目录运行              |



