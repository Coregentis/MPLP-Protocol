/**
 * MPLP v1.0 主导出文件
 * 
 * Multi-Agent Project Lifecycle Protocol
 * 统一导出所有模块的公共API
 * 
 * @version 1.0.0
 * @architecture DDD (Domain-Driven Design)
 * @created 2025-07-28
 */

// ===== 核心模块导出 =====
export {
  createDefaultCoreModule,
  CoreModuleOptions,
  CoreModuleExports,
  WorkflowTemplates,
  CORE_MODULE_INFO
} from './src/public/modules/core';

// ===== 协议模块导出 =====

// 导出模块加载器
export {
  moduleLoader,
  ModuleLoader,
  ModuleLoadOptions
} from './src/public/utils/module-loader';

// 导出集成管理器
export {
  moduleIntegrationManager,
  ModuleIntegrationManager,
  MODULE_REGISTRY,
  MODULE_INITIALIZATION_ORDER
} from './src/config/module-integration';

// 导出所有类型定义
export * from './src/types/module-exports';

// ===== 模块加载器导入 =====
import { moduleLoader } from './src/public/utils/module-loader';

// ===== 便捷初始化函数 =====

/**
 * 初始化Context模块
 */
export async function initializeContextModule(options?: any) {
  const result = await moduleLoader.loadModule('context', {
    enableValidation: true,
    enableHealthChecks: true,
    timeout: 30000,
    ...options
  });

  if (!result.success) {
    throw new Error(`Failed to initialize Context module: ${result.error}`);
  }

  return result.module;
}

/**
 * 初始化Plan模块
 */
export async function initializePlanModule(options?: any) {
  const result = await moduleLoader.loadModule('plan', {
    enableValidation: true,
    enableHealthChecks: true,
    timeout: 30000,
    ...options
  });

  if (!result.success) {
    throw new Error(`Failed to initialize Plan module: ${result.error}`);
  }

  return result.module;
}

/**
 * 初始化Confirm模块
 */
export async function initializeConfirmModule(options?: any) {
  const result = await moduleLoader.loadModule('confirm', {
    enableValidation: true,
    enableHealthChecks: true,
    timeout: 30000,
    ...options
  });

  if (!result.success) {
    throw new Error(`Failed to initialize Confirm module: ${result.error}`);
  }

  return result.module;
}

/**
 * 初始化Trace模块
 */
export async function initializeTraceModule(options?: any) {
  const result = await moduleLoader.loadModule('trace', {
    enableValidation: true,
    enableHealthChecks: true,
    timeout: 30000,
    ...options
  });

  if (!result.success) {
    throw new Error(`Failed to initialize Trace module: ${result.error}`);
  }

  return result.module;
}

/**
 * 初始化Role模块
 */
export async function initializeRoleModule(options?: any) {
  const result = await moduleLoader.loadModule('role', {
    enableValidation: true,
    enableHealthChecks: true,
    timeout: 30000,
    ...options
  });

  if (!result.success) {
    throw new Error(`Failed to initialize Role module: ${result.error}`);
  }

  return result.module;
}

/**
 * 初始化Extension模块
 */
export async function initializeExtensionModule(options?: any) {
  const result = await moduleLoader.loadModule('extension', {
    enableValidation: true,
    enableHealthChecks: true,
    timeout: 30000,
    ...options
  });

  if (!result.success) {
    throw new Error(`Failed to initialize Extension module: ${result.error}`);
  }

  return result.module;
}

/**
 * 初始化Core模块
 */
export async function initializeCoreModule(moduleServices: any, options?: any) {
  const result = await moduleLoader.loadModule('core', {
    enableValidation: true,
    enableHealthChecks: true,
    timeout: 30000,
    ...options
  });

  if (!result.success) {
    throw new Error(`Failed to initialize Core module: ${result.error}`);
  }

  // 将模块服务注入到Core模块
  const coreModule = result.module;
  if (coreModule && typeof coreModule.setModuleServices === 'function') {
    coreModule.setModuleServices(moduleServices);
  }

  return coreModule;
}

/**
 * 一键初始化所有MPLP模块
 *
 * @param options 模块配置选项
 * @returns 初始化后的完整MPLP实例
 */
export async function initializeMPLP(options: {
  context?: any;
  plan?: any;
  confirm?: any;
  trace?: any;
  role?: any;
  extension?: any;
  core?: any;
} = {}): Promise<MPLPInstance> {
  console.log('🚀 Initializing MPLP v1.0...');

  try {
    // 使用模块加载器按正确顺序初始化所有模块
    console.log('📦 Initializing protocol modules...');

    const loadResult = await moduleLoader.loadModules([
      'context', 'plan', 'confirm', 'trace', 'role', 'extension'
    ], {
      enableValidation: true,
      enableHealthChecks: true,
      timeout: 30000
    });

    if (!loadResult.success) {
      throw new Error(`Failed to load modules: ${Object.values(loadResult.failedModules).join(', ')}`);
    }

    console.log('✅ All protocol modules initialized successfully');

    // 准备模块服务
    const moduleServices = {
      contextService: loadResult.loadedModules.context?.contextManagementService,
      planService: loadResult.loadedModules.plan?.planManagementService,
      confirmService: loadResult.loadedModules.confirm?.confirmManagementService,
      traceService: loadResult.loadedModules.trace?.traceManagementService,
      roleService: loadResult.loadedModules.role?.roleManagementService,
      extensionService: loadResult.loadedModules.extension?.extensionManagementService
    };

    // 验证所有服务都已正确加载
    const missingServices = Object.entries(moduleServices)
      .filter(([_, service]) => !service)
      .map(([name]) => name);

    if (missingServices.length > 0) {
      throw new Error(`Missing module services: ${missingServices.join(', ')}`);
    }

    // 初始化Core调度器
    console.log('🎯 Initializing Core orchestrator...');
    const core = await initializeCoreModule(moduleServices, options.core);
    console.log('✅ Core orchestrator initialized');

    // 执行健康检查
    const healthStatus = core.moduleCoordinator.getModuleHealthStatus();
    const healthEntries = Array.from(healthStatus.entries()) as [string, boolean][];
    const unhealthyModules = healthEntries
      .filter(([_, isHealthy]) => !isHealthy)
      .map(([moduleName]) => moduleName);

    if (unhealthyModules.length > 0) {
      console.warn(`⚠️ Some modules are unhealthy: ${unhealthyModules.join(', ')}`);
    }

    console.log('🎉 MPLP v1.0 initialization completed successfully!');

    const instance: MPLPInstance = {
      core,
      modules: {
        context: loadResult.loadedModules.context,
        plan: loadResult.loadedModules.plan,
        confirm: loadResult.loadedModules.confirm,
        trace: loadResult.loadedModules.trace,
        role: loadResult.loadedModules.role,
        extension: loadResult.loadedModules.extension
      },
      moduleServices,
      info: MPLP_INFO,
      version: VERSION_INFO,

      // 便捷方法
      async shutdown() {
        console.log('🔄 Shutting down MPLP...');
        await moduleLoader.unloadAllModules();
        console.log('✅ MPLP shutdown completed');
      },

      async restart(newOptions?: typeof options) {
        console.log('🔄 Restarting MPLP...');
        await this.shutdown();
        return await initializeMPLP(newOptions || options);
      },

      getHealthStatus() {
        return core.moduleCoordinator.getModuleHealthStatus();
      },

      getModuleStatuses() {
        return core.orchestrator.getModuleStatuses();
      }
    };

    return instance;

  } catch (error) {
    console.error('❌ MPLP initialization failed:', error);
    throw error;
  }
}

/**
 * MPLP实例接口
 */
export interface MPLPInstance {
  core: any;
  modules: {
    context: any;
    plan: any;
    confirm: any;
    trace: any;
    role: any;
    extension: any;
  };
  moduleServices: {
    contextService: any;
    planService: any;
    confirmService: any;
    traceService: any;
    roleService: any;
    extensionService: any;
  };
  info: typeof MPLP_INFO;
  version: typeof VERSION_INFO;

  // 便捷方法
  shutdown(): Promise<void>;
  restart(options?: any): Promise<MPLPInstance>;
  getHealthStatus(): Map<string, boolean>;
  getModuleStatuses(): Map<string, any>;
}

// ===== 模块信息 =====
export const MPLP_INFO = {
  name: 'MPLP',
  version: '1.0.0',
  fullName: 'Multi-Agent Project Lifecycle Protocol',
  description: 'L4 Intelligent Agent Operating System with 10 complete modules',
  architecture: 'Domain-Driven Design (DDD)',
  modules: [
    'context',   // Context management and lifecycle
    'plan',      // Planning and task orchestration
    'confirm',   // Approval and confirmation workflows
    'trace',     // Monitoring and event tracking
    'role',      // Role-based access control
    'extension', // Plugin and extension management
    'collab',    // Multi-agent collaboration and decision-making
    'dialog',    // Dialog-driven development and memory
    'network',   // Agent network topology and routing
    'core'       // Runtime orchestrator and coordinator
  ],
  capabilities: [
    'multi_agent_coordination',
    'workflow_orchestration', 
    'lifecycle_management',
    'real_time_monitoring',
    'role_based_security',
    'extension_system',
    'vendor_neutral_design',
    'schema_driven_development'
  ],
  license: 'MIT',
  repository: 'https://github.com/your-org/mplp',
  documentation: 'https://docs.mplp.com'
} as const;

// ===== 版本兼容性 =====
export const VERSION_INFO = {
  current: '1.0.0',
  api_version: 'v1',
  schema_version: '1.0',
  compatibility: {
    node: '>=18.0.0',
    typescript: '>=5.0.0'
  },
  breaking_changes: [],
  deprecated_features: []
} as const;

// ===== 默认导出 =====
export default {
  initializeMPLP,
  initializeCoreModule,
  initializeContextModule,
  initializePlanModule,
  initializeConfirmModule,
  initializeTraceModule,
  initializeRoleModule,
  initializeExtensionModule,
  MPLP_INFO,
  VERSION_INFO
};
