# MPLP 文件命名规范指南

> **文档版本**: v1.0.0  
> **更新时间**: 2025-07-11T23:59:23Z  
> **适用项目**: Multi-Agent Project Lifecycle Protocol (MPLP) v1.0

## 📋 概述

为确保MPLP项目代码的一致性和专业性，本文档定义了严格的文件命名规范。所有开发人员必须严格遵循这些规范，以保持项目的高质量标准。

## 🏗️ 核心命名原则

### 模块内文件命名格式

所有模块内的文件必须遵循以下命名格式：

```
{module-name}-{component-type}.ts
```

其中：
- `{module-name}` 是模块名称，必须小写
- `{component-type}` 是组件类型，必须小写
- 分隔符必须使用连字符(`-`)

### 标准组件类型

项目中使用的标准组件类型包括：

| 组件类型 | 说明 | 示例 |
|---------|------|------|
| protocol | 协议定义 | `context-protocol.ts` |
| manager | 管理器 | `plan-manager.ts` |
| factory | 工厂 | `context-factory.ts` |
| handler | 处理器 | `trace-handler.ts` |
| validator | 验证器 | `plan-validator.ts` |
| service | 业务服务 | `role-service.ts` |
| controller | 控制器 | `context-controller.ts` |
| repository | 数据仓库 | `plan-repository.ts` |
| types | 类型定义 | `trace-types.ts` |
| resolver | 解析器 | `failure-resolver.ts` |
| adapter | 适配器 | `tracepilot-adapter.ts` |
| helper | 辅助工具 | `context-helper.ts` |
| util | 工具函数 | `plan-util.ts` |
| config | 配置 | `trace-config.ts` |
| middleware | 中间件 | `auth-middleware.ts` |

## ✅ 正确的命名示例

### Context模块

```
context/
├── context-protocol.ts       # 协议定义
├── context-manager.ts        # 管理器
├── context-factory.ts        # 工厂
├── context-handler.ts        # 处理器
├── context-validator.ts      # 验证器
├── context-service.ts        # 业务服务
├── context-controller.ts     # 控制器
├── context-repository.ts     # 数据仓库
├── context-types.ts          # 类型定义
└── index.ts                  # 模块入口
```

### Plan模块

```
plan/
├── plan-protocol.ts          # 协议定义
├── plan-manager.ts           # 管理器
├── plan-factory.ts           # 工厂
├── plan-handler.ts           # 处理器
├── plan-validator.ts         # 验证器
├── plan-service.ts           # 业务服务
├── plan-controller.ts        # 控制器
├── plan-repository.ts        # 数据仓库
├── plan-types.ts             # 类型定义
├── plan-resolver.ts          # 解析器
├── failure-resolver.ts       # 失败解析器
└── index.ts                  # 模块入口
```

## ❌ 错误的命名示例

以下是不符合规范的命名示例，应避免使用：

```
context.controller.ts     # 错误: 使用点分隔符
contextManager.ts         # 错误: 使用camelCase
Context.handler.ts        # 错误: 首字母大写且使用点分隔符
ContextValidator.ts       # 错误: 使用PascalCase
ctx-validator.ts          # 错误: 使用缩写

Plan-factory.ts           # 错误: 首字母大写
plan_manager.ts           # 错误: 使用下划线分隔符
planHandler.ts            # 错误: 使用camelCase
Failure-Resolver.ts       # 错误: 使用PascalCase
PlanController.ts         # 错误: 使用PascalCase
```

## 🔧 文件重命名工具

为了帮助开发人员快速修正不符合命名规范的文件，项目提供了自动重命名工具。

### 使用方法

```bash
# 运行重命名工具
npm run rename-files
```

该工具会：
1. 扫描所有模块目录
2. 识别不符合命名规范的文件
3. 生成重命名计划报告
4. 询问是否执行重命名操作
5. 自动更新所有导入语句
6. 重命名文件

### 示例输出

```
=== MPLP 文件命名规范化工具 ===
=== 文件重命名计划 ===
共发现 5 个不符合命名规范的文件

模块: context (2 个文件)
  context.controller.ts -> context-controller.ts
  Context.handler.ts -> context-handler.ts

模块: plan (3 个文件)
  Plan-factory.ts -> plan-factory.ts
  plan_manager.ts -> plan-manager.ts
  Failure-Resolver.ts -> failure-resolver.ts

是否执行重命名操作? (y/n) 
```

## 🔍 自动检查机制

项目已配置自动检查机制，确保所有文件符合命名规范：

1. **Git提交前检查**: 通过husky pre-commit钩子，在提交代码前自动检查文件命名
2. **CI检查**: 在持续集成流程中验证命名规范
3. **ESLint规则**: 自定义ESLint规则验证命名约定

### Git提交前检查

当你尝试提交不符合命名规范的文件时，会收到类似以下的错误信息：

```
🔍 检查文件命名规范...
❌ 文件命名不符合规范: src/modules/plan/Failure-Resolver.ts
   应该使用格式: plan-{component-type}.ts
❌ 文件命名规范检查失败，请修正后重新提交
提示: 可以运行 "npm run rename-files" 自动修复命名问题
```

## 📚 相关规则文件

- [命名约定规则](.cursor/rules/naming-convention.mdc) - 完整的命名规范定义
- [提交指南规则](.cursor/rules/commit-guideline.mdc) - Git提交信息规范
- [代码风格规则](.cursor/rules/code-style.mdc) - 代码风格规范

## 🚨 注意事项

- 所有新创建的文件必须严格遵循命名规范
- 重命名现有文件时，必须同时更新所有导入语句
- 提交代码前，确保所有文件名符合规范
- 使用重命名工具时，请确保已提交或暂存所有重要更改，以防意外丢失

---

**维护团队**: MPLP项目团队  
**联系方式**: mplp-support@coregentis.com 