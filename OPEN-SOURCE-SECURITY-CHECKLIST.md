# MPLP开源发布安全检查清单

## 📅 检查日期
2025-10-16

## 🎯 检查框架
**RBCT基于规则的约束思维 + 安全审查**

---

## 🔒 **安全检查清单**

### **阶段1: 敏感信息检查**

#### **1.1 API密钥和令牌** 🔴 **关键**

- [ ] 检查所有.env文件
- [ ] 检查所有配置文件（config/*.json）
- [ ] 搜索"api_key"、"apiKey"、"API_KEY"
- [ ] 搜索"token"、"TOKEN"
- [ ] 搜索"secret"、"SECRET"
- [ ] 检查package.json中的scripts

**检查命令**:
```bash
# 搜索API密钥
grep -r "api[_-]key" --include="*.ts" --include="*.js" --include="*.json" .

# 搜索令牌
grep -r "token" --include="*.ts" --include="*.js" --include="*.json" . | grep -v "// "

# 搜索密钥
grep -r "secret" --include="*.ts" --include="*.js" --include="*.json" . | grep -v "// "
```

#### **1.2 密码和凭证** 🔴 **关键**

- [ ] 检查所有配置文件
- [ ] 搜索"password"、"PASSWORD"
- [ ] 搜索"credential"、"CREDENTIAL"
- [ ] 检查数据库连接字符串

**检查命令**:
```bash
# 搜索密码
grep -r "password" --include="*.ts" --include="*.js" --include="*.json" . | grep -v "// "

# 搜索凭证
grep -r "credential" --include="*.ts" --include="*.js" --include="*.json" .
```

#### **1.3 内部URL和端点** 🟡 **重要**

- [ ] 检查所有配置文件
- [ ] 搜索"internal."、"intranet."
- [ ] 搜索私有IP地址（192.168.x.x, 10.x.x.x）
- [ ] 检查API端点配置

**检查命令**:
```bash
# 搜索内部URL
grep -r "internal\." --include="*.ts" --include="*.js" --include="*.md" .

# 搜索私有IP
grep -r "192\.168\." --include="*.ts" --include="*.js" --include="*.json" .
grep -r "10\.\d\+\.\d\+\.\d\+" --include="*.ts" --include="*.js" --include="*.json" .
```

#### **1.4 员工和组织信息** 🟡 **重要**

- [ ] 检查所有文档
- [ ] 搜索员工姓名
- [ ] 搜索内部邮箱
- [ ] 检查MAINTAINERS.md（应该被过滤）

**检查命令**:
```bash
# 搜索邮箱
grep -r "@coregentis\." --include="*.md" --include="*.ts" --include="*.js" .
```

### **阶段2: 内部文档检查**

#### **2.1 内部报告和分析** 🔴 **关键**

- [ ] COMMIT-HISTORY-CLARIFICATION.md
- [ ] OPEN-SOURCE-READINESS-REPORT.md
- [ ] QUALITY-REPORT.md
- [ ] GOVERNANCE.md
- [ ] PRIVACY.md
- [ ] SECURITY.md
- [ ] MAINTAINERS.md
- [ ] RELEASE-CHECKLIST.md
- [ ] BRANCH-MANAGEMENT-*.md
- [ ] CI-CD-FIX-SUMMARY.md

**检查命令**:
```bash
# 检查这些文件是否存在
ls -la | grep -E "COMMIT-HISTORY|READINESS|QUALITY|GOVERNANCE|PRIVACY|SECURITY|MAINTAINERS|RELEASE|BRANCH|CI-CD"
```

#### **2.2 方法论文档** 🔴 **关键**

- [ ] 所有*methodology*.md文件
- [ ] 所有*strategy*.md文件
- [ ] 所有*analysis*.md文件
- [ ] glfb-pseudocode-report.txt文件

**检查命令**:
```bash
# 搜索方法论文档
find . -name '*methodology*.md'
find . -name '*strategy*.md'
find . -name '*analysis*.md'
find . -name 'glfb-pseudocode-report.txt'
```

#### **2.3 内部规划文档** 🟡 **重要**

- [ ] V1.1.0-beta-文档分类整合规划.md
- [ ] 所有planning-*.md文件
- [ ] 所有roadmap-internal*.md文件

**检查命令**:
```bash
# 搜索规划文档
find . -name '*planning*.md'
find . -name 'V1.1.0-beta*.md'
```

### **阶段3: 开发工具和配置检查**

#### **3.1 AI助手和开发工具** 🔴 **关键**

- [ ] .augment/ 目录
- [ ] .cursor/ 目录
- [ ] .husky/ 目录
- [ ] .pctd/ 目录
- [ ] .quality/ 目录

**检查命令**:
```bash
# 检查这些目录是否存在
ls -la | grep -E "\.augment|\.cursor|\.husky|\.pctd|\.quality"
```

#### **3.2 内部CI/CD配置** 🔴 **关键**

- [ ] .circleci/ 目录
- [ ] .github/ 目录（内部workflows）

**检查命令**:
```bash
# 检查CI/CD目录
ls -la | grep -E "\.circleci|\.github"
```

#### **3.3 内部配置和脚本** 🟡 **重要**

- [ ] config/ 目录
- [ ] docker/ 目录
- [ ] k8s/ 目录
- [ ] scripts/ 目录（除build.js和test.js外）
- [ ] validation-results/ 目录

**检查命令**:
```bash
# 检查这些目录
ls -la | grep -E "config|docker|k8s|validation-results"

# 检查scripts目录内容
ls -la scripts/ | grep -v -E "build\.js|test\.js"
```

### **阶段4: 开发内容检查**

#### **4.1 历史归档** 🟡 **重要**

- [ ] Archived/ 目录及所有内容

**检查命令**:
```bash
# 检查Archived目录
ls -la | grep Archived
```

#### **4.2 临时和测试文件** 🟡 **重要**

- [ ] temp_studio/ 目录
- [ ] 所有*_backup.*文件
- [ ] 所有*.backup文件
- [ ] README_NEW.md

**检查命令**:
```bash
# 搜索备份文件
find . -name '*_backup.*'
find . -name '*.backup'
find . -name 'README_NEW.md'
```

#### **4.3 开发测试配置** 🟡 **重要**

- [ ] cucumber.config.js
- [ ] jest.schema-application.config.js
- [ ] ci-diagnostic-report.json

**检查命令**:
```bash
# 检查测试配置文件
ls -la | grep -E "cucumber\.config|jest\.schema-application|ci-diagnostic"
```

### **阶段5: 代码注释检查**

#### **5.1 敏感注释** 🟡 **重要**

- [ ] 检查TODO注释中的敏感信息
- [ ] 检查FIXME注释中的内部信息
- [ ] 检查代码注释中的内部URL
- [ ] 检查代码注释中的员工信息

**检查命令**:
```bash
# 搜索TODO和FIXME
grep -r "TODO" --include="*.ts" --include="*.js" src/
grep -r "FIXME" --include="*.ts" --include="*.js" src/

# 检查注释中的敏感信息
grep -r "// .*internal" --include="*.ts" --include="*.js" src/
```

### **阶段6: 依赖和配置检查**

#### **6.1 package.json检查** 🟡 **重要**

- [ ] 检查scripts中的内部命令
- [ ] 检查dependencies中的私有包
- [ ] 检查repository URL
- [ ] 检查author和contributors信息

**检查命令**:
```bash
# 查看package.json
cat package.json | grep -E "scripts|repository|author"
```

#### **6.2 环境变量检查** 🔴 **关键**

- [ ] .env文件
- [ ] .env.local文件
- [ ] .env.production文件
- [ ] .env.staging文件

**检查命令**:
```bash
# 检查环境变量文件
ls -la | grep "\.env"
```

### **阶段7: 文档内容检查**

#### **7.1 README.md检查** 🟡 **重要**

- [ ] 无内部URL
- [ ] 无员工信息
- [ ] 无内部流程描述
- [ ] 贡献指南正确

**手动检查**: 阅读README.md全文

#### **7.2 CONTRIBUTING.md检查** 🟡 **重要**

- [ ] 无内部流程
- [ ] 无内部工具引用
- [ ] 贡献流程适合公开

**手动检查**: 阅读CONTRIBUTING.md全文

#### **7.3 其他公开文档检查** 🟡 **重要**

- [ ] CHANGELOG.md
- [ ] CODE_OF_CONDUCT.md
- [ ] LICENSE
- [ ] ROADMAP.md

**手动检查**: 逐一阅读这些文件

---

## ✅ **最终验证**

### **自动化检查**

```bash
# 运行完整的安全扫描
bash scripts/security-scan.sh

# 检查文件数量
echo "总文件数: $(git ls-files | wc -l)"

# 检查是否有.gitignore.public中列出的文件
git ls-files | grep -f .gitignore.public
```

### **手动验证**

1. **克隆公开库到新目录**
   ```bash
   git clone https://github.com/Coregentis/MPLP-Protocol.git /tmp/mplp-public
   cd /tmp/mplp-public
   ```

2. **逐一检查关键目录**
   - [ ] 检查是否有.augment/
   - [ ] 检查是否有.circleci/
   - [ ] 检查是否有Archived/
   - [ ] 检查是否有config/
   - [ ] 检查scripts/只有build.js和test.js

3. **搜索敏感关键词**
   ```bash
   grep -r "internal" .
   grep -r "api_key" .
   grep -r "password" .
   ```

4. **运行测试**
   ```bash
   npm install
   npm test
   npm run build
   ```

---

## 📋 **检查记录**

### **检查人**: _______________
### **检查日期**: _______________
### **检查结果**: [ ] 通过  [ ] 不通过

### **发现的问题**:
1. _______________
2. _______________
3. _______________

### **修复措施**:
1. _______________
2. _______________
3. _______________

### **最终批准**: [ ] 批准发布  [ ] 需要修复

---

**文档版本**: 1.0.0
**最后更新**: 2025-10-16
**框架**: RBCT基于规则的约束思维

