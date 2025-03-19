# goland 问题处理记录

## 1. ide 警告找不到方法

ide 警告找不到方法，但是又可以通过跳转找到对应的方法。在ide运行，手动运行也正常。

**问题原因**

1. 识别到的库版本出现了差异，出现了版本不兼容的问题。

   可以通过 go.mod 强行指定版本。

2. 清理goland缓存。

   有可能是ide的索引损坏了。可以通过点击菜单栏`File -> Invalidate Caches / Restart...`，选择` Invalidate and Restart`重新生成索引。
