# 双版本切换指南
## Version Switching Guide

**版本**: 1.0.0  
**创建日期**: 2025年10月19日  
**适用于**: MPLP双版本发布管理系统

---

## 🎯 **指南目标**

本指南提供详细的双版本切换操作说明，帮助开发者在Dev版本和Public版本之间快速切换。

---

## 📊 **版本概述**

### **Dev版本（开发版本）**
- **仓库**: https://github.com/Coregentis/MPLP-Protocol-Dev-Dev
- **用途**: 开发、测试、贡献代码
- **.gitignore**: 最小排除（仅运行时生成文件）
- **包含内容**: 所有开发工具、测试套件、内部文档

### **Public版本（开源版本）**
- **仓库**: https://github.com/Coregentis/MPLP-Protocol-Dev-Dev
- **用途**: npm发布、用户使用
- **.gitignore**: 最大排除（所有开发内容）
- **包含内容**: 生产代码、用户文档、预构建输出

---

## 🚀 **快速切换**

### **方法1: 使用npm脚本（推荐）**

#### **切换到Dev版本**
```bash
npm run version:switch-to-dev
```

#### **切换到Public版本**
```bash
npm run version:switch-to-public
```

### **方法2: 使用脚本直接调用**

#### **切换到Dev版本**
```bash
bash scripts/switch-version.sh dev
```

#### **切换到Public版本**
```bash
bash scripts/switch-version.sh public
```

---

## 📋 **详细切换步骤**

### **切换到Dev版本**

#### **自动化步骤（脚本执行）**

1. **备份当前.gitignore**
   - 备份到`.gitignore.backup`

2. **确认使用Dev版本的.gitignore**
   - Dev版本的.gitignore已经是当前的.gitignore

3. **更新package.json的repository字段**
   - 更新为: `https://github.com/Coregentis/MPLP-Protocol-Dev-Dev.git`

4. **更新文档中的GitHub链接**
   - 自动替换所有文档中的链接为Dev仓库

5. **清理dist/目录**
   - Dev版本不需要预构建输出

#### **手动验证步骤**

```bash
# 1. 查看变更
git status --ignored

# 2. 运行测试
npm test

# 3. 提交变更
git add .
git commit -m "chore: switch to dev version"
```

---

### **切换到Public版本**

#### **自动化步骤（脚本执行）**

1. **备份当前.gitignore**
   - 备份到`.gitignore.dev.backup`

2. **切换到Public版本的.gitignore**
   - 复制`.gitignore.public`到`.gitignore`

3. **构建项目**
   - 运行`npm run build`生成dist/目录

4. **验证dist/目录**
   - 检查dist/index.js和dist/index.d.ts是否存在

5. **更新package.json的repository字段**
   - 更新为: `https://github.com/Coregentis/MPLP-Protocol-Dev-Dev.git`

6. **更新文档中的GitHub链接**
   - 自动替换所有文档中的链接为Public仓库

#### **手动验证步骤**

```bash
# 1. 查看变更
git status --ignored

# 2. 运行发布前验证
npm run release:validate-public

# 3. 提交变更
git add .
git commit -m "chore: switch to public version"

# 4. 发布到npm（可选）
npm publish --tag beta
```

---

## 🔍 **验证切换结果**

### **验证.gitignore配置**

```bash
# Dev版本
diff .gitignore .gitignore.public
# 应该有差异

# Public版本
diff .gitignore .gitignore.public
# 应该没有差异
```

### **验证package.json**

```bash
# 查看repository字段
node -p "require('./package.json').repository.url"

# Dev版本应该输出:
# https://github.com/Coregentis/MPLP-Protocol-Dev-Dev.git

# Public版本应该输出:
# https://github.com/Coregentis/MPLP-Protocol-Dev-Dev.git
```

### **验证文档链接**

```bash
npm run links:verify
```

### **验证dist/目录**

```bash
# Dev版本
ls dist/
# 应该不存在或为空

# Public版本
ls dist/
# 应该包含index.js, index.d.ts等文件
```

---

## ⚠️ **注意事项**

### **切换前**

1. **提交所有未提交的更改**
   ```bash
   git status
   git add .
   git commit -m "chore: save work before version switch"
   ```

2. **确保工作目录干净**
   ```bash
   git status
   # 应该显示: nothing to commit, working tree clean
   ```

### **切换后**

1. **检查.gitignore变更**
   - 使用`git status --ignored`查看哪些文件被忽略

2. **验证构建**
   - Dev版本: `npm run build && npm test`
   - Public版本: `npm run build && npm run release:validate-public`

3. **检查文档链接**
   - 运行`npm run links:verify`确保链接一致

---

## 🛠️ **故障排除**

### **问题1: 切换后构建失败**

**症状**: 运行`npm run build`失败

**解决方案**:
```bash
# 1. 清理node_modules
rm -rf node_modules
npm install

# 2. 清理dist
rm -rf dist

# 3. 重新构建
npm run build
```

### **问题2: 文档链接不一致**

**症状**: `npm run links:verify`失败

**解决方案**:
```bash
# 手动切换链接
npm run links:switch-to-dev    # 或 links:switch-to-public

# 验证
npm run links:verify
```

### **问题3: .gitignore配置错误**

**症状**: 不应该被忽略的文件被忽略了

**解决方案**:
```bash
# Dev版本
cp .gitignore.dev.backup .gitignore  # 如果有备份

# Public版本
cp .gitignore.public .gitignore
```

---

## 📚 **相关文档**

- [核心原则](../rules/core-principles.md) - 双版本发布的核心原则
- [开发版本检查清单](../checklists/dev-version-checklist.md) - Dev版本发布检查
- [开源版本检查清单](../checklists/public-version-checklist.md) - Public版本发布检查
- [发布前验证指南](./pre-release-validation-guide.md) - 发布前验证详细说明

---

## 💡 **最佳实践**

### **开发工作流**

1. **日常开发**: 使用Dev版本
   ```bash
   npm run version:switch-to-dev
   # 开发、测试、提交
   ```

2. **准备发布**: 切换到Public版本
   ```bash
   npm run version:switch-to-public
   npm run release:validate-public
   ```

3. **发布后**: 切换回Dev版本
   ```bash
   npm publish --tag beta
   npm run version:switch-to-dev
   ```

### **团队协作**

1. **统一版本**: 团队成员应该使用相同的版本
2. **明确标识**: 在PR中明确说明使用的版本
3. **避免混合**: 不要在同一个PR中混合两个版本的更改

---

**指南状态**: ✅ **已完成**  
**最后更新**: 2025年10月19日  
**维护者**: MPLP开发团队

