# 双版本发布核心原则
## Core Principles for Dual Version Release

**版本**: 1.0.0  
**创建日期**: 2025年10月19日  
**基于**: RBCT基于规则的约束思维

---

## 🎯 **R1: 双版本核心原则**

### **开发版本原则（MPLP-Protocol-Dev）**

#### **保留完整开发生态系统**

1. **开发工具和配置** ✅
   - 保留所有IDE配置（.vscode/, .idea/）
   - 保留所有代码质量工具（.eslintrc.json, .prettierrc.json）
   - 保留所有构建配置（tsconfig.json, jest.config.js）
   - 保留所有AI助手配置（.augment/, .cursor/）

2. **内部文档和规划** ✅
   - 保留所有内部规划文档（NPM-*.md, OPEN-SOURCE-*.md）
   - 保留所有方法论文档（DUAL-VERSION-*.md）
   - 保留所有策略分析文档
   - 保留所有质量报告

3. **测试套件和质量工具** ✅
   - 保留所有测试代码（tests/, __tests__/）
   - 保留所有测试配置
   - 保留所有质量检查脚本
   - 保留所有验证工具

4. **CI/CD完整配置** ✅
   - 保留所有GitHub Actions工作流
   - 保留所有CircleCI配置
   - 保留所有部署脚本
   - 保留所有自动化工具

5. **方法论和策略文档** ✅
   - 保留SCTM+GLFB+ITCM+RBCT相关文档
   - 保留所有分析报告
   - 保留所有执行计划
   - 保留所有检查清单

### **开源版本原则（MPLP-Protocol）**

#### **提供纯净生产版本**

1. **仅发布生产就绪代码** ✅
   - 发布完整的源代码（src/）
   - 发布预构建的输出（dist/）
   - 发布SDK生态系统（sdk/）
   - 发布示例应用（examples/）

2. **仅发布用户文档** ✅
   - 发布用户指南（docs/）
   - 发布API参考文档
   - 发布快速开始指南
   - 发布贡献指南

3. **仅发布必要的构建工具** ✅
   - 发布npm发布脚本
   - 发布基本构建脚本
   - 排除开发专用工具
   - 排除内部脚本

4. **仅发布公开CI/CD配置** ✅
   - 发布公开的GitHub Actions工作流
   - 排除内部CI/CD配置
   - 排除部署脚本
   - 排除自动化工具

5. **排除所有内部开发内容** ✅
   - 排除所有内部文档
   - 排除所有测试套件
   - 排除所有开发工具配置
   - 排除所有方法论文档

---

## 📊 **R2: 文件分类规则**

### **类别A: 核心代码（两个版本都包含）**

**包含内容**:
```
src/                    # 源代码
├── core/               # 核心编排器
├── modules/            # 10个核心模块
├── schemas/            # Schema定义
├── shared/             # 共享工具
├── logging/            # 日志系统
└── tools/              # 工具
```

**原则**:
- ✅ 两个版本中的src/目录必须完全一致
- ✅ 不能有任何差异
- ✅ 任何对src/的修改必须同步到两个版本

### **类别B: 文档（分类发布）**

**用户文档（两个版本都包含）**:
```
docs/                   # 用户文档
docs-sdk/               # SDK文档
README.md               # 主README
CHANGELOG.md            # 变更日志
CONTRIBUTING.md         # 贡献指南
CODE_OF_CONDUCT.md      # 行为准则
LICENSE                 # 许可证
SECURITY.md             # 安全政策
AUTHORS.md              # 贡献者列表
ROADMAP.md              # 路线图
QUICK_START.md          # 快速开始
TROUBLESHOOTING.md      # 故障排除
```

**内部文档（仅开发版本）**:
```
NPM-*.md                # npm发布文档
OPEN-SOURCE-*.md        # 开源发布规划
MPLP-OPEN-SOURCE-*.md   # 开源审查文档
DUAL-VERSION-*.md       # 双版本策略文档
dual-version-release/   # 双版本发布管理系统
```

### **类别C: 示例（两个版本都包含）**

**包含内容**:
```
examples/               # 示例应用
├── agent-orchestrator/
├── marketing-automation/
└── social-media-bot/

sdk/examples/           # SDK示例
├── cli-usage/
├── workflow-automation/
└── ai-coordination/
```

**原则**:
- ✅ 所有示例的README.md必须使用`npm install mplp@beta`
- ✅ 所有示例的代码必须可以直接运行
- ✅ 排除示例的node_modules/和dist/

### **类别D: SDK生态（两个版本都包含）**

**包含内容**:
```
sdk/packages/           # SDK包
├── core/               # @mplp/sdk-core
├── agent-builder/      # @mplp/agent-builder
├── orchestrator/       # @mplp/orchestrator
├── cli/                # @mplp/cli
├── studio/             # @mplp/studio
├── dev-tools/          # @mplp/dev-tools
└── adapters/           # @mplp/adapters
```

**原则**:
- ✅ 所有SDK包的源代码必须包含
- ✅ SDK包的node_modules/和dist/排除
- ✅ 所有SDK包的README.md必须包含

### **类别E: 构建输出（仅开源版本）**

**包含内容**:
```
dist/                   # 预构建输出
├── core/
├── modules/
├── schemas/
├── shared/
├── logging/
├── tools/
├── index.js
├── index.d.ts
└── index.d.ts.map
```

**原则**:
- ✅ 开源版本必须包含dist/目录
- ✅ 开发版本排除dist/目录（运行时生成）
- ✅ dist/目录通过`npm run build`生成

### **类别F: 开发工具（仅开发版本）**

**包含内容**:
```
.augment/               # AI助手配置
.circleci/              # CircleCI配置
.cursor/                # Cursor配置
.husky/                 # Git hooks
tests/                  # 测试套件
config/                 # 内部配置
temp_studio/            # 临时工作区
Archived/               # 归档文件
```

**原则**:
- ✅ 开发版本保留所有开发工具
- ✅ 开源版本完全排除
- ✅ 通过.gitignore.public排除

### **类别G: 内部文档（仅开发版本）**

**包含内容**:
```
NPM-*.md                # npm发布文档（14个文件）
OPEN-SOURCE-*.md        # 开源发布规划（2个文件）
MPLP-OPEN-SOURCE-*.md   # 开源审查文档（1个文件）
DUAL-VERSION-*.md       # 双版本策略文档（4个文件）
dual-version-release/   # 双版本发布管理系统
```

**原则**:
- ✅ 开发版本保留所有内部文档
- ✅ 开源版本完全排除
- ✅ 通过.gitignore.public排除

### **类别H: 开发配置（仅开发版本）**

**包含内容**:
```
.gitignore.public       # 开源版本gitignore模板
jest.config.js          # Jest测试配置
tsconfig.json           # TypeScript配置
.eslintrc.json          # ESLint配置
.prettierrc.json        # Prettier配置
.editorconfig           # 编辑器配置
```

**原则**:
- ✅ 开发版本保留所有配置文件
- ✅ 开源版本排除开发配置
- ✅ 通过.gitignore.public排除

---

## 🔧 **R3: .gitignore配置规则**

### **开发版本 .gitignore**

**策略**: 最小排除 - 仅排除运行时生成的文件

**排除内容**:
```gitignore
# 运行时生成的文件
node_modules/
dist/
coverage/
*.log
.env
.env.local

# 操作系统文件
.DS_Store
Thumbs.db

# IDE临时文件
*.swp
*.swo
```

**保留内容**:
- ✅ 所有源代码
- ✅ 所有开发工具配置
- ✅ 所有内部文档
- ✅ 所有测试套件

### **开源版本 .gitignore.public**

**策略**: 最大排除 - 排除所有开发内容

**排除内容**:
```gitignore
# 开发配置
.gitignore
.gitignore.public
tsconfig.json
jest.config.js
.eslintrc.json
.prettierrc.json

# 开发工具
.augment/
.circleci/
.cursor/
.husky/
tests/
config/
temp_studio/
Archived/

# 内部文档
NPM-*.md
OPEN-SOURCE-*.md
MPLP-OPEN-SOURCE-*.md
DUAL-VERSION-*.md
dual-version-release/

# 标准排除
node_modules/
coverage/
*.log
```

**保留内容**:
- ✅ 源代码（src/）
- ✅ 预构建输出（dist/）
- ✅ 用户文档（docs/）
- ✅ 示例代码（examples/）
- ✅ SDK生态（sdk/）

---

## 📋 **R4: 文档一致性规则**

### **跨语言文档对等性**

**要求**:
- ✅ 英文（en）和中文（zh-CN）必须保持对等
- ✅ 所有语言版本的文档结构必须一致
- ✅ 文档内链接必须正确指向对应语言版本

**验证方法**:
```bash
# 使用文档对等性检查脚本
node scripts/check-parity.js
node scripts/comprehensive-parity-analysis.js
```

### **文档链接一致性**

**开发版本链接**:
```markdown
https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev
```

**开源版本链接**:
```markdown
https://github.com/Coregentis/MPLP-Protocol-Dev-Dev
```

**要求**:
- ✅ README.md中的链接必须指向正确的仓库
- ✅ package.json中的repository字段必须正确
- ✅ 所有文档中的GitHub链接必须更新

---

## 🚀 **R5: npm包发布规则**

### **主包（mplp）**

**发布源**: 开源版本仓库（MPLP-Protocol）

**包含内容**:
- ✅ dist/目录（预构建）
- ✅ 用户文档
- ✅ LICENSE
- ✅ CHANGELOG.md

**排除内容**:
- ❌ 开发配置
- ❌ 测试代码
- ❌ 内部文档

### **SDK包（@mplp/*）**

**发布源**: 开源版本仓库的sdk/目录

**包含内容**:
- ✅ 各自的dist/目录
- ✅ 各自的README.md
- ✅ package.json

**发布方式**:
- ✅ 每个包独立发布
- ✅ 使用Lerna或手动发布

---

**规则版本**: 1.0.0  
**最后更新**: 2025年10月19日  
**状态**: ✅ 活跃维护

