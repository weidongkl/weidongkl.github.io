---
sidebar_position: 8
---
# microkernel 设计8

## 1. 目标

- 服务热更新增加状态迁移
- 支持服务加密状态迁移

## 2. 代码改动

### 2.1 Kernel（核心）

新增状态接口

```go
// 旧服务可选实现：导出状态
type Exportable interface {
    ExportState() any
}

// 新服务可选实现：导入状态
type Importable interface {
    ImportState(state any) error
}
```

加密接口

```go
type Crypter interface {
    Encrypt(data any) ([]byte, error)
    Decrypt(cipher []byte) (any, error)
}
```

加密实现

使用aes

```go
type AESCrypter struct {
    key []byte // 16/24/32 字节
}

func NewAESCrypter(key []byte) *AESCrypter {
    return &AESCrypter{key: key}
}

func (a *AESCrypter) Encrypt(data any) ([]byte, error) {
    plaintext, err := json.Marshal(data)
    if err != nil {
        return nil, err
    }
    block, err := aes.NewCipher(a.key)
    if err != nil {
        return nil, err
    }
    aesgcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    nonce := make([]byte, aesgcm.NonceSize())
    if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
        return nil, err
    }

    ciphertext := aesgcm.Seal(nonce, nonce, plaintext, nil)
    return ciphertext, nil
}

func (a *AESCrypter) Decrypt(ciphertext []byte) (any, error) {
    block, err := aes.NewCipher(a.key)
    if err != nil {
        return nil, err
    }
    aesgcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    nonceSize := aesgcm.NonceSize()
    if len(ciphertext) < nonceSize {
        return nil, fmt.Errorf("ciphertext too short")
    }

    nonce := ciphertext[:nonceSize]
    cipherData := ciphertext[nonceSize:]

    plaintext, err := aesgcm.Open(nil, nonce, cipherData, nil)
    if err != nil {
        return nil, err
    }

    var result any
    if err := json.Unmarshal(plaintext, &result); err != nil {
        return nil, err
    }
    return result, nil
}
```

替换服务

```go
//func (k *MicroKernel) ReplaceService(newSvc Service) error {
//	k.mu.Lock()
//	defer k.mu.Unlock()
//
//	name := newSvc.Name()
//	oldMeta, exists := k.services[name]
//	var state any
//
//	if exists {
//		if exporter, ok := oldMeta.svc.(Exportable); ok {
//			state = exporter.ExportState()
//		}
//		oldMeta.svc.Stop()
//		fmt.Printf("Stopped old version of %s\n", name)
//	}
//
//	// 状态迁移
//	if importer, ok := newSvc.(Importable); ok && state != nil {
//		if err := importer.ImportState(state); err != nil {
//			return fmt.Errorf("state import failed: %w\n", err)
//		}
//		fmt.Printf("State migrated for service %s\n", name)
//	}
//
//	// 替换服务元信息
//	k.services[name] = &serviceMeta{
//		svc:   newSvc,
//		deps:  newSvc.Dependencies(),
//		state: Created,
//	}
//
//	// 重启服务
//	if exists && oldMeta.state == Running {
//		newSvc.Start()
//		k.services[name].state = Running
//		fmt.Printf("Started new version of %s", name)
//	} else {
//		fmt.Printf("Registered new version of %s (not started)", name)
//	}
//
//	return nil
//}

func (k *MicroKernel) ReplaceServiceEncrypted(newSvc Service, crypter Crypter) error {
	k.mu.Lock()
	defer k.mu.Unlock()

	name := newSvc.Name()
	oldMeta, exists := k.services[name]
	var encryptedState []byte

	if exists {
		if exporter, ok := oldMeta.svc.(Exportable); ok {
			rawState := exporter.ExportState()
			cipher, err := crypter.Encrypt(rawState)
			if err != nil {
				return fmt.Errorf("state encryption failed: %w", err)
			}
			encryptedState = cipher
		}
		oldMeta.svc.Stop()
		fmt.Printf("Stopped old version of %s\n", name)
	}

	// 状态导入（解密）
	if importer, ok := newSvc.(Importable); ok && encryptedState != nil {
		decrypted, err := crypter.Decrypt(encryptedState)
		if err != nil {
			return fmt.Errorf("state decryption failed: %w", err)
		}
		if err := importer.ImportState(decrypted); err != nil {
			return fmt.Errorf("state import failed: %w", err)
		}
		fmt.Printf("Encrypted state migrated for service %s\n", name)
	}

	k.services[name] = &serviceMeta{
		svc:   newSvc,
		deps:  newSvc.Dependencies(),
		state: Created,
	}

	if exists && oldMeta.state == Running {
		newSvc.Start()
		k.services[name].state = Running
		fmt.Printf("Started new version of %s\n", name)
	} else {
		fmt.Printf("Registered new version of %s (not started)\n", name)
	}

	return nil
}

```

---

### 2.2 echo服务

实现状态接口

```go
func (e *EchoServiceV2) ImportState(state any) error {
	if val, ok := state.(int); ok {
		e.echoCount = val
		return nil
	}
	return fmt.Errorf("invalid state type")
}
func (e *EchoService) ExportState() any {
	return e.echoCount
}

```

### 2.3 main

热替换服务

```go
// 7. 热替换服务
	// 热更新为 V2
aesKey := []byte("1234567890123456") // 16 字节对称密钥
	microKernel.ReplaceServiceEncrypted(service.NewEchoServiceV2(microKernel), microkernel.NewAESCrypter(aesKey))
	

```

### 2.4 运行结果

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
State migrated for service echo
[2025-04-24 21:28:38.032] [INFO] [echo] [echov2] starting...

Started new version of echo[MicroKernel] Send Event to echo: Hello, Log!
[echo] count is 10
{0 echo v2 service handled from microKernel: Hello, Log!}
[MicroKernel] Event from main: - log
v2 reply: {0 Handled by kernel ok}
Stopping all services...
[logger] stopping...
Stopped: logger
[echov2] stopping...
Stopped: echo
[log] stopping

```

查看[完整代码](https://gitee.com/weidongkl/weidongkl.github.io/blob/master/docs/note/golang/design/microkernel/microkernel8)

