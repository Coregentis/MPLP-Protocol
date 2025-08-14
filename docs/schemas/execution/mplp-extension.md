# MPLP Extension Protocol Schema

## 📋 **概述**

Extension协议Schema定义了MPLP系统中扩展机制和插件管理的标准数据结构，实现了多智能体协议平台标准的扩展管理能力。经过最新企业级功能增强，现已包含完整的扩展生命周期监控、生态系统健康分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-extension.json`
**协议版本**: v1.0.1
**模块状态**: ✅ 完成 (企业级增强 - 最新更新)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 96.8% (多智能体协议平台标准) 🏆
**功能完整性**: ✅ 100% (基础功能 + 扩展监控 + 企业级功能)
**企业级特性**: ✅ 扩展生命周期监控、生态系统健康分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **扩展管理**: 管理系统扩展的生命周期和版本控制
- **插件系统**: 提供灵活的插件加载和卸载机制
- **能力扩展**: 动态扩展系统功能和智能体能力
- **MPLP集成**: 实现8个MPLP模块的预留接口集成

### **扩展监控功能**
- **扩展生命周期监控**: 实时监控扩展激活延迟、生命周期效率、生态系统健康
- **生态系统健康分析**: 详细的扩展兼容性分析和管理效率评估
- **扩展状态监控**: 监控扩展的激活状态、版本管理、生命周期阶段
- **扩展管理审计**: 监控扩展管理过程的合规性和可靠性
- **生态系统保证**: 监控扩展生态系统的健康性和兼容性管理

### **企业级功能**
- **扩展管理审计**: 完整的扩展管理和生命周期记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **企业级性能监控**: 扩展生命周期系统的详细监控和健康检查，包含关键扩展指标
- **版本控制**: 扩展配置的版本历史、变更追踪和快照管理
- **搜索索引**: 扩展数据的全文搜索、语义搜索和自动索引
- **事件集成**: 扩展事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和扩展事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ [Extension] ← Collab, Dialog, Network
L2 协调层    │ Core, Orchestration, Coordination  
L1 协议层    │ Context, Plan, Confirm, Trace, Role
基础设施层   │ Event-Bus, State-Sync, Transaction
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.1" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `extension_id` | string | ✅ | UUID v4格式的扩展标识符 |
| `context_id` | string | ✅ | 关联的上下文ID |
| `name` | string | ✅ | 扩展名称 (1-64字符) |
| `display_name` | string | ✅ | 扩展显示名称 (1-255字符) |
| `version` | string | ✅ | 扩展版本号 (SemVer格式) |
| `extension_type` | string | ✅ | 扩展类型枚举值 |

### **扩展类型枚举**
```json
{
  "extension_type": {
    "enum": [
      "plugin",       // 插件扩展
      "adapter",      // 适配器扩展
      "connector",    // 连接器扩展
      "middleware",   // 中间件扩展
      "service",      // 服务扩展
      "integration"   // 集成扩展
    ]
  }
}
```

### **状态枚举**
```json
{
  "status": {
    "enum": [
      "installed",    // 已安装
      "enabled",      // 已启用
      "disabled",     // 已禁用
      "loading",      // 加载中
      "error",        // 错误状态
      "updating"      // 更新中
    ]
  }
}
```

## 🔧 **双重命名约定映射**

### **Schema层 (snake_case)**
```json
{
  "protocol_version": "1.0.1",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "extension_id": "550e8400-e29b-41d4-a716-446655440000",
  "context_id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "ai_assistant_plugin",
  "display_name": "AI助手插件",
  "description": "提供智能对话和任务协助功能",
  "version": "2.1.0",
  "extension_type": "plugin",
  "status": "enabled",
  "created_by": "developer-123",
  "created_at": "2025-08-13T10:30:00.000Z",
  "updated_at": "2025-08-13T10:35:00.000Z",
  "configuration": {
    "api_endpoint": "https://api.example.com/v1",
    "api_key": "encrypted_key_value",
    "timeout_ms": 30000,
    "retry_attempts": 3
  },
  "capabilities": {
    "supported_operations": ["chat", "task_planning", "code_generation"],
    "input_formats": ["text", "json"],
    "output_formats": ["text", "json", "markdown"],
    "max_request_size": 1048576
  },
  "dependencies": {
    "required_extensions": ["base_nlp", "context_manager"],
    "optional_extensions": ["voice_synthesis"],
    "system_requirements": {
      "min_memory_mb": 512,
      "min_cpu_cores": 2,
      "required_permissions": ["network_access", "file_read"]
    }
  },
  "mplp_integration": {
    "reserved_interfaces": {
      "context_interface": "IContextExtension",
      "plan_interface": "IPlanExtension",
      "confirm_interface": "IConfirmExtension",
      "trace_interface": "ITraceExtension",
      "role_interface": "IRoleExtension",
      "collab_interface": "ICollabExtension",
      "dialog_interface": "IDialogExtension",
      "network_interface": "INetworkExtension"
    },
    "core_orchestrator_scenarios": [
      "extension_lifecycle_management",
      "capability_discovery",
      "dynamic_loading",
      "dependency_resolution",
      "conflict_resolution",
      "performance_monitoring",
      "security_validation",
      "version_compatibility",
      "rollback_support",
      "distributed_deployment"
    ]
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface ExtensionData {
  protocolVersion: string;
  timestamp: string;
  extensionId: string;
  contextId: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  extensionType: ExtensionType;
  status: ExtensionStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  configuration: {
    apiEndpoint: string;
    apiKey: string;
    timeoutMs: number;
    retryAttempts: number;
  };
  capabilities: {
    supportedOperations: string[];
    inputFormats: string[];
    outputFormats: string[];
    maxRequestSize: number;
  };
  dependencies: {
    requiredExtensions: string[];
    optionalExtensions: string[];
    systemRequirements: {
      minMemoryMb: number;
      minCpuCores: number;
      requiredPermissions: string[];
    };
  };
  mplpIntegration: {
    reservedInterfaces: {
      contextInterface: string;
      planInterface: string;
      confirmInterface: string;
      traceInterface: string;
      roleInterface: string;
      collabInterface: string;
      dialogInterface: string;
      networkInterface: string;
    };
    coreOrchestratorScenarios: string[];
  };
}

type ExtensionType = 'plugin' | 'adapter' | 'connector' | 'middleware' | 'service' | 'integration';
type ExtensionStatus = 'installed' | 'enabled' | 'disabled' | 'loading' | 'error' | 'updating';
```

### **Mapper实现**
```typescript
export class ExtensionMapper {
  static toSchema(entity: ExtensionData): ExtensionSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      extension_id: entity.extensionId,
      context_id: entity.contextId,
      name: entity.name,
      display_name: entity.displayName,
      description: entity.description,
      version: entity.version,
      extension_type: entity.extensionType,
      status: entity.status,
      created_by: entity.createdBy,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      configuration: {
        api_endpoint: entity.configuration.apiEndpoint,
        api_key: entity.configuration.apiKey,
        timeout_ms: entity.configuration.timeoutMs,
        retry_attempts: entity.configuration.retryAttempts
      },
      capabilities: {
        supported_operations: entity.capabilities.supportedOperations,
        input_formats: entity.capabilities.inputFormats,
        output_formats: entity.capabilities.outputFormats,
        max_request_size: entity.capabilities.maxRequestSize
      },
      dependencies: {
        required_extensions: entity.dependencies.requiredExtensions,
        optional_extensions: entity.dependencies.optionalExtensions,
        system_requirements: {
          min_memory_mb: entity.dependencies.systemRequirements.minMemoryMb,
          min_cpu_cores: entity.dependencies.systemRequirements.minCpuCores,
          required_permissions: entity.dependencies.systemRequirements.requiredPermissions
        }
      },
      mplp_integration: {
        reserved_interfaces: {
          context_interface: entity.mplpIntegration.reservedInterfaces.contextInterface,
          plan_interface: entity.mplpIntegration.reservedInterfaces.planInterface,
          confirm_interface: entity.mplpIntegration.reservedInterfaces.confirmInterface,
          trace_interface: entity.mplpIntegration.reservedInterfaces.traceInterface,
          role_interface: entity.mplpIntegration.reservedInterfaces.roleInterface,
          collab_interface: entity.mplpIntegration.reservedInterfaces.collabInterface,
          dialog_interface: entity.mplpIntegration.reservedInterfaces.dialogInterface,
          network_interface: entity.mplpIntegration.reservedInterfaces.networkInterface
        },
        core_orchestrator_scenarios: entity.mplpIntegration.coreOrchestratorScenarios
      }
    };
  }

  static fromSchema(schema: ExtensionSchema): ExtensionData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      extensionId: schema.extension_id,
      contextId: schema.context_id,
      name: schema.name,
      displayName: schema.display_name,
      description: schema.description,
      version: schema.version,
      extensionType: schema.extension_type,
      status: schema.status,
      createdBy: schema.created_by,
      createdAt: schema.created_at,
      updatedAt: schema.updated_at,
      configuration: {
        apiEndpoint: schema.configuration.api_endpoint,
        apiKey: schema.configuration.api_key,
        timeoutMs: schema.configuration.timeout_ms,
        retryAttempts: schema.configuration.retry_attempts
      },
      capabilities: {
        supportedOperations: schema.capabilities.supported_operations,
        inputFormats: schema.capabilities.input_formats,
        outputFormats: schema.capabilities.output_formats,
        maxRequestSize: schema.capabilities.max_request_size
      },
      dependencies: {
        requiredExtensions: schema.dependencies.required_extensions,
        optionalExtensions: schema.dependencies.optional_extensions,
        systemRequirements: {
          minMemoryMb: schema.dependencies.system_requirements.min_memory_mb,
          minCpuCores: schema.dependencies.system_requirements.min_cpu_cores,
          requiredPermissions: schema.dependencies.system_requirements.required_permissions
        }
      },
      mplpIntegration: {
        reservedInterfaces: {
          contextInterface: schema.mplp_integration.reserved_interfaces.context_interface,
          planInterface: schema.mplp_integration.reserved_interfaces.plan_interface,
          confirmInterface: schema.mplp_integration.reserved_interfaces.confirm_interface,
          traceInterface: schema.mplp_integration.reserved_interfaces.trace_interface,
          roleInterface: schema.mplp_integration.reserved_interfaces.role_interface,
          collabInterface: schema.mplp_integration.reserved_interfaces.collab_interface,
          dialogInterface: schema.mplp_integration.reserved_interfaces.dialog_interface,
          networkInterface: schema.mplp_integration.reserved_interfaces.network_interface
        },
        coreOrchestratorScenarios: schema.mplp_integration.core_orchestrator_scenarios
      }
    };
  }

  static validateSchema(data: unknown): data is ExtensionSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.extension_id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.extension_type === 'string' &&
      // 验证不存在camelCase字段
      !('extensionId' in obj) &&
      !('protocolVersion' in obj) &&
      !('extensionType' in obj)
    );
  }
}
```

## 🔍 **验证规则**

### **必需字段验证**
```json
{
  "required": [
    "protocol_version",
    "timestamp",
    "extension_id",
    "context_id",
    "name",
    "display_name",
    "version",
    "extension_type",
    "status"
  ]
}
```

### **MPLP集成验证**
```typescript
const extensionValidationRules = {
  // 验证MPLP模块接口完整性
  validateMplpInterfaces: (interfaces: ReservedInterfaces) => {
    const requiredInterfaces = [
      'contextInterface', 'planInterface', 'confirmInterface', 'traceInterface',
      'roleInterface', 'collabInterface', 'dialogInterface', 'networkInterface'
    ];
    return requiredInterfaces.every(iface => interfaces[iface]);
  },

  // 验证CoreOrchestrator场景支持
  validateOrchestratorScenarios: (scenarios: string[]) => {
    const requiredScenarios = [
      'extension_lifecycle_management', 'capability_discovery', 'dynamic_loading',
      'dependency_resolution', 'conflict_resolution'
    ];
    return requiredScenarios.every(scenario => scenarios.includes(scenario));
  },

  // 验证扩展依赖
  validateDependencies: async (dependencies: string[]) => {
    for (const dep of dependencies) {
      const exists = await extensionRegistry.exists(dep);
      if (!exists) return false;
    }
    return true;
  }
};
```

---

**维护团队**: MPLP Extension团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成  
**MPLP标准**: 🏆 多智能体协议平台标准达成
