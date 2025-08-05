/**
 * MPLP v1.0 模块加载器
 * 
 * 负责动态加载、初始化和管理MPLP模块
 * 
 * @version 1.0.0
 * @created 2025-07-28
 */

import { 
  ModuleIntegrationManager, 
  ModuleDependencyValidator,
  MODULE_REGISTRY,
  MODULE_INITIALIZATION_ORDER,
  ModuleIntegrationConfig
} from '../../config/module-integration';

/**
 * 模块加载选项
 */
export interface ModuleLoadOptions {
  enableValidation?: boolean;
  enableHealthChecks?: boolean;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  skipOptionalDependencies?: boolean;
}

/**
 * 模块加载结果
 */
export interface ModuleLoadResult {
  success: boolean;
  module?: any;
  error?: string;
  warnings?: string[];
  loadTime?: number;
}

/**
 * 批量模块加载结果
 */
export interface BatchLoadResult {
  success: boolean;
  loadedModules: Record<string, any>;
  failedModules: Record<string, string>;
  warnings: string[];
  totalLoadTime: number;
}

/**
 * 模块加载器类
 */
export class ModuleLoader {
  private integrationManager: ModuleIntegrationManager;
  private loadedModules = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<ModuleLoadResult>>();

  constructor(config?: Partial<ModuleIntegrationConfig>) {
    this.integrationManager = new ModuleIntegrationManager(config);
  }

  /**
   * 加载单个模块
   */
  async loadModule(
    moduleName: string, 
    options: ModuleLoadOptions = {}
  ): Promise<ModuleLoadResult> {
    const startTime = Date.now();
    
    try {
      // 检查是否已经在加载中
      if (this.loadingPromises.has(moduleName)) {
        return await this.loadingPromises.get(moduleName)!;
      }

      // 检查是否已经加载
      if (this.loadedModules.has(moduleName)) {
        return {
          success: true,
          module: this.loadedModules.get(moduleName),
          loadTime: 0
        };
      }

      // 创建加载Promise
      const loadPromise = this._loadModuleInternal(moduleName, options);
      this.loadingPromises.set(moduleName, loadPromise);

      const result = await loadPromise;
      
      // 清理加载Promise
      this.loadingPromises.delete(moduleName);
      
      // 如果加载成功，缓存模块
      if (result.success && result.module) {
        this.loadedModules.set(moduleName, result.module);
        this.integrationManager.markModuleInitialized(moduleName);
      }

      result.loadTime = Date.now() - startTime;
      return result;

    } catch (error) {
      this.loadingPromises.delete(moduleName);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        loadTime: Date.now() - startTime
      };
    }
  }

  /**
   * 内部模块加载实现
   */
  private async _loadModuleInternal(
    moduleName: string,
    options: ModuleLoadOptions
  ): Promise<ModuleLoadResult> {
    const warnings: string[] = [];

    // 验证模块是否存在
    const moduleInfo = MODULE_REGISTRY[moduleName];
    if (!moduleInfo) {
      return {
        success: false,
        error: `Module '${moduleName}' not found in registry`
      };
    }

    // 验证依赖关系
    if (options.enableValidation !== false) {
      const validation = this.integrationManager.validateIntegration([moduleName]);
      if (!validation.valid) {
        return {
          success: false,
          error: `Module validation failed: ${validation.errors.join(', ')}`
        };
      }
      warnings.push(...validation.warnings);
    }

    // 加载依赖模块
    for (const dependency of moduleInfo.dependencies) {
      if (!this.loadedModules.has(dependency)) {
        const depResult = await this.loadModule(dependency, options);
        if (!depResult.success) {
          return {
            success: false,
            error: `Failed to load dependency '${dependency}': ${depResult.error}`
          };
        }
      }
    }

    // 动态导入模块
    let moduleClass: any;
    try {
      const moduleImport = await this._importModule(moduleName);
      moduleClass = moduleImport.default || moduleImport[this._getModuleClassName(moduleName)];
      
      if (!moduleClass) {
        return {
          success: false,
          error: `Module class not found for '${moduleName}'`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to import module '${moduleName}': ${error}`
      };
    }

    // 初始化模块
    try {
      const moduleInstance = new moduleClass();
      
      // 如果模块有initialize方法，调用它
      if (typeof moduleInstance.initialize === 'function') {
        await this._withTimeout(
          moduleInstance.initialize(),
          options.timeout || 30000,
          `Module '${moduleName}' initialization timeout`
        );
      }

      // 健康检查
      if (options.enableHealthChecks !== false) {
        const healthCheck = await this._performHealthCheck(moduleInstance, moduleName);
        if (!healthCheck.healthy) {
          warnings.push(`Health check warning for '${moduleName}': ${healthCheck.message}`);
        }
      }

      return {
        success: true,
        module: moduleInstance,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to initialize module '${moduleName}': ${error}`
      };
    }
  }

  /**
   * 批量加载模块
   */
  async loadModules(
    moduleNames: string[],
    options: ModuleLoadOptions = {}
  ): Promise<BatchLoadResult> {
    const startTime = Date.now();
    const loadedModules: Record<string, any> = {};
    const failedModules: Record<string, string> = {};
    const allWarnings: string[] = [];

    // 获取正确的初始化顺序
    const orderedModules = ModuleDependencyValidator.getInitializationOrder(moduleNames);

    // 按顺序加载模块
    for (const moduleName of orderedModules) {
      const result = await this.loadModule(moduleName, options);
      
      if (result.success && result.module) {
        loadedModules[moduleName] = result.module;
        if (result.warnings) {
          allWarnings.push(...result.warnings);
        }
      } else {
        failedModules[moduleName] = result.error || 'Unknown error';
      }
    }

    return {
      success: Object.keys(failedModules).length === 0,
      loadedModules,
      failedModules,
      warnings: allWarnings,
      totalLoadTime: Date.now() - startTime
    };
  }

  /**
   * 加载所有可用模块
   */
  async loadAllModules(options: ModuleLoadOptions = {}): Promise<BatchLoadResult> {
    const allModules = Object.keys(MODULE_REGISTRY);
    return await this.loadModules(allModules, options);
  }

  /**
   * 获取已加载的模块
   */
  getLoadedModule(moduleName: string): any | undefined {
    return this.loadedModules.get(moduleName);
  }

  /**
   * 获取所有已加载的模块
   */
  getAllLoadedModules(): Record<string, any> {
    return Object.fromEntries(this.loadedModules);
  }

  /**
   * 检查模块是否已加载
   */
  isModuleLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }

  /**
   * 卸载模块
   */
  async unloadModule(moduleName: string): Promise<boolean> {
    try {
      const module = this.loadedModules.get(moduleName);
      if (!module) {
        return true; // 模块未加载，视为成功
      }

      // 如果模块有cleanup方法，调用它
      if (typeof module.cleanup === 'function') {
        await module.cleanup();
      }

      this.loadedModules.delete(moduleName);
      return true;
    } catch (error) {
      console.error(`Failed to unload module '${moduleName}':`, error);
      return false;
    }
  }

  /**
   * 卸载所有模块
   */
  async unloadAllModules(): Promise<void> {
    const moduleNames = Array.from(this.loadedModules.keys());
    
    // 按相反顺序卸载模块
    for (const moduleName of moduleNames.reverse()) {
      await this.unloadModule(moduleName);
    }
    
    this.integrationManager.reset();
  }

  /**
   * 重新加载模块
   */
  async reloadModule(moduleName: string, options: ModuleLoadOptions = {}): Promise<ModuleLoadResult> {
    await this.unloadModule(moduleName);
    return await this.loadModule(moduleName, options);
  }

  /**
   * 动态导入模块
   */
  private async _importModule(moduleName: string): Promise<any> {
    const modulePath = `../../../modules/${moduleName}/module`;
    return await import(modulePath);
  }

  /**
   * 获取模块类名
   */
  private _getModuleClassName(moduleName: string): string {
    return moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Module';
  }

  /**
   * 带超时的Promise执行
   */
  private async _withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(errorMessage));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    });
  }

  /**
   * 执行健康检查
   */
  private async _performHealthCheck(
    moduleInstance: any,
    moduleName: string
  ): Promise<{ healthy: boolean; message?: string }> {
    try {
      // 如果模块有healthCheck方法，调用它
      if (typeof moduleInstance.healthCheck === 'function') {
        const result = await moduleInstance.healthCheck();
        return {
          healthy: result === true || (result && result.healthy === true),
          message: result && result.message
        };
      }

      // 基本健康检查：检查模块是否有必要的方法
      const requiredMethods = ['initialize'];
      for (const method of requiredMethods) {
        if (typeof moduleInstance[method] !== 'function') {
          return {
            healthy: false,
            message: `Missing required method: ${method}`
          };
        }
      }

      return { healthy: true };
    } catch (error) {
      return {
        healthy: false,
        message: `Health check failed: ${error}`
      };
    }
  }
}

/**
 * 默认模块加载器实例
 */
export const moduleLoader = new ModuleLoader();

/**
 * 便捷函数：加载单个模块
 */
export async function loadModule(
  moduleName: string,
  options?: ModuleLoadOptions
): Promise<ModuleLoadResult> {
  return await moduleLoader.loadModule(moduleName, options);
}

/**
 * 便捷函数：批量加载模块
 */
export async function loadModules(
  moduleNames: string[],
  options?: ModuleLoadOptions
): Promise<BatchLoadResult> {
  return await moduleLoader.loadModules(moduleNames, options);
}

/**
 * 便捷函数：加载所有模块
 */
export async function loadAllModules(
  options?: ModuleLoadOptions
): Promise<BatchLoadResult> {
  return await moduleLoader.loadAllModules(options);
}
