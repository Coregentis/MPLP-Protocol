/**
 * 遗留适配器工厂 - 厂商中立设计
 * 
 * 提供向后兼容的适配器工厂方法，
 * 将所有功能委托给厂商中立的适配器工厂。
 * 
 * @version v1.0.0
 * @created 2025-07-16T14:30:00+08:00
 * @updated 2025-07-16T14:30:00+08:00
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 * @deprecated 推荐使用厂商中立的适配器工厂 (src/adapters/trace/adapter-factory.ts)
 */

import { ITraceAdapter } from '../interfaces/trace-adapter.interface';
import { IPlanAdapter } from '../interfaces/plan-adapter.interface';
import { IConfirmAdapter } from '../interfaces/confirm-adapter.interface';
import { IExtensionAdapter } from '../interfaces/extension-adapter.interface';
import { adapterRegistry, AdapterType } from '../core/adapter-registry';
import { logger } from '../utils/logger';
import { TraceAdapterFactory } from './trace/adapter-factory';

/**
 * 通用适配器配置
 */
export interface AdapterConfig {
  type: 'basic' | 'enhanced' | string;
  api_endpoint?: string;
  api_key?: string;
  organization_id?: string;
  project_id?: string;
  environment?: 'production' | 'staging' | 'development';
  sync_interval_ms?: number;
  batch_size?: number;
  features?: {
    advanced_analytics?: boolean;
    failure_prediction?: boolean;
    auto_recovery?: boolean;
    performance_optimization?: boolean;
  };
}

/**
 * 遗留适配器工厂类
 * 负责创建各种适配器实例，保持向后兼容性
 * 
 * @deprecated 推荐使用厂商中立的适配器工厂 (src/adapters/trace/adapter-factory.ts)
 */
export class LegacyAdapterFactory {
  /**
   * 创建追踪适配器
   * @param config 追踪适配器配置
   * @returns 追踪适配器实例
   * 
   * @deprecated 推荐使用 TraceAdapterFactory.getInstance().createAdapter()
   */
  public static createTraceAdapter(config: AdapterConfig): ITraceAdapter {
    logger.info('Creating trace adapter through legacy factory', { type: config.type });
    logger.warn('LegacyAdapterFactory is deprecated, use TraceAdapterFactory instead');
    
    // 使用厂商中立的适配器工厂
    const adapterFactory = TraceAdapterFactory.getInstance();
    
    // 将旧配置转换为厂商中立配置
    const adapterConfig = LegacyAdapterFactory.convertToVendorNeutralConfig(config);
    
    // 创建适配器
    const adapter = adapterFactory.createAdapter(
      config.type === 'enhanced' ? 'enhanced' : 'base',
      adapterConfig
    );
    
    // 注册到适配器注册表
    adapterRegistry.registerTraceAdapter(adapter, {
      type: config.type,
      version: adapter.getAdapterInfo().version,
      options: config as unknown as Record<string, unknown>
    });
    
    return adapter;
  }
  
  /**
   * 获取追踪适配器
   * @returns 追踪适配器实例
   * 
   * @deprecated 推荐使用 adapterRegistry.getTraceAdapter()
   */
  public static getTraceAdapter(): ITraceAdapter {
    logger.warn('LegacyAdapterFactory.getTraceAdapter is deprecated, use adapterRegistry.getTraceAdapter instead');
    
    if (!adapterRegistry.hasAdapter(AdapterType.TRACE)) {
      throw new Error('Trace adapter not registered. Call createTraceAdapter first.');
    }
    
    return adapterRegistry.getTraceAdapter();
  }
  
  /**
   * 将旧配置转换为厂商中立配置
   * @param config 旧配置
   * @returns 厂商中立配置
   */
  private static convertToVendorNeutralConfig(config: AdapterConfig): Record<string, unknown> {
    return {
      name: config.type === 'enhanced' ? 'enhanced-trace-adapter' : 'base-trace-adapter',
      version: config.type === 'enhanced' ? '1.0.1' : '1.0.0',
      batchSize: config.batch_size,
      timeout: 5000,
      cacheEnabled: true,
      cacheSize: 1000,
      // 增强型适配器特定配置
      ...(config.type === 'enhanced' ? {
        enableAdvancedAnalytics: config.features?.advanced_analytics || false,
        enableRecoverySuggestions: config.features?.auto_recovery || false,
        enableDevelopmentIssueDetection: config.features?.failure_prediction || false
      } : {})
    };
  }
  
  /**
   * 创建计划适配器（占位，待实现）
   */
  public static createPlanAdapter(): IPlanAdapter {
    logger.warn('LegacyAdapterFactory.createPlanAdapter is deprecated');
    throw new Error('Plan adapter not implemented yet');
  }
  
  /**
   * 创建确认适配器（占位，待实现）
   */
  public static createConfirmAdapter(): IConfirmAdapter {
    logger.warn('LegacyAdapterFactory.createConfirmAdapter is deprecated');
    throw new Error('Confirm adapter not implemented yet');
  }
  
  /**
   * 创建扩展适配器（占位，待实现）
   */
  public static createExtensionAdapter(): IExtensionAdapter {
    logger.warn('LegacyAdapterFactory.createExtensionAdapter is deprecated');
    throw new Error('Extension adapter not implemented yet');
  }
}

// 为了向后兼容，导出原名称的别名
export const AdapterFactory = LegacyAdapterFactory; 