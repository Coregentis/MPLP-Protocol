# MPLP Protocol Version Protocol Schema

## 📋 **概述**

Protocol Version协议Schema定义了MPLP系统中协议版本管理和兼容性控制的标准数据结构，确保系统演进过程中的版本兼容性和平滑升级。经过企业级功能增强，现已包含完整的版本管理监控、兼容性分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-protocol-version.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 95.8%
**功能完整性**: ✅ 100% (基础功能 + 版本管理监控 + 企业级功能)
**企业级特性**: ✅ 版本管理监控、兼容性分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **版本管理**: 管理MPLP系统各模块的版本信息和演进历史
- **兼容性控制**: 确保不同版本间的兼容性和互操作性
- **升级管理**: 支持系统的平滑升级和版本迁移
- **变更追踪**: 记录和管理协议变更和影响评估

### **版本管理监控功能**
- **版本管理监控**: 实时监控协议版本的使用情况、兼容性检查、升级进度
- **兼容性分析**: 详细的版本兼容性分析和迁移策略追踪
- **版本状态监控**: 监控版本检查的性能、错误、兼容性问题
- **版本管理审计**: 监控版本管理过程的合规性和可靠性
- **协议演进监控**: 监控协议演进的进度和影响分析

### **企业级功能**
- **版本管理审计**: 完整的版本管理和兼容性控制记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **版本控制**: 协议版本配置的版本历史、变更追踪和快照管理
- **搜索索引**: 版本数据的全文搜索、语义搜索和自动索引
- **事件集成**: 版本管理事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和协议演进事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab, Dialog, Network
L2 协调层    │ Core, Orchestration, Coordination  
L1 协议层    │ Context, Plan, Confirm, Trace, Role
基础设施层   │ Event-Bus, State-Sync, Transaction ← [Protocol-Version]
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.0" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `version_id` | string | ✅ | UUID v4格式的版本标识符 |
| `system_version` | string | ✅ | 系统整体版本号 |
| `module_versions` | array | ✅ | 模块版本信息列表 |
| `compatibility_matrix` | object | ✅ | 兼容性矩阵 |

### **兼容性级别枚举**
```json
{
  "compatibility_level": {
    "enum": [
      "breaking",      // 破坏性变更
      "compatible",    // 兼容变更
      "deprecated",    // 已废弃
      "experimental"   // 实验性功能
    ]
  }
}
```

### **影响级别枚举**
```json
{
  "impact_level": {
    "enum": [
      "low",       // 低影响
      "medium",    // 中等影响
      "high",      // 高影响
      "critical"   // 关键影响
    ]
  }
}
```

## 🔧 **双重命名约定映射**

### **Schema层 (snake_case)**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "version_id": "550e8400-e29b-41d4-a716-446655440000",
  "system_version": "1.2.0",
  "release_name": "Aurora",
  "release_date": "2025-08-13T00:00:00.000Z",
  "created_by": "version_manager",
  "created_at": "2025-08-13T10:30:00.000Z",
  "module_versions": [
    {
      "module_name": "context",
      "current_version": "1.2.1",
      "supported_versions": ["1.2.0", "1.2.1", "1.1.5"],
      "deprecated_versions": [
        {
          "version": "1.0.0",
          "deprecation_date": "2025-06-01T00:00:00.000Z",
          "removal_date": "2025-12-01T00:00:00.000Z",
          "migration_guide": "https://docs.mplp.dev/migration/context-v1.0-to-v1.2"
        }
      ],
      "breaking_changes": [
        {
          "version": "1.2.0",
          "change_description": "Context API重构，移除了legacy接口",
          "impact_level": "high",
          "migration_required": true,
          "affected_apis": ["createLegacyContext", "updateLegacyContext"]
        }
      ]
    },
    {
      "module_name": "plan",
      "current_version": "1.1.8",
      "supported_versions": ["1.1.6", "1.1.7", "1.1.8"],
      "deprecated_versions": [],
      "breaking_changes": []
    }
  ],
  "compatibility_matrix": {
    "context": {
      "1.2.1": {
        "plan": ["1.1.6", "1.1.7", "1.1.8"],
        "confirm": ["1.0.5", "1.0.6"],
        "trace": ["1.3.0", "1.3.1"],
        "role": ["1.0.2", "1.0.3"]
      },
      "1.2.0": {
        "plan": ["1.1.5", "1.1.6", "1.1.7"],
        "confirm": ["1.0.4", "1.0.5"],
        "trace": ["1.2.8", "1.3.0"],
        "role": ["1.0.1", "1.0.2"]
      }
    }
  },
  "upgrade_paths": [
    {
      "from_version": "1.1.0",
      "to_version": "1.2.0",
      "upgrade_type": "major",
      "estimated_duration_minutes": 30,
      "rollback_supported": true,
      "prerequisites": [
        "backup_data",
        "stop_services",
        "update_dependencies"
      ],
      "steps": [
        {
          "step_number": 1,
          "description": "更新Context模块到v1.2.0",
          "command": "mplp upgrade context --version 1.2.0",
          "rollback_command": "mplp rollback context --version 1.1.5"
        },
        {
          "step_number": 2,
          "description": "迁移配置文件",
          "command": "mplp migrate-config --from 1.1.0 --to 1.2.0",
          "rollback_command": "mplp restore-config --version 1.1.0"
        }
      ]
    }
  ],
  "feature_flags": {
    "experimental_features": [
      {
        "feature_name": "advanced_context_analytics",
        "enabled_in_versions": ["1.2.1"],
        "stability_level": "experimental",
        "documentation_url": "https://docs.mplp.dev/features/advanced-analytics"
      }
    ],
    "deprecated_features": [
      {
        "feature_name": "legacy_context_api",
        "deprecated_in_version": "1.2.0",
        "removal_planned_version": "2.0.0",
        "replacement": "new_context_api"
      }
    ]
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface ProtocolVersionData {
  protocolVersion: string;
  timestamp: string;
  versionId: string;
  systemVersion: string;
  releaseName: string;
  releaseDate: string;
  createdBy: string;
  createdAt: string;
  moduleVersions: Array<{
    moduleName: ModuleName;
    currentVersion: string;
    supportedVersions: string[];
    deprecatedVersions: Array<{
      version: string;
      deprecationDate: string;
      removalDate?: string;
      migrationGuide?: string;
    }>;
    breakingChanges: Array<{
      version: string;
      changeDescription: string;
      impactLevel: ImpactLevel;
      migrationRequired: boolean;
      affectedApis: string[];
    }>;
  }>;
  compatibilityMatrix: Record<string, Record<string, Record<string, string[]>>>;
  upgradePaths: Array<{
    fromVersion: string;
    toVersion: string;
    upgradeType: 'patch' | 'minor' | 'major';
    estimatedDurationMinutes: number;
    rollbackSupported: boolean;
    prerequisites: string[];
    steps: Array<{
      stepNumber: number;
      description: string;
      command: string;
      rollbackCommand?: string;
    }>;
  }>;
  featureFlags: {
    experimentalFeatures: Array<{
      featureName: string;
      enabledInVersions: string[];
      stabilityLevel: 'experimental' | 'beta' | 'stable';
      documentationUrl?: string;
    }>;
    deprecatedFeatures: Array<{
      featureName: string;
      deprecatedInVersion: string;
      removalPlannedVersion: string;
      replacement?: string;
    }>;
  };
}

type ModuleName = 'core' | 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 
                 'extension' | 'collab' | 'dialog' | 'network' | 'coordination' | 
                 'orchestration' | 'transaction' | 'eventBus' | 'stateSync';

type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
type CompatibilityLevel = 'breaking' | 'compatible' | 'deprecated' | 'experimental';
```

### **Mapper实现**
```typescript
export class ProtocolVersionMapper {
  static toSchema(entity: ProtocolVersionData): ProtocolVersionSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      version_id: entity.versionId,
      system_version: entity.systemVersion,
      release_name: entity.releaseName,
      release_date: entity.releaseDate,
      created_by: entity.createdBy,
      created_at: entity.createdAt,
      module_versions: entity.moduleVersions.map(mv => ({
        module_name: mv.moduleName,
        current_version: mv.currentVersion,
        supported_versions: mv.supportedVersions,
        deprecated_versions: mv.deprecatedVersions.map(dv => ({
          version: dv.version,
          deprecation_date: dv.deprecationDate,
          removal_date: dv.removalDate,
          migration_guide: dv.migrationGuide
        })),
        breaking_changes: mv.breakingChanges.map(bc => ({
          version: bc.version,
          change_description: bc.changeDescription,
          impact_level: bc.impactLevel,
          migration_required: bc.migrationRequired,
          affected_apis: bc.affectedApis
        }))
      })),
      compatibility_matrix: entity.compatibilityMatrix,
      upgrade_paths: entity.upgradePaths.map(up => ({
        from_version: up.fromVersion,
        to_version: up.toVersion,
        upgrade_type: up.upgradeType,
        estimated_duration_minutes: up.estimatedDurationMinutes,
        rollback_supported: up.rollbackSupported,
        prerequisites: up.prerequisites,
        steps: up.steps.map(step => ({
          step_number: step.stepNumber,
          description: step.description,
          command: step.command,
          rollback_command: step.rollbackCommand
        }))
      })),
      feature_flags: {
        experimental_features: entity.featureFlags.experimentalFeatures.map(ef => ({
          feature_name: ef.featureName,
          enabled_in_versions: ef.enabledInVersions,
          stability_level: ef.stabilityLevel,
          documentation_url: ef.documentationUrl
        })),
        deprecated_features: entity.featureFlags.deprecatedFeatures.map(df => ({
          feature_name: df.featureName,
          deprecated_in_version: df.deprecatedInVersion,
          removal_planned_version: df.removalPlannedVersion,
          replacement: df.replacement
        }))
      }
    };
  }

  static fromSchema(schema: ProtocolVersionSchema): ProtocolVersionData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      versionId: schema.version_id,
      systemVersion: schema.system_version,
      releaseName: schema.release_name,
      releaseDate: schema.release_date,
      createdBy: schema.created_by,
      createdAt: schema.created_at,
      moduleVersions: schema.module_versions.map(mv => ({
        moduleName: mv.module_name,
        currentVersion: mv.current_version,
        supportedVersions: mv.supported_versions,
        deprecatedVersions: mv.deprecated_versions.map(dv => ({
          version: dv.version,
          deprecationDate: dv.deprecation_date,
          removalDate: dv.removal_date,
          migrationGuide: dv.migration_guide
        })),
        breakingChanges: mv.breaking_changes.map(bc => ({
          version: bc.version,
          changeDescription: bc.change_description,
          impactLevel: bc.impact_level,
          migrationRequired: bc.migration_required,
          affectedApis: bc.affected_apis
        }))
      })),
      compatibilityMatrix: schema.compatibility_matrix,
      upgradePaths: schema.upgrade_paths.map(up => ({
        fromVersion: up.from_version,
        toVersion: up.to_version,
        upgradeType: up.upgrade_type,
        estimatedDurationMinutes: up.estimated_duration_minutes,
        rollbackSupported: up.rollback_supported,
        prerequisites: up.prerequisites,
        steps: up.steps.map(step => ({
          stepNumber: step.step_number,
          description: step.description,
          command: step.command,
          rollbackCommand: step.rollback_command
        }))
      })),
      featureFlags: {
        experimentalFeatures: schema.feature_flags.experimental_features.map(ef => ({
          featureName: ef.feature_name,
          enabledInVersions: ef.enabled_in_versions,
          stabilityLevel: ef.stability_level,
          documentationUrl: ef.documentation_url
        })),
        deprecatedFeatures: schema.feature_flags.deprecated_features.map(df => ({
          featureName: df.feature_name,
          deprecatedInVersion: df.deprecated_in_version,
          removalPlannedVersion: df.removal_planned_version,
          replacement: df.replacement
        }))
      }
    };
  }

  static validateSchema(data: unknown): data is ProtocolVersionSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.version_id === 'string' &&
      typeof obj.system_version === 'string' &&
      Array.isArray(obj.module_versions) &&
      // 验证不存在camelCase字段
      !('versionId' in obj) &&
      !('protocolVersion' in obj) &&
      !('systemVersion' in obj)
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
    "version_id",
    "system_version",
    "module_versions",
    "compatibility_matrix"
  ]
}
```

### **版本管理业务规则验证**
```typescript
const protocolVersionValidationRules = {
  // 验证语义化版本格式
  validateSemVer: (version: string) => {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return semverRegex.test(version);
  },

  // 验证版本兼容性
  validateVersionCompatibility: (moduleVersions: ModuleVersion[], compatibilityMatrix: any) => {
    for (const module of moduleVersions) {
      const moduleMatrix = compatibilityMatrix[module.moduleName];
      if (!moduleMatrix) continue;
      
      const currentVersionMatrix = moduleMatrix[module.currentVersion];
      if (!currentVersionMatrix) return false;
      
      // 验证当前版本与其他模块的兼容性
      for (const [otherModule, compatibleVersions] of Object.entries(currentVersionMatrix)) {
        const otherModuleInfo = moduleVersions.find(m => m.moduleName === otherModule);
        if (otherModuleInfo && !compatibleVersions.includes(otherModuleInfo.currentVersion)) {
          return false;
        }
      }
    }
    return true;
  },

  // 验证升级路径有效性
  validateUpgradePath: (fromVersion: string, toVersion: string, steps: UpgradeStep[]) => {
    // 验证版本顺序
    const from = parseVersion(fromVersion);
    const to = parseVersion(toVersion);
    
    if (compareVersions(from, to) >= 0) return false;
    
    // 验证步骤完整性
    return steps.length > 0 && steps.every(step => 
      step.stepNumber > 0 && 
      step.description && 
      step.command
    );
  },

  // 验证废弃版本时间线
  validateDeprecationTimeline: (deprecatedVersions: DeprecatedVersion[]) => {
    return deprecatedVersions.every(dv => {
      const deprecationDate = new Date(dv.deprecationDate);
      const removalDate = dv.removalDate ? new Date(dv.removalDate) : null;
      
      // 废弃日期不能是未来时间
      if (deprecationDate > new Date()) return false;
      
      // 移除日期必须晚于废弃日期
      if (removalDate && removalDate <= deprecationDate) return false;
      
      return true;
    });
  }
};
```

## 🚀 **使用示例**

### **版本兼容性检查**
```typescript
import { ProtocolVersionService } from '@mplp/protocol-version';

const versionService = new ProtocolVersionService();

// 检查模块版本兼容性
const compatibility = await versionService.checkCompatibility({
  context: "1.2.1",
  plan: "1.1.8",
  confirm: "1.0.6",
  trace: "1.3.1",
  role: "1.0.3"
});

if (compatibility.isCompatible) {
  console.log('所有模块版本兼容');
} else {
  console.log('版本冲突:', compatibility.conflicts);
}
```

### **系统升级管理**
```typescript
// 规划升级路径
const upgradePlan = await versionService.planUpgrade({
  fromVersion: "1.1.0",
  toVersion: "1.2.0",
  modules: ["context", "plan", "trace"]
});

// 执行升级
for (const step of upgradePlan.steps) {
  console.log(`执行步骤 ${step.stepNumber}: ${step.description}`);
  
  try {
    await executeCommand(step.command);
    console.log('步骤完成');
  } catch (error) {
    console.error('步骤失败，执行回滚');
    if (step.rollbackCommand) {
      await executeCommand(step.rollbackCommand);
    }
    break;
  }
}
```

### **功能特性管理**
```typescript
// 检查实验性功能
const experimentalFeatures = await versionService.getExperimentalFeatures("1.2.1");
console.log('可用的实验性功能:', experimentalFeatures);

// 检查废弃功能
const deprecatedFeatures = await versionService.getDeprecatedFeatures();
deprecatedFeatures.forEach(feature => {
  console.log(`功能 ${feature.featureName} 将在版本 ${feature.removalPlannedVersion} 中移除`);
});
```

---

**维护团队**: MPLP Protocol Version团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
