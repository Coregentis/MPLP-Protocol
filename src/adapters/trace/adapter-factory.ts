/**
 * Trace适配器工厂
 * 
 * 创建和管理追踪适配器实例
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { ITraceAdapter, AdapterType, AdapterConfig } from '../../interfaces/trace-adapter.interface';
import { BaseTraceAdapter } from './base-adapter';
import { ConsoleTraceAdapter } from './console-adapter';
import { Logger } from '../../public/utils/logger';

/**
 * 追踪适配器工厂类
 */
export class TraceAdapterFactory {
  private static instance: TraceAdapterFactory;
  private logger: Logger;
  private adapters: Map<string, ITraceAdapter>;

  private constructor() {
    this.logger = new Logger('TraceAdapterFactory');
    this.adapters = new Map();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): TraceAdapterFactory {
    if (!TraceAdapterFactory.instance) {
      TraceAdapterFactory.instance = new TraceAdapterFactory();
    }
    return TraceAdapterFactory.instance;
  }

  /**
   * 创建适配器
   */
  createAdapter(type: AdapterType | string, config: AdapterConfig): ITraceAdapter {
    const adapterKey = `${type}_${config.name}`;
    
    // 检查是否已存在
    if (this.adapters.has(adapterKey)) {
      return this.adapters.get(adapterKey)!;
    }

    let adapter: ITraceAdapter;

    switch (type) {
      case AdapterType.BASE:
        adapter = new BaseTraceAdapter();
        break;
      case AdapterType.CONSOLE:
        adapter = new ConsoleTraceAdapter();
        break;
      default:
        this.logger.warn('未知的适配器类型，使用基础适配器', { type });
        adapter = new BaseTraceAdapter();
        break;
    }

    // 初始化适配器
    adapter.initialize(config).catch(error => {
      this.logger.error('适配器初始化失败', {
        type,
        name: config.name,
        error: error instanceof Error ? error.message : String(error)
      });
    });

    this.adapters.set(adapterKey, adapter);
    
    this.logger.info('创建追踪适配器', {
      type,
      name: config.name,
      key: adapterKey
    });

    return adapter;
  }

  /**
   * 获取适配器
   */
  getAdapter(type: AdapterType | string, name: string): ITraceAdapter | undefined {
    const adapterKey = `${type}_${name}`;
    return this.adapters.get(adapterKey);
  }

  /**
   * 移除适配器
   */
  async removeAdapter(type: AdapterType | string, name: string): Promise<boolean> {
    const adapterKey = `${type}_${name}`;
    const adapter = this.adapters.get(adapterKey);
    
    if (adapter) {
      try {
        await adapter.close();
        this.adapters.delete(adapterKey);
        
        this.logger.info('移除追踪适配器', {
          type,
          name,
          key: adapterKey
        });
        
        return true;
      } catch (error) {
        this.logger.error('关闭适配器失败', {
          type,
          name,
          error: error instanceof Error ? error.message : String(error)
        });
        return false;
      }
    }
    
    return false;
  }

  /**
   * 获取所有适配器
   */
  getAllAdapters(): ITraceAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * 清理所有适配器
   */
  async cleanup(): Promise<void> {
    const closePromises = Array.from(this.adapters.values()).map(adapter => 
      adapter.close().catch(error => {
        this.logger.error('关闭适配器失败', {
          error: error instanceof Error ? error.message : String(error)
        });
      })
    );

    await Promise.all(closePromises);
    this.adapters.clear();
    
    this.logger.info('清理所有追踪适配器');
  }
}
