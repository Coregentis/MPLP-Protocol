/**
 * @fileoverview MPLPEventManager tests for Studio
 * @version 1.1.0-beta
 */

import { MPLPEventManager } from '../MPLPEventManager';

describe('MPLPEventManager测试', () => {
  let eventManager: MPLPEventManager;

  beforeEach(() => {
    eventManager = new MPLPEventManager();
  });

  afterEach(() => {
    eventManager.removeAllListeners();
  });

  describe('基础事件功能', () => {
    it('应该创建事件管理器实例', () => {
      expect(eventManager).toBeInstanceOf(MPLPEventManager);
    });

    it('应该注册和触发事件', () => {
      const mockHandler = jest.fn();
      eventManager.on('test-event', mockHandler);
      
      eventManager.emit('test-event', 'test-data');
      
      expect(mockHandler).toHaveBeenCalledWith('test-data');
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('应该支持多个监听器', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventManager.on('test-event', handler1);
      eventManager.on('test-event', handler2);
      
      eventManager.emit('test-event', 'test-data');
      
      expect(handler1).toHaveBeenCalledWith('test-data');
      expect(handler2).toHaveBeenCalledWith('test-data');
    });

    it('应该移除特定监听器', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventManager.on('test-event', handler1);
      eventManager.on('test-event', handler2);
      eventManager.off('test-event', handler1);
      
      eventManager.emit('test-event', 'test-data');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('test-data');
    });

    it('应该移除所有监听器', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventManager.on('test-event', handler1);
      eventManager.on('another-event', handler2);
      eventManager.removeAllListeners();
      
      eventManager.emit('test-event', 'test-data');
      eventManager.emit('another-event', 'test-data');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('应该移除特定事件的所有监听器', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      
      eventManager.on('test-event', handler1);
      eventManager.on('test-event', handler2);
      eventManager.on('another-event', handler3);
      eventManager.removeAllListeners('test-event');
      
      eventManager.emit('test-event', 'test-data');
      eventManager.emit('another-event', 'test-data');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalledWith('test-data');
    });
  });

  describe('事件传播', () => {
    it('应该传递多个参数', () => {
      const mockHandler = jest.fn();
      eventManager.on('test-event', mockHandler);
      
      eventManager.emit('test-event', 'arg1', 'arg2', 'arg3');
      
      expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('应该处理复杂数据类型', () => {
      const mockHandler = jest.fn();
      const testData = {
        id: 'test-id',
        data: { nested: 'value' },
        array: [1, 2, 3]
      };
      
      eventManager.on('test-event', mockHandler);
      eventManager.emit('test-event', testData);
      
      expect(mockHandler).toHaveBeenCalledWith(testData);
    });

    it('应该返回emit结果', () => {
      const handler = jest.fn();
      eventManager.on('test-event', handler);
      
      const result = eventManager.emit('test-event', 'test-data');
      expect(result).toBe(true);
      
      const noListenerResult = eventManager.emit('no-listener-event', 'test-data');
      expect(noListenerResult).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理监听器中的错误', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalHandler = jest.fn();
      
      eventManager.on('test-event', errorHandler);
      eventManager.on('test-event', normalHandler);
      
      // 即使一个监听器抛出错误，其他监听器仍应执行
      expect(() => {
        eventManager.emit('test-event', 'test-data');
      }).not.toThrow();
      
      expect(errorHandler).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();
    });

    it('应该处理无效的事件名称', () => {
      const handler = jest.fn();
      
      // 空字符串事件名
      eventManager.on('', handler);
      eventManager.emit('', 'test-data');
      expect(handler).toHaveBeenCalled();
      
      // null/undefined 应该被转换为字符串
      handler.mockClear();
      eventManager.on(null as any, handler);
      eventManager.emit(null as any, 'test-data');
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('内存管理', () => {
    it('应该正确清理监听器', () => {
      const handler = jest.fn();
      
      eventManager.on('test-event', handler);
      expect(eventManager.listenerCount('test-event')).toBe(1);
      
      eventManager.off('test-event', handler);
      expect(eventManager.listenerCount('test-event')).toBe(0);
    });

    it('应该处理重复移除监听器', () => {
      const handler = jest.fn();
      
      eventManager.on('test-event', handler);
      eventManager.off('test-event', handler);
      
      // 重复移除不应该抛出错误
      expect(() => {
        eventManager.off('test-event', handler);
      }).not.toThrow();
    });

    it('应该处理移除不存在的监听器', () => {
      const handler = jest.fn();
      
      // 移除从未添加的监听器不应该抛出错误
      expect(() => {
        eventManager.off('test-event', handler);
      }).not.toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该处理大量监听器', () => {
      const handlers: Array<() => void> = [];
      
      // 添加1000个监听器
      for (let i = 0; i < 1000; i++) {
        const handler = jest.fn();
        handlers.push(handler);
        eventManager.on('test-event', handler);
      }
      
      const startTime = Date.now();
      eventManager.emit('test-event', 'test-data');
      const endTime = Date.now();
      
      // 应该在合理时间内完成（100ms）
      expect(endTime - startTime).toBeLessThan(100);
      
      // 所有监听器都应该被调用
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledWith('test-data');
      });
    });

    it('应该处理大量事件类型', () => {
      const handlers: { [key: string]: jest.Mock } = {};
      
      // 添加1000个不同的事件类型
      for (let i = 0; i < 1000; i++) {
        const eventName = `test-event-${i}`;
        const handler = jest.fn();
        handlers[eventName] = handler;
        eventManager.on(eventName, handler);
      }
      
      const startTime = Date.now();
      
      // 触发所有事件
      for (let i = 0; i < 1000; i++) {
        const eventName = `test-event-${i}`;
        eventManager.emit(eventName, `data-${i}`);
      }
      
      const endTime = Date.now();
      
      // 应该在合理时间内完成（200ms）
      expect(endTime - startTime).toBeLessThan(200);
      
      // 所有监听器都应该被调用
      Object.keys(handlers).forEach((eventName, index) => {
        expect(handlers[eventName]).toHaveBeenCalledWith(`data-${index}`);
      });
    });
  });
});
