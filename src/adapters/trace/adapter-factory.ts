/**
 * MPLP Trace适配器工厂 - 厂商中立设计
 * 
 * @version v1.0.0
 * @created 2025-07-15T18:30:00+08:00
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计原则
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 */

import { ITraceAdapter, AdapterType, AdapterConfig } from '../../interfaces/trace-adapter.interface';
import { BaseTraceAdapter } from './base-trace-adapter';
import { EnhancedTraceAdapter } from './enhanced-trace-adapter';
import { logger } from '../../utils/logger';

// 重新导出AdapterType，让其他模块可以直接从这里导入
export { AdapterType } from '../../interfaces/trace-adapter.interface';

/**
 * 适配器工厂配置接口
 */
export interface AdapterFactoryConfig {
  defaultType?: AdapterType | string;
  enableAutoDetection?: boolean;
  enableCache?: boolean;
  cacheSize?: number;
}

/**
 * 追踪适配器工厂 - 厂商中立设计
 * 负责创建和管理各种类型的追踪适配器
 */
export class TraceAdapterFactory {
  private static instance: TraceAdapterFactory;
  private registeredAdapters: Map<string, new (config: AdapterConfig) => ITraceAdapter> = new Map();
  private config: AdapterFactoryConfig = {
    defaultType: AdapterType.BASE,
    enableAutoDetection: false,
    enableCache: true,
    cacheSize: 100
  };

  /**
   * 私有构造函数，防止外部直接实例化
   * @param config 工厂配置
   */
  private constructor(config?: AdapterFactoryConfig) {
    // 合并配置
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // 注册标准适配器
    this.registerAdapter(AdapterType.BASE, BaseTraceAdapter);
    this.registerAdapter(AdapterType.ENHANCED, EnhancedTraceAdapter);
    
    logger.info('TraceAdapterFactory initialized with standard adapters', {
      default_type: this.config.defaultType,
      auto_detection: this.config.enableAutoDetection
    });
  }

  /**
   * 获取工厂单例
   * @param config 工厂配置
   * @returns TraceAdapterFactory实例
   */
  public static getInstance(config?: AdapterFactoryConfig): TraceAdapterFactory {
    if (!TraceAdapterFactory.instance) {
      TraceAdapterFactory.instance = new TraceAdapterFactory(config);
    }
    return TraceAdapterFactory.instance;
  }

  /**
   * 注册适配器类型
   * @param type 适配器类型
   * @param adapterClass 适配器类
   */
  public registerAdapter(type: string, adapterClass: new (config: AdapterConfig) => ITraceAdapter): void {
    this.registeredAdapters.set(type, adapterClass);
    logger.debug(`Registered adapter type: ${type}`);
  }

  /**
   * 创建适配器实例
   * @param type 适配器类型，如果未提供则使用默认类型
   * @param config 适配器配置
   * @returns 适配器实例
   */
  public createAdapter(type?: AdapterType | string, config: AdapterConfig = {}): ITraceAdapter {
    // 如果未提供类型，使用默认类型
    const adapterType = type || this.config.defaultType;
    const adapterClass = this.registeredAdapters.get(adapterType as string);
    
    if (!adapterClass) {
      logger.error(`Unknown adapter type: ${adapterType}`);
      throw new Error(`Unknown adapter type: ${adapterType}`);
    }
    
    try {
      const adapter = new adapterClass(config);
      
      const adapterInfo = adapter.getAdapterInfo();
      logger.info('Created trace adapter', {
        type: adapterInfo.type,
        version: adapterInfo.version,
        capabilities: adapterInfo.capabilities || []
      });
      
      return adapter;
    } catch (error) {
      logger.error(`Failed to create adapter of type ${adapterType}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to create adapter of type ${adapterType}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取所有注册的适配器类型
   * @returns 适配器类型列表
   */
  public getRegisteredAdapterTypes(): string[] {
    return Array.from(this.registeredAdapters.keys());
  }
} 