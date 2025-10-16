/**
 * @fileoverview Tests for CodeGeneratorManager
 */

import { CodeGeneratorManager, GenerationOptions } from '../CodeGeneratorManager';

describe('CodeGeneratorManager', () => {
  let manager: CodeGeneratorManager;

  beforeEach(() => {
    manager = new CodeGeneratorManager();
  });

  describe('模板渲染', () => {
    it('应该渲染简单模板', () => {
      const template = 'Hello {{name}}!';
      const context = { name: 'World' };
      
      const result = CodeGeneratorManager.renderTemplate(template, context);
      
      expect(result).toBe('Hello World!');
    });

    it('应该渲染复杂模板', () => {
      const template = `
/**
 * {{description}}
 */
export class {{name}} {
  constructor() {
    this.name = '{{name}}';
  }
}
      `.trim();
      
      const context = {
        name: 'TestClass',
        description: 'A test class'
      };
      
      const result = CodeGeneratorManager.renderTemplate(template, context);
      
      expect(result).toContain('A test class');
      expect(result).toContain('export class TestClass');
      expect(result).toContain("this.name = 'TestClass'");
    });

    it('应该处理条件渲染', () => {
      const template = `
{{#useTypeScript}}
interface {{name}}Config {
  enabled: boolean;
}
{{/useTypeScript}}
{{^useTypeScript}}
// JavaScript configuration
{{/useTypeScript}}
      `.trim();
      
      const contextWithTS = {
        name: 'Test',
        useTypeScript: true
      };
      
      const contextWithoutTS = {
        name: 'Test',
        useTypeScript: false
      };
      
      const resultWithTS = CodeGeneratorManager.renderTemplate(template, contextWithTS);
      const resultWithoutTS = CodeGeneratorManager.renderTemplate(template, contextWithoutTS);
      
      expect(resultWithTS).toContain('interface TestConfig');
      expect(resultWithoutTS).toContain('// JavaScript configuration');
    });

    it('应该处理循环渲染', () => {
      const template = `
{{#capabilities}}
- {{.}}
{{/capabilities}}
      `.trim();
      
      const context = {
        capabilities: ['read', 'write', 'execute']
      };
      
      const result = CodeGeneratorManager.renderTemplate(template, context);
      
      expect(result).toContain('- read');
      expect(result).toContain('- write');
      expect(result).toContain('- execute');
    });
  });

  describe('模板上下文生成', () => {
    it('应该生成基本上下文', () => {
      const options: GenerationOptions = {
        type: 'agent',
        name: 'TestAgent',
        template: 'basic',
        description: 'A test agent',
        capabilities: ['test'],
        steps: [],
        generateTest: true,
        generateDocs: true,
        useTypeScript: true
      };

      const context = CodeGeneratorManager.getTemplateContext(options);

      expect(context.name).toBe('TestAgent');
      expect(context.description).toBe('A test agent');
      expect(context.template).toBe('basic');
      expect(context.capabilities).toEqual(['test']);
      expect(context.useTypeScript).toBe(true);
      expect(context.fileExtension).toBe('ts');
      expect(context.testExtension).toBe('test.ts');
      expect(context.className).toBe('TestAgent');
      expect(context.camelCaseName).toBe('testAgent');
      expect(context.kebabCaseName).toBe('test-agent');
      expect(context.constantName).toBe('TEST_AGENT');
      expect(context.directory).toBe('agents');
      expect(context.date).toBeDefined();
      expect(context.year).toBeDefined();
    });

    it('应该生成JavaScript上下文', () => {
      const options: GenerationOptions = {
        type: 'workflow',
        name: 'TestWorkflow',
        template: 'advanced',
        description: 'A test workflow',
        capabilities: [],
        steps: ['init', 'process'],
        generateTest: true,
        generateDocs: true,
        useTypeScript: false
      };

      const context = CodeGeneratorManager.getTemplateContext(options);

      expect(context.useTypeScript).toBe(false);
      expect(context.fileExtension).toBe('js');
      expect(context.testExtension).toBe('test.js');
      expect(context.steps).toEqual(['init', 'process']);
      expect(context.directory).toBe('workflows');
    });

    it('应该生成配置上下文', () => {
      const options: GenerationOptions = {
        type: 'config',
        name: 'AppConfig',
        template: 'enterprise',
        description: 'Application configuration',
        capabilities: [],
        steps: [],
        generateTest: true,
        generateDocs: true,
        useTypeScript: true
      };

      const context = CodeGeneratorManager.getTemplateContext(options);

      expect(context.directory).toBe('config');
      expect(context.kebabCaseName).toBe('app-config');
      expect(context.constantName).toBe('APP_CONFIG');
    });
  });

  describe('字符串转换', () => {
    it('应该转换为camelCase', () => {
      const result = CodeGeneratorManager['toCamelCase']('TestAgent');
      expect(result).toBe('testAgent');
    });

    it('应该转换为kebab-case', () => {
      const result = CodeGeneratorManager['toKebabCase']('TestAgent');
      expect(result).toBe('test-agent');
    });

    it('应该转换为CONSTANT_CASE', () => {
      const result = CodeGeneratorManager['toConstantCase']('TestAgent');
      expect(result).toBe('TEST_AGENT');
    });

    it('应该处理复杂名称', () => {
      const complexName = 'MyComplexAgentName';
      
      expect(CodeGeneratorManager['toCamelCase'](complexName)).toBe('myComplexAgentName');
      expect(CodeGeneratorManager['toKebabCase'](complexName)).toBe('my-complex-agent-name');
      expect(CodeGeneratorManager['toConstantCase'](complexName)).toBe('MY_COMPLEX_AGENT_NAME');
    });
  });

  describe('默认目录', () => {
    it('应该返回正确的默认目录', () => {
      expect(CodeGeneratorManager['getDefaultDirectory']('agent')).toBe('agents');
      expect(CodeGeneratorManager['getDefaultDirectory']('workflow')).toBe('workflows');
      expect(CodeGeneratorManager['getDefaultDirectory']('config')).toBe('config');
      expect(CodeGeneratorManager['getDefaultDirectory']('unknown')).toBe('');
    });
  });

  describe('代码生成', () => {
    it('应该生成Agent代码', async () => {
      const options: GenerationOptions = {
        type: 'agent',
        name: 'TestAgent',
        template: 'basic',
        description: 'A test agent',
        capabilities: ['test'],
        steps: [],
        generateTest: false,
        generateDocs: false,
        useTypeScript: true
      };

      // Mock file system operations
      const mockWriteFile = jest.fn();
      const mockEnsureDir = jest.fn();
      
      // Replace the writeFile method temporarily
      const originalWriteFile = manager['writeFile'];
      manager['writeFile'] = mockWriteFile;

      await manager.generateCode(options);

      expect(mockWriteFile).toHaveBeenCalled();
      
      // Restore original method
      manager['writeFile'] = originalWriteFile;
    });

    it('应该生成Workflow代码', async () => {
      const options: GenerationOptions = {
        type: 'workflow',
        name: 'TestWorkflow',
        template: 'basic',
        description: 'A test workflow',
        capabilities: [],
        steps: ['init', 'process'],
        generateTest: false,
        generateDocs: false,
        useTypeScript: true
      };

      // Mock file system operations
      const mockWriteFile = jest.fn();
      
      // Replace the writeFile method temporarily
      const originalWriteFile = manager['writeFile'];
      manager['writeFile'] = mockWriteFile;

      await manager.generateCode(options);

      expect(mockWriteFile).toHaveBeenCalled();
      
      // Restore original method
      manager['writeFile'] = originalWriteFile;
    });

    it('应该生成Config代码', async () => {
      const options: GenerationOptions = {
        type: 'config',
        name: 'AppConfig',
        template: 'basic',
        description: 'Application configuration',
        capabilities: [],
        steps: [],
        generateTest: false,
        generateDocs: false,
        useTypeScript: true
      };

      // Mock file system operations
      const mockWriteFile = jest.fn();
      
      // Replace the writeFile method temporarily
      const originalWriteFile = manager['writeFile'];
      manager['writeFile'] = mockWriteFile;

      await manager.generateCode(options);

      expect(mockWriteFile).toHaveBeenCalled();
      
      // Restore original method
      manager['writeFile'] = originalWriteFile;
    });
  });

  describe('错误处理', () => {
    it('应该处理未知生成器类型', async () => {
      const options: GenerationOptions = {
        type: 'unknown' as any,
        name: 'Test',
        template: 'basic',
        description: 'Test',
        capabilities: [],
        steps: [],
        generateTest: false,
        generateDocs: false,
        useTypeScript: true
      };

      await expect(manager.generateCode(options)).rejects.toThrow('Unknown generator type: unknown');
    });
  });

  describe('干运行模式', () => {
    it('应该返回将要生成的文件列表', async () => {
      const options: GenerationOptions = {
        type: 'agent',
        name: 'TestAgent',
        template: 'basic',
        description: 'A test agent',
        capabilities: ['test'],
        steps: [],
        generateTest: true,
        generateDocs: true,
        useTypeScript: true
      };

      const files = await manager.getGeneratedFiles(options);

      expect(files).toBeDefined();
      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
      
      // Check that files have required properties
      files.forEach(file => {
        expect(file.path).toBeDefined();
        expect(typeof file.path).toBe('string');
      });
    });
  });
});
