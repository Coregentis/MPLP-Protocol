# MPLP双版本发布管理系统
## Dual Version Release Management System

**版本**: 1.0.0  
**创建日期**: 2025年10月19日  
**方法论**: SCTM+GLFB+ITCM+RBCT增强框架  
**维护者**: MPLP Core Team

---

## 📋 **目录结构**

```
dual-version-release/
├── README.md                           # 本文件 - 双版本发布管理系统总览
├── rules/                              # 发布规则
│   ├── core-principles.md              # 核心原则
│   ├── file-classification.md          # 文件分类规则
│   ├── gitignore-rules.md              # .gitignore配置规则
│   ├── documentation-consistency.md    # 文档一致性规则
│   └── npm-publishing.md               # npm发布规则
├── analysis/                           # 分析报告
│   ├── strategy-analysis.md            # 战略分析
│   ├── file-inventory.md               # 文件清单
│   └── codebase-research.md            # Codebase调研
├── execution/                          # 执行计划
│   ├── execution-plan.md               # 总体执行计划
│   ├── phase3-dev-version.md           # Phase 3: 开发版本整理
│   ├── phase4-public-version.md        # Phase 4: 开源版本整理
│   ├── phase5-validation.md            # Phase 5: 双版本验证
│   └── phase6-release.md               # Phase 6: 发布准备
├── checklists/                         # 检查清单
│   ├── dev-version-checklist.md        # 开发版本检查清单
│   ├── public-version-checklist.md     # 开源版本检查清单
│   └── validation-checklist.md         # 验证检查清单
└── templates/                          # 模板文件
    ├── .gitignore.dev.template         # 开发版本.gitignore模板
    ├── .gitignore.public.template      # 开源版本.gitignore模板
    ├── package.json.dev.template       # 开发版本package.json模板
    └── package.json.public.template    # 开源版本package.json模板
```

---

## 🎯 **双版本发布战略**

### **核心目标**

MPLP项目采用**双仓库双版本发布策略**，以满足不同用户群体的需求：

| 版本类型 | 仓库 | 目标用户 | 发布范围 |
|---------|------|---------|---------|
| **开发版本** | [MPLP-Protocol-Dev](https://github.com/Coregentis/MPLP-Protocol) | 核心开发团队、贡献者 | 完整开发环境 |
| **开源版本** | [MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol) | 开源社区、企业用户 | 纯净生产版本 |

### **版本差异**

#### **开发版本（Dev）**
- ✅ 保留所有开发工具和配置
- ✅ 保留内部文档和规划
- ✅ 保留测试套件和质量工具
- ✅ 保留CI/CD完整配置
- ✅ 保留方法论和策略文档
- ✅ 使用`.gitignore`（最小排除）

#### **开源版本（Public）**
- ✅ 仅发布生产就绪代码
- ✅ 仅发布用户文档
- ✅ 仅发布必要的构建工具
- ✅ 仅发布公开CI/CD配置
- ✅ 排除所有内部开发内容
- ✅ 使用`.gitignore.public`（最大排除）

---

## 📊 **文件分类规则**

### **类别A: 核心代码（两个版本都包含）**
```
src/                    # 源代码
package.json            # 包配置（需更新repository字段）
package-lock.json       # 依赖锁文件
```

### **类别B: 文档（两个版本都包含）**
```
docs/                   # 用户文档
docs-sdk/               # SDK文档
README.md               # 主README（需更新链接）
CHANGELOG.md            # 变更日志
CONTRIBUTING.md         # 贡献指南
CODE_OF_CONDUCT.md      # 行为准则
LICENSE                 # 许可证
SECURITY.md             # 安全政策
AUTHORS.md              # 贡献者列表
```

### **类别C: 示例（两个版本都包含）**
```
examples/               # 示例应用
sdk/examples/           # SDK示例
```

### **类别D: SDK生态（两个版本都包含）**
```
sdk/packages/           # SDK包
sdk/README.md           # SDK文档
```

### **类别E: 构建输出（仅开源版本）**
```
dist/                   # 预构建输出（开源版本包含，开发版本排除）
```

### **类别F: 开发工具（仅开发版本）**
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

### **类别G: 内部文档（仅开发版本）**
```
NPM-*.md                # npm发布文档
OPEN-SOURCE-*.md        # 开源发布规划
MPLP-OPEN-SOURCE-*.md   # 开源审查文档
DUAL-VERSION-*.md       # 双版本策略文档
dual-version-release/   # 本文件夹
```

### **类别H: 开发配置（仅开发版本）**
```
.gitignore.public       # 开源版本gitignore模板
jest.config.js          # Jest测试配置
tsconfig.json           # TypeScript配置
.eslintrc.json          # ESLint配置
.prettierrc.json        # Prettier配置
```

---

## 🔧 **.gitignore配置策略**

### **开发版本 (.gitignore)**

**策略**: 最小排除 - 仅排除运行时生成的文件

**排除内容**:
- ✅ node_modules/
- ✅ dist/（开发时构建）
- ✅ coverage/
- ✅ *.log
- ✅ .env*（敏感信息）
- ✅ 操作系统临时文件

**保留内容**:
- ✅ 所有源代码
- ✅ 所有开发工具配置
- ✅ 所有内部文档
- ✅ 所有测试套件

### **开源版本 (.gitignore.public)**

**策略**: 最大排除 - 排除所有开发内容

**排除内容**:
- ✅ 所有开发工具配置
- ✅ 所有内部文档
- ✅ 所有测试套件
- ✅ 所有开发脚本
- ✅ 所有方法论文档
- ✅ 所有内部规划文档

**保留内容**:
- ✅ 源代码（src/）
- ✅ 预构建输出（dist/）
- ✅ 用户文档（docs/）
- ✅ 示例代码（examples/）
- ✅ SDK生态（sdk/）
- ✅ 必要的发布脚本

---

## 📋 **快速使用指南**

### **1. 准备开发版本发布**

```bash
# 1. 确保使用开发版本的.gitignore
cp .gitignore .gitignore.dev.backup  # 备份当前配置
# .gitignore已经配置为开发版本

# 2. 更新package.json的repository字段
# 手动编辑package.json，将repository.url更新为：
# "url": "https://github.com/Coregentis/MPLP-Protocol.git"

# 3. 更新所有文档中的GitHub链接
# 使用dual-version-release/execution/phase3-dev-version.md中的脚本

# 4. 验证
npm install
npm run build
npm test
```

### **2. 准备开源版本发布**

```bash
# 1. 切换到开源版本的.gitignore
cp .gitignore.public .gitignore

# 2. 确保dist/目录存在
npm run build

# 3. 更新package.json的repository字段
# 手动编辑package.json，将repository.url更新为：
# "url": "https://github.com/Coregentis/MPLP-Protocol.git"

# 4. 更新所有文档中的GitHub链接
# 使用dual-version-release/execution/phase4-public-version.md中的脚本

# 5. 验证
npm install
git status --ignored  # 查看将被排除的文件
```

### **3. 验证双版本一致性**

```bash
# 使用验证检查清单
# 参考: dual-version-release/checklists/validation-checklist.md
```

---

## 📚 **文档索引**

### **核心文档**
- [README.md](./README.md) (本文件) - 双版本发布管理系统总览
- [FINAL-SUMMARY.md](./FINAL-SUMMARY.md) - 最终总结报告 ✅

### **规则文档**
- [核心原则](./rules/core-principles.md) - 双版本发布的核心原则（R1-R5规则）✅

### **分析报告**
- [用户视角验证](./analysis/user-perspective-validation.md) - 从开源贡献者和普通用户视角验证规则 ✅
- [改进建议](./analysis/improvement-recommendations.md) - 基于用户视角的改进建议 ✅

### **检查清单**
- [开发版本检查清单](./checklists/dev-version-checklist.md) - 开发版本发布检查（10个Phase，100+检查项）✅
- [开源版本检查清单](./checklists/public-version-checklist.md) - 开源版本发布检查（13个Phase，150+检查项）✅

---

## 🔄 **版本更新流程**

### **当需要发布新版本时**

1. **在开发版本仓库开发**
   - 使用`.gitignore`（开发版本配置）
   - 保留所有开发工具和内部文档
   - 完成开发和测试

2. **准备开源版本发布**
   - 切换到`.gitignore.public`
   - 运行`npm run build`生成dist/
   - 更新package.json的repository字段
   - 更新文档中的GitHub链接

3. **验证双版本一致性**
   - 使用验证检查清单
   - 确保src/、docs/、examples/、sdk/在两个版本中一致

4. **发布**
   - 开发版本推送到MPLP-Protocol-Dev
   - 开源版本推送到MPLP-Protocol
   - 从开源版本发布npm包

---

## 🏆 **方法论应用**

本双版本发布管理系统基于**SCTM+GLFB+ITCM+RBCT增强框架**：

- **SCTM**: 系统性批判性思维 - 全局分析双版本需求
- **GLFB**: 全局-局部反馈循环 - 从战略到执行再到验证
- **ITCM**: 智能任务复杂度管理 - 分阶段执行计划
- **RBCT**: 基于规则的约束思维 - 5大核心规则确保一致性

---

## 📞 **支持和维护**

- **维护者**: MPLP Core Team
- **更新频率**: 每次版本发布前检查和更新
- **问题反馈**: 在开发版本仓库提交Issue

---

**文档版本**: 1.0.0  
**最后更新**: 2025年10月19日  
**状态**: ✅ 活跃维护

