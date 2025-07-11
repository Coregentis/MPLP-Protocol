#!/usr/bin/env node

/**
 * 立即诊断脚本 - 无需额外依赖的问题检测
 * 
 * @version v1.0.0
 * @created 2025-01-09T25:10:00+08:00
 * @description 快速检测MPLP项目问题，无需安装额外依赖
 */

const fs = require('fs');
const path = require('path');

class ImmediateDiagnosis {
  constructor() {
    this.projectRoot = process.cwd();
    this.issues = [];
    this.fixableIssues = [];
  }

  /**
   * 运行完整诊断
   */
  async run() {
    console.log('\n🔍 TracePilot 立即诊断开始...\n');
    
    await this.checkProjectStructure();
    await this.checkSchemaDefinitions();
    await this.checkTypeScriptConfig();
    await this.checkJestConfig();
    await this.checkModuleCompleteness();
    
    this.generateReport();
    await this.promptForFixes();
  }

  /**
   * 检查项目结构
   */
  async checkProjectStructure() {
    const requiredDirectories = [
      'src',
      'src/modules',
      'src/modules/context',
      'src/modules/plan', 
      'src/modules/trace',
      'src/types',
      'src/utils',
      'src/mcp',
      'tests'
    ];

    console.log('📁 检查项目结构...');
    
    for (const dir of requiredDirectories) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        this.addIssue({
          type: 'missing_directory',
          severity: 'high',
          title: `缺失目录: ${dir}`,
          description: `项目结构不完整，缺少必要的目录`,
          fixable: true,
          fix: () => this.createDirectory(dirPath)
        });
      }
    }
  }

  /**
   * 检查Schema定义
   */
  async checkSchemaDefinitions() {
    console.log('📋 检查Schema定义...');
    
    const schemasDir = path.join(this.projectRoot, 'src/schemas');
    if (!fs.existsSync(schemasDir)) {
      this.addIssue({
        type: 'missing_schema_directory',
        severity: 'critical',
        title: '缺失Schema目录',
        description: 'src/schemas目录不存在，无法进行数据验证',
        fixable: true,
        fix: () => this.createSchemaDirectory()
      });
      return;
    }

    const requiredSchemas = [
      'base-protocol.json',
      'context-protocol.json',
      'plan-protocol.json',
      'trace-protocol.json'
    ];

    for (const schema of requiredSchemas) {
      const schemaPath = path.join(schemasDir, schema);
      if (!fs.existsSync(schemaPath)) {
        this.addIssue({
          type: 'missing_schema',
          severity: 'high',
          title: `缺失Schema文件: ${schema}`,
          description: `${schema}文件不存在，影响数据验证功能`,
          fixable: true,
          fix: () => this.createSchemaFile(schema)
        });
      }
    }

    // 检查Schema index文件
    const schemaIndexPath = path.join(schemasDir, 'index.ts');
    if (!fs.existsSync(schemaIndexPath)) {
      this.addIssue({
        type: 'missing_schema_index',
        severity: 'medium',
        title: '缺失Schema索引文件',
        description: 'schemas/index.ts文件不存在，无法统一导出Schema',
        fixable: true,
        fix: () => this.createSchemaIndex()
      });
    }
  }

  /**
   * 检查TypeScript配置
   */
  async checkTypeScriptConfig() {
    console.log('⚙️ 检查TypeScript配置...');
    
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      this.addIssue({
        type: 'missing_tsconfig',
        severity: 'critical',
        title: '缺失TypeScript配置',
        description: 'tsconfig.json不存在，无法编译TypeScript代码',
        fixable: false
      });
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      
      if (!config.compilerOptions?.paths?.['@/*']) {
        this.addIssue({
          type: 'missing_path_mapping',
          severity: 'medium',
          title: 'TypeScript路径映射配置缺失',
          description: '@/* 路径映射未配置，可能导致导入错误',
          fixable: true,
          fix: () => this.fixTypeScriptPaths()
        });
      }
    } catch (error) {
      this.addIssue({
        type: 'invalid_tsconfig',
        severity: 'high',
        title: 'TypeScript配置文件语法错误',
        description: 'tsconfig.json文件包含语法错误',
        fixable: false
      });
    }
  }

  /**
   * 检查Jest配置
   */
  async checkJestConfig() {
    console.log('🧪 检查Jest配置...');
    
    const jestConfigPath = path.join(this.projectRoot, 'jest.config.js');
    if (!fs.existsSync(jestConfigPath)) {
      this.addIssue({
        type: 'missing_jest_config',
        severity: 'high',
        title: '缺失Jest配置',
        description: 'jest.config.js不存在，无法运行测试',
        fixable: true,
        fix: () => this.createJestConfig()
      });
      return;
    }

    try {
      const content = fs.readFileSync(jestConfigPath, 'utf-8');
      
      // 检查常见的Jest配置错误
      if (content.includes('moduleNameMapping')) {
        this.addIssue({
          type: 'jest_config_typo',
          severity: 'high',
          title: 'Jest配置拼写错误',
          description: 'moduleNameMapping应为moduleNameMapper',
          fixable: true,
          fix: () => this.fixJestConfig()
        });
      }
    } catch (error) {
      this.addIssue({
        type: 'invalid_jest_config',
        severity: 'high',
        title: 'Jest配置文件读取失败',
        description: 'jest.config.js文件无法读取或解析',
        fixable: false
      });
    }
  }

  /**
   * 检查模块完整性
   */
  async checkModuleCompleteness() {
    console.log('🧩 检查模块完整性...');
    
    const modules = ['context', 'plan', 'trace'];
    
    for (const moduleName of modules) {
      const moduleDir = path.join(this.projectRoot, 'src/modules', moduleName);
      const requiredFiles = [
        'index.ts',
        'types.ts',
        `${moduleName}-manager.ts`,
        'utils.ts'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(moduleDir, file);
        if (!fs.existsSync(filePath)) {
          this.addIssue({
            type: 'missing_module_file',
            severity: 'high',
            title: `${moduleName}模块缺失文件: ${file}`,
            description: `核心模块文件缺失，影响功能完整性`,
            fixable: true,
            fix: () => this.createModuleFile(moduleName, file)
          });
        } else {
          // 检查文件内容是否完整
          const content = fs.readFileSync(filePath, 'utf-8');
          if (content.includes('TODO') || content.includes('PLACEHOLDER') || content.length < 100) {
            this.addIssue({
              type: 'incomplete_implementation',
              severity: 'medium',
              title: `${moduleName}模块${file}实现不完整`,
              description: '文件存在但实现不完整或包含占位符',
              fixable: false
            });
          }
        }
      }
    }
  }

  /**
   * 添加问题
   */
  addIssue(issue) {
    this.issues.push(issue);
    if (issue.fixable) {
      this.fixableIssues.push(issue);
    }
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 诊断报告\n');
    
    if (this.issues.length === 0) {
      console.log('🎉 恭喜！未发现问题，项目状态良好。');
      return;
    }

    const grouped = this.issues.reduce((acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    }, {});

    const severityOrder = ['critical', 'high', 'medium', 'low'];
    const severityEmojis = {
      critical: '🚨',
      high: '❗',
      medium: '⚠️',
      low: 'ℹ️'
    };

    for (const severity of severityOrder) {
      if (!grouped[severity]) continue;
      
      console.log(`${severityEmojis[severity]} ${severity.toUpperCase()} (${grouped[severity].length})`);
      
      for (const issue of grouped[severity]) {
        console.log(`  • ${issue.title}`);
        console.log(`    ${issue.description}`);
        if (issue.fixable) {
          console.log(`    ✅ 可自动修复`);
        } else {
          console.log(`    ⚠️ 需要手动修复`);
        }
        console.log();
      }
    }

    console.log(`📋 总计: ${this.issues.length} 个问题`);
    console.log(`🔧 可自动修复: ${this.fixableIssues.length} 个`);
  }

  /**
   * 提示修复
   */
  async promptForFixes() {
    if (this.fixableIssues.length === 0) {
      console.log('\n没有可自动修复的问题。');
      return;
    }

    console.log(`\n发现 ${this.fixableIssues.length} 个可自动修复的问题。`);
    console.log('是否立即执行自动修复？(y/N)');

    // 模拟用户输入 - 在实际使用中应该使用readline
    const shouldFix = process.argv.includes('--auto-fix') || process.argv.includes('-f');
    
    if (shouldFix) {
      console.log('\n🔧 开始自动修复...\n');
      
      for (const issue of this.fixableIssues) {
        try {
          console.log(`修复: ${issue.title}`);
          if (issue.fix) {
            await issue.fix();
            console.log(`✅ 完成: ${issue.title}`);
          }
        } catch (error) {
          console.log(`❌ 失败: ${issue.title} - ${error.message}`);
        }
      }
      
      console.log('\n🎉 自动修复完成！');
    } else {
      console.log('\n跳过自动修复。使用 --auto-fix 参数可直接执行修复。');
    }
  }

  /**
   * 修复方法实现
   */
  createDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  createSchemaDirectory() {
    const schemasDir = path.join(this.projectRoot, 'src/schemas');
    this.createDirectory(schemasDir);
    
    // 立即创建所有必需的Schema文件
    this.createSchemaFile('base-protocol.json');
    this.createSchemaFile('context-protocol.json');
    this.createSchemaFile('plan-protocol.json');
    this.createSchemaFile('trace-protocol.json');
    this.createSchemaIndex();
  }

  createSchemaFile(fileName) {
    const schemasDir = path.join(this.projectRoot, 'src/schemas');
    const filePath = path.join(schemasDir, fileName);
    
    const schemas = {
      'base-protocol.json': {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'base-protocol.json',
        title: 'MPLP Base Protocol',
        type: 'object',
        properties: {
          version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
          timestamp: { type: 'string', format: 'date-time' }
        },
        required: ['version', 'timestamp']
      },
      'context-protocol.json': {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'context-protocol.json',
        title: 'MPLP Context Protocol',
        allOf: [{ $ref: 'base-protocol.json' }],
        type: 'object',
        properties: {
          context_id: { type: 'string', pattern: '^ctx-[a-f0-9-]+$' },
          user_id: { type: 'string' },
          shared_state: { type: 'object' }
        },
        required: ['context_id', 'user_id', 'shared_state']
      },
      'plan-protocol.json': {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'plan-protocol.json',
        title: 'MPLP Plan Protocol',
        allOf: [{ $ref: 'base-protocol.json' }],
        type: 'object',
        properties: {
          plan_id: { type: 'string', pattern: '^plan-[a-f0-9-]+$' },
          context_id: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'planning', 'executing', 'completed'] }
        },
        required: ['plan_id', 'context_id', 'status']
      },
      'trace-protocol.json': {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'trace-protocol.json',
        title: 'MPLP Trace Protocol',
        allOf: [{ $ref: 'base-protocol.json' }],
        type: 'object',
        properties: {
          trace_id: { type: 'string', pattern: '^trace-[a-f0-9-]+$' },
          context_id: { type: 'string' },
          operation_name: { type: 'string' },
          duration_ms: { type: 'number', minimum: 0 }
        },
        required: ['trace_id', 'context_id', 'operation_name', 'duration_ms']
      }
    };

    const schema = schemas[fileName];
    if (schema) {
      fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
    }
  }

  createSchemaIndex() {
    const content = `/**
 * MPLP Schema Exports
 * @created ${new Date().toISOString()}
 */

export { default as baseProtocolSchema } from './base-protocol.json';
export { default as contextProtocolSchema } from './context-protocol.json';
export { default as planProtocolSchema } from './plan-protocol.json';
export { default as traceProtocolSchema } from './trace-protocol.json';

// Schema validation will be implemented here
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

// Placeholder for future validator implementation
export const validateSchema = (schema: string, data: any): ValidationResult => {
  return { valid: true };
};
`;
    
    const filePath = path.join(this.projectRoot, 'src/schemas/index.ts');
    fs.writeFileSync(filePath, content);
  }

  fixJestConfig() {
    const jestConfigPath = path.join(this.projectRoot, 'jest.config.js');
    let content = fs.readFileSync(jestConfigPath, 'utf-8');
    
    // 修复拼写错误
    content = content.replace(/moduleNameMapping/g, 'moduleNameMapper');
    
    fs.writeFileSync(jestConfigPath, content);
  }

  createJestConfig() {
    const content = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
`;
    
    const filePath = path.join(this.projectRoot, 'jest.config.js');
    fs.writeFileSync(filePath, content);
  }
}

// 运行诊断
if (require.main === module) {
  const diagnosis = new ImmediateDiagnosis();
  diagnosis.run().catch(console.error);
}

module.exports = { ImmediateDiagnosis }; 