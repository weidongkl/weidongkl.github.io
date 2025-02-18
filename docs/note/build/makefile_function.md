# Makefile 常用方法

## info/warning

### 功能：

- 用于打印调试信息。
- `info` 打印内容，`warning` 打印内容并附加行号。

### 调试：

可以使用 `make -n` 来打印命令但不执行，从而帮助调试。

### 示例：

```makefile
$(warning $(LANGUAGES))  # 29行
$(info $(LANGUAGES))     # 30行
$(warning xxx)           # 31行
$ make -n
Makefile:29: zh wd
zh wd
Makefile:31: xxx
```

------

## subst

### 功能：

执行文本替换：将文本中所有出现的 `from` 替换为 `to`。

### 用法：

```makefile
$(subst from,to,text)
```

### 示例：

```makefile
$(subst ee,EE,feet on the street)
```

输出：`fEEt on the strEEt`

------

## wildcard

### 功能：

通过通配符返回文件列表，类似于 Python 的 `glob`。

### 用法：

```makefile
$(wildcard pattern)
```

### 示例：

获取 `po` 目录下所有以 `.po` 结尾的文件：

```makefile
$(warning $(wildcard po/*.po))
# Makefile:20: po/zh.po po/wd.po
```

------

## patsubst

### 功能：

替换字符串，可以使用 `%` 通配符，支持模式替换。

### 用法：

```makefile
$(patsubst pattern,replacement,text)
```

### 区别：

- `subst` 仅支持完全匹配替换。
- `patsubst` 支持模式匹配。

### 示例：

```makefile
text := Hello, world!
result := $(subst world,Makefile,$(text))

all:
    @echo $(result)  # 输出: Hello, Makefile!
files := src/foo.c src/bar.c src/baz.c
objects := $(patsubst src/%.c,build/%.o,$(files))

all:
    @echo $(objects)  # 输出: build/foo.o build/bar.o build/baz.o
```

------

## addsuffix

### 功能：

为每个文件名添加后缀。

### 用法：

```makefile
$(addsuffix suffix, names...)
```

### 示例：

```makefile
$(addsuffix .c,foo bar)
```

返回值：`foo.c bar.c`

------

## basename

### 功能：

从文件名中提取前缀部分（即点号 `.` 之前的部分）。

### 用法：

```makefile
$(basename names...)
```

### 示例：

```makefile
$(basename src/foo.c src-1.0/bar.c /home/jack/.font.cache-1 hacks)
```

提取文件名和去掉后缀：

```makefile
filepath := src/foo.c

# 提取文件名
filename := $(notdir $(filepath))

# 去掉后缀
name_without_ext := $(basename $(filename))

all:
    @echo "Filename: $(filename)"  # 输出: foo.c
    @echo "Name without extension: $(name_without_ext)"  # 输出: foo
```

------

## firstword

### 功能：

从字符串中提取第一个单词。

### 用法：

```makefile
$(firstword text)
```

### 示例：

```makefile
words := foo bar baz
first := $(firstword $(words))

all:
    @echo $(first)  # 输出: foo
```

------

## strip

### 功能：

去除字符串开头和结尾的空格。

### 用法：

```makefile
$(strip text)
```

### 示例：

```makefile
text :=   foo bar baz   
stripped := $(strip $(text))

all:
    @echo "$(stripped)"  # 输出: foo bar baz
```

------

## word

### 功能：

提取字符串中的第 `N` 个单词（单词以空格分隔）。

### 用法：

```makefile
$(word N,text)
```

### 示例：

```makefile
words := foo bar baz
second_word := $(word 2,$(words))

all:
    @echo $(second_word)  # 输出: bar
```
