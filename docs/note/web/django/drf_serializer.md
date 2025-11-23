---
sidebar_position: 3
---

# drf Serializer

## 1. Serializer 基础概念

### 1.1 什么是 Serializer？
- **序列化**: 将复杂数据类型（如 QuerySet, Model 实例）转换为 Python 原生数据类型，进而转换为 JSON/XML
- **反序列化**: 将接收的数据（如 JSON）转换为复杂数据类型，并验证数据有效性

### 1.2 主要作用
- 数据验证
- 数据转换
- 数据清洗

## 2. Serializer vs ModelSerializer

### 2.1 核心区别

| 特性 | `serializers.Serializer` | `serializers.ModelSerializer` |
|------|--------------------------|-------------------------------|
| **本质** | 基础序列化器类 | `Serializer` 的子类，高级抽象 |
| **模型关联** | 不强制关联模型 | 强关联 Django Model |
| **字段定义** | 必须手动定义每个字段 | 自动从模型生成字段 |
| **CRUD 方法** | 必须手动实现 `create()` 和 `update()` | 自动提供默认实现 |
| **代码量** | 较多，更繁琐 | 较少，更简洁 |
| **灵活性** | 高，可处理任意数据结构 | 相对较低，主要用于模型操作 |

### 2.2 代码示例对比

#### 使用 Serializer（手动方式）
```python
from rest_framework import serializers

class BookSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=100)
    author = serializers.CharField(max_length=50)
    published_date = serializers.DateField()
    isbn = serializers.CharField(max_length=13)
    
    def create(self, validated_data):
        return Book.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.author = validated_data.get('author', instance.author)
        instance.published_date = validated_data.get('published_date', instance.published_date)
        instance.isbn = validated_data.get('isbn', instance.isbn)
        instance.save()
        return instance
```

#### 使用 ModelSerializer（自动方式）
```python
class BookModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'published_date', 'isbn']
        # fields = '__all__'  # 包含所有字段
        
    # create() 和 update() 方法默认已实现！
```

## 3. 常用序列化字段类型

### 3.1 核心字段类型
```python
# 基本字段
CharField(max_length=None)           # 字符串
IntegerField()                       # 整数
FloatField()                         # 浮点数
BooleanField()                       # 布尔值
DateField()                          # 日期
DateTimeField()                      # 日期时间
EmailField()                         # 邮箱
URLField()                           # URL

# 关系字段
PrimaryKeyRelatedField()            # 主键关系
StringRelatedField()                # 字符串表示关系
SlugRelatedField()                  # slug 字段关系

# 特殊字段
SerializerMethodField()             # 自定义方法字段
ListField()                         # 列表字段
DictField()                         # 字典字段
```

### 3.2 字段参数
```python
# 常用参数
required=True/False                 # 是否必填
read_only=True/False               # 只读字段
write_only=True/False              # 只写字段
default=value                      # 默认值
allow_null=True/False              # 允许为空
validators=[]                      # 验证器
max_length=None                    # 最大长度
min_length=None                    # 最小长度
```

## 4. ModelSerializer 高级用法

### 4.1 Meta 类配置
```python
class BookModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'published_date']  # 包含字段
        exclude = ['created_at']     # 排除字段
        read_only_fields = ['id']    # 只读字段
        depth = 1                    # 嵌套深度
        
        # 字段级额外参数
        extra_kwargs = {
            'title': {'max_length': 200},
            'isbn': {'read_only': True}
        }
```

### 4.2 自定义字段和方法
```python
class BookModelSerializer(serializers.ModelSerializer):
    # 添加额外字段
    days_since_published = serializers.SerializerMethodField()
    author_uppercase = serializers.SerializerMethodField()
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'published_date', 
                 'days_since_published', 'author_uppercase']
    
    def get_days_since_published(self, obj):
        """计算出版至今的天数"""
        from django.utils.timezone import now
        if obj.published_date:
            return (now().date() - obj.published_date).days
        return None
    
    def get_author_uppercase(self, obj):
        """作者名大写"""
        return obj.author.upper() if obj.author else None
    
    def validate_title(self, value):
        """自定义标题验证"""
        if 'test' in value.lower():
            raise serializers.ValidationError("标题不能包含'test'")
        return value
    
    def validate(self, data):
        """对象级验证"""
        if data['published_date'] > timezone.now().date():
            raise serializers.ValidationError("出版日期不能是未来")
        return data
```

## 5. 序列化器在视图中的使用

### 5.1 在 APIView 中使用
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class BookListAPIView(APIView):
    def get(self, request):
        books = Book.objects.all()
        serializer = BookModelSerializer(books, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = BookModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 5.2 在 ViewSet 中使用
```python
from rest_framework import viewsets

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookModelSerializer
    
    def get_serializer_class(self):
        # 根据不同动作使用不同序列化器
        if self.action == 'list':
            return BookListSerializer
        elif self.action == 'create':
            return BookCreateSerializer
        return BookModelSerializer
```

## 6. 嵌套序列化器

### 6.1 一对多关系
```python
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'email']

class BookWithAuthorSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)  # 嵌套序列化
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'published_date']
```

### 6.2 多对多关系
```python
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class BookWithCategoriesSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'categories']
```

## 7. 验证和错误处理

### 7.1 验证方法
```python
class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'
    
    # 字段级验证
    def validate_title(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("标题太短")
        return value
    
    # 对象级验证
    def validate(self, data):
        if data['published_date'] > timezone.now().date():
            raise serializers.ValidationError({
                'published_date': '出版日期不能是未来'
            })
        return data
```

### 7.2 自定义验证器
```python
def validate_isbn(value):
    """自定义 ISBN 验证器"""
    if len(value) not in [10, 13]:
        raise serializers.ValidationError("ISBN 必须是10或13位")
    return value

class BookSerializer(serializers.ModelSerializer):
    isbn = serializers.CharField(validators=[validate_isbn])
    
    class Meta:
        model = Book
        fields = '__all__'
```

## 8. 性能优化技巧

### 8.1 选择相关字段
```python
# 避免 N+1 查询问题
class OptimizedBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author_name']
        depth = 0  # 避免深度嵌套
    
# 在视图中使用 select_related 和 prefetch_related
class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('author').prefetch_related('categories')
    serializer_class = OptimizedBookSerializer
```

### 8.2 序列化器继承
```python
# 基础序列化器
class BaseBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title']

# 详细序列化器
class DetailedBookSerializer(BaseBookSerializer):
    author_info = serializers.SerializerMethodField()
    
    class Meta(BaseBookSerializer.Meta):
        fields = BaseBookSerializer.Meta.fields + ['author_info', 'published_date']
```

## 9. 最佳实践

### 9.1 选择指南
- **使用 ModelSerializer**: 标准的模型 CRUD 操作，快速开发
- **使用 Serializer**: 
  - 非模型数据源
  - 需要复杂自定义逻辑
  - 数据来自多个模型或外部 API

### 9.2 代码组织
```python
# serializers.py 文件结构建议
class BaseSerializer(serializers.ModelSerializer):
    """基础序列化器，包含通用功能"""
    pass

class ListSerializer(BaseSerializer):
    """列表页使用的简化序列化器"""
    pass

class DetailSerializer(BaseSerializer):
    """详情页使用的详细序列化器"""
    pass

class CreateUpdateSerializer(BaseSerializer):
    """创建/更新使用的序列化器"""
    pass
```

---

**总结**: ModelSerializer 提供了快速开发的便利，而基础的 Serializer 提供了最大的灵活性。根据具体需求选择合适的工具，在大多数标准 CRUD 场景下，ModelSerializer 是最佳选择。

