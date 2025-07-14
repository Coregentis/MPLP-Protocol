/**
 * MPLP适配器注册表 - 厂商中立设计
 * 
 * 提供统一的适配器注册和获取机制，确保厂商中立原则。
 * 所有模块都通过此注册表获取适配器实例，而非直接依赖具体实现。
 * 
 * @version v1.0.0
 * @created 2025-07-15T11:15:00+08:00
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { container, Tokens } from './dependency-container';
import { ITraceAdapter } from '../interfaces/trace-adapter.interface';
import { IPlanAdapter } from '../interfaces/plan-adapter.interface';
import { IConfirmAdapter } from '../interfaces/confirm-adapter.interface';
import { IExtensionAdapter } from '../interfaces/extension-adapter.interface';
import { logger } from '../utils/logger';

/**
 * 适配器类型枚举
 */
export enum AdapterType {
  TRACE = 'trace',
  PLAN = 'plan',
  CONFIRM = 'confirm',
  EXTENSION = 'extension'
}

/**
 * 适配器配置接口
 */
export interface AdapterConfig {
  type: string;
  version: string;
  options?: Record<string, unknown>;
}

/**
 * 适配器注册表
 * 负责管理和获取厂商中立的适配器实例
 */
export class AdapterRegistry {
  private static instance: AdapterRegistry;
  private adapters: Map<AdapterType, unknown> = new Map();
  private adapterConfigs: Map<AdapterType, AdapterConfig> = new Map();

  /**
   * 私有构造函数，确保单例模式
   */
  private constructor() {}

  /**
   * 获取适配器注册表实例
   * @returns 适配器注册表实例
   */
  public static getInstance(): AdapterRegistry {
    if (!AdapterRegistry.instance) {
      AdapterRegistry.instance = new AdapterRegistry();
    }
    return AdapterRegistry.instance;
  }

  /**
   * 注册追踪适配器
   * @param adapter 追踪适配器实例
   * @param config 适配器配置
   */
  public registerTraceAdapter(adapter: ITraceAdapter, config: AdapterConfig): void {
    this.adapters.set(AdapterType.TRACE, adapter);
    this.adapterConfigs.set(AdapterType.TRACE, config);
    container.registerInstance(Tokens.ITraceAdapter, adapter);
    
    logger.info('Trace adapter registered', {
      type: config.type,
      version: config.version
    });
  }

  /**
   * 注册计划适配器
   * @param adapter 计划适配器实例
   * @param config 适配器配置
   */
  public registerPlanAdapter(adapter: IPlanAdapter, config: AdapterConfig): void {
    this.adapters.set(AdapterType.PLAN, adapter);
    this.adapterConfigs.set(AdapterType.PLAN, config);
    container.registerInstance(Tokens.IPlanAdapter, adapter);
    
    logger.info('Plan adapter registered', {
      type: config.type,
      version: config.version
    });
  }

  /**
   * 注册确认适配器
   * @param adapter 确认适配器实例
   * @param config 适配器配置
   */
  public registerConfirmAdapter(adapter: IConfirmAdapter, config: AdapterConfig): void {
    this.adapters.set(AdapterType.CONFIRM, adapter);
    this.adapterConfigs.set(AdapterType.CONFIRM, config);
    container.registerInstance(Tokens.IConfirmAdapter, adapter);
    
    logger.info('Confirm adapter registered', {
      type: config.type,
      version: config.version
    });
  }

  /**
   * 注册扩展适配器
   * @param adapter 扩展适配器实例
   * @param config 适配器配置
   */
  public registerExtensionAdapter(adapter: IExtensionAdapter, config: AdapterConfig): void {
    this.adapters.set(AdapterType.EXTENSION, adapter);
    this.adapterConfigs.set(AdapterType.EXTENSION, config);
    container.registerInstance(Tokens.IExtensionAdapter, adapter);
    
    logger.info('Extension adapter registered', {
      type: config.type,
      version: config.version
    });
  }

  /**
   * 获取追踪适配器
   * @returns 追踪适配器实例
   */
  public getTraceAdapter(): ITraceAdapter {
    const adapter = this.adapters.get(AdapterType.TRACE) as ITraceAdapter | undefined;
    if (!adapter) {
      throw new Error('Trace adapter not registered');
    }
    return adapter;
  }

  /**
   * 获取计划适配器
   * @returns 计划适配器实例
   */
  public getPlanAdapter(): IPlanAdapter {
    const adapter = this.adapters.get(AdapterType.PLAN) as IPlanAdapter | undefined;
    if (!adapter) {
      throw new Error('Plan adapter not registered');
    }
    return adapter;
  }

  /**
   * 获取确认适配器
   * @returns 确认适配器实例
   */
  public getConfirmAdapter(): IConfirmAdapter {
    const adapter = this.adapters.get(AdapterType.CONFIRM) as IConfirmAdapter | undefined;
    if (!adapter) {
      throw new Error('Confirm adapter not registered');
    }
    return adapter;
  }

  /**
   * 获取扩展适配器
   * @returns 扩展适配器实例
   */
  public getExtensionAdapter(): IExtensionAdapter {
    const adapter = this.adapters.get(AdapterType.EXTENSION) as IExtensionAdapter | undefined;
    if (!adapter) {
      throw new Error('Extension adapter not registered');
    }
    return adapter;
  }

  /**
   * 检查适配器是否已注册
   * @param type 适配器类型
   * @returns 是否已注册
   */
  public hasAdapter(type: AdapterType): boolean {
    return this.adapters.has(type);
  }

  /**
   * 获取适配器配置
   * @param type 适配器类型
   * @returns 适配器配置
   */
  public getAdapterConfig(type: AdapterType): AdapterConfig | undefined {
    return this.adapterConfigs.get(type);
  }

  /**
   * 获取所有已注册的适配器类型
   * @returns 适配器类型数组
   */
  public getRegisteredAdapterTypes(): AdapterType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * 检查适配器健康状态
   * @returns 健康状态检查结果
   */
  public async checkAdaptersHealth(): Promise<Record<AdapterType, { 
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: Record<string, unknown>;
  }>> {
    const results: Record<AdapterType, any> = {} as any;
    
    // 检查追踪适配器
    if (this.hasAdapter(AdapterType.TRACE)) {
      try {
        const health = await this.getTraceAdapter().checkHealth();
        results[AdapterType.TRACE] = health;
      } catch (error) {
        results[AdapterType.TRACE] = {
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : String(error) }
        };
      }
    }
    
    // 检查计划适配器
    if (this.hasAdapter(AdapterType.PLAN)) {
      try {
        const health = await this.getPlanAdapter().checkHealth();
        results[AdapterType.PLAN] = health;
      } catch (error) {
        results[AdapterType.PLAN] = {
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : String(error) }
        };
      }
    }
    
    // 检查确认适配器
    if (this.hasAdapter(AdapterType.CONFIRM)) {
      try {
        const health = await this.getConfirmAdapter().checkHealth();
        results[AdapterType.CONFIRM] = health;
      } catch (error) {
        results[AdapterType.CONFIRM] = {
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : String(error) }
        };
      }
    }
    
    // 检查扩展适配器
    if (this.hasAdapter(AdapterType.EXTENSION)) {
      try {
        const health = await this.getExtensionAdapter().checkHealth();
        results[AdapterType.EXTENSION] = health;
      } catch (error) {
        results[AdapterType.EXTENSION] = {
          status: 'unhealthy',
          details: { error: error instanceof Error ? error.message : String(error) }
        };
      }
    }
    
    return results;
  }
}

// 导出单例实例
export const adapterRegistry = AdapterRegistry.getInstance(); 