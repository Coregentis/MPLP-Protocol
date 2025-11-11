# CodeQL本地扫描指南

## 📋 概述

本指南介绍如何在本地使用CodeQL进行安全扫描，以便在提交代码前发现和修复安全问题。

## 🎯 为什么需要本地CodeQL扫描？

1. **提前发现问题**: 在提交代码前就发现安全漏洞
2. **快速反馈**: 不需要等待GitHub Actions运行
3. **离线工作**: 可以在没有网络的情况下进行安全检查
4. **学习工具**: 了解CodeQL如何检测安全问题

## 🛠️ 方法1: 使用VSCode CodeQL扩展（推荐）

### 安装步骤

1. **安装CodeQL扩展**
   - 打开VSCode
   - 进入扩展市场（Ctrl+Shift+X）
   - 搜索"CodeQL"
   - 安装"CodeQL" by GitHub

2. **创建CodeQL数据库**
   - 打开命令面板（Ctrl+Shift+P）
   - 输入"CodeQL: Create Database"
   - 选择语言: JavaScript/TypeScript
   - 选择源代码根目录: 当前工作区
   - 等待数据库创建完成（2-3分钟）

3. **运行查询**
   - 打开命令面板（Ctrl+Shift+P）
   - 输入"CodeQL: Run Query on Selected Database"
   - 选择查询套件: "javascript-security-and-quality.qls"
   - 查看结果面板

### 查看结果

- 结果会显示在"CodeQL Query Results"面板中
- 点击结果可以跳转到相关代码
- 可以查看详细的问题描述和修复建议

## 🛠️ 方法2: 使用命令行（高级用户）

### 前提条件

CodeQL CLI已通过VSCode扩展自动安装在:
```
Windows: %APPDATA%\Code\User\globalStorage\github.vscode-codeql\distribution1\codeql\
Mac/Linux: ~/.vscode/extensions/github.vscode-codeql-*/
```

### 使用提供的脚本

我们提供了两个便捷脚本：

#### 1. 完整扫描脚本

```bash
# 运行完整的安全扫描
bash scripts/run-codeql-scan.sh

# 或使用Node.js版本
node scripts/codeql-scan.js
```

**功能**:
- 创建CodeQL数据库
- 运行完整的安全查询套件
- 生成SARIF和CSV格式的报告
- 显示结果摘要

**输出**:
- `codeql-results/security-results.sarif` - SARIF格式（可在VSCode中查看）
- `codeql-results/security-results.csv` - CSV格式（可在Excel中查看）

#### 2. 快速扫描脚本

```bash
# 只扫描特定的安全问题
bash scripts/quick-codeql-scan.sh
```

**功能**:
- 只扫描CWE-78 (Command Injection)和CWE-1333 (ReDoS)
- 更快的扫描速度
- 针对性的结果

### 手动命令

如果需要更细粒度的控制，可以直接使用CodeQL CLI：

```bash
# 设置CodeQL路径
export CODEQL="$APPDATA/Code/User/globalStorage/github.vscode-codeql/distribution1/codeql/codeql.exe"

# 1. 创建数据库
"$CODEQL" database create codeql-db \
  --language=javascript \
  --source-root=.

# 2. 运行安全查询
"$CODEQL" database analyze codeql-db \
  --format=sarif-latest \
  --output=results.sarif \
  javascript-security-and-quality.qls

# 3. 查看结果
"$CODEQL" bqrs decode codeql-db/results/*.bqrs --format=text
```

## 📊 理解扫描结果

### 结果格式

#### SARIF格式
- 标准的静态分析结果格式
- 可以在VSCode中使用"SARIF Viewer"扩展查看
- 包含详细的问题描述、位置和修复建议

#### CSV格式
- 简单的表格格式
- 可以在Excel或任何文本编辑器中查看
- 适合快速浏览和过滤

### 常见问题类型

1. **CWE-78: Command Injection**
   - 描述: 使用未经验证的用户输入执行系统命令
   - 严重程度: High
   - 修复: 使用`shell: false`，验证和清理输入

2. **CWE-1333: ReDoS (Regular Expression Denial of Service)**
   - 描述: 正则表达式可能导致性能问题
   - 严重程度: High
   - 修复: 避免嵌套量词，使用非捕获组

3. **CWE-116: Incomplete String Escaping**
   - 描述: 字符串转义不完整
   - 严重程度: Medium
   - 修复: 使用完整的转义模式

## 🔧 集成到开发流程

### Pre-commit Hook

可以将CodeQL扫描集成到pre-commit hook中：

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running CodeQL security scan..."
node scripts/codeql-scan.js

if [ $? -ne 0 ]; then
    echo "❌ CodeQL scan failed. Please fix security issues before committing."
    exit 1
fi

echo "✅ CodeQL scan passed"
```

### CI/CD集成

CodeQL扫描已集成到GitHub Actions中：
- 文件: `.github/workflows/security.yml`
- 触发: 每次push和pull request
- 结果: 在GitHub Security标签页查看

## 📚 参考资源

### CodeQL文档
- [CodeQL官方文档](https://codeql.github.com/docs/)
- [JavaScript查询帮助](https://codeql.github.com/codeql-query-help/javascript/)
- [安全查询套件](https://github.com/github/codeql/tree/main/javascript/ql/src/Security)

### MPLP项目安全规范
- `.augment/rules/MPLP-Core-Development-Rules.mdc` - 核心开发规则（包含安全原则）
- `.augment/rules/MPLP-TypeScript-Standards.mdc` - TypeScript安全编码标准
- `.augment/rules/MPLP-Testing-Strategy.mdc` - 安全测试要求

### 安全修复案例
- Commit 131bf681: CWE-78和CWE-1333修复
- Commit 89304835: 安全开发规则更新

## 🎯 最佳实践

1. **定期扫描**: 每次重大代码更改后运行扫描
2. **修复优先级**: 优先修复High severity问题
3. **理解问题**: 不要盲目修复，理解漏洞的根本原因
4. **测试验证**: 修复后运行测试确保没有破坏功能
5. **文档记录**: 记录修复方案和经验教训

## ⚠️ 常见陷阱

1. **❌ 添加硬编码限制**: 不要为了通过扫描而添加硬编码的业务限制
2. **❌ 修改测试**: 不要修改测试来适应错误的修复
3. **❌ 忽视警告**: 不要忽视CodeQL警告，每个警告都有其原因
4. **❌ 过度修复**: 保持修复的最小化和针对性

## ✅ 成功案例

### Dialog模块安全修复（2025-11-10）

**问题**: 1072个CodeQL安全错误
- CWE-78: Command Injection (2个文件)
- CWE-1333: ReDoS (6+个正则表达式)

**修复方案**:
1. 移除硬编码长度限制（错误方案）
2. 只修复正则表达式和命令注入（正确方案）
3. 保持修复的最小化和针对性

**结果**:
- ✅ 258/258 Dialog测试通过
- ✅ 零破坏性变更
- ✅ CodeQL扫描通过
- ✅ 零技术债务

**经验教训**:
- 使用RBCT方法论进行系统性分析
- 批判性思维识别错误方案
- 测试驱动修复确保质量

---

**版本**: 1.0.0
**更新日期**: 2025-11-10
**维护者**: MPLP Security Team

