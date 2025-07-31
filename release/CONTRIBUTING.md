# 贡献指南

感谢您对 MPLP 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ⚡ 性能优化
- 🧪 添加测试用例

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### 设置开发环境

1. **Fork 仓库**
   ```bash
   # 在 GitHub 上 fork 仓库，然后克隆你的 fork
   git clone https://github.com/YOUR_USERNAME/mplp.git
   cd mplp
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **运行测试**
   ```bash
   npm test
   ```

4. **启动开发模式**
   ```bash
   npm run dev
   ```

## 📋 开发流程

### 1. 创建分支

```bash
# 从 main 分支创建新分支
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 或者修复 bug
git checkout -b fix/your-bug-fix
```

### 2. 开发规范

#### 代码风格
- 使用 TypeScript 严格模式
- 遵循现有的代码风格
- 使用有意义的变量和函数名
- 添加适当的注释

#### 提交规范
我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能添加
git commit -m "feat: add new orchestrator performance monitoring"

# Bug 修复
git commit -m "fix: resolve memory leak in cache manager"

# 文档更新
git commit -m "docs: update API reference for new features"

# 测试添加
git commit -m "test: add unit tests for performance optimizer"

# 重构
git commit -m "refactor: improve error handling in core module"
```

### 3. 测试要求

所有代码更改都必须包含相应的测试：

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行性能测试
npm run test:performance

# 检查测试覆盖率
npm run test:coverage
```

**测试覆盖率要求**：
- 新功能：≥ 90%
- Bug 修复：必须包含回归测试
- 性能优化：必须包含性能基准测试

### 4. 文档更新

如果你的更改影响了 API 或用户体验，请更新相应文档：

- `README.md` - 主要功能和使用说明
- `docs/api-reference.md` - API 文档
- `docs/getting-started.md` - 快速开始指南
- 代码注释 - 复杂逻辑的解释

## 🐛 报告 Bug

### 报告前检查

1. 搜索 [现有 issues](https://github.com/your-org/mplp/issues) 确认问题未被报告
2. 确保使用的是最新版本
3. 检查是否是配置问题

### Bug 报告模板

```markdown
**Bug 描述**
简洁清晰地描述 bug。

**复现步骤**
1. 执行 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

**期望行为**
描述你期望发生的行为。

**实际行为**
描述实际发生的行为。

**环境信息**
- OS: [e.g. macOS 12.0]
- Node.js: [e.g. 16.14.0]
- MPLP: [e.g. 1.0.0]

**附加信息**
添加任何其他相关信息、截图或日志。
```

## 💡 功能建议

我们欢迎新功能建议！请：

1. 检查 [现有 issues](https://github.com/your-org/mplp/issues) 避免重复
2. 使用功能请求模板
3. 详细描述用例和预期收益
4. 考虑向后兼容性

## 🔍 代码审查

所有 Pull Request 都需要经过代码审查：

### 审查标准
- ✅ 代码质量和风格
- ✅ 测试覆盖率
- ✅ 文档完整性
- ✅ 性能影响
- ✅ 安全考虑
- ✅ 向后兼容性

### 审查流程
1. 自动化检查（CI/CD）
2. 维护者审查
3. 社区反馈
4. 最终批准和合并

## 📦 发布流程

项目维护者负责版本发布：

1. **版本号规范**：遵循 [Semantic Versioning](https://semver.org/)
2. **发布说明**：详细的变更日志
3. **向后兼容**：主版本号变更时的迁移指南

## 🏆 贡献者认可

我们重视每一个贡献者：

- 贡献者将被添加到 `CONTRIBUTORS.md`
- 重大贡献者将获得维护者权限
- 优秀贡献将在发布说明中特别感谢

## 📞 获取帮助

如果你在贡献过程中遇到问题：

- 💬 [GitHub Discussions](https://github.com/your-org/mplp/discussions)
- 📧 发邮件给维护者
- 💬 在相关 issue 中提问

## 📜 行为准则

请遵守我们的 [行为准则](./CODE_OF_CONDUCT.md)，共同维护友好的社区环境。

---

再次感谢您的贡献！🎉
