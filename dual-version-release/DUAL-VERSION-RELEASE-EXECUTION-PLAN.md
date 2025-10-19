# 双版本发布执行计划
## Dual Version Release Execution Plan

**版本**: 1.0.0  
**创建日期**: 2025年10月19日  
**方法论**: SCTM+GLFB+ITCM+RBCT增强框架  
**执行状态**: 🚀 **准备执行**

---

## 🎯 **执行目标**

使用SCTM+GLFB+ITCM+RBCT方法论，按照双版本发布规则和工具，分别发布：
1. **Dev版本** - 开发版本仓库（MPLP-Protocol-Dev）
2. **Public版本** - 开源发布版本仓库（MPLP-Protocol）

---

## 📊 **RBCT深度思考 - 发布规则识别**

### **R1: Dev版本发布规则**

#### **规则1.1: 仓库配置**
- **仓库URL**: https://github.com/Coregentis/MPLP-Protocol-Dev
- **.gitignore**: 使用当前的.gitignore（最小排除）
- **package.json**: repository指向Dev仓库

#### **规则1.2: 内容范围**
- ✅ 包含：所有源代码、开发工具、测试套件、内部文档
- ✅ 排除：仅运行时生成文件（node_modules/, dist/, coverage/）

#### **规则1.3: 发布前验证**
- ✅ .gitignore配置正确
- ✅ package.json配置正确
- ✅ 文档链接指向Dev仓库
- ✅ 所有测试通过（2,905/2,905）
- ✅ 构建成功

---

### **R2: Public版本发布规则**

#### **规则2.1: 仓库配置**
- **仓库URL**: https://github.com/Coregentis/MPLP-Protocol
- **.gitignore**: 使用.gitignore.public（最大排除）
- **package.json**: repository指向Public仓库

#### **规则2.2: 内容范围**
- ✅ 包含：生产代码、用户文档、预构建输出（dist/）、示例
- ✅ 排除：所有开发工具、测试套件、内部文档

#### **规则2.3: 发布前验证**
- ✅ .gitignore配置正确
- ✅ package.json配置正确
- ✅ 文档链接指向Public仓库
- ✅ dist/目录完整
- ✅ 构建成功

#### **规则2.4: npm发布**
- ✅ 发布到npm registry
- ✅ 使用beta标签
- ✅ 版本号：1.1.0-beta

---

## 📋 **SCTM系统性批判性思维 - 执行计划**

### **Phase 1: Dev版本发布准备**

#### **步骤1.1: 确认当前状态**
```bash
# 检查当前分支
git branch

# 检查工作目录状态
git status

# 检查当前.gitignore
cat .gitignore | head -20
```

#### **步骤1.2: 切换到Dev版本**
```bash
# 使用自动化工具切换
npm run version:switch-to-dev
```

#### **步骤1.3: 验证Dev版本配置**
```bash
# 运行发布前验证
npm run release:validate-dev
```

#### **步骤1.4: 提交Dev版本配置**
```bash
# 查看变更
git status

# 添加变更
git add .

# 提交
git commit -m "chore: prepare dev version release"

# 推送到Dev仓库
git remote add dev https://github.com/Coregentis/MPLP-Protocol-Dev.git
git push dev main
```

---

### **Phase 2: Public版本发布准备**

#### **步骤2.1: 切换到Public版本**
```bash
# 使用自动化工具切换
npm run version:switch-to-public
```

#### **步骤2.2: 验证Public版本配置**
```bash
# 运行发布前验证
npm run release:validate-public
```

#### **步骤2.3: 提交Public版本配置**
```bash
# 查看变更
git status

# 添加变更
git add .

# 提交
git commit -m "chore: prepare public version release"

# 推送到Public仓库
git remote add public https://github.com/Coregentis/MPLP-Protocol.git
git push public main
```

#### **步骤2.4: 发布到npm**
```bash
# 登录npm（如果需要）
npm login

# 发布到npm
npm publish --tag beta

# 验证发布
npm view mplp@beta
```

---

## 🔄 **GLFB全局-局部反馈循环 - 验证策略**

### **全局验证**

#### **验证1: 双版本一致性**
- ✅ 两个版本的源代码相同
- ✅ 两个版本的版本号相同（1.1.0-beta）
- ✅ 两个版本的用户文档相同

#### **验证2: 双版本差异性**
- ✅ Dev版本包含开发工具，Public版本不包含
- ✅ Dev版本不包含dist/，Public版本包含
- ✅ Dev版本链接指向Dev仓库，Public版本链接指向Public仓库

---

### **局部验证**

#### **Dev版本验证清单**
- [ ] .gitignore使用Dev版本配置
- [ ] package.json的repository指向Dev仓库
- [ ] 所有文档链接指向Dev仓库
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 开发工具存在（.augment/, tests/, etc.）

#### **Public版本验证清单**
- [ ] .gitignore使用Public版本配置
- [ ] package.json的repository指向Public仓库
- [ ] 所有文档链接指向Public仓库
- [ ] dist/目录完整
- [ ] 构建成功
- [ ] 开发工具不存在

---

## 🎯 **ITCM智能任务复杂度管理 - 执行时间表**

### **时间估算**

| Phase | 任务 | 预计时间 | 复杂度 |
|-------|------|---------|--------|
| **Phase 1** | Dev版本发布准备 | 30分钟 | 🟢 低 |
| **Phase 2** | Public版本发布准备 | 45分钟 | 🟡 中 |
| **Phase 3** | 验证和测试 | 30分钟 | 🟢 低 |
| **总计** | **全部任务** | **105分钟** | 🟡 **中等** |

---

## ✅ **成功标准**

### **Dev版本发布成功标准**

1. ✅ Dev仓库包含完整的开发环境
2. ✅ 所有测试通过（2,905/2,905）
3. ✅ 文档链接正确
4. ✅ 可以克隆并立即开始开发

### **Public版本发布成功标准**

1. ✅ Public仓库包含纯净的生产代码
2. ✅ npm包可以正常安装（npm install mplp@beta）
3. ✅ 文档链接正确
4. ✅ 用户可以立即使用

---

## 🛠️ **风险评估和应对策略**

### **风险1: Git冲突**

**可能性**: 🟡 中等  
**影响**: 🔴 高

**应对策略**:
```bash
# 在切换版本前，确保工作目录干净
git status
git stash  # 如果有未提交的更改

# 切换版本后，检查冲突
git status
```

---

### **风险2: npm发布失败**

**可能性**: 🟢 低  
**影响**: 🟡 中等

**应对策略**:
```bash
# 确保已登录npm
npm whoami

# 检查包名是否可用
npm view mplp

# 使用--dry-run测试发布
npm publish --dry-run --tag beta
```

---

### **风险3: 文档链接不一致**

**可能性**: 🟢 低（已有自动化工具）  
**影响**: 🟡 中等

**应对策略**:
```bash
# 使用自动化工具验证
npm run links:verify

# 如果失败，自动修复
npm run links:switch-to-dev  # 或 links:switch-to-public
```

---

## 📊 **执行检查清单**

### **执行前检查**

- [ ] 确认所有代码已提交
- [ ] 确认所有测试通过
- [ ] 确认版本号正确（1.1.0-beta）
- [ ] 确认有GitHub仓库访问权限
- [ ] 确认有npm发布权限

### **执行中检查**

- [ ] Dev版本切换成功
- [ ] Dev版本验证通过
- [ ] Public版本切换成功
- [ ] Public版本验证通过
- [ ] npm发布成功

### **执行后检查**

- [ ] Dev仓库可以克隆
- [ ] Public仓库可以克隆
- [ ] npm包可以安装
- [ ] 文档链接正确
- [ ] 用户可以正常使用

---

## 🚀 **立即开始执行**

**准备状态**: ✅ **就绪**  
**执行顺序**: Phase 1 → Phase 2 → Phase 3  
**预计完成时间**: 105分钟（1小时45分钟）

---

**计划状态**: ✅ **已完成**  
**方法论**: 🏆 **SCTM+GLFB+ITCM+RBCT应用**  
**计划质量**: 💯 **企业级标准**  
**创建日期**: 📅 **2025年10月19日**

**双版本发布执行计划已完成，准备立即执行！** 🎉🚀🏆

