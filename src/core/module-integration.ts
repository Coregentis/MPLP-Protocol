/**
 * MPLP模块集成管理器 - 厂商中立设计
 * 
 * 负责模块的注册、初始化和集成，确保模块间松耦合通信。
 * 
 * @version v1.0.0
 * @created 2025-07-18T11:00:00+08:00
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { EventBus, eventBus } from './event-bus';
import { EventType } from './event-types';
import { DependencyContainer, container } from './dependency-container';
import { DependencyAnalyzer } from './dependency-analyzer';
import { DependencyGraph } from './dependency-graph';
import { IModuleIntegration, ModuleConfig, ModuleInfo } from '../interfaces/module-integration.interface';

/**
 * 模块集成管理器
 */
export class ModuleIntegrationManager {
  private modules: Map<string, IModuleIntegration> = new Map();
  private moduleConfigs: Map<string, ModuleConfig> = new Map();
  private moduleInfo: Map<string, ModuleInfo> = new Map();
  private initialized: boolean = false;
  private startTime: number = 0;
  private dependencyAnalyzer: DependencyAnalyzer;
  private dependencyGraph: DependencyGraph;
  
  /**
   * 创建模块集成管理器
   * @param eventBus 事件总线
   * @param container 依赖注入容器
   */
  constructor(
    private readonly _eventBus: EventBus = eventBus,
    private readonly _container: DependencyContainer = container
  ) {
    this.dependencyGraph = new DependencyGraph(this._eventBus);
    this.dependencyAnalyzer = new DependencyAnalyzer(this._eventBus, {
      rootDir: process.cwd(),
      modulesDir: 'src/modules',
      outputDir: 'src/core/analysis'
    });
  }
  
  /**
   * 注册模块
   * @param moduleName 模块名称
   * @param moduleImpl 模块实现
   * @param config 模块配置
   */
  public registerModule(
    moduleName: string, 
    moduleImpl: IModuleIntegration, 
    config: ModuleConfig = {}
  ): void {
    if (this.modules.has(moduleName)) {
      throw new Error(`模块 ${moduleName} 已经注册`);
    }
    
    this.modules.set(moduleName, moduleImpl);
    this.moduleConfigs.set(moduleName, config);
    
    // 创建模块信息
    const moduleInfo: ModuleInfo = {
      name: moduleName,
      version: config.version || '1.0.0',
      dependencies: config.dependencies || [],
      interfaces: config.interfaces || [],
      isInitialized: false,
      isStarted: false,
      registrationTime: new Date().toISOString()
    };
    
    this.moduleInfo.set(moduleName, moduleInfo);
    
    // 发布模块注册事件
    this._eventBus.publish(EventType.MODULE_REGISTERED, {
      timestamp: new Date().toISOString(),
      module: moduleName,
      interfaces: moduleInfo.interfaces,
      version: moduleInfo.version
    });
  }
  
  /**
   * 初始化所有模块
   */
  public async initializeAll(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    this.startTime = Date.now();
    
    // 检查依赖关系
    await this.validateDependencies();
    
    // 按依赖顺序初始化模块
    const initOrder = this.getInitializationOrder();
    
    for (const moduleName of initOrder) {
      await this.initializeModule(moduleName);
    }
    
    this.initialized = true;
    
    const initTime = Date.now() - this.startTime;
    console.log(`所有模块初始化完成，耗时 ${initTime}ms`);
  }
  
  /**
   * 启动所有模块
   */
  public async startAll(): Promise<void> {
    if (!this.initialized) {
      await this.initializeAll();
    }
    
    const startTime = Date.now();
    
    // 按依赖顺序启动模块
    const startOrder = this.getInitializationOrder();
    
    for (const moduleName of startOrder) {
      await this.startModule(moduleName);
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`所有模块启动完成，耗时 ${totalTime}ms`);
  }
  
  /**
   * 停止所有模块
   */
  public async stopAll(): Promise<void> {
    // 按依赖顺序的反向停止模块
    const stopOrder = this.getInitializationOrder().reverse();
    
    for (const moduleName of stopOrder) {
      await this.stopModule(moduleName);
    }
    
    console.log('所有模块已停止');
  }
  
  /**
   * 获取模块
   * @param moduleName 模块名称
   * @returns 模块实现
   */
  public getModule<T extends IModuleIntegration>(moduleName: string): T {
    const module = this.modules.get(moduleName);
    if (!module) {
      throw new Error(`模块 ${moduleName} 未注册`);
    }
    return module as T;
  }
  
  /**
   * 获取模块信息
   * @param moduleName 模块名称
   * @returns 模块信息
   */
  public getModuleInfo(moduleName: string): ModuleInfo {
    const info = this.moduleInfo.get(moduleName);
    if (!info) {
      throw new Error(`模块 ${moduleName} 未注册`);
    }
    return { ...info };
  }
  
  /**
   * 获取所有模块信息
   * @returns 所有模块信息
   */
  public getAllModuleInfo(): Record<string, ModuleInfo> {
    const result: Record<string, ModuleInfo> = {};
    for (const [moduleName, info] of this.moduleInfo.entries()) {
      result[moduleName] = { ...info };
    }
    return result;
  }
  
  /**
   * 获取依赖图
   * @returns 依赖图
   */
  public getDependencyGraph(): DependencyGraph {
    return this.dependencyGraph;
  }
  
  /**
   * 导出依赖图可视化
   * @param outputPath 输出路径
   */
  public async exportDependencyVisualization(outputPath: string): Promise<void> {
    await this.dependencyAnalyzer.exportGraphVisualization(outputPath);
  }
  
  /**
   * 初始化模块
   * @private
   */
  private async initializeModule(moduleName: string): Promise<void> {
    const module = this.modules.get(moduleName);
    const info = this.moduleInfo.get(moduleName);
    
    if (!module || !info) {
      throw new Error(`模块 ${moduleName} 未注册`);
    }
    
    if (info.isInitialized) {
      return;
    }
    
    console.log(`初始化模块: ${moduleName}`);
    
    try {
      // 初始化模块
      await module.initialize(this._container);
      
      // 更新模块信息
      info.isInitialized = true;
      info.initializationTime = new Date().toISOString();
      
      // 发布模块初始化事件
      this._eventBus.publish(EventType.MODULE_INITIALIZED, {
        timestamp: new Date().toISOString(),
        module: moduleName,
        initTime: Date.now() - this.startTime
      });
      
      console.log(`模块 ${moduleName} 初始化成功`);
    } catch (error) {
      console.error(`模块 ${moduleName} 初始化失败:`, error);
      throw error;
    }
  }
  
  /**
   * 启动模块
   * @private
   */
  private async startModule(moduleName: string): Promise<void> {
    const module = this.modules.get(moduleName);
    const info = this.moduleInfo.get(moduleName);
    
    if (!module || !info) {
      throw new Error(`模块 ${moduleName} 未注册`);
    }
    
    if (!info.isInitialized) {
      throw new Error(`模块 ${moduleName} 尚未初始化`);
    }
    
    if (info.isStarted) {
      return;
    }
    
    console.log(`启动模块: ${moduleName}`);
    
    try {
      // 启动模块
      await module.start();
      
      // 更新模块信息
      info.isStarted = true;
      info.startTime = new Date().toISOString();
      
      // 发布模块启动事件
      this._eventBus.publish(EventType.MODULE_STARTED, {
        timestamp: new Date().toISOString(),
        module: moduleName
      });
      
      console.log(`模块 ${moduleName} 启动成功`);
    } catch (error) {
      console.error(`模块 ${moduleName} 启动失败:`, error);
      throw error;
    }
  }
  
  /**
   * 停止模块
   * @private
   */
  private async stopModule(moduleName: string): Promise<void> {
    const module = this.modules.get(moduleName);
    const info = this.moduleInfo.get(moduleName);
    
    if (!module || !info) {
      throw new Error(`模块 ${moduleName} 未注册`);
    }
    
    if (!info.isStarted) {
      return;
    }
    
    console.log(`停止模块: ${moduleName}`);
    
    try {
      // 停止模块
      await module.stop();
      
      // 更新模块信息
      info.isStarted = false;
      info.stopTime = new Date().toISOString();
      
      // 发布模块停止事件
      this._eventBus.publish(EventType.MODULE_STOPPED, {
        timestamp: new Date().toISOString(),
        module: moduleName
      });
      
      console.log(`模块 ${moduleName} 停止成功`);
    } catch (error) {
      console.error(`模块 ${moduleName} 停止失败:`, error);
      throw error;
    }
  }
  
  /**
   * 验证依赖关系
   * @private
   */
  private async validateDependencies(): Promise<void> {
    // 检查模块依赖
    for (const [moduleName, info] of this.moduleInfo.entries()) {
      for (const dependency of info.dependencies) {
        if (!this.modules.has(dependency)) {
          throw new Error(`模块 ${moduleName} 依赖的模块 ${dependency} 未注册`);
        }
      }
    }
    
    // 检查循环依赖
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      throw new Error(`检测到循环依赖: ${cycles.map(cycle => cycle.join(' -> ')).join(', ')}`);
    }
  }
  
  /**
   * 检测循环依赖
   * @private
   */
  private detectCycles(): string[][] {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];
    
    const dfs = (moduleName: string, path: string[] = []) => {
      if (recStack.has(moduleName)) {
        const cycle = [...path.slice(path.indexOf(moduleName)), moduleName];
        cycles.push(cycle);
        return;
      }
      
      if (visited.has(moduleName)) {
        return;
      }
      
      visited.add(moduleName);
      recStack.add(moduleName);
      path.push(moduleName);
      
      const info = this.moduleInfo.get(moduleName);
      if (info) {
        for (const dependency of info.dependencies) {
          dfs(dependency, [...path]);
        }
      }
      
      recStack.delete(moduleName);
    };
    
    for (const moduleName of this.modules.keys()) {
      if (!visited.has(moduleName)) {
        dfs(moduleName);
      }
    }
    
    return cycles;
  }
  
  /**
   * 获取初始化顺序
   * @private
   */
  private getInitializationOrder(): string[] {
    // 拓扑排序
    const result: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();
    
    const visit = (moduleName: string) => {
      if (temp.has(moduleName)) {
        throw new Error(`检测到循环依赖，模块: ${moduleName}`);
      }
      
      if (visited.has(moduleName)) {
        return;
      }
      
      temp.add(moduleName);
      
      const info = this.moduleInfo.get(moduleName);
      if (info) {
        for (const dependency of info.dependencies) {
          visit(dependency);
        }
      }
      
      temp.delete(moduleName);
      visited.add(moduleName);
      result.push(moduleName);
    };
    
    for (const moduleName of this.modules.keys()) {
      if (!visited.has(moduleName)) {
        visit(moduleName);
      }
    }
    
    return result;
  }
}

// 创建全局模块集成管理器实例
export const moduleIntegrationManager = new ModuleIntegrationManager(); 