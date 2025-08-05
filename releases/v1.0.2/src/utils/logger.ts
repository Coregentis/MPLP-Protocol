/**
 * MPLP日志工具 - 厂商中立设计
 * 
 * 提供统一的日志记录功能，遵循厂商中立原则，不依赖特定日志服务。
 * 可通过适配器模式扩展到不同的日志后端。
 * 
 * @version v1.0.0
 * @created 2025-07-09T10:00:00+08:00
 * @updated 2025-08-14T15:30:00+08:00
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * 日志选项接口
 */
export interface LoggerOptions {
  /**
   * 日志级别
   */
  level?: LogLevel;
  
  /**
   * 是否包含时间戳
   */
  includeTimestamp?: boolean;
  
  /**
   * 是否包含调用栈
   */
  includeStack?: boolean;
  
  /**
   * 自定义格式化函数
   */
  formatter?: (level: LogLevel, message: string, namespace: string, timestamp: string, data?: any) => string;
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  /**
   * 日志级别
   */
  level: LogLevel;
  
  /**
   * 日志消息
   */
  message: string;
  
  /**
   * 命名空间
   */
  namespace: string;
  
  /**
   * 时间戳
   */
  timestamp: string;
  
  /**
   * 附加数据
   */
  data?: any;
  
  /**
   * 调用栈
   */
  stack?: string;
}

/**
 * 日志类
 * 
 * 提供统一的日志记录功能，支持不同日志级别和格式化选项
 */
export class Logger {
  private namespace: string;
  private level: LogLevel;
  private includeTimestamp: boolean;
  private includeStack: boolean;
  private formatter?: (level: LogLevel, message: string, namespace: string, timestamp: string, data?: any) => string;

  /**
   * 构造函数
   * 
   * @param namespace 日志命名空间
   * @param options 日志选项
   */
  constructor(namespace: string, options: LoggerOptions = {}) {
    this.namespace = namespace;
    this.level = options.level || LogLevel.INFO;
    this.includeTimestamp = options.includeTimestamp !== undefined ? options.includeTimestamp : true;
    this.includeStack = options.includeStack || false;
    this.formatter = options.formatter;
  }

  /**
   * 记录调试日志
   * 
   * @param message 日志消息
   * @param data 附加数据
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 记录信息日志
   * 
   * @param message 日志消息
   * @param data 附加数据
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 记录警告日志
   * 
   * @param message 日志消息
   * @param data 附加数据
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * 记录错误日志
   * 
   * @param message 日志消息
   * @param data 附加数据
   */
  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 设置日志级别
   * 
   * @param level 日志级别
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 获取当前日志级别
   * 
   * @returns 当前日志级别
   */
  public getLevel(): LogLevel {
    return this.level;
  }

  /**
   * 创建子日志记录器
   * 
   * @param subNamespace 子命名空间
   * @returns 子日志记录器
   */
  public createSubLogger(subNamespace: string): Logger {
    return new Logger(`${this.namespace}:${subNamespace}`, {
      level: this.level,
      includeTimestamp: this.includeTimestamp,
      includeStack: this.includeStack,
      formatter: this.formatter
    });
  }

  /**
   * 记录日志
   * 
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据
   */
  private log(level: LogLevel, message: string, data?: any): void {
    // 检查日志级别
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = this.includeTimestamp ? new Date().toISOString() : '';
    let stack: string | undefined;
    
    if (this.includeStack && level === LogLevel.ERROR) {
      const stackTrace = new Error().stack;
      stack = stackTrace ? stackTrace.split('\n').slice(2).join('\n') : undefined;
    }
    
    const logEntry: LogEntry = {
      level,
      message,
      namespace: this.namespace,
      timestamp,
      data,
      stack
    };
    
    // 使用自定义格式化函数或默认格式化
    if (this.formatter) {
      const formattedMessage = this.formatter(level, message, this.namespace, timestamp, data);
      console.log(formattedMessage);
    } else {
      const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.namespace}]:`;
      
      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
      
      if (stack && level === LogLevel.ERROR) {
        console.log(`${prefix} Stack trace:`, stack);
      }
    }
  }

  /**
   * 检查是否应该记录指定级别的日志
   * 
   * @param level 日志级别
   * @returns 是否应该记录
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.level);
    const targetLevelIndex = levels.indexOf(level);
    
    return targetLevelIndex >= currentLevelIndex;
  }
}