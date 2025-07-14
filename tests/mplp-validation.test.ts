/**
 * MPLP一阶段核心功能验证测试
 * 
 * @version v1.0.0
 * @created 2025-07-27T10:00:00+08:00
 * @description 用于验证MPLP一阶段核心功能是否正常工作
 */

import { TraceAdapterFactory } from '../src/adapters/trace/adapter-factory';
import { ITraceAdapter, AdapterType } from '../src/interfaces/trace-adapter.interface';
import { SchemaValidator } from '../src/core/schema/schema-validator';
import { EventEmitter } from 'events';
import { Logger, LogLevel } from '../src/utils/logger';
import { SchemaRuleType, SchemaViolationSeverity } from '../src/core/schema/interfaces';

describe('MPLP一阶段核心功能验证', () => {
  // 创建logger
  const logger = new Logger('TestValidator', LogLevel.DEBUG);
  
  test('日志系统正常工作', () => {
    const logSpy = jest.spyOn(console, 'log');
    
    logger.info('测试信息日志');
    logger.warn('测试警告日志');
    logger.error('测试错误日志');
    
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
  
  test('厂商中立适配器工厂正常工作', () => {
    // 获取适配器工厂单例
    const factory = TraceAdapterFactory.getInstance();
    expect(factory).toBeDefined();
    
    // 创建基础适配器
    const baseAdapter = factory.createAdapter(AdapterType.BASE, {
      name: 'test-base-adapter',
      version: '1.0.0',
      batchSize: 50
    });
    
    // 验证适配器创建成功
    expect(baseAdapter).toBeDefined();
    expect(baseAdapter.getAdapterInfo()).toBeDefined();
    expect(baseAdapter.getAdapterInfo().type).toBe(AdapterType.BASE);
    expect(baseAdapter.getAdapterInfo().version).toBe('1.0.0');
  });
  
  test('事件总线正常工作', () => {
    // 创建简单事件总线
    const eventBus = new EventEmitter();
    const mockHandler = jest.fn();
    
    // 订阅事件
    eventBus.on('test-event', mockHandler);
    
    // 发布事件
    eventBus.emit('test-event', { data: 'test' });
    
    // 验证事件处理器被调用
    expect(mockHandler).toHaveBeenCalledWith({ data: 'test' });
  });
  
  test('Schema验证系统正常工作', async () => {
    // 创建简单的测试规则
    const mockRule = {
      getId: () => 'test-rule',
      getType: () => SchemaRuleType.NAMING,
      getDescription: () => '测试规则',
      getSeverity: () => SchemaViolationSeverity.ERROR,
      validate: jest.fn().mockResolvedValue([
        {
          id: 'test-violation',
          ruleType: SchemaRuleType.NAMING,
          severity: SchemaViolationSeverity.ERROR,
          message: '测试违规',
          location: {
            filePath: 'test.ts'
          }
        }
      ])
    };
    
    // 创建Schema验证器
    const validator = new SchemaValidator({
      verbose: true
    });
    
    // 注册测试规则
    validator.registerRule(mockRule);
    
    // 验证获取规则
    const allRules = validator.getAllRules();
    expect(allRules.length).toBe(1);
    expect(allRules[0].getId()).toBe('test-rule');
    
    // 测试单个文件验证
    const mockValidate = jest.spyOn(validator, 'validateFile');
    mockValidate.mockResolvedValueOnce([
      {
        id: 'test-violation',
        ruleType: SchemaRuleType.NAMING,
        severity: SchemaViolationSeverity.ERROR,
        message: '测试违规',
        location: {
          filePath: 'test.ts'
        }
      }
    ]);
    
    const violations = await validator.validateFile('test.ts');
    expect(violations.length).toBe(1);
    expect(violations[0].id).toBe('test-violation');
    
    // 重置模拟
    mockValidate.mockRestore();
  });
}); 