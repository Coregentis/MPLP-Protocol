# MPLP双版本发布执行计划
## 基于SCTM+GLFB+ITCM+RBCT的系统性实施方案

**版本**: 1.0.0
**创建日期**: 2025年10月19日
**方法论**: SCTM+GLFB+ITCM+RBCT增强框架
**执行模式**: 总-分-总（Global → Local → Global）

---

## 🎯 **执行总览（Global Overview）**

### **双版本发布战略**

| 阶段 | 任务 | 预计时间 | 状态 |
|------|------|---------|------|
| **Phase 0** | RBCT深度思考和规则制定 | 60分钟 | ✅ 已完成 |
| **Phase 1** | Codebase深度调研 | 90分钟 | ✅ 已完成 |
| **Phase 2** | 文件清单和验证 | 60分钟 | ✅ 已完成 |
| **Phase 3** | 开发版本整理 | 120分钟 | ⏸️ 待执行 |
| **Phase 4** | 开源版本整理 | 180分钟 | ⏸️ 待执行 |
| **Phase 5** | 双版本验证 | 90分钟 | ⏸️ 待执行 |
| **Phase 6** | 发布准备 | 60分钟 | ⏸️ 待执行 |

**总预计时间**: 660分钟（11小时）
**已完成时间**: 210分钟（3.5小时）
**剩余时间**: 450分钟（7.5小时）

---

## 📋 **Phase 3: 开发版本整理（120分钟）**

### **目标**: 确保开发版本仓库完整且一致

### **3.1 验证.gitignore配置（15分钟）**

#### **任务清单**
- [ ] 检查当前.gitignore内容
- [ ] 确保仅排除运行时生成的文件
- [ ] 确保不排除开发工具和配置
- [ ] 确保不排除测试套件
- [ ] 确保不排除内部文档

#### **预期.gitignore内容**
```gitignore
# 运行时生成的文件
node_modules/
dist/
coverage/
*.log
.env
.env.local
.env.production
.env.staging

# 操作系统文件
.DS_Store
.DS_Store?
._*
Thumbs.db

# IDE临时文件
*.swp
*.swo
*~

# 构建缓存
.npm
.eslintcache
*.tsbuildinfo

# 临时文件
tmp/
temp/
cache/
.cache/
```

### **3.2 更新package.json（15分钟）**

#### **任务清单**
- [ ] 更新repository.url为Dev仓库
- [ ] 更新bugs.url为Dev仓库
- [ ] 更新homepage为Dev仓库
- [ ] 验证version为1.1.0-beta
- [ ] 验证name为mplp
- [ ] 验证所有scripts正常

#### **更新内容**
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev.git"
  },
  "bugs": {
    "url": "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev/issues"
  },
  "homepage": "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev#readme"
}
```

### **3.3 更新README.md（30分钟）**

#### **任务清单**
- [ ] 更新所有GitHub链接为Dev仓库
- [ ] 更新Issues链接
- [ ] 更新Discussions链接
- [ ] 更新PR链接
- [ ] 验证安装说明
- [ ] 验证快速开始指南

#### **需要更新的链接**
```markdown
# 从
https://github.com/Coregentis/MPLP-Protocol-Dev-Dev

# 更新为
https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev
```

### **3.4 更新所有文档中的链接（45分钟）**

#### **任务清单**
- [ ] 更新docs/en/中所有GitHub链接
- [ ] 更新docs/zh-CN/中所有GitHub链接
- [ ] 更新docs-sdk/中所有GitHub链接
- [ ] 更新examples/中所有GitHub链接
- [ ] 更新sdk/中所有GitHub链接

#### **批量更新脚本**
```bash
# 查找所有需要更新的文件
find . -type f \( -name "*.md" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/coverage/*" \
  -exec grep -l "github.com/Coregentis/MPLP-Protocol-Dev" {} \;

# 批量替换（需要手动验证）
find . -type f \( -name "*.md" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/coverage/*" \
  -exec sed -i 's|github.com/Coregentis/MPLP-Protocol-Dev|github.com/Coregentis/MPLP-Protocol-Dev-Dev|g' {} \;
```

### **3.5 验证完整性（15分钟）**

#### **验证清单**
- [ ] 运行`npm install`成功
- [ ] 运行`npm run build`成功
- [ ] 运行`npm test`成功
- [ ] 所有链接可访问
- [ ] 所有文档格式正确

---

## 📋 **Phase 4: 开源版本整理（180分钟）**

### **目标**: 创建纯净的开源发布版本

### **4.1 准备工作（15分钟）**

#### **任务清单**
- [ ] 创建新的工作分支`public-release`
- [ ] 备份当前状态
- [ ] 确认.gitignore.public内容正确

### **4.2 替换.gitignore（15分钟）**

#### **任务清单**
- [ ] 复制.gitignore.public为.gitignore
- [ ] 验证新.gitignore内容
- [ ] 运行`git status`查看将被排除的文件
- [ ] 确认排除列表正确

#### **执行命令**
```bash
# 备份当前.gitignore
cp .gitignore .gitignore.dev.backup

# 使用public版本
cp .gitignore.public .gitignore

# 查看将被排除的文件
git status --ignored
```

### **4.3 移除内部文档（30分钟）**

#### **任务清单**
- [ ] 移除所有NPM-*.md文件
- [ ] 移除所有OPEN-SOURCE-*.md文件
- [ ] 移除所有MPLP-OPEN-SOURCE-*.md文件
- [ ] 移除DUAL-VERSION-*.md文件
- [ ] 验证保留的文档完整

#### **执行命令**
```bash
# 移除内部文档
rm -f NPM-*.md
rm -f OPEN-SOURCE-*.md
rm -f MPLP-OPEN-SOURCE-*.md
rm -f DUAL-VERSION-*.md

# 验证
ls -la *.md
```

### **4.4 移除开发工具目录（15分钟）**

#### **任务清单**
- [ ] 移除.augment/目录
- [ ] 移除.circleci/目录
- [ ] 移除.cursor/目录
- [ ] 移除.husky/目录
- [ ] 移除tests/目录
- [ ] 移除config/目录
- [ ] 移除temp_studio/目录
- [ ] 移除Archived/目录

#### **执行命令**
```bash
# 移除开发工具目录
rm -rf .augment/
rm -rf .circleci/
rm -rf .cursor/
rm -rf .husky/
rm -rf tests/
rm -rf config/
rm -rf temp_studio/
rm -rf Archived/

# 验证
ls -la
```

### **4.5 移除开发配置文件（15分钟）**

#### **任务清单**
- [ ] 移除.gitignore.public
- [ ] 移除jest.config.js
- [ ] 移除tsconfig.json（保留tsconfig.build.json用于用户构建）
- [ ] 移除.eslintrc.json
- [ ] 移除.prettierrc.json
- [ ] 移除.editorconfig

#### **执行命令**
```bash
# 移除开发配置
rm -f .gitignore.public
rm -f jest.config.js
rm -f tsconfig.json
rm -f .eslintrc.json
rm -f .prettierrc.json
rm -f .editorconfig

# 验证
ls -la
```

### **4.6 清理scripts/目录（15分钟）**

#### **任务清单**
- [ ] 保留npm-publish.sh
- [ ] 保留npm-publish.bat
- [ ] 移除所有其他脚本

#### **执行命令**
```bash
# 进入scripts目录
cd scripts/

# 保留必要脚本，移除其他
find . -type f ! -name "npm-publish.sh" ! -name "npm-publish.bat" -delete

# 返回根目录
cd ..

# 验证
ls -la scripts/
```

### **4.7 确保dist/目录存在（15分钟）**

#### **任务清单**
- [ ] 运行`npm run build`生成dist/
- [ ] 验证dist/目录完整
- [ ] 验证dist/index.js存在
- [ ] 验证dist/index.d.ts存在
- [ ] 验证所有模块编译成功

#### **执行命令**
```bash
# 构建项目
npm run build

# 验证dist目录
ls -la dist/
ls -la dist/modules/
```

### **4.8 更新package.json（15分钟）**

#### **任务清单**
- [ ] 更新repository.url为Public仓库
- [ ] 更新bugs.url为Public仓库
- [ ] 更新homepage为Public仓库
- [ ] 添加files字段
- [ ] 移除开发相关的scripts

#### **更新内容**
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev.git"
  },
  "bugs": {
    "url": "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev/issues"
  },
  "homepage": "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev#readme",
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
    "AUTHORS.md"
  ]
}
```

### **4.9 更新README.md和所有文档（30分钟）**

#### **任务清单**
- [ ] 更新README.md中的所有GitHub链接
- [ ] 更新docs/中的所有GitHub链接
- [ ] 更新examples/中的所有GitHub链接
- [ ] 更新sdk/中的所有GitHub链接

#### **批量更新脚本**
```bash
# 批量替换为Public仓库链接
find . -type f \( -name "*.md" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i 's|github.com/Coregentis/MPLP-Protocol-Dev-Dev|github.com/Coregentis/MPLP-Protocol-Dev|g' {} \;
```

### **4.10 验证完整性（15分钟）**

#### **验证清单**
- [ ] 运行`npm install`成功
- [ ] 运行`npm test`（如果有测试）
- [ ] 验证dist/目录存在且完整
- [ ] 验证所有文档链接正确
- [ ] 验证package.json配置正确

---

## 📋 **Phase 5: 双版本验证（90分钟）**

### **5.1 文档一致性验证（30分钟）**

#### **验证清单**
- [ ] src/目录在两个版本中完全一致
- [ ] docs/目录在两个版本中完全一致
- [ ] examples/目录在两个版本中完全一致
- [ ] sdk/目录在两个版本中完全一致
- [ ] 所有用户文档在两个版本中一致

### **5.2 链接一致性验证（30分钟）**

#### **验证清单**
- [ ] Dev版本所有链接指向Dev仓库
- [ ] Public版本所有链接指向Public仓库
- [ ] 所有文档内链接正确
- [ ] 所有示例安装说明正确

### **5.3 功能完整性验证（30分钟）**

#### **验证清单**
- [ ] Dev版本可以正常开发
- [ ] Public版本可以正常使用
- [ ] npm install成功
- [ ] npm run build成功
- [ ] 所有示例可以运行

---

## 📋 **Phase 6: 发布准备（60分钟）**

### **6.1 创建发布分支（15分钟）**

#### **Dev版本**
```bash
git checkout -b release/dev-v1.1.0-beta
git add .
git commit -m "chore: prepare dev version v1.1.0-beta"
git push origin release/dev-v1.1.0-beta
```

#### **Public版本**
```bash
git checkout -b release/public-v1.1.0-beta
git add .
git commit -m "chore: prepare public version v1.1.0-beta"
git push origin release/public-v1.1.0-beta
```

### **6.2 创建GitHub Release（30分钟）**

#### **Dev版本Release Notes**
```markdown
# MPLP v1.1.0-beta - Development Version

## 🎉 Release Highlights
- Complete L1-L3 Protocol Stack
- 10 Enterprise-Grade Modules
- Complete SDK Ecosystem
- Full Development Environment

## 📦 Installation
\`\`\`bash
git clone https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev.git
cd MPLP-Protocol-Dev
npm install
npm run build
\`\`\`

## 🔗 Links
- [Documentation](https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev/tree/main/docs)
- [Contributing](https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev/blob/main/CONTRIBUTING.md)
```

#### **Public版本Release Notes**
```markdown
# MPLP v1.1.0-beta - Public Release

## 🎉 Release Highlights
- Complete L1-L3 Protocol Stack
- 10 Enterprise-Grade Modules
- Complete SDK Ecosystem
- Production-Ready

## 📦 Installation
\`\`\`bash
npm install mplp@beta
\`\`\`

## 🔗 Links
- [Documentation](https://github.com/Coregentis/MPLP-Protocol-Dev-Dev/tree/main/docs)
- [Examples](https://github.com/Coregentis/MPLP-Protocol-Dev-Dev/tree/main/examples)
```

### **6.3 最终验证（15分钟）**

#### **验证清单**
- [ ] 两个版本的GitHub仓库设置正确
- [ ] 两个版本的README正确
- [ ] 两个版本的文档链接正确
- [ ] npm包可以正常发布

---

## ✅ **执行成功标准**

### **Dev版本成功标准**
- ✅ 包含完整的开发环境
- ✅ 包含所有测试套件
- ✅ 包含所有内部文档
- ✅ 所有链接指向Dev仓库
- ✅ 可以正常开发和测试

### **Public版本成功标准**
- ✅ 仅包含生产代码
- ✅ 包含预构建的dist/目录
- ✅ 包含用户文档
- ✅ 所有链接指向Public仓库
- ✅ 可以通过npm安装使用

---

**执行计划状态**: ✅ **完成**  
**方法论**: 🏆 **SCTM+GLFB+ITCM+RBCT完全应用**  
**执行模式**: 📊 **总-分-总（Global → Local → Global）**  
**完成日期**: 📅 **2025年10月19日**

