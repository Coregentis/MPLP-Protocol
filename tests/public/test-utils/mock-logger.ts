/**
 * Mock Logger for Testing
 * 
 * 提供测试用的模拟日志记录器
 * 
 * @version 1.0.0
 * @created 2025-08-02
 */

export class MockLogger {
  private logs: Array<{ level: string; message: string; data?: any }> = [];
  private errorCount = 0;

  info(message: string, data?: any): void {
    this.logs.push({ level: 'info', message, data });
  }

  error(message: string, data?: any): void {
    this.logs.push({ level: 'error', message, data });
    this.errorCount++;
  }

  warn(message: string, data?: any): void {
    this.logs.push({ level: 'warn', message, data });
  }

  debug(message: string, data?: any): void {
    this.logs.push({ level: 'debug', message, data });
  }

  // 测试辅助方法
  getLogCount(): number {
    return this.logs.length;
  }

  getErrorCount(): number {
    return this.errorCount;
  }

  getLogs(): Array<{ level: string; message: string; data?: any }> {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
    this.errorCount = 0;
  }
}
