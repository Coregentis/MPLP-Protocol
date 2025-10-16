# MPLP Adapter Development Standards

## 📋 Overview

This document defines the standards and best practices for developing platform adapters in the MPLP ecosystem. All adapters must comply with these standards to ensure consistency, reliability, and maintainability.

## 🏗️ Architecture Requirements

### 1. Base Class Extension

All adapters MUST extend the `BaseAdapter` class:

```typescript
import { BaseAdapter } from '../../core/BaseAdapter';

export class YourPlatformAdapter extends BaseAdapter {
  // Implementation
}
```

### 2. Interface Compliance

Adapters MUST implement all required methods from `IPlatformAdapter`:

- `initialize(): Promise<void>`
- `authenticate(): Promise<boolean>`
- `disconnect(): Promise<void>`
- `post(content: ContentItem): Promise<ActionResult>`
- `getProfile(userId?: string): Promise<UserProfile>`
- `getContent(postId: string): Promise<ContentItem>`
- `search(query: string, options?: any): Promise<ContentItem[]>`

### 3. Capabilities Declaration

Adapters MUST declare their capabilities accurately:

```typescript
const capabilities: PlatformCapabilities = {
  canPost: true,
  canComment: true,
  canShare: false, // Only if actually supported
  canDelete: true,
  canEdit: false,
  canLike: true,
  canFollow: false,
  canMessage: false,
  canMention: true,
  supportedContentTypes: ['text', 'image', 'video'],
  maxContentLength: 280, // Platform-specific limit
  maxMediaSize: 5 * 1024 * 1024, // 5MB
  supportsPolls: false,
  supportsScheduling: false,
  supportsAnalytics: true,
  supportsWebhooks: true
};
```

## 🔧 Implementation Standards

### 1. Method Implementation

#### Required Methods

```typescript
// Initialize platform client
protected async doInitialize(): Promise<void> {
  // Initialize API client
  // Set up configuration
  // Prepare for authentication
}

// Authenticate with platform
protected async doAuthenticate(): Promise<boolean> {
  // Perform authentication
  // Return true on success, false on failure
  // Do not throw errors for auth failures
}

// Clean disconnect
protected async doDisconnect(): Promise<void> {
  // Clean up resources
  // Close connections
  // Reset state
}

// Post content
protected async doPost(content: ContentItem): Promise<ActionResult> {
  // Validate content
  // Make API call
  // Return structured result
}
```

#### Optional Methods (implement if supported)

```typescript
protected async doComment(postId: string, content: string): Promise<ActionResult>
protected async doShare(postId: string, comment?: string): Promise<ActionResult>
protected async doDelete(postId: string): Promise<ActionResult>
protected async doLike(postId: string): Promise<ActionResult>
protected async doUnlike(postId: string): Promise<ActionResult>
protected async doFollow(userId: string): Promise<ActionResult>
protected async doUnfollow(userId: string): Promise<ActionResult>
```

### 2. Error Handling

#### Standard Error Patterns

```typescript
// Authentication errors
if (!this.client) {
  throw new Error('Platform client not initialized');
}

// API errors
try {
  const result = await this.client.makeRequest();
  return result;
} catch (error) {
  throw new Error(`Failed to perform action: ${(error as Error).message}`);
}

// Validation errors
if (!this.validateContent(content)) {
  throw new Error('Invalid content format');
}
```

#### Error Types

- Use descriptive error messages
- Include platform name in error messages
- Preserve original error information
- Don't expose sensitive information

### 3. Content Validation

```typescript
protected async doValidateContent(content: ContentItem): Promise<boolean> {
  // Check content length
  if (content.content.length > this.capabilities.maxContentLength!) {
    return false;
  }
  
  // Check content type support
  if (!this.capabilities.supportedContentTypes.includes(content.type)) {
    return false;
  }
  
  // Platform-specific validation
  // Return true if valid, false otherwise
  
  return true;
}
```

### 4. Rate Limiting

```typescript
// Use rate limiter from base class
await this.checkRateLimit();

// Emit rate limit events
this.emit('rateLimit', {
  remaining: rateLimitInfo.remaining,
  resetTime: rateLimitInfo.resetTime
});
```

## 📝 Code Quality Standards

### 1. TypeScript Requirements

- **Strict Mode**: All code must compile with TypeScript strict mode
- **No Any Types**: Absolutely prohibited - use proper typing
- **Interface Compliance**: All methods must match interface signatures
- **Generic Types**: Use generics where appropriate

### 2. Naming Conventions

```typescript
// Classes: PascalCase
export class TwitterAdapter extends BaseAdapter

// Methods: camelCase
public async getProfile(userId: string): Promise<UserProfile>

// Properties: camelCase
private client?: TwitterClient;

// Constants: UPPER_SNAKE_CASE
private static readonly MAX_RETRIES = 3;

// Interfaces: PascalCase with I prefix
interface ITwitterClient {
  // ...
}
```

### 3. Documentation Requirements

```typescript
/**
 * @fileoverview Platform adapter for [Platform Name]
 * 
 * This adapter provides integration with [Platform] API v[X.X]
 * Supports: [list key features]
 * 
 * @author Your Name
 * @version 1.0.0
 */

/**
 * [Platform] platform adapter
 * 
 * Provides comprehensive integration with [Platform] including:
 * - Content publishing
 * - User interactions
 * - Real-time events
 * 
 * @example
 * ```typescript
 * const adapter = new PlatformAdapter(config);
 * await adapter.initialize();
 * await adapter.authenticate();
 * 
 * const result = await adapter.post({
 *   type: 'text',
 *   content: 'Hello World!'
 * });
 * ```
 */
export class PlatformAdapter extends BaseAdapter {
  /**
   * Initialize platform client
   * 
   * Sets up API client with configuration and prepares
   * for authentication. Does not perform authentication.
   * 
   * @throws {Error} If configuration is invalid
   */
  protected async doInitialize(): Promise<void> {
    // Implementation
  }
}
```

## 🧪 Testing Standards

### 1. Test Coverage Requirements

- **Minimum Coverage**: 90% line coverage
- **Method Coverage**: 100% of public methods
- **Error Paths**: All error conditions tested
- **Edge Cases**: Boundary conditions covered

### 2. Test Structure

```typescript
describe('PlatformAdapter测试', () => {
  let adapter: PlatformAdapter;
  let config: AdapterConfig;

  beforeEach(() => {
    config = createTestConfig();
    adapter = new PlatformAdapter(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities).toBeDefined();
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
    });
  });

  describe('功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功发布内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Test post'
      };

      const result = await adapter.post(content);
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理认证失败', async () => {
      const invalidAdapter = new PlatformAdapter(invalidConfig);
      await invalidAdapter.initialize();
      
      const result = await invalidAdapter.authenticate();
      expect(result).toBe(false);
    });
  });
});
```

### 3. Mock Implementation

```typescript
// Provide comprehensive mock client
private createMockClient(): PlatformClient {
  return {
    authenticate: jest.fn().mockResolvedValue({ success: true }),
    post: jest.fn().mockResolvedValue({
      id: 'mock_post_id',
      url: 'https://platform.com/posts/mock_post_id'
    }),
    getUser: jest.fn().mockResolvedValue({
      id: 'mock_user_id',
      username: 'testuser',
      displayName: 'Test User'
    })
    // ... other methods
  };
}
```

## 🔒 Security Standards

### 1. Credential Handling

```typescript
// Never log credentials
console.log('Config:', { 
  ...config, 
  auth: { ...config.auth, credentials: '[REDACTED]' } 
});

// Use environment variables
const token = process.env.PLATFORM_TOKEN || config.auth.credentials.token;

// Validate credentials format
if (!this.isValidToken(token)) {
  throw new Error('Invalid token format');
}
```

### 2. Input Sanitization

```typescript
// Sanitize user input
private sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

// Validate URLs
private isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### 3. Rate Limiting

```typescript
// Implement proper rate limiting
protected async checkRateLimit(): Promise<void> {
  if (this.rateLimiter) {
    try {
      await this.rateLimiter.consume(1);
    } catch (rateLimitError) {
      this.emit('rateLimit', {
        remaining: 0,
        resetTime: Date.now() + 60000
      });
      throw new Error('Rate limit exceeded');
    }
  }
}
```

## 📦 Packaging Standards

### 1. File Structure

```
src/platforms/yourplatform/
├── YourPlatformAdapter.ts     # Main adapter class
├── types.ts                   # Platform-specific types
├── README.md                  # Platform documentation
└── __tests__/
    └── YourPlatformAdapter.test.ts
```

### 2. Export Standards

```typescript
// Main adapter export
export { YourPlatformAdapter } from './YourPlatformAdapter';

// Type exports
export type {
  YourPlatformConfig,
  YourPlatformPost,
  YourPlatformUser
} from './types';
```

### 3. Dependencies

- Minimize external dependencies
- Use peer dependencies for shared libraries
- Document all dependencies in README
- Ensure compatibility with Node.js LTS versions

## ✅ Compliance Checklist

Before submitting an adapter, ensure:

- [ ] Extends BaseAdapter correctly
- [ ] Implements all required methods
- [ ] Declares capabilities accurately
- [ ] Includes comprehensive tests (>90% coverage)
- [ ] Follows TypeScript strict mode
- [ ] Uses proper error handling
- [ ] Implements rate limiting
- [ ] Includes documentation
- [ ] Passes all quality gates
- [ ] Includes mock client for testing
- [ ] Handles authentication properly
- [ ] Validates input content
- [ ] Emits appropriate events
- [ ] Follows naming conventions
- [ ] Includes usage examples

## 🚀 Submission Process

1. **Development**: Follow all standards above
2. **Testing**: Achieve >90% test coverage
3. **Documentation**: Complete all documentation
4. **Review**: Internal code review
5. **Validation**: Run compliance tests
6. **Integration**: Add to factory and exports
7. **Release**: Version and publish

## 📚 Resources

- [Base Adapter API](../api/base-adapter.md)
- [Testing Framework](../tools/test-framework.md)
- [Debug Monitor](../tools/debug-monitor.md)
- [Example Adapters](../examples/)

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-01  
**Maintainer**: MPLP Team
