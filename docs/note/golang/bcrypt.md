# Golang `bcrypt` 

## 1. 概述

`bcrypt` 是一种安全的密码哈希算法，适用于存储用户密码，防止明文泄露。Golang 提供 `golang.org/x/crypto/bcrypt` 包来简化 `bcrypt` 的使用。

------

## 2. 安装

`bcrypt` 属于 Go 的扩展库，需要手动安装：

```sh
go get golang.org/x/crypto/bcrypt
```

------

## 3. 基本用法

### 3.1 生成哈希密码

```go
package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "my_secure_password"

	// 生成 bcrypt 哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error generating hash:", err)
		return
	}

	fmt.Println("Hashed Password:", string(hashedPassword))
}
```

**说明**

- `bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)` 生成哈希密码。
- `bcrypt.DefaultCost` 是默认的计算成本（`10`），可以调整为 `bcrypt.MinCost`（较快）或 `bcrypt.MaxCost`（更安全但更慢）。
- 生成的哈希密码会自动包含 `bcrypt` 版本、成本因子和盐值。

------

### 3.2 校验密码

```go
package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "my_secure_password"
	hashedPassword := "$2a$10$P8HU5POQ9mC9dp5BqGkgYOdxz9b7zRbhq2bEn5B2c5rYrXsEoaQve" // 之前存储的哈希

	// 验证密码
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		fmt.Println("Password incorrect")
	} else {
		fmt.Println("Password correct")
	}
}
```

**说明**

- `bcrypt.CompareHashAndPassword(hashedPassword, password)` 验证密码是否匹配哈希值。
- 如果密码匹配，返回 `nil`，否则返回 `error`。

------

### 3.3 修改密码

要修改密码，直接生成新哈希并存储：

```go
newPassword := "new_secure_password"
newHashedPassword, _ := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
fmt.Println("Updated Hashed Password:", string(newHashedPassword))
```

------

### 3.4 确定哈希是否需要更新

如果哈希密码的成本过低，可以使用 `bcrypt.Cost()` 确定是否需要更新：

```go
cost, err := bcrypt.Cost([]byte(hashedPassword))
if err == nil && cost < bcrypt.DefaultCost {
	fmt.Println("Password hash is outdated, consider updating")
}
```
**监测哈希成本并升级**

如果 `bcrypt.Cost` 返回的值小于当前推荐值（如 `12`），则需要重新哈希密码：

```go
const recommendedCost = 12

func upgradePasswordHash(storedHash string, password string) string {
	cost, err := bcrypt.Cost([]byte(storedHash))
	if err != nil {
		fmt.Println("Error getting cost:", err)
		return storedHash
	}

	// 如果成本因子过低，则重新生成哈希
	if cost < recommendedCost {
		newHash, err := bcrypt.GenerateFromPassword([]byte(password), recommendedCost)
		if err != nil {
			fmt.Println("Error upgrading hash:", err)
			return storedHash
		}
		fmt.Println("Password hash upgraded.")
		return string(newHash)
	}

	return storedHash
}
```



## 4. 适用场景

| 场景         | 说明                                    |
| ------------ | --------------------------------------- |
| 用户密码存储 | 安全存储用户密码，防止明文泄露          |
| 密码验证     | 在用户登录时进行哈希匹配                |
| 密码更新     | 检测哈希是否过时，并重新加密            |
| 防止暴力破解 | `bcrypt` 计算开销高，能有效阻止暴力攻击 |

------

## 5. 总结

- **`bcrypt.GenerateFromPassword()`** 生成哈希密码。
- **`bcrypt.CompareHashAndPassword()`** 验证密码。
- **`bcrypt.Cost()`** 检查哈希成本，确定是否需要升级。

>Linux `/etc/shadow` 存储的是加密后的密码哈希，格式如下：
>
>```
>$<加密算法>$<成本因子或迭代次数>$<salt+hash>
>```
>
>常见的加密算法：
>
>- `$1$`  → MD5
>- `$2a$` / `$2b$` / `$2y$`  → **bcrypt**
>- `$5$`  → SHA-256
>- `$6$`  → SHA-512
>
>示例（bcrypt）：
>
>```
>$2y$10$XGnVZqM9JpWcPKCqGRBBtuNA7E6x2ZK.7JsZh9y1X1Ij0wY2brJve
>```
>
>- `$2y$`  → 使用 **bcrypt** 加密
>- `10`  → 计算成本（cost factor）
>- `XGnVZqM9JpWcPKCqGRBBtu`  → 盐（salt）
>- `NA7E6x2ZK.7JsZh9y1X1Ij0wY2brJve`  → 哈希后的密码
