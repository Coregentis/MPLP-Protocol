# MPLP项目分支管理策略

## 📋 文档信息
- **版本**: 1.0.0
- **生效日期**: 2025-10-16
- **适用范围**: MPLP-Protocol-Dev (内部开发库) + MPLP-Protocol (公开发布库)
- **制定框架**: SCTM+GLFB+ITCM+RBCT增强框架

---

## 🎯 分支管理目标

1. **简化分支结构** - 保持分支数量最小化，提高可维护性
2. **清晰的发布流程** - 建立标准化的版本发布流程
3. **内外库同步** - 确保公开库及时获得重要更新
4. **规范的备份策略** - 使用Git标签而不是分支进行备份

---

## 🌳 分支模型

### **Git Flow简化版**

```
main (主开发分支)
  ├── release/v1.0.0 (发布分支)
  ├── release/v1.1.0 (发布分支)
  ├── hotfix/critical-bug (紧急修复)
  └── feature/new-module (功能开发，可选)
```

---

## 📌 分支类型与规范

### **1. 主分支 (永久)**

#### **main**
- **用途**: 主开发分支，包含最新的稳定代码
- **保护级别**: 高 (需要PR审查)
- **合并来源**: release/*, hotfix/*, feature/*
- **命名**: `main`
- **生命周期**: 永久

#### **master** (可选)
- **用途**: GitHub默认分支，与main同步
- **保护级别**: 高
- **同步策略**: 自动与main保持同步
- **命名**: `master`
- **生命周期**: 永久
- **说明**: 为了兼容GitHub默认设置，可以保留但建议逐步迁移到main

### **2. 发布分支 (临时)**

#### **release/***
- **用途**: 准备新版本发布
- **创建时机**: 准备发布新版本时
- **命名格式**: `release/v<major>.<minor>.<patch>`
- **示例**: `release/v1.0.0`, `release/v1.1.0-beta`
- **生命周期**: 发布完成后删除
- **操作流程**:
  ```bash
  # 1. 从main创建发布分支
  git checkout -b release/v1.0.0 main
  
  # 2. 在发布分支进行最后的测试和修复
  # ... 测试和修复 ...
  
  # 3. 合并回main
  git checkout main
  git merge --no-ff release/v1.0.0
  
  # 4. 打标签
  git tag -a v1.0.0 -m "Release version 1.0.0"
  
  # 5. 推送到公开库
  git push release main:main
  git push release v1.0.0
  
  # 6. 删除发布分支
  git branch -d release/v1.0.0
  ```

### **3. 紧急修复分支 (临时)**

#### **hotfix/***
- **用途**: 修复生产环境的紧急问题
- **创建时机**: 发现生产环境严重bug时
- **命名格式**: `hotfix/<issue-description>`
- **示例**: `hotfix/critical-security-fix`, `hotfix/data-loss-bug`
- **生命周期**: 修复完成后删除
- **操作流程**:
  ```bash
  # 1. 从main创建hotfix分支
  git checkout -b hotfix/critical-bug main
  
  # 2. 修复bug
  # ... 修复代码 ...
  
  # 3. 合并回main
  git checkout main
  git merge --no-ff hotfix/critical-bug
  
  # 4. 打补丁标签
  git tag -a v1.0.1 -m "Hotfix: critical bug"
  
  # 5. 推送到公开库
  git push release main:main
  git push release v1.0.1
  
  # 6. 删除hotfix分支
  git branch -d hotfix/critical-bug
  ```

### **4. 功能开发分支 (临时，可选)**

#### **feature/***
- **用途**: 开发新功能或重大改进
- **创建时机**: 开始新功能开发时
- **命名格式**: `feature/<feature-name>`
- **示例**: `feature/new-dialog-module`, `feature/performance-optimization`
- **生命周期**: 功能完成后删除
- **说明**: 对于MPLP项目，大部分开发直接在main分支进行，只有重大功能才需要feature分支

---

## 🏷️ 标签策略

### **版本标签**

#### **格式**: `v<major>.<minor>.<patch>[-<pre-release>]`

**示例**:
- `v1.0.0` - 正式版本
- `v1.0.0-alpha` - Alpha版本
- `v1.0.0-beta` - Beta版本
- `v1.1.0-rc.1` - Release Candidate

#### **创建时机**:
- 每次正式发布
- 重要的里程碑
- Alpha/Beta版本发布

#### **操作**:
```bash
# 创建带注释的标签
git tag -a v1.0.0 -m "MPLP v1.0 Alpha Release - Complete L1-L3 Protocol Stack"

# 推送标签到远程
git push origin v1.0.0
git push release v1.0.0
```

### **备份标签**

#### **格式**: `backup-<YYYYMMDD>-<description>`

**示例**:
- `backup-20251016-before-organization`
- `backup-20250806-before-reorganization`

#### **创建时机**:
- 重大重构前
- 重要变更前
- 定期备份（每月）

#### **操作**:
```bash
# 创建备份标签
git tag backup-20251016-before-organization

# 推送到远程
git push origin backup-20251016-before-organization
```

---

## 🔄 工作流程

### **日常开发流程**

```bash
# 1. 确保在main分支
git checkout main

# 2. 拉取最新代码
git pull origin main

# 3. 进行开发
# ... 编码 ...

# 4. 提交代码
git add .
git commit -m "feat: add new feature"

# 5. 推送到远程
git push origin main
```

### **版本发布流程**

```bash
# 1. 创建发布分支
git checkout -b release/v1.1.0 main

# 2. 更新版本号
# 编辑 package.json, CHANGELOG.md 等

# 3. 最后测试
npm test
npm run build

# 4. 合并到main
git checkout main
git merge --no-ff release/v1.1.0

# 5. 打标签
git tag -a v1.1.0 -m "Release v1.1.0 - SDK Ecosystem"

# 6. 推送到内部库
git push origin main
git push origin v1.1.0

# 7. 推送到公开库
git push release main:main
git push release v1.1.0

# 8. 清理发布分支
git branch -d release/v1.1.0
```

### **紧急修复流程**

```bash
# 1. 创建hotfix分支
git checkout -b hotfix/security-fix main

# 2. 修复问题
# ... 修复代码 ...

# 3. 测试
npm test

# 4. 合并到main
git checkout main
git merge --no-ff hotfix/security-fix

# 5. 打补丁标签
git tag -a v1.0.1 -m "Hotfix: security vulnerability"

# 6. 推送
git push origin main
git push origin v1.0.1
git push release main:main
git push release v1.0.1

# 7. 清理hotfix分支
git branch -d hotfix/security-fix
```

---

## 🔐 分支保护规则

### **main分支保护**

在GitHub设置中配置:

1. **Require pull request reviews before merging**
   - Required approving reviews: 1
   - Dismiss stale pull request approvals when new commits are pushed

2. **Require status checks to pass before merging**
   - TypeScript compilation
   - ESLint check
   - Unit tests
   - Integration tests

3. **Require branches to be up to date before merging**

4. **Include administrators**

### **master分支保护**

与main分支相同的保护规则

---

## 📊 分支管理最佳实践

### **DO ✅**

1. **保持分支简洁**
   - 及时删除已合并的分支
   - 定期清理过期标签

2. **使用描述性命名**
   - 分支名清晰表达目的
   - 遵循命名规范

3. **频繁同步**
   - 定期从main拉取最新代码
   - 及时推送本地提交

4. **使用标签标记重要节点**
   - 每次发布打标签
   - 重大变更前创建备份标签

5. **保持公开库同步**
   - 重要修复及时推送到公开库
   - 定期同步main分支

### **DON'T ❌**

1. **不要创建长期存在的备份分支**
   - 使用标签代替备份分支

2. **不要在main分支直接发布**
   - 使用release分支进行发布准备

3. **不要保留已合并的分支**
   - 合并后立即删除临时分支

4. **不要使用中文或特殊字符命名**
   - 使用英文和连字符

5. **不要跳过测试直接合并**
   - 确保所有测试通过后再合并

---

## 🛠️ 自动化工具

### **GitHub Actions工作流**

#### **自动删除已合并分支**

创建 `.github/workflows/cleanup-branches.yml`:

```yaml
name: Cleanup Merged Branches

on:
  pull_request:
    types: [closed]

jobs:
  cleanup:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Delete merged branch
        uses: actions/github-script@v6
        with:
          script: |
            const branch = context.payload.pull_request.head.ref;
            if (!branch.startsWith('main') && !branch.startsWith('master')) {
              await github.rest.git.deleteRef({
                owner: context.repo.owner,
                repo: context.repo.repo,
                ref: `heads/${branch}`
              });
            }
```

#### **自动同步main和master**

创建 `.github/workflows/sync-main-master.yml`:

```yaml
name: Sync main and master

on:
  push:
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync master with main
        run: |
          git checkout master
          git merge --ff-only main
          git push origin master
```

---

## 📞 支持与联系

如有分支管理相关问题，请:

1. 查看本文档
2. 查看分支管理分析报告: `BRANCH-MANAGEMENT-ANALYSIS-REPORT.md`
3. 联系项目管理团队

---

**文档版本**: 1.0.0
**最后更新**: 2025-10-16
**维护者**: MPLP项目管理团队

