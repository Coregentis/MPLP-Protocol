# MPLP双版本发布策略全面分析报告
## 基于SCTM+GLFB+ITCM+RBCT方法论的深度调研

**版本**: 1.0.0
**创建日期**: 2025年10月19日
**方法论**: SCTM+GLFB+ITCM+RBCT增强框架
**分析模式**: 总-分-总（Global → Local → Global）

---

## 🎯 **总（Global）- 项目全局战略定位**

### **双版本发布战略概述**

MPLP项目采用**双仓库双版本发布策略**，以满足不同用户群体的需求：

| 版本类型 | 仓库 | 目标用户 | 发布范围 | .gitignore文件 |
|---------|------|---------|---------|---------------|
| **开发版本** | [MPLP-Protocol-Dev](https://github.com/Coregentis/MPLP-Protocol-Dev) | 核心开发团队、贡献者 | 完整开发环境 | `.gitignore` |
| **开源版本** | [MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) | 开源社区、企业用户 | 纯净生产版本 | `.gitignore.public` |

### **战略目标**

1. **开发版本（Dev）**: 保持完整的开发生态系统，支持持续开发和创新
2. **开源版本（Public）**: 提供纯净、专业、易用的生产级开源项目

---

## 📊 **RBCT深度思考 - 发布规则制定**

### **R1: 双版本核心原则**

#### **开发版本原则（MPLP-Protocol-Dev）**
- ✅ **保留所有开发工具和配置**
- ✅ **保留内部文档和规划**
- ✅ **保留测试套件和质量工具**
- ✅ **保留CI/CD完整配置**
- ✅ **保留方法论和策略文档**

#### **开源版本原则（MPLP-Protocol）**
- ✅ **仅发布生产就绪代码**
- ✅ **仅发布用户文档**
- ✅ **仅发布必要的构建工具**
- ✅ **仅发布公开CI/CD配置**
- ✅ **排除所有内部开发内容**

### **R2: 文件分类规则**

基于codebase深度调研，文件分为以下类别：

#### **类别A: 核心代码（两个版本都包含）**
```
src/                    # 源代码
dist/                   # 构建输出（开源版本包含）
package.json            # 包配置
tsconfig.json           # TypeScript配置（开源版本排除）
```

#### **类别B: 文档（分类发布）**
```
docs/                   # 用户文档（两个版本都包含）
docs-sdk/               # SDK文档（两个版本都包含）
README.md               # 主README（两个版本都包含）
CHANGELOG.md            # 变更日志（两个版本都包含）
CONTRIBUTING.md         # 贡献指南（两个版本都包含）
CODE_OF_CONDUCT.md      # 行为准则（两个版本都包含）
LICENSE                 # 许可证（两个版本都包含）
SECURITY.md             # 安全政策（两个版本都包含）
AUTHORS.md              # 贡献者（两个版本都包含）
```

#### **类别C: 示例（两个版本都包含）**
```
examples/               # 示例应用（两个版本都包含）
sdk/examples/           # SDK示例（两个版本都包含）
```

#### **类别D: SDK生态（两个版本都包含）**
```
sdk/packages/           # SDK包（两个版本都包含）
sdk/README.md           # SDK文档（两个版本都包含）
```

#### **类别E: 开发工具（仅开发版本）**
```
.augment/               # AI助手配置（仅Dev）
.circleci/              # CircleCI配置（仅Dev）
.cursor/                # Cursor配置（仅Dev）
.husky/                 # Git hooks（仅Dev）
tests/                  # 测试套件（仅Dev）
config/                 # 内部配置（仅Dev）
temp_studio/            # 临时工作区（仅Dev）
Archived/               # 归档文件（仅Dev）
```

#### **类别F: 内部文档（仅开发版本）**
```
NPM-*.md                # npm发布文档（仅Dev）
OPEN-SOURCE-*.md        # 开源发布规划（仅Dev）
MPLP-OPEN-SOURCE-*.md   # 开源审查文档（仅Dev）
DUAL-VERSION-*.md       # 双版本策略文档（仅Dev）
```

#### **类别G: GitHub配置（分类发布）**
```
.github/workflows/      # CI/CD工作流（两个版本都包含，但内容不同）
.github/ISSUE_TEMPLATE/ # Issue模板（两个版本都包含）
.github/PULL_REQUEST_TEMPLATE.md  # PR模板（两个版本都包含）
```

#### **类别H: 构建脚本（分类发布）**
```
scripts/npm-publish.sh  # npm发布脚本（两个版本都包含）
scripts/npm-publish.bat # npm发布脚本（两个版本都包含）
scripts/build.js        # 构建脚本（开源版本可能包含）
scripts/test.js         # 测试脚本（仅Dev）
scripts/*-parity-*.js   # 文档对等性脚本（仅Dev）
scripts/ci-*.js         # CI诊断脚本（仅Dev）
scripts/fix-*.js        # 修复脚本（仅Dev）
scripts/validate-*.js   # 验证脚本（仅Dev）
```

### **R3: .gitignore配置规则**

#### **开发版本 .gitignore（最小排除）**
```gitignore
# 仅排除运行时生成的文件
node_modules/
dist/
coverage/
*.log
.env
.env.local
.DS_Store
```

#### **开源版本 .gitignore.public（最大排除）**
```gitignore
# 排除所有开发配置
.gitignore
.gitignore.public
tsconfig.json
jest.config.js
.eslintrc.json
.prettierrc.json

# 排除开发工具
.augment/
.circleci/
.cursor/
.husky/
tests/
config/
temp_studio/
Archived/

# 排除内部文档
NPM-*.md
OPEN-SOURCE-*.md
MPLP-OPEN-SOURCE-*.md
DUAL-VERSION-*.md

# 排除开发脚本
scripts/
!scripts/npm-publish.sh
!scripts/npm-publish.bat

# 标准排除
node_modules/
coverage/
*.log
.env
```

### **R4: 文档一致性规则**

#### **跨语言文档对等性**
- ✅ **英文（en）和中文（zh-CN）必须保持对等**
- ✅ **日文（ja）、德文（de）、法文（fr）等其他语言可选**
- ✅ **所有语言版本的文档结构必须一致**
- ✅ **文档内链接必须正确指向对应语言版本**

#### **文档链接一致性**
- ✅ **README.md中的链接必须指向正确的仓库**
  - Dev版本: `https://github.com/Coregentis/MPLP-Protocol-Dev`
  - Public版本: `https://github.com/Coregentis/MPLP-Protocol`
- ✅ **package.json中的repository字段必须正确**
- ✅ **所有文档中的GitHub链接必须更新**

### **R5: npm包发布规则**

#### **主包（mplp）**
- ✅ **从开源版本仓库发布**
- ✅ **包含dist/目录（预构建）**
- ✅ **包含用户文档**
- ✅ **排除开发配置和测试**

#### **SDK包（@mplp/*）**
- ✅ **从开源版本仓库的sdk/目录发布**
- ✅ **每个包独立发布**
- ✅ **包含各自的README和文档**

---

## 🔍 **分（Local）- 具体文件和目录分析**

### **1. 根目录文件分析**

#### **保留在两个版本的文件**
```
✅ README.md              # 主文档（需更新仓库链接）
✅ CHANGELOG.md           # 变更日志
✅ CONTRIBUTING.md        # 贡献指南
✅ CODE_OF_CONDUCT.md     # 行为准则
✅ LICENSE                # MIT许可证
✅ SECURITY.md            # 安全政策
✅ AUTHORS.md             # 贡献者列表
✅ ROADMAP.md             # 路线图
✅ QUICK_START.md         # 快速开始
✅ TROUBLESHOOTING.md     # 故障排除
✅ package.json           # 包配置（需更新repository字段）
✅ package-lock.json      # 锁文件
```

#### **仅保留在开发版本的文件**
```
❌ NPM-COMPREHENSIVE-UPDATE-ANALYSIS.md
❌ NPM-DOCUMENTATION-UPDATE-FINAL-SUCCESS-REPORT.md
❌ NPM-DOCUMENTATION-UPDATE-PLAN.md
❌ NPM-DOCUMENTATION-UPDATE-SUCCESS-REPORT.md
❌ NPM-PHASE1-UPDATE-SUCCESS-REPORT.md
❌ NPM-PHASE2-UPDATE-SUCCESS-REPORT.md
❌ NPM-PHASE3-UPDATE-SUCCESS-REPORT.md
❌ NPM-PUBLISH-CHECKLIST.md
❌ NPM-PUBLISH-PREPARATION.md
❌ NPM-PUBLISH-SUCCESS-REPORT.md
❌ OPEN-SOURCE-RELEASE-PREPARATION-PLAN.md
❌ OPEN-SOURCE-RELEASE-PREPARATION-SUCCESS-REPORT.md
❌ MPLP-OPEN-SOURCE-USER-DEEP-REVIEW.md
❌ DUAL-VERSION-RELEASE-STRATEGY-COMPREHENSIVE-ANALYSIS.md
❌ jest.config.js
❌ tsconfig.json
❌ .eslintrc.json
❌ .prettierrc.json
```

### **2. 目录结构分析**

#### **src/ 目录（两个版本都包含）**
```
src/
├── core/               # 核心编排器
├── modules/            # 10个核心模块
├── schemas/            # Schema定义
├── shared/             # 共享工具
├── logging/            # 日志系统
├── tools/              # 工具（开源版本可能排除部分）
└── index.ts            # 主入口
```

#### **dist/ 目录（开源版本包含，开发版本排除）**
```
dist/                   # 预构建输出（开源版本包含）
```

#### **docs/ 目录（两个版本都包含）**
```
docs/
├── en/                 # 英文文档
├── zh-CN/              # 中文文档
├── ja/                 # 日文文档
├── de/                 # 德文文档
├── fr/                 # 法文文档
├── es/                 # 西班牙文文档
├── ko/                 # 韩文文档
├── ru/                 # 俄文文档
└── README.md           # 文档首页
```

#### **examples/ 目录（两个版本都包含）**
```
examples/
├── agent-orchestrator/
├── marketing-automation/
└── social-media-bot/
```

#### **sdk/ 目录（两个版本都包含）**
```
sdk/
├── packages/           # SDK包
│   ├── core/
│   ├── agent-builder/
│   ├── orchestrator/
│   ├── cli/
│   ├── studio/
│   ├── dev-tools/
│   └── adapters/
├── examples/           # SDK示例
└── README.md
```

#### **scripts/ 目录（分类发布）**
```
scripts/
├── npm-publish.sh      # ✅ 两个版本都包含
├── npm-publish.bat     # ✅ 两个版本都包含
├── build.js            # ❓ 可能包含在开源版本
└── [其他脚本]          # ❌ 仅开发版本
```

#### **仅开发版本的目录**
```
❌ .augment/            # AI助手配置
❌ .circleci/           # CircleCI配置
❌ .cursor/             # Cursor配置
❌ .husky/              # Git hooks
❌ tests/               # 测试套件
❌ config/              # 内部配置
❌ temp_studio/         # 临时工作区
❌ Archived/            # 归档文件
```

### **3. .github/ 目录分析**

#### **两个版本都包含的文件**
```
.github/
├── workflows/
│   ├── ci.yml          # ✅ CI工作流（内容可能不同）
│   ├── security.yml    # ✅ 安全扫描
│   └── publish.yml     # ✅ npm发布
├── ISSUE_TEMPLATE/
│   ├── bug_report.md   # ✅ Bug报告模板
│   └── feature_request.md  # ✅ 功能请求模板
└── PULL_REQUEST_TEMPLATE.md  # ✅ PR模板
```

#### **工作流内容差异**

**开发版本 ci.yml**:
```yaml
# 包含完整的测试、代码检查、构建
- 运行所有测试套件
- 运行代码质量检查
- 运行安全审计
- 构建项目
```

**开源版本 ci.yml**:
```yaml
# 简化的CI流程
- 运行基本测试（如果包含）
- 构建项目
- 验证包完整性
```

### **4. package.json分析**

#### **需要更新的字段**

**开发版本**:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Coregentis/MPLP-Protocol-Dev.git"
  },
  "bugs": {
    "url": "https://github.com/Coregentis/MPLP-Protocol-Dev/issues"
  },
  "homepage": "https://github.com/Coregentis/MPLP-Protocol-Dev#readme"
}
```

**开源版本**:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Coregentis/MPLP-Protocol.git"
  },
  "bugs": {
    "url": "https://github.com/Coregentis/MPLP-Protocol/issues"
  },
  "homepage": "https://github.com/Coregentis/MPLP-Protocol#readme"
}
```

---

## 📋 **总（Global）- 全局一致性验证**

### **一致性检查清单**

#### **1. 文档一致性**
- [ ] 所有README.md中的GitHub链接已更新
- [ ] package.json中的repository字段已更新
- [ ] 所有文档中的安装说明一致
- [ ] 跨语言文档结构对等
- [ ] 文档内链接正确

#### **2. 代码一致性**
- [ ] src/目录在两个版本中完全一致
- [ ] dist/目录仅在开源版本中包含
- [ ] 所有import语句正确
- [ ] 版本号统一为1.1.0-beta

#### **3. 配置一致性**
- [ ] .gitignore和.gitignore.public配置正确
- [ ] package.json的files字段正确
- [ ] .npmignore配置正确（如果使用）
- [ ] GitHub Actions工作流配置正确

#### **4. 示例一致性**
- [ ] 所有示例的安装说明使用npm install mplp@beta
- [ ] 示例代码引用正确的包名
- [ ] 示例README中的链接正确

#### **5. SDK一致性**
- [ ] sdk/packages/中所有包的repository字段正确
- [ ] SDK文档中的链接正确
- [ ] SDK示例的依赖配置正确

---

## 🚀 **执行计划**

### **Phase 1: 准备阶段（已完成）**
- ✅ 深度codebase调研
- ✅ RBCT规则制定
- ✅ 双版本策略分析

### **Phase 2: 开发版本整理（待执行）**
1. 确保.gitignore配置正确
2. 更新package.json的repository字段为Dev仓库
3. 更新所有文档中的GitHub链接为Dev仓库
4. 验证完整性

### **Phase 3: 开源版本整理（待执行）**
1. 使用.gitignore.public替换.gitignore
2. 更新package.json的repository字段为Public仓库
3. 更新所有文档中的GitHub链接为Public仓库
4. 移除所有内部文档和开发工具
5. 确保dist/目录包含在发布中
6. 验证完整性

### **Phase 4: 双版本验证（待执行）**
1. 验证文档一致性
2. 验证代码一致性
3. 验证配置一致性
4. 验证示例一致性
5. 验证SDK一致性

---

**分析状态**: ✅ **完成**  
**方法论**: 🏆 **SCTM+GLFB+ITCM+RBCT完全应用**  
**分析模式**: 📊 **总-分-总（Global → Local → Global）**  
**完成日期**: 📅 **2025年10月19日**

