# 多架构容器镜像构建

## 1. 背景介绍

随着 arm64 架构设备（如 Apple M 系列芯片、边缘设备）的普及，开发者需要构建同时支持 `amd64` 和 `arm64` 等多个架构的镜像。容器生态支持通过 [manifest list](https://github.com/opencontainers/image-spec/blob/main/image-index.md) 来实现多架构镜像分发。

主流工具如 `Docker` 和 `Podman` 都支持多架构构建，本文以 `buildx`（Docker） 和 `podman build` 为例说明。

------

## 2. Docker 构建多架构镜像

### 2.1 安装 `buildx` 支持

Docker 19.03+ 自带 `buildx`：

```bash
docker buildx version
```

如果未安装，使用如下命令启用：

```bash
docker run --privileged --rm tonistiigi/binfmt --install all
docker buildx create --use --name multiarch-builder
docker buildx inspect --bootstrap
```

### 2.2 构建 amd64 和 arm64 多架构镜像

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t yourrepo/yourimage:tag \
  --push .  # 如果不想推送，改为 --load
```

说明：

- `--platform`：指定目标架构
- `--push`：构建完成直接推送到镜像仓库
- `--load`：构建完成加载到本地 Docker 镜像列表（只支持单架构，需要指定架构，如： `--platform linux/arm64`）

### 2.3 示例 Dockerfile

```Dockerfile
FROM alpine:3.19
RUN echo "Hello from multi-arch build!"
```

------

### 2.4 本地构建脚本

```bash
#!/bin/bash
# 用于构建并推送多架构镜像
set -e

IMAGE_NAME=yourdockerhub/yourimage
TAG=latest

# 1. 启用 binfmt 支持（首次执行）
docker run --privileged --rm tonistiigi/binfmt --install all

# 2. 创建并使用 buildx builder（首次执行）
docker buildx create --name multiarch-builder --use || docker buildx use multiarch-builder
docker buildx inspect --bootstrap

# 3. 构建并推送多架构镜像
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${IMAGE_NAME}:${TAG} \
  --push .
```



## 3. Podman 构建多架构镜像

### 3.1 运行 `multiarch/qemu-user-static`

```bash
sudo podman run --rm --privileged multiarch/qemu-user-static --reset -p yes
sudo ls /proc/sys/fs/binfmt_misc/
```

### 3.2 使用 `buildx` 风格构建（通过 `buildah`）

```bash
sudo podman build \
  --arch arm64 \
  -t yourrepo/yourimage:arm64 \
  -f Dockerfile .
```

### 3.3 合并镜像为 Manifest List

```bash
# 构建 amd64 和 arm64 镜像
podman build --arch amd64 -t yourrepo/yourimage:amd64 .
podman build --arch arm64 -t yourrepo/yourimage:arm64 .

# 创建 manifest list
podman manifest create yourrepo/yourimage:latest
podman manifest add yourrepo/yourimage:latest yourrepo/yourimage:amd64
podman manifest add yourrepo/yourimage:latest yourrepo/yourimage:arm64

# 推送
podman manifest push --all yourrepo/yourimage:latest docker://yourrepo/yourimage:latest
```

------

## 4. 验证多架构镜像

使用 `docker manifest inspect` 或 `skopeo inspect`：

```bash
docker manifest inspect yourrepo/yourimage:latest
```

输出中包含：

```json
"platform": {
  "architecture": "amd64",
  "os": "linux"
}
```

------

## 5. 补充说明

### 5.1 多架构构建支持平台

| 工具    | 支持多架构         | 说明                  |
| ------- | ------------------ | --------------------- |
| Docker  | ✅（通过 buildx）   | 推荐使用              |
| Podman  | ✅（通过 manifest） | 适配 RHEL / openEuler |
| Buildah | ✅                  | Podman 底层依赖       |

### 5.2 常见问题

- **Q:** arm64 构建报错 `exec format error`
   **A:** 没有安装 qemu-user-static 或 binfmt 未启用
- **Q:** Docker 构建卡死
   **A:** 加上 `--progress=plain` 以调试；或者使用 `--no-cache`
- **Q:** buildx 构建失败提示无法找到 `qemu-aarch64`
   **A:** 使用 `tonistiigi/binfmt` 启用所有平台支持

------

## 6. [示例项目结构](https://github.com/weidongkl/multiarch-demo)

```text
multiarch-demo/
├── Dockerfile
├── main.go
├── build.sh        # 构建脚本（buildx/podman）
```




