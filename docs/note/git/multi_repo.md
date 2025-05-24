# 提交多个远程仓库方法

---

## 1. 添加多个远程仓库

### 1.1 查看当前远程仓库
```bash
git remote -v
```
默认情况下，你可能只看到一个 `origin`（通常是首次 `git clone` 时的仓库）。

### 1.2 添加 Gitee 和 GitHub 作为额外的远程仓库
假设：
- **GitHub 远程地址**: `git@github.com:username/repo.git`
- **Gitee 远程地址**: `git@gitee.com:username/repo.git`

#### 1.2.1 添加 Gitee 远程
```bash
git remote add gitee git@gitee.com:username/repo.git
```

#### 1.2.2 添加 GitHub 远程
```bash
git remote add github git@github.com:username/repo.git
```

### 1.3 验证远程仓库是否添加成功
```bash
git remote -v
```
输出示例：
```
origin  git@github.com:username/repo.git (fetch)
origin  git@github.com:username/repo.git (push)
gitee   git@gitee.com:username/repo.git (fetch)
gitee   git@gitee.com:username/repo.git (push)
github  git@github.com:username/repo.git (fetch)
github  git@github.com:username/repo.git (push)
```

### 1.4 推送代码到多个远程仓库
#### 1.4.1 分别推送
```bash
git push github main    # 推送到 GitHub
git push gitee main    # 推送到 Gitee
```

#### 1.4.2 一键推送（同时推送到 GitHub 和 Gitee）
```bash
git push --all github && git push --all gitee
```
或使用脚本：
```bash
#!/bin/bash
git push github main
git push gitee main
```

---

## 2. 修改 `origin` 并添加额外远程
如果你希望 `origin` 指向 Gitee，同时保留 GitHub 作为额外远程：
```bash
# 移除旧的 origin（可选）
git remote remove origin

# 添加 Gitee 作为 origin
git remote add origin git@gitee.com:username/repo.git

# 添加 GitHub 作为额外远程
git remote add github git@github.com:username/repo.git
```
然后推送：
```bash
git push origin main      # 推送到 Gitee
git push github main     # 推送到 GitHub
```

---

## 3. 使用 `git remote set-url` 添加多个推送地址
如果你希望 `git push` 默认同时推送到 **GitHub 和 Gitee**，可以修改 `origin` 的推送 URL：
```bash
git remote set-url --add --push origin git@github.com:username/repo.git
git remote set-url --add --push origin git@gitee.com:username/repo.git
```
验证：
```bash
git remote -v
```
输出示例：
```
origin  git@github.com:username/repo.git (fetch)
origin  git@github.com:username/repo.git (push)
origin  git@gitee.com:username/repo.git (push)  # 额外推送地址
```
这样，执行 `git push origin main` 时会同时推送到 **GitHub 和 Gitee**。

---

## 4. 总结
| 方法                      | 适用场景                  | 命令示例                              |
| ------------------------- | ------------------------- | ------------------------------------- |
| **方法 1**（多远程）      | 需要分别管理 GitHub/Gitee | `git remote add github/gitee`         |
| **方法 2**（修改 origin） | 希望 `origin` 指向 Gitee  | `git remote set-url origin gitee_url` |
| **方法 3**（多推送 URL）  | 希望 `git push` 一键双推  | `git remote set-url --add --push`     |


