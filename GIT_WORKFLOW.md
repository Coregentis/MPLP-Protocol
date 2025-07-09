# MPLP v1.0 Git 工作流指南

> **双仓库策略**: 开发备份 + 纯净发布  
> **更新时间**: 2025-01-27  
> **版本**: v1.0.0

## 📁 仓库架构

### 🔧 **开发仓库** (origin)
- **地址**: https://github.com/Coregentis/MPLP-Protocol-Dev
- **用途**: 工作区备份、开发过程记录、实验性功能
- **特点**: 包含所有开发文件、配置、临时代码、文档草稿
- **访问权限**: 团队内部开发者

### 🚀 **发布仓库** (release)
- **地址**: https://github.com/Coregentis/MPLP-Protocol
- **用途**: 纯净发布版本、用户下载、社区贡献
- **特点**: 只包含生产就绪代码、正式文档、稳定版本
- **访问权限**: 公开访问、接受 Pull Request

---

## 🔄 工作流程

### 📝 **日常开发流程**

#### **1. 开发阶段 (推送到 Dev 仓库)**
```bash
# 日常开发提交
git add .
git commit -m "feat: implement context module basic structure"
git push origin main

# 实验性功能
git checkout -b experiment/new-feature
git add .
git commit -m "experiment: trying new approach for trace optimization"
git push origin experiment/new-feature
```

#### **2. 里程碑备份 (重要节点)**
```bash
# 完成重要功能后备份
git add .
git commit -m "milestone: Context and Plan modules implementation complete

- Implement full Context module with state management
- Add Plan module with task dependency resolution
- Complete unit tests with 95% coverage
- Update API documentation

Ready for integration testing phase."

git tag -a v1.0.0-alpha.1 -m "Alpha release: Core modules implemented"
git push origin main --tags
```

### 🚀 **发布流程 (推送到 Release 仓库)**

#### **1. 准备发布版本**
```bash
# 创建发布分支
git checkout -b release/v1.0.0

# 清理开发文件 (如果需要)
# - 移除 .env.example 中的测试配置
# - 清理临时文档
# - 确保 README.md 面向用户

# 更新版本信息
npm version 1.0.0

# 提交发布准备
git add .
git commit -m "release: prepare v1.0.0 for public release

- Clean up development artifacts
- Update documentation for end users
- Finalize configuration examples
- Add installation and usage guides"
```

#### **2. 推送到发布仓库**
```bash
# 推送到发布仓库
git push release release/v1.0.0:main

# 创建发布标签
git tag -a v1.0.0 -m "MPLP v1.0.0 - Multi-Agent Project Lifecycle Protocol

Major Features:
- Complete 6-module MPLP protocol implementation
- REST API and GraphQL support
- TracePilot and Coregentis integration
- Comprehensive testing suite
- Docker containerization
- Production-ready deployment"

git push release v1.0.0
```

#### **3. GitHub Release 创建**
在 GitHub Release 页面创建正式发布：
- 标题: `MPLP v1.0.0 - Multi-Agent Project Lifecycle Protocol`
- 描述: 包含功能列表、安装指南、API 文档链接
- 附件: 二进制包、Docker 镜像信息

---

## 📋 分支策略

### **开发仓库 (Dev) 分支**
```
main                    # 主开发分支
├── feature/context     # 功能开发分支
├── feature/plan       # 功能开发分支
├── experiment/perf    # 实验性分支
├── docs/api-update    # 文档更新分支
└── bugfix/trace-leak  # Bug 修复分支
```

### **发布仓库 (Release) 分支**
```
main                   # 稳定发布分支
├── release/v1.0.0     # 发布准备分支
├── hotfix/v1.0.1      # 紧急修复分支
└── docs/user-guide    # 用户文档分支
```

---

## 🔧 常用命令

### **检查远程仓库**
```bash
git remote -v
```

### **同步开发进度**
```bash
# 每日备份到开发仓库
git add .
git commit -m "daily: progress on API implementation"
git push origin main
```

### **切换到发布模式**
```bash
# 准备发布到生产仓库
git checkout -b release/v1.0.0
# ... 清理和准备工作 ...
git push release release/v1.0.0:main
```

### **hotfix 流程**
```bash
# 从发布仓库创建紧急修复
git fetch release
git checkout -b hotfix/v1.0.1 release/main
# ... 修复 bug ...
git commit -m "hotfix: fix critical security vulnerability"
git push release hotfix/v1.0.1

# 同步回开发仓库
git checkout main
git merge hotfix/v1.0.1
git push origin main
```

---

## 📚 提交规范

### **开发仓库提交格式**
```bash
# 功能开发
git commit -m "feat(context): add state persistence mechanism"

# Bug 修复
git commit -m "fix(api): resolve validation error in plan creation"

# 文档更新
git commit -m "docs: update API examples and usage guide"

# 实验性功能
git commit -m "experiment: test new caching strategy for traces"

# 日常备份
git commit -m "daily: work in progress on extension system"
```

### **发布仓库提交格式**
```bash
# 版本发布
git commit -m "release: MPLP v1.0.0 stable release"

# 紧急修复
git commit -m "hotfix: critical security patch v1.0.1"

# 文档发布
git commit -m "docs: publish user guide and API reference"
```

---

## 🔒 访问控制

### **开发仓库权限**
- **Admin**: 项目负责人
- **Write**: 核心开发团队
- **Read**: 内部测试人员

### **发布仓库权限**
- **Admin**: 项目负责人
- **Write**: 发布管理员
- **Read**: 公开访问

---

## 📊 同步策略

### **定期同步**
- **每日**: 开发进度备份到 Dev 仓库
- **每周**: 里程碑总结和标签
- **每月**: 稳定版本同步到 Release 仓库

### **重要节点同步**
- **功能完成**: 立即备份到 Dev 仓库
- **测试通过**: 创建预发布标签
- **生产就绪**: 推送到 Release 仓库

---

## ⚠️ 注意事项

1. **敏感信息**: 确保 `.env` 等敏感文件不会推送到公开仓库
2. **代码质量**: 发布仓库的代码必须通过所有测试和质量检查
3. **文档一致**: 保持两个仓库的 README 和文档同步
4. **版本标签**: 使用语义化版本控制，确保标签一致性
5. **许可证**: 确保两个仓库的许可证信息一致

---

**当前仓库配置**:
- `origin` → MPLP-Protocol-Dev (开发备份)
- `release` → MPLP-Protocol (纯净发布) 