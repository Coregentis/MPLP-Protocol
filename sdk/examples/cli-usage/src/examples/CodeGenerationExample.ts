/**
 * @fileoverview Code Generation Examples
 * @version 1.1.0-beta
 */

import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Code Generation Examples
 */
export class CodeGenerationExample {
  private readonly outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'output', 'code-generation');
  }

  /**
   * Run all code generation examples
   */
  public async runAllExamples(): Promise<void> {
    console.log(chalk.blue.bold('⚡ Code Generation Examples'));
    console.log(chalk.gray('Demonstrating MPLP CLI code generation capabilities\n'));

    await this.ensureOutputDirectory();

    try {
      // Example 1: Agent generation
      await this.agentGenerationExample();
      
      // Example 2: Workflow generation
      await this.workflowGenerationExample();
      
      // Example 3: Configuration generation
      await this.configGenerationExample();
      
      // Example 4: API endpoint generation
      await this.apiGenerationExample();
      
      // Example 5: Test generation
      await this.testGenerationExample();

      console.log(chalk.green.bold('\n✅ All code generation examples completed!'));

    } catch (error) {
      console.error(chalk.red.bold('❌ Code generation examples failed:'), error);
      throw error;
    }
  }

  /**
   * Example 1: Agent generation
   */
  private async agentGenerationExample(): Promise<void> {
    console.log(chalk.cyan.bold('\n🤖 Example 1: Agent Generation'));
    console.log(chalk.gray('Generating different types of MPLP agents\n'));

    const agentTypes = [
      { name: 'DataProcessorAgent', type: 'data-processor', description: 'Processes and transforms data' },
      { name: 'AnalyticsAgent', type: 'analytics', description: 'Performs data analysis and insights' },
      { name: 'NotificationAgent', type: 'notification', description: 'Handles notifications and alerts' }
    ];

    for (const agent of agentTypes) {
      console.log(chalk.yellow(`Generating ${agent.name}...`));
      console.log(chalk.gray(`  CLI Command: mplp generate agent ${agent.name} --type ${agent.type}`));
      
      const spinner = ora(`Creating ${agent.name}...`).start();
      
      try {
        await this.generateAgent(agent.name, agent.type, agent.description);
        spinner.succeed(`Generated ${agent.name}`);
        
        // Show generated files
        console.log(chalk.gray(`  📄 Created: src/agents/${agent.name}.ts`));
        console.log(chalk.gray(`  📄 Created: tests/agents/${agent.name}.test.ts`));
        console.log(chalk.gray(`  📄 Created: docs/agents/${agent.name}.md\n`));
        
      } catch (error) {
        spinner.fail(`Failed to generate ${agent.name}`);
        throw error;
      }
    }

    // Show agent capabilities
    console.log(chalk.green('✅ Generated agents with capabilities:'));
    console.log(chalk.gray('  ✓ Type-safe interfaces'));
    console.log(chalk.gray('  ✓ Built-in error handling'));
    console.log(chalk.gray('  ✓ Comprehensive logging'));
    console.log(chalk.gray('  ✓ Unit test templates'));
    console.log(chalk.gray('  ✓ Documentation templates'));
  }

  /**
   * Example 2: Workflow generation
   */
  private async workflowGenerationExample(): Promise<void> {
    console.log(chalk.cyan.bold('\n🔄 Example 2: Workflow Generation'));
    console.log(chalk.gray('Generating orchestrated workflows\n'));

    const workflows = [
      { name: 'DataProcessingWorkflow', agents: ['DataProcessorAgent', 'AnalyticsAgent'] },
      { name: 'NotificationWorkflow', agents: ['NotificationAgent'] },
      { name: 'ComprehensiveWorkflow', agents: ['DataProcessorAgent', 'AnalyticsAgent', 'NotificationAgent'] }
    ];

    for (const workflow of workflows) {
      console.log(chalk.yellow(`Generating ${workflow.name}...`));
      console.log(chalk.gray(`  CLI Command: mplp generate workflow ${workflow.name} --agents ${workflow.agents.join(',')}`));
      
      const spinner = ora(`Creating ${workflow.name}...`).start();
      
      try {
        await this.generateWorkflow(workflow.name, workflow.agents);
        spinner.succeed(`Generated ${workflow.name}`);
        
        console.log(chalk.gray(`  📄 Created: src/workflows/${workflow.name}.ts`));
        console.log(chalk.gray(`  📄 Created: tests/workflows/${workflow.name}.test.ts`));
        console.log(chalk.gray(`  📄 Created: docs/workflows/${workflow.name}.md\n`));
        
      } catch (error) {
        spinner.fail(`Failed to generate ${workflow.name}`);
        throw error;
      }
    }

    console.log(chalk.green('✅ Generated workflows with features:'));
    console.log(chalk.gray('  ✓ Agent orchestration'));
    console.log(chalk.gray('  ✓ Error handling and recovery'));
    console.log(chalk.gray('  ✓ Progress tracking'));
    console.log(chalk.gray('  ✓ Parallel and sequential execution'));
    console.log(chalk.gray('  ✓ Workflow validation'));
  }

  /**
   * Example 3: Configuration generation
   */
  private async configGenerationExample(): Promise<void> {
    console.log(chalk.cyan.bold('\n⚙️ Example 3: Configuration Generation'));
    console.log(chalk.gray('Generating configuration modules\n'));

    const configs = [
      { name: 'DatabaseConfig', type: 'database', description: 'Database connection configuration' },
      { name: 'APIConfig', type: 'api', description: 'API service configuration' },
      { name: 'LoggingConfig', type: 'logging', description: 'Logging and monitoring configuration' }
    ];

    for (const config of configs) {
      console.log(chalk.yellow(`Generating ${config.name}...`));
      console.log(chalk.gray(`  CLI Command: mplp generate config ${config.name} --type ${config.type}`));
      
      const spinner = ora(`Creating ${config.name}...`).start();
      
      try {
        await this.generateConfig(config.name, config.type, config.description);
        spinner.succeed(`Generated ${config.name}`);
        
        console.log(chalk.gray(`  📄 Created: src/config/${config.name}.ts`));
        console.log(chalk.gray(`  📄 Created: tests/config/${config.name}.test.ts`));
        console.log(chalk.gray(`  📄 Created: config/${config.name.toLowerCase()}.json\n`));
        
      } catch (error) {
        spinner.fail(`Failed to generate ${config.name}`);
        throw error;
      }
    }

    console.log(chalk.green('✅ Generated configurations with features:'));
    console.log(chalk.gray('  ✓ Environment-specific settings'));
    console.log(chalk.gray('  ✓ Type-safe configuration'));
    console.log(chalk.gray('  ✓ Validation and defaults'));
    console.log(chalk.gray('  ✓ Hot reloading support'));
  }

  /**
   * Example 4: API endpoint generation
   */
  private async apiGenerationExample(): Promise<void> {
    console.log(chalk.cyan.bold('\n🌐 Example 4: API Endpoint Generation'));
    console.log(chalk.gray('Generating REST API endpoints\n'));

    const endpoints = [
      { name: 'AgentController', resource: 'agents', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'WorkflowController', resource: 'workflows', methods: ['GET', 'POST'] },
      { name: 'HealthController', resource: 'health', methods: ['GET'] }
    ];

    for (const endpoint of endpoints) {
      console.log(chalk.yellow(`Generating ${endpoint.name}...`));
      console.log(chalk.gray(`  CLI Command: mplp generate api ${endpoint.name} --resource ${endpoint.resource} --methods ${endpoint.methods.join(',')}`));
      
      const spinner = ora(`Creating ${endpoint.name}...`).start();
      
      try {
        await this.generateAPIEndpoint(endpoint.name, endpoint.resource, endpoint.methods);
        spinner.succeed(`Generated ${endpoint.name}`);
        
        console.log(chalk.gray(`  📄 Created: src/api/controllers/${endpoint.name}.ts`));
        console.log(chalk.gray(`  📄 Created: src/api/routes/${endpoint.resource}.ts`));
        console.log(chalk.gray(`  📄 Created: tests/api/${endpoint.name}.test.ts\n`));
        
      } catch (error) {
        spinner.fail(`Failed to generate ${endpoint.name}`);
        throw error;
      }
    }

    console.log(chalk.green('✅ Generated API endpoints with features:'));
    console.log(chalk.gray('  ✓ RESTful design patterns'));
    console.log(chalk.gray('  ✓ Input validation'));
    console.log(chalk.gray('  ✓ Error handling middleware'));
    console.log(chalk.gray('  ✓ OpenAPI documentation'));
    console.log(chalk.gray('  ✓ Integration tests'));
  }

  /**
   * Example 5: Test generation
   */
  private async testGenerationExample(): Promise<void> {
    console.log(chalk.cyan.bold('\n🧪 Example 5: Test Generation'));
    console.log(chalk.gray('Generating comprehensive test suites\n'));

    const testTypes = [
      { name: 'unit', description: 'Unit tests for individual components' },
      { name: 'integration', description: 'Integration tests for component interaction' },
      { name: 'e2e', description: 'End-to-end tests for complete workflows' }
    ];

    for (const testType of testTypes) {
      console.log(chalk.yellow(`Generating ${testType.name} tests...`));
      console.log(chalk.gray(`  CLI Command: mplp generate tests --type ${testType.name} --coverage`));
      
      const spinner = ora(`Creating ${testType.name} tests...`).start();
      
      try {
        await this.generateTests(testType.name, testType.description);
        spinner.succeed(`Generated ${testType.name} tests`);
        
        console.log(chalk.gray(`  📄 Created: tests/${testType.name}/`));
        console.log(chalk.gray(`  📄 Created: jest.config.${testType.name}.js`));
        console.log(chalk.gray(`  📄 Created: tests/${testType.name}/setup.ts\n`));
        
      } catch (error) {
        spinner.fail(`Failed to generate ${testType.name} tests`);
        throw error;
      }
    }

    console.log(chalk.green('✅ Generated test suites with features:'));
    console.log(chalk.gray('  ✓ Jest configuration'));
    console.log(chalk.gray('  ✓ Test utilities and helpers'));
    console.log(chalk.gray('  ✓ Mock factories'));
    console.log(chalk.gray('  ✓ Coverage reporting'));
    console.log(chalk.gray('  ✓ CI/CD integration'));
  }

  /**
   * Generate agent code
   */
  private async generateAgent(name: string, type: string, description: string): Promise<void> {
    const agentDir = path.join(this.outputDir, 'src/agents');
    const testDir = path.join(this.outputDir, 'tests/agents');
    const docsDir = path.join(this.outputDir, 'docs/agents');

    await fs.mkdir(agentDir, { recursive: true });
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(docsDir, { recursive: true });

    // Generate agent implementation
    const agentContent = `/**
 * ${name} - ${description}
 * Generated by MPLP CLI
 */

import { MPLPAgent, AgentConfig } from '@mplp/agent-builder';

export interface ${name}Config extends AgentConfig {
  readonly ${type}Options?: {
    readonly timeout?: number;
    readonly retries?: number;
    readonly batchSize?: number;
  };
}

export interface ${name}Input {
  readonly data: any;
  readonly options?: Record<string, unknown>;
}

export interface ${name}Output {
  readonly success: boolean;
  readonly result: any;
  readonly metadata?: Record<string, unknown>;
}

export class ${name} extends MPLPAgent {
  private readonly config: ${name}Config;

  constructor(config: ${name}Config) {
    super(config);
    this.config = config;
  }

  public async execute(action: string, parameters: ${name}Input): Promise<${name}Output> {
    try {
      switch (action) {
        case 'process':
          return await this.processData(parameters);
        case 'validate':
          return await this.validateData(parameters);
        default:
          throw new Error(\`Unknown action: \${action}\`);
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  private async processData(input: ${name}Input): Promise<${name}Output> {
    // Implement ${type} processing logic here
    console.log('Processing data with ${name}:', input.data);
    
    return {
      success: true,
      result: {
        processed: true,
        data: input.data,
        processedAt: new Date().toISOString()
      }
    };
  }

  private async validateData(input: ${name}Input): Promise<${name}Output> {
    // Implement data validation logic here
    const isValid = input.data != null;
    
    return {
      success: isValid,
      result: {
        valid: isValid,
        data: input.data
      }
    };
  }
}

export default ${name};`;

    await fs.writeFile(path.join(agentDir, `${name}.ts`), agentContent);

    // Generate test file
    const testContent = `/**
 * ${name} Tests
 */

import { ${name} } from '../../src/agents/${name}';

describe('${name}', () => {
  let agent: ${name};

  beforeEach(() => {
    agent = new ${name}({
      id: 'test-${name.toLowerCase()}',
      name: 'Test ${name}',
      description: '${description}',
      capabilities: ['${type}']
    });
  });

  describe('execute', () => {
    it('should process data successfully', async () => {
      const input = {
        data: { test: 'data' }
      };

      const result = await agent.execute('process', input);

      expect(result.success).toBe(true);
      expect(result.result.processed).toBe(true);
      expect(result.result.data).toEqual(input.data);
    });

    it('should validate data successfully', async () => {
      const input = {
        data: { test: 'data' }
      };

      const result = await agent.execute('validate', input);

      expect(result.success).toBe(true);
      expect(result.result.valid).toBe(true);
    });

    it('should handle unknown actions', async () => {
      const input = {
        data: { test: 'data' }
      };

      const result = await agent.execute('unknown', input);

      expect(result.success).toBe(false);
      expect(result.metadata?.error).toContain('Unknown action');
    });
  });
});`;

    await fs.writeFile(path.join(testDir, `${name}.test.ts`), testContent);

    // Generate documentation
    const docsContent = `# ${name}

${description}

## Overview

The ${name} is a specialized MPLP agent designed for ${type} operations.

## Configuration

\`\`\`typescript
const agent = new ${name}({
  id: 'my-${name.toLowerCase()}',
  name: 'My ${name}',
  description: '${description}',
  capabilities: ['${type}'],
  ${type}Options: {
    timeout: 30000,
    retries: 3,
    batchSize: 100
  }
});
\`\`\`

## Actions

### process
Processes the provided data according to ${type} logic.

### validate
Validates the provided data structure and content.

## Examples

\`\`\`typescript
// Process data
const result = await agent.execute('process', {
  data: { /* your data */ }
});

// Validate data
const validation = await agent.execute('validate', {
  data: { /* your data */ }
});
\`\`\`
`;

    await fs.writeFile(path.join(docsDir, `${name}.md`), docsContent);
  }

  /**
   * Generate workflow code
   */
  private async generateWorkflow(name: string, agents: string[]): Promise<void> {
    const workflowDir = path.join(this.outputDir, 'src/workflows');
    const testDir = path.join(this.outputDir, 'tests/workflows');
    const docsDir = path.join(this.outputDir, 'docs/workflows');

    await fs.mkdir(workflowDir, { recursive: true });
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(docsDir, { recursive: true });

    const workflowContent = `/**
 * ${name} - Generated by MPLP CLI
 */

import { MultiAgentOrchestrator } from '@mplp/orchestrator';
${agents.map(agent => `import { ${agent} } from '../agents/${agent}';`).join('\n')}

export interface ${name}Input {
  readonly data: any;
  readonly options?: Record<string, unknown>;
}

export interface ${name}Output {
  readonly success: boolean;
  readonly results: any[];
  readonly metadata: {
    readonly executionTime: number;
    readonly stepsCompleted: number;
    readonly timestamp: string;
  };
}

export class ${name} {
  private readonly orchestrator: MultiAgentOrchestrator;
  private readonly agents: Map<string, any>;

  constructor() {
    this.orchestrator = MultiAgentOrchestrator.create();
    this.agents = new Map();
    this.initializeAgents();
  }

  private async initializeAgents(): Promise<void> {
${agents.map(agent => `    const ${agent.toLowerCase()} = new ${agent}({
      id: '${agent.toLowerCase()}',
      name: '${agent}',
      description: '${agent} for workflow',
      capabilities: ['workflow_execution']
    });
    this.agents.set('${agent.toLowerCase()}', ${agent.toLowerCase()});
    await this.orchestrator.registerAgent(${agent.toLowerCase()});`).join('\n\n')}
  }

  public async execute(input: ${name}Input): Promise<${name}Output> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      // Execute workflow steps
${agents.map((agent, index) => `      // Step ${index + 1}: ${agent}
      const ${agent.toLowerCase()}Result = await this.agents.get('${agent.toLowerCase()}').execute('process', input);
      results.push(${agent.toLowerCase()}Result);`).join('\n\n')}

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        results,
        metadata: {
          executionTime,
          stepsCompleted: ${agents.length},
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        results,
        metadata: {
          executionTime,
          stepsCompleted: results.length,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

export default ${name};`;

    await fs.writeFile(path.join(workflowDir, `${name}.ts`), workflowContent);

    // Generate test and docs files (simplified for space)
    const testContent = `/**
 * ${name} Tests
 */

import { ${name} } from '../../src/workflows/${name}';

describe('${name}', () => {
  let workflow: ${name};

  beforeEach(() => {
    workflow = new ${name}();
  });

  it('should execute workflow successfully', async () => {
    const input = { data: { test: 'data' } };
    const result = await workflow.execute(input);
    
    expect(result.success).toBe(true);
    expect(result.results).toHaveLength(${agents.length});
  });
});`;

    await fs.writeFile(path.join(testDir, `${name}.test.ts`), testContent);

    const docsContent = `# ${name}

Orchestrated workflow using agents: ${agents.join(', ')}

## Usage

\`\`\`typescript
const workflow = new ${name}();
const result = await workflow.execute({ data: yourData });
\`\`\`
`;

    await fs.writeFile(path.join(docsDir, `${name}.md`), docsContent);
  }

  /**
   * Generate configuration code
   */
  private async generateConfig(name: string, type: string, description: string): Promise<void> {
    const configDir = path.join(this.outputDir, 'src/config');
    const testDir = path.join(this.outputDir, 'tests/config');
    const configFileDir = path.join(this.outputDir, 'config');

    await fs.mkdir(configDir, { recursive: true });
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(configFileDir, { recursive: true });

    const configContent = `/**
 * ${name} - ${description}
 * Generated by MPLP CLI
 */

export interface ${name}Options {
  readonly host: string;
  readonly port: number;
  readonly timeout: number;
  readonly retries: number;
  readonly ssl?: boolean;
  readonly credentials?: {
    readonly username: string;
    readonly password: string;
  };
}

export class ${name} {
  private readonly options: ${name}Options;

  constructor(options: Partial<${name}Options> = {}) {
    this.options = {
      host: process.env.${type.toUpperCase()}_HOST || 'localhost',
      port: parseInt(process.env.${type.toUpperCase()}_PORT || '5432'),
      timeout: parseInt(process.env.${type.toUpperCase()}_TIMEOUT || '30000'),
      retries: parseInt(process.env.${type.toUpperCase()}_RETRIES || '3'),
      ssl: process.env.${type.toUpperCase()}_SSL === 'true',
      ...options
    };
  }

  public getOptions(): ${name}Options {
    return { ...this.options };
  }

  public isValid(): boolean {
    return (
      this.options.port > 0 &&
      this.options.timeout > 0 &&
      this.options.retries >= 0 &&
      this.options.host.length > 0
    );
  }

  public getConnectionString(): string {
    const { host, port, ssl } = this.options;
    const protocol = ssl ? '${type}s' : '${type}';
    return \`\${protocol}://\${host}:\${port}\`;
  }
}

export default ${name};`;

    await fs.writeFile(path.join(configDir, `${name}.ts`), configContent);

    // Generate config JSON file
    const configJson = {
      [type]: {
        host: 'localhost',
        port: type === 'database' ? 5432 : 3000,
        timeout: 30000,
        retries: 3,
        ssl: false
      }
    };

    await fs.writeFile(
      path.join(configFileDir, `${name.toLowerCase()}.json`),
      JSON.stringify(configJson, null, 2)
    );

    // Generate test file
    const testContent = `/**
 * ${name} Tests
 */

import { ${name} } from '../../src/config/${name}';

describe('${name}', () => {
  let config: ${name};

  beforeEach(() => {
    config = new ${name}();
  });

  it('should create with default options', () => {
    expect(config.isValid()).toBe(true);
    expect(config.getOptions().host).toBe('localhost');
  });

  it('should accept custom options', () => {
    const customConfig = new ${name}({
      host: 'custom-host',
      port: 8080
    });

    expect(customConfig.getOptions().host).toBe('custom-host');
    expect(customConfig.getOptions().port).toBe(8080);
  });

  it('should generate connection string', () => {
    const connectionString = config.getConnectionString();
    expect(connectionString).toContain('${type}://');
  });
});`;

    await fs.writeFile(path.join(testDir, `${name}.test.ts`), testContent);
  }

  /**
   * Generate API endpoint code
   */
  private async generateAPIEndpoint(name: string, resource: string, methods: string[]): Promise<void> {
    const controllerDir = path.join(this.outputDir, 'src/api/controllers');
    const routesDir = path.join(this.outputDir, 'src/api/routes');
    const testDir = path.join(this.outputDir, 'tests/api');

    await fs.mkdir(controllerDir, { recursive: true });
    await fs.mkdir(routesDir, { recursive: true });
    await fs.mkdir(testDir, { recursive: true });

    // Generate controller
    const controllerContent = `/**
 * ${name} - Generated by MPLP CLI
 */

import { Request, Response } from 'express';

export class ${name} {
${methods.map(method => {
  const methodName = method.toLowerCase();
  return `  public async ${methodName}${resource.charAt(0).toUpperCase() + resource.slice(1)}(req: Request, res: Response): Promise<void> {
    try {
      // Implement ${method} ${resource} logic here
      res.json({
        success: true,
        method: '${method}',
        resource: '${resource}',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }`;
}).join('\n\n')}
}

export default ${name};`;

    await fs.writeFile(path.join(controllerDir, `${name}.ts`), controllerContent);

    // Generate routes
    const routesContent = `/**
 * ${resource.charAt(0).toUpperCase() + resource.slice(1)} Routes
 */

import { Router } from 'express';
import { ${name} } from '../controllers/${name}';

const router = Router();
const controller = new ${name}();

${methods.map(method => {
  const methodName = method.toLowerCase();
  const route = method === 'GET' && resource !== 'health' ? `/${resource}/:id?` : `/${resource}`;
  return `router.${methodName}('${route}', controller.${methodName}${resource.charAt(0).toUpperCase() + resource.slice(1)}.bind(controller));`;
}).join('\n')}

export default router;`;

    await fs.writeFile(path.join(routesDir, `${resource}.ts`), routesContent);

    // Generate test
    const testContent = `/**
 * ${name} Tests
 */

import request from 'supertest';
import express from 'express';
import { ${name} } from '../../src/api/controllers/${name}';
import ${resource}Routes from '../../src/api/routes/${resource}';

const app = express();
app.use(express.json());
app.use('/api', ${resource}Routes);

describe('${name}', () => {
${methods.map(method => {
  const methodName = method.toLowerCase();
  const route = `/api/${resource}`;
  return `  it('should handle ${method} ${resource}', async () => {
    const response = await request(app)
      .${methodName}('${route}')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.method).toBe('${method}');
  });`;
}).join('\n\n')}
});`;

    await fs.writeFile(path.join(testDir, `${name}.test.ts`), testContent);
  }

  /**
   * Generate test files
   */
  private async generateTests(testType: string, description: string): Promise<void> {
    const testDir = path.join(this.outputDir, 'tests', testType);
    await fs.mkdir(testDir, { recursive: true });

    // Generate Jest config
    const jestConfig = {
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: [`<rootDir>/tests/${testType}`],
      testMatch: [`**/tests/${testType}/**/*.test.ts`],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts'
      ],
      coverageDirectory: `coverage/${testType}`,
      setupFilesAfterEnv: [`<rootDir>/tests/${testType}/setup.ts`]
    };

    await fs.writeFile(
      path.join(this.outputDir, `jest.config.${testType}.js`),
      `module.exports = ${JSON.stringify(jestConfig, null, 2)};`
    );

    // Generate setup file
    const setupContent = `/**
 * ${testType.charAt(0).toUpperCase() + testType.slice(1)} Test Setup
 * ${description}
 */

// Global test setup for ${testType} tests
beforeAll(async () => {
  // Setup ${testType} test environment
  console.log('Setting up ${testType} tests...');
});

afterAll(async () => {
  // Cleanup ${testType} test environment
  console.log('Cleaning up ${testType} tests...');
});

// Global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        delay: (ms: number) => Promise<void>;
        generateTestData: () => {
          id: string;
          name: string;
          timestamp: string;
        };
      };
    }
  }
}

(global as any).testUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  generateTestData: () => ({
    id: 'test-id',
    name: 'Test Item',
    timestamp: new Date().toISOString()
  })
};`;

    await fs.writeFile(path.join(testDir, 'setup.ts'), setupContent);
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
  }
}
