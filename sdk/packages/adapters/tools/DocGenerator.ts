/**
 * @fileoverview Documentation Generator - Automatic documentation generation for platform adapters
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAdapter } from '../src/core/BaseAdapter';
import { PlatformCapabilities, AdapterConfig } from '../src/core/types';

/**
 * Documentation configuration
 */
export interface DocConfig {
  outputDir: string;
  templateDir: string;
  includeExamples: boolean;
  includeAPI: boolean;
  includeGuides: boolean;
  format: 'markdown' | 'html' | 'json';
  theme: 'default' | 'github' | 'gitbook';
}

/**
 * Adapter documentation metadata
 */
export interface AdapterDocMetadata {
  name: string;
  className: string;
  platform: string;
  version: string;
  description: string;
  author?: string;
  capabilities: PlatformCapabilities;
  authType: string;
  rateLimit?: {
    requests: number;
    window: number;
  };
  features: string[];
  examples: {
    basic: string;
    advanced: string;
    configuration: string;
  };
  apiMethods: {
    name: string;
    description: string;
    parameters: any[];
    returns: string;
    example: string;
  }[];
}

/**
 * Documentation generator for platform adapters
 */
export class DocGenerator {
  private config: DocConfig;

  constructor(config: Partial<DocConfig> = {}) {
    this.config = {
      outputDir: path.join(__dirname, '../docs/generated'),
      templateDir: path.join(__dirname, '../templates/docs'),
      includeExamples: true,
      includeAPI: true,
      includeGuides: true,
      format: 'markdown',
      theme: 'default',
      ...config
    };
  }

  /**
   * Generate documentation for all adapters
   */
  public async generateAllDocs(): Promise<void> {
    console.log('📚 Generating documentation for all adapters...');

    // Ensure output directory exists
    fs.mkdirSync(this.config.outputDir, { recursive: true });

    // Get all adapter files
    const adaptersDir = path.join(__dirname, '../src/platforms');
    const platforms = fs.readdirSync(adaptersDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Generate docs for each platform
    for (const platform of platforms) {
      try {
        await this.generatePlatformDocs(platform);
      } catch (error) {
        console.error(`❌ Failed to generate docs for ${platform}:`, error);
      }
    }

    // Generate index page
    await this.generateIndexPage(platforms);

    // Generate API reference
    if (this.config.includeAPI) {
      await this.generateAPIReference();
    }

    // Generate guides
    if (this.config.includeGuides) {
      await this.generateGuides();
    }

    console.log(`✅ Documentation generated in ${this.config.outputDir}`);
  }

  /**
   * Generate documentation for specific platform
   */
  public async generatePlatformDocs(platform: string): Promise<void> {
    console.log(`  📄 Generating docs for ${platform}...`);

    try {
      // Load adapter metadata
      const metadata = await this.extractAdapterMetadata(platform);
      
      // Generate main documentation
      await this.generateMainDoc(metadata);
      
      // Generate API reference
      if (this.config.includeAPI) {
        await this.generatePlatformAPI(metadata);
      }
      
      // Generate examples
      if (this.config.includeExamples) {
        await this.generateExamples(metadata);
      }

      console.log(`    ✅ ${platform} documentation generated`);
    } catch (error) {
      console.error(`    ❌ Failed to generate ${platform} docs:`, error);
      throw error;
    }
  }

  /**
   * Extract metadata from adapter
   */
  private async extractAdapterMetadata(platform: string): Promise<AdapterDocMetadata> {
    const platformDir = path.join(__dirname, '../src/platforms', platform);
    
    // Find adapter file
    const files = fs.readdirSync(platformDir);
    const adapterFile = files.find(f => f.endsWith('Adapter.ts'));
    
    if (!adapterFile) {
      throw new Error(`No adapter file found for ${platform}`);
    }

    const adapterPath = path.join(platformDir, adapterFile);
    const adapterContent = fs.readFileSync(adapterPath, 'utf8');
    
    // Extract class name
    const classMatch = adapterContent.match(/export class (\w+Adapter)/);
    const className = classMatch ? classMatch[1] : `${platform}Adapter`;
    
    // Extract capabilities
    const capabilitiesMatch = adapterContent.match(/const capabilities: PlatformCapabilities = ({[\s\S]*?});/);
    let capabilities: PlatformCapabilities;
    
    try {
      if (capabilitiesMatch) {
        // This is a simplified extraction - in practice, you'd use a proper parser
        capabilities = this.parseCapabilities(capabilitiesMatch[1]);
      } else {
        capabilities = this.getDefaultCapabilities();
      }
    } catch (error) {
      capabilities = this.getDefaultCapabilities();
    }

    // Extract auth type
    const authMatch = adapterContent.match(/type: '(\w+)'/);
    const authType = authMatch ? authMatch[1] : 'bearer';

    // Extract description from comments
    const descMatch = adapterContent.match(/\/\*\*[\s\S]*?\* (.+?)[\s\S]*?\*\//);
    const description = descMatch ? descMatch[1] : `${platform} platform adapter`;

    // Extract features
    const features = this.extractFeatures(capabilities);

    return {
      name: platform,
      className,
      platform: platform.toLowerCase(),
      version: '1.0.0',
      description,
      capabilities,
      authType,
      features,
      examples: this.generateExampleCode(platform, className, authType),
      apiMethods: this.extractAPIMethods(adapterContent, className)
    };
  }

  /**
   * Parse capabilities from code
   */
  private parseCapabilities(capabilitiesStr: string): PlatformCapabilities {
    // This is a simplified parser - in practice, you'd use AST parsing
    return {
      canPost: capabilitiesStr.includes('canPost: true'),
      canComment: capabilitiesStr.includes('canComment: true'),
      canShare: capabilitiesStr.includes('canShare: true'),
      canDelete: capabilitiesStr.includes('canDelete: true'),
      canEdit: capabilitiesStr.includes('canEdit: true'),
      canLike: capabilitiesStr.includes('canLike: true'),
      canFollow: capabilitiesStr.includes('canFollow: true'),
      canMessage: capabilitiesStr.includes('canMessage: true'),
      canMention: capabilitiesStr.includes('canMention: true'),
      supportedContentTypes: ['text', 'image'],
      maxContentLength: 1000,
      maxMediaSize: 10 * 1024 * 1024,
      supportsPolls: capabilitiesStr.includes('supportsPolls: true'),
      supportsScheduling: capabilitiesStr.includes('supportsScheduling: true'),
      supportsAnalytics: capabilitiesStr.includes('supportsAnalytics: true'),
      supportsWebhooks: capabilitiesStr.includes('supportsWebhooks: true')
    };
  }

  /**
   * Get default capabilities
   */
  private getDefaultCapabilities(): PlatformCapabilities {
    return {
      canPost: true,
      canComment: true,
      canShare: false,
      canDelete: true,
      canEdit: false,
      canLike: true,
      canFollow: false,
      canMessage: false,
      canMention: true,
      supportedContentTypes: ['text', 'image'],
      maxContentLength: 1000,
      maxMediaSize: 10 * 1024 * 1024,
      supportsPolls: false,
      supportsScheduling: false,
      supportsAnalytics: false,
      supportsWebhooks: false
    };
  }

  /**
   * Extract features from capabilities
   */
  private extractFeatures(capabilities: PlatformCapabilities): string[] {
    const features: string[] = [];
    
    if (capabilities.canPost) features.push('Content Publishing');
    if (capabilities.canComment) features.push('Comments');
    if (capabilities.canShare) features.push('Sharing');
    if (capabilities.canLike) features.push('Reactions/Likes');
    if (capabilities.canFollow) features.push('Following');
    if (capabilities.canMessage) features.push('Direct Messaging');
    if (capabilities.supportsPolls) features.push('Polls');
    if (capabilities.supportsScheduling) features.push('Scheduled Posts');
    if (capabilities.supportsAnalytics) features.push('Analytics');
    if (capabilities.supportsWebhooks) features.push('Webhooks');
    
    return features;
  }

  /**
   * Generate example code
   */
  private generateExampleCode(platform: string, className: string, authType: string): {
    basic: string;
    advanced: string;
    configuration: string;
  } {
    const platformLower = platform.toLowerCase();
    
    return {
      basic: `import { ${className} } from '@mplp/adapters';

const adapter = new ${className}({
  platform: '${platformLower}',
  name: '${platform} Adapter',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: '${authType}',
    credentials: {
      token: 'your-${platformLower}-token'
    }
  }
});

// Initialize and authenticate
await adapter.initialize();
await adapter.authenticate();

// Post content
const result = await adapter.post({
  type: 'text',
  content: 'Hello ${platform}!'
});

console.log('Posted:', result.data?.id);`,

      advanced: `import { ${className}, AdapterManager } from '@mplp/adapters';

// Advanced configuration
const adapter = new ${className}({
  platform: '${platformLower}',
  name: '${platform} Adapter',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: '${authType}',
    credentials: {
      token: process.env.${platform.toUpperCase()}_TOKEN
    }
  },
  rateLimit: {
    requests: 100,
    window: 60000
  },
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential'
  }
});

// Use with manager
const manager = new AdapterManager();
manager.addAdapter('${platformLower}', adapter);

// Bulk operations
await manager.postToAll({
  type: 'text',
  content: 'Multi-platform post!'
});

// Monitor events
adapter.on('rateLimit', (info) => {
  console.log('Rate limit hit:', info);
});`,

      configuration: `{
  "platform": "${platformLower}",
  "name": "${platform} Adapter",
  "version": "1.0.0",
  "enabled": true,
  "auth": {
    "type": "${authType}",
    "credentials": {
      "token": "your-${platformLower}-token"
    }
  },
  "rateLimit": {
    "requests": 100,
    "window": 60000
  },
  "retry": {
    "attempts": 3,
    "delay": 1000,
    "backoff": "exponential"
  },
  "settings": {
    "timeout": 30000,
    "userAgent": "MPLP ${platform} Adapter v1.0.0"
  }
}`
    };
  }

  /**
   * Extract API methods from adapter code
   */
  private extractAPIMethods(adapterContent: string, className: string): any[] {
    const methods = [
      {
        name: 'initialize',
        description: 'Initialize the adapter and prepare for authentication',
        parameters: [],
        returns: 'Promise<void>',
        example: 'await adapter.initialize();'
      },
      {
        name: 'authenticate',
        description: 'Authenticate with the platform using provided credentials',
        parameters: [],
        returns: 'Promise<boolean>',
        example: 'const success = await adapter.authenticate();'
      },
      {
        name: 'post',
        description: 'Post content to the platform',
        parameters: [
          { name: 'content', type: 'ContentItem', description: 'Content to post' }
        ],
        returns: 'Promise<ActionResult>',
        example: 'const result = await adapter.post({ type: "text", content: "Hello!" });'
      },
      {
        name: 'comment',
        description: 'Comment on a post',
        parameters: [
          { name: 'postId', type: 'string', description: 'ID of the post to comment on' },
          { name: 'content', type: 'string', description: 'Comment content' }
        ],
        returns: 'Promise<ActionResult>',
        example: 'const result = await adapter.comment("post123", "Great post!");'
      },
      {
        name: 'getProfile',
        description: 'Get user profile information',
        parameters: [
          { name: 'userId', type: 'string', description: 'User ID (optional, defaults to authenticated user)' }
        ],
        returns: 'Promise<UserProfile>',
        example: 'const profile = await adapter.getProfile("user123");'
      }
    ];

    return methods;
  }

  /**
   * Generate main documentation file
   */
  private async generateMainDoc(metadata: AdapterDocMetadata): Promise<void> {
    const template = `# ${metadata.name} Adapter

${metadata.description}

## Installation

\`\`\`bash
npm install @mplp/adapters
\`\`\`

## Quick Start

\`\`\`typescript
${metadata.examples.basic}
\`\`\`

## Features

${metadata.features.map(f => `- ${f}`).join('\n')}

## Platform Capabilities

| Feature | Supported |
|---------|-----------|
| Post Content | ${metadata.capabilities.canPost ? '✅' : '❌'} |
| Comment | ${metadata.capabilities.canComment ? '✅' : '❌'} |
| Share | ${metadata.capabilities.canShare ? '✅' : '❌'} |
| Delete | ${metadata.capabilities.canDelete ? '✅' : '❌'} |
| Edit | ${metadata.capabilities.canEdit ? '✅' : '❌'} |
| Like/React | ${metadata.capabilities.canLike ? '✅' : '❌'} |
| Follow | ${metadata.capabilities.canFollow ? '✅' : '❌'} |
| Message | ${metadata.capabilities.canMessage ? '✅' : '❌'} |
| Mention | ${metadata.capabilities.canMention ? '✅' : '❌'} |
| Polls | ${metadata.capabilities.supportsPolls ? '✅' : '❌'} |
| Scheduling | ${metadata.capabilities.supportsScheduling ? '✅' : '❌'} |
| Analytics | ${metadata.capabilities.supportsAnalytics ? '✅' : '❌'} |
| Webhooks | ${metadata.capabilities.supportsWebhooks ? '✅' : '❌'} |

## Configuration

### Basic Configuration

\`\`\`json
${metadata.examples.configuration}
\`\`\`

### Authentication

This adapter uses **${metadata.authType}** authentication.

## Advanced Usage

\`\`\`typescript
${metadata.examples.advanced}
\`\`\`

## API Reference

See [${metadata.name} API Reference](./api/${metadata.platform}-api.md) for detailed method documentation.

## Examples

See [${metadata.name} Examples](./examples/${metadata.platform}-examples.md) for more usage examples.

## License

MIT License - see LICENSE file for details.
`;

    const outputPath = path.join(this.config.outputDir, `${metadata.platform}.md`);
    fs.writeFileSync(outputPath, template, 'utf8');
  }

  /**
   * Generate API reference for platform
   */
  private async generatePlatformAPI(metadata: AdapterDocMetadata): Promise<void> {
    const apiDir = path.join(this.config.outputDir, 'api');
    fs.mkdirSync(apiDir, { recursive: true });

    let apiDoc = `# ${metadata.name} API Reference\n\n`;
    apiDoc += `## Class: ${metadata.className}\n\n`;
    apiDoc += `${metadata.description}\n\n`;

    apiDoc += `## Methods\n\n`;
    
    for (const method of metadata.apiMethods) {
      apiDoc += `### ${method.name}\n\n`;
      apiDoc += `${method.description}\n\n`;
      
      if (method.parameters.length > 0) {
        apiDoc += `**Parameters:**\n\n`;
        for (const param of method.parameters) {
          apiDoc += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
        }
        apiDoc += '\n';
      }
      
      apiDoc += `**Returns:** \`${method.returns}\`\n\n`;
      apiDoc += `**Example:**\n\n`;
      apiDoc += `\`\`\`typescript\n${method.example}\n\`\`\`\n\n`;
    }

    const outputPath = path.join(apiDir, `${metadata.platform}-api.md`);
    fs.writeFileSync(outputPath, apiDoc, 'utf8');
  }

  /**
   * Generate examples
   */
  private async generateExamples(metadata: AdapterDocMetadata): Promise<void> {
    const examplesDir = path.join(this.config.outputDir, 'examples');
    fs.mkdirSync(examplesDir, { recursive: true });

    const examplesDoc = `# ${metadata.name} Examples

## Basic Usage

\`\`\`typescript
${metadata.examples.basic}
\`\`\`

## Advanced Configuration

\`\`\`typescript
${metadata.examples.advanced}
\`\`\`

## Configuration File

\`\`\`json
${metadata.examples.configuration}
\`\`\`

## Error Handling

\`\`\`typescript
import { ${metadata.className} } from '@mplp/adapters';

const adapter = new ${metadata.className}(config);

try {
  await adapter.initialize();
  await adapter.authenticate();
  
  const result = await adapter.post({
    type: 'text',
    content: 'Hello ${metadata.name}!'
  });
  
  console.log('Success:', result.data);
} catch (error) {
  console.error('Error:', error.message);
  
  // Handle specific error types
  if (error.message.includes('rate limit')) {
    console.log('Rate limited, waiting...');
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}
\`\`\`

## Monitoring and Debugging

\`\`\`typescript
import { ${metadata.className}, createDebugMonitor } from '@mplp/adapters';

const adapter = new ${metadata.className}(config);
const monitor = createDebugMonitor();

// Add adapter to monitoring
monitor.addAdapter(adapter);

// Listen to events
adapter.on('rateLimit', (info) => {
  console.log('Rate limit hit:', info);
});

adapter.on('error', (error) => {
  console.error('Adapter error:', error);
});

// Start dashboard
monitor.startDashboard(3001);
console.log('Debug dashboard: http://localhost:3001');
\`\`\`
`;

    const outputPath = path.join(examplesDir, `${metadata.platform}-examples.md`);
    fs.writeFileSync(outputPath, examplesDoc, 'utf8');
  }

  /**
   * Generate index page
   */
  private async generateIndexPage(platforms: string[]): Promise<void> {
    let indexDoc = `# MPLP Platform Adapters Documentation

Welcome to the MPLP Platform Adapters documentation. This section provides comprehensive guides and API references for all supported platform adapters.

## Supported Platforms

`;

    for (const platform of platforms) {
      const platformTitle = platform.charAt(0).toUpperCase() + platform.slice(1);
      indexDoc += `- [${platformTitle}](${platform}.md) - ${platformTitle} platform adapter\n`;
    }

    indexDoc += `\n## Getting Started

1. [Installation Guide](guides/installation.md)
2. [Quick Start](guides/quick-start.md)
3. [Configuration](guides/configuration.md)
4. [Best Practices](guides/best-practices.md)

## API Reference

- [Core Types](api/core-types.md)
- [Base Adapter](api/base-adapter.md)
- [Adapter Factory](api/adapter-factory.md)
- [Adapter Manager](api/adapter-manager.md)

## Tools and Utilities

- [Adapter Generator](tools/adapter-generator.md)
- [Test Framework](tools/test-framework.md)
- [Debug Monitor](tools/debug-monitor.md)
- [Documentation Generator](tools/doc-generator.md)

## Examples

- [Basic Usage](examples/basic-usage.md)
- [Multi-Platform Setup](examples/multi-platform.md)
- [Error Handling](examples/error-handling.md)
- [Monitoring and Debugging](examples/monitoring.md)

## Contributing

- [Development Guide](contributing/development.md)
- [Creating Custom Adapters](contributing/custom-adapters.md)
- [Testing Guidelines](contributing/testing.md)
- [Documentation Standards](contributing/documentation.md)
`;

    const outputPath = path.join(this.config.outputDir, 'README.md');
    fs.writeFileSync(outputPath, indexDoc, 'utf8');
  }

  /**
   * Generate API reference
   */
  private async generateAPIReference(): Promise<void> {
    // This would generate comprehensive API documentation
    // Implementation details omitted for brevity
  }

  /**
   * Generate guides
   */
  private async generateGuides(): Promise<void> {
    // This would generate user guides and tutorials
    // Implementation details omitted for brevity
  }
}

/**
 * CLI interface for documentation generation
 */
export async function generateDocsCLI(): Promise<void> {
  const args = process.argv.slice(2);
  const platform = args[0];

  const generator = new DocGenerator();

  if (platform) {
    console.log(`📚 Generating documentation for ${platform}...`);
    await generator.generatePlatformDocs(platform);
  } else {
    console.log('📚 Generating documentation for all adapters...');
    await generator.generateAllDocs();
  }

  console.log('✅ Documentation generation complete!');
}

// Export for CLI usage
if (require.main === module) {
  generateDocsCLI().catch(console.error);
}
