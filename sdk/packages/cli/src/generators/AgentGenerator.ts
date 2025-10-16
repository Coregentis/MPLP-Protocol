/**
 * @fileoverview Agent code generator
 */

import { BaseGenerator, GenerationOptions, GeneratedFile } from './CodeGeneratorManager';

/**
 * Agent generator
 */
export class AgentGenerator extends BaseGenerator {
  /**
   * Generate agent files
   */
  public async generateFiles(options: GenerationOptions): Promise<GeneratedFile[]> {
    const context = this.getContext(options);
    const files: GeneratedFile[] = [];

    // Main agent file
    const agentTemplate = this.getAgentTemplate(options.template);
    const agentContent = this.renderTemplate(agentTemplate, context);
    const agentFilename = `${options.name}.${context.fileExtension}`;
    
    files.push({
      path: this.getOutputPath(options, agentFilename),
      content: agentContent,
      description: `Main agent implementation`
    });

    // Agent configuration file if advanced or enterprise
    if (options.template !== 'basic') {
      const configTemplate = this.getAgentConfigTemplate(options.template);
      const configContent = this.renderTemplate(configTemplate, context);
      const configFilename = `${options.name}.config.${context.fileExtension}`;
      
      files.push({
        path: this.getOutputPath(options, configFilename),
        content: configContent,
        description: `Agent configuration`
      });
    }

    // Types file for TypeScript
    if (options.useTypeScript) {
      const typesTemplate = this.getAgentTypesTemplate();
      const typesContent = this.renderTemplate(typesTemplate, context);
      const typesFilename = `${options.name}.types.ts`;
      
      files.push({
        path: this.getOutputPath(options, typesFilename),
        content: typesContent,
        description: `Agent type definitions`
      });
    }

    return files;
  }

  /**
   * Generate test files
   */
  public async generateTestFiles(options: GenerationOptions): Promise<GeneratedFile[]> {
    const context = this.getContext(options);
    const files: GeneratedFile[] = [];

    // Main test file
    const testTemplate = this.getAgentTestTemplate(options.template);
    const testContent = this.renderTemplate(testTemplate, context);
    const testFilename = `${options.name}.${context.testExtension}`;
    
    files.push({
      path: this.getTestOutputPath(options, testFilename),
      content: testContent,
      description: `Agent unit tests`
    });

    return files;
  }

  /**
   * Generate documentation files
   */
  public async generateDocumentationFiles(options: GenerationOptions): Promise<GeneratedFile[]> {
    const context = this.getContext(options);
    const files: GeneratedFile[] = [];

    // README file
    const readmeTemplate = this.getAgentReadmeTemplate();
    const readmeContent = this.renderTemplate(readmeTemplate, context);
    
    files.push({
      path: this.getDocsOutputPath(options, `${options.name}.md`),
      content: readmeContent,
      description: `Agent documentation`
    });

    return files;
  }

  /**
   * Get agent template based on complexity
   */
  private getAgentTemplate(template: string): string {
    switch (template) {
      case 'basic':
        return this.getBasicAgentTemplate();
      case 'advanced':
        return this.getAdvancedAgentTemplate();
      case 'enterprise':
        return this.getEnterpriseAgentTemplate();
      default:
        return this.getBasicAgentTemplate();
    }
  }

  /**
   * Get basic agent template
   */
  private getBasicAgentTemplate(): string {
    return `/**
 * @fileoverview {{name}} - {{description}}
 * Generated on {{date}}
 */

import { AgentBuilder } from '@mplp/agent-builder';

/**
 * {{name}} agent implementation
 */
export const {{name}} = AgentBuilder.create('{{kebabCaseName}}')
  .withDescription('{{description}}')
{{#capabilities}}
  .withCapability('{{.}}', async (context) => {
    // TODO: Implement {{.}} capability
    console.log(\`Executing {{.}} capability for agent \${context.agentId}\`);
    
    // Add your implementation here
    return {
      success: true,
      message: \`{{.}} capability executed successfully\`,
      data: context.parameters
    };
  })
{{/capabilities}}
{{^capabilities}}
  .withCapability('execute', async (context) => {
    // TODO: Implement main capability
    console.log(\`Executing main capability for agent \${context.agentId}\`);
    
    // Add your implementation here
    return {
      success: true,
      message: 'Agent executed successfully',
      data: context.parameters
    };
  })
{{/capabilities}}
  .build();

export default {{name}};
`;
  }

  /**
   * Get advanced agent template
   */
  private getAdvancedAgentTemplate(): string {
    return `/**
 * @fileoverview {{name}} - {{description}}
 * Generated on {{date}}
 */

import { AgentBuilder, AgentContext, AgentResult } from '@mplp/agent-builder';
{{#useTypeScript}}
import { {{name}}Config, {{name}}Capabilities } from './{{name}}.config';
import { {{name}}Context, {{name}}Result } from './{{name}}.types';
{{/useTypeScript}}

/**
 * {{name}} agent implementation
 */
export class {{name}}Agent {
  private config: {{name}}Config;

  constructor(config?: Partial<{{name}}Config>) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config
    };
  }

  /**
   * Create agent instance
   */
  public static create(config?: Partial<{{name}}Config>) {
    const agent = new {{name}}Agent(config);
    
    return AgentBuilder.create('{{kebabCaseName}}')
      .withDescription('{{description}}')
      .withTimeout(agent.config.timeout)
      .withRetries(agent.config.retries)
{{#capabilities}}
      .withCapability('{{.}}', (context) => agent.handle{{.}}(context))
{{/capabilities}}
{{^capabilities}}
      .withCapability('execute', (context) => agent.handleExecute(context))
{{/capabilities}}
      .build();
  }

{{#capabilities}}
  /**
   * Handle {{.}} capability
   */
  private async handle{{.}}(context: AgentContext): Promise<AgentResult> {
    try {
      console.log(\`Executing {{.}} capability for agent \${context.agentId}\`);
      
      // TODO: Implement {{.}} capability logic
      const result = await this.process{{.}}(context);
      
      return {
        success: true,
        message: \`{{.}} capability executed successfully\`,
        data: result
      };
    } catch (error) {
      console.error(\`Error in {{.}} capability:\`, error);
      return {
        success: false,
        message: \`{{.}} capability failed: \${(error as Error).message}\`,
        error: error as Error
      };
    }
  }

  /**
   * Process {{.}} logic
   */
  private async process{{.}}(context: AgentContext): Promise<any> {
    // TODO: Implement {{.}} processing logic
    return context.parameters;
  }

{{/capabilities}}
{{^capabilities}}
  /**
   * Handle main execution capability
   */
  private async handleExecute(context: AgentContext): Promise<AgentResult> {
    try {
      console.log(\`Executing main capability for agent \${context.agentId}\`);
      
      // TODO: Implement main execution logic
      const result = await this.processExecution(context);
      
      return {
        success: true,
        message: 'Agent executed successfully',
        data: result
      };
    } catch (error) {
      console.error('Error in main execution:', error);
      return {
        success: false,
        message: \`Execution failed: \${(error as Error).message}\`,
        error: error as Error
      };
    }
  }

  /**
   * Process main execution logic
   */
  private async processExecution(context: AgentContext): Promise<any> {
    // TODO: Implement main processing logic
    return context.parameters;
  }
{{/capabilities}}
}

// Export default agent instance
export const {{name}} = {{name}}Agent.create();
export default {{name}};
`;
  }

  /**
   * Get enterprise agent template
   */
  private getEnterpriseAgentTemplate(): string {
    return `/**
 * @fileoverview {{name}} - {{description}}
 * Generated on {{date}}
 */

import { AgentBuilder, AgentContext, AgentResult } from '@mplp/agent-builder';
import { Logger } from '@mplp/sdk-core';
{{#useTypeScript}}
import { {{name}}Config, {{name}}Metrics } from './{{name}}.config';
import { {{name}}Context, {{name}}Result, {{name}}State } from './{{name}}.types';
{{/useTypeScript}}

/**
 * {{name}} enterprise agent implementation
 */
export class {{name}}Agent {
  private config: {{name}}Config;
  private logger: Logger;
  private metrics: {{name}}Metrics;
  private state: {{name}}State;

  constructor(config?: Partial<{{name}}Config>) {
    this.config = {
      timeout: 30000,
      retries: 3,
      enableMetrics: true,
      enableLogging: true,
      logLevel: 'info',
      ...config
    };
    
    this.logger = new Logger({
      level: this.config.logLevel,
      service: '{{kebabCaseName}}-agent'
    });
    
    this.metrics = {
      executionCount: 0,
      successCount: 0,
      errorCount: 0,
      averageExecutionTime: 0
    };
    
    this.state = {
      initialized: false,
      lastExecution: null,
      status: 'idle'
    };
  }

  /**
   * Initialize agent
   */
  public async initialize(): Promise<void> {
    this.logger.info('Initializing {{name}} agent');
    
    // TODO: Add initialization logic
    
    this.state.initialized = true;
    this.state.status = 'ready';
    
    this.logger.info('{{name}} agent initialized successfully');
  }

  /**
   * Create agent instance
   */
  public static create(config?: Partial<{{name}}Config>) {
    const agent = new {{name}}Agent(config);
    
    return AgentBuilder.create('{{kebabCaseName}}')
      .withDescription('{{description}}')
      .withTimeout(agent.config.timeout)
      .withRetries(agent.config.retries)
      .withInitializer(() => agent.initialize())
{{#capabilities}}
      .withCapability('{{.}}', (context) => agent.handle{{.}}(context))
{{/capabilities}}
{{^capabilities}}
      .withCapability('execute', (context) => agent.handleExecute(context))
{{/capabilities}}
      .withHealthCheck(() => agent.healthCheck())
      .withMetrics(() => agent.getMetrics())
      .build();
  }

{{#capabilities}}
  /**
   * Handle {{.}} capability
   */
  private async handle{{.}}(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    this.metrics.executionCount++;
    
    try {
      this.logger.info(\`Executing {{.}} capability\`, { agentId: context.agentId });
      this.state.status = 'executing';
      
      // TODO: Implement {{.}} capability logic
      const result = await this.process{{.}}(context);
      
      this.metrics.successCount++;
      this.state.status = 'ready';
      this.state.lastExecution = new Date();
      
      const executionTime = Date.now() - startTime;
      this.updateAverageExecutionTime(executionTime);
      
      this.logger.info(\`{{.}} capability completed\`, { 
        executionTime,
        success: true 
      });
      
      return {
        success: true,
        message: \`{{.}} capability executed successfully\`,
        data: result,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this.metrics.errorCount++;
      this.state.status = 'error';
      
      this.logger.error(\`Error in {{.}} capability\`, { 
        error: (error as Error).message,
        stack: (error as Error).stack 
      });
      
      return {
        success: false,
        message: \`{{.}} capability failed: \${(error as Error).message}\`,
        error: error as Error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Process {{.}} logic
   */
  private async process{{.}}(context: AgentContext): Promise<any> {
    // TODO: Implement {{.}} processing logic
    return context.parameters;
  }

{{/capabilities}}
{{^capabilities}}
  /**
   * Handle main execution capability
   */
  private async handleExecute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    this.metrics.executionCount++;
    
    try {
      this.logger.info('Executing main capability', { agentId: context.agentId });
      this.state.status = 'executing';
      
      // TODO: Implement main execution logic
      const result = await this.processExecution(context);
      
      this.metrics.successCount++;
      this.state.status = 'ready';
      this.state.lastExecution = new Date();
      
      const executionTime = Date.now() - startTime;
      this.updateAverageExecutionTime(executionTime);
      
      this.logger.info('Main capability completed', { 
        executionTime,
        success: true 
      });
      
      return {
        success: true,
        message: 'Agent executed successfully',
        data: result,
        metadata: {
          executionTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this.metrics.errorCount++;
      this.state.status = 'error';
      
      this.logger.error('Error in main execution', { 
        error: (error as Error).message,
        stack: (error as Error).stack 
      });
      
      return {
        success: false,
        message: \`Execution failed: \${(error as Error).message}\`,
        error: error as Error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Process main execution logic
   */
  private async processExecution(context: AgentContext): Promise<any> {
    // TODO: Implement main processing logic
    return context.parameters;
  }
{{/capabilities}}

  /**
   * Health check
   */
  private async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    return {
      healthy: this.state.initialized && this.state.status !== 'error',
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

  /**
   * Update average execution time
   */
  private updateAverageExecutionTime(executionTime: number): void {
    const totalExecutions = this.metrics.executionCount;
    const currentAverage = this.metrics.averageExecutionTime;
    
    this.metrics.averageExecutionTime = 
      (currentAverage * (totalExecutions - 1) + executionTime) / totalExecutions;
  }
}

// Export default agent instance
export const {{name}} = {{name}}Agent.create();
export default {{name}};
`;
  }

  /**
   * Get agent configuration template
   */
  private getAgentConfigTemplate(template: string): string {
    if (template === 'enterprise') {
      return `/**
 * @fileoverview {{name}} agent configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
/**
 * {{name}} agent configuration interface
 */
export interface {{name}}Config {
  timeout: number;
  retries: number;
  enableMetrics: boolean;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * {{name}} agent metrics interface
 */
export interface {{name}}Metrics {
  executionCount: number;
  successCount: number;
  errorCount: number;
  averageExecutionTime: number;
}

/**
 * {{name}} agent capabilities
 */
export type {{name}}Capabilities = {{#capabilities}}'{{.}}'{{#unless @last}} | {{/unless}}{{/capabilities}}{{^capabilities}}'execute'{{/capabilities}};
{{/useTypeScript}}

/**
 * Default configuration for {{name}} agent
 */
export const DEFAULT_{{constantName}}_CONFIG{{#useTypeScript}}: {{name}}Config{{/useTypeScript}} = {
  timeout: 30000,
  retries: 3,
  enableMetrics: true,
  enableLogging: true,
  logLevel: 'info'
};
`;
    } else {
      return `/**
 * @fileoverview {{name}} agent configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
/**
 * {{name}} agent configuration interface
 */
export interface {{name}}Config {
  timeout: number;
  retries: number;
}

/**
 * {{name}} agent capabilities
 */
export type {{name}}Capabilities = {{#capabilities}}'{{.}}'{{#unless @last}} | {{/unless}}{{/capabilities}}{{^capabilities}}'execute'{{/capabilities}};
{{/useTypeScript}}

/**
 * Default configuration for {{name}} agent
 */
export const DEFAULT_{{constantName}}_CONFIG{{#useTypeScript}}: {{name}}Config{{/useTypeScript}} = {
  timeout: 30000,
  retries: 3
};
`;
    }
  }

  /**
   * Get agent types template
   */
  private getAgentTypesTemplate(): string {
    return `/**
 * @fileoverview {{name}} agent type definitions
 * Generated on {{date}}
 */

import { AgentContext, AgentResult } from '@mplp/agent-builder';

/**
 * {{name}} specific context
 */
export interface {{name}}Context extends AgentContext {
  // Add agent-specific context properties here
}

/**
 * {{name}} specific result
 */
export interface {{name}}Result extends AgentResult {
  // Add agent-specific result properties here
}

/**
 * {{name}} agent state
 */
export interface {{name}}State {
  initialized: boolean;
  lastExecution: Date | null;
  status: 'idle' | 'ready' | 'executing' | 'error';
}

{{#capabilities}}
/**
 * {{.}} capability parameters
 */
export interface {{.}}Parameters {
  // TODO: Define parameters for {{.}} capability
  [key: string]: any;
}

/**
 * {{.}} capability result
 */
export interface {{.}}Result {
  // TODO: Define result structure for {{.}} capability
  [key: string]: any;
}

{{/capabilities}}
`;
  }

  /**
   * Get agent test template
   */
  private getAgentTestTemplate(template: string): string {
    return `/**
 * @fileoverview Tests for {{name}} agent
 * Generated on {{date}}
 */

{{#useTypeScript}}
import { {{name}} } from '../{{name}}';
{{/useTypeScript}}

describe('{{name}} Agent', () => {
  describe('基本功能', () => {
    it('应该创建agent实例', () => {
      expect({{name}}).toBeDefined();
      expect({{name}}.id).toBe('{{kebabCaseName}}');
    });

    it('应该有正确的描述', () => {
      expect({{name}}.description).toBe('{{description}}');
    });

{{#capabilities}}
    it('应该有{{.}}能力', async () => {
      const context = {
        agentId: '{{kebabCaseName}}',
        parameters: { test: true }
      };

      const result = await {{name}}.execute('{{.}}', context);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

{{/capabilities}}
{{^capabilities}}
    it('应该执行主要功能', async () => {
      const context = {
        agentId: '{{kebabCaseName}}',
        parameters: { test: true }
      };

      const result = await {{name}}.execute('execute', context);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
{{/capabilities}}
  });

  describe('错误处理', () => {
    it('应该处理无效参数', async () => {
      const context = {
        agentId: '{{kebabCaseName}}',
        parameters: null
      };

      const result = await {{name}}.execute('{{#capabilities}}{{.}}{{/capabilities}}{{^capabilities}}execute{{/capabilities}}', context);
      
      // Should handle gracefully
      expect(result).toBeDefined();
    });

    it('应该处理未知能力', async () => {
      const context = {
        agentId: '{{kebabCaseName}}',
        parameters: {}
      };

      await expect({{name}}.execute('unknown-capability', context))
        .rejects.toThrow();
    });
  });

{{#template}}
  describe('配置', () => {
    it('应该使用默认配置', () => {
      const agent = {{name}}Agent.create();
      expect(agent).toBeDefined();
    });

    it('应该接受自定义配置', () => {
      const customConfig = {
        timeout: 60000,
        retries: 5
      };
      
      const agent = {{name}}Agent.create(customConfig);
      expect(agent).toBeDefined();
    });
  });

{{#template}}
  describe('健康检查', () => {
    it('应该返回健康状态', async () => {
      const health = await {{name}}.healthCheck();
      
      expect(health).toBeDefined();
      expect(health.healthy).toBe(true);
    });
  });

  describe('指标', () => {
    it('应该提供执行指标', () => {
      const metrics = {{name}}.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.executionCount).toBe('number');
    });
  });
{{/template}}
{{/template}}
});
`;
  }

  /**
   * Get agent README template
   */
  private getAgentReadmeTemplate(): string {
    return `# {{name}} Agent

{{description}}

## Overview

The {{name}} agent provides the following capabilities:

{{#capabilities}}
- **{{.}}**: TODO - Describe {{.}} capability
{{/capabilities}}
{{^capabilities}}
- **execute**: Main execution capability
{{/capabilities}}

## Usage

### Basic Usage

\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
import { {{name}} } from './{{name}}';

// Execute agent capability
const result = await {{name}}.execute('{{#capabilities}}{{.}}{{/capabilities}}{{^capabilities}}execute{{/capabilities}}', {
  agentId: '{{kebabCaseName}}',
  parameters: {
    // Add your parameters here
  }
});

console.log(result);
\`\`\`

### Advanced Usage

\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
{{#template}}
import { {{name}}Agent } from './{{name}}';

// Create agent with custom configuration
const agent = {{name}}Agent.create({
  timeout: 60000,
  retries: 5
});

// Use the agent
const result = await agent.execute('{{#capabilities}}{{.}}{{/capabilities}}{{^capabilities}}execute{{/capabilities}}', context);
{{/template}}
{{^template}}
// Basic agent usage
const result = await {{name}}.execute('{{#capabilities}}{{.}}{{/capabilities}}{{^capabilities}}execute{{/capabilities}}', {
  agentId: '{{kebabCaseName}}',
  parameters: { /* your parameters */ }
});
{{/template}}
\`\`\`

## Configuration

{{#template}}
The agent accepts the following configuration options:

- \`timeout\`: Maximum execution time in milliseconds (default: 30000)
- \`retries\`: Number of retry attempts on failure (default: 3)
{{#template}}
- \`enableMetrics\`: Enable metrics collection (default: true)
- \`enableLogging\`: Enable logging (default: true)
- \`logLevel\`: Logging level (default: 'info')
{{/template}}
{{/template}}
{{^template}}
This is a basic agent with default configuration.
{{/template}}

## Capabilities

{{#capabilities}}
### {{.}}

TODO: Document the {{.}} capability

**Parameters:**
- Add parameter documentation here

**Returns:**
- Add return value documentation here

**Example:**
\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
const result = await {{name}}.execute('{{.}}', {
  agentId: '{{kebabCaseName}}',
  parameters: {
    // Add example parameters
  }
});
\`\`\`

{{/capabilities}}
{{^capabilities}}
### execute

Main execution capability for the agent.

**Parameters:**
- Add parameter documentation here

**Returns:**
- Add return value documentation here

**Example:**
\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
const result = await {{name}}.execute('execute', {
  agentId: '{{kebabCaseName}}',
  parameters: {
    // Add example parameters
  }
});
\`\`\`
{{/capabilities}}

## Testing

Run the tests for this agent:

\`\`\`bash
npm test -- {{name}}.test.{{#useTypeScript}}ts{{/useTypeScript}}{{^useTypeScript}}js{{/useTypeScript}}
\`\`\`

## Development

1. Implement the capability logic in the agent file
2. Update the type definitions if using TypeScript
3. Add comprehensive tests
4. Update this documentation

## License

Generated by MPLP CLI on {{date}}
`;
  }
}
