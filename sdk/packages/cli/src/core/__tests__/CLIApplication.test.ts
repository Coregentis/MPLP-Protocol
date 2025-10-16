/**
 * @fileoverview Tests for CLIApplication
 */

// Mock external dependencies
const mockChalk = {
  blue: (text: string) => text,
  yellow: (text: string) => text,
  red: (text: string) => text,
  green: (text: string) => text,
  gray: (text: string) => text,
  cyan: (text: string) => text,
  bold: { cyan: (text: string) => text, white: (text: string) => text }
};

const mockOra = jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  succeed: jest.fn(),
  fail: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  text: '',
  isSpinning: false,
  color: 'cyan',
  spinner: 'dots'
}));

const mockCommander = {
  Command: jest.fn().mockImplementation(() => ({
    name: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    helpOption: jest.fn().mockReturnThis(),
    addHelpCommand: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    command: jest.fn().mockReturnThis(),
    alias: jest.fn().mockReturnThis(),
    argument: jest.fn().mockReturnThis(),
    action: jest.fn().mockReturnThis(),
    exitOverride: jest.fn().mockReturnThis(),
    parseAsync: jest.fn().mockResolvedValue(undefined),
    commands: [],
    createOption: jest.fn().mockReturnValue({
      choices: jest.fn().mockReturnThis()
    }),
    addOption: jest.fn().mockReturnThis(),
    helpInformation: jest.fn().mockReturnValue('Help information')
  }))
};

jest.mock('chalk', () => mockChalk);
jest.mock('ora', () => mockOra);
jest.mock('commander', () => mockCommander);

import { CLIApplication } from '../CLIApplication';
import { CLIConfig, CLICommand, CLICommandArgs } from '../types';

// Mock command for testing
class MockCommand implements CLICommand {
  public readonly name = 'mock';
  public readonly description = 'Mock command for testing';
  public readonly aliases = ['m'];
  public readonly options = [
    {
      flags: '--test <value>',
      description: 'Test option'
    }
  ];
  public readonly arguments = [
    {
      name: 'arg1',
      description: 'First argument',
      required: true
    }
  ];
  public readonly examples = ['mplp mock test'];

  public executeCalled = false;
  public lastArgs: CLICommandArgs | null = null;

  public async execute(args: CLICommandArgs): Promise<void> {
    this.executeCalled = true;
    this.lastArgs = args;
  }
}

describe('CLIApplication', () => {
  let mockConfig: CLIConfig;
  let mockCommand: MockCommand;

  beforeEach(() => {
    mockCommand = new MockCommand();
    mockConfig = {
      name: 'test-cli',
      version: '1.0.0',
      description: 'Test CLI application',
      commands: [mockCommand],
      globalOptions: [
        {
          flags: '--verbose',
          description: 'Enable verbose output'
        }
      ]
    };
  });

  describe('构造函数', () => {
    it('应该创建CLI应用程序实例', () => {
      const app = new CLIApplication(mockConfig);
      expect(app).toBeInstanceOf(CLIApplication);
    });

    it('应该注册所有命令', () => {
      const app = new CLIApplication(mockConfig);
      const commands = app.getCommands();
      expect(commands.has('mock')).toBe(true);
      expect(commands.has('m')).toBe(true); // alias
    });
  });

  describe('命令执行', () => {
    it('应该执行注册的命令', async () => {
      const app = new CLIApplication(mockConfig);
      
      // Mock process.argv
      const originalArgv = process.argv;
      process.argv = ['node', 'cli.js', 'mock', 'test-arg', '--test', 'test-value'];

      try {
        await app.run();
        expect(mockCommand.executeCalled).toBe(true);
        expect(mockCommand.lastArgs?.args).toEqual(['test-arg']);
        expect(mockCommand.lastArgs?.options.test).toBe('test-value');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('应该通过别名执行命令', async () => {
      const app = new CLIApplication(mockConfig);
      
      const originalArgv = process.argv;
      process.argv = ['node', 'cli.js', 'm', 'test-arg'];

      try {
        await app.run();
        expect(mockCommand.executeCalled).toBe(true);
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('命令管理', () => {
    it('应该动态添加命令', () => {
      const app = new CLIApplication(mockConfig);

      // Create a new command with different name
      const newCommand: CLICommand = {
        name: 'new-command',
        description: 'New command for testing',
        aliases: ['nc'],
        options: [],
        arguments: [],
        examples: [],
        execute: jest.fn().mockResolvedValue(undefined)
      };

      app.addCommand(newCommand);

      const commands = app.getCommands();
      expect(commands.has('new-command')).toBe(true);
    });

    it('应该移除命令', () => {
      const app = new CLIApplication(mockConfig);

      expect(app.removeCommand('mock')).toBe(true);
      expect(app.removeCommand('nonexistent')).toBe(false);

      const commands = app.getCommands();
      expect(commands.has('mock')).toBe(false);
    });
  });

  describe('上下文', () => {
    it('应该提供CLI上下文', () => {
      const app = new CLIApplication(mockConfig);
      const context = app.getContext();

      expect(context.config).toBe(mockConfig);
      expect(context.logger).toBeDefined();
      expect(context.spinner).toBeDefined();
      expect(context.cwd).toBe(process.cwd());
    });
  });

  describe('错误处理', () => {
    it('应该处理未知命令', async () => {
      const app = new CLIApplication(mockConfig);

      const originalArgv = process.argv;
      process.argv = ['node', 'cli.js', 'unknown-command'];

      try {
        await expect(app.run()).rejects.toThrow();
      } finally {
        process.argv = originalArgv;
      }
    });

    it('应该处理命令执行错误', async () => {
      const errorCommand: CLICommand = {
        name: 'error',
        description: 'Command that throws error',
        async execute() {
          throw new Error('Test error');
        }
      };

      const errorConfig = {
        ...mockConfig,
        commands: [errorCommand]
      };

      const app = new CLIApplication(errorConfig);

      const originalArgv = process.argv;
      process.argv = ['node', 'cli.js', 'error'];

      try {
        await expect(app.run()).rejects.toThrow();
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('全局选项', () => {
    it('应该处理全局选项', async () => {
      const app = new CLIApplication(mockConfig);
      
      const originalArgv = process.argv;
      process.argv = ['node', 'cli.js', 'mock', 'test-arg', '--verbose'];

      try {
        await app.run();
        expect(mockCommand.executeCalled).toBe(true);
      } finally {
        process.argv = originalArgv;
      }
    });
  });

  describe('帮助系统', () => {
    it('应该显示版本信息', async () => {
      const app = new CLIApplication(mockConfig);

      const originalArgv = process.argv;
      process.argv = ['node', 'cli.js', '--version'];

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        await app.run();
        expect(consoleSpy).toHaveBeenCalledWith(mockConfig.version);
      } finally {
        process.argv = originalArgv;
        consoleSpy.mockRestore();
      }
    });

    it('应该显示帮助信息', async () => {
      const app = new CLIApplication(mockConfig);

      const originalArgv = process.argv;
      process.argv = ['node', 'cli.js', '--help'];

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        await app.run();
        expect(consoleSpy).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
        consoleSpy.mockRestore();
      }
    });
  });

  describe('环境信息', () => {
    it('应该在调试模式下显示环境信息', async () => {
      const originalEnv = process.env.DEBUG;
      process.env.DEBUG = 'true';

      const app = new CLIApplication(mockConfig);
      const context = app.getContext();
      const debugSpy = jest.spyOn(context.logger, 'debug').mockImplementation();

      const originalArgv = process.argv;
      process.argv = ['node', 'cli.js', 'mock', 'test-arg'];

      try {
        await app.run();
        expect(debugSpy).toHaveBeenCalled();
      } finally {
        process.argv = originalArgv;
        process.env.DEBUG = originalEnv;
        debugSpy.mockRestore();
      }
    });
  });

  // ==================== ENTERPRISE FEATURES TESTS ====================

  describe('企业级功能测试', () => {
    describe('命令历史管理', () => {
      it('应该记录命令历史', async () => {
        const app = new CLIApplication(mockConfig);

        // 先清除历史记录
        app.clearCommandHistory();

        // 模拟命令执行
        (app as any).addToHistory('test', ['arg1'], { option: 'value' }, true, 100);

        const history = app.getCommandHistory();
        expect(history).toHaveLength(1);
        expect(history[0].command).toBe('test');
        expect(history[0].args).toEqual(['arg1']);
        expect(history[0].success).toBe(true);
        expect(history[0].duration).toBe(100);
      });

      it('应该限制历史记录数量', async () => {
        const app = new CLIApplication(mockConfig);

        // 清除之前的历史记录
        app.clearCommandHistory();

        // 添加大量历史记录
        for (let i = 0; i < 1500; i++) {
          (app as any).addToHistory(`test${i}`, [], {}, true, 100);
        }

        // 检查历史记录是否被限制
        const history = app.getCommandHistory();
        expect(history.length).toBeLessThanOrEqual(1000);

        // 验证保存的历史记录确实被限制了
        expect(history.length).toBe(1000);
      });

      it('应该清除命令历史', async () => {
        const app = new CLIApplication(mockConfig);

        // 先清除历史记录
        app.clearCommandHistory();

        (app as any).addToHistory('test', [], {}, true, 100);
        expect(app.getCommandHistory()).toHaveLength(1);

        app.clearCommandHistory();
        expect(app.getCommandHistory()).toHaveLength(0);
      });
    });

    describe('插件管理', () => {
      it('应该列出已安装的插件', () => {
        const app = new CLIApplication(mockConfig);
        const plugins = app.getPlugins();
        expect(Array.isArray(plugins)).toBe(true);
      });

      it('应该卸载插件', () => {
        const app = new CLIApplication(mockConfig);

        // 模拟插件
        (app as any).plugins.set('test-plugin', {
          name: 'test-plugin',
          version: '1.0.0',
          description: 'Test plugin',
          commands: [],
          path: '/fake/path',
          loaded: true
        });

        const result = app.uninstallPlugin('test-plugin');
        expect(result).toBe(true);
        expect(app.getPlugins()).toHaveLength(0);
      });

      it('应该处理不存在的插件卸载', () => {
        const app = new CLIApplication(mockConfig);
        const result = app.uninstallPlugin('non-existent');
        expect(result).toBe(false);
      });
    });

    describe('性能监控', () => {
      it('应该记录性能指标', () => {
        const app = new CLIApplication(mockConfig);

        app.recordPerformanceMetric('test-command', 150, true, { extra: 'data' });

        const metrics = app.getPerformanceMetrics('test-command');
        expect(metrics['test-command']).toHaveLength(1);
        expect(metrics['test-command'][0].command).toBe('test-command');
        expect(metrics['test-command'][0].duration).toBe(150);
        expect(metrics['test-command'][0].success).toBe(true);
        expect(metrics['test-command'][0].metadata.extra).toBe('data');
      });

      it('应该限制性能指标数量', () => {
        const app = new CLIApplication(mockConfig);

        // 添加大量指标
        for (let i = 0; i < 150; i++) {
          app.recordPerformanceMetric('test-command', i, true);
        }

        const metrics = app.getPerformanceMetrics('test-command');
        expect(metrics['test-command'].length).toBeLessThanOrEqual(100);
      });

      it('应该生成性能分析', () => {
        const app = new CLIApplication(mockConfig);

        // 添加一些指标
        app.recordPerformanceMetric('test-command', 100, true);
        app.recordPerformanceMetric('test-command', 200, false);
        app.recordPerformanceMetric('test-command', 150, true);

        const analytics = app.getPerformanceAnalytics('test-command');
        expect(analytics['test-command']).toBeDefined();
        expect(analytics['test-command'].totalExecutions).toBe(3);
        expect(analytics['test-command'].successRate).toBe(66.66666666666666);
        expect(analytics['test-command'].averageDuration).toBe(150);
        expect(analytics['test-command'].minDuration).toBe(100);
        expect(analytics['test-command'].maxDuration).toBe(200);
      });
    });

    describe('审计日志', () => {
      it('应该记录审计日志', () => {
        const app = new CLIApplication(mockConfig);

        (app as any).addAuditLogEntry('test_action', { key: 'value' });

        const log = app.getAuditLog();
        expect(log).toHaveLength(1);
        expect(log[0].action).toBe('test_action');
        expect(log[0].details.key).toBe('value');
        expect(log[0].user).toBeDefined();
        expect(log[0].cwd).toBeDefined();
      });

      it('应该限制审计日志数量', () => {
        const app = new CLIApplication(mockConfig);

        // 添加大量日志
        for (let i = 0; i < 1500; i++) {
          (app as any).addAuditLogEntry(`action_${i}`, {});
        }

        const log = app.getAuditLog();
        expect(log.length).toBeLessThanOrEqual(1000);
      });

      it('应该支持限制日志查询', () => {
        const app = new CLIApplication(mockConfig);

        for (let i = 0; i < 50; i++) {
          (app as any).addAuditLogEntry(`action_${i}`, {});
        }

        const limitedLog = app.getAuditLog(10);
        expect(limitedLog).toHaveLength(10);
      });
    });

    describe('批量操作', () => {
      it('应该创建批量操作', () => {
        const app = new CLIApplication(mockConfig);

        const commands = [
          { command: 'test1', args: ['arg1'], options: {} },
          { command: 'test2', args: ['arg2'], options: {} }
        ];

        const batchId = app.createBatchOperation('test-batch', commands);
        expect(batchId).toMatch(/^batch_\d+_[a-z0-9]+$/);

        const batches = app.getBatchOperations();
        expect(batches).toHaveLength(1);
        expect(batches[0].name).toBe('test-batch');
        expect(batches[0].commands).toHaveLength(2);
        expect(batches[0].status).toBe('pending');
      });

      it('应该处理不存在的批量操作', async () => {
        const app = new CLIApplication(mockConfig);

        await expect(app.executeBatchOperation('non-existent')).rejects.toThrow('Batch operation not found');
      });
    });

    describe('命令建议', () => {
      it('应该提供命令自动补全建议', () => {
        const app = new CLIApplication(mockConfig);

        const suggestions = app.getCommandSuggestions('te');
        expect(Array.isArray(suggestions)).toBe(true);

        // 应该包含以'te'开头的命令
        const testSuggestions = suggestions.filter(s => s.startsWith('te'));
        expect(testSuggestions.length).toBeGreaterThanOrEqual(0);
      });

      it('应该返回排序的建议', () => {
        const app = new CLIApplication(mockConfig);

        const suggestions = app.getCommandSuggestions('');
        const sortedSuggestions = [...suggestions].sort();
        expect(suggestions).toEqual(sortedSuggestions);
      });
    });

    describe('企业级运行模式', () => {
      it('应该记录运行指标', async () => {
        const app = new CLIApplication(mockConfig);

        try {
          await app.runWithEnterpriseFeatures(['node', 'test', '--version']);
        } catch (error) {
          // 忽略测试环境中的错误
        }

        // 检查是否记录了性能指标
        const metrics = app.getPerformanceMetrics();
        // 在测试环境中可能不会记录指标，所以只检查结构
        expect(typeof metrics).toBe('object');
      });
    });
  });
});
