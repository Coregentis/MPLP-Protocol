/**
 * @fileoverview DevServer tests
 */

import { DevServer } from '../DevServer';
import { DevServerConfig } from '../types';

// Mock dependencies
jest.mock('../FileWatcher');
jest.mock('../BuildManager');
jest.mock('../HotReloadManager');
jest.mock('../LogManager');
jest.mock('../MetricsManager');
jest.mock('http');
jest.mock('fs-extra');

describe('DevServer测试', () => {
  let devServer: DevServer;
  let mockConfig: DevServerConfig;
  let mockContext: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock configuration
    mockConfig = {
      port: 3000,
      host: 'localhost',
      openBrowser: true,
      hotReload: true,
      enableLogs: true,
      enableDebug: true,
      enableMetrics: true,
      environment: 'development',
      verbose: false,
      quiet: false,
      projectRoot: '/test/project',
      srcDir: '/test/project/src',
      distDir: '/test/project/dist',
      publicDir: '/test/project/public',
      watchPatterns: ['src/**/*.ts', 'src/**/*.js'],
      ignorePatterns: ['node_modules/**', 'dist/**']
    };

    // Create mock context
    mockContext = {
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        success: jest.fn()
      }
    };

    devServer = new DevServer(mockConfig, mockContext);
  });

  describe('基本属性测试', () => {
    it('应该正确初始化配置', () => {
      expect(devServer.config).toEqual(mockConfig);
    });

    it('应该初始状态为未运行', () => {
      expect(devServer.isRunning).toBe(false);
    });

    it('应该有默认的指标', () => {
      const metrics = devServer.metrics;
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('requests');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('buildTime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('cpuUsage');
    });
  });

  describe('服务器生命周期测试', () => {
    it('应该能够启动服务器', async () => {
      // Mock successful startup
      const mockStart = jest.fn().mockResolvedValue(undefined);
      devServer['startManagers'] = mockStart;
      devServer['createServer'] = jest.fn().mockResolvedValue(undefined);
      devServer['startFileWatching'] = jest.fn().mockResolvedValue(undefined);
      devServer['performInitialBuild'] = jest.fn().mockResolvedValue(undefined);
      devServer['openBrowser'] = jest.fn().mockResolvedValue(undefined);

      await devServer.start();

      expect(devServer.isRunning).toBe(true);
      expect(mockStart).toHaveBeenCalled();
    });

    it('应该能够停止服务器', async () => {
      // First start the server
      devServer['_isRunning'] = true;
      
      // Mock successful shutdown
      const mockStop = jest.fn().mockResolvedValue(undefined);
      devServer['stopManagers'] = mockStop;
      devServer['fileWatcher'] = { stop: jest.fn().mockResolvedValue(undefined) } as any;
      devServer['buildManager'] = { stop: jest.fn().mockResolvedValue(undefined) } as any;
      devServer['server'] = { close: jest.fn((cb) => cb()) } as any;

      await devServer.stop();

      expect(devServer.isRunning).toBe(false);
      expect(mockStop).toHaveBeenCalled();
    });

    it('应该能够重启服务器', async () => {
      const stopSpy = jest.spyOn(devServer, 'stop').mockResolvedValue(undefined);
      const startSpy = jest.spyOn(devServer, 'start').mockResolvedValue(undefined);

      await devServer.restart();

      expect(stopSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
    });

    it('应该处理启动错误', async () => {
      const mockError = new Error('Port already in use');
      devServer['createServer'] = jest.fn().mockRejectedValue(mockError);

      await expect(devServer.start()).rejects.toThrow('Port already in use');
      expect(devServer.isRunning).toBe(false);
    });
  });

  describe('文件监视测试', () => {
    it('应该能够添加监视模式', () => {
      const mockFileWatcher = {
        addPattern: jest.fn()
      };
      devServer['fileWatcher'] = mockFileWatcher as any;

      devServer.addWatchPattern('src/**/*.json');

      expect(mockFileWatcher.addPattern).toHaveBeenCalledWith('src/**/*.json');
    });

    it('应该能够移除监视模式', () => {
      const mockFileWatcher = {
        removePattern: jest.fn()
      };
      devServer['fileWatcher'] = mockFileWatcher as any;

      devServer.removeWatchPattern('src/**/*.json');

      expect(mockFileWatcher.removePattern).toHaveBeenCalledWith('src/**/*.json');
    });
  });

  describe('构建管理测试', () => {
    it('应该能够执行构建', async () => {
      const mockBuildResult = {
        success: true,
        duration: 1000,
        errors: [],
        warnings: [],
        assets: []
      };

      const mockBuildManager = {
        build: jest.fn().mockResolvedValue(mockBuildResult)
      };
      devServer['buildManager'] = mockBuildManager as any;

      const result = await devServer.build();

      expect(result).toEqual(mockBuildResult);
      expect(mockBuildManager.build).toHaveBeenCalled();
    });

    it('应该处理构建错误', async () => {
      const mockError = new Error('Build failed');
      const mockBuildManager = {
        build: jest.fn().mockRejectedValue(mockError)
      };
      devServer['buildManager'] = mockBuildManager as any;

      await expect(devServer.build()).rejects.toThrow('Build failed');
    });

    it('应该在没有构建管理器时抛出错误', async () => {
      devServer['buildManager'] = undefined;

      await expect(devServer.build()).rejects.toThrow('Build manager not initialized');
    });
  });

  describe('客户端管理测试', () => {
    it('应该能够广播消息', () => {
      const mockMessage = {
        type: 'hot-reload' as const,
        data: {
          action: 'reload' as const,
          files: ['test.ts'],
          timestamp: Date.now()
        }
      };

      const mockHotReloadManager = {
        broadcast: jest.fn()
      };
      devServer['hotReloadManager'] = mockHotReloadManager as any;

      devServer.broadcast(mockMessage);

      expect(mockHotReloadManager.broadcast).toHaveBeenCalledWith(mockMessage);
    });

    it('应该返回连接的客户端数量', () => {
      const mockHotReloadManager = {
        connectedClients: 5
      };
      devServer['hotReloadManager'] = mockHotReloadManager as any;

      expect(devServer.getConnectedClients()).toBe(5);
    });

    it('应该在没有热重载管理器时返回0', () => {
      devServer['hotReloadManager'] = undefined;

      expect(devServer.getConnectedClients()).toBe(0);
    });
  });

  describe('事件处理测试', () => {
    it('应该处理文件变更事件', () => {
      const mockEvent = {
        type: 'change' as const,
        path: '/test/project/src/test.ts',
        timestamp: new Date()
      };

      const mockBuildManager = {
        build: jest.fn().mockResolvedValue({})
      };
      const mockHotReloadManager = {
        reload: jest.fn()
      };
      const mockLogManager = {
        log: jest.fn()
      };

      devServer['buildManager'] = mockBuildManager as any;
      devServer['hotReloadManager'] = mockHotReloadManager as any;
      devServer['logManager'] = mockLogManager as any;

      devServer['handleFileChange'](mockEvent);

      expect(mockLogManager.log).toHaveBeenCalledWith(
        'info',
        `File ${mockEvent.type}: ${mockEvent.path}`,
        'FileWatcher'
      );
      expect(mockHotReloadManager.reload).toHaveBeenCalledWith([mockEvent.path]);
    });

    it('应该处理构建完成事件', () => {
      const mockResult = {
        success: true,
        duration: 1000,
        errors: [],
        warnings: [],
        assets: []
      };

      const mockLogManager = {
        log: jest.fn()
      };
      const mockMetricsManager = {
        recordBuildTime: jest.fn()
      };

      devServer['logManager'] = mockLogManager as any;
      devServer['metricsManager'] = mockMetricsManager as any;
      devServer.broadcast = jest.fn();

      devServer['handleBuildComplete'](mockResult);

      expect(mockLogManager.log).toHaveBeenCalledWith(
        'info',
        `Build completed in ${mockResult.duration}ms`,
        'BuildManager'
      );
      expect(mockMetricsManager.recordBuildTime).toHaveBeenCalledWith(mockResult.duration);
      expect(devServer.broadcast).toHaveBeenCalledWith({
        type: 'build',
        data: mockResult
      });
    });

    it('应该处理构建错误事件', () => {
      const mockError = new Error('Build failed');

      const mockLogManager = {
        log: jest.fn()
      };
      const mockMetricsManager = {
        recordError: jest.fn()
      };

      devServer['logManager'] = mockLogManager as any;
      devServer['metricsManager'] = mockMetricsManager as any;
      devServer.broadcast = jest.fn();

      devServer['handleBuildError'](mockError);

      expect(mockLogManager.log).toHaveBeenCalledWith(
        'error',
        `Build error: ${mockError.message}`,
        'BuildManager'
      );
      expect(mockMetricsManager.recordError).toHaveBeenCalled();
      expect(devServer.broadcast).toHaveBeenCalledWith({
        type: 'error',
        data: {
          message: mockError.message,
          stack: mockError.stack,
          timestamp: expect.any(Number)
        }
      });
    });
  });

  describe('HTTP服务器测试', () => {
    it('应该生成开发仪表板HTML', () => {
      const html = devServer['generateDashboardHTML']();

      expect(html).toContain('MPLP Development Server');
      expect(html).toContain('Server Status: Running');
      expect(html).toContain(`Environment: ${mockConfig.environment}`);
      expect(html).toContain(`Port: ${mockConfig.port}`);
      expect(html).toContain(`Hot Reload: ${mockConfig.hotReload ? 'Enabled' : 'Disabled'}`);
    });

    it('应该获取正确的内容类型', () => {
      expect(devServer['getContentType']('.html')).toBe('text/html');
      expect(devServer['getContentType']('.js')).toBe('application/javascript');
      expect(devServer['getContentType']('.css')).toBe('text/css');
      expect(devServer['getContentType']('.json')).toBe('application/json');
      expect(devServer['getContentType']('.unknown')).toBe('text/plain');
    });
  });
});
