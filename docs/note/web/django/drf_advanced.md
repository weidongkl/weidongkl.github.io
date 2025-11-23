---
sidebar_position: 2
---

# Django + DRF 开发进阶

## 1. 分页

### 1.1 默认分页

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

### 1.2 自定义分页类

```python
# lib/pagination.py
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_query_param = "page"
    page_size_query_param = "page_size"

    def get_paginated_response(self, data):
        return Response({
            "code": 0,
            "message": "success",
            "data": {
                "total": self.page.paginator.count,
                "page": self.page.number,
                "list": data,
            },
        })
    # 影响api文档显示。不加下面方法，生成的api文档，依旧是老格式。
    def get_paginated_response_schema(self, schema):
        return {
            'type': 'object',
            'properties': {
                'code': {
                    'type': 'integer',
                    'example': 0
                },
                'message': {
                    'type': 'string', 
                    'example': 'success'
                },
                'data': {
                    'type': 'object',
                    'properties': {
                        'total': {
                            'type': 'integer',
                            'example': 100
                        },
                        'page': {
                            'type': 'integer', 
                            'example': 1
                        },
                        'list': schema
                    }
                }
            }
        }
````
在 `settings.py` 配置：

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'demo.pagination.CustomPageNumberPagination',
}
```

---

## 2. 统一响应结构

```python
# lib/response.py
from rest_framework.response import Response

def success(data=None, message="success"):
    return Response({"code": 0, "message": message, "data": data})

def fail(message="error", code=1):
    return Response({"code": code, "message": message})
```

---

## 3. 自动生成 API 文档

django 通常有以下两种api文档生成库。

- **drf-yasg**：成熟、常用，Swagger UI / ReDoc 支持好。
- **drf-spectacular**：基于 OpenAPI 3 标准，更现代，推荐新项目使用。

### 3.1 drf-yasg 方式

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

### 3.2 drf-spectacular 方式

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
# myproject/urls.py
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

---

## 4. 过滤与搜索

### 4.1 内置过滤器

```python
from rest_framework import filters

class ProjectDemoViewSet(viewsets.ModelViewSet):
    queryset = ProjectDemo.objects.all()
    serializer_class = ProjectDemoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["id"]
```

访问示例：

```
/api/projects/?search=test&ordering=-id
```

---

## 5. 认证与权限控制

### 5.1 JWT 认证

安装：

```bash
pip install djangorestframework-simplejwt
```

配置：

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
        #'rest_framework.permissions.AllowAny',  
        # 如果不配置DEFAULT_PERMISSION_CLASSES
        # 就使用默认的AllowAny。未认证的用户就是AnonymousUser
    ),   
}
```

路由：

```python
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns += [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

---

### 5.2 自定义权限

```python
from rest_framework import permissions

class IsProjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
```

应用到 ViewSet：

```python
class ProjectDemoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsProjectOwner]
```

---

## 6. 中间件与性能优化

### 6.1 自定义请求日志中间件

```python
class RequestLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        import time
        start = time.time()
        response = self.get_response(request)
        duration = time.time() - start
        print(f"{request.method} {request.path} 用时 {duration:.2f}s")
        return response
```

---

### 6.2 缓存与优化建议

| 场景     | 推荐方案                                     |
| ------ | ---------------------------------------- |
| 接口重复查询 | `django-redis` 缓存                        |
| 模型查询优化 | 使用 `select_related` / `prefetch_related` |
| 静态资源加速 | 使用 `whitenoise` 或 CDN                    |

---

## 7. 附录：最佳实践清单

* **模型层**

  * 外键始终指定 `on_delete`
  * 枚举字段使用 `choices`
* **序列化层**

  * 输出逻辑 → `to_representation`
  * 动态字段 → 自定义 `__init__`
* **接口层**

  * 返回格式统一 `{ code, message, data }`
  * 分页参数命名建议：`page`, `page_size`
* **安全**

  * 使用 JWT 认证
  * DEBUG=False 时设置 `ALLOWED_HOSTS`
* **日志与调试**

  * 启用请求日志中间件
  * 使用 `drf-spectacular` 自动文档

