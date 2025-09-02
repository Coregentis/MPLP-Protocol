# AI Agent文件记录系统快速参考指南 v2.0

## 🚀 **一分钟快速启动**

### **用户操作（复制粘贴即可使用）**
```markdown
请执行MPLP模块重构任务：

**目标模块**: [模块名称]
**重构目标**: 统一成为MPLP v1.0版本标准
**质量标准**: [企业标准75%+ / 生产就绪90%+]

**🧠 文件记录系统启动** (CRITICAL):
1. 创建会话记录文件：
   ```bash
   touch docs/ai-agent-execution/memory-records/session-records/current-session.md
   ```
2. 立即运行约束检查工具：
   ```bash
   node scripts/ai-agent-constraint-checklist.js pre-check
   ```
3. 设置智能助手上下文：
   ```bash
   node scripts/ai-agent-smart-assistant.js remind create-module [模块名]
   ```
4. 承诺执行标准：我将使用文件记录系统管理状态，不依赖Agent Memory，确保所有关键信息持久化记录

**🚨 AI Agent承诺**:
我承诺严格使用文件记录系统管理状态和记忆，不依赖Agent Memory，将所有关键信息持久化记录到文件中，在每个关键点运行检查工具，主动报告任何不确定性，接受所有监督和纠正。

**开始执行**: 请按照AI-Agent-Integrated-Execution-Workflow.md执行完整的7阶段流程。
```

## 🔧 **工具快速参考**

### **核心检查工具**
```bash
# 预检查（阶段开始前）
npm run ai-agent:pre-check

# 实时检查（执行过程中）
npm run ai-agent:live-check

# 完整检查（阶段完成后）
npm run ai-agent:full-check

# 最终检查（重构完成后）
npm run ai-agent:completion-check
```

### **智能助手工具**
```bash
# 操作提醒
npm run ai-agent:remind <operation> <module>

# 上下文检查
npm run ai-agent:check <operation> <module>

# 操作验证
npm run ai-agent:verify <operation> <module>
```

### **现有质量工具**
```bash
# 架构完整性检查
bash quality/scripts/shared/architecture-integrity-check.sh

# 代码质量检查
npm run typecheck && npm run lint

# Schema验证
npm run validate:mapping
```

## 📋 **7阶段检查清单**

### **阶段1: 架构理解验证**
```bash
□ npm run ai-agent:remind architecture-understanding [模块]
□ 阅读强制文档清单
□ npm run ai-agent:constraint-check understanding-check
□ 更新会话记录文件：记录阶段1完成状态和关键理解要点
```

### **阶段2: Schema集成和Mapper实现**
```bash
□ npm run ai-agent:remind implement-mapper [模块]
□ 每个文件后：npm run ai-agent:live-check
□ npm run typecheck && npm run lint && npm run validate:mapping
□ 更新会话记录和模块日志：记录Schema集成完成状态和关键信息
```

### **阶段3: 横切关注点集成**
```bash
□ npm run ai-agent:remind implement-protocol [模块]
□ 每个方法后：npm run ai-agent:live-check
□ bash quality/scripts/shared/architecture-integrity-check.sh
□ remember "阶段3完成：[横切关注点集成信息]"
```

### **阶段4: 预留接口实现**
```bash
□ npm run ai-agent:remind implement-interfaces [模块]
□ 每个接口后：npm run ai-agent:live-check
□ bash quality/scripts/shared/architecture-integrity-check.sh
□ remember "阶段4完成：[预留接口实现信息]"
```

### **阶段5: 协议接口实现**
```bash
□ npm run ai-agent:remind implement-protocol [模块]
□ 每个方法后：npm run ai-agent:live-check
□ npm run test:protocol-integration:[模块]
□ remember "阶段5完成：[协议接口实现信息]"
```

### **阶段6: 质量验证执行**
```bash
□ npm run ai-agent:remind write-tests [模块]
□ 每个测试层后：npm run ai-agent:live-check
□ npm run ai-agent:final-check
□ remember "阶段6完成：[质量验证结果]"
```

### **阶段7: 完成报告和文档更新**
```bash
□ npm run ai-agent:completion-check
□ 生成完整合规报告
□ 更新文档和README
□ remember "重构完成：[总结和经验]"
```

## 🚨 **应急处理**

### **AI Agent遗漏检测**
```bash
# 发现遗漏时立即执行
echo "检测到约束遗漏，立即停止"
npm run ai-agent:emergency-check
# 重新设置上下文，继续执行
```

### **质量门禁失败**
```bash
# 质量检查失败时
echo "质量门禁失败，分析原因"
npm run ai-agent:diagnose [失败类型]
# 修复问题，重新验证
```

### **用户干预指令**
```markdown
# 立即停止AI Agent
"请立即停止当前操作，保存当前状态"

# 重新设置上下文
"请重新运行约束提醒工具，确认当前阶段的要求"

# 强制检查
"请运行完整的约束检查，报告所有发现的问题"
```

## 📊 **成功指标**

### **技术指标**
```markdown
□ 约束遵循率 >95%
□ 质量门禁通过率 100%
□ 架构完整性检查 100%
□ 零技术债务
□ 测试覆盖率 ≥目标标准
```

### **流程指标**
```markdown
□ 每个阶段都运行了记忆外部化工具
□ 所有关键决策都有remember记录
□ 用户监督检查点都已确认
□ 应急处理机制测试有效
□ 最终合规报告完整
```

## 🎯 **关键成功因素**

### **AI Agent方面**
```markdown
1. 严格遵循工具提醒，不依赖记忆
2. 主动报告不确定性和问题
3. 接受所有监督和纠正
4. 持续使用remember记录关键信息
```

### **用户方面**
```markdown
1. 及时响应AI Agent的确认请求
2. 定期检查自动化报告
3. 在关键检查点进行验证
4. 发现问题时及时干预
```

### **工具方面**
```markdown
1. 确保所有检查工具正常运行
2. 定期更新约束条件数据库
3. 监控工具执行效果
4. 持续改进检查逻辑
```

## 📚 **相关文档**

### **核心文档**
- `AI-Agent-Quick-Start-Commands.md` - 启动指令模板
- `AI-Agent-Integrated-Execution-Workflow.md` - 完整执行流程
- `AI-Agent-Memory-Externalization-System.md` - 记忆外部化系统详解

### **工具文档**
- `scripts/ai-agent-constraint-checklist.js` - 约束检查工具
- `scripts/ai-agent-smart-assistant.js` - 智能助手工具
- `quality/scripts/shared/architecture-integrity-check.sh` - 架构检查

### **规则文档**
- `.augment/rules/MPLP-*.mdc` - 所有约束条件和规则

---

**版本**: 1.0.0
**更新日期**: 2025-08-24
**适用范围**: 所有MPLP模块重构任务
**使用方式**: 复制粘贴 + 工具支持 + 人工监督
