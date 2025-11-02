---
sidebar_position: 1
---


# Django + DRF 开发基础

## 1. 概述与环境搭建

### 1.1 Django 简介
Django 是一个高级 Python Web 框架，遵循 **MTV 模式（Model–Template–View）**，提供 ORM、认证系统、后台管理等全套功能，适合快速构建 Web 应用与后台系统。

### 1.2 Django REST framework 简介
Django REST framework（DRF） 是 Django 的第三方扩展，用于快速开发 **RESTful API**。  
主要特性包括：
- 对象序列化与反序列化；
- 权限与认证机制；
- 分页、过滤、搜索；
- 自动生成 API 文档；
- 交互式浏览器界面。

### 1.3 环境搭建与项目初始化

```bash
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework
pip install drf-yasg # 文档，可不安装
pip install drf-spectacular # 文档，可不安装
pip install djangorestframework-simplejwt # 认证
````

初始化项目：

```bash
django-admin startproject myproject
cd myproject
python manage.py startapp demo
```

在 `settings.py` 注册应用：

```python
INSTALLED_APPS = [
    'rest_framework',
    'demo',
]
```

---

## 2. 模型层（Models）

> **目标**：掌握 Django ORM 基础与常见建模方式。

### 2.1 常用字段类型

| 字段                    | 说明   | 示例                                                         |
| ----------------------- | ------ | ------------------------------------------------------------ |
| `CharField(max_length)` | 短文本 | `title = models.CharField(max_length=100)`<br />`max_length` 是CharField的必填字段 |
| `TextField`             | 长文本 | `desc = models.TextField()`                                  |
| `IntegerField`          | 整数   | `age = models.IntegerField()`                                |
| `BooleanField`          | 布尔值 | `is_active = models.BooleanField(default=True)`              |
| `DateTimeField`         | 时间   | `created_at = models.DateTimeField(auto_now_add=True)`       |
| `ForeignKey`            | 一对多 | `author = models.ForeignKey(User, on_delete=models.CASCADE)` |
| `ManyToManyField`       | 多对多 | `tags = models.ManyToManyField(Tag)`                         |

### 2.2 参数说明

#### 2.2.1 字段通用参数

| 参数               | 类型   | 说明                                             | 适用字段                          | 示例                      |
| :----------------- | :----- | :----------------------------------------------- | :-------------------------------- | :------------------------ |
| **`max_length`**   | `int`  | **最大长度限制**（**必填**）                     | `CharField`及基于它的字段         | `max_length=100`          |
| **`verbose_name`** | `str`  | **字段显示名称**（用于Admin和表单）              | 所有字段                          | `verbose_name="用户姓名"` |
| **`unique`**       | `bool` | **唯一性约束**（不允许重复值）                   | 所有字段                          | `unique=True`             |
| **`blank`**        | `bool` | **表单验证**层面是否允许为空                     | 所有字段                          | `blank=True`（表单可选）  |
| **`null`**         | `bool` | **数据库**层面是否允许存储`NULL`值               | 除`CharField`/`TextField`外的字段 | `null=True`（数据库可空） |
| **`help_text`**    | `str`  | **帮助文本**（在表单中显示提示信息）字段通用参数 |                                   |                           |
| **`default`**      | `any`  | 参数                                             | 类型                              | 说明                      |
| **`choices`**      | `list` | **枚举选项**（限制字段可选值范围）               | `CharField`, `IntegerField`等     | `choices=GENDER_CHOICES`  |

#### 2.2.2  重点参数说明

**`blank` vs `null` 区别**

- **`blank=True`**：表单验证时允许为空（前端可选）。如果你不填写，Django 会存储一个**空字符串** (`''`)，而不是 `NULL`。
- **`null=True`**：数据库允许存储`NULL`值（数据库可空）
- **最佳实践**：
  - 对于`CharField`/`TextField`：通常只设置`blank=True`（存储空字符串而非`NULL`,default=""）。也可以增加null=True,此时当你写入None 或者不写入数据，它的值都是None。
  - 同时设置 `blank=True` 和 `null=True` (对于非字符串字段或 `ForeignKey`)。表示一个“未知”或“未设置”的状态，并且该状态不是空字符串时，使用这个组合

**`DateTimeField` 时间参数**

- **`auto_now_add=True`**：只在**创建时**自动设置为当前时间
- **`auto_now=True`**：每次**保存时**自动更新为当前时间
- **注意**：两者互斥，通常用于`created_at`和`updated_at`字段

**`ForeignKey` 外键参数**

- **`on_delete`**（必填）：删除关联对象时的行为

  - `CASCADE`：级联删除
  - `PROTECT`：保护模式（阻止删除）
  - `SET_NULL`：设置为`NULL`（需设置`null=True`）
  - `SET_DEFAULT`：设置为默认值

- **`related_name`**：反向查询名称

  ```python
  # 定义
  author = ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
  
  # 使用：通过用户获取所有文章
  user.articles.all()
  ```

**`choices` 枚举字段用法**

```python
class Article(models.Model):
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('published', '已发布'),
        ('archived', '已归档'),
    ]
    
    status = CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

# 模板中使用 get_xxx_display() 获取显示值
# {{ article.get_status_display }}
```

> 使用建议
>
> 1. **字符串字段**优先使用`CharField`，大段文本使用`TextField`
> 2. **外键字段**必须指定`on_delete`参数
> 3. **时间字段**合理使用`auto_now_add`和`auto_now`
> 4. **枚举字段**使用`choices`提高数据一致性
> 5. 始终为字段设置恰当的`verbose_name`和`help_text`提升可维护性

### 2.3 示例模型：用户-项目-任务

在 Demo 中，我们设计三个表：

- **用户 UserDemo**
- **项目 ProjectDemo**（多对一 → 用户）
- **任务 TaskDemo**（多对一 → 项目，多对多 → 用户）

```python
# demo/models.py
from django.db import models

# 用户表
class UserDemo(models.Model):
    name = models.CharField(max_length=50)
    
# 项目表（多对一：一个项目属于一个用户）
class ProjectDemo(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(UserDemo, on_delete=models.CASCADE, related_name="projects")

# 任务表（多对多：一个任务可以关联多个用户）
class TaskDemo(models.Model):
    title = models.CharField(max_length=100)
    project = models.ForeignKey(ProjectDemo, on_delete=models.CASCADE, related_name="tasks")
    assignees = models.ManyToManyField(UserDemo, related_name="tasks") # Userdemo instance 可以通过user.tasks.all()获取用户关联的所有TaskDemo
    assignees_no_related_name = models.ManyToManyField(UserDemo) # Userdemo instance 可以通过user.taskdemo_set.all()获取用户关联的所有TaskDemo。`模型名称的小写`+`_set`
```

数据库迁移：

```bash
python manage.py makemigrations && python manage.py migrate
```

---

## 3. 序列化层（Serializers）

> **目标**：掌握对象与 JSON 间的序列化与反序列化。

### 3.1 示例

```python
# demo/serializers.py
from rest_framework import serializers
from .models import UserDemo, ProjectDemo, TaskDemo

# 用户序列化
class UserDemoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDemo
        fields = ["id", "name"]

# 项目序列化（多对一 + 一对多）
class ProjectDemoSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.name", read_only=True)
    tasks = serializers.StringRelatedField(many=True, read_only=True)  # 一对多展示任务

    class Meta:
        model = ProjectDemo
        fields = ["id", "name", "owner", "owner_name", "tasks"]

# 任务序列化（多对多 + 外键）
class TaskDemoSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    assignees_detail = UserDemoSerializer(source="assignees", many=True, read_only=True)
    another_name = serializers.CharField(source='title', read_only=True, help_text="演示字段重命名")

    class Meta:
        model = TaskDemo
        fields = ["id", "title", "project", "project_name","another_name", "assignees", "assignees_detail"]
        read_only_fields = ["id"] # 只能添加模型中存在的字段。序列化中，类变量添加的字段，如project_name等，它不识别。
```



### 3.2 基础用法

```python
class ProjectDemoSerializer(serializers.ModelSerializer):
    # read_only 会在序列化中显示到json中，它不影响反序列化。例如post，put请求会忽略readonly字段
    owner_name = serializers.CharField(source="owner.name", read_only=True)

    class Meta:
        model = ProjectDemo
        fields = ["id", "name", "owner", "owner_name"]
```

### 3.3 嵌套与方法字段

```python
class TaskDemoSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    assignee_names = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = TaskDemo
        fields = ["id", "title", "project", "project_name", "assignee_names"]
```

### 3.4 反序列化与验证

```python
class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskDemo
        fields = ["title", "project", "assignees"]

    def validate_title(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("标题长度需大于 3 个字符")
        return value
```

---

## 4. 视图层与路由（Views & URLs）

### 4.1 ViewSet 快速开发

```python
# demo/views.py
from rest_framework import viewsets
from .models import UserDemo, ProjectDemo, TaskDemo
from .serializers import UserDemoSerializer, ProjectDemoSerializer, TaskDemoSerializer

class UserDemoViewSet(viewsets.ModelViewSet):
    queryset = UserDemo.objects.all()
    serializer_class = UserDemoSerializer

class ProjectDemoViewSet(viewsets.ModelViewSet):
    queryset = ProjectDemo.objects.all()
    serializer_class = ProjectDemoSerializer

class TaskDemoViewSet(viewsets.ModelViewSet):
    queryset = TaskDemo.objects.all()
    serializer_class = TaskDemoSerializer
```

### 4.2 路由注册

```python
# myproject/urls.py 
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from demo.views import UserDemoViewSet, ProjectDemoViewSet, TaskDemoViewSet

router = DefaultRouter()
router.register(r'users', UserDemoViewSet)
router.register(r'projects', ProjectDemoViewSet)
router.register(r'tasks', TaskDemoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
```

---

## 5. 测试与验证

### 5.1 启动服务：

```bash
python manage.py runserver
```

### 5.2 访问：

* `http://127.0.0.1:8000/api/`
* 可通过 DRF 自带浏览器界面进行增删改查。

### 5.3  API 使用

#### 5.3.1 创建用户

```http
POST /api/users/
{
  "name": "Alice"
}
```

返回：

```json
{
  "id": 1,
  "name": "Alice"
}
```

#### 5.3.2 创建项目（多对一）

```http
POST /api/projects/
{
  "name": "Demo Project",
  "owner": 1
}
```

返回：

```json
{
  "id": 1,
  "name": "Demo Project",
  "owner": 1,
  "owner_name": "Alice",
  "tasks": []
}
```

#### 5.3.3 创建任务（多对多 + 外键）

```http
POST /api/tasks/
{
  "title": "First Task",
  "project": 1,
  "assignees": [1]
}
```

返回：

```json
{
  "id": 1,
  "title": "First Task",
  "project": 1,
  "project_name": "Demo Project",
  "assignees": [1],
  "assignees_detail": [
    {"id": 1, "name": "Alice"}
  ]
}
```

#### 5.3.4 查询项目（一对多）

```http
GET /api/projects/1/
```

返回：

```json
{
  "id": 1,
  "name": "Demo Project",---
sidebar_position: 2
---

  "owner": 1,
  "owner_name": "Alice",
  "tasks": ["First Task"]
}
```

---

## 6. 附录：常用命令

| 操作    | 命令                                                            |
| ----- | ------------------------------------------------------------- |
| 创建项目  | `django-admin startproject demo`                              |
| 创建应用  | `python manage.py startapp app`                               |
| 数据迁移  | `python manage.py makemigrations && python manage.py migrate` |
| 创建管理员 | `python manage.py createsuperuser`                            |
| 启动服务  | `python manage.py runserver`                                  |

