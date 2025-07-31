/**
 * MPLP Core Logger - 厂商中立日志系统
 * 
 * 提供统一的日志记录功能
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private context: string;

  constructor(context: string = 'MPLP') {
    this.context = context;
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      metadata
    };

    // 简单的控制台输出
    const logMessage = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}] ${entry.message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, metadata || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, metadata || '');
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, metadata || '');
        break;
      default:
        console.log(logMessage, metadata || '');
    }
  }
}
