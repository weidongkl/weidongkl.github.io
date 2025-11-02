---
sidebar_position: 2
---

# Django + DRF 开发进阶

## 1. 分页与统一响应

### 1.1 自定义分页类

```python
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
````

---

## 2. 统一响应结构

在 `utils/response.py` 中定义：

```python
from rest_framework.response import Response

def success(data=None, message="success"):
    return Response({"code": 0, "message": message, "data": data})

def fail(message="error", code=1):
    return Response({"code": code, "message": message})
```

---

## 3. 自动生成 API 文档

### 3.1 使用 drf-spectacular

在 `settings.py` 中配置：

```python
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}
SPECTACULAR_SETTINGS = {
    "TITLE": "Demo API",
    "DESCRIPTION": "Django + DRF 接口文档",
    "VERSION": "1.0.0",
}
```

在 `urls.py` 中添加：

```python
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns += [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
]
```

访问：

```
http://127.0.0.1:8000/api/docs/
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

