# 开源版本发布检查清单
## Public Version Release Checklist

**版本**: 1.0.0  
**仓库**: https://github.com/Coregentis/MPLP-Protocol-Dev-Dev  
**用途**: 开源版本发布前的完整检查清单

---

## 📋 **Phase 1: .gitignore配置检查**

### **1.1 切换到开源版本.gitignore**
- [ ] 备份当前.gitignore为.gitignore.dev.backup
- [ ] 复制.gitignore.public为.gitignore
- [ ] 验证新.gitignore内容正确

### **1.2 验证排除规则**
- [ ] 开发配置被排除（tsconfig.json, jest.config.js等）
- [ ] 开发工具被排除（.augment/, .circleci/等）
- [ ] 内部文档被排除（NPM-*.md, DUAL-VERSION-*.md等）
- [ ] 测试套件被排除（tests/, __tests__/）
- [ ] 开发脚本被排除（scripts/大部分）

### **1.3 验证保留内容**
- [ ] src/ 被跟踪
- [ ] dist/ 被跟踪（预构建）
- [ ] docs/ 被跟踪
- [ ] examples/ 被跟踪
- [ ] sdk/ 被跟踪
- [ ] 用户文档被跟踪（README.md, LICENSE等）

### **1.4 运行git status --ignored**
- [ ] 查看将被排除的文件列表
- [ ] 确认排除列表正确
- [ ] 无重要文件被误排除

---

## 📋 **Phase 2: 移除内部文档**

### **2.1 npm发布文档（14个文件）**
- [ ] NPM-COMPREHENSIVE-UPDATE-ANALYSIS.md 已排除
- [ ] NPM-DOCUMENTATION-UPDATE-FINAL-SUCCESS-REPORT.md 已排除
- [ ] NPM-DOCUMENTATION-UPDATE-PLAN.md 已排除
- [ ] NPM-DOCUMENTATION-UPDATE-SUCCESS-REPORT.md 已排除
- [ ] NPM-PHASE1-UPDATE-SUCCESS-REPORT.md 已排除
- [ ] NPM-PHASE2-UPDATE-SUCCESS-REPORT.md 已排除
- [ ] NPM-PHASE3-UPDATE-SUCCESS-REPORT.md 已排除
- [ ] NPM-PUBLISH-CHECKLIST.md 已排除
- [ ] NPM-PUBLISH-PREPARATION.md 已排除
- [ ] NPM-PUBLISH-SUCCESS-REPORT.md 已排除

### **2.2 开源发布文档（2个文件）**
- [ ] OPEN-SOURCE-RELEASE-PREPARATION-PLAN.md 已排除
- [ ] OPEN-SOURCE-RELEASE-PREPARATION-SUCCESS-REPORT.md 已排除

### **2.3 双版本文档（5个文件）**
- [ ] DUAL-VERSION-RELEASE-STRATEGY-COMPREHENSIVE-ANALYSIS.md 已排除
- [ ] DUAL-VERSION-FILE-INVENTORY-AND-VALIDATION.md 已排除
- [ ] DUAL-VERSION-RELEASE-EXECUTION-PLAN.md 已排除
- [ ] DUAL-VERSION-RELEASE-FINAL-SUMMARY.md 已排除
- [ ] dual-version-release/ 目录已排除

### **2.4 其他内部文档**
- [ ] MPLP-OPEN-SOURCE-USER-DEEP-REVIEW.md 已排除
- [ ] 所有内部规划文档已排除

---

## 📋 **Phase 3: 移除开发工具**

### **3.1 AI助手配置**
- [ ] .augment/ 目录已排除
- [ ] .cursor/ 目录已排除

### **3.2 CI/CD配置**
- [ ] .circleci/ 目录已排除
- [ ] .github/ 目录已排除（除了workflows/）
- [ ] .github/workflows/ 保留

### **3.3 Git Hooks**
- [ ] .husky/ 目录已排除

### **3.4 其他开发工具**
- [ ] tests/ 目录已排除
- [ ] config/ 目录已排除
- [ ] temp_studio/ 目录已排除
- [ ] Archived/ 目录已排除

---

## 📋 **Phase 4: 移除开发配置**

### **4.1 TypeScript配置**
- [ ] tsconfig.json 已排除
- [ ] tsconfig.build.json 已排除
- [ ] tsconfig.*.json 已排除

### **4.2 测试配置**
- [ ] jest.config.js 已排除
- [ ] cucumber.config.js 已排除

### **4.3 代码质量配置**
- [ ] .eslintrc.json 已排除
- [ ] .prettierrc.json 已排除
- [ ] .editorconfig 已排除

### **4.4 其他配置**
- [ ] .gitignore.public 已排除
- [ ] .npmignore 已排除（如果存在）

---

## 📋 **Phase 5: 清理scripts/目录**

### **5.1 保留的脚本**
- [ ] scripts/npm-publish.sh 保留
- [ ] scripts/npm-publish.bat 保留

### **5.2 排除的脚本**
- [ ] 所有其他开发脚本已排除
- [ ] 文档对等性脚本已排除
- [ ] CI诊断脚本已排除
- [ ] 修复脚本已排除
- [ ] 验证脚本已排除

---

## 📋 **Phase 6: 确保dist/目录存在**

### **6.1 构建项目**
- [ ] npm install 成功
- [ ] npm run build 成功
- [ ] dist/ 目录生成

### **6.2 验证dist/内容**
- [ ] dist/core/ 存在
- [ ] dist/modules/ 存在
- [ ] dist/schemas/ 存在
- [ ] dist/shared/ 存在
- [ ] dist/logging/ 存在
- [ ] dist/tools/ 存在
- [ ] dist/index.js 存在
- [ ] dist/index.d.ts 存在

### **6.3 验证构建质量**
- [ ] 所有模块编译成功
- [ ] 类型定义正确
- [ ] 无构建错误

---

## 📋 **Phase 7: package.json配置检查**

### **7.1 基本信息**
- [ ] name: "mplp"
- [ ] version: "1.1.0-beta"
- [ ] description 正确
- [ ] license: "MIT"

### **7.2 仓库信息**
- [ ] repository.type: "git"
- [ ] repository.url: "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev.git"
- [ ] bugs.url: "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev/issues"
- [ ] homepage: "https://github.com/Coregentis/MPLP-Protocol-Dev-Dev#readme"

### **7.3 入口文件**
- [ ] main: "dist/index.js"
- [ ] types: "dist/index.d.ts"
- [ ] exports 配置正确

### **7.4 files字段**
- [ ] files字段存在
- [ ] 包含"dist"
- [ ] 包含"README.md"
- [ ] 包含"LICENSE"
- [ ] 包含"CHANGELOG.md"

### **7.5 脚本配置**
- [ ] 移除开发专用脚本
- [ ] 保留必要的用户脚本

---

## 📋 **Phase 8: README.md检查**

### **8.1 GitHub链接**
- [ ] 仓库链接: https://github.com/Coregentis/MPLP-Protocol-Dev-Dev
- [ ] Issues链接: https://github.com/Coregentis/MPLP-Protocol-Dev-Dev/issues
- [ ] Discussions链接: https://github.com/Coregentis/MPLP-Protocol-Dev-Dev/discussions
- [ ] PR链接: https://github.com/Coregentis/MPLP-Protocol-Dev-Dev/pulls

### **8.2 徽章**
- [ ] 所有徽章链接指向Public仓库
- [ ] CI/CD徽章正常显示
- [ ] 版本徽章显示1.1.0-beta

### **8.3 安装说明**
- [ ] 主要安装方式: npm install mplp@beta
- [ ] 安装说明清晰
- [ ] 快速开始指南正确

---

## 📋 **Phase 9: 文档链接检查**

### **9.1 docs/en/ 文档**
- [ ] 所有GitHub链接指向Public仓库
- [ ] 所有内部链接正确
- [ ] 所有语言导航链接正确

### **9.2 docs/zh-CN/ 文档**
- [ ] 所有GitHub链接指向Public仓库
- [ ] 所有内部链接正确
- [ ] 所有语言导航链接正确

### **9.3 其他语言文档**
- [ ] docs/ja/ 链接正确
- [ ] docs/de/ 链接正确
- [ ] docs/fr/ 链接正确
- [ ] docs/es/ 链接正确
- [ ] docs/ko/ 链接正确
- [ ] docs/ru/ 链接正确

### **9.4 SDK文档**
- [ ] sdk/README.md 链接指向Public仓库
- [ ] sdk/packages/*/README.md 链接正确

### **9.5 示例文档**
- [ ] examples/*/README.md 链接指向Public仓库
- [ ] 安装说明使用npm install mplp@beta

---

## 📋 **Phase 10: 内容完整性检查**

### **10.1 核心代码**
- [ ] src/ 目录完整
- [ ] 所有模块存在
- [ ] 与Dev版本一致

### **10.2 用户文档**
- [ ] docs/ 目录完整
- [ ] 所有语言版本存在
- [ ] 与Dev版本一致

### **10.3 示例代码**
- [ ] examples/ 目录完整
- [ ] 所有示例存在
- [ ] 与Dev版本一致

### **10.4 SDK生态**
- [ ] sdk/ 目录完整
- [ ] 所有SDK包存在
- [ ] 与Dev版本一致

### **10.5 必要文档**
- [ ] README.md 存在
- [ ] LICENSE 存在
- [ ] CHANGELOG.md 存在
- [ ] CONTRIBUTING.md 存在
- [ ] CODE_OF_CONDUCT.md 存在
- [ ] SECURITY.md 存在
- [ ] AUTHORS.md 存在

---

## 📋 **Phase 11: 功能验证**

### **11.1 安装测试**
- [ ] npm install 成功
- [ ] 无依赖冲突
- [ ] 无安全漏洞

### **11.2 使用测试**
- [ ] 可以正常import
- [ ] 基本功能可用
- [ ] 示例可以运行

### **11.3 构建测试**
- [ ] 用户可以使用预构建的dist/
- [ ] 无需构建即可使用

---

## 📋 **Phase 12: npm发布准备**

### **12.1 package.json验证**
- [ ] version正确
- [ ] files字段正确
- [ ] repository字段正确
- [ ] 所有必要字段存在

### **12.2 .npmignore验证**
- [ ] 如果存在，配置正确
- [ ] 或依赖.gitignore

### **12.3 npm pack测试**
- [ ] npm pack 成功
- [ ] 检查生成的.tgz文件
- [ ] 验证包含的文件正确

### **12.4 npm publish --dry-run**
- [ ] 运行dry-run成功
- [ ] 检查将要发布的文件
- [ ] 确认无敏感信息

---

## 📋 **Phase 13: 最终验证**

### **13.1 与Dev版本对比**
- [ ] src/ 目录完全一致
- [ ] docs/ 目录完全一致
- [ ] examples/ 目录完全一致
- [ ] sdk/ 目录完全一致

### **13.2 排除内容验证**
- [ ] 所有内部文档已排除
- [ ] 所有开发工具已排除
- [ ] 所有测试代码已排除
- [ ] 所有开发配置已排除

### **13.3 质量标准**
- [ ] 代码质量达标
- [ ] 文档完整
- [ ] 示例可用
- [ ] 无安全问题

---

## ✅ **发布准备就绪标准**

### **必须满足的条件**

1. **配置正确** ✅
   - .gitignore使用开源版本配置
   - package.json的repository指向Public仓库
   - 所有文档链接指向Public仓库

2. **内容纯净** ✅
   - 所有内部文档已排除
   - 所有开发工具已排除
   - 所有测试代码已排除
   - dist/目录存在

3. **功能完整** ✅
   - 核心代码完整
   - 用户文档完整
   - 示例代码完整
   - SDK生态完整

4. **质量达标** ✅
   - 构建成功
   - 无安全漏洞
   - 文档链接正确
   - 可以正常使用

---

## 🚀 **发布命令**

```bash
# 1. 最终验证
npm install
git status --ignored  # 查看排除的文件
npm pack  # 测试打包
npm publish --dry-run  # 测试发布

# 2. 提交所有更改
git add .
git commit -m "chore: prepare public version v1.1.0-beta"

# 3. 推送到远程仓库
git push origin main

# 4. 创建GitHub Release
# 在GitHub上创建Release，标签为v1.1.0-beta

# 5. 发布到npm
npm publish --tag beta
```

---

**检查清单版本**: 1.0.0  
**最后更新**: 2025年10月19日  
**状态**: ✅ 活跃维护

