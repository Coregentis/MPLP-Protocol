# MPLP Adapter API Design Guide

## 📋 Overview

This guide provides comprehensive standards for designing consistent, intuitive, and maintainable APIs for MPLP platform adapters. Following these guidelines ensures a unified developer experience across all adapters.

## 🎯 Design Principles

### 1. Consistency First
- All adapters should provide similar interfaces for similar functionality
- Method names and signatures should be consistent across platforms
- Error handling patterns should be uniform
- Return types should follow standard structures

### 2. Developer Experience
- APIs should be intuitive and self-documenting
- Common use cases should be simple to implement
- Advanced features should be discoverable but not overwhelming
- Clear error messages with actionable guidance

### 3. Platform Abstraction
- Hide platform-specific complexities behind unified interfaces
- Provide platform-specific features through metadata and options
- Maintain vendor neutrality in core functionality
- Allow platform-specific extensions when needed

### 4. Future-Proof Design
- Design for extensibility without breaking changes
- Use versioned interfaces and graceful degradation
- Support feature detection and capability queries
- Plan for evolving platform APIs

## 🏗️ Interface Design Standards

### 1. Core Interface Structure

```typescript
interface IPlatformAdapter {
  // Lifecycle management
  initialize(): Promise<void>;
  authenticate(): Promise<boolean>;
  disconnect(): Promise<void>;
  
  // Content operations
  post(content: ContentItem): Promise<ActionResult>;
  comment(postId: string, content: string): Promise<ActionResult>;
  share(postId: string, comment?: string): Promise<ActionResult>;
  delete(postId: string): Promise<ActionResult>;
  
  // Interaction operations
  like(postId: string): Promise<ActionResult>;
  unlike(postId: string): Promise<ActionResult>;
  follow(userId: string): Promise<ActionResult>;
  unfollow(userId: string): Promise<ActionResult>;
  
  // Data retrieval
  getProfile(userId?: string): Promise<UserProfile>;
  getContent(postId: string): Promise<ContentItem>;
  search(query: string, options?: SearchOptions): Promise<ContentItem[]>;
  getAnalytics(postId: string): Promise<ContentMetrics>;
  
  // Real-time features
  setupWebhook(url: string, events: string[]): Promise<boolean>;
  removeWebhook(webhookId: string): Promise<boolean>;
  startMonitoring(options?: MonitoringOptions): Promise<void>;
  stopMonitoring(): Promise<void>;
  
  // Configuration and status
  readonly config: AdapterConfig;
  readonly capabilities: PlatformCapabilities;
  readonly isAuthenticated: boolean;
  readonly rateLimitInfo: RateLimitInfo | null;
}
```

### 2. Method Naming Conventions

#### Action Methods (Verbs)
```typescript
// Use clear, action-oriented verbs
post()      // Create new content
comment()   // Add comment to existing content
share()     // Share/repost existing content
delete()    // Remove content
like()      // Express positive reaction
follow()    // Subscribe to user updates

// Avoid ambiguous names
create()    // Too generic - use specific action
update()    // Too generic - use edit() or modify()
remove()    // Use delete() for consistency
```

#### Query Methods (Get/Fetch)
```typescript
// Use "get" prefix for single item retrieval
getProfile()    // Get user profile
getContent()    // Get specific content item
getAnalytics()  // Get metrics for content

// Use descriptive names for collections
search()        // Search content with query
listPosts()     // Get list of posts
fetchFeed()     // Get user's feed
```

#### Boolean Methods (Is/Has/Can)
```typescript
// Use boolean prefixes for status checks
isAuthenticated()   // Check authentication status
hasPermission()     // Check user permissions
canPost()          // Check posting capability
supportsFeature()  // Check feature support
```

### 3. Parameter Design

#### Required vs Optional Parameters
```typescript
// Required parameters first, optional parameters last
post(content: ContentItem, options?: PostOptions): Promise<ActionResult>

// Use options objects for multiple optional parameters
interface PostOptions {
  scheduledTime?: Date;
  visibility?: 'public' | 'private' | 'unlisted';
  tags?: string[];
  location?: GeoLocation;
}
```

#### Parameter Validation
```typescript
// Validate parameters at method entry
public async post(content: ContentItem, options?: PostOptions): Promise<ActionResult> {
  // Validate required parameters
  if (!content || !content.content) {
    throw new Error('Content is required');
  }
  
  // Validate parameter types
  if (typeof content.content !== 'string') {
    throw new Error('Content must be a string');
  }
  
  // Validate parameter constraints
  if (content.content.length > this.capabilities.maxContentLength!) {
    throw new Error(`Content exceeds maximum length of ${this.capabilities.maxContentLength} characters`);
  }
  
  // Delegate to implementation
  return this.doPost(content, options);
}
```

## 📊 Data Structure Standards

### 1. Standard Types

#### ContentItem
```typescript
interface ContentItem {
  id?: string;                    // Platform-assigned ID
  type: ContentType;              // Content type classification
  content: string;                // Main content text
  metadata?: Record<string, any>; // Platform-specific metadata
  media?: MediaAttachment[];      // Media attachments
  tags?: string[];               // Content tags/hashtags
  mentions?: string[];           // User mentions
  location?: GeoLocation;        // Geographic location
  createdAt?: string;            // ISO timestamp
  updatedAt?: string;            // ISO timestamp
  metrics?: ContentMetrics;      // Engagement metrics
}
```

#### ActionResult
```typescript
interface ActionResult {
  success: boolean;              // Operation success status
  data?: {                       // Result data (if successful)
    id?: string;                 // Created/modified item ID
    url?: string;                // Public URL to item
    platform: string;           // Platform identifier
    [key: string]: any;          // Platform-specific data
  };
  error?: {                      // Error information (if failed)
    code: string;                // Error code
    message: string;             // Human-readable message
    details?: any;               // Additional error details
  };
  timestamp: Date;               // Operation timestamp
  metadata?: Record<string, any>; // Additional metadata
}
```

#### UserProfile
```typescript
interface UserProfile {
  id: string;                    // Platform user ID
  username: string;              // Platform username/handle
  displayName: string;           // Display name
  bio?: string;                  // User biography
  avatar?: string;               // Avatar image URL
  url?: string;                  // Profile URL
  verified?: boolean;            // Verification status
  followers?: number;            // Follower count
  following?: number;            // Following count
  metadata?: Record<string, any>; // Platform-specific data
}
```

### 2. Error Handling Standards

#### Error Types
```typescript
// Use specific error types for different scenarios
class AdapterError extends Error {
  constructor(
    message: string,
    public code: string,
    public platform: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AdapterError';
  }
}

class AuthenticationError extends AdapterError {
  constructor(platform: string, details?: any) {
    super(
      `Authentication failed for ${platform}`,
      'AUTH_FAILED',
      platform,
      details
    );
    this.name = 'AuthenticationError';
  }
}

class RateLimitError extends AdapterError {
  constructor(
    platform: string,
    public resetTime: number,
    public remaining: number = 0
  ) {
    super(
      `Rate limit exceeded for ${platform}. Resets at ${new Date(resetTime)}`,
      'RATE_LIMIT_EXCEEDED',
      platform,
      { resetTime, remaining }
    );
    this.name = 'RateLimitError';
  }
}
```

#### Error Response Format
```typescript
// Consistent error response structure
const errorResult: ActionResult = {
  success: false,
  error: {
    code: 'VALIDATION_FAILED',
    message: 'Content validation failed',
    details: {
      field: 'content',
      reason: 'Content exceeds maximum length',
      maxLength: 280,
      actualLength: 350
    }
  },
  timestamp: new Date()
};
```

### 3. Configuration Standards

#### Adapter Configuration
```typescript
interface AdapterConfig {
  // Basic identification
  platform: PlatformType;        // Platform identifier
  name: string;                   // Human-readable name
  version: string;                // Adapter version
  enabled: boolean;               // Enable/disable flag
  
  // Authentication configuration
  auth: {
    type: AuthType;               // Authentication method
    credentials: {                // Platform-specific credentials
      [key: string]: any;
    };
  };
  
  // Rate limiting configuration
  rateLimit?: {
    requests: number;             // Requests per window
    window: number;               // Time window (ms)
    burst?: number;               // Burst allowance
  };
  
  // Retry configuration
  retry?: {
    attempts: number;             // Max retry attempts
    delay: number;                // Base delay (ms)
    backoff: 'linear' | 'exponential'; // Backoff strategy
  };
  
  // Platform-specific settings
  settings?: Record<string, any>;
}
```

## 🔄 Async/Promise Standards

### 1. Promise Usage
```typescript
// All async operations must return Promises
public async post(content: ContentItem): Promise<ActionResult> {
  // Implementation
}

// Use proper error propagation
public async authenticate(): Promise<boolean> {
  try {
    const result = await this.performAuthentication();
    return result.success;
  } catch (error) {
    // Log error but don't throw for auth failures
    console.error('Authentication failed:', error);
    return false;
  }
}
```

### 2. Timeout Handling
```typescript
// Implement timeouts for all network operations
private async makeRequest(url: string, options: RequestOptions): Promise<any> {
  const timeout = this.config.settings?.timeout || 30000;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    
    throw error;
  }
}
```

## 📡 Event System Standards

### 1. Event Naming
```typescript
// Use consistent event naming patterns
adapter.on('authenticated', (info) => { /* ... */ });
adapter.on('rateLimit', (info) => { /* ... */ });
adapter.on('error', (error) => { /* ... */ });
adapter.on('webhook', (event, data) => { /* ... */ });

// Platform-specific events with namespace
adapter.on('twitter:tweet', (tweet) => { /* ... */ });
adapter.on('discord:message', (message) => { /* ... */ });
```

### 2. Event Data Structure
```typescript
// Consistent event data structure
interface AdapterEvent {
  adapter: string;               // Adapter name
  platform: string;             // Platform identifier
  timestamp: number;             // Event timestamp
  type: string;                  // Event type
  data: any;                     // Event-specific data
}

// Emit events with consistent structure
this.emit('rateLimit', {
  adapter: this.constructor.name,
  platform: this.config.platform,
  timestamp: Date.now(),
  type: 'rateLimit',
  data: {
    remaining: rateLimitInfo.remaining,
    resetTime: rateLimitInfo.resetTime,
    limit: rateLimitInfo.limit
  }
});
```

## 🧪 Testing API Standards

### 1. Mock Interface Compliance
```typescript
// Mock implementations must match real interface exactly
interface PlatformClient {
  authenticate(): Promise<AuthResult>;
  post(content: any): Promise<PostResult>;
  getUser(id: string): Promise<UserResult>;
}

// Mock must implement all methods
class MockPlatformClient implements PlatformClient {
  async authenticate(): Promise<AuthResult> {
    return { success: true, token: 'mock_token' };
  }
  
  async post(content: any): Promise<PostResult> {
    return {
      id: `mock_post_${Date.now()}`,
      url: `https://platform.com/posts/mock_post_${Date.now()}`
    };
  }
  
  async getUser(id: string): Promise<UserResult> {
    return {
      id,
      username: 'mockuser',
      displayName: 'Mock User'
    };
  }
}
```

### 2. Test Data Standards
```typescript
// Use realistic test data
const testContent: ContentItem = {
  type: 'text',
  content: 'This is a realistic test post with #hashtag and @mention',
  tags: ['hashtag'],
  mentions: ['mention'],
  metadata: {
    source: 'test',
    priority: 'normal'
  }
};

// Test edge cases
const edgeCaseContent: ContentItem[] = [
  { type: 'text', content: '' },                    // Empty content
  { type: 'text', content: 'a'.repeat(10000) },     // Very long content
  { type: 'text', content: '🚀🎉✨' },              // Unicode/emoji
  { type: 'text', content: '<script>alert("xss")</script>' } // Potential XSS
];
```

## 📚 Documentation Standards

### 1. API Documentation
```typescript
/**
 * Post content to the platform
 * 
 * Creates a new post on the platform with the provided content.
 * Supports text, images, videos, and other media types based on
 * platform capabilities.
 * 
 * @param content - The content to post
 * @param options - Optional posting configuration
 * @returns Promise resolving to action result
 * 
 * @throws {AdapterError} When content validation fails
 * @throws {AuthenticationError} When not authenticated
 * @throws {RateLimitError} When rate limit is exceeded
 * 
 * @example
 * ```typescript
 * const result = await adapter.post({
 *   type: 'text',
 *   content: 'Hello World! 🌍',
 *   tags: ['greeting', 'world']
 * });
 * 
 * if (result.success) {
 *   console.log('Posted:', result.data?.url);
 * }
 * ```
 * 
 * @since 1.0.0
 */
public async post(
  content: ContentItem,
  options?: PostOptions
): Promise<ActionResult> {
  // Implementation
}
```

### 2. Usage Examples
```typescript
// Provide comprehensive usage examples
const examples = {
  basic: `
    // Basic usage
    const adapter = new PlatformAdapter(config);
    await adapter.initialize();
    await adapter.authenticate();
    
    const result = await adapter.post({
      type: 'text',
      content: 'Hello World!'
    });
  `,
  
  advanced: `
    // Advanced usage with options
    const result = await adapter.post({
      type: 'text',
      content: 'Scheduled post with media',
      media: [{
        type: 'image',
        url: 'https://example.com/image.jpg'
      }]
    }, {
      scheduledTime: new Date('2024-01-01T12:00:00Z'),
      visibility: 'public',
      tags: ['announcement']
    });
  `,
  
  errorHandling: `
    // Error handling
    try {
      const result = await adapter.post(content);
      console.log('Success:', result.data);
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.log('Rate limited, retry after:', error.resetTime);
      } else if (error instanceof AuthenticationError) {
        console.log('Authentication required');
        await adapter.authenticate();
      } else {
        console.error('Unexpected error:', error.message);
      }
    }
  `
};
```

## ✅ API Design Checklist

Before finalizing an API design:

- [ ] Method names are consistent with other adapters
- [ ] Parameter order follows conventions (required first, options last)
- [ ] Return types use standard interfaces
- [ ] Error handling follows established patterns
- [ ] All async methods return Promises
- [ ] Timeouts are implemented for network operations
- [ ] Events follow naming conventions
- [ ] Documentation includes examples and error cases
- [ ] Mock implementations match real interfaces
- [ ] Edge cases are considered and tested
- [ ] Platform-specific features use metadata/options
- [ ] API is extensible without breaking changes

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-01  
**Maintainer**: MPLP Team
