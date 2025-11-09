# JSON Schema 数据结构定义

## 1. 基础概念

**JSON Schema** 是一种用于描述 JSON 数据结构的规范，用来定义 JSON 数据的格式、类型、约束条件等。
 它可用于：

- 校验输入数据的合法性；
- 自动生成表单或 API 文档；
- 进行配置文件或接口请求参数的验证。

在 Python 中，常用库：

```bash
pip install jsonschema
```

------

## 2. JSON Schema 基本结构

一个典型的 JSON Schema 是一个 JSON 对象，用于描述目标数据的结构。

```json
笔记{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "email": {
      "type": "string",
      "format": "email"
    }
  },
  "required": ["id", "name", "email"]
}
```

### 2.1 关键字段说明

| 字段名                    | 说明                                                      |
| ------------------------- | --------------------------------------------------------- |
| `$schema`                 | Schema 规范版本（例如 draft-07 / 2020-12）                |
| `title` / `description`   | 文档化说明信息                                            |
| `type`                    | 数据类型（object, array, string, integer, boolean, null） |
| `properties`              | 对象的字段定义                                            |
| `required`                | 必填字段列表                                              |
| `items`                   | 数组元素的 Schema 定义                                    |
| `enum`                    | 限定可选值                                                |
| `const`                   | 限定固定值                                                |
| `format`                  | 格式验证（如 email, ipv4, date-time）                     |
| `pattern`                 | 字符串的正则约束                                          |
| `minimum` / `maximum`     | 数值范围                                                  |
| `minLength` / `maxLength` | 字符串长度限制                                            |
| `minItems` / `maxItems`   | 数组长度限制                                              |
| `additionalProperties`    | 是否允许定义外的字段（布尔或 schema）                     |

------

## 3. 数据类型定义

### 3.1 对象（object）

```json
{
  "type": "object",
  "properties": {
    "username": {"type": "string"},
    "age": {"type": "integer"}
  },
  "required": ["username"]
}
```

### 3.2 数组（array）

```json
{
  "type": "array",
  "items": {"type": "integer"},
  "minItems": 1,
  "uniqueItems": true
}
```

### 3.3 字符串（string）

```json
{
  "type": "string",
  "minLength": 3,
  "maxLength": 20,
  "pattern": "^[a-zA-Z0-9_]+$"
}
```

### 3.4 数字（number/integer）

```json
{
  "type": "integer",
  "minimum": 0,
  "maximum": 150
}
```

### 3.5 枚举（enum）

```json
{
  "type": "string",
  "enum": ["male", "female", "other"]
}
```

------

## 4. Python 中使用 `jsonschema`

### 4.1 基本验证

```python
from jsonschema import validate
from jsonschema.exceptions import ValidationError

schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer", "minimum": 0}
    },
    "required": ["name", "age"]
}

data = {"name": "Alice", "age": 25}

try:
    validate(instance=data, schema=schema)
    print("✅ 数据合法")
except ValidationError as e:
    print("❌ 数据不合法:", e.message)
```

------

### 4.2 校验失败示例

```python
data = {"name": "Bob", "age": -3}

try:
    validate(instance=data, schema=schema)
except ValidationError as e:
    print("错误字段路径:", list(e.path))
    print("错误信息:", e.message)
```

输出：

```
错误字段路径: ['age']
错误信息: -3 is less than the minimum of 0
```

------

## 5. 复杂结构与嵌套

### 5.1 嵌套对象

```json
{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string"}
      },
      "required": ["id", "name"]
    },
    "roles": {
      "type": "array",
      "items": {"type": "string"}
    }
  },
  "required": ["user"]
}
```

### 5.2 组合关键字

| 关键字  | 含义                   |
| ------- | ---------------------- |
| `allOf` | 所有子 Schema 均需匹配 |
| `anyOf` | 至少匹配一个子 Schema  |
| `oneOf` | 仅匹配一个子 Schema    |
| `not`   | 不匹配该 Schema        |

示例：

```json
{
  "anyOf": [
    {"type": "string"},
    {"type": "number"}
  ]
}
```

------

## 6. Schema 引用与复用

### 6.1 `$ref` 引用

```json
{
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string"}
      },
      "required": ["id", "name"]
    }
  },
  "type": "object",
  "properties": {
    "creator": {"$ref": "#/definitions/User"},
    "editor": {"$ref": "#/definitions/User"}
  }
}
```

------

## 7. JSON Schema 校验器配置

使用 `Draft202012Validator`、`Draft7Validator` 等自定义控制验证版本：

```python
from jsonschema import Draft202012Validator

validator = Draft202012Validator(schema)
errors = sorted(validator.iter_errors({"name": 123}), key=lambda e: e.path)
for error in errors:
    print(f"路径: {list(error.path)}, 错误: {error.message}")
```

------

## 8. 高级技巧

### 8.1 自定义格式验证器

```python
from jsonschema import Draft7Validator, FormatChecker

schema = {
    "type": "object",
    "properties": {
        "email": {"type": "string", "format": "email"}
    }
}

data = {"email": "not-an-email"}
validator = Draft7Validator(schema, format_checker=FormatChecker())

for error in validator.iter_errors(data):
    print(error.message)
```

### 8.2 定义自定义格式

```python
@FormatChecker.cls_checks("is-even")
def is_even(value):
    return isinstance(value, int) and value % 2 == 0
```

------

## 9. 小结

| 内容        | 关键点                                   |
| ----------- | ---------------------------------------- |
| 基础结构    | `type`, `properties`, `required`         |
| 校验方式    | `validate()` / `Validator.iter_errors()` |
| 类型控制    | `string`, `integer`, `array`, `object`   |
| 组合与复用  | `allOf`, `anyOf`, `$ref`                 |
| Python 实践 | 结合 `jsonschema` 库使用                 |
| 适用场景    | API 请求校验、配置验证、Schema 驱动开发  |

------

## 10. 参考资料

- [JSON Schema 官方规范](https://json-schema.org/)
- [python-jsonschema 文档](https://python-jsonschema.readthedocs.io/en/stable/)
- [Draft 2020-12 标准](https://json-schema.org/draft/2020-12/json-schema-core.html)


