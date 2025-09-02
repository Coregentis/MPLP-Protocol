# MPLP v1.0 开发指南

## 📋 **AI Agent开发流程**

**目标读者**: AI开发Agent
**适用范围**: MPLP v1.0重写项目 - 10个模块开发（8个已完成：Context, Plan, Role, Confirm, Trace, Extension, Dialog, Collab；2个待重写）
**方法论**: SCTM+GLFB+ITCM + Schema驱动开发
**质量标准**: 零技术债务 + 100%测试通过率 + 完整文档套件
**CRITICAL**: 所有模块必须使用IDENTICAL架构模式和实现方式
**重写标准**: 基于Context、Plan、Role、Confirm、Trace、Extension、Dialog、Collab模块的企业级标准进行统一重写
**项目进度**: 80%完成 (8/10模块达到企业级标准，1,626/1,626测试100%通过，99个测试套件全部通过)

## 🚨 **强制开发流程（必须按顺序执行）**

### **第1步：读取Schema定义**
```bash
# 必须首先查看模块的Schema定义
📁 src/schemas/mplp-{module}.json

# 示例：Context模块
📄 src/schemas/mplp-context.json
- 了解所有字段定义（snake_case格式）
- 理解数据结构和约束
- 确认必需字段和可选字段
- 理解字段类型和格式要求
```

### **第2步：验证Mapper双重命名映射**
```bash
# 检查现有的Mapper实现
📄 src/modules/{module}/api/mappers/{module}.mapper.ts

# 验证双重命名约定：
✅ Schema层：snake_case (context_id, created_at)
✅ TypeScript层：camelCase (contextId, createdAt)
✅ 映射函数：toSchema() 和 fromSchema()
✅ 验证函数：validateSchema()
```

### **第3步：生成字段映射表**
```markdown
# 为每个模块创建字段映射表
## {Module}模块字段映射表

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 必需 | 描述 |
|-------------------------|---------------------------|------|------|------|
| context_id              | contextId                 | UUID | ✅   | 上下文唯一标识 |
| created_at              | createdAt                 | Date | ✅   | 创建时间 |
| updated_at              | updatedAt                 | Date | ❌   | 更新时间 |
| context_data            | contextData               | Object | ✅ | 上下文数据 |
| ... | ... | ... | ... | ... |

# 保存到：docs/modules/{module}-field-mapping.md
```

### **第4步：统一L3管理器集成**
```typescript
// 导入统一的L3横切关注点管理器（所有10个模块使用相同的导入）
import {
  MLPPSecurityManager,
  MLPPPerformanceMonitor,
  MLPPEventBusManager,
  MLPPErrorHandler,
  MLPPCoordinationManager,
  MLPPOrchestrationManager,
  MLPPStateSyncManager,
  MLPPTransactionManager,
  MLPPProtocolVersionManager
} from '../../../core/protocols/cross-cutting-concerns';

// 导入统一协议接口
import {
  IMLPPProtocol,
  MLPPRequest,
  MLPPResponse,
  ProtocolMetadata
} from '../../../core/protocols/mplp-protocol.interface';

// 导入协议基类
import { MLPPProtocolBase } from '../../../core/protocols/mplp-protocol.base';
```
        return await this.handleCreate(request);
      case 'update_{module}':
        return await this.handleUpdate(request);
      default:
        throw new Error(`Unsupported operation: ${request.operation}`);
    }
  }
  
  getProtocolMetadata(): ProtocolMetadata {
    return {
      moduleName: '{module}',
      version: '1.0.0',
      supportedOperations: ['create_{module}', 'update_{module}'],
      capabilities: ['{module}_management'],
      crossCuttingConcerns: [
        'security', 'performance', 'error_handling',
        'event_bus', 'coordination', 'state_sync',
        'orchestration', 'transaction', 'protocol_version'
      ]
    };
  }
}
```

## 🧪 **统一测试策略**

### **4层测试方法（所有10个模块使用IDENTICAL方法）**
```markdown
CRITICAL: 所有模块必须使用相同的测试架构和标准

1. **Unit Tests**: 单个组件测试 (>90% 覆盖率)
   - 所有模块使用相同的测试结构和命名约定
   - 统一的Mock工厂和测试数据生成

2. **Integration Tests**: 模块交互测试
   - 统一的横切关注点集成测试
   - 标准化的预留接口测试

3. **System Tests**: 端到端工作流测试
   - 统一的协议接口测试
   - 标准化的性能和安全测试

4. **Acceptance Tests**: 业务场景验证
   - 基于Context和Plan模块的企业级验证模式
   - 统一的质量门禁标准（95%+测试覆盖率，零技术债务）
```

### **统一测试结构（所有模块必须遵循）**
```
tests/
├── unit/
│   └── modules/{module}/     # 与其他6个模块相同的结构
├── integration/
│   └── cross-cutting/        # 统一的横切关注点测试
├── functional/
│   └── protocols/            # 统一的协议测试
└── system/
    └── validation/           # 统一的系统验证
```

### **统一质量门禁（所有10个模块使用IDENTICAL标准）**
```bash
# 强制质量检查（零容忍）
npm run typecheck        # TypeScript编译：0错误
npm run lint            # ESLint验证：0警告
npm run test:unit       # 单元测试：100%通过
npm run test:integration # 集成测试：100%通过

# 统一验证标准
npm run test:cross-cutting    # 横切关注点测试：100%通过
npm run test:reserved-interfaces # 预留接口测试：100%通过
npm run validate:mapping      # Schema映射一致性：100%
npm run validate:architecture # 架构合规性：100%

# 生产就绪验证
npm run test:all        # 完整测试套件：>90%覆盖率
npm run test:performance # 性能测试：<100ms响应时间
npm run test:security   # 安全测试：企业级标准
npm run validate:unified-architecture # 统一架构验证：100%合规
```

## 🔄 **统一横切关注点集成（所有10个模块使用IDENTICAL模式）**

### **统一L3管理器注入模式**
```typescript
// 所有模块必须使用相同的构造函数注入模式
export class {Module}Protocol extends MLPPProtocolBase implements IMLPPProtocol {
  constructor(
    private readonly {module}ManagementService: {Module}ManagementService,
    // 统一的9个L3管理器注入（与Context和Plan模块完全相同）
    private readonly securityManager: MLPPSecurityManager,
    private readonly performanceMonitor: MLPPPerformanceMonitor,
    private readonly eventBusManager: MLPPEventBusManager,
    private readonly errorHandler: MLPPErrorHandler,
    private readonly coordinationManager: MLPPCoordinationManager,
    private readonly orchestrationManager: MLPPOrchestrationManager,
    private readonly stateSyncManager: MLPPStateSyncManager,
    private readonly transactionManager: MLPPTransactionManager,
    private readonly protocolVersionManager: MLPPProtocolVersionManager
  ) {
    super();
  }
}
```

### **统一业务逻辑集成模式**
```typescript
// 所有模块必须使用相同的标准调用序列
async executeOperation(request: MLPPRequest): Promise<MLPPResponse> {
  try {
    // 1. 安全验证（统一模式）
    await this.securityManager.validateRequest(request);

    // 2. 性能监控开始（统一模式）
    await this.performanceMonitor.startOperation(request.operation);

    // 3. 事务管理（统一模式）
    const transactionId = await this.transactionManager.beginTransaction();

    // 4. 业务逻辑执行
    const result = await this.{module}ManagementService.executeOperation(request);

    // 5. 状态同步（统一模式）
    await this.stateSyncManager.syncState(result);

    // 6. 事件发布（统一模式）
    await this.eventBusManager.publishEvent({
      type: `${request.operation}_completed`,
      data: result
    });

    // 7. 事务提交（统一模式）
    await this.transactionManager.commitTransaction(transactionId);

    // 8. 性能监控结束（统一模式）
    await this.performanceMonitor.endOperation(request.operation);

    return { success: true, data: result };
  } catch (error) {
    // 9. 错误处理（统一模式）
    await this.errorHandler.handleError(error);
    throw error;
  }
}
```

## 🔄 **统一开发工作流（所有10个模块使用IDENTICAL流程）**

### **模块重写工作流（基于Context和Plan模块的企业级成功模式）**
```markdown
CRITICAL: 所有模块重写必须遵循相同的7阶段流程，达到Context和Plan模块的企业级标准

阶段1: 强制文档阅读和架构理解
- 阅读完整的文档引用体系
- 理解统一架构原则和预留接口模式
- 通过架构理解验证问题

阶段2: Schema集成和Mapper实现
- 基于实际Schema生成完整字段映射表
- 实现包含所有9个横切关注点的完整Mapper类
- 确保100%字段映射和类型安全

阶段3: 横切关注点集成
- 集成所有9个L3管理器到模块协议类
- 实现标准化横切关注点调用模式
- 确保与Context和Plan模块完全一致

阶段4: 预留接口实现
- 实现8-10个预留接口（基于模块类型）
- 所有参数使用下划线前缀
- 集成横切关注点，等待CoreOrchestrator激活

阶段5: 统一协议接口实现
- 实现完整的MPLP协议接口标准
- 更新协议工厂配置
- 确保与其他模块接口一致性

阶段6: 质量验证执行
- 执行4层验证系统（Unit/Integration/Functional/System）
- 运行所有质量门禁验证
- 确保达到企业级/生产就绪标准

阶段7: 完成报告和文档更新
- 生成完整的重构完成报告
- 更新相关文档和API说明
- 确认架构合规性和质量达成
```

### **质量保证工作流（统一标准）**
```markdown
每个阶段必须通过的质量检查：

□ TypeScript编译：0错误（零容忍）
□ ESLint检查：0警告（零容忍）
□ Schema映射一致性：100%
□ 横切关注点集成：100%（所有9个关注点）
□ 预留接口完整性：100%
□ 协议接口合规性：100%
□ 测试覆盖率：>75%（企业标准）或>90%（生产就绪）
□ 性能SLA：<100ms响应时间
□ 安全合规：100%企业级标准
```

## Best Practices

### Code Organization
- **Single Responsibility**: Each module has one clear purpose
- **Dependency Injection**: Use constructor injection for dependencies
- **Interface Segregation**: Define focused interfaces
- **Error Boundaries**: Implement proper error handling

### Performance Optimization
- **Async Operations**: Use async/await for I/O operations
- **Caching**: Implement appropriate caching strategies
- **Connection Pooling**: Reuse database connections
- **Resource Management**: Proper cleanup of resources

### Security Practices
- **Input Validation**: Validate all inputs
- **Output Encoding**: Encode outputs appropriately
- **Authentication**: Verify user identity
- **Authorization**: Check user permissions
- **Audit Logging**: Log security-relevant events

## Troubleshooting

### Common Issues
1. **Protocol Interface Errors**
   - Ensure proper interface implementation
   - Check request/response format compliance
   - Validate cross-cutting concerns integration

2. **Performance Issues**
   - Profile application performance
   - Check database query efficiency
   - Validate caching effectiveness
   - Monitor resource usage

3. **Integration Problems**
   - Verify module dependencies
   - Check event bus configuration
   - Validate workflow orchestration
   - Test error propagation

### Debugging Tools
- **Logging**: Structured logging with correlation IDs
- **Tracing**: Distributed tracing with Jaeger
- **Metrics**: Performance metrics with Prometheus
- **Profiling**: Application profiling tools

## Compliance Checklist

### Architecture Compliance
- [ ] Implements `IMLPPProtocol` interface
- [ ] Uses unified request/response format
- [ ] Integrates all 9 cross-cutting concerns
- [ ] Follows standard module structure

### Quality Compliance
- [ ] Zero TypeScript compilation errors
- [ ] Zero ESLint warnings
- [ ] >90% test coverage
- [ ] Complete API documentation

### Security Compliance
- [ ] Input validation implemented
- [ ] Authentication/authorization integrated
- [ ] Audit logging enabled
- [ ] Security tests passing

### Performance Compliance
- [ ] Response time <100ms (P95)
- [ ] Memory usage within limits
- [ ] Performance tests passing
- [ ] SLA requirements met

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-22  
**Status**: Official Development Guide
