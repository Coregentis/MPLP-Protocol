# MPLP架构文档索引

## 📋 **文档概述**

本目录包含MPLP (Multi-Agent Project Lifecycle Protocol) v1.0的完整架构设计文档，涵盖核心设计决策、实施指南和最佳实践。

## 🏗️ **核心架构文档**

### **1. 系统架构设计**
- **[系统架构总览](./system-architecture.md)** - MPLP整体架构设计
- **[MPLP v1.0架构设计](./MPLP-v1.0-Architecture-Design.md)** - 详细架构规范
- **[DDD架构概述](./ddd-overview.md)** - 领域驱动设计实施

### **2. 核心设计决策**
- **[双重命名约定架构设计](./dual-naming-convention.md)** 🚨 **核心决策**
  - MPLP独特的Schema(snake_case) + TypeScript(camelCase)设计
  - 技术原理、优势分析、风险管理
  - 跨语言兼容性和标准合规性
- **[双重命名约定实施指南](./dual-naming-implementation-guide.md)** 🛠️ **实施必读**
  - 具体实施步骤和代码示例
  - 开发工作流和最佳实践
  - 常见问题解决方案

## 📊 **项目进展文档**

### **Phase 1: 基础架构建设**
- **[Phase 1完成总结](./Phase1-Completion-Summary.md)** - 基础架构建设成果

### **Phase 2: 测试完善**
- **[Phase 2完成总结](./Phase2-Completion-Summary.md)** - 测试体系建设
- **[Phase 2最终完成报告](./Phase2-Final-Completion-Report.md)** - 详细成果报告

### **架构问题解决**
- **[架构问题解决指南](./architecture-problem-solving-guide.md)** - 问题诊断和解决
- **[遗留架构清理报告](./legacy-architecture-cleanup-report.md)** - 历史问题处理

## 🎯 **文档使用指南**

### **新开发者必读**
1. **[系统架构总览](./system-architecture.md)** - 了解整体架构
2. **[双重命名约定架构设计](./dual-naming-convention.md)** - 理解核心设计决策
3. **[双重命名约定实施指南](./dual-naming-implementation-guide.md)** - 学习具体实施
4. **[DDD架构概述](./ddd-overview.md)** - 掌握代码组织方式

### **架构师参考**
1. **[MPLP v1.0架构设计](./MPLP-v1.0-Architecture-Design.md)** - 完整架构规范
2. **[双重命名约定架构设计](./dual-naming-convention.md)** - 核心设计决策
3. **[架构问题解决指南](./architecture-problem-solving-guide.md)** - 问题诊断方法

### **项目管理者参考**
1. **[Phase 1完成总结](./Phase1-Completion-Summary.md)** - 项目进展了解
2. **[Phase 2最终完成报告](./Phase2-Final-Completion-Report.md)** - 质量状态评估

## 🚨 **重要架构决策**

### **1. 双重命名约定** (最重要)
**文档**: [双重命名约定架构设计](./dual-naming-convention.md)

**核心原则**:
- Schema层使用snake_case (符合JSON/API标准)
- TypeScript层使用camelCase (符合JavaScript标准)
- 通过映射层处理转换

**影响范围**: 所有模块开发、API设计、数据库设计

### **2. Schema驱动开发**
**原则**: 所有开发必须以Schema定义为准
**流程**: Schema → TypeScript → 实现 → 测试

### **3. 厂商中立设计**
**原则**: 核心协议不依赖任何特定厂商
**实现**: 通过适配器模式和接口抽象

### **4. 模块化架构**
**设计**: 10个独立模块，清晰边界
**模块**: Core, Context, Plan, Confirm, Trace, Role, Extension, Collab, Dialog, Network

## 🛠️ **开发工具和流程**

### **架构验证工具**
```bash
# 验证双重命名约定一致性
npm run validate:mapping

# 检查架构合规性
npm run validate:architecture

# 完整质量检查
npm run quality:check
```

### **架构文档更新流程**
1. 识别架构变更需求
2. 更新相关架构文档
3. 团队架构评审
4. 实施指南更新
5. 工具和流程调整

## 📚 **相关资源**

### **外部标准参考**
- [JSON Schema规范](https://json-schema.org/)
- [REST API设计最佳实践](https://restfulapi.net/)
- [TypeScript官方风格指南](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [领域驱动设计(DDD)](https://domainlanguage.com/ddd/)

### **内部文档链接**
- [开发标准规范](../standards/)
- [API参考文档](../api/)
- [集成指南](../integration/)
- [最佳实践](../best-practices/)

## 🔄 **文档维护**

### **更新频率**
- **核心架构文档**: 重大架构变更时更新
- **实施指南**: 根据实践经验持续优化
- **进展报告**: 每个Phase完成后更新

### **审查机制**
- **月度审查**: 检查文档与实际实施的一致性
- **季度评估**: 评估架构决策的有效性
- **年度规划**: 制定架构演进计划

### **贡献指南**
1. 遵循文档模板和格式
2. 提供清晰的代码示例
3. 包含决策依据和权衡分析
4. 经过团队评审后合并

## 📞 **联系方式**

### **架构团队**
- **架构负责人**: MPLP架构团队
- **文档维护**: MPLP开发团队
- **技术支持**: 通过GitHub Issues

### **反馈渠道**
- **架构建议**: 创建Architecture RFC
- **文档改进**: 提交Pull Request
- **问题报告**: 创建GitHub Issue

---

**📅 最后更新**: 2025年8月6日  
**📝 文档版本**: v1.0.0  
**👥 维护团队**: MPLP架构团队  
**🎯 适用范围**: MPLP v1.0项目
