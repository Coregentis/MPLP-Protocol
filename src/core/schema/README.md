# MPLP Schema验证器

> **项目**: Multi-Agent Project Lifecycle Protocol (MPLP)  
> **版本**: v1.0.0  
> **创建时间**: 2025-07-20  
> **更新时间**: 2025-07-20T12:00:00+08:00  
> **作者**: MPLP团队

## 📖 概述

MPLP Schema验证器是一个强大的工具，用于验证代码是否符合MPLP架构设计规范。它特别关注厂商中立原则，确保代码不直接依赖特定厂商实现，符合MPLP架构的核心原则。

## 🏗️ 主要功能

- **命名约定验证**: 确保代码遵循统一的命名规范
- **厂商中立验证**: 检测代码中的厂商特定依赖
- **接口实现验证**: 验证接口实现是否符合规范
- **文件结构验证**: 检查文件组织是否符合架构要求
- **多种输出格式**: 支持JSON、Markdown、HTML格式的报告

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行示例

```bash
npm run schema:example
```

### 验证厂商中立性

```bash
npm run schema:vendor-neutral
```

### 验证命名约定

```bash
npm run schema:naming
```

### 生成验证报告

```bash
npm run schema:report
```

## 📋 命令行工具

Schema验证器提供了命令行工具，可以直接在终端中使用：

```bash
ts-node src/scripts/validate-schema.ts [选项] [路径]
```

### 选项

- `-h, --help`: 显示帮助信息
- `-v, --verbose`: 显示详细输出
- `-o, --output <文件>`: 输出报告到文件
- `-f, --format <格式>`: 输出格式 (json, markdown, html)
- `-m, --mode <模式>`: 验证模式 (default, vendor-neutral, naming)
- `-s, --severity <级别>`: 最小严重级别 (info, warning, error, fatal)

### 示例

```bash
# 验证当前目录
ts-node src/scripts/validate-schema.ts

# 验证src目录
ts-node src/scripts/validate-schema.ts src

# 验证厂商中立性
ts-node src/scripts/validate-schema.ts -m vendor-neutral

# 输出JSON报告
ts-node src/scripts/validate-schema.ts -f json -o report.json
```

## 🔧 编程接口

Schema验证器提供了编程接口，可以在代码中使用：

```typescript
import { SchemaValidatorFactory } from '../core/schema/validator-factory';

// 创建验证器工厂
const factory = new SchemaValidatorFactory();

// 创建默认验证器
const validator = factory.createDefaultValidator();

// 验证项目
const report = await validator.validateProject('./src');

// 输出报告
console.log(report.toMarkdown());
```

## 📊 验证规则

### 命名规则

- **类名**: 使用PascalCase命名法
- **接口名**: 使用I前缀+PascalCase命名法
- **方法名**: 使用camelCase命名法
- **变量名**: 使用camelCase命名法
- **JSON属性**: 使用snake_case命名法

### 厂商中立规则

- **类名**: 不应包含厂商特定名称
- **导入路径**: 不应直接导入厂商特定模块
- **变量名**: 不应包含厂商特定名称
- **文件路径**: 不应包含厂商特定名称

## 🔍 验证报告

验证报告包含以下内容：

- **摘要**: 验证文件数、问题总数
- **按严重级别统计**: 信息、警告、错误、致命错误数量
- **按规则类型统计**: 命名、接口、结构、文档、依赖、厂商中立问题数量
- **问题列表**: 详细的问题描述、位置、代码片段和修复建议

## 📝 注意事项

- 验证器会根据严重问题数量设置退出码，便于在CI/CD流程中使用
- 厂商中立验证对于确保MPLP架构的厂商中立原则至关重要
- 建议在提交代码前运行验证，确保代码符合规范

## 📚 相关资源

- [MPLP架构设计规则](../../requirements-docs/01_技术设计文档.md)
- [MPLP协议开发专项路线图](../../requirements-docs/mplp_protocol_roadmap.md)
- [厂商中立原则](../../requirements-docs/vendor_neutral_principles.md) 