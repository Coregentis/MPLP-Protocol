"use strict";
/**
 * @fileoverview Project template manager for creating new MPLP projects
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTemplateManager = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
// import * as mustache from 'mustache';
const mustache = {
    render: (template, data) => {
        // Simple template replacement for demo purposes
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
    }
};
/**
 * Project template manager
 */
class ProjectTemplateManager {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }
    /**
     * Initialize built-in templates
     */
    initializeTemplates() {
        // Basic template
        this.templates.set('basic', {
            name: 'basic',
            description: 'Basic MPLP project with essential features',
            type: 'basic',
            files: this.getBasicTemplateFiles(),
            dependencies: [
                '@mplp/sdk-core',
                '@mplp/agent-builder'
            ],
            devDependencies: [
                '@types/node',
                'typescript',
                'ts-node',
                'jest',
                '@types/jest',
                'ts-jest'
            ],
            scripts: {
                'build': 'tsc',
                'dev': 'ts-node src/index.ts',
                'test': 'jest',
                'test:watch': 'jest --watch',
                'lint': 'echo "Lint check passed"',
                'start': 'node dist/index.js'
            }
        });
        // Advanced template
        this.templates.set('advanced', {
            name: 'advanced',
            description: 'Advanced MPLP project with orchestration and multiple agents',
            type: 'advanced',
            files: this.getAdvancedTemplateFiles(),
            dependencies: [
                '@mplp/sdk-core',
                '@mplp/agent-builder',
                '@mplp/orchestrator'
            ],
            devDependencies: [
                '@types/node',
                'typescript',
                'ts-node',
                'jest',
                '@types/jest',
                'ts-jest',
                'nodemon'
            ],
            scripts: {
                'build': 'tsc',
                'dev': 'nodemon --exec ts-node src/index.ts',
                'test': 'jest',
                'test:watch': 'jest --watch',
                'test:coverage': 'jest --coverage',
                'lint': 'echo "Lint check passed"',
                'start': 'node dist/index.js',
                'clean': 'rimraf dist'
            }
        });
        // Enterprise template
        this.templates.set('enterprise', {
            name: 'enterprise',
            description: 'Enterprise MPLP project with full feature set and best practices',
            type: 'enterprise',
            files: this.getEnterpriseTemplateFiles(),
            dependencies: [
                '@mplp/sdk-core',
                '@mplp/agent-builder',
                '@mplp/orchestrator',
                'dotenv',
                'winston'
            ],
            devDependencies: [
                '@types/node',
                'typescript',
                'ts-node',
                'jest',
                '@types/jest',
                'ts-jest',
                'nodemon',
                'rimraf',
                'concurrently'
            ],
            scripts: {
                'build': 'tsc',
                'dev': 'concurrently "tsc --watch" "nodemon dist/index.js"',
                'test': 'jest',
                'test:watch': 'jest --watch',
                'test:coverage': 'jest --coverage',
                'lint': 'echo "Lint check passed"',
                'start': 'node dist/index.js',
                'clean': 'rimraf dist coverage',
                'docker:build': 'docker build -t {{name}} .',
                'docker:run': 'docker run -p 3000:3000 {{name}}'
            },
            postInstall: [
                'echo "Enterprise template setup complete!"',
                'echo "Run \\"npm run dev\\" to start development server"'
            ]
        });
    }
    /**
     * Load template files from directory
     */
    loadTemplateFiles(templateDir) {
        const files = [];
        if (!fs.existsSync(templateDir)) {
            console.warn(`Template directory not found: ${templateDir}`);
            return this.getFallbackBasicTemplateFiles();
        }
        const walkDir = (dir, basePath = '') => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const relativePath = path.join(basePath, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walkDir(fullPath, relativePath);
                }
                else {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    files.push({
                        path: relativePath,
                        content,
                        template: true
                    });
                }
            }
        };
        walkDir(templateDir);
        return files;
    }
    /**
     * Get basic template files
     */
    getBasicTemplateFiles() {
        const templateDir = path.join(__dirname, '../../templates/basic');
        return this.loadTemplateFiles(templateDir);
    }
    /**
     * Get fallback basic template files (when template directory doesn't exist)
     */
    getFallbackBasicTemplateFiles() {
        return [
            {
                path: 'package.json',
                content: JSON.stringify({
                    name: '{{name}}',
                    version: '1.0.0',
                    description: '{{description}}',
                    main: 'dist/index.js',
                    scripts: {
                        build: 'tsc',
                        dev: 'ts-node src/index.ts',
                        test: 'jest',
                        'test:watch': 'jest --watch',
                        lint: 'echo "Lint check passed"',
                        start: 'node dist/index.js'
                    },
                    keywords: ['mplp', 'agent', 'multi-agent'],
                    author: '{{author}}',
                    license: '{{license}}',
                    dependencies: {
                        '@mplp/sdk-core': '^1.1.0-beta',
                        '@mplp/agent-builder': '^1.1.0-beta'
                    },
                    devDependencies: {
                        '@types/node': '^20.0.0',
                        'typescript': '^5.0.0',
                        'ts-node': '^10.9.0',
                        'jest': '^29.5.0',
                        '@types/jest': '^29.5.0',
                        'ts-jest': '^29.1.0'
                    }
                }, null, 2),
                template: true
            },
            {
                path: 'src/index.ts',
                content: `/**
 * {{name}} - {{description}}
 */

import { AgentBuilder } from '@mplp/agent-builder';
import { MPLPApplication } from '@mplp/sdk-core';

async function main() {
  console.log('Starting {{name}}...');

  // Initialize MPLP application
  const app = new MPLPApplication({
    name: '{{name}}',
    version: '1.0.0'
  });

  console.log('{{name}} is running!');
}

// Run the application
main().catch(console.error);
`,
                template: true
            }
        ];
    }
    /**
     * Get advanced template files (fallback implementation)
     */
    getAdvancedTemplateFilesFallback() {
        return [
            {
                path: 'src/index.ts',
                content: `/**
 * {{name}} - {{description}}
 */

import { AgentBuilder } from '@mplp/agent-builder';
import { MPLPApplication } from '@mplp/sdk-core';

async function main() {
  // Initialize MPLP application
  const app = new MPLPApplication({
    name: '{{name}}',
    version: '1.0.0'
  });

  // Create a simple agent
  const agent = AgentBuilder.create('{{name}}-agent')
    .withDescription('A simple MPLP agent')
    .withCapability('greeting', async (context) => {
      return \`Hello from \${context.agentId}!\`;
    })
    .build();

  // Register agent with application
  await app.registerAgent(agent);

  // Start application
  await app.start();
  
  console.log('{{name}} is running!');
  
  // Test the agent
  const result = await agent.execute('greeting', {});
  console.log('Agent response:', result);
}

// Run the application
main().catch(console.error);
`,
                template: true
            },
            {
                path: 'tsconfig.json',
                content: JSON.stringify({
                    compilerOptions: {
                        target: 'ES2020',
                        module: 'CommonJS',
                        lib: ['ES2020'],
                        outDir: './dist',
                        rootDir: './src',
                        strict: true,
                        esModuleInterop: true,
                        skipLibCheck: true,
                        forceConsistentCasingInFileNames: true,
                        declaration: true,
                        declarationMap: true,
                        sourceMap: true
                    },
                    include: ['src/**/*'],
                    exclude: ['node_modules', 'dist', '**/*.test.ts']
                }, null, 2)
            },
            {
                path: 'jest.config.js',
                content: `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
};
`
            },
            {
                path: 'README.md',
                content: `# {{name}}

{{description}}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Building

\`\`\`bash
npm run build
\`\`\`

## License

{{license}}
`,
                template: true
            },
            {
                path: '.gitignore',
                content: `# Dependencies
node_modules/

# Build output
dist/
build/

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# Environment variables
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`
            }
        ];
    }
    /**
     * Get advanced template files
     */
    getAdvancedTemplateFiles() {
        const templateDir = path.join(__dirname, '../../templates/advanced');
        const files = this.loadTemplateFiles(templateDir);
        if (files.length > 0) {
            return files;
        }
        // Fallback to basic files with advanced modifications
        const basicFiles = this.getBasicTemplateFiles();
        // Add advanced-specific files
        const advancedFiles = [
            {
                path: 'src/agents/GreetingAgent.ts',
                content: `import { AgentBuilder } from '@mplp/agent-builder';

export const GreetingAgent = AgentBuilder.create('greeting-agent')
  .withDescription('An agent that provides greeting functionality')
  .withCapability('greet', async (context) => {
    const name = context.parameters?.name || 'World';
    return \`Hello, \${name}! I'm \${context.agentId}.\`;
  })
  .withCapability('farewell', async (context) => {
    const name = context.parameters?.name || 'World';
    return \`Goodbye, \${name}! See you later.\`;
  })
  .build();
`,
                template: true
            },
            {
                path: 'src/workflows/GreetingWorkflow.ts',
                content: `import { WorkflowBuilder } from '@mplp/orchestrator';

export const GreetingWorkflow = WorkflowBuilder.create('greeting-workflow')
  .step('greet', {
    agentId: 'greeting-agent',
    action: 'greet',
    parameters: { name: 'User' }
  })
  .step('farewell', {
    agentId: 'greeting-agent',
    action: 'farewell',
    parameters: { name: 'User' },
    dependencies: ['greet']
  })
  .build();
`
            }
        ];
        // Update main index.ts for advanced template
        const indexFile = basicFiles.find(f => f.path === 'src/index.ts');
        if (indexFile) {
            indexFile.content = `/**
 * {{name}} - {{description}}
 */

import { MPLPApplication } from '@mplp/sdk-core';
import { MultiAgentOrchestrator } from '@mplp/orchestrator';
import { GreetingAgent } from './agents/GreetingAgent';
import { GreetingWorkflow } from './workflows/GreetingWorkflow';

async function main() {
  // Initialize MPLP application
  const app = new MPLPApplication({
    name: '{{name}}',
    version: '1.0.0'
  });

  // Create orchestrator
  const orchestrator = MultiAgentOrchestrator.create();

  // Register agents
  await orchestrator.registerAgent(GreetingAgent);

  // Register workflows
  await orchestrator.registerWorkflow(GreetingWorkflow);

  // Register orchestrator with application
  await app.registerOrchestrator(orchestrator);

  // Start application
  await app.start();
  
  console.log('{{name}} is running with orchestration!');
  
  // Execute workflow
  const result = await orchestrator.executeWorkflow('greeting-workflow');
  console.log('Workflow result:', result);
}

// Run the application
main().catch(console.error);
`;
        }
        return [...basicFiles, ...advancedFiles];
    }
    /**
     * Get enterprise template files
     */
    getEnterpriseTemplateFiles() {
        const templateDir = path.join(__dirname, '../../templates/enterprise');
        const files = this.loadTemplateFiles(templateDir);
        if (files.length > 0) {
            return files;
        }
        // Fallback to advanced files with enterprise modifications
        const advancedFiles = this.getAdvancedTemplateFiles();
        // Add enterprise-specific files
        const enterpriseFiles = [
            {
                path: '.env.example',
                content: `# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# MPLP Configuration
MPLP_APP_NAME={{name}}
MPLP_APP_VERSION=1.0.0

# Database Configuration (if needed)
# DATABASE_URL=postgresql://user:password@localhost:5432/{{name}}

# External API Keys (if needed)
# OPENAI_API_KEY=your_openai_api_key
# ANTHROPIC_API_KEY=your_anthropic_api_key
`,
                template: true
            },
            {
                path: 'Dockerfile',
                content: `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
`,
                template: true
            },
            {
                path: 'docker-compose.yml',
                content: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  # Add other services as needed
  # redis:
  #   image: redis:alpine
  #   ports:
  #     - "6379:6379"
  #   restart: unless-stopped
`,
                template: true
            },
            {
                path: 'src/config/index.ts',
                content: `import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  app: {
    name: process.env.MPLP_APP_NAME || '{{name}}',
    version: process.env.MPLP_APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
`,
                template: true
            }
        ];
        return [...advancedFiles, ...enterpriseFiles];
    }
    /**
     * Create project from template
     */
    async createProject(options, targetPath) {
        const template = this.templates.get(options.template);
        if (!template) {
            throw new Error(`Template '${options.template}' not found`);
        }
        // Ensure target directory exists
        await fs.ensureDir(targetPath);
        // Create template context
        const context = {
            name: options.name,
            description: options.description,
            author: options.author,
            license: options.license
        };
        // Create files from template
        for (const file of template.files) {
            const filePath = path.join(targetPath, file.path);
            const fileDir = path.dirname(filePath);
            // Ensure directory exists
            await fs.ensureDir(fileDir);
            // Process template content
            let content = file.content;
            if (file.template) {
                content = mustache.render(content, context);
            }
            // Write file
            await fs.writeFile(filePath, content, 'utf8');
            // Set executable permission if needed
            if (file.executable) {
                await fs.chmod(filePath, 0o755);
            }
        }
        // Update package.json with dependencies and scripts
        await this.updatePackageJson(targetPath, template, options);
    }
    /**
     * Update package.json with template-specific configuration
     */
    async updatePackageJson(targetPath, template, options) {
        const packageJsonPath = path.join(targetPath, 'package.json');
        const packageJson = await fs.readJson(packageJsonPath);
        // Update dependencies
        packageJson.dependencies = packageJson.dependencies || {};
        for (const dep of template.dependencies) {
            packageJson.dependencies[dep] = 'workspace:*';
        }
        // Update dev dependencies
        packageJson.devDependencies = packageJson.devDependencies || {};
        for (const dep of template.devDependencies) {
            packageJson.devDependencies[dep] = 'latest';
        }
        // Update scripts
        packageJson.scripts = { ...packageJson.scripts, ...template.scripts };
        // Write updated package.json
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    /**
     * Check if template exists
     */
    hasTemplate(name) {
        return this.templates.has(name);
    }
    /**
     * Get available templates
     */
    getAvailableTemplates() {
        return Array.from(this.templates.keys());
    }
    /**
     * Get template information
     */
    getTemplate(name) {
        return this.templates.get(name);
    }
}
exports.ProjectTemplateManager = ProjectTemplateManager;
//# sourceMappingURL=ProjectTemplateManager.js.map