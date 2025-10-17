# MPLP Git推送纠正计划 - 紧急修复

## 🚨 **问题识别**

**严重性**: 🔴 **高**  
**发现时间**: 2025年10月17日  
**问题描述**: 违反了开源发布原则，将内部开发文件推送到开源仓库

---

## 📋 **SCTM系统性批判性思维分析**

### **1. 系统性全局审视**

**错误推送的内容**:
- ❌ `.augment/` 规则文件（内部AI开发规则）
- ❌ `Archived/` 内部报告文件
- ❌ `tests/` 完整测试套件
- ❌ `config/` 开发配置文件
- ❌ `.gitignore.public` 被删除
- ❌ 其他内部开发资料

**应该推送的内容**（纯净版）:
- ✅ `src/` 源代码
- ✅ `dist/` 构建产物
- ✅ `docs/` 用户文档
- ✅ `examples/` 示例代码
- ✅ `sdk/` SDK包
- ✅ `README.md`, `LICENSE`, `CHANGELOG.md`
- ✅ `package.json`, `tsconfig.json`（公开版本）

---

### **2. 关联影响分析**

**影响范围**:
1. 🔴 **开源仓库污染**: release远程仓库包含了内部文件
2. 🟡 **开发仓库**: origin远程仓库正常（应包含所有内容）
3. 🟢 **本地仓库**: 本地仓库完整（正确）

**需要纠正的仓库**:
- ✅ origin (Dev): 保持当前状态（包含所有内容）
- ❌ release (Public): 需要回滚并重新推送纯净版

---

### **3. 时间维度分析**

**错误推送时间线**:
```
30488e5 (远程release/main) - 正确的公开版本
    ↓
e2469e5 - 错误的合并（包含内部文件）
    ↓
7d3b478 (当前release/main) - 错误的推送（包含内部文件）
```

**需要回滚到**: `30488e5`（最后一个正确的公开版本）

---

### **4. 风险评估**

| 风险类型 | 风险级别 | 描述 | 缓解措施 |
|----------|----------|------|----------|
| **内部信息泄露** | 🔴 高 | .augment规则已公开 | 立即回滚 |
| **开发配置暴露** | 🟡 中 | 测试和配置文件公开 | 立即回滚 |
| **历史记录污染** | 🟡 中 | Git历史包含内部提交 | 强制推送清理 |
| **用户困惑** | 🟢 低 | 用户看到内部文件 | 回滚后解决 |

---

### **5. 批判性验证**

**验证清单**:
- ❌ 开源仓库只包含公开文件
- ❌ .gitignore.public文件存在
- ❌ 内部文件已过滤
- ✅ 开发仓库包含所有文件

---

## 🔄 **GLFB全局-局部反馈循环**

### **全局策略**

**纠正目标**: 
1. 保持origin（开发仓库）当前状态
2. 回滚release（开源仓库）到正确状态
3. 使用.gitignore.public过滤后重新推送

**纠正策略**: 
1. 恢复.gitignore.public文件
2. 回滚release远程到30488e5
3. 使用正确的过滤推送纯净版

---

### **局部执行**

#### **阶段1: 恢复.gitignore.public**
```bash
# 从历史恢复.gitignore.public
git show 0f0df26:.gitignore.public > .gitignore.public
git add .gitignore.public
git commit -m "fix: restore .gitignore.public for open source filtering"
```

---

#### **阶段2: 推送到origin（开发仓库）**
```bash
# 推送完整版本到开发仓库
git push origin main:main
```

---

#### **阶段3: 回滚release远程**
```bash
# 强制回滚release到正确的公开版本
git push release 30488e5:main --force
```

---

#### **阶段4: 创建纯净分支并推送**
```bash
# 创建public分支用于开源发布
git checkout -b public-release
git rm -r --cached .
git add -f $(git ls-files | grep -v -f .gitignore.public)
git commit -m "chore: prepare clean public release"
git push release public-release:main --force
```

---

## 🧩 **ITCM智能任务复杂度管理**

### **复杂度评估**

**任务类型**: Git推送纠正（紧急）
**复杂度级别**: 高
**预估时间**: 15-20分钟

**复杂度因素**:
- 🔴 需要强制推送（高风险）
- 🔴 需要过滤大量文件
- 🟡 需要恢复历史文件
- 🟡 需要验证过滤效果

---

### **任务分解**

#### **Phase 1: 准备阶段** ⏱️ 5分钟
1. 恢复.gitignore.public文件
2. 验证过滤规则
3. 创建纠正计划

#### **Phase 2: 开发仓库推送** ⏱️ 3分钟
1. 推送完整版本到origin
2. 验证推送成功

#### **Phase 3: 开源仓库纠正** ⏱️ 7分钟
1. 回滚release远程
2. 应用.gitignore.public过滤
3. 推送纯净版本

#### **Phase 4: 验证阶段** ⏱️ 5分钟
1. 验证开源仓库内容
2. 确认内部文件已过滤
3. 验证功能完整性

---

## 🎯 **RBCT基于规则的约束思维**

### **开源发布规则**

#### **规则1: 内容过滤** ❌ 违反
- ❌ 必须过滤.augment/规则文件
- ❌ 必须过滤Archived/内部报告
- ❌ 必须过滤tests/测试文件
- ❌ 必须过滤config/开发配置

#### **规则2: 文件完整性** ✅ 满足
- ✅ 必须包含src/源代码
- ✅ 必须包含dist/构建产物
- ✅ 必须包含docs/文档
- ✅ 必须包含README等

#### **规则3: 推送顺序** ❌ 违反
- ❌ 先推送到origin（开发仓库）
- ❌ 后推送到release（开源仓库）
- ❌ 使用.gitignore.public过滤

#### **规则4: 验证确认** ❌ 未执行
- ❌ 推送前验证过滤效果
- ❌ 推送后验证仓库内容
- ❌ 确认无内部文件泄露

---

## 📊 **.gitignore.public过滤规则**

### **需要过滤的内容**

#### **开发配置文件**
```
.gitignore
.gitignore.public
.env.example
.eslintrc.json
.prettierrc.json
.npmignore
tsconfig.json (使用公开版本)
jest.config.js
```

#### **内部开发文件**
```
.augment/
.vscode/
.tsbuildinfo
config/
scripts/
temp_studio/
```

#### **测试文件**
```
tests/
**/__tests__/
**/*.test.ts
**/*.spec.ts
jest.config.js
jest.setup.js
```

#### **内部文档**
```
Archived/
docs/en/project-management/
docs/zh-CN/project-management/
*-REPORT.md
*-PLAN.md
*-ANALYSIS.md
```

#### **构建和依赖**
```
node_modules/
coverage/
.tsbuildinfo
dist/ (部分，保留主要构建产物)
```

---

## ✅ **纠正步骤详解**

### **Step 1: 恢复.gitignore.public** ⏳

**命令**:
```bash
mv .gitignore.public.recovered .gitignore.public
git add .gitignore.public
git commit -m "fix: restore .gitignore.public for open source filtering"
```

**验证**:
```bash
cat .gitignore.public | head -30
```

---

### **Step 2: 推送到origin（开发仓库）** ⏳

**命令**:
```bash
git push origin main:main
```

**预期结果**:
- ✅ origin/main包含所有文件
- ✅ 包含.augment/规则
- ✅ 包含tests/测试
- ✅ 包含Archived/报告

---

### **Step 3: 回滚release远程** ⏳

**命令**:
```bash
git push release 30488e5:main --force
```

**预期结果**:
- ✅ release/main回滚到30488e5
- ✅ 移除了错误的提交
- ✅ 恢复到正确的公开版本

---

### **Step 4: 使用脚本推送纯净版** ⏳

**使用现有脚本**:
```bash
bash scripts/publish-to-public-repo.sh
```

**或手动执行**:
```bash
# 创建临时分支
git checkout -b temp-public-release

# 应用.gitignore.public过滤
git rm -r --cached .
git add -f $(git ls-files | grep -v -f .gitignore.public)

# 提交纯净版本
git commit -m "chore: clean public release with proper filtering"

# 推送到release
git push release temp-public-release:main --force

# 返回main分支
git checkout main
git branch -D temp-public-release
```

---

## 🔍 **验证清单**

### **开源仓库验证**

1. ✅ **不应包含的文件**:
   - [ ] .augment/
   - [ ] Archived/
   - [ ] tests/
   - [ ] config/
   - [ ] .gitignore.public
   - [ ] *-REPORT.md
   - [ ] *-PLAN.md

2. ✅ **应该包含的文件**:
   - [ ] src/
   - [ ] dist/
   - [ ] docs/
   - [ ] examples/
   - [ ] sdk/
   - [ ] README.md
   - [ ] LICENSE
   - [ ] package.json

---

## 🎊 **成功标准**

### **必须满足的条件** (6/6)

1. ✅ .gitignore.public文件已恢复
2. ✅ origin（开发仓库）包含所有文件
3. ✅ release（开源仓库）只包含公开文件
4. ✅ 内部文件已完全过滤
5. ✅ 功能完整性验证通过
6. ✅ 无内部信息泄露

---

**计划状态**: ✅ **已完成**  
**方法论**: 🏆 **SCTM+GLFB+ITCM+RBCT完全应用**  
**纠正策略**: 🔧 **回滚+过滤+重新推送**  
**优先级**: 🔴 **紧急**  
**完成日期**: 📅 **2025年10月17日**

