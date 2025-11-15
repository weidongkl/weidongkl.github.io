# Python `__getattr__` 方法详解笔记

## 1. 基本概念

### 1.1 什么是 `__getattr__`

`__getattr__` 是 Python 的一个特殊方法，当**访问不存在的属性**时会被自动调用。

```python
class Example:
    def __getattr__(self, name):
        print(f"访问了不存在的属性: {name}")
        return f"默认值_{name}"

obj = Example()
print(obj.some_attribute)  # 输出: 访问了不存在的属性: some_attribute
                           # 输出: 默认值_some_attribute
```

### 1.2 与 `__getattribute__` 的区别

| 特性 | `__getattr__` | `__getattribute__` |
|------|---------------|-------------------|
| 触发条件 | 访问不存在的属性时 | 访问任何属性时 |
| 性能 | 较高 | 较低（每次属性访问都触发） |
| 使用场景 | 动态属性、代理模式 | 属性访问控制 |

## 2. 语法和参数

```python
def __getattr__(self, name: str) -> Any:
    """
    self: 实例对象
    name: 要访问的属性名称（字符串）
    返回值: 属性的值
    """
    pass
```

## 3. 核心用途

### 3.1 动态属性计算

```python
class DynamicAttributes:
    def __init__(self):
        self._data = {}
    
    def __getattr__(self, name):
        if name.startswith('calc_'):
            field = name[5:]  # 去掉 'calc_' 前缀
            return len(str(self._data.get(field, '')))
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

obj = DynamicAttributes()
obj._data = {'name': 'John', 'age': 30}
print(obj.calc_name)  # 输出: 4
print(obj.calc_age)   # 输出: 2
```

### 3.2 代理模式/委托模式

```python
class Proxy:
    """代理类，将大部分操作委托给实际对象"""
    def __init__(self, target):
        self._target = target
    
    def __getattr__(self, name):
        # 将所有未定义的属性访问转发给目标对象
        return getattr(self._target, name)

class RealSubject:
    def __init__(self, value):
        self.value = value
    
    def show(self):
        return f"RealSubject: {self.value}"

real = RealSubject("hello")
proxy = Proxy(real)
print(proxy.show())    # 输出: RealSubject: hello
print(proxy.value)     # 输出: hello
```

### 3.3 向后兼容性

```python
class ModernAPI:
    def __init__(self):
        self.new_method_name = "新方法"
    
    def __getattr__(self, name):
        # 为旧名称提供向后兼容
        compatibility_map = {
            'old_method': 'new_method_name',
            'legacy_attr': 'new_method_name'
        }
        if name in compatibility_map:
            return getattr(self, compatibility_map[name])
        raise AttributeError(f"没有属性 '{name}'")

obj = ModernAPI()
print(obj.old_method)  # 输出: 新方法
```

### 3.4 配置系统（DRF 风格）

```python
class APISettings:
    def __init__(self):
        self.defaults = {
            'PAGE_SIZE': 20,
            'MAX_PAGE_SIZE': 100,
            'DEFAULT_RENDERERS': ['json', 'xml']
        }
        self.user_settings = {'PAGE_SIZE': 15}  # 用户自定义
        self._cache = {}
    
    def __getattr__(self, name):
        if name not in self.defaults:
            raise AttributeError(f"无效配置: {name}")
        
        # 优先使用用户设置，否则使用默认值
        value = self.user_settings.get(name, self.defaults[name])
        
        # 缓存结果
        self._cache[name] = value
        setattr(self, name, value)  # 设置为实例属性，避免下次调用 __getattr__
        
        return value

settings = APISettings()
print(settings.PAGE_SIZE)        # 第一次访问，触发 __getattr__
print(settings.PAGE_SIZE)        # 第二次访问，直接返回实例属性
```

## 4. 实际应用案例

### 4.1 Django REST Framework 配置系统

```python
# 模拟 DRF 的 APISettings
class DRFSettings:
    DEFAULTS = {
        'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
        'DEFAULT_AUTHENTICATION_CLASSES': [
            'rest_framework.authentication.SessionAuthentication',
            'rest_framework.authentication.BasicAuthentication'
        ],
        'PAGE_SIZE': 20
    }
    
    def __init__(self, user_settings=None):
        self.user_settings = user_settings or {}
        self._import_strings = ['DEFAULT_PAGINATION_CLASS', 'DEFAULT_AUTHENTICATION_CLASSES']
    
    def __getattr__(self, name):
        if name not in self.DEFAULTS:
            raise AttributeError(f"Invalid setting: '{name}'")
        
        # 获取值
        if name in self.user_settings:
            val = self.user_settings[name]
        else:
            val = self.DEFAULTS[name]
        
        # 处理需要导入的字符串
        if name in self._import_strings:
            val = self._perform_import(val)
        
        # 缓存
        setattr(self, name, val)
        return val
    
    def _perform_import(self, val):
        # 简化的导入逻辑
        if isinstance(val, str):
            return f"导入: {val}"
        elif isinstance(val, (list, tuple)):
            return [f"导入: {item}" for item in val]
        return val

# 使用示例
api_settings = DRFSettings({'PAGE_SIZE': 25})
print(api_settings.PAGE_SIZE)  # 输出: 25
print(api_settings.DEFAULT_PAGINATION_CLASS)  # 输出: 导入: rest_framework.pagination.PageNumberPagination
```

### 4.2 惰性计算属性

```python
class LazyObject:
    def __init__(self):
        self._calculated = False
        self._value = None
    
    def __getattr__(self, name):
        if name == 'expensive_data':
            if not self._calculated:
                print("执行昂贵的计算...")
                self._value = self._calculate_expensive_data()
                self._calculated = True
            return self._value
        raise AttributeError(f"没有属性 '{name}'")
    
    def _calculate_expensive_data(self):
        # 模拟耗时操作
        import time
        time.sleep(1)
        return "计算结果"

obj = LazyObject()
print("第一次访问:")
print(obj.expensive_data)  # 触发计算
print("第二次访问:")
print(obj.expensive_data)  # 直接返回缓存结果
```

## 5. 最佳实践和注意事项

### 5.1 必须抛出 AttributeError

```python
class CorrectExample:
    def __getattr__(self, name):
        if name in self._valid_attributes:
            return self._get_attribute(name)
        # 重要：对于不支持的属性必须抛出 AttributeError
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")
```

### 5.2 避免无限递归

```python
class SafeExample:
    def __init__(self):
        self._data = {}
    
    def __getattr__(self, name):
        # 使用 self.__dict__ 而不是 getattr(self, name) 来避免递归
        if name in self.__dict__:
            return self.__dict__[name]
        elif name in self._data:
            return self._data[name]
        raise AttributeError(f"没有属性 '{name}'")
```

### 5.3 性能考虑

```python
class OptimizedExample:
    def __init__(self):
        self._cache = {}
    
    def __getattr__(self, name):
        # 使用缓存避免重复计算
        if name in self._cache:
            return self._cache[name]
        
        # 计算属性值
        value = self._compute_value(name)
        self._cache[name] = value
        return value
    
    def _compute_value(self, name):
        # 复杂的计算逻辑
        pass
```

## 6. 常见陷阱

### 6.1 与 `__getattribute__` 冲突

```python
class ProblematicExample:
    def __getattribute__(self, name):
        print(f"访问属性: {name}")
        return super().__getattribute__(name)
    
    def __getattr__(self, name):
        return f"默认值: {name}"

obj = ProblematicExample()
# 这会不断递归，因为 __getattribute__ 会拦截所有属性访问
```

### 6.2 解决方案

```python
class SafeGetAttribute:
    def __getattribute__(self, name):
        # 使用 object.__getattribute__ 避免递归
        try:
            return object.__getattribute__(self, name)
        except AttributeError:
            # 触发 __getattr__
            return self.__getattr__(name)
    
    def __getattr__(self, name):
        return f"默认值: {name}"
```

## 7. 总结

`__getattr__` 是一个强大的工具，主要用于：

- ✅ 动态属性处理
- ✅ 代理和委托模式
- ✅ 向后兼容性
- ✅ 惰性加载和计算
- ✅ 配置管理系统

- 只在访问不存在的属性时触发
- 必须对无效属性抛出 `AttributeError`
- 注意避免无限递归
- 合理使用缓存提高性能

