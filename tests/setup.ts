/**
 * Jest测试设置文件
 * 
 * @description 配置Jest测试环境和全局设置
 * @version 1.0.0
 */

// 设置测试超时时间
jest.setTimeout(30000);

// 全局测试配置
beforeAll(() => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // 减少测试期间的日志输出
});

// 每个测试后清理
afterEach(() => {
  // 清理模拟函数
  jest.clearAllMocks();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 抑制控制台警告（仅在测试环境中）
const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  // 过滤掉特定的警告信息
  const message = args.join(' ');
  if (message.includes('deprecated') || message.includes('experimental')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
