/**
 * @fileoverview CLI Usage Demo - Interactive demonstrations of MPLP CLI
 * @version 1.1.0-beta
 */

import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Interactive CLI Usage Demonstrations
 */
export class CLIUsageDemo {
  private readonly outputDir: string;
  private readonly tempDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'output');
    this.tempDir = path.join(this.outputDir, 'temp');
  }

  /**
   * Run all CLI demos
   */
  public async runAllDemos(): Promise<void> {
    console.log(chalk.blue.bold('🎯 MPLP CLI Interactive Demos'));
    console.log(chalk.gray('Demonstrating CLI commands and workflows\n'));

    await this.ensureDirectories();

    try {
      // Demo 1: Basic template
      await this.demoBasicTemplate();
      
      // Demo 2: Advanced template
      await this.demoAdvancedTemplate();
      
      // Demo 3: Enterprise template
      await this.demoEnterpriseTemplate();
      
      // Demo 4: Code generation
      await this.demoCodeGeneration();
      
      // Demo 5: Development workflow
      await this.demoDevelopmentWorkflow();

      console.log(chalk.green.bold('\n✅ All CLI demos completed successfully!'));

    } catch (error) {
      console.error(chalk.red.bold('❌ Demo failed:'), error);
      throw error;
    }
  }

  /**
   * Demo: Basic template creation
   */
  public async demoBasicTemplate(): Promise<void> {
    console.log(chalk.cyan.bold('\n📦 Demo 1: Basic Template Creation'));
    
    const spinner = ora('Creating basic project...').start();
    const projectName = 'demo-basic-agent';
    const projectPath = path.join(this.tempDir, projectName);

    try {
      // Simulate CLI command: mplp init demo-basic-agent --template basic
      await this.simulateProjectCreation(projectName, 'basic');
      
      spinner.succeed('Basic project created successfully');
      
      // Show project structure
      console.log(chalk.yellow('\n📁 Generated project structure:'));
      await this.displayProjectStructure(projectPath);
      
      // Show key files
      console.log(chalk.yellow('\n📄 Key files generated:'));
      await this.showKeyFiles(projectPath, ['package.json', 'src/index.ts', 'README.md']);

    } catch (error) {
      spinner.fail('Failed to create basic project');
      throw error;
    }
  }

  /**
   * Demo: Advanced template creation
   */
  public async demoAdvancedTemplate(): Promise<void> {
    console.log(chalk.cyan.bold('\n🚀 Demo 2: Advanced Template Creation'));
    
    const spinner = ora('Creating advanced project...').start();
    const projectName = 'demo-advanced-agent';
    const projectPath = path.join(this.tempDir, projectName);

    try {
      // Simulate CLI command: mplp init demo-advanced-agent --template advanced
      await this.simulateProjectCreation(projectName, 'advanced');
      
      spinner.succeed('Advanced project created successfully');
      
      // Show enhanced features
      console.log(chalk.yellow('\n🔧 Advanced features included:'));
      console.log(chalk.gray('  ✓ Multiple specialized agents'));
      console.log(chalk.gray('  ✓ Workflow orchestration'));
      console.log(chalk.gray('  ✓ HTTP API server'));
      console.log(chalk.gray('  ✓ Environment configuration'));
      console.log(chalk.gray('  ✓ Advanced error handling'));
      
      await this.displayProjectStructure(projectPath);

    } catch (error) {
      spinner.fail('Failed to create advanced project');
      throw error;
    }
  }

  /**
   * Demo: Enterprise template creation
   */
  public async demoEnterpriseTemplate(): Promise<void> {
    console.log(chalk.cyan.bold('\n🏢 Demo 3: Enterprise Template Creation'));
    
    const spinner = ora('Creating enterprise project...').start();
    const projectName = 'demo-enterprise-agent';
    const projectPath = path.join(this.tempDir, projectName);

    try {
      // Simulate CLI command: mplp init demo-enterprise-agent --template enterprise
      await this.simulateProjectCreation(projectName, 'enterprise');
      
      spinner.succeed('Enterprise project created successfully');
      
      // Show enterprise features
      console.log(chalk.yellow('\n🏭 Enterprise features included:'));
      console.log(chalk.gray('  ✓ Docker containerization'));
      console.log(chalk.gray('  ✓ Kubernetes deployment'));
      console.log(chalk.gray('  ✓ Monitoring and observability'));
      console.log(chalk.gray('  ✓ Security hardening'));
      console.log(chalk.gray('  ✓ CI/CD pipeline'));
      console.log(chalk.gray('  ✓ Production-ready configuration'));
      
      await this.displayProjectStructure(projectPath);

    } catch (error) {
      spinner.fail('Failed to create enterprise project');
      throw error;
    }
  }

  /**
   * Demo: Code generation
   */
  public async demoCodeGeneration(): Promise<void> {
    console.log(chalk.cyan.bold('\n⚡ Demo 4: Code Generation'));
    
    const projectPath = path.join(this.tempDir, 'demo-advanced-agent');
    
    try {
      // Demo agent generation
      console.log(chalk.yellow('\n🤖 Generating new agent...'));
      await this.simulateCodeGeneration(projectPath, 'agent', 'DataProcessorAgent');
      
      // Demo workflow generation
      console.log(chalk.yellow('\n🔄 Generating workflow...'));
      await this.simulateCodeGeneration(projectPath, 'workflow', 'DataProcessingWorkflow');
      
      // Demo config generation
      console.log(chalk.yellow('\n⚙️ Generating configuration...'));
      await this.simulateCodeGeneration(projectPath, 'config', 'DatabaseConfig');
      
      console.log(chalk.green('✅ Code generation completed'));

    } catch (error) {
      console.error(chalk.red('❌ Code generation failed:'), error);
      throw error;
    }
  }

  /**
   * Demo: Development workflow
   */
  public async demoDevelopmentWorkflow(): Promise<void> {
    console.log(chalk.cyan.bold('\n🔄 Demo 5: Development Workflow'));
    
    const projectPath = path.join(this.tempDir, 'demo-basic-agent');
    
    try {
      // Simulate development commands
      console.log(chalk.yellow('\n📦 Installing dependencies...'));
      await this.simulateCommand('npm install', projectPath);
      
      console.log(chalk.yellow('\n🔍 Running type check...'));
      await this.simulateCommand('npm run typecheck', projectPath);
      
      console.log(chalk.yellow('\n🧪 Running tests...'));
      await this.simulateCommand('npm test', projectPath);
      
      console.log(chalk.yellow('\n🏗️ Building project...'));
      await this.simulateCommand('npm run build', projectPath);
      
      console.log(chalk.green('✅ Development workflow completed'));

    } catch (error) {
      console.error(chalk.red('❌ Development workflow failed:'), error);
      throw error;
    }
  }

  /**
   * Simulate project creation
   */
  private async simulateProjectCreation(projectName: string, template: string): Promise<void> {
    const projectPath = path.join(this.tempDir, projectName);
    
    // Create project directory structure
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create basic structure based on template
    const structure = this.getTemplateStructure(template);
    await this.createProjectStructure(projectPath, structure);
    
    // Create package.json
    const packageJson = this.generatePackageJson(projectName, template);
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create basic files
    await this.createBasicFiles(projectPath, template);
  }

  /**
   * Get template structure
   */
  private getTemplateStructure(template: string): string[] {
    const baseStructure = [
      'src',
      'src/agents',
      'src/types',
      'src/utils',
      'tests',
      'docs'
    ];

    if (template === 'advanced') {
      return [
        ...baseStructure,
        'src/workflows',
        'src/api',
        'src/config',
        'src/middleware'
      ];
    }

    if (template === 'enterprise') {
      return [
        ...baseStructure,
        'src/workflows',
        'src/api',
        'src/config',
        'src/middleware',
        'src/monitoring',
        'src/security',
        'docker',
        'k8s',
        '.github/workflows'
      ];
    }

    return baseStructure;
  }

  /**
   * Create project structure
   */
  private async createProjectStructure(basePath: string, structure: string[]): Promise<void> {
    for (const dir of structure) {
      await fs.mkdir(path.join(basePath, dir), { recursive: true });
    }
  }

  /**
   * Generate package.json for template
   */
  private generatePackageJson(projectName: string, template: string): any {
    const base = {
      name: projectName,
      version: '1.0.0',
      description: `MPLP ${template} template project`,
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        dev: 'ts-node src/index.ts',
        test: 'jest',
        typecheck: 'tsc --noEmit'
      },
      dependencies: {
        '@mplp/sdk-core': '^1.1.0-beta',
        '@mplp/agent-builder': '^1.1.0-beta'
      },
      devDependencies: {
        typescript: '^5.1.0',
        'ts-node': '^10.9.0',
        jest: '^29.6.0',
        '@types/node': '^20.0.0'
      }
    };

    if (template === 'advanced') {
      (base.dependencies as any)['@mplp/orchestrator'] = '^1.1.0-beta';
      (base.dependencies as any)['express'] = '^4.18.0';
    }

    if (template === 'enterprise') {
      (base.dependencies as any)['@mplp/orchestrator'] = '^1.1.0-beta';
      (base.dependencies as any)['express'] = '^4.18.0';
      (base.dependencies as any)['prometheus'] = '^14.0.0';
      (base.dependencies as any)['winston'] = '^3.8.0';
    }

    return base;
  }

  /**
   * Create basic files for template
   */
  private async createBasicFiles(projectPath: string, template: string): Promise<void> {
    // Create index.ts
    const indexContent = this.generateIndexContent(template);
    await fs.writeFile(path.join(projectPath, 'src/index.ts'), indexContent);
    
    // Create README.md
    const readmeContent = this.generateReadmeContent(template);
    await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
    
    // Create tsconfig.json
    const tsconfigContent = this.generateTsconfigContent();
    await fs.writeFile(path.join(projectPath, 'tsconfig.json'), tsconfigContent);
  }

  /**
   * Generate index.ts content
   */
  private generateIndexContent(template: string): string {
    return `/**
 * ${template.charAt(0).toUpperCase() + template.slice(1)} MPLP Agent
 * Generated by MPLP CLI
 */

import { MPLPAgent } from '@mplp/agent-builder';

export class MyAgent extends MPLPAgent {
  constructor() {
    super({
      id: 'my-agent',
      name: 'My ${template.charAt(0).toUpperCase() + template.slice(1)} Agent',
      description: 'A ${template} MPLP agent',
      capabilities: ['task_execution']
    });
  }

  public async execute(action: string, parameters: any): Promise<any> {
    console.log(\`Executing \${action} with parameters:\`, parameters);
    
    // Add your agent logic here
    return {
      success: true,
      result: 'Task completed successfully',
      timestamp: new Date().toISOString()
    };
  }
}

// Export the agent
export default MyAgent;

// CLI entry point
if (require.main === module) {
  const agent = new MyAgent();
  console.log('Agent initialized:', agent.id);
}`;
  }

  /**
   * Generate README.md content
   */
  private generateReadmeContent(template: string): string {
    return `# ${template.charAt(0).toUpperCase() + template.slice(1)} MPLP Agent

This project was generated using the MPLP CLI with the ${template} template.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test
\`\`\`

## Project Structure

- \`src/\` - Source code
- \`tests/\` - Test files
- \`docs/\` - Documentation

## Learn More

- [MPLP Documentation](https://mplp.dev/docs)
- [Agent Builder Guide](https://mplp.dev/docs/agent-builder)
`;
  }

  /**
   * Generate tsconfig.json content
   */
  private generateTsconfigContent(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'commonjs',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    }, null, 2);
  }

  /**
   * Simulate code generation
   */
  private async simulateCodeGeneration(projectPath: string, type: string, name: string): Promise<void> {
    const spinner = ora(`Generating ${type}: ${name}...`).start();
    
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let content = '';
      let filePath = '';
      
      switch (type) {
        case 'agent':
          content = this.generateAgentCode(name);
          filePath = path.join(projectPath, 'src/agents', `${name}.ts`);
          break;
        case 'workflow':
          content = this.generateWorkflowCode(name);
          filePath = path.join(projectPath, 'src/workflows', `${name}.ts`);
          break;
        case 'config':
          content = this.generateConfigCode(name);
          filePath = path.join(projectPath, 'src/config', `${name}.ts`);
          break;
      }
      
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
      
      spinner.succeed(`Generated ${type}: ${name}`);
      console.log(chalk.gray(`  📄 Created: ${path.relative(projectPath, filePath)}`));
      
    } catch (error) {
      spinner.fail(`Failed to generate ${type}: ${name}`);
      throw error;
    }
  }

  /**
   * Generate agent code
   */
  private generateAgentCode(name: string): string {
    return `/**
 * ${name} - Generated by MPLP CLI
 */

import { MPLPAgent } from '@mplp/agent-builder';

export class ${name} extends MPLPAgent {
  constructor() {
    super({
      id: '${name.toLowerCase()}',
      name: '${name}',
      description: 'Auto-generated agent',
      capabilities: ['data_processing']
    });
  }

  public async execute(action: string, parameters: any): Promise<any> {
    // Implement your agent logic here
    return {
      success: true,
      result: \`\${action} completed\`,
      data: parameters
    };
  }
}

export default ${name};`;
  }

  /**
   * Generate workflow code
   */
  private generateWorkflowCode(name: string): string {
    return `/**
 * ${name} - Generated by MPLP CLI
 */

export class ${name} {
  private readonly steps: string[];

  constructor() {
    this.steps = ['initialize', 'process', 'finalize'];
  }

  public async execute(input: any): Promise<any> {
    console.log('Starting workflow:', '${name}');
    
    for (const step of this.steps) {
      await this.executeStep(step, input);
    }
    
    return {
      success: true,
      workflow: '${name}',
      completed: new Date().toISOString()
    };
  }

  private async executeStep(step: string, input: any): Promise<void> {
    console.log(\`Executing step: \${step}\`);
    // Implement step logic here
  }
}

export default ${name};`;
  }

  /**
   * Generate config code
   */
  private generateConfigCode(name: string): string {
    return `/**
 * ${name} - Generated by MPLP CLI
 */

export interface ${name}Options {
  readonly host: string;
  readonly port: number;
  readonly timeout: number;
  readonly retries: number;
}

export class ${name} {
  private readonly options: ${name}Options;

  constructor(options: Partial<${name}Options> = {}) {
    this.options = {
      host: 'localhost',
      port: 5432,
      timeout: 30000,
      retries: 3,
      ...options
    };
  }

  public getOptions(): ${name}Options {
    return { ...this.options };
  }

  public isValid(): boolean {
    return this.options.port > 0 && this.options.timeout > 0;
  }
}

export default ${name};`;
  }

  /**
   * Simulate command execution
   */
  private async simulateCommand(command: string, cwd: string): Promise<void> {
    const spinner = ora(`Running: ${command}`).start();
    
    try {
      // Simulate command execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      spinner.succeed(`Completed: ${command}`);
    } catch (error) {
      spinner.fail(`Failed: ${command}`);
      throw error;
    }
  }

  /**
   * Display project structure
   */
  private async displayProjectStructure(projectPath: string): Promise<void> {
    try {
      const structure = await this.getDirectoryStructure(projectPath);
      console.log(chalk.gray(structure));
    } catch (error) {
      console.log(chalk.gray('  (Structure not available)'));
    }
  }

  /**
   * Get directory structure as string
   */
  private async getDirectoryStructure(dirPath: string, prefix = '', maxDepth = 3, currentDepth = 0): Promise<string> {
    if (currentDepth >= maxDepth) return '';
    
    try {
      const items = await fs.readdir(dirPath);
      let result = '';
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item || item.startsWith('.')) continue;

        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        const isLast = i === items.length - 1;
        const connector = isLast ? '└── ' : '├── ';

        result += `${prefix}${connector}${item}\n`;

        if (stats.isDirectory() && currentDepth < maxDepth - 1) {
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          result += await this.getDirectoryStructure(itemPath, newPrefix, maxDepth, currentDepth + 1);
        }
      }
      
      return result;
    } catch (error) {
      return '';
    }
  }

  /**
   * Show key files content
   */
  private async showKeyFiles(projectPath: string, files: string[]): Promise<void> {
    for (const file of files) {
      try {
        const filePath = path.join(projectPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, 10); // Show first 10 lines
        
        console.log(chalk.cyan(`\n  📄 ${file}:`));
        lines.forEach((line, index) => {
          console.log(chalk.gray(`    ${(index + 1).toString().padStart(2)}: ${line}`));
        });
        
        if (content.split('\n').length > 10) {
          console.log(chalk.gray('    ... (truncated)'));
        }
      } catch (error) {
        console.log(chalk.gray(`  📄 ${file}: (not available)`));
      }
    }
  }

  /**
   * Ensure output directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.tempDir, { recursive: true });
  }
}
