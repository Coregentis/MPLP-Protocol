/**
 * Role模块统一日志服务
 * 
 * @description 替换console.log的企业级日志系统，支持结构化日志记录和不同级别输出
 * @version 1.0.0
 * @layer 基础设施层 - 服务
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
 * 日志条目接口
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  metadata?: Record<string, unknown>;
  traceId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableStructured: boolean;
  module: string;
  environment: 'development' | 'production' | 'test';
}

/**
 * Role模块统一日志服务
 * 
 * @description 企业级日志系统，支持结构化日志、不同级别和多种输出格式
 */
export class RoleLoggerService {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableStructured: true,
      module: 'Role',
      environment: 'development',
      ...config
    };
  }

  /**
   * 记录调试信息
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * 记录一般信息
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * 记录警告信息
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * 记录错误信息
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const errorMetadata = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : {};

    this.log(LogLevel.ERROR, message, { ...metadata, ...errorMetadata });
  }

  /**
   * 核心日志记录方法
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    // 检查日志级别
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.config.module,
      message,
      metadata,
      traceId: this.generateTraceId()
    };

    // 添加到缓冲区
    this.addToBuffer(logEntry);

    // 输出日志
    if (this.config.enableConsole) {
      this.outputToConsole(logEntry);
    }

    // 未来可以扩展文件输出、远程日志等
  }

  /**
   * 检查是否应该记录此级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.module}] ${entry.timestamp}`;
    
    if (this.config.enableStructured) {
      // 结构化输出
      const structuredLog = {
        timestamp: entry.timestamp,
        level: entry.level,
        module: entry.module,
        message: entry.message,
        ...(entry.metadata && { metadata: entry.metadata }),
        ...(entry.traceId && { traceId: entry.traceId })
      };

      switch (entry.level) {
        case LogLevel.DEBUG:
          // eslint-disable-next-line no-console
          console.debug(`${prefix} [DEBUG]`, structuredLog);
          break;
        case LogLevel.INFO:
          // eslint-disable-next-line no-console
          console.info(`${prefix} [INFO]`, structuredLog);
          break;
        case LogLevel.WARN:
          // eslint-disable-next-line no-console
          console.warn(`${prefix} [WARN]`, structuredLog);
          break;
        case LogLevel.ERROR:
          // eslint-disable-next-line no-console
          console.error(`${prefix} [ERROR]`, structuredLog);
          break;
      }
    } else {
      // 简单文本输出
      const metadataStr = entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : '';
      const logMessage = `${prefix} [${entry.level.toUpperCase()}] ${entry.message}${metadataStr}`;

      switch (entry.level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          // eslint-disable-next-line no-console
          console.log(logMessage);
          break;
        case LogLevel.WARN:
          // eslint-disable-next-line no-console
          console.warn(logMessage);
          break;
        case LogLevel.ERROR:
          // eslint-disable-next-line no-console
          console.error(logMessage);
          break;
      }
    }
  }

  /**
   * 添加到日志缓冲区
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // 保持缓冲区大小
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  /**
   * 生成追踪ID
   */
  private generateTraceId(): string {
    return `role-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 获取日志缓冲区
   */
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * 清空日志缓冲区
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * 更新日志配置
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

/**
 * 创建Role模块日志实例的工厂函数
 */
export function createRoleLogger(config?: Partial<LoggerConfig>): RoleLoggerService {
  return new RoleLoggerService(config);
}

/**
 * 默认Role模块日志实例
 */
export const roleLogger = createRoleLogger({
  module: 'Role',
  level: LogLevel.INFO,
  enableStructured: true,
  environment: 'development'
});
