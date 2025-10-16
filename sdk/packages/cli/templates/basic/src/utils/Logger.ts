/**
 * Simple logging utility
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Simple logger class
 */
export class Logger {
  private level: LogLevel;
  private enableConsole: boolean;

  constructor(level: LogLevel = 'info', enableConsole: boolean = true) {
    this.level = level;
    this.enableConsole = enableConsole;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Enable or disable console output
   */
  setConsole(enable: boolean): void {
    this.enableConsole = enable;
  }

  /**
   * Debug log
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', message, ...args);
    }
  }

  /**
   * Info log
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      this.log('INFO', message, ...args);
    }
  }

  /**
   * Warning log
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      this.log('WARN', message, ...args);
    }
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, ...args: any[]): void {
    if (this.shouldLog('error')) {
      if (error) {
        this.log('ERROR', message, error.message, error.stack, ...args);
      } else {
        this.log('ERROR', message, ...args);
      }
    }
  }

  /**
   * Check if should log at given level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Internal log method
   */
  private log(level: string, message: string, ...args: any[]): void {
    if (!this.enableConsole) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    switch (level) {
      case 'DEBUG':
        console.debug(logMessage, ...args);
        break;
      case 'INFO':
        console.info(logMessage, ...args);
        break;
      case 'WARN':
        console.warn(logMessage, ...args);
        break;
      case 'ERROR':
        console.error(logMessage, ...args);
        break;
      default:
        console.log(logMessage, ...args);
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();
