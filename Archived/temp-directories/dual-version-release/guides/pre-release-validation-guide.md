# 发布前验证指南
## Pre-Release Validation Guide

**版本**: 1.0.0  
**创建日期**: 2025年10月19日  
**适用于**: MPLP双版本发布管理系统

---

## 🎯 **指南目标**

本指南提供详细的发布前验证操作说明，确保Dev版本和Public版本在发布前通过所有质量检查。

---

## 📊 **验证概述**

### **验证目标**

- ✅ 确保.gitignore配置正确
- ✅ 确保package.json配置正确
- ✅ 确保文档链接一致
- ✅ 确保构建成功
- ✅ 确保测试通过（Dev版本）
- ✅ 确保文档对等性

---

## 🚀 **快速验证**

### **Dev版本验证**

```bash
npm run release:validate-dev
```

### **Public版本验证**

```bash
npm run release:validate-public
```

---

## 📋 **详细验证步骤**

### **Dev版本验证**

#### **步骤1: 验证.gitignore配置**

**目标**: 确保使用Dev版本的.gitignore

**验证方法**:
```bash
# 检查.gitignore是否与.gitignore.public不同
diff .gitignore .gitignore.public
```

**预期结果**: 应该有差异

**失败处理**:
```bash
# 如果相同，说明可能使用了Public版本的.gitignore
# 恢复Dev版本的.gitignore
cp .gitignore.dev.backup .gitignore
```

---

#### **步骤2: 验证package.json**

**目标**: 确保repository字段指向Dev仓库

**验证方法**:
```bash
node -p "require('./package.json').repository.url"
```

**预期结果**: `https://github.com/Coregentis/MPLP-Protocol.git`

**失败处理**:
```bash
# 手动更新repository字段
node scripts/update-package-repository.js https://github.com/Coregentis/MPLP-Protocol
```

---

#### **步骤3: 验证文档链接**

**目标**: 确保所有文档链接指向Dev仓库

**验证方法**:
```bash
npm run links:verify
```

**预期结果**: 所有链接都指向Dev仓库

**失败处理**:
```bash
# 自动切换链接
npm run links:switch-to-dev

# 验证
npm run links:verify
```

---

#### **步骤4: 验证构建**

**目标**: 确保项目可以成功构建

**验证方法**:
```bash
npm run build
```

**预期结果**: 构建成功，生成dist/目录

**失败处理**:
```bash
# 清理并重新构建
rm -rf dist node_modules
npm install
npm run build
```

---

#### **步骤5: 运行测试**

**目标**: 确保所有测试通过

**验证方法**:
```bash
npm test
```

**预期结果**: 2,902/2,902 tests passing

**失败处理**:
```bash
# 查看失败的测试
npm test -- --verbose

# 修复失败的测试
# ...

# 重新运行测试
npm test
```

---

#### **步骤6: 验证文档对等性**

**目标**: 确保docs/en/和docs/zh-CN/文档一致

**验证方法**:
```bash
npm run docs:check-parity
```

**预期结果**: 所有文件在两个语言版本中都存在

**失败处理**:
```bash
# 查看缺失的文件
npm run docs:check-parity

# 手动创建缺失的文件
# ...

# 重新验证
npm run docs:check-parity
```

---

### **Public版本验证**

#### **步骤1: 验证.gitignore配置**

**目标**: 确保使用Public版本的.gitignore

**验证方法**:
```bash
# 检查.gitignore是否与.gitignore.public相同
diff .gitignore .gitignore.public
```

**预期结果**: 应该没有差异

**失败处理**:
```bash
# 如果不同，复制.gitignore.public
cp .gitignore.public .gitignore
```

---

#### **步骤2: 验证package.json**

**目标**: 确保repository字段指向Public仓库

**验证方法**:
```bash
node -p "require('./package.json').repository.url"
```

**预期结果**: `https://github.com/Coregentis/MPLP-Protocol.git`

**失败处理**:
```bash
# 手动更新repository字段
node scripts/update-package-repository.js https://github.com/Coregentis/MPLP-Protocol
```

---

#### **步骤3: 验证文档链接**

**目标**: 确保所有文档链接指向Public仓库

**验证方法**:
```bash
npm run links:verify
```

**预期结果**: 所有链接都指向Public仓库

**失败处理**:
```bash
# 自动切换链接
npm run links:switch-to-public

# 验证
npm run links:verify
```

---

#### **步骤4: 验证构建**

**目标**: 确保项目可以成功构建

**验证方法**:
```bash
npm run build
```

**预期结果**: 构建成功，生成dist/目录

**失败处理**:
```bash
# 清理并重新构建
rm -rf dist node_modules
npm install
npm run build
```

---

#### **步骤5: 验证dist/目录**

**目标**: 确保dist/目录包含所有必要文件

**验证方法**:
```bash
# 检查关键文件
ls -la dist/index.js
ls -la dist/index.d.ts
```

**预期结果**: 所有关键文件都存在

**失败处理**:
```bash
# 重新构建
npm run build

# 如果仍然失败，检查tsconfig.build.json
cat tsconfig.build.json
```

---

#### **步骤6: 验证文档对等性**

**目标**: 确保docs/en/和docs/zh-CN/文档一致

**验证方法**:
```bash
npm run docs:check-parity
```

**预期结果**: 所有文件在两个语言版本中都存在

**失败处理**:
```bash
# 查看缺失的文件
npm run docs:check-parity

# 手动创建缺失的文件
# ...

# 重新验证
npm run docs:check-parity
```

---

## ✅ **验证成功标准**

### **Dev版本**

- ✅ .gitignore配置正确（与.gitignore.public不同）
- ✅ package.json的repository指向Dev仓库
- ✅ 所有文档链接指向Dev仓库
- ✅ 构建成功
- ✅ 所有测试通过（2,905/2,905）
- ✅ 文档对等性检查通过

### **Public版本**

- ✅ .gitignore配置正确（与.gitignore.public相同）
- ✅ package.json的repository指向Public仓库
- ✅ 所有文档链接指向Public仓库
- ✅ 构建成功
- ✅ dist/目录包含所有必要文件
- ✅ 文档对等性检查通过

---

## 🛠️ **故障排除**

### **常见问题1: 构建失败**

**症状**: `npm run build`失败

**可能原因**:
1. TypeScript配置错误
2. 依赖缺失
3. 源代码错误

**解决方案**:
```bash
# 1. 检查TypeScript配置
cat tsconfig.build.json

# 2. 重新安装依赖
rm -rf node_modules
npm install

# 3. 检查源代码错误
npm run typecheck
```

---

### **常见问题2: 文档链接不一致**

**症状**: `npm run links:verify`失败

**可能原因**:
1. 链接未更新
2. 混合使用两个仓库的链接

**解决方案**:
```bash
# 自动切换链接
npm run links:switch-to-dev    # 或 links:switch-to-public

# 验证
npm run links:verify
```

---

### **常见问题3: 文档对等性失败**

**症状**: `npm run docs:check-parity`失败

**可能原因**:
1. 缺少翻译文件
2. 文件名不一致

**解决方案**:
```bash
# 查看详细信息
npm run docs:check-parity

# 手动创建缺失的文件
# 例如: 如果缺少docs/zh-CN/guide.md
# 创建: docs/zh-CN/guide.md

# 重新验证
npm run docs:check-parity
```

---

## 📚 **相关文档**

- [版本切换指南](./version-switching-guide.md) - 双版本切换详细说明
- [核心原则](../rules/core-principles.md) - 双版本发布的核心原则
- [开发版本检查清单](../checklists/dev-version-checklist.md) - Dev版本发布检查
- [开源版本检查清单](../checklists/public-version-checklist.md) - Public版本发布检查

---

## 💡 **最佳实践**

### **发布前**

1. **提前验证**: 在发布前至少提前1天运行验证
2. **修复问题**: 确保所有验证都通过
3. **团队审查**: 让团队成员审查验证结果

### **发布时**

1. **最后验证**: 发布前再次运行验证
2. **记录结果**: 保存验证结果日志
3. **快速回滚**: 如果发现问题，立即回滚

### **发布后**

1. **监控**: 监控npm下载和GitHub issues
2. **快速响应**: 快速响应用户反馈
3. **持续改进**: 根据反馈改进验证流程

---

**指南状态**: ✅ **已完成**  
**最后更新**: 2025年10月19日  
**维护者**: MPLP开发团队

