/**
 * @fileoverview Adapter Generator - Creates new platform adapters from templates
 */

import * as fs from 'fs';
import * as path from 'path';
import { PlatformType, PlatformCapabilities, AdapterConfig } from '../src/core/types';

/**
 * Adapter generation configuration
 */
export interface AdapterGenerationConfig {
  platformName: string;
  className: string;
  displayName: string;
  description: string;
  author: string;
  version: string;
  capabilities: PlatformCapabilities;
  authType: 'oauth1' | 'oauth2' | 'bearer' | 'basic' | 'api-key' | 'custom';
  apiBaseUrl?: string;
  rateLimit?: {
    requests: number;
    window: number;
  };
  features: {
    webhooks: boolean;
    realtime: boolean;
    analytics: boolean;
    fileUpload: boolean;
    scheduling: boolean;
  };
}

/**
 * Adapter template generator
 */
export class AdapterGenerator {
  private templatesDir: string;
  private outputDir: string;

  constructor(templatesDir?: string, outputDir?: string) {
    this.templatesDir = templatesDir || path.join(__dirname, '../templates');
    this.outputDir = outputDir || path.join(__dirname, '../src/platforms');
  }

  /**
   * Generate a new adapter from template
   */
  public async generateAdapter(config: AdapterGenerationConfig): Promise<void> {
    console.log(`🚀 Generating ${config.platformName} adapter...`);

    // Create platform directory
    const platformDir = path.join(this.outputDir, config.platformName.toLowerCase());
    if (!fs.existsSync(platformDir)) {
      fs.mkdirSync(platformDir, { recursive: true });
    }

    // Generate adapter class
    await this.generateAdapterClass(config, platformDir);
    
    // Generate test file
    await this.generateTestFile(config, platformDir);
    
    // Generate types file
    await this.generateTypesFile(config, platformDir);
    
    // Generate documentation
    await this.generateDocumentation(config, platformDir);
    
    // Update factory registration
    await this.updateAdapterFactory(config);
    
    // Update exports
    await this.updateExports(config);

    console.log(`✅ ${config.platformName} adapter generated successfully!`);
    console.log(`📁 Location: ${platformDir}`);
  }

  /**
   * Generate adapter class file
   */
  private async generateAdapterClass(config: AdapterGenerationConfig, outputDir: string): Promise<void> {
    const template = this.getAdapterTemplate();
    const content = this.replaceTemplateVariables(template, config);
    
    const filePath = path.join(outputDir, `${config.className}.ts`);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Generate test file
   */
  private async generateTestFile(config: AdapterGenerationConfig, outputDir: string): Promise<void> {
    const template = this.getTestTemplate();
    const content = this.replaceTemplateVariables(template, config);
    
    const testDir = path.join(outputDir, '__tests__');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const filePath = path.join(testDir, `${config.className}.test.ts`);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Generate types file
   */
  private async generateTypesFile(config: AdapterGenerationConfig, outputDir: string): Promise<void> {
    const template = this.getTypesTemplate();
    const content = this.replaceTemplateVariables(template, config);
    
    const filePath = path.join(outputDir, 'types.ts');
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(config: AdapterGenerationConfig, outputDir: string): Promise<void> {
    const template = this.getDocumentationTemplate();
    const content = this.replaceTemplateVariables(template, config);
    
    const filePath = path.join(outputDir, 'README.md');
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Update adapter factory to include new adapter
   */
  private async updateAdapterFactory(config: AdapterGenerationConfig): Promise<void> {
    const factoryPath = path.join(__dirname, '../src/core/AdapterFactory.ts');
    let content = fs.readFileSync(factoryPath, 'utf8');
    
    // Add import
    const importLine = `import { ${config.className} } from '../platforms/${config.platformName.toLowerCase()}/${config.className}';`;
    content = content.replace(
      /(import.*from.*types.*;\n)/,
      `$1${importLine}\n`
    );
    
    // Add case in createAdapter method
    const caseBlock = `      case '${config.platformName.toLowerCase()}':\n        return new ${config.className}(config);\n        `;
    content = content.replace(
      /(case 'custom':)/,
      `${caseBlock}\n      $1`
    );
    
    // Add to supported platforms
    content = content.replace(
      /(return \[.*)(];)/,
      `$1, '${config.platformName.toLowerCase()}'$2`
    );
    
    fs.writeFileSync(factoryPath, content, 'utf8');
  }

  /**
   * Update main exports
   */
  private async updateExports(config: AdapterGenerationConfig): Promise<void> {
    const indexPath = path.join(__dirname, '../src/index.ts');
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Add export
    const exportLine = `export { ${config.className} } from './platforms/${config.platformName.toLowerCase()}/${config.className}';`;
    content = content.replace(
      /(\/\/ Platform adapters\n)/,
      `$1${exportLine}\n`
    );
    
    fs.writeFileSync(indexPath, content, 'utf8');
  }

  /**
   * Replace template variables with actual values
   */
  private replaceTemplateVariables(template: string, config: AdapterGenerationConfig): string {
    return template
      .replace(/\{\{PLATFORM_NAME\}\}/g, config.platformName)
      .replace(/\{\{CLASS_NAME\}\}/g, config.className)
      .replace(/\{\{DISPLAY_NAME\}\}/g, config.displayName)
      .replace(/\{\{DESCRIPTION\}\}/g, config.description)
      .replace(/\{\{AUTHOR\}\}/g, config.author)
      .replace(/\{\{VERSION\}\}/g, config.version)
      .replace(/\{\{AUTH_TYPE\}\}/g, config.authType)
      .replace(/\{\{API_BASE_URL\}\}/g, config.apiBaseUrl || 'https://api.example.com')
      .replace(/\{\{RATE_LIMIT_REQUESTS\}\}/g, config.rateLimit?.requests.toString() || '100')
      .replace(/\{\{RATE_LIMIT_WINDOW\}\}/g, config.rateLimit?.window.toString() || '60000')
      .replace(/\{\{CAPABILITIES\}\}/g, JSON.stringify(config.capabilities, null, 6))
      .replace(/\{\{FEATURES\}\}/g, JSON.stringify(config.features, null, 4))
      .replace(/\{\{PLATFORM_LOWER\}\}/g, config.platformName.toLowerCase())
      .replace(/\{\{PLATFORM_UPPER\}\}/g, config.platformName.toUpperCase())
      .replace(/\{\{TIMESTAMP\}\}/g, new Date().toISOString());
  }

  /**
   * Get adapter class template
   */
  private getAdapterTemplate(): string {
    return `/**
 * @fileoverview {{PLATFORM_NAME}} platform adapter
 * Generated on {{TIMESTAMP}}
 * Author: {{AUTHOR}}
 */

import { BaseAdapter } from '../../core/BaseAdapter';
import {
  AdapterConfig,
  PlatformCapabilities,
  ContentItem,
  ActionResult,
  UserProfile,
  ContentMetrics
} from '../../core/types';
import { {{PLATFORM_NAME}}Client, {{PLATFORM_NAME}}Config } from './types';

/**
 * {{DISPLAY_NAME}} platform adapter
 * {{DESCRIPTION}}
 */
export class {{CLASS_NAME}} extends BaseAdapter {
  private client?: {{PLATFORM_NAME}}Client;
  private userId?: string;

  constructor(config: AdapterConfig) {
    const capabilities: PlatformCapabilities = {{CAPABILITIES}};
    super(config, capabilities);
  }

  /**
   * Initialize {{PLATFORM_NAME}} client
   */
  protected async doInitialize(): Promise<void> {
    // Initialize {{PLATFORM_NAME}} client
    this.client = this.createMockClient();
    this.userId = 'user_' + Date.now();
  }

  /**
   * Authenticate with {{PLATFORM_NAME}}
   */
  protected async doAuthenticate(): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('{{PLATFORM_NAME}} client not initialized');
      }
      
      // Implement authentication logic
      return !!this.config.auth.credentials.token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect from {{PLATFORM_NAME}}
   */
  protected async doDisconnect(): Promise<void> {
    this.client = undefined;
  }

  /**
   * Post content to {{PLATFORM_NAME}}
   */
  protected async doPost(content: ContentItem): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('{{PLATFORM_NAME}} client not initialized');
    }

    try {
      // Implement post logic
      const result = await this.client.createPost({
        content: content.content,
        type: content.type,
        metadata: content.metadata
      });
      
      return {
        success: true,
        data: {
          id: result.id,
          url: result.url,
          platform: '{{PLATFORM_LOWER}}'
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(\`Failed to post to {{PLATFORM_NAME}}: \${(error as Error).message}\`);
    }
  }

  /**
   * Comment on {{PLATFORM_NAME}} post
   */
  protected async doComment(postId: string, content: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('{{PLATFORM_NAME}} client not initialized');
    }

    try {
      const result = await this.client.createComment(postId, content);
      
      return {
        success: true,
        data: {
          id: result.id,
          postId,
          platform: '{{PLATFORM_LOWER}}'
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(\`Failed to comment on {{PLATFORM_NAME}} post: \${(error as Error).message}\`);
    }
  }

  /**
   * Share {{PLATFORM_NAME}} post
   */
  protected async doShare(postId: string, comment?: string): Promise<ActionResult> {
    // Implement sharing logic or throw if not supported
    throw new Error('{{PLATFORM_NAME}} does not support sharing');
  }

  /**
   * Delete {{PLATFORM_NAME}} post
   */
  protected async doDelete(postId: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('{{PLATFORM_NAME}} client not initialized');
    }

    try {
      await this.client.deletePost(postId);
      
      return {
        success: true,
        data: { id: postId, platform: '{{PLATFORM_LOWER}}' },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(\`Failed to delete {{PLATFORM_NAME}} post: \${(error as Error).message}\`);
    }
  }

  /**
   * Like {{PLATFORM_NAME}} post
   */
  protected async doLike(postId: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('{{PLATFORM_NAME}} client not initialized');
    }

    try {
      await this.client.likePost(postId);
      
      return {
        success: true,
        data: { id: postId, platform: '{{PLATFORM_LOWER}}' },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(\`Failed to like {{PLATFORM_NAME}} post: \${(error as Error).message}\`);
    }
  }

  /**
   * Unlike {{PLATFORM_NAME}} post
   */
  protected async doUnlike(postId: string): Promise<ActionResult> {
    if (!this.client) {
      throw new Error('{{PLATFORM_NAME}} client not initialized');
    }

    try {
      await this.client.unlikePost(postId);
      
      return {
        success: true,
        data: { id: postId, platform: '{{PLATFORM_LOWER}}' },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(\`Failed to unlike {{PLATFORM_NAME}} post: \${(error as Error).message}\`);
    }
  }

  /**
   * Follow user on {{PLATFORM_NAME}}
   */
  protected async doFollow(userId: string): Promise<ActionResult> {
    // Implement follow logic or throw if not supported
    throw new Error('{{PLATFORM_NAME}} does not support following users');
  }

  /**
   * Unfollow user on {{PLATFORM_NAME}}
   */
  protected async doUnfollow(userId: string): Promise<ActionResult> {
    // Implement unfollow logic or throw if not supported
    throw new Error('{{PLATFORM_NAME}} does not support unfollowing users');
  }

  /**
   * Get {{PLATFORM_NAME}} user profile
   */
  public async getProfile(userId?: string): Promise<UserProfile> {
    if (!this.client) {
      throw new Error('{{PLATFORM_NAME}} client not initialized');
    }

    try {
      const user = await this.client.getUser(userId || this.userId || 'self');
      
      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio || '',
        avatar: user.avatar,
        verified: user.verified || false,
        metadata: user.metadata
      };
    } catch (error) {
      throw new Error(\`Failed to get {{PLATFORM_NAME}} user profile: \${(error as Error).message}\`);
    }
  }

  /**
   * Get {{PLATFORM_NAME}} post content
   */
  public async getContent(postId: string): Promise<ContentItem> {
    if (!this.client) {
      throw new Error('{{PLATFORM_NAME}} client not initialized');
    }

    try {
      const post = await this.client.getPost(postId);
      
      return {
        id: post.id,
        type: post.type,
        content: post.content,
        metadata: post.metadata,
        metrics: post.metrics
      };
    } catch (error) {
      throw new Error(\`Failed to get {{PLATFORM_NAME}} post: \${(error as Error).message}\`);
    }
  }

  /**
   * Search {{PLATFORM_NAME}} content
   */
  public async search(query: string, options?: any): Promise<ContentItem[]> {
    if (!this.client) {
      throw new Error('{{PLATFORM_NAME}} client not initialized');
    }

    try {
      const results = await this.client.search(query, options);
      return results.map((item: any) => ({
        id: item.id,
        type: item.type,
        content: item.content,
        metadata: item.metadata,
        metrics: item.metrics
      }));
    } catch (error) {
      throw new Error(\`Failed to search {{PLATFORM_NAME}}: \${(error as Error).message}\`);
    }
  }

  /**
   * Get {{PLATFORM_NAME}} analytics
   */
  public async getAnalytics(postId: string): Promise<ContentMetrics> {
    const content = await this.getContent(postId);
    return content.metrics || {};
  }

  /**
   * Setup {{PLATFORM_NAME}} webhook
   */
  public async setupWebhook(url: string, events: string[]): Promise<boolean> {
    try {
      // Implement webhook setup if supported
      return {{FEATURES}}.webhooks;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove {{PLATFORM_NAME}} webhook
   */
  public async removeWebhook(webhookId: string): Promise<boolean> {
    try {
      return {{FEATURES}}.webhooks;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start monitoring {{PLATFORM_NAME}} events
   */
  protected async doStartMonitoring(options?: any): Promise<void> {
    // Implement monitoring logic
  }

  /**
   * Stop monitoring
   */
  protected async doStopMonitoring(): Promise<void> {
    // Stop monitoring
  }

  /**
   * Validate {{PLATFORM_NAME}}-specific content
   */
  protected async doValidateContent(content: ContentItem): Promise<boolean> {
    // Implement platform-specific validation
    if (content.content.length > this.capabilities.maxContentLength!) {
      return false;
    }
    
    return true;
  }

  /**
   * Create mock {{PLATFORM_NAME}} client for testing
   */
  private createMockClient(): {{PLATFORM_NAME}}Client {
    return {
      createPost: async (data: any) => ({
        id: \`post_\${Date.now()}\`,
        url: \`{{API_BASE_URL}}/posts/\${Date.now()}\`,
        ...data
      }),
      createComment: async (postId: string, content: string) => ({
        id: \`comment_\${Date.now()}\`,
        postId,
        content
      }),
      deletePost: async (postId: string) => ({ success: true }),
      likePost: async (postId: string) => ({ success: true }),
      unlikePost: async (postId: string) => ({ success: true }),
      getUser: async (userId: string) => ({
        id: userId,
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test user for {{PLATFORM_NAME}}',
        avatar: '{{API_BASE_URL}}/avatars/default.png',
        verified: false,
        metadata: {}
      }),
      getPost: async (postId: string) => ({
        id: postId,
        type: 'text' as const,
        content: 'Sample {{PLATFORM_NAME}} post',
        metadata: {},
        metrics: { likes: 0, comments: 0, shares: 0 }
      }),
      search: async (query: string, options?: any) => ([
        {
          id: 'search_result_1',
          type: 'text' as const,
          content: \`Post about \${query}\`,
          metadata: {},
          metrics: { likes: 5, comments: 2, shares: 1 }
        }
      ])
    };
  }
}`;
  }

  /**
   * Get test template
   */
  private getTestTemplate(): string {
    return `/**
 * @fileoverview {{CLASS_NAME}} tests
 * Generated on {{TIMESTAMP}}
 */

import { {{CLASS_NAME}} } from '../{{CLASS_NAME}}';
import { AdapterConfig, ContentItem } from '../../core/types';

describe('{{CLASS_NAME}}测试', () => {
  let adapter: {{CLASS_NAME}};
  let config: AdapterConfig;

  beforeEach(() => {
    config = {
      platform: '{{PLATFORM_LOWER}}',
      name: 'Test {{DISPLAY_NAME}} Adapter',
      version: '{{VERSION}}',
      enabled: true,
      auth: {
        type: '{{AUTH_TYPE}}',
        credentials: {
          token: 'test-{{PLATFORM_LOWER}}-token'
        }
      }
    };

    adapter = new {{CLASS_NAME}}(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities.canPost).toBeDefined();
    });
  });

  describe('生命周期测试', () => {
    it('应该成功初始化', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
    });

    it('应该成功认证', async () => {
      await adapter.initialize();
      const result = await adapter.authenticate();
      
      expect(result).toBe(true);
      expect(adapter.isAuthenticated).toBe(true);
    });

    it('应该成功断开连接', async () => {
      await adapter.initialize();
      await adapter.authenticate();
      
      await expect(adapter.disconnect()).resolves.not.toThrow();
      expect(adapter.isAuthenticated).toBe(false);
    });
  });

  describe('内容发布测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功发布内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Hello {{PLATFORM_NAME}}!'
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.platform).toBe('{{PLATFORM_LOWER}}');
    });

    it('应该成功评论', async () => {
      const result = await adapter.comment('post123', 'Great post!');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });
  });

  describe('数据获取测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该获取用户资料', async () => {
      const profile = await adapter.getProfile('user123');
      
      expect(profile.id).toBe('user123');
      expect(profile.username).toBe('testuser');
    });

    it('应该获取内容', async () => {
      const content = await adapter.getContent('post123');
      
      expect(content.id).toBe('post123');
      expect(content.type).toBe('text');
    });

    it('应该搜索内容', async () => {
      const results = await adapter.search('test query');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理认证失败', async () => {
      const invalidConfig = {
        ...config,
        auth: {
          type: '{{AUTH_TYPE}}' as const,
          credentials: {}
        }
      };

      const invalidAdapter = new {{CLASS_NAME}}(invalidConfig);
      await invalidAdapter.initialize();
      
      const result = await invalidAdapter.authenticate();
      expect(result).toBe(false);
    });
  });
});`;
  }

  /**
   * Get types template
   */
  private getTypesTemplate(): string {
    return `/**
 * @fileoverview {{PLATFORM_NAME}} adapter types
 * Generated on {{TIMESTAMP}}
 */

/**
 * {{PLATFORM_NAME}} client interface
 */
export interface {{PLATFORM_NAME}}Client {
  createPost(data: any): Promise<any>;
  createComment(postId: string, content: string): Promise<any>;
  deletePost(postId: string): Promise<any>;
  likePost(postId: string): Promise<any>;
  unlikePost(postId: string): Promise<any>;
  getUser(userId: string): Promise<any>;
  getPost(postId: string): Promise<any>;
  search(query: string, options?: any): Promise<any[]>;
}

/**
 * {{PLATFORM_NAME}} configuration
 */
export interface {{PLATFORM_NAME}}Config {
  apiBaseUrl: string;
  apiVersion?: string;
  timeout?: number;
  retries?: number;
}

/**
 * {{PLATFORM_NAME}} API response types
 */
export interface {{PLATFORM_NAME}}Post {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface {{PLATFORM_NAME}}User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  verified: boolean;
  metadata: Record<string, any>;
}

export interface {{PLATFORM_NAME}}Comment {
  id: string;
  postId: string;
  content: string;
  author: string;
  createdAt: string;
}`;
  }

  /**
   * Get documentation template
   */
  private getDocumentationTemplate(): string {
    return `# {{DISPLAY_NAME}} Adapter

{{DESCRIPTION}}

## Installation

\`\`\`bash
npm install @mplp/adapters
\`\`\`

## Configuration

\`\`\`typescript
import { {{CLASS_NAME}} } from '@mplp/adapters';

const config = {
  platform: '{{PLATFORM_LOWER}}',
  name: '{{DISPLAY_NAME}} Adapter',
  version: '{{VERSION}}',
  enabled: true,
  auth: {
    type: '{{AUTH_TYPE}}',
    credentials: {
      token: 'your-{{PLATFORM_LOWER}}-token'
    }
  }
};

const adapter = new {{CLASS_NAME}}(config);
\`\`\`

## Usage

### Initialize and Authenticate

\`\`\`typescript
await adapter.initialize();
await adapter.authenticate();
\`\`\`

### Post Content

\`\`\`typescript
const result = await adapter.post({
  type: 'text',
  content: 'Hello {{PLATFORM_NAME}}!'
});
\`\`\`

### Get User Profile

\`\`\`typescript
const profile = await adapter.getProfile('username');
\`\`\`

### Search Content

\`\`\`typescript
const results = await adapter.search('query');
\`\`\`

## Platform Capabilities

- **Post**: {{CAPABILITIES.canPost}}
- **Comment**: {{CAPABILITIES.canComment}}
- **Share**: {{CAPABILITIES.canShare}}
- **Delete**: {{CAPABILITIES.canDelete}}
- **Edit**: {{CAPABILITIES.canEdit}}
- **Like**: {{CAPABILITIES.canLike}}
- **Follow**: {{CAPABILITIES.canFollow}}
- **Message**: {{CAPABILITIES.canMessage}}
- **Mention**: {{CAPABILITIES.canMention}}

## Features

{{FEATURES}}

## Rate Limits

- **Requests**: {{RATE_LIMIT_REQUESTS}} per {{RATE_LIMIT_WINDOW}}ms
- **Burst**: Configurable

## Authentication

This adapter uses **{{AUTH_TYPE}}** authentication.

## API Reference

For detailed API documentation, see the [{{PLATFORM_NAME}} API Documentation]({{API_BASE_URL}}/docs).

## License

MIT License - see LICENSE file for details.`;
  }
}

/**
 * CLI interface for adapter generation
 */
export async function generateAdapterCLI(): Promise<void> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    console.log('🚀 MPLP Adapter Generator');
    console.log('========================\n');

    const platformName = await question('Platform name (e.g., TikTok): ');
    const className = await question('Class name (e.g., TikTokAdapter): ');
    const displayName = await question('Display name (e.g., TikTok): ');
    const description = await question('Description: ');
    const author = await question('Author: ');
    const authType = await question('Auth type (oauth1/oauth2/bearer/basic/api-key): ') as any;
    const apiBaseUrl = await question('API base URL: ');

    const config: AdapterGenerationConfig = {
      platformName,
      className,
      displayName,
      description,
      author,
      version: '1.0.0',
      authType,
      apiBaseUrl,
      capabilities: {
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
      },
      features: {
        webhooks: false,
        realtime: false,
        analytics: false,
        fileUpload: true,
        scheduling: false
      }
    };

    const generator = new AdapterGenerator();
    await generator.generateAdapter(config);

    console.log('\n✅ Adapter generated successfully!');
    console.log('📝 Next steps:');
    console.log('1. Review the generated files');
    console.log('2. Implement the actual API calls');
    console.log('3. Update the test cases');
    console.log('4. Run tests: npm test');

  } catch (error) {
    console.error('❌ Error generating adapter:', error);
  } finally {
    rl.close();
  }
}

// Export for CLI usage
if (require.main === module) {
  generateAdapterCLI();
}
