/**
 * 适配器注册表
 * @description 管理和注册各种适配器
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../utils/logger';

export enum AdapterType {
  TRACE = 'trace',
  PLAN = 'plan',
  CONFIRM = 'confirm',
  EXTENSION = 'extension',
  CONTEXT = 'context',
  ROLE = 'role'
}

export interface AdapterConfig {
  name: string;
  version: string;
  enabled?: boolean;
  options?: Record<string, any>;
}

export interface AdapterHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, any>;
  last_check: string;
}

export interface IAdapter {
  getAdapterInfo(): any;
  initialize(config: AdapterConfig): Promise<void>;
  checkHealth(): Promise<AdapterHealth>;
  close(): Promise<void>;
}

/**
 * 适配器注册表类
 */
export class AdapterRegistry {
  private adapters: Map<string, IAdapter> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('AdapterRegistry');
  }

  /**
   * 注册追踪适配器
   */
  registerTraceAdapter(adapter: IAdapter, config: AdapterConfig): void {
    const key = `${AdapterType.TRACE}_${config.name}`;
    this.adapters.set(key, adapter);
    this.logger.info('Trace adapter registered', { name: config.name });
  }

  /**
   * 注册计划适配器
   */
  registerPlanAdapter(adapter: IAdapter, config: AdapterConfig): void {
    const key = `${AdapterType.PLAN}_${config.name}`;
    this.adapters.set(key, adapter);
    this.logger.info('Plan adapter registered', { name: config.name });
  }

  /**
   * 注册确认适配器
   */
  registerConfirmAdapter(adapter: IAdapter, config: AdapterConfig): void {
    const key = `${AdapterType.CONFIRM}_${config.name}`;
    this.adapters.set(key, adapter);
    this.logger.info('Confirm adapter registered', { name: config.name });
  }

  /**
   * 注册扩展适配器
   */
  registerExtensionAdapter(adapter: IAdapter, config: AdapterConfig): void {
    const key = `${AdapterType.EXTENSION}_${config.name}`;
    this.adapters.set(key, adapter);
    this.logger.info('Extension adapter registered', { name: config.name });
  }

  /**
   * 检查是否有适配器
   */
  hasAdapter(type: AdapterType): boolean {
    for (const key of Array.from(this.adapters.keys())) {
      if (key.startsWith(type)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取已注册的适配器类型
   */
  getRegisteredAdapterTypes(): AdapterType[] {
    const types = new Set<AdapterType>();
    for (const key of Array.from(this.adapters.keys())) {
      const type = key.split('_')[0] as AdapterType;
      types.add(type);
    }
    return Array.from(types);
  }

  /**
   * 获取适配器
   */
  getAdapter(type: AdapterType, name: string): IAdapter | undefined {
    const key = `${type}_${name}`;
    return this.adapters.get(key);
  }

  /**
   * 移除适配器
   */
  async removeAdapter(type: AdapterType, name: string): Promise<boolean> {
    const key = `${type}_${name}`;
    const adapter = this.adapters.get(key);
    
    if (adapter) {
      try {
        await adapter.close();
        this.adapters.delete(key);
        this.logger.info('Adapter removed', { type, name });
        return true;
      } catch (error) {
        this.logger.error('Failed to remove adapter', { type, name, error });
        return false;
      }
    }
    
    return false;
  }

  /**
   * 获取所有适配器
   */
  getAllAdapters(): IAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * 检查所有适配器健康状态
   */
  async checkAllAdaptersHealth(): Promise<Map<string, AdapterHealth>> {
    const healthMap = new Map<string, AdapterHealth>();
    
    for (const [key, adapter] of Array.from(this.adapters.entries())) {
      try {
        const health = await adapter.checkHealth();
        healthMap.set(key, health);
      } catch (error) {
        healthMap.set(key, {
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          last_check: new Date().toISOString()
        });
      }
    }
    
    return healthMap;
  }

  /**
   * 清理所有适配器
   */
  async cleanup(): Promise<void> {
    const promises = Array.from(this.adapters.values()).map(adapter => 
      adapter.close().catch(error => 
        this.logger.error('Failed to close adapter', { error })
      )
    );
    
    await Promise.all(promises);
    this.adapters.clear();
    this.logger.info('All adapters cleaned up');
  }
}
