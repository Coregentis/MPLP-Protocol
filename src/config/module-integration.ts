/**
 * MPLP v1.0 模块集成配置
 * 
 * 定义模块之间的依赖关系、初始化顺序和集成配置
 * 
 * @version 1.0.0
 * @created 2025-07-28
 */

// ===== 模块依赖关系定义 =====

/**
 * 模块信息接口
 */
export interface ModuleInfo {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  optionalDependencies?: string[];
  capabilities: string[];
  dddLayers: string[];
  status: 'stable' | 'beta' | 'alpha';
}

/**
 * 所有MPLP模块的信息
 */
export const MODULE_REGISTRY: Record<string, ModuleInfo> = {
  context: {
    name: 'context',
    version: '1.0.0',
    description: 'Context management and lifecycle',
    dependencies: [],
    capabilities: [
      'context_creation',
      'context_management',
      'lifecycle_tracking',
      'metadata_management'
    ],
    dddLayers: ['api', 'application', 'domain', 'infrastructure'],
    status: 'stable'
  },
  
  plan: {
    name: 'plan',
    version: '1.0.0',
    description: 'Planning and task orchestration',
    dependencies: ['context'],
    capabilities: [
      'plan_creation',
      'task_management',
      'dependency_tracking',
      'resource_allocation',
      'progress_monitoring'
    ],
    dddLayers: ['api', 'application', 'domain', 'infrastructure'],
    status: 'stable'
  },
  
  confirm: {
    name: 'confirm',
    version: '1.0.0',
    description: 'Approval and confirmation workflows',
    dependencies: ['context'],
    optionalDependencies: ['plan'],
    capabilities: [
      'approval_workflows',
      'decision_management',
      'notification_system',
      'deadline_management'
    ],
    dddLayers: ['api', 'application', 'domain', 'infrastructure'],
    status: 'stable'
  },
  
  trace: {
    name: 'trace',
    version: '1.0.0',
    description: 'Monitoring and event tracking',
    dependencies: [],
    optionalDependencies: ['context', 'plan', 'confirm'],
    capabilities: [
      'event_tracking',
      'performance_monitoring',
      'metrics_collection',
      'real_time_monitoring',
      'analytics'
    ],
    dddLayers: ['api', 'application', 'domain', 'infrastructure'],
    status: 'stable'
  },
  
  role: {
    name: 'role',
    version: '1.0.0',
    description: 'Role-based access control',
    dependencies: [],
    capabilities: [
      'rbac_management',
      'permission_control',
      'user_management',
      'audit_logging',
      'role_hierarchy'
    ],
    dddLayers: ['api', 'application', 'domain', 'infrastructure'],
    status: 'stable'
  },
  
  extension: {
    name: 'extension',
    version: '1.0.0',
    description: 'Plugin and extension management',
    dependencies: ['role'],
    optionalDependencies: ['context', 'plan', 'confirm', 'trace'],
    capabilities: [
      'plugin_management',
      'extension_loading',
      'hook_system',
      'sandboxing',
      'marketplace_integration'
    ],
    dddLayers: ['api', 'application', 'domain', 'infrastructure'],
    status: 'stable'
  },
  
  core: {
    name: 'core',
    version: '1.0.0',
    description: 'Runtime orchestrator and coordinator',
    dependencies: ['context', 'plan', 'confirm', 'trace', 'role', 'extension'],
    capabilities: [
      'workflow_orchestration',
      'module_coordination',
      'execution_management',
      'performance_monitoring',
      'error_handling'
    ],
    dddLayers: ['orchestrator', 'workflow', 'coordination'],
    status: 'stable'
  }
};

/**
 * 模块初始化顺序
 * 基于依赖关系确定的正确初始化顺序
 */
export const MODULE_INITIALIZATION_ORDER = [
  'context',    // 无依赖，最先初始化
  'trace',      // 无依赖，用于监控其他模块
  'role',       // 无依赖，权限管理
  'plan',       // 依赖context
  'confirm',    // 依赖context，可选依赖plan
  'extension',  // 依赖role，可选依赖其他模块
  'core'        // 依赖所有其他模块，最后初始化
];

/**
 * 模块集成配置
 */
export interface ModuleIntegrationConfig {
  enableDependencyValidation: boolean;
  enableCircularDependencyCheck: boolean;
  enableVersionCompatibilityCheck: boolean;
  enableHealthChecks: boolean;
  initializationTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * 默认集成配置
 */
export const DEFAULT_INTEGRATION_CONFIG: ModuleIntegrationConfig = {
  enableDependencyValidation: true,
  enableCircularDependencyCheck: true,
  enableVersionCompatibilityCheck: true,
  enableHealthChecks: true,
  initializationTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

/**
 * 模块依赖验证器
 */
export class ModuleDependencyValidator {
  /**
   * 验证模块依赖关系
   */
  static validateDependencies(modules: string[]): {
    valid: boolean;
    missing: string[];
    circular: string[];
  } {
    const missing: string[] = [];
    const circular: string[] = [];
    
    // 检查缺失的依赖
    for (const moduleName of modules) {
      const moduleInfo = MODULE_REGISTRY[moduleName];
      if (!moduleInfo) {
        missing.push(moduleName);
        continue;
      }
      
      for (const dependency of moduleInfo.dependencies) {
        if (!modules.includes(dependency)) {
          missing.push(dependency);
        }
      }
    }
    
    // 检查循环依赖
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const moduleName of modules) {
      if (!visited.has(moduleName)) {
        if (this.hasCircularDependency(moduleName, visited, recursionStack)) {
          circular.push(moduleName);
        }
      }
    }
    
    return {
      valid: missing.length === 0 && circular.length === 0,
      missing: [...new Set(missing)],
      circular: [...new Set(circular)]
    };
  }
  
  /**
   * 检查循环依赖
   */
  private static hasCircularDependency(
    moduleName: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(moduleName);
    recursionStack.add(moduleName);
    
    const moduleInfo = MODULE_REGISTRY[moduleName];
    if (!moduleInfo) return false;
    
    for (const dependency of moduleInfo.dependencies) {
      if (!visited.has(dependency)) {
        if (this.hasCircularDependency(dependency, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(dependency)) {
        return true;
      }
    }
    
    recursionStack.delete(moduleName);
    return false;
  }
  
  /**
   * 获取正确的初始化顺序
   */
  static getInitializationOrder(modules: string[]): string[] {
    return MODULE_INITIALIZATION_ORDER.filter(module => modules.includes(module));
  }
}

/**
 * 模块集成管理器
 */
export class ModuleIntegrationManager {
  private config: ModuleIntegrationConfig;
  private initializedModules = new Set<string>();
  
  constructor(config: Partial<ModuleIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_INTEGRATION_CONFIG, ...config };
  }
  
  /**
   * 验证模块集成配置
   */
  validateIntegration(modules: string[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 依赖验证
    if (this.config.enableDependencyValidation) {
      const validation = ModuleDependencyValidator.validateDependencies(modules);
      if (!validation.valid) {
        if (validation.missing.length > 0) {
          errors.push(`Missing dependencies: ${validation.missing.join(', ')}`);
        }
        if (validation.circular.length > 0) {
          errors.push(`Circular dependencies detected: ${validation.circular.join(', ')}`);
        }
      }
    }
    
    // 版本兼容性检查
    if (this.config.enableVersionCompatibilityCheck) {
      for (const moduleName of modules) {
        const moduleInfo = MODULE_REGISTRY[moduleName];
        if (!moduleInfo) {
          errors.push(`Unknown module: ${moduleName}`);
          continue;
        }
        
        if (moduleInfo.status === 'alpha') {
          warnings.push(`Module ${moduleName} is in alpha status`);
        } else if (moduleInfo.status === 'beta') {
          warnings.push(`Module ${moduleName} is in beta status`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 获取模块信息
   */
  getModuleInfo(moduleName: string): ModuleInfo | undefined {
    return MODULE_REGISTRY[moduleName];
  }
  
  /**
   * 获取所有模块信息
   */
  getAllModuleInfo(): Record<string, ModuleInfo> {
    return MODULE_REGISTRY;
  }
  
  /**
   * 标记模块为已初始化
   */
  markModuleInitialized(moduleName: string): void {
    this.initializedModules.add(moduleName);
  }
  
  /**
   * 检查模块是否已初始化
   */
  isModuleInitialized(moduleName: string): boolean {
    return this.initializedModules.has(moduleName);
  }
  
  /**
   * 获取已初始化的模块列表
   */
  getInitializedModules(): string[] {
    return Array.from(this.initializedModules);
  }
  
  /**
   * 重置初始化状态
   */
  reset(): void {
    this.initializedModules.clear();
  }
}

/**
 * 默认模块集成管理器实例
 */
export const moduleIntegrationManager = new ModuleIntegrationManager();

/**
 * 模块集成工具函数
 */
export const ModuleIntegrationUtils = {
  /**
   * 验证模块列表
   */
  validateModules(modules: string[]): boolean {
    const validation = ModuleDependencyValidator.validateDependencies(modules);
    return validation.valid;
  },
  
  /**
   * 获取模块初始化顺序
   */
  getInitializationOrder(modules: string[]): string[] {
    return ModuleDependencyValidator.getInitializationOrder(modules);
  },
  
  /**
   * 检查模块兼容性
   */
  checkCompatibility(modules: string[]): {
    compatible: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    for (const moduleName of modules) {
      const moduleInfo = MODULE_REGISTRY[moduleName];
      if (!moduleInfo) {
        issues.push(`Module ${moduleName} not found in registry`);
        continue;
      }
      
      // 检查依赖是否满足
      for (const dependency of moduleInfo.dependencies) {
        if (!modules.includes(dependency)) {
          issues.push(`Module ${moduleName} requires ${dependency}`);
        }
      }
    }
    
    return {
      compatible: issues.length === 0,
      issues
    };
  }
};

/**
 * 导出所有集成相关的类型和常量
 */
export {
  MODULE_REGISTRY as MODULES,
  MODULE_INITIALIZATION_ORDER as INIT_ORDER,
  DEFAULT_INTEGRATION_CONFIG as DEFAULT_CONFIG
};
