# VS Code 插入模式和覆盖模式切换：

## 1. 按键切换（最常用）

- 按键盘上的 **`Insert`** 键（通常在Delete键旁边）
- 或者 **`Fn + Insert`**（某些笔记本电脑）
- 这会在插入模式（竖线光标）和覆盖模式（黑色块光标）之间切换

## 2. 通过命令面板
1. 按 **`Ctrl+Shift+P`**（Windows/Linux）或 **`Cmd+Shift+P`**（Mac）
2. 输入 **`切换覆盖模式`** 或 **`Toggle Overtype Mode`**
3. 按回车执行

## 3. 检查设置
如果问题持续存在，检查VS Code设置：
1. 按 **`Ctrl+,`** 打开设置
2. 搜索 **`editor.overtype`**
3. 确保该选项为 **`false`**

## 4. 重启VS Code
有时候简单的重启就能解决问题。

## 5. 完全禁用
如果想完全禁用覆盖模式，可以在设置中添加：
```json
{
  "editor.overtype": false
}
```

