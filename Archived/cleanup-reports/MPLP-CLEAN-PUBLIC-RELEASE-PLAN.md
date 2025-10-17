# MPLP纯净开源版本发布计划

## 🎯 **任务目标**

**核心原则**: 开源仓库是用户使用MPLP构建项目的库，不是内部开发仓库！

**方法论**: SCTM+GLFB+ITCM+RBCT增强框架

---

## 📊 **SCTM系统性批判性思维分析**

### **1. 系统性全局审视**

#### **开源仓库 vs 开发仓库的本质区别**

| 维度 | 开源仓库 (release) | 开发仓库 (origin) |
|------|-------------------|------------------|
| **目的** | 用户使用MPLP构建应用 | 内部开发和维护 |
| **受众** | 外部开发者 | 内部团队 |
| **内容** | 生产就绪的代码 + 文档 | 完整开发环境 |
| **类比** | npm包 | 源代码仓库 |

#### **应该包含的内容（用户需要）**

✅ **核心功能代码**:
- `src/` - 源代码
- `dist/` - 构建产物（用户可直接使用）
- `sdk/` - SDK包（排除开发文件）

✅ **用户文档**:
- `README.md` - 项目介绍
- `QUICK_START.md` - 快速开始
- `CHANGELOG.md` - 版本变更
- `LICENSE` - 许可证
- `CONTRIBUTING.md` - 贡献指南
- `CODE_OF_CONDUCT.md` - 行为准则
- `ROADMAP.md` - 路线图
- `TROUBLESHOOTING.md` - 故障排除
- `docs/` - 用户文档（排除内部文档）

✅ **示例应用**:
- `examples/` - 示例代码（排除开发文件）

✅ **配置文件**:
- `package.json` - 包配置
- `package-lock.json` - 依赖锁定

✅ **CI/CD**:
- `.github/workflows/` - GitHub Actions（仅公开工作流）

#### **不应该包含的内容（内部开发）**

❌ **开发配置**:
- `.gitignore` - Git配置
- `.gitignore.public` - 过滤规则
- `tsconfig.json` - TypeScript配置
- `jest.config.js` - 测试配置
- `.eslintrc.*` - 代码检查配置
- `.prettierrc.*` - 代码格式化配置
- `.vscode/` - IDE配置

❌ **测试文件**:
- `tests/` - 测试套件
- `**/*.test.ts` - 单元测试
- `**/*.spec.ts` - 规范测试
- `coverage/` - 测试覆盖率

❌ **内部文档**:
- `Archived/` - 归档文档
- `config/` - 内部配置
- `scripts/` - 开发脚本（除必要的）
- `.augment/` - AI助手规则
- `MPLP-OPEN-SOURCE-*.md` - 内部规划文档
- `*-文档分类整合规划.md` - 中文规划文档

❌ **开发工具**:
- `temp_studio/` - 临时工作区
- `docker/` - Docker配置
- `k8s/` - Kubernetes配置

❌ **SDK开发文件**:
- `sdk/node_modules/` - 依赖
- `sdk/dist/` - SDK构建产物
- `sdk/packages/*/dist/` - 包构建产物
- `sdk/packages/*/node_modules/` - 包依赖
- `sdk/coverage/` - 测试覆盖率

### **2. 关联影响分析**

#### **当前问题**

1. **问题**: 使用`git push release main:main --force`推送了完整的main分支
2. **影响**: 所有内部开发文件都被推送到公开仓库
3. **风险**: 
   - 暴露内部开发流程
   - 暴露AI助手规则
   - 暴露内部文档和规划
   - 仓库体积过大

#### **正确方法**

1. **创建临时分支**
2. **从索引中移除所有文件**
3. **仅添加公开文件**
4. **提交并强制推送到release/main**
5. **清理临时分支**

### **3. 时间维度分析**

#### **历史问题**

- 第1次: 推送了所有内容
- 第2次: 纠正后仍然推送了所有内容
- 第3次: 添加GitHub Actions后又推送了所有内容

#### **根本原因**

- 没有使用`.gitignore.public`进行过滤
- 直接推送main分支而不是创建过滤后的临时分支

### **4. 风险评估**

#### **技术风险**

- ✅ 低风险: 代码质量高，测试完整
- ⚠️ 中风险: 仓库体积过大
- ⚠️ 中风险: 内部文件暴露

#### **安全风险**

- ✅ 低风险: 无敏感信息（密钥、密码等）
- ⚠️ 中风险: 内部开发流程暴露
- ⚠️ 中风险: AI助手规则暴露

### **5. 批判性验证**

#### **验证清单**

- [ ] 仅包含用户需要的文件
- [ ] 排除所有内部开发文件
- [ ] 排除所有测试文件
- [ ] 排除所有配置文件
- [ ] 保留必要的文档
- [ ] 保留示例应用
- [ ] 保留GitHub Actions工作流

---

## 🔄 **GLFB全局-局部反馈循环**

### **1. 全局规划**

#### **目标**

创建一个纯净的开源版本，仅包含用户使用MPLP构建项目所需的内容

#### **策略**

1. 创建临时分支
2. 清空索引
3. 选择性添加文件
4. 强制推送到release/main
5. 验证结果

### **2. 局部执行**

#### **Phase 1: 准备**

```bash
# 1. 确认当前分支
git branch --show-current

# 2. 创建临时分支
TEMP_BRANCH="temp-clean-public-$(date +%s)"
git checkout -b "$TEMP_BRANCH"
```

#### **Phase 2: 清空索引**

```bash
# 移除所有文件从索引
git rm -r --cached .
```

#### **Phase 3: 添加公开文件**

```bash
# 核心代码
git add -f src/
git add -f dist/

# 用户文档
git add -f README.md
git add -f QUICK_START.md
git add -f CHANGELOG.md
git add -f LICENSE
git add -f CONTRIBUTING.md
git add -f CODE_OF_CONDUCT.md
git add -f ROADMAP.md
git add -f TROUBLESHOOTING.md

# 文档目录（排除内部文档）
git add -f docs/en/
git add -f docs/zh/
git add -f docs/README.md

# 示例应用（排除开发文件）
git add -f examples/agent-orchestrator/
git add -f examples/marketing-automation/
git add -f examples/social-media-bot/
git add -f examples/README.md

# SDK（排除开发文件）
git add -f sdk/packages/
git add -f sdk/examples/
git add -f sdk/README.md
git add -f sdk/DEVELOPMENT.md

# 配置文件
git add -f package.json
git add -f package-lock.json

# GitHub Actions
git add -f .github/workflows/
```

#### **Phase 4: 提交和推送**

```bash
# 提交
git commit -m "chore: clean public release - user-facing content only"

# 强制推送到release/main
git push release "$TEMP_BRANCH":main --force
```

#### **Phase 5: 清理**

```bash
# 返回main分支
git checkout main

# 删除临时分支
git branch -D "$TEMP_BRANCH"
```

### **3. 反馈验证**

#### **验证步骤**

1. 访问GitHub公开仓库
2. 检查文件列表
3. 确认无内部文件
4. 确认有必要文件

### **4. 循环优化**

#### **如果发现问题**

1. 重新执行Phase 1-5
2. 调整添加的文件列表
3. 再次验证

---

## 🎯 **ITCM智能任务复杂度管理**

### **1. 复杂度评估**

**任务复杂度**: 中等

**原因**:
- 需要精确选择文件
- 需要多步骤操作
- 需要验证结果

### **2. 执行策略**

**策略**: 脚本自动化

**优势**:
- 减少人为错误
- 可重复执行
- 易于验证

### **3. 质量控制**

**检查点**:
1. 文件选择正确性
2. 推送成功性
3. 结果验证

---

## 🔒 **RBCT基于规则的约束思维**

### **1. 规则识别**

#### **核心规则**

1. **规则1**: 开源仓库仅包含用户需要的文件
2. **规则2**: 排除所有内部开发文件
3. **规则3**: 排除所有测试文件
4. **规则4**: 排除所有配置文件
5. **规则5**: 保留必要的文档和示例

### **2. 约束应用**

#### **文件选择约束**

- ✅ 必须: src/, dist/, docs/, examples/, sdk/
- ✅ 必须: README.md, LICENSE, CHANGELOG.md等
- ❌ 禁止: tests/, config/, Archived/, .augment/
- ❌ 禁止: *.test.ts, *.spec.ts, jest.config.js等

### **3. 合规验证**

#### **验证清单**

- [ ] 无.augment/目录
- [ ] 无Archived/目录
- [ ] 无tests/目录
- [ ] 无config/目录
- [ ] 无*.test.ts文件
- [ ] 无jest.config.js文件
- [ ] 有src/目录
- [ ] 有dist/目录
- [ ] 有docs/目录
- [ ] 有examples/目录
- [ ] 有README.md文件

---

## 🚀 **执行计划**

### **Step 1: 创建自动化脚本**

创建`push-clean-public-release-v2.sh`脚本

### **Step 2: 执行脚本**

运行脚本推送纯净版本

### **Step 3: 验证结果**

检查GitHub公开仓库

### **Step 4: 归档文档**

归档本计划文档

---

**计划状态**: ✅ **准备就绪**  
**方法论**: 🏆 **SCTM+GLFB+ITCM+RBCT完全应用**  
**执行时间**: ⏱️ **预计15分钟**  
**创建日期**: 📅 **2025年10月17日**

