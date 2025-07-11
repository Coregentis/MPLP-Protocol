/**
 * MPLP High-Performance Logger v1.0
 * 专为MPLP协议设计的高性能日志系统
 */

import { Timestamp } from '../types/index';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: Timestamp;
  level: LogLevel;
  component: string;
  message: string;
  data?: Record<string, unknown>;
  traceId?: string;
  correlationId?: string;
}

export class Logger {
  private component: string;
  private minLevel: LogLevel;
  private enabledConsole: boolean;

  constructor(component: string, minLevel: LogLevel = LogLevel.INFO) {
    this.component = component;
    this.minLevel = minLevel;
    this.enabledConsole = process.env.NODE_ENV !== 'production';
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, data);
  }

  critical(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.CRITICAL, message, data);
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString() as Timestamp,
      level,
      component: this.component,
      message,
      data
    };

    if (this.enabledConsole) {
      this.logToConsole(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const levelColors = ['\x1b[36m', '\x1b[32m', '\x1b[33m', '\x1b[31m', '\x1b[35m'];
    const resetColor = '\x1b[0m';

    const color = levelColors[entry.level];
    const levelName = levelNames[entry.level];
    const timestamp = entry.timestamp.substring(11, 23); // HH:mm:ss.SSS

    const message = `${color}[${timestamp}] ${levelName} [${entry.component}] ${entry.message}${resetColor}`;
    
    console.log(message);
    if (entry.data) {
      console.log('  Data:', entry.data);
    }
  }
}

// 默认logger实例供全局使用
export const logger = new Logger('MPLP');