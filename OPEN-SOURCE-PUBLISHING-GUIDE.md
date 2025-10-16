# MPLP开源发布指南（非破坏性版本）

## 📅 更新日期
2025-10-16

## 🎯 核心原则
**使用SCTM+GLFB+ITCM+RBCT增强框架**

---

## ✅ **关键理解（SCTM批判性验证）**

### **🤔 正确的双库策略**

```
❌ 错误做法：
- 删除内部开发文件
- 破坏开发库的完整性
- 丢失历史和配置

✅ 正确做法：
- 保持内部库完整
- 使用.gitignore.public过滤
- 只推送纯净版到公开库
```

### **双库架构**

```
内部开发库 (MPLP-Protocol-Dev):
├── 所有文件保留 ✅
├── .augment/ ✅ (AI助手规则)
├── .backup-configs/ ✅ (备份配置)
├── Archived/ ✅ (历史归档)
├── config/ ✅ (内部配置)
├── docker/ ✅ (Docker配置)
├── k8s/ ✅ (Kubernetes配置)
├── 内部文档 ✅ (14个文件)
├── 方法论文档 ✅ (SCTM+GLFB+ITCM+RBCT)
└── 所有开发内容 ✅

推送到公开库 (MPLP-Protocol):
├── 核心源代码 ✅ (src/, sdk/)
├── 公开文档 ✅ (docs/, docs-sdk/)
├── 示例代码 ✅ (examples/)
├── 基础配置 ✅ (package.json, tsconfig.json)
└── 开源协议 ✅ (LICENSE)

过滤机制:
└── .gitignore.public (过滤规则)
```

---

## 📋 **内容分类（RBCT规则约束）**

### **✅ 公开发布内容**

#### **核心源代码**
- `src/` - 完整源代码
- `sdk/` - SDK生态系统
- `tests/` - 测试代码

#### **公开文档**
- `README.md` - 项目介绍
- `CHANGELOG.md` - 变更日志
- `CONTRIBUTING.md` - 贡献指南
- `CODE_OF_CONDUCT.md` - 行为准则
- `LICENSE` - 开源协议
- `ROADMAP.md` - 路线图
- `docs/` - 公开文档
- `docs-sdk/` - SDK文档

#### **示例和配置**
- `examples/` - 示例代码（排除开发调试示例）
- `package.json` - 项目配置
- `tsconfig.json` - TypeScript配置
- `jest.config.js` - Jest配置

### **❌ 保密内容（不发布）**

#### **AI助手和开发工具**
- `.augment/` - AI助手规则（SCTM+GLFB+ITCM+RBCT方法论）
- `.backup-configs/` - 备份配置
- `.cursor/` - Cursor编辑器配置
- `.husky/` - Git hooks
- `.pctd/` - 项目配置
- `.quality/` - 质量工具

#### **内部CI/CD**
- `.circleci/` - CircleCI配置
- `.github/` - GitHub Actions

#### **内部文档（14个文件）**
- `COMMIT-HISTORY-CLARIFICATION.md`
- `OPEN-SOURCE-READINESS-REPORT.md`
- `OPEN-SOURCE-RELEASE-PLAN.md`
- `OPEN-SOURCE-SECURITY-CHECKLIST.md`
- `OPEN-SOURCE-PUBLISHING-GUIDE.md`
- `QUALITY-REPORT.md`
- `GOVERNANCE.md`
- `PRIVACY.md`
- `SECURITY.md`
- `MAINTAINERS.md`
- `RELEASE-CHECKLIST.md`
- `BRANCH-MANAGEMENT-*.md` (3个)
- `CI-CD-FIX-SUMMARY.md`

#### **开发内容**
- `Archived/` - 历史归档
- `config/` - 内部配置
- `docker/` - Docker配置
- `k8s/` - Kubernetes配置
- `scripts/` - 大部分开发脚本（保留build.js和test.js）
- `validation-results/` - 验证结果
- `temp_studio/` - 临时工作区

#### **方法论文档**
- `**/*methodology*.md` - 方法论文档
- `**/*strategy*.md` - 策略文档
- `**/*analysis*.md` - 分析文档
- `**/glfb-pseudocode-report.txt` - GLFB报告

#### **开发测试配置**
- `cucumber.config.js`
- `jest.schema-application.config.js`
- `ci-diagnostic-report.json`

#### **中文规划文档**
- `V1.1.0-beta-文档分类整合规划.md`

---

## 🚀 **发布流程（GLFB执行计划）**

### **方式1: 自动化脚本（推荐）**

```bash
# 运行非破坏性发布脚本
bash scripts/publish-to-open-source.sh
```

**脚本执行流程**:
1. ✅ 系统检查（SCTM分析）
2. ✅ 复杂度评估（ITCM评估）
3. ✅ 用户确认
4. ✅ 创建临时分支
5. ✅ 应用.gitignore.public（非破坏性）
6. ✅ 重新索引文件（git rm --cached + git add）
7. ✅ 安全审查（RBCT验证）
8. ✅ 提交和推送到公开库
9. ✅ 清理临时分支
10. ✅ 恢复内部.gitignore

**关键特性**:
- ✅ **不删除**内部文件
- ✅ 只**过滤**推送内容
- ✅ 内部库保持**完整**
- ✅ 可**重复**执行

### **方式2: 手动发布（更安全）**

```bash
# 1. 创建临时分支
git checkout -b public-release-clean

# 2. 备份内部.gitignore
cp .gitignore .gitignore.internal.backup

# 3. 应用公开.gitignore
cp .gitignore.public .gitignore

# 4. 重新索引文件（应用过滤规则）
git rm -r --cached .
git add .

# 5. 查看将要发布的文件
git status
git ls-files | head -50

# 6. 验证内部文件已被过滤
git ls-files | grep -E "\.augment|Archived|config|BRANCH-MANAGEMENT"
# 应该没有输出

# 7. 提交
git commit -m "chore: apply public .gitignore for open source release"

# 8. 推送到公开库
git push release public-release-clean:main --force-with-lease

# 9. 切换回main分支
git checkout main

# 10. 删除临时分支
git branch -D public-release-clean

# 11. 恢复内部.gitignore
mv .gitignore.internal.backup .gitignore
```

---

## 🔍 **验证清单（RBCT安全审查）**

### **发布前验证**

```bash
# 1. 检查.gitignore.public是否存在
ls -la .gitignore.public

# 2. 查看过滤规则
cat .gitignore.public | grep -v "^#" | grep -v "^$"

# 3. 验证内部文件存在（在内部库）
ls -la .augment/
ls -la Archived/
ls -la config/
ls -la .backup-configs/
```

### **发布后验证**

```bash
# 1. 克隆公开库到临时目录
git clone https://github.com/Coregentis/MPLP-Protocol.git /tmp/mplp-public
cd /tmp/mplp-public

# 2. 验证内部文件不存在
ls -la | grep -E "\.augment|Archived|config|backup"
# 应该没有输出

# 3. 验证核心文件存在
ls -la src/
ls -la sdk/
ls -la docs/
ls -la examples/

# 4. 验证内部文档不存在
ls -la | grep -E "BRANCH-MANAGEMENT|CI-CD-FIX|QUALITY-REPORT"
# 应该没有输出

# 5. 运行测试
npm install
npm test
npm run build

# 6. 检查文件数量
echo "公开库文件数: $(git ls-files | wc -l)"
# 应该明显少于内部库
```

### **内部库完整性验证**

```bash
# 切换回内部库
cd /path/to/internal/repo

# 验证所有内部文件仍然存在
ls -la .augment/
ls -la Archived/
ls -la config/
ls -la .backup-configs/
ls -la BRANCH-MANAGEMENT-*.md

# 验证.gitignore是内部版本
cat .gitignore | head -20
```

---

## ⚠️ **重要注意事项**

### **DO ✅**

1. **保持内部库完整**
   - 所有文件都保留在内部库
   - 使用.gitignore.public过滤

2. **使用非破坏性脚本**
   - `git rm --cached` 而不是 `rm -rf`
   - 只影响Git索引，不删除文件

3. **验证过滤效果**
   - 发布前检查将要推送的文件
   - 发布后验证公开库内容

4. **保持双库同步**
   - 重要更新及时推送到公开库
   - 使用相同的发布流程

### **DON'T ❌**

1. **不要删除内部文件**
   - 不要使用 `rm -rf`
   - 不要直接修改内部库

2. **不要混淆两个库**
   - 内部库：完整开发内容
   - 公开库：纯净版本

3. **不要跳过验证**
   - 必须验证过滤效果
   - 必须检查敏感信息

4. **不要直接推送main**
   - 使用临时分支
   - 验证后再推送

---

## 📊 **预期结果**

### **内部库（MPLP-Protocol-Dev）**

```
文件数: ~1000+ 文件
包含:
- 所有源代码
- 所有文档
- 所有配置
- 所有历史
- 所有方法论
```

### **公开库（MPLP-Protocol）**

```
文件数: ~500-600 文件
包含:
- 核心源代码
- 公开文档
- 示例代码
- 基础配置

不包含:
- 内部文档
- 开发工具
- 方法论文档
- 历史归档
```

---

## 🎯 **成功标准**

- [ ] 内部库文件完整（所有文件都在）
- [ ] 公开库纯净（无内部内容）
- [ ] 公开库可用（测试通过，可构建）
- [ ] 无敏感信息泄露
- [ ] 双库可独立维护

---

**文档版本**: 2.0.0 (Non-Destructive)
**最后更新**: 2025-10-16
**框架**: SCTM+GLFB+ITCM+RBCT
**状态**: ✅ **准备就绪，可安全执行**

