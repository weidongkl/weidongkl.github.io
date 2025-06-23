# Docker 镜像信息管理

## 1. 查看本地镜像列表

```bash
docker images
```

示例输出：

```
REPOSITORY   TAG      IMAGE ID       CREATED        SIZE
ubuntu       20.04    d13c942271d6   2 weeks ago    72.9MB
nginx        latest   2bdc49f2f8d1   3 weeks ago    133MB
```

常用参数：

- `-a, --all`：显示所有镜像（包括中间层）
- `-q, --quiet`：仅显示镜像 ID
- `--no-trunc`：显示完整镜像 ID

------

## 2. 查看镜像详细信息

```bash
docker inspect <镜像名或镜像ID>
```

示例：

```bash
docker inspect ubuntu:20.04
```

------

## 3. 查看镜像历史记录

```bash
docker history <镜像名或镜像ID>
```

------

## 4. 查看镜像标签（tag）

```bash
docker image ls --filter=reference='<镜像名>*'
```

示例：

```bash
docker image ls --filter=reference='ubuntu*'
```

------

## 5. 查询远程仓库中的镜像

```bash
docker search <镜像名>
```

示例：

```bash
docker search nginx
```

------

## 6. 查看镜像分层信息

```bash
docker image inspect --format='{{.RootFS.Layers}}' <镜像名或镜像ID>
```

------

## 7. 查看镜像构建历史（Dockerfile）

```bash
docker image history --no-trunc <镜像名或镜像ID>
```

------

## 8. 镜像过滤查询用法

- 按名称过滤：

  ```bash
  docker images --filter=reference='*nginx*'
  ```

- 按时间过滤：

  ```bash
  docker images --filter "before=ubuntu:20.04"
  docker images --filter "since=ubuntu:20.04"
  ```

- 按标签过滤：

  ```bash
  docker images --filter "label=maintainer=john"
  ```

- 显示悬空（dangling）镜像：

  ```bash
  docker images -f "dangling=true"
  ```

------

## 9. 格式化输出镜像信息

- 自定义格式：

  ```bash
  docker images --format "{{.ID}}: {{.Repository}}"
  ```

- 表格形式展示：

  ```bash
  docker images --format "table {{.ID}}\t{{.Repository}}\t{{.Tag}}"
  ```

------

## 10. 查看镜像及容器空间占用

```bash
docker system df -v
```

------

## 11. 实用技巧与清理命令

- 获取完整镜像 ID：

  ```bash
  docker images --no-trunc
  ```

- grep 结合使用：

  ```bash
  docker images | grep ubuntu
  ```

- 删除所有悬空镜像：

  ```bash
  docker image prune
  ```

- 删除所有未使用镜像：

  ```bash
  docker image prune -a
  ```

------

## 12. 镜像导出与导入

### 12.1 导出镜像

- 导出镜像为 tar 文件：

  ```bash
  docker save -o ubuntu.tar ubuntu:20.04
  ```

- 导出为压缩文件(推荐)：

  - 导出并 gzip 压缩：

    ```bash
    docker save ubuntu:20.04 | gzip > ubuntu.tar.gz
    ```

  - 导出并 xz 压缩（压缩率更高）：

    ```bash
    docker save ubuntu:20.04 | xz -9 > ubuntu.tar.xz
    ```

### 12.2 导入镜像

- 导入镜像到本地：

  ```bash
  docker load -i ubuntu.tar/ubuntu.tar.gz/ubuntu.tar.xz
  ```

- 从文件或标准输入导入：

  ```bash
  docker load < ubuntu.tar/ubuntu.tar.gz/ubuntu.tar.xz
  ```

------

## 13. 容器导出和导入(快照)

- 导出容器文件系统：

  ```bash
  docker export -o mycontainer.tar <容器ID或容器名>
  ```

- 导出并压缩：

  ```bash
  docker export <容器ID或容器名> | gzip > mycontainer.tar.gz
  ```

- 导入为镜像：

  ```bash
  cat mycontainer.tar | docker import - ubuntu:custom
  ```

  或：

  ```bash
  gunzip -c mycontainer.tar.gz | docker import - ubuntu:custom
  ```

> ✅ **推荐**在镜像分发或备份中使用压缩格式（`.tar.gz`, `.tar.xz`）以减少存储和传输成本。


------

## 14. OCI 镜像结构分析

Docker 镜像符合 OCI 镜像规范，其 tar 包结构如下（通过 `docker save` 导出后可查看）：

```text
ubuntu.tar/
├── manifest.json
├── repositories
├── <layer_id>/layer.tar
├── <layer_id>/VERSION
├── <layer_id>/json
└── ...
```

- `manifest.json`：描述镜像层顺序、配置文件等信息
- `repositories`：记录镜像名和标签
- `<layer_id>/layer.tar`：每一层的文件系统内容
- `<layer_id>/json`：该层的元数据（创建命令、环境变量等）
- `<layer_id>/VERSION`：版本标记（一般是"1.0"）

OCI 镜像结构核心概念：

- 多层叠加：每个 layer 是只读的增量文件系统，按顺序叠加构成完整镜像
- 镜像配置（config）与 manifest 分离，利于复用与缓存
- 与 Docker 兼容：Docker 默认使用 OCI 格式存储镜像（从 1.10 起）

查看具体结构可使用以下命令：

```bash
tar -tvf ubuntu.tar
```

解压后逐层分析：

```bash
mkdir ubuntu-img && tar -xf ubuntu.tar -C ubuntu-img
cat ubuntu-img/manifest.json | jq .
```
