# Django + DRF 基础

## 1. 基础介绍

### 1.1 Django 简介

- 一个高级 Python Web 框架，遵循 **MTV 模式（Model-Template-View）**。
- 提供 ORM、路由、模板、认证系统、后台管理等功能。
- 适合快速开发，尤其是后台管理系统和 API。

### 1.2 Django REST framework (DRF) 简介

- Django 的第三方库，用于快速开发 **RESTful API**。
- 特点：
  - 序列化（Serializers）
  - 认证与权限（Authentication & Permissions）
  - 分页（Pagination）
  - 过滤与搜索
  - 浏览器可视化 API

## 2. 环境搭建

### 2.1 安装

```bash
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework
pip install drf-yasg # 文档，可不安装
pip install drf-spectacular # 文档，可不安装
pip install djangorestframework-simplejwt # 认证
```

### 2.2 创建项目

```bash
django-admin startproject myproject
cd myproject
python manage.py startapp demo
```

注册应用：

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'demo',
]
```

## 3. 模型定义

### 3.1 常用字段

| 字段类型                            | 说明         | 常用场景                     | 示例                                                        |
| :---------------------------------- | :----------- | :--------------------------- | :---------------------------------------------------------- |
| **`CharField(max_length=...)`**     | 字符串字段   | 短文本数据（标题、名称等）   | `title = CharField(max_length=100)`                         |
| **`TextField`**                     | 长文本字段   | 文章内容、详细描述等大段文本 | `content = TextField()`                                     |
| **`IntegerField`**                  | 整数字段     | 数量、年龄、评分等整数值     | `age = IntegerField()`                                      |
| **`BooleanField`**                  | 布尔值字段   | 是否启用、是否完成等二值状态 | `is_active = BooleanField(default=True)`                    |
| **`DateTimeField`**                 | 日期时间字段 | 创建时间、更新时间等时间戳   | `created_at = DateTimeField(auto_now_add=True)`             |
| **`ForeignKey`**                    | 外键关联     | 一对多关系（如用户与文章）   | `author = ForeignKey(User, on_delete=models.CASCADE)`       |
| **`ManyToManyField`**               | 多对多关联   | 多对多关系（如文章与标签）   | `tags = ManyToManyField(Tag)`                               |
| **`choices` + `get_xxx_display()`** | 枚举选择字段 | 状态、类型等有限选项字段     | `status = CharField(max_length=10, choices=STATUS_CHOICES)` |

#### 3.1.1 字段通用参数

| 参数               | 类型   | 说明                                 | 适用字段                          | 示例                             |
| :----------------- | :----- | :----------------------------------- | :-------------------------------- | :------------------------------- |
| **`max_length`**   | `int`  | **最大长度限制**（必填）             | `CharField`及基于它的字段         | `max_length=100`                 |
| **`verbose_name`** | `str`  | **字段显示名称**（用于Admin和表单）  | 所有字段                          | `verbose_name="用户姓名"`        |
| **`unique`**       | `bool` | **唯一性约束**（不允许重复值）       | 所有字段                          | `unique=True`                    |
| **`blank`**        | `bool` | **表单验证**层面是否允许为空         | 所有字段                          | `blank=True`（表单可选）         |
| **`null`**         | `bool` | **数据库**层面是否允许存储`NULL`值   | 除`CharField`/`TextField`外的字段 | `null=True`（数据库可空）        |
| **`help_text`**    | `str`  | **帮助文本**（在表单中显示提示信息） | 所有字段                          | `help_text="请输入您的邮箱地址"` |
| **`default`**      | `any`  | **默认值**（创建记录时的初始值）     | 所有字段                          | `default=0`, `default=""`        |
| **`choices`**      | `list` | **枚举选项**（限制字段可选值范围）   | `CharField`, `IntegerField`等     | `choices=GENDER_CHOICES`         |

#### 3.1.2 重点参数详解

### `blank` vs `null` 区别
- **`blank=True`**：表单验证时允许为空（前端可选）。如果你不填写，Django 会存储一个**空字符串** (`''`)，而不是 `NULL`。
- **`null=True`**：数据库允许存储`NULL`值（数据库可空）
- **最佳实践**：
  - 对于`CharField`/`TextField`：通常只设置`blank=True`（存储空字符串而非`NULL`）
  - 同时设置 `blank=True` 和 `null=True` (对于非字符串字段或 `ForeignKey`)。表示一个“未知”或“未设置”的状态，并且该状态不是空字符串时，使用这个组合

###  `DateTimeField` 时间参数
- **`auto_now_add=True`**：只在**创建时**自动设置为当前时间
- **`auto_now=True`**：每次**保存时**自动更新为当前时间
- **注意**：两者互斥，通常用于`created_at`和`updated_at`字段

###  `ForeignKey` 外键参数
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

###  `choices` 枚举字段用法
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

### 3.2 Demo 示例

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

    def __str__(self):
        return self.name

# 项目表（多对一：一个项目属于一个用户）
class ProjectDemo(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(UserDemo, on_delete=models.CASCADE, related_name="projects")

    def __str__(self):
        return self.name

# 任务表（多对多：一个任务可以关联多个用户）
class TaskDemo(models.Model):
    title = models.CharField(max_length=100)
    project = models.ForeignKey(ProjectDemo, on_delete=models.CASCADE, related_name="tasks")
    assignees = models.ManyToManyField(UserDemo, related_name="tasks")

    def __str__(self):
        return self.title
```

迁移数据库：

```bash
python manage.py makemigrations
python manage.py migrate
```

## 4. 序列化器

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
        read_only_fields = ["id"] # 
```

> 1. **序列化（输出，如 GET 请求）**： read_only字段会**正常显示**在输出的 JSON 数据中。
>
> 2. **反序列化（输入，如 POST/PUT/PATCH 请求）**：这些字段会**被忽略**
> 3. 对于**模型本身存在的字段**（如 `id`, ），使用 `Meta.read_only_fields` 来设置为只读更加简洁。对于你**自己添加的、模型中不存在的序列化器字段**（如 `project_name`, `assignees_detail`），你必须在声明该字段时使用 `read_only=True`，因为它们对序列化器来说是“新”的，`read_only_fields` 列表不认识它们。

## 5. 视图 & 路由

### 5.1 视图

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

### 5.2 路由

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



## 6. API 示例效果

### 6.1 创建用户

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

### 6.2 创建项目（多对一）

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

### 6.3 创建任务（多对多 + 外键）

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

### 6.4 查询项目（一对多）

```http
GET /api/projects/1/
```

返回：

```json
{
  "id": 1,
  "name": "Demo Project",
  "owner": 1,
  "owner_name": "Alice",
  "tasks": ["First Task"]
}
```

## 7. 进阶用法

### 7.1 分页定制

#### 7.1.1 默认分页

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

#### 7.1.2 自定义分页

```python
demo/pagination.py
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 5
    page_query_param = "current"
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "code": 0,
            "message": "success",
            "data": {
                "total": self.page.paginator.count,
                "page": self.page.number,
                "page_size": self.page_size,
                "list": data
            }
        })
```

在 `settings.py` 配置：

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'demo.pagination.CustomPageNumberPagination',
}
```

### 7.2 自定义统一响应结构

#### 7.2.1 自定义 Response 封装

```python
demo/utils/response.py
from rest_framework.response import Response

def success_response(data=None, message="success", code=0):
    return Response({
        "code": code,
        "message": message,
        "data": data
    })

def error_response(message="error", code=1):
    return Response({
        "code": code,
        "message": message,
        "data": None
    })
```

#### 7.2.2 全局统一（Renderer）

```python
demo/utils/renderer.py
from rest_framework.renderers import JSONRenderer

class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context["response"]
        if response.status_code >= 400:
            return super().render({
                "code": response.status_code,
                "message": data.get("detail", "error"),
                "data": None
            }, accepted_media_type, renderer_context)

        return super().render({
            "code": 0,
            "message": "success",
            "data": data
        }, accepted_media_type, renderer_context)
settings.py
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['demo.utils.renderer.CustomJSONRenderer'],
}
```

API 返回结果将统一为：

```json
{
  "code": 0,
  "message": "success",
  "data": {...}
}
```

### 7.3 自动生成 API 文档

在企业开发中，**API 文档的自动生成** 是后端开发必备能力。我们推荐两种方式：

- **drf-yasg**：成熟、常用，Swagger UI / ReDoc 支持好。
- **drf-spectacular**：基于 OpenAPI 3 标准，更现代，推荐新项目使用。

#### 7.3.1 drf-yasg 方式

**安装**

```bash
pip install drf-yasg
```

**配置**

```python
# settings.py
INSTALLED_APPS = [
    ...
    'drf_yasg',
    ...,
]
```



**配置路由**

在 `myproject/urls.py` 增加：

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from demo.views import UserDemoViewSet, ProjectDemoViewSet, TaskDemoViewSet
from rest_framework.routers import DefaultRouter

# API 路由
router = DefaultRouter()
router.register(r'users', UserDemoViewSet)
router.register(r'projects', ProjectDemoViewSet)
router.register(r'tasks', TaskDemoViewSet)

# Swagger 配置
schema_view = get_schema_view(
    openapi.Info(
        title="Demo API",
        default_version="v1",
        description="Django + DRF Demo 项目 API 文档",
        contact=openapi.Contact(email="dev@example.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    # Swagger & ReDoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name="schema-swagger-ui"),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name="schema-redoc"),
]
```

**效果**

- Swagger UI: `http://127.0.0.1:8000/swagger/`
- ReDoc: `http://127.0.0.1:8000/redoc/`

API 会根据 **ViewSet + Serializer** 自动生成。

#### 7.3.2 drf-spectacular 方式（推荐）

**安装**

```bash
pip install drf-spectacular
```

**配置**

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Demo API',
    'DESCRIPTION': 'Django + DRF Demo 项目 API 文档',
    'VERSION': '1.0.0',
}
```

**路由**

```python
myproject/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from demo.views import UserDemoViewSet, ProjectDemoViewSet, TaskDemoViewSet
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

router = DefaultRouter()
router.register(r'users', UserDemoViewSet)
router.register(r'projects', ProjectDemoViewSet)
router.register(r'tasks', TaskDemoViewSet)

urlpatterns = [
    path('api/', include(router.urls)),

    # OpenAPI schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

**效果**

- OpenAPI JSON: `http://127.0.0.1:8000/api/schema/`
- Swagger UI: `http://127.0.0.1:8000/api/schema/swagger-ui/`
- ReDoc: `http://127.0.0.1:8000/api/schema/redoc/`

**给 ViewSet 加注释**

**参数**：用 `OpenApiParameter`。

**请求体**：用 `request=Serializer`。

**响应体**：用 `responses={code: Serializer}` 或 `OpenApiResponse`。

**批量注释**： `@extend_schema_view`

- 批量方式示例

  ```python
  from django.shortcuts import render
  from .models import UserDemo, ProjectDemo, TaskDemo
  from .serializers import UserDemoSerializer, ProjectDemoSerializer, TaskDemoSerializer
  from rest_framework import viewsets
  
  # 用于生成OpenAPI schema
  from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
  
  
  @extend_schema_view(
      list=extend_schema(
          summary="获取用户列表",
          parameters=[
              OpenApiParameter(name="q", description="搜索关键字", required=False, type=str),
          ],
          responses={200: UserDemoSerializer(many=True)},
      ),     
      retrieve=extend_schema(
          summary="获取单个用户",
          responses={
              200: OpenApiResponse(UserDemoSerializer, description="成功返回用户"),
              404: OpenApiResponse(description="用户不存在"),
          },
      ),
      create=extend_schema(
          summary="创建新用户",
          request=UserDemoSerializer,
          responses={201: UserDemoSerializer},
      ),    update=extend_schema(summary="更新用户"),
      destroy=extend_schema(summary="删除用户"),
  )
  
  
  class UserDemoViewSet(viewsets.ModelViewSet):
      queryset = UserDemo.objects.all()
      serializer_class = UserDemoSerializer
  ```

- 单独的action示例

  ```python
  from django.shortcuts import render
  from .models import UserDemo, ProjectDemo, TaskDemo
  from .serializers import UserDemoSerializer, ProjectDemoSerializer, TaskDemoSerializer
  from rest_framework import viewsets
  
  # 用于生成OpenAPI schema
  from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiParameter, OpenApiResponse
  
  class UserDemoViewSet(viewsets.ModelViewSet):
      queryset = UserDemo.objects.all()
      serializer_class = UserDemoSerializer
      @extend_schema(
          parameters=[
              OpenApiParameter(name="active", description="是否激活用户", required=False, type=bool),
          ],
          responses={200: UserDemoSerializer(many=True)},
      )
      def list(self, request, *args, **kwargs):
          return super().list(request, *args, **kwargs)
  
      @extend_schema(
      responses={
          200: OpenApiResponse(
              response=UserDemoSerializer,
              description="成功返回",
              examples=[
                  OpenApiExample(
                      "示例用户",
                      value={"id": 1, "username": "alice", "email": "alice@example.com"},
                  )
              ],
          )
      }
  )
      def retrieve(self, request, *args, **kwargs):
          return super().retrieve(request, *args, **kwargs)
  ```





### 7.4 过滤和搜索

**安装**

```bash
pip install django-filter
```

**配置**

```python
# settings.py
INSTALLED_APPS += ['django_filters']
```

**使用**

```python
class UserDemoViewSet(viewsets.ModelViewSet):
    queryset = UserDemo.objects.all()
    serializer_class = UserDemoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
```

### 7.5 认证和权限

#### 7.5.1 常见认证方式

- SessionAuthentication（适合后台管理）
- TokenAuthentication（适合移动端 / API）
- JWT Authentication（推荐，安全性更高）

安装 JWT：

```bash
pip install djangorestframework-simplejwt
```

配置：

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",  # 如果使用 drf-spectacular
}

```

```python
# urls.py
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
from demo.views import UserDemoViewSet, ProjectDemoViewSet, TaskDemoViewSet

router = DefaultRouter()
router.register(r'users', UserDemoViewSet)
router.register(r'projects', ProjectDemoViewSet)
router.register(r'tasks', TaskDemoViewSet)

urlpatterns = [
    path("api/", include(router.urls)),

    # JWT Token 获取 & 刷新
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

```



获取 Token：

```http
POST /api/token/
{
  "username": "admin",
  "password": "123456"
}
```

#### 7.5.2 权限控制

```python
# views.py
from rest_framework.permissions import IsAuthenticated

class BookViewSet(viewsets.ModelViewSet):
    ...
    permission_classes = [IsAuthenticated]
```

## 8. 参考资源

- Django 官方文档: https://docs.djangoproject.com/
- DRF 官方文档: https://www.django-rest-framework.org/
- JWT 扩展: https://django-rest-framework-simplejwt.readthedocs.io/
