# licensecheck

## 1. 简介

`licensecheck` 是 Debian 项目提供的一个 Perl 脚本，用于扫描源码文件头和 LICENSE 文本中的许可证信息。
 它轻量、依赖少，适合做快速初步检测。

## 2. 安装

**Fedora / RHEL**

```bash
sudo dnf install licensecheck
```

**Ubuntu / Debian**

```bash
sudo apt install licensecheck
```

**或从源码安装**

```bash
git clone https://salsa.debian.org/debian/devscripts.git
cd devscripts/scripts
sudo install -m 755 licensecheck.pl /usr/local/bin/licensecheck
```

## 3. 基本用法

```bash
licensecheck -r path/to/source
```

示例：

```bash
licensecheck -r sigil-2.6.2 | sort -u > license-summary.txt
```

输出示例：

```
COPYING.txt: GPL-3.0-or-later
docs/about.md: CC-BY-SA
src/sigil/main.cpp: GPL-3.0-or-later
plugins/python/plugin.py: Apache-2.0
```

**💡 优点**

- 扫描速度快；
- 系统包管理器直接可安装；
- 结果直观。

**⚠️ 局限**

- 不支持复杂 SPDX 表达式；
- 无法解析嵌套子目录或组合许可证的逻辑关系；
- 不生成结构化报告。
