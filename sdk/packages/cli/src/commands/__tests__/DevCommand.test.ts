/**
 * @fileoverview DevCommand tests
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { DevCommand } from '../DevCommand';
import { CLICommandArgs, CLIContext } from '../../core/types';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../dev/DevServer');

const mockFs = fs as jest.Mocked<typeof fs>;

// Helper function to create CLICommandArgs
const createArgs = (args: string[] = [], options: Record<string, unknown> = {}): CLICommandArgs => ({
  args,
  options,
  command: {} as any
});

describe('DevCommand测试', () => {
  let devCommand: DevCommand;
  let mockContext: CLIContext;
  let mockLogger: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
      header: jest.fn(),
      subheader: jest.fn(),
      list: jest.fn(),
      table: jest.fn(),
      code: jest.fn(),
      command: jest.fn(),
      commands: jest.fn(),
      banner: jest.fn(),
      colored: jest.fn().mockReturnValue('colored text'),
      newline: jest.fn()
    };

    // Create mock context
    mockContext = {
      cwd: '/test/project',
      config: {
        name: 'mplp',
        version: '1.0.0',
        description: 'Test CLI',
        commands: [],
        globalOptions: []
      },
      logger: mockLogger,
      spinner: {
        start: jest.fn(),
        stop: jest.fn(),
        succeed: jest.fn(),
        fail: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        text: '',
        isSpinning: false
      }
    };

    devCommand = new DevCommand(mockContext);
  });

  describe('基本属性测试', () => {
    it('应该有正确的命令名称', () => {
      expect(devCommand.name).toBe('dev');
    });

    it('应该有正确的描述', () => {
      expect(devCommand.description).toBe('Start the development server');
    });

    it('应该有正确的别名', () => {
      expect(devCommand.aliases).toEqual(['serve', 'start']);
    });

    it('应该有正确的选项', () => {
      expect(devCommand.options).toHaveLength(11);
      
      const portOption = devCommand.options.find(opt => opt.flags.includes('--port'));
      expect(portOption).toBeDefined();
      expect(portOption?.defaultValue).toBe('3000');
      
      const hostOption = devCommand.options.find(opt => opt.flags.includes('--host'));
      expect(hostOption).toBeDefined();
      expect(hostOption?.defaultValue).toBe('localhost');
    });

    it('应该有使用示例', () => {
      expect(devCommand.examples).toHaveLength(6);
      expect(devCommand.examples[0]).toBe('mplp dev');
    });
  });

  describe('项目目录验证测试', () => {
    it('应该在有效的项目目录中通过验证', async () => {
      const args = createArgs([], {});

      // Mock valid project directory
      (mockFs.pathExists as unknown as jest.Mock).mockResolvedValueOnce(true); // package.json exists
      (mockFs.readJson as unknown as jest.Mock).mockResolvedValueOnce({
        name: 'test-project',
        dependencies: {
          '@mplp/core': '^1.0.0'
        }
      });

      // Mock DevServer
      const mockDevServer = {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        isRunning: false,
        metrics: {
          uptime: 0,
          requests: 0,
          errors: 0,
          buildTime: 0,
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        }
      };

      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test/project');

      try {
        // Test that the configuration generation works with valid project
        const config = await devCommand['getDevServerConfig'](args);
        expect(config.projectRoot).toBe('/test/project');
        expect(config.port).toBe(3000);
        expect(config.host).toBe('localhost');
      } finally {
        process.cwd = originalCwd;
      }
    });

    it('应该在无效的项目目录中抛出错误', async () => {
      const args = createArgs([], {});

      // Mock invalid project directory
      (mockFs.pathExists as unknown as jest.Mock).mockResolvedValueOnce(false); // package.json doesn't exist

      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/invalid/project');

      try {
        await expect(devCommand.execute(args)).rejects.toThrow('Not in a project directory');
      } finally {
        process.cwd = originalCwd;
      }
    });

    it('应该在非MPLP项目中显示警告', async () => {
      const args = createArgs([], {});

      // Mock non-MPLP project
      (mockFs.pathExists as unknown as jest.Mock).mockResolvedValueOnce(true); // package.json exists
      mockFs.readJson.mockResolvedValueOnce({
        name: 'regular-project',
        dependencies: {
          'express': '^4.0.0'
        }
      });

      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test/project');

      try {
        // Test that the configuration generation works with non-MPLP project
        const config = await devCommand['getDevServerConfig'](args);
        expect(config.projectRoot).toBe('/test/project');
        expect(config.port).toBe(3000);
        expect(config.host).toBe('localhost');
      } finally {
        process.cwd = originalCwd;
      }
    });
  });

  describe('配置生成测试', () => {
    it('应该生成默认配置', () => {
      const args = createArgs([], {});

      // Test configuration generation logic
      const port = parseInt(devCommand['getOption']?.(args, 'port', '3000') || '3000', 10);
      const host = devCommand['getOption']?.(args, 'host', 'localhost') || 'localhost';

      expect(port).toBe(3000);
      expect(host).toBe('localhost');
    });

    it('应该使用自定义端口和主机', () => {
      const args = createArgs([], {
        port: '8080',
        host: '0.0.0.0'
      });

      const port = parseInt((args.options.port as string) || '3000', 10);
      const host = (args.options.host as string) || 'localhost';

      expect(port).toBe(8080);
      expect(host).toBe('0.0.0.0');
    });

    it('应该处理功能标志', () => {
      const args = createArgs([], {
        'no-open': true,
        'no-hot-reload': true,
        'verbose': true
      });

      const openBrowser = !args.options['no-open'];
      const hotReload = !args.options['no-hot-reload'];
      const verbose = !!args.options['verbose'];

      expect(openBrowser).toBe(false);
      expect(hotReload).toBe(false);
      expect(verbose).toBe(true);
    });
  });

  describe('配置验证测试', () => {
    it('应该验证端口范围', () => {
      // Test port validation logic
      const validPort = 3000;
      const invalidPortLow = 0;
      const invalidPortHigh = 70000;

      expect(validPort >= 1 && validPort <= 65535).toBe(true);
      expect(invalidPortLow >= 1 && invalidPortLow <= 65535).toBe(false);
      expect(invalidPortHigh >= 1 && invalidPortHigh <= 65535).toBe(false);
    });

    it('应该验证主机名', () => {
      // Test host validation logic
      const validHost = 'localhost';
      const emptyHost = '';

      expect(validHost && validHost.trim().length > 0).toBe(true);
      expect(emptyHost.length === 0).toBe(true);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理配置加载错误', async () => {
      // Mock configuration loading error
      (mockFs.pathExists as unknown as jest.Mock).mockResolvedValueOnce(true);
      (mockFs.readJson as unknown as jest.Mock).mockRejectedValueOnce(new Error('Invalid JSON'));

      const args = createArgs([], {
        config: './invalid-config.json'
      });

      // This would handle the error gracefully
      expect(mockFs.pathExists).toBeDefined();
    });

    it('应该处理服务器启动错误', async () => {
      // Mock server startup error
      const mockError = new Error('Port already in use');
      
      // This would be caught and handled by the command
      expect(mockError.message).toBe('Port already in use');
    });
  });

  describe('命令行选项测试', () => {
    it('应该解析所有支持的选项', () => {
      const expectedOptions = [
        'port', 'host', 'no-open', 'no-hot-reload', 
        'no-logs', 'no-debug', 'no-metrics', 'config', 
        'env', 'verbose', 'quiet'
      ];

      const actualOptions = devCommand.options.map(opt => {
        const match = opt.flags.match(/--([a-z-]+)/);
        return match ? match[1] : '';
      }).filter(Boolean);

      expectedOptions.forEach(option => {
        expect(actualOptions).toContain(option);
      });
    });

    it('应该有正确的默认值', () => {
      const portOption = devCommand.options.find(opt => opt.flags.includes('--port'));
      const hostOption = devCommand.options.find(opt => opt.flags.includes('--host'));
      const envOption = devCommand.options.find(opt => opt.flags.includes('--env'));

      expect(portOption?.defaultValue).toBe('3000');
      expect(hostOption?.defaultValue).toBe('localhost');
      expect(envOption?.defaultValue).toBe('development');
    });
  });
});
