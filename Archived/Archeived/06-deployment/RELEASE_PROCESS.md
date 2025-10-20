# MPLP 双仓库发布流程文档

## 📋 概述

MPLP项目采用双仓库架构，明确区分开发版本和开源版本：

- **开发仓库** (Private): `https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev`
- **开源仓库** (Public): `https://github.com/Coregentis/MPLP-Protocol-Dev-Dev`

## 🏗️ 仓库架构

### 开发仓库 (MPLP-Protocol-Dev)
```
用途: 内部开发、完整功能、调试工具
内容: 
├── 完整的开发环境
├── 内部工具和脚本
├── 开发配置文件
├── 内部文档和注释
├── 调试和测试工具
└── 敏感信息和配置
```

### 开源仓库 (MPLP-Protocol)
```
用途: 用户使用、社区贡献、问题反馈
内容:
├── 核心功能模块
├── 用户文档和示例
├── 生产就绪的代码
├── 开源许可和贡献指南
└── 社区支持文件
```

## 🔄 发布流程

### 阶段1: 开发版本准备

#### 1.1 版本规划
```bash
# 在开发仓库中
cd MPLP-Protocol-Dev

# 更新版本号
npm version patch|minor|major

# 示例: 发布1.0.1版本
npm version patch  # 1.0.0 -> 1.0.1
```

#### 1.2 质量检查
```bash
# 运行完整测试套件
npm run test:all

# 性能测试
npm run test:performance

# 安全审计
npm run security:audit

# 代码质量检查
npm run lint
npm run typecheck
```

#### 1.3 文档更新
```bash
# 更新CHANGELOG
echo "## [1.0.1] - $(date +%Y-%m-%d)" >> CHANGELOG.md
echo "### Added/Fixed/Changed" >> CHANGELOG.md

# 更新版本相关文档
npm run docs:update
```

### 阶段2: 开源版本构建

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

# 安装依赖
npm install

# 运行测试
npm test

# 检查包结构
npm pack --dry-run
```

### 阶段3: 开源仓库发布

#### 3.1 推送到开源仓库
```bash
# 克隆开源仓库
git clone https://github.com/Coregentis/MPLP-Protocol-Dev-Dev.git
cd MPLP-Protocol

# 复制构建结果
cp -r ../MPLP-Protocol-Dev/public-release/* ./

# 提交更改
git add .
git commit -m "Release v1.0.1

- 新增功能描述
- 修复问题描述
- 性能改进描述"

# 创建标签
git tag v1.0.1

# 推送到远程
git push origin main --tags
```

#### 3.2 发布到npm
```bash
# 在开源仓库中
npm publish

# 验证发布
npm view mplp@1.0.1
```

## 🤖 自动化流程

### GitHub Actions 配置

#### 开发仓库 (.github/workflows/dev-ci.yml)
```yaml
name: Development CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:all
      - name: Security audit
        run: npm audit --audit-level=moderate
```

#### 开源发布工作流 (.github/workflows/public-release.yml)
```yaml
name: Public Release
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g., 1.0.1)'
        required: true
        type: string
      release_notes:
        description: 'Release notes'
        required: false
        type: string

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout dev repository
        uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build public release
        run: npm run build:public-release -- ${{ github.event.inputs.version }}
      
      - name: Validate build
        run: npm run validate:public-release
      
      - name: Checkout public repository
        uses: actions/checkout@v3
        with:
          repository: Coregentis/MPLP-Protocol
          token: ${{ secrets.PUBLIC_REPO_TOKEN }}
          path: public-repo
      
      - name: Deploy to public repository
        run: |
          # 清理公开仓库
          rm -rf public-repo/*
          
          # 复制构建结果
          cp -r public-release/* public-repo/
          
          # 提交到公开仓库
          cd public-repo
          git config user.name "Release Bot"
          git config user.email "release@coregentis.com"
          git add .
          git commit -m "Release v${{ github.event.inputs.version }}"
          git tag v${{ github.event.inputs.version }}
          git push origin main --tags
      
      - name: Publish to npm
        run: |
          cd public-repo
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.PUBLIC_REPO_TOKEN }}
        with:
          tag_name: v${{ github.event.inputs.version }}
          release_name: Release v${{ github.event.inputs.version }}
          body: ${{ github.event.inputs.release_notes }}
          draft: false
          prerelease: false
```

## 📋 检查清单

### 发布前检查
- [ ] 所有测试通过 (单元、集成、端到端)
- [ ] 性能测试达标
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
- [ ] 包大小合理

### 发布验证
- [ ] 开源仓库更新成功
- [ ] npm发布成功
- [ ] GitHub Release创建
- [ ] 文档网站更新
- [ ] 社区通知发送

## 🚨 应急处理

### 发布回滚
```bash
# npm包回滚
npm unpublish mplp@1.0.1

# GitHub Release删除
gh release delete v1.0.1

# 仓库回滚
git revert <commit-hash>
git push origin main
```

### 热修复发布
```bash
# 创建热修复分支
git checkout -b hotfix/1.0.2

# 修复问题
# ... 代码修改

# 快速发布
npm version patch
npm run build:public-release -- 1.0.2
# ... 发布流程
```

## 📞 联系方式

- **技术负责人**: [技术负责人信息]
- **发布管理**: [发布管理员信息]
- **紧急联系**: [紧急联系方式]

---

**注意**: 此文档应定期更新，确保流程与实际操作保持一致。
