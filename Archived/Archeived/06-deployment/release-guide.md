# MPLP 发布指南

## 🎯 概述

本指南详细说明了MPLP项目的双仓库发布流程，确保开发版本和开源版本的正确管理。

## 📊 仓库架构

```
开发仓库 (Private)                    开源仓库 (Public)
MPLP-Protocol-Dev                     MPLP-Protocol
├── 完整开发环境                        ├── 核心功能
├── 内部工具                           ├── 用户文档
├── 调试代码                           ├── 示例代码
├── 敏感配置                           ├── 开源许可
└── 开发文档                           └── 社区文件
```

## 🚀 发布流程

### 步骤1: 准备发布 (开发仓库)

#### 1.1 版本规划
```bash
# 确定版本类型
# patch: 1.0.0 -> 1.0.1 (bug修复)
# minor: 1.0.0 -> 1.1.0 (新功能)
# major: 1.0.0 -> 2.0.0 (破坏性变更)

npm version patch|minor|major
```

#### 1.2 质量检查
```bash
# 运行完整测试套件
npm run test:all

# 代码质量检查
npm run lint
npm run typecheck

# 安全审计
npm run security:audit

# Schema验证
npm run validate:schemas
```

#### 1.3 文档更新
```bash
# 更新CHANGELOG
vim CHANGELOG.md

# 更新版本相关文档
npm run docs:update
```

### 步骤2: 构建开源版本

#### 2.1 自动构建
```bash
# 构建开源版本
npm run build:public-release -- 1.0.1

# 验证构建结果
npm run validate:public-release
```

#### 2.2 手动验证
```bash
# 进入构建目录
cd public-release

# 检查文件结构
tree -I node_modules

# 测试安装和构建
npm install
npm run build
npm test
```

### 步骤3: 发布到开源仓库

#### 3.1 自动发布 (推荐)
```bash
# 在GitHub上触发发布工作流
gh workflow run public-release.yml \
  -f version=1.0.1 \
  -f release_notes="Bug fixes and performance improvements" \
  -f publish_npm=true
```

#### 3.2 手动发布
```bash
# 克隆开源仓库
git clone https://github.com/Coregentis/MPLP-Protocol.git
cd MPLP-Protocol

# 复制构建结果
cp -r ../MPLP-Protocol-Dev/public-release/* ./

# 提交和标签
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1
git push origin main --tags

# 发布到npm
npm publish
```

## 📋 发布检查清单

### 发布前检查
- [ ] 所有测试通过 (单元、集成、性能)
- [ ] 代码质量检查通过
- [ ] 安全审计通过
- [ ] 文档更新完成
- [ ] CHANGELOG更新
- [ ] 版本号正确

### 构建验证
- [ ] 开源版本构建成功
- [ ] 路径引用正确
- [ ] 敏感信息已清理
- [ ] 必需文件完整
- [ ] TypeScript编译通过
- [ ] 包大小合理 (<100KB)

### 发布验证
- [ ] 开源仓库更新成功
- [ ] npm发布成功
- [ ] GitHub Release创建
- [ ] 文档网站更新
- [ ] 版本标签正确

## 🔧 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 检查TypeScript错误
npm run typecheck

# 检查路径问题
grep -r "../../public/" public-release/

# 重新构建
npm run clean
npm run build:public-release -- 1.0.1
```

#### 2. 验证失败
```bash
# 查看详细错误
npm run validate:public-release 2>&1 | tee validation.log

# 检查必需文件
ls -la public-release/
ls -la public-release/src/
```

#### 3. npm发布失败
```bash
# 检查包配置
npm pack --dry-run

# 检查npm登录
npm whoami

# 检查版本冲突
npm view mplp versions --json
```

### 应急处理

#### 发布回滚
```bash
# npm包回滚 (24小时内)
npm unpublish mplp@1.0.1

# GitHub Release删除
gh release delete v1.0.1

# 仓库回滚
git revert <commit-hash>
git push origin main
```

#### 热修复发布
```bash
# 创建热修复分支
git checkout -b hotfix/1.0.2

# 修复问题
# ... 代码修改

# 快速发布
npm version patch
npm run release:public
```

## 🤖 自动化配置

### GitHub Secrets 配置

在开发仓库中配置以下Secrets：

```
PUBLIC_REPO_TOKEN: 访问开源仓库的token
NPM_TOKEN: npm发布token
```

### 工作流触发

#### 自动触发
- 推送到main分支时运行CI
- 创建PR时运行测试

#### 手动触发
- 在GitHub Actions中手动触发发布工作流
- 指定版本号和发布说明

## 📊 版本管理策略

### 版本号规则
- **主版本号**: 不兼容的API变更
- **次版本号**: 向后兼容的功能新增
- **修订版本号**: 向后兼容的问题修复

### 分支策略
```
main: 稳定版本，用于发布
develop: 开发版本，功能集成
feature/*: 功能分支
hotfix/*: 热修复分支
```

### 标签策略
```
v1.0.0: 正式版本
v1.0.0-beta.1: 测试版本
v1.0.0-alpha.1: 预览版本
```

## 📞 支持和联系

### 发布团队
- **技术负责人**: [姓名] <email@example.com>
- **发布管理**: [姓名] <email@example.com>
- **质量保证**: [姓名] <email@example.com>

### 紧急联系
- **Slack**: #mplp-releases
- **邮件**: releases@coregentis.com
- **电话**: [紧急联系电话]

### 相关链接
- [开发仓库](https://github.com/Coregentis/MPLP-Protocol)
- [开源仓库](https://github.com/Coregentis/MPLP-Protocol)
- [npm包](https://www.npmjs.com/package/mplp)
- [文档网站](https://mplp.dev)

---

**注意**: 此指南应定期更新，确保与实际流程保持一致。最后更新: 2025-01-31
