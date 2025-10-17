"use strict";
/**
 * @fileoverview Workflow code generator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowGenerator = void 0;
const CodeGeneratorManager_1 = require("./CodeGeneratorManager");
/**
 * Workflow generator
 */
class WorkflowGenerator extends CodeGeneratorManager_1.BaseGenerator {
    /**
     * Generate workflow files
     */
    async generateFiles(options) {
        const context = this.getContext(options);
        const files = [];
        // Main workflow file
        const workflowTemplate = this.getWorkflowTemplate(options.template);
        const workflowContent = this.renderTemplate(workflowTemplate, context);
        const workflowFilename = `${options.name}.${context.fileExtension}`;
        files.push({
            path: this.getOutputPath(options, workflowFilename),
            content: workflowContent,
            description: `Main workflow implementation`
        });
        // Workflow configuration file if advanced or enterprise
        if (options.template !== 'basic') {
            const configTemplate = this.getWorkflowConfigTemplate(options.template);
            const configContent = this.renderTemplate(configTemplate, context);
            const configFilename = `${options.name}.config.${context.fileExtension}`;
            files.push({
                path: this.getOutputPath(options, configFilename),
                content: configContent,
                description: `Workflow configuration`
            });
        }
        // Types file for TypeScript
        if (options.useTypeScript) {
            const typesTemplate = this.getWorkflowTypesTemplate();
            const typesContent = this.renderTemplate(typesTemplate, context);
            const typesFilename = `${options.name}.types.ts`;
            files.push({
                path: this.getOutputPath(options, typesFilename),
                content: typesContent,
                description: `Workflow type definitions`
            });
        }
        return files;
    }
    /**
     * Generate test files
     */
    async generateTestFiles(options) {
        const context = this.getContext(options);
        const files = [];
        // Main test file
        const testTemplate = this.getWorkflowTestTemplate(options.template);
        const testContent = this.renderTemplate(testTemplate, context);
        const testFilename = `${options.name}.${context.testExtension}`;
        files.push({
            path: this.getTestOutputPath(options, testFilename),
            content: testContent,
            description: `Workflow unit tests`
        });
        return files;
    }
    /**
     * Generate documentation files
     */
    async generateDocumentationFiles(options) {
        const context = this.getContext(options);
        const files = [];
        // README file
        const readmeTemplate = this.getWorkflowReadmeTemplate();
        const readmeContent = this.renderTemplate(readmeTemplate, context);
        files.push({
            path: this.getDocsOutputPath(options, `${options.name}.md`),
            content: readmeContent,
            description: `Workflow documentation`
        });
        return files;
    }
    /**
     * Get workflow template based on complexity
     */
    getWorkflowTemplate(template) {
        switch (template) {
            case 'basic':
                return this.getBasicWorkflowTemplate();
            case 'advanced':
                return this.getAdvancedWorkflowTemplate();
            case 'enterprise':
                return this.getEnterpriseWorkflowTemplate();
            default:
                return this.getBasicWorkflowTemplate();
        }
    }
    /**
     * Get basic workflow template
     */
    getBasicWorkflowTemplate() {
        return `/**
 * @fileoverview {{name}} - {{description}}
 * Generated on {{date}}
 */

import { WorkflowBuilder } from '@mplp/orchestrator';

/**
 * {{name}} workflow implementation
 */
export const {{name}} = WorkflowBuilder.create('{{kebabCaseName}}')
  .withDescription('{{description}}')
{{#steps}}
  .addStep('{{.}}', async (context) => {
    console.log(\`Executing step: {{.}}\`);
    
    // TODO: Implement {{.}} step logic
    return {
      success: true,
      message: 'Step {{.}} completed successfully',
      data: context.data
    };
  })
{{/steps}}
{{^steps}}
  .addStep('initialize', async (context) => {
    console.log('Initializing workflow');
    
    // TODO: Implement initialization logic
    return {
      success: true,
      message: 'Workflow initialized',
      data: { initialized: true }
    };
  })
  .addStep('process', async (context) => {
    console.log('Processing workflow');
    
    // TODO: Implement processing logic
    return {
      success: true,
      message: 'Workflow processed',
      data: { ...context.data, processed: true }
    };
  })
  .addStep('finalize', async (context) => {
    console.log('Finalizing workflow');
    
    // TODO: Implement finalization logic
    return {
      success: true,
      message: 'Workflow finalized',
      data: { ...context.data, finalized: true }
    };
  })
{{/steps}}
  .build();

export default {{name}};
`;
    }
    /**
     * Get advanced workflow template
     */
    getAdvancedWorkflowTemplate() {
        return `/**
 * @fileoverview {{name}} - {{description}}
 * Generated on {{date}}
 */

import { WorkflowBuilder, WorkflowContext, WorkflowResult } from '@mplp/orchestrator';
{{#useTypeScript}}
import { {{name}}Config } from './{{name}}.config';
import { {{name}}Context, {{name}}Result, {{name}}State } from './{{name}}.types';
{{/useTypeScript}}

/**
 * {{name}} workflow implementation
 */
export class {{name}}Workflow {
  private config: {{name}}Config;
  private state: {{name}}State;

  constructor(config?: Partial<{{name}}Config>) {
    this.config = {
      timeout: 300000, // 5 minutes
      retries: 3,
      parallel: false,
      ...config
    };
    
    this.state = {
      currentStep: null,
      completedSteps: [],
      startTime: null,
      endTime: null
    };
  }

  /**
   * Create workflow instance
   */
  public static create(config?: Partial<{{name}}Config>) {
    const workflow = new {{name}}Workflow(config);
    
    const builder = WorkflowBuilder.create('{{kebabCaseName}}')
      .withDescription('{{description}}')
      .withTimeout(workflow.config.timeout)
      .withRetries(workflow.config.retries);

    // Add steps based on configuration
    if (workflow.config.parallel) {
      builder.addParallelSteps([
{{#steps}}
        { name: '{{.}}', handler: (context) => workflow.handle{{.}}(context) },
{{/steps}}
{{^steps}}
        { name: 'initialize', handler: (context) => workflow.handleInitialize(context) },
        { name: 'process', handler: (context) => workflow.handleProcess(context) },
        { name: 'finalize', handler: (context) => workflow.handleFinalize(context) }
{{/steps}}
      ]);
    } else {
{{#steps}}
      builder.addStep('{{.}}', (context) => workflow.handle{{.}}(context));
{{/steps}}
{{^steps}}
      builder.addStep('initialize', (context) => workflow.handleInitialize(context));
      builder.addStep('process', (context) => workflow.handleProcess(context));
      builder.addStep('finalize', (context) => workflow.handleFinalize(context));
{{/steps}}
    }

    return builder.build();
  }

{{#steps}}
  /**
   * Handle {{.}} step
   */
  private async handle{{.}}(context: WorkflowContext): Promise<WorkflowResult> {
    this.state.currentStep = '{{.}}';
    
    try {
      console.log(\`Executing step: {{.}}\`);
      
      // TODO: Implement {{.}} step logic
      const result = await this.process{{.}}(context);
      
      this.state.completedSteps.push('{{.}}');
      
      return {
        success: true,
        message: 'Step {{.}} completed successfully',
        data: result
      };
    } catch (error) {
      console.error(\`Error in step {{.}}:\`, error);
      return {
        success: false,
        message: \`Step {{.}} failed: \${(error as Error).message}\`,
        error: error as Error
      };
    }
  }

  /**
   * Process {{.}} logic
   */
  private async process{{.}}(context: WorkflowContext): Promise<any> {
    // TODO: Implement {{.}} processing logic
    return context.data;
  }

{{/steps}}
{{^steps}}
  /**
   * Handle initialize step
   */
  private async handleInitialize(context: WorkflowContext): Promise<WorkflowResult> {
    this.state.currentStep = 'initialize';
    this.state.startTime = new Date();
    
    try {
      console.log('Initializing workflow');
      
      // TODO: Implement initialization logic
      const result = await this.processInitialize(context);
      
      this.state.completedSteps.push('initialize');
      
      return {
        success: true,
        message: 'Workflow initialized successfully',
        data: result
      };
    } catch (error) {
      console.error('Error in initialization:', error);
      return {
        success: false,
        message: \`Initialization failed: \${(error as Error).message}\`,
        error: error as Error
      };
    }
  }

  /**
   * Process initialize logic
   */
  private async processInitialize(context: WorkflowContext): Promise<any> {
    // TODO: Implement initialization processing logic
    return { ...context.data, initialized: true };
  }

  /**
   * Handle process step
   */
  private async handleProcess(context: WorkflowContext): Promise<WorkflowResult> {
    this.state.currentStep = 'process';
    
    try {
      console.log('Processing workflow');
      
      // TODO: Implement processing logic
      const result = await this.processMain(context);
      
      this.state.completedSteps.push('process');
      
      return {
        success: true,
        message: 'Workflow processed successfully',
        data: result
      };
    } catch (error) {
      console.error('Error in processing:', error);
      return {
        success: false,
        message: \`Processing failed: \${(error as Error).message}\`,
        error: error as Error
      };
    }
  }

  /**
   * Process main logic
   */
  private async processMain(context: WorkflowContext): Promise<any> {
    // TODO: Implement main processing logic
    return { ...context.data, processed: true };
  }

  /**
   * Handle finalize step
   */
  private async handleFinalize(context: WorkflowContext): Promise<WorkflowResult> {
    this.state.currentStep = 'finalize';
    
    try {
      console.log('Finalizing workflow');
      
      // TODO: Implement finalization logic
      const result = await this.processFinalize(context);
      
      this.state.completedSteps.push('finalize');
      this.state.endTime = new Date();
      
      return {
        success: true,
        message: 'Workflow finalized successfully',
        data: result
      };
    } catch (error) {
      console.error('Error in finalization:', error);
      return {
        success: false,
        message: \`Finalization failed: \${(error as Error).message}\`,
        error: error as Error
      };
    }
  }

  /**
   * Process finalize logic
   */
  private async processFinalize(context: WorkflowContext): Promise<any> {
    // TODO: Implement finalization processing logic
    return { ...context.data, finalized: true };
  }
{{/steps}}

  /**
   * Get workflow state
   */
  public getState(): {{name}}State {
    return { ...this.state };
  }
}

// Export default workflow instance
export const {{name}} = {{name}}Workflow.create();
export default {{name}};
`;
    }
    /**
     * Get enterprise workflow template
     */
    getEnterpriseWorkflowTemplate() {
        return `/**
 * @fileoverview {{name}} - {{description}}
 * Generated on {{date}}
 */

import { WorkflowBuilder, WorkflowContext, WorkflowResult } from '@mplp/orchestrator';
import { Logger, Metrics } from '@mplp/sdk-core';
{{#useTypeScript}}
import { {{name}}Config, {{name}}Metrics } from './{{name}}.config';
import { {{name}}Context, {{name}}Result, {{name}}State } from './{{name}}.types';
{{/useTypeScript}}

/**
 * {{name}} enterprise workflow implementation
 */
export class {{name}}Workflow {
  private config: {{name}}Config;
  private logger: Logger;
  private metrics: {{name}}Metrics;
  private state: {{name}}State;

  constructor(config?: Partial<{{name}}Config>) {
    this.config = {
      timeout: 300000, // 5 minutes
      retries: 3,
      parallel: false,
      enableMetrics: true,
      enableLogging: true,
      logLevel: 'info',
      checkpoints: true,
      ...config
    };
    
    this.logger = new Logger({
      level: this.config.logLevel,
      service: '{{kebabCaseName}}-workflow'
    });
    
    this.metrics = {
      executionCount: 0,
      successCount: 0,
      errorCount: 0,
      averageExecutionTime: 0,
      stepMetrics: new Map()
    };
    
    this.state = {
      currentStep: null,
      completedSteps: [],
      startTime: null,
      endTime: null,
      checkpoints: new Map(),
      status: 'idle'
    };
  }

  /**
   * Initialize workflow
   */
  public async initialize(): Promise<void> {
    this.logger.info('Initializing {{name}} workflow');
    
    // TODO: Add initialization logic
    
    this.state.status = 'ready';
    this.logger.info('{{name}} workflow initialized successfully');
  }

  /**
   * Create workflow instance
   */
  public static create(config?: Partial<{{name}}Config>) {
    const workflow = new {{name}}Workflow(config);
    
    const builder = WorkflowBuilder.create('{{kebabCaseName}}')
      .withDescription('{{description}}')
      .withTimeout(workflow.config.timeout)
      .withRetries(workflow.config.retries)
      .withInitializer(() => workflow.initialize());

    // Add error handling
    builder.withErrorHandler((error, context) => workflow.handleError(error, context));
    
    // Add progress tracking
    builder.withProgressHandler((step, progress) => workflow.trackProgress(step, progress));

    // Add steps based on configuration
    if (workflow.config.parallel) {
      builder.addParallelSteps([
{{#steps}}
        { name: '{{.}}', handler: (context) => workflow.handle{{.}}(context) },
{{/steps}}
{{^steps}}
        { name: 'initialize', handler: (context) => workflow.handleInitialize(context) },
        { name: 'process', handler: (context) => workflow.handleProcess(context) },
        { name: 'finalize', handler: (context) => workflow.handleFinalize(context) }
{{/steps}}
      ]);
    } else {
{{#steps}}
      builder.addStep('{{.}}', (context) => workflow.handle{{.}}(context));
{{/steps}}
{{^steps}}
      builder.addStep('initialize', (context) => workflow.handleInitialize(context));
      builder.addStep('process', (context) => workflow.handleProcess(context));
      builder.addStep('finalize', (context) => workflow.handleFinalize(context));
{{/steps}}
    }

    // Add health check and metrics
    builder.withHealthCheck(() => workflow.healthCheck());
    builder.withMetrics(() => workflow.getMetrics());

    return builder.build();
  }

  // ... (继续实现步骤处理方法，类似于advanced模板但增加了企业级功能)

  /**
   * Handle workflow error
   */
  private async handleError(error: Error, context: WorkflowContext): Promise<void> {
    this.metrics.errorCount++;
    this.state.status = 'error';
    
    this.logger.error('Workflow error occurred', {
      error: error.message,
      stack: error.stack,
      step: this.state.currentStep,
      context: context.workflowId
    });
    
    // TODO: Implement error recovery logic
  }

  /**
   * Track workflow progress
   */
  private trackProgress(step: string, progress: number): void {
    this.logger.debug('Workflow progress update', { step, progress });
    
    // Update step metrics
    if (!this.metrics.stepMetrics.has(step)) {
      this.metrics.stepMetrics.set(step, {
        executionCount: 0,
        averageTime: 0,
        successRate: 0
      });
    }
    
    // TODO: Update progress tracking
  }

  /**
   * Health check
   */
  private async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    return {
      healthy: this.state.status !== 'error',
      details: {
        state: this.state,
        metrics: this.metrics
      }
    };
  }

  /**
   * Get metrics
   */
  private getMetrics(): {{name}}Metrics {
    return { ...this.metrics };
  }
}

// Export default workflow instance
export const {{name}} = {{name}}Workflow.create();
export default {{name}};
`;
    }
    /**
     * Get workflow configuration template
     */
    getWorkflowConfigTemplate(template) {
        if (template === 'enterprise') {
            return `/**
 * @fileoverview {{name}} workflow configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
/**
 * {{name}} workflow configuration interface
 */
export interface {{name}}Config {
  timeout: number;
  retries: number;
  parallel: boolean;
  enableMetrics: boolean;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  checkpoints: boolean;
}

/**
 * {{name}} workflow metrics interface
 */
export interface {{name}}Metrics {
  executionCount: number;
  successCount: number;
  errorCount: number;
  averageExecutionTime: number;
  stepMetrics: Map<string, {
    executionCount: number;
    averageTime: number;
    successRate: number;
  }>;
}
{{/useTypeScript}}

/**
 * Default configuration for {{name}} workflow
 */
export const DEFAULT_{{constantName}}_CONFIG{{#useTypeScript}}: {{name}}Config{{/useTypeScript}} = {
  timeout: 300000,
  retries: 3,
  parallel: false,
  enableMetrics: true,
  enableLogging: true,
  logLevel: 'info',
  checkpoints: true
};
`;
        }
        else {
            return `/**
 * @fileoverview {{name}} workflow configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
/**
 * {{name}} workflow configuration interface
 */
export interface {{name}}Config {
  timeout: number;
  retries: number;
  parallel: boolean;
}
{{/useTypeScript}}

/**
 * Default configuration for {{name}} workflow
 */
export const DEFAULT_{{constantName}}_CONFIG{{#useTypeScript}}: {{name}}Config{{/useTypeScript}} = {
  timeout: 300000,
  retries: 3,
  parallel: false
};
`;
        }
    }
    /**
     * Get workflow types template
     */
    getWorkflowTypesTemplate() {
        return `/**
 * @fileoverview {{name}} workflow type definitions
 * Generated on {{date}}
 */

import { WorkflowContext, WorkflowResult } from '@mplp/orchestrator';

/**
 * {{name}} specific context
 */
export interface {{name}}Context extends WorkflowContext {
  // Add workflow-specific context properties here
}

/**
 * {{name}} specific result
 */
export interface {{name}}Result extends WorkflowResult {
  // Add workflow-specific result properties here
}

/**
 * {{name}} workflow state
 */
export interface {{name}}State {
  currentStep: string | null;
  completedSteps: string[];
  startTime: Date | null;
  endTime: Date | null;
  checkpoints?: Map<string, any>;
  status: 'idle' | 'ready' | 'running' | 'completed' | 'error';
}

{{#steps}}
/**
 * {{.}} step parameters
 */
export interface {{.}}Parameters {
  // TODO: Define parameters for {{.}} step
  [key: string]: any;
}

/**
 * {{.}} step result
 */
export interface {{.}}Result {
  // TODO: Define result structure for {{.}} step
  [key: string]: any;
}

{{/steps}}
`;
    }
    /**
     * Get workflow test template
     */
    getWorkflowTestTemplate(template) {
        return `/**
 * @fileoverview Tests for {{name}} workflow
 * Generated on {{date}}
 */

{{#useTypeScript}}
import { {{name}} } from '../{{name}}';
{{/useTypeScript}}

describe('{{name}} Workflow', () => {
  describe('基本功能', () => {
    it('应该创建workflow实例', () => {
      expect({{name}}).toBeDefined();
      expect({{name}}.id).toBe('{{kebabCaseName}}');
    });

    it('应该有正确的描述', () => {
      expect({{name}}.description).toBe('{{description}}');
    });

    it('应该执行完整的workflow', async () => {
      const context = {
        workflowId: '{{kebabCaseName}}-test',
        data: { test: true }
      };

      const result = await {{name}}.execute(context);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('步骤执行', () => {
{{#steps}}
    it('应该执行{{.}}步骤', async () => {
      const context = {
        workflowId: '{{kebabCaseName}}-test',
        data: { step: '{{.}}' }
      };

      // TODO: Test {{.}} step execution
      expect(true).toBe(true);
    });

{{/steps}}
{{^steps}}
    it('应该执行初始化步骤', async () => {
      const context = {
        workflowId: '{{kebabCaseName}}-test',
        data: { step: 'initialize' }
      };

      // TODO: Test initialize step execution
      expect(true).toBe(true);
    });

    it('应该执行处理步骤', async () => {
      const context = {
        workflowId: '{{kebabCaseName}}-test',
        data: { step: 'process' }
      };

      // TODO: Test process step execution
      expect(true).toBe(true);
    });

    it('应该执行完成步骤', async () => {
      const context = {
        workflowId: '{{kebabCaseName}}-test',
        data: { step: 'finalize' }
      };

      // TODO: Test finalize step execution
      expect(true).toBe(true);
    });
{{/steps}}
  });

  describe('错误处理', () => {
    it('应该处理步骤失败', async () => {
      const context = {
        workflowId: '{{kebabCaseName}}-test',
        data: { shouldFail: true }
      };

      // TODO: Test error handling
      expect(true).toBe(true);
    });

    it('应该支持重试机制', async () => {
      const context = {
        workflowId: '{{kebabCaseName}}-test',
        data: { retryTest: true }
      };

      // TODO: Test retry mechanism
      expect(true).toBe(true);
    });
  });

{{#template}}
  describe('配置', () => {
    it('应该使用默认配置', () => {
      // TODO: Test default configuration
      expect(true).toBe(true);
    });

    it('应该接受自定义配置', () => {
      // TODO: Test custom configuration
      expect(true).toBe(true);
    });
  });
{{/template}}
});
`;
    }
    /**
     * Get workflow README template
     */
    getWorkflowReadmeTemplate() {
        return `# {{name}} Workflow

{{description}}

## Overview

The {{name}} workflow executes the following steps:

{{#steps}}
1. **{{.}}**: TODO - Describe {{.}} step
{{/steps}}
{{^steps}}
1. **Initialize**: Initialize workflow execution
2. **Process**: Main processing logic
3. **Finalize**: Cleanup and finalization
{{/steps}}

## Usage

### Basic Usage

\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
import { {{name}} } from './{{name}}';

// Execute workflow
const result = await {{name}}.execute({
  workflowId: '{{kebabCaseName}}-instance',
  data: {
    // Add your input data here
  }
});

console.log(result);
\`\`\`

### Advanced Usage

\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
{{#template}}
import { {{name}}Workflow } from './{{name}}';

// Create workflow with custom configuration
const workflow = {{name}}Workflow.create({
  timeout: 600000, // 10 minutes
  retries: 5,
  parallel: true
});

// Execute the workflow
const result = await workflow.execute(context);
{{/template}}
{{^template}}
// Basic workflow usage
const result = await {{name}}.execute({
  workflowId: '{{kebabCaseName}}-instance',
  data: { /* your data */ }
});
{{/template}}
\`\`\`

## Configuration

{{#template}}
The workflow accepts the following configuration options:

- \`timeout\`: Maximum execution time in milliseconds (default: 300000)
- \`retries\`: Number of retry attempts on failure (default: 3)
- \`parallel\`: Execute steps in parallel when possible (default: false)
{{#template}}
- \`enableMetrics\`: Enable metrics collection (default: true)
- \`enableLogging\`: Enable logging (default: true)
- \`logLevel\`: Logging level (default: 'info')
- \`checkpoints\`: Enable checkpoint saving (default: true)
{{/template}}
{{/template}}
{{^template}}
This is a basic workflow with default configuration.
{{/template}}

## Steps

{{#steps}}
### {{.}}

TODO: Document the {{.}} step

**Input:**
- Add input documentation here

**Output:**
- Add output documentation here

**Example:**
\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
// Step-specific example
\`\`\`

{{/steps}}
{{^steps}}
### Initialize

Initialize the workflow execution.

### Process

Main processing logic of the workflow.

### Finalize

Cleanup and finalization tasks.
{{/steps}}

## Error Handling

The workflow includes comprehensive error handling:

- Automatic retries on transient failures
- Graceful degradation on partial failures
- Detailed error logging and reporting
- Recovery mechanisms for critical failures

## Monitoring

{{#template}}
The workflow provides built-in monitoring capabilities:

- Execution metrics and performance tracking
- Step-by-step progress reporting
- Health checks and status monitoring
- Custom metrics collection
{{/template}}
{{^template}}
Basic execution monitoring is available through the workflow result.
{{/template}}

## Testing

Run the tests for this workflow:

\`\`\`bash
npm test -- {{name}}.test.{{#useTypeScript}}ts{{/useTypeScript}}{{^useTypeScript}}js{{/useTypeScript}}
\`\`\`

## Development

1. Implement the step logic in the workflow file
2. Update the type definitions if using TypeScript
3. Add comprehensive tests for each step
4. Update this documentation

## License

Generated by MPLP CLI on {{date}}
`;
    }
}
exports.WorkflowGenerator = WorkflowGenerator;
//# sourceMappingURL=WorkflowGenerator.js.map