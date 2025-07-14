/**
 * 追踪适配器工厂测试
 * 
 * @version v1.0.1
 * @created 2025-07-12T17:35:00+08:00
 * @compliance 100% Schema合规性 - 基于trace-protocol.json
 * @description 测试追踪适配器工厂的创建和管理适配器功能
 */

import { expect } from '@jest/globals';
import { TraceAdapterFactory, AdapterType } from '../../../src/adapters/trace/adapter-factory';
import { BaseTraceAdapter } from '../../../src/adapters/trace/base-trace-adapter';
import { EnhancedTraceAdapter } from '../../../src/adapters/trace/enhanced-trace-adapter';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('TraceAdapterFactory', () => {
  let factory: TraceAdapterFactory;
  
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 获取工厂实例
    factory = TraceAdapterFactory.getInstance({
      defaultType: AdapterType.BASE,
      enableAutoDetection: true,
      enableCache: true,
      cacheSize: 5
    });
    
    // 清除缓存
    factory.clearCache();
  });
  
  describe('getInstance', () => {
    test('应该返回单例实例', () => {
      const instance1 = TraceAdapterFactory.getInstance();
      const instance2 = TraceAdapterFactory.getInstance();
      
      expect(instance1).toBe(instance2);
    });
    
    test('应该使用提供的配置', () => {
      const customFactory = TraceAdapterFactory.getInstance({
        defaultType: AdapterType.ENHANCED,
        enableAutoDetection: false
      });
      
      // 创建适配器并验证默认类型
      const adapter = customFactory.createAdapter();
      expect(adapter).toBeInstanceOf(EnhancedTraceAdapter);
    });
  });
  
  describe('createAdapter', () => {
    test('应该创建基础适配器', () => {
      const adapter = factory.createAdapter(AdapterType.BASE);
      
      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(BaseTraceAdapter);
      expect(adapter.getAdapterInfo().type).toBe('base-trace-adapter');
    });
    
    test('应该创建增强型适配器', () => {
      const adapter = factory.createAdapter(AdapterType.ENHANCED);
      
      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(EnhancedTraceAdapter);
      expect(adapter.getAdapterInfo().type).toBe('enhanced-trace-adapter');
    });
    
    test('应该使用默认类型创建适配器', () => {
      const adapter = factory.createAdapter();
      
      expect(adapter).toBeDefined();
      expect(adapter).toBeInstanceOf(BaseTraceAdapter);
    });
    
    test('应该使用配置创建适配器', () => {
      const adapter = factory.createAdapter(AdapterType.BASE, {
        name: 'custom-adapter',
        version: '2.0.0'
      });
      
      expect(adapter).toBeDefined();
      expect(adapter.getAdapterInfo().type).toBe('custom-adapter');
      expect(adapter.getAdapterInfo().version).toBe('2.0.0');
    });
  });
  
  describe('缓存功能', () => {
    test('应该缓存创建的适配器', () => {
      // 创建第一个适配器
      const adapter1 = factory.createAdapter(AdapterType.BASE, { name: 'cached-adapter' });
      
      // 创建相同配置的第二个适配器
      const adapter2 = factory.createAdapter(AdapterType.BASE, { name: 'cached-adapter' });
      
      // 两个应该是同一个实例
      expect(adapter1).toBe(adapter2);
    });
    
    test('应该控制缓存大小', () => {
      // 创建超过缓存大小的适配器
      for (let i = 0; i < 10; i++) {
        factory.createAdapter(AdapterType.BASE, { name: `adapter-${i}` });
      }
      
      // 获取缓存的适配器
      const cachedAdapters = factory.getCachedAdapters();
      
      // 缓存大小应该不超过配置的大小
      expect(cachedAdapters.size).toBeLessThanOrEqual(5);
    });
    
    test('应该清除缓存', () => {
      // 创建一些适配器
      factory.createAdapter(AdapterType.BASE);
      factory.createAdapter(AdapterType.ENHANCED);
      
      // 清除缓存
      factory.clearCache();
      
      // 缓存应该为空
      expect(factory.getCachedAdapters().size).toBe(0);
    });
  });
  
  describe('autoDetectAdapter', () => {
    test('应该根据需求创建基础适配器', () => {
      const adapter = factory.autoDetectAdapter({
        needsAdvancedAnalytics: false,
        needsRecoverySuggestions: false,
        needsDevelopmentIssueDetection: false,
        performance: 'low',
        reliability: 'low'
      });
      
      expect(adapter).toBeInstanceOf(BaseTraceAdapter);
    });
    
    test('应该根据需求创建增强型适配器', () => {
      const adapter = factory.autoDetectAdapter({
        needsAdvancedAnalytics: true,
        needsRecoverySuggestions: true,
        performance: 'high',
        reliability: 'high'
      });
      
      expect(adapter).toBeInstanceOf(EnhancedTraceAdapter);
    });
    
    test('当自动检测禁用时应该使用默认类型', () => {
      // 创建禁用自动检测的工厂
      const customFactory = TraceAdapterFactory.getInstance({
        defaultType: AdapterType.BASE,
        enableAutoDetection: false
      });
      
      // 即使需要高级功能，也应该使用默认类型
      const adapter = customFactory.autoDetectAdapter({
        needsAdvancedAnalytics: true,
        needsRecoverySuggestions: true
      });
      
      expect(adapter).toBeInstanceOf(BaseTraceAdapter);
    });
  });
  
  describe('静态工具方法', () => {
    test('getAdapterInfo应该返回适配器信息', () => {
      const adapter = factory.createAdapter(AdapterType.BASE);
      const info = TraceAdapterFactory.getAdapterInfo(adapter);
      
      expect(info.type).toBe('base-trace-adapter');
      expect(info.version).toBeDefined();
    });
    
    test('detectAdapterType应该检测基础适配器', () => {
      const adapter = factory.createAdapter(AdapterType.BASE);
      const type = TraceAdapterFactory.detectAdapterType(adapter);
      
      expect(type).toBe(AdapterType.BASE);
    });
    
    test('detectAdapterType应该检测增强型适配器', () => {
      const adapter = factory.createAdapter(AdapterType.ENHANCED);
      const type = TraceAdapterFactory.detectAdapterType(adapter);
      
      expect(type).toBe(AdapterType.ENHANCED);
    });
    
    test('detectAdapterType应该检测自定义适配器', () => {
      // 创建一个模拟的自定义适配器
      const customAdapter = {
        getAdapterInfo: () => ({ type: 'custom-type', version: '1.0.0' }),
        syncTraceData: jest.fn(),
        syncBatch: jest.fn(),
        reportFailure: jest.fn(),
        checkHealth: jest.fn()
      } as unknown as ITraceAdapter;
      
      const type = TraceAdapterFactory.detectAdapterType(customAdapter);
      
      expect(type).toBe(AdapterType.CUSTOM);
    });
    
    test('supportsFeature应该检测功能支持', () => {
      // 基础适配器支持恢复建议
      const baseAdapter = factory.createAdapter(AdapterType.BASE);
      expect(TraceAdapterFactory.supportsFeature(baseAdapter, 'recovery_suggestions')).toBe(true);
      
      // 增强型适配器支持所有功能
      const enhancedAdapter = factory.createAdapter(AdapterType.ENHANCED);
      expect(TraceAdapterFactory.supportsFeature(enhancedAdapter, 'recovery_suggestions')).toBe(true);
      expect(TraceAdapterFactory.supportsFeature(enhancedAdapter, 'analytics')).toBe(true);
      expect(TraceAdapterFactory.supportsFeature(enhancedAdapter, 'issue_detection')).toBe(true);
      
      // 不支持未知功能
      expect(TraceAdapterFactory.supportsFeature(baseAdapter, 'unknown_feature')).toBe(false);
    });
  });
}); 