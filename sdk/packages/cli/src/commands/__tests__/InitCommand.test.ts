/**
 * @fileoverview Tests for InitCommand
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { InitCommand } from '../InitCommand';
import { CLIContext, CLICommandArgs } from '../../core/types';
import { Logger } from '../../core/Logger';
import { Spinner } from '../../core/Spinner';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('inquirer');
jest.mock('../../utils/GitOperations');
jest.mock('../../utils/PackageManagerDetector');
jest.mock('../../templates/ProjectTemplateManager');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('InitCommand', () => {
  let command: InitCommand;
  let context: CLIContext;
  let mockArgs: CLICommandArgs;

  // Helper function to create CLICommandArgs
  const createArgs = (args: string[] = [], options: Record<string, unknown> = {}): CLICommandArgs => ({
    args,
    options,
    command: {} as any
  });

  beforeEach(() => {
    context = {
      cwd: '/test/cwd',
      config: {
        name: 'mplp',
        version: '1.0.0',
        description: 'Test CLI',
        commands: []
      },
      logger: new Logger(),
      spinner: new Spinner()
    };

    command = new InitCommand(context);

    // Mock the private dependencies
    (command as any).templateManager = {
      hasTemplate: jest.fn().mockReturnValue(true),
      getAvailableTemplates: jest.fn().mockReturnValue(['basic', 'advanced', 'enterprise']),
      createProject: jest.fn().mockResolvedValue(undefined)
    };

    (command as any).packageManager = {
      detect: jest.fn().mockResolvedValue({
        name: 'npm',
        install: jest.fn().mockResolvedValue(undefined),
        run: jest.fn().mockResolvedValue(undefined),
        init: jest.fn().mockResolvedValue(undefined)
      })
    };

    (command as any).gitOps = {
      init: jest.fn().mockResolvedValue(undefined),
      add: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      isRepository: jest.fn().mockReturnValue(false),
      getConfig: jest.fn().mockResolvedValue('Test User')
    };

    mockArgs = {
      args: [],
      options: {},
      command: {} as any
    };

    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockFs.existsSync.mockReturnValue(false);
    (mockFs.pathExists as jest.Mock).mockResolvedValue(false);
    (mockFs.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (mockFs.writeFile as unknown as jest.Mock).mockResolvedValue(undefined);
    (mockFs.writeJson as jest.Mock).mockResolvedValue(undefined);
    (mockFs.readJson as jest.Mock).mockResolvedValue({});
    (mockFs.readdirSync as jest.Mock).mockReturnValue([]);
  });

  describe('基本功能', () => {
    it('应该有正确的命令属性', () => {
      expect(command.name).toBe('init');
      expect(command.description).toBe('Create a new MPLP project');
      expect(command.aliases).toEqual(['create', 'new']);
      expect(command.examples).toBeDefined();
      expect(command.options).toBeDefined();
    });
  });

  describe('项目创建', () => {
    it('应该使用提供的项目名称创建项目', async () => {
      const args = {
        args: ['my-project'],
        options: { template: 'basic' },
        command: {} as any
      };

      const spinnerSpy = jest.spyOn(context.spinner, 'start').mockImplementation();
      const succeedSpy = jest.spyOn(context.spinner, 'succeed').mockImplementation();

      await command.execute(args);

      expect(spinnerSpy).toHaveBeenCalled();
      expect(succeedSpy).toHaveBeenCalled();
      expect((command as any).templateManager.createProject).toHaveBeenCalled();
    });

    it('应该使用指定的模板', async () => {
      const args = createArgs(['my-project'], { template: 'advanced' });

      await command.execute(args);

      expect((command as any).templateManager.createProject).toHaveBeenCalled();
    });

    it('应该处理自定义目录', async () => {
      const args = createArgs(['my-project'], {
        template: 'basic',
        directory: 'custom-dir'
      });

      await command.execute(args);

      expect((command as any).templateManager.createProject).toHaveBeenCalled();
    });
  });

  describe('模板验证', () => {
    it('应该拒绝无效的模板', async () => {
      // Mock hasTemplate to return false for invalid template
      (command as any).templateManager.hasTemplate.mockReturnValue(false);

      const args = createArgs(['my-project'], { template: 'invalid-template' });

      await expect(command.execute(args)).rejects.toThrow();
    });

    it('应该接受有效的模板', async () => {
      const validTemplates = ['basic', 'advanced', 'enterprise'];

      for (const template of validTemplates) {
        const args = createArgs(['test-project'], { template });

        await expect(command.execute(args)).resolves.not.toThrow();
      }
    });
  });

  describe('项目名称验证', () => {
    it('应该拒绝空的项目名称', async () => {
      const args = createArgs([''], { template: 'basic' });

      await expect(command.execute(args)).rejects.toThrow();
    });

    it('应该拒绝无效字符的项目名称', async () => {
      const invalidNames = ['my project', 'my@project', 'my/project'];

      for (const name of invalidNames) {
        const args = createArgs([name], { template: 'basic' });

        await expect(command.execute(args)).rejects.toThrow();
      }
    });

    it('应该接受有效的项目名称', async () => {
      const validNames = ['my-project', 'my_project', 'myProject123'];

      for (const name of validNames) {
        const args = createArgs([name], { template: 'basic' });

        await expect(command.execute(args)).resolves.not.toThrow();
      }
    });
  });

  describe('目录检查', () => {
    it('应该拒绝已存在且非空的目录', async () => {
      const args = createArgs(['my-project'], { template: 'basic' });

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.readdirSync as jest.Mock).mockReturnValue(['file1.txt', 'file2.txt']);

      await expect(command.execute(args)).rejects.toThrow();
    });

    it('应该接受已存在但为空的目录', async () => {
      const args = createArgs(['my-project'], { template: 'basic' });

      mockFs.existsSync.mockReturnValue(true);
      (mockFs.readdirSync as jest.Mock).mockReturnValue([]);

      await expect(command.execute(args)).resolves.not.toThrow();
    });
  });

  describe('选项处理', () => {
    it('应该处理所有支持的选项', async () => {
      const args = createArgs(['my-project'], {
        template: 'enterprise',
        description: 'Test project',
        author: 'Test Author',
        license: 'Apache-2.0',
        typescript: true,
        eslint: true,
        prettier: true
      });

      await expect(command.execute(args)).resolves.not.toThrow();
    });

    it('应该处理no-git选项', async () => {
      const args = createArgs(['my-project'], {
        template: 'basic',
        'no-git': true
      });

      await expect(command.execute(args)).resolves.not.toThrow();
    });

    it('应该处理no-install选项', async () => {
      const args = createArgs(['my-project'], {
        template: 'basic',
        'no-install': true
      });

      await expect(command.execute(args)).resolves.not.toThrow();
    });
  });

  describe('错误处理', () => {
    it('应该处理文件系统错误', async () => {
      const args = createArgs(['my-project'], { template: 'basic' });

      // Mock templateManager.createProject to throw error
      (command as any).templateManager.createProject.mockRejectedValue(new Error('Permission denied'));

      await expect(command.execute(args)).rejects.toThrow();
    });

    it('应该处理模板管理器错误', async () => {
      const args = createArgs(['my-project'], { template: 'basic' });

      // Mock template manager to throw error
      const originalCreateProject = command['templateManager'].createProject;
      command['templateManager'].createProject = jest.fn().mockRejectedValue(new Error('Template error'));

      await expect(command.execute(args)).rejects.toThrow();

      // Restore original method
      command['templateManager'].createProject = originalCreateProject;
    });
  });

  describe('Git集成', () => {
    it('应该在启用Git时初始化仓库', async () => {
      const args = createArgs(['my-project'], {
        template: 'basic',
        git: true
      });

      const gitInitSpy = jest.spyOn(command['gitOps'], 'init').mockResolvedValue();
      const gitAddSpy = jest.spyOn(command['gitOps'], 'add').mockResolvedValue();
      const gitCommitSpy = jest.spyOn(command['gitOps'], 'commit').mockResolvedValue();
      const isRepoSpy = jest.spyOn(command['gitOps'], 'isRepository').mockReturnValue(false);

      await command.execute(args);

      expect(gitInitSpy).toHaveBeenCalled();
      expect(gitAddSpy).toHaveBeenCalled();
      expect(gitCommitSpy).toHaveBeenCalled();
    });

    it('应该在禁用Git时跳过仓库初始化', async () => {
      const args = createArgs(['my-project'], {
        template: 'basic',
        'no-git': true
      });

      const gitInitSpy = jest.spyOn(command['gitOps'], 'init').mockResolvedValue();

      await command.execute(args);

      expect(gitInitSpy).not.toHaveBeenCalled();
    });
  });

  describe('依赖安装', () => {
    it('应该在启用安装时安装依赖', async () => {
      const args = createArgs(['my-project'], {
        template: 'basic',
        install: true
      });

      const detectSpy = jest.spyOn(command['packageManager'], 'detect').mockResolvedValue({
        name: 'npm',
        install: jest.fn().mockResolvedValue(undefined),
        run: jest.fn().mockResolvedValue(undefined),
        init: jest.fn().mockResolvedValue(undefined)
      });

      await command.execute(args);

      expect(detectSpy).toHaveBeenCalled();
    });

    it('应该在禁用安装时跳过依赖安装', async () => {
      const args = createArgs(['my-project'], {
        template: 'basic',
        'no-install': true
      });

      const detectSpy = jest.spyOn(command['packageManager'], 'detect');

      await command.execute(args);

      expect(detectSpy).not.toHaveBeenCalled();
    });
  });
});
