/**
 * Logger测试
 * 基于RBCT方法论的完整测试覆盖
 */

import { Logger, LogLevel } from '../Logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: {
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    info: jest.SpyInstance;
    log: jest.SpyInstance;
  };

  beforeEach(() => {
    logger = new Logger('TestLogger');
    
    // Mock console methods
    consoleSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation()
    };
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('constructor', () => {
    it('应该使用默认日志级别INFO创建Logger', () => {
      const defaultLogger = new Logger('DefaultTest');
      
      // Test by checking if INFO level messages are logged
      defaultLogger.info('test message');
      expect(consoleSpy.info).toHaveBeenCalledWith('[DefaultTest] INFO:', 'test message');
    });

    it('应该使用指定的日志级别创建Logger', () => {
      const debugLogger = new Logger('DebugTest', LogLevel.DEBUG);
      
      // Test by checking if DEBUG level messages are logged
      debugLogger.debug('debug message');
      expect(consoleSpy.log).toHaveBeenCalledWith('[DebugTest] DEBUG:', 'debug message');
    });

    it('应该正确设置logger名称', () => {
      const namedLogger = new Logger('CustomName');
      namedLogger.error('test error');
      expect(consoleSpy.error).toHaveBeenCalledWith('[CustomName] ERROR:', 'test error');
    });
  });

  describe('setLevel', () => {
    it('应该正确设置日志级别', () => {
      logger.setLevel(LogLevel.ERROR);
      
      // ERROR should be logged
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('[TestLogger] ERROR:', 'error message');
      
      // WARN should not be logged (level too low)
      logger.warn('warn message');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('应该允许动态更改日志级别', () => {
      // Start with INFO level
      logger.setLevel(LogLevel.INFO);
      logger.debug('debug message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
      
      // Change to DEBUG level
      logger.setLevel(LogLevel.DEBUG);
      logger.debug('debug message');
      expect(consoleSpy.log).toHaveBeenCalledWith('[TestLogger] DEBUG:', 'debug message');
    });
  });

  describe('error', () => {
    it('应该在ERROR级别及以上记录错误消息', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.error('test error');
      expect(consoleSpy.error).toHaveBeenCalledWith('[TestLogger] ERROR:', 'test error');
    });

    it('应该支持额外参数', () => {
      logger.error('error with args', { key: 'value' }, 123);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[TestLogger] ERROR:', 
        'error with args', 
        { key: 'value' }, 
        123
      );
    });

    it('应该在级别过低时不记录错误消息', () => {
      // Set level below ERROR (this shouldn't happen in practice, but test edge case)
      logger.setLevel(-1 as LogLevel);
      logger.error('should not log');
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('应该在WARN级别及以上记录警告消息', () => {
      logger.setLevel(LogLevel.WARN);
      logger.warn('test warning');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[TestLogger] WARN:', 'test warning');
    });

    it('应该支持额外参数', () => {
      logger.warn('warning with args', { data: 'test' });
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[TestLogger] WARN:', 
        'warning with args', 
        { data: 'test' }
      );
    });

    it('应该在ERROR级别时不记录警告消息', () => {
      logger.setLevel(LogLevel.ERROR);
      logger.warn('should not log');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('应该在INFO级别及以上记录信息消息', () => {
      logger.setLevel(LogLevel.INFO);
      logger.info('test info');
      expect(consoleSpy.info).toHaveBeenCalledWith('[TestLogger] INFO:', 'test info');
    });

    it('应该支持额外参数', () => {
      logger.info('info with args', 'extra', 456);
      expect(consoleSpy.info).toHaveBeenCalledWith(
        '[TestLogger] INFO:', 
        'info with args', 
        'extra', 
        456
      );
    });

    it('应该在WARN级别时不记录信息消息', () => {
      logger.setLevel(LogLevel.WARN);
      logger.info('should not log');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('应该在DEBUG级别及以上记录调试消息', () => {
      logger.setLevel(LogLevel.DEBUG);
      logger.debug('test debug');
      expect(consoleSpy.log).toHaveBeenCalledWith('[TestLogger] DEBUG:', 'test debug');
    });

    it('应该支持额外参数', () => {
      logger.setLevel(LogLevel.DEBUG);
      logger.debug('debug with args', { debug: true });
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestLogger] DEBUG:', 
        'debug with args', 
        { debug: true }
      );
    });

    it('应该在INFO级别时不记录调试消息', () => {
      logger.setLevel(LogLevel.INFO);
      logger.debug('should not log');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('verbose', () => {
    it('应该在VERBOSE级别记录详细消息', () => {
      logger.setLevel(LogLevel.VERBOSE);
      logger.verbose('test verbose');
      expect(consoleSpy.log).toHaveBeenCalledWith('[TestLogger] VERBOSE:', 'test verbose');
    });

    it('应该支持额外参数', () => {
      logger.setLevel(LogLevel.VERBOSE);
      logger.verbose('verbose with args', { verbose: true }, [1, 2, 3]);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestLogger] VERBOSE:', 
        'verbose with args', 
        { verbose: true }, 
        [1, 2, 3]
      );
    });

    it('应该在DEBUG级别时不记录详细消息', () => {
      logger.setLevel(LogLevel.DEBUG);
      logger.verbose('should not log');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('日志级别层次结构', () => {
    it('应该正确实现日志级别层次结构', () => {
      // Test VERBOSE level (highest) - should log all
      logger.setLevel(LogLevel.VERBOSE);
      
      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');
      logger.verbose('verbose');
      
      expect(consoleSpy.error).toHaveBeenCalledWith('[TestLogger] ERROR:', 'error');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[TestLogger] WARN:', 'warn');
      expect(consoleSpy.info).toHaveBeenCalledWith('[TestLogger] INFO:', 'info');
      expect(consoleSpy.log).toHaveBeenCalledWith('[TestLogger] DEBUG:', 'debug');
      expect(consoleSpy.log).toHaveBeenCalledWith('[TestLogger] VERBOSE:', 'verbose');
    });

    it('应该在ERROR级别时只记录错误', () => {
      logger.setLevel(LogLevel.ERROR);
      
      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');
      logger.verbose('verbose');
      
      expect(consoleSpy.error).toHaveBeenCalledWith('[TestLogger] ERROR:', 'error');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空字符串消息', () => {
      logger.info('');
      expect(consoleSpy.info).toHaveBeenCalledWith('[TestLogger] INFO:', '');
    });

    it('应该处理undefined参数', () => {
      logger.info('test', undefined);
      expect(consoleSpy.info).toHaveBeenCalledWith('[TestLogger] INFO:', 'test', undefined);
    });

    it('应该处理null参数', () => {
      logger.info('test', null);
      expect(consoleSpy.info).toHaveBeenCalledWith('[TestLogger] INFO:', 'test', null);
    });

    it('应该处理复杂对象参数', () => {
      const complexObj = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
        func: () => 'function'
      };
      
      logger.info('complex object', complexObj);
      expect(consoleSpy.info).toHaveBeenCalledWith('[TestLogger] INFO:', 'complex object', complexObj);
    });
  });
});
