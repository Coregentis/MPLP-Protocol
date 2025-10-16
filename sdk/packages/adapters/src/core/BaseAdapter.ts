/**
 * @fileoverview Base platform adapter implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */

import { MPLPEventManager } from './MPLPEventManager';
// import { RateLimiterMemory } from 'rate-limiter-flexible';
import {
  IPlatformAdapter,
  AdapterConfig,
  PlatformCapabilities,
  ContentItem,
  ActionResult,
  UserProfile,
  RateLimitInfo,
  WebhookEvent
} from './types';

/**
 * Base platform adapter class - 基于MPLP V1.0 Alpha事件架构
 */
export abstract class BaseAdapter implements IPlatformAdapter {
  protected eventManager: MPLPEventManager;
  protected rateLimiter?: any; // RateLimiterMemory;
  protected _isAuthenticated = false;
  protected _rateLimitInfo: RateLimitInfo | null = null;
  protected monitoringActive = false;

  constructor(
    public readonly config: AdapterConfig,
    public readonly capabilities: PlatformCapabilities
  ) {
    this.eventManager = new MPLPEventManager();
    this.setupRateLimiter();
  }

  /**
   * Get authentication status
   */
  public get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  /**
   * Get rate limit info
   */
  public get rateLimitInfo(): RateLimitInfo | null {
    return this._rateLimitInfo;
  }

  // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====

  /**
   * EventEmitter兼容的on方法
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的emit方法
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * EventEmitter兼容的off方法
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的removeAllListeners方法
   */
  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Initialize the adapter
   */
  public async initialize(): Promise<void> {
    try {
      await this.doInitialize();
      this.emit('adapter:ready', this);
    } catch (error) {
      this.emit('adapter:error', this, error as Error);
      throw error;
    }
  }

  /**
   * Authenticate with the platform
   */
  public async authenticate(): Promise<boolean> {
    try {
      const result = await this.doAuthenticate();
      this._isAuthenticated = result;
      
      if (result) {
        this.emit('authenticated');
      } else {
        this.emit('authentication:failed');
      }
      
      return result;
    } catch (error) {
      this.emit('adapter:error', this, error as Error);
      return false;
    }
  }

  /**
   * Disconnect from the platform
   */
  public async disconnect(): Promise<void> {
    try {
      await this.stopMonitoring();
      await this.doDisconnect();
      this._isAuthenticated = false;
      this.emit('disconnected');
    } catch (error) {
      this.emit('adapter:error', this, error as Error);
      throw error;
    }
  }

  /**
   * Post content to the platform
   */
  public async post(content: ContentItem): Promise<ActionResult> {
    await this.checkRateLimit();
    
    if (!this.capabilities.canPost) {
      throw new Error(`Platform ${this.config.platform} does not support posting`);
    }

    if (!await this.validateContent(content)) {
      throw new Error('Content validation failed');
    }

    try {
      const result = await this.doPost(content);
      this.emit('content:posted', this, result);
      return result;
    } catch (error) {
      const result: ActionResult = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      this.emit('adapter:error', this, error as Error);
      return result;
    }
  }

  /**
   * Comment on a post
   */
  public async comment(postId: string, content: string): Promise<ActionResult> {
    await this.checkRateLimit();
    
    if (!this.capabilities.canComment) {
      throw new Error(`Platform ${this.config.platform} does not support commenting`);
    }

    try {
      const result = await this.doComment(postId, content);
      this.emit('content:commented', this, result);
      return result;
    } catch (error) {
      const result: ActionResult = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      this.emit('adapter:error', this, error as Error);
      return result;
    }
  }

  /**
   * Share a post
   */
  public async share(postId: string, comment?: string): Promise<ActionResult> {
    await this.checkRateLimit();
    
    if (!this.capabilities.canShare) {
      throw new Error(`Platform ${this.config.platform} does not support sharing`);
    }

    try {
      const result = await this.doShare(postId, comment);
      this.emit('content:shared', this, result);
      return result;
    } catch (error) {
      const result: ActionResult = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      this.emit('adapter:error', this, error as Error);
      return result;
    }
  }

  /**
   * Delete a post
   */
  public async delete(postId: string): Promise<ActionResult> {
    await this.checkRateLimit();
    
    if (!this.capabilities.canDelete) {
      throw new Error(`Platform ${this.config.platform} does not support deletion`);
    }

    try {
      const result = await this.doDelete(postId);
      return result;
    } catch (error) {
      const result: ActionResult = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      this.emit('adapter:error', this, error as Error);
      return result;
    }
  }

  /**
   * Like a post
   */
  public async like(postId: string): Promise<ActionResult> {
    await this.checkRateLimit();
    
    if (!this.capabilities.canLike) {
      throw new Error(`Platform ${this.config.platform} does not support liking`);
    }

    try {
      const result = await this.doLike(postId);
      this.emit('content:liked', this, result);
      return result;
    } catch (error) {
      const result: ActionResult = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      this.emit('adapter:error', this, error as Error);
      return result;
    }
  }

  /**
   * Unlike a post
   */
  public async unlike(postId: string): Promise<ActionResult> {
    await this.checkRateLimit();
    
    try {
      const result = await this.doUnlike(postId);
      return result;
    } catch (error) {
      const result: ActionResult = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      this.emit('adapter:error', this, error as Error);
      return result;
    }
  }

  /**
   * Follow a user
   */
  public async follow(userId: string): Promise<ActionResult> {
    await this.checkRateLimit();
    
    if (!this.capabilities.canFollow) {
      throw new Error(`Platform ${this.config.platform} does not support following`);
    }

    try {
      const result = await this.doFollow(userId);
      return result;
    } catch (error) {
      const result: ActionResult = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      this.emit('adapter:error', this, error as Error);
      return result;
    }
  }

  /**
   * Unfollow a user
   */
  public async unfollow(userId: string): Promise<ActionResult> {
    await this.checkRateLimit();
    
    try {
      const result = await this.doUnfollow(userId);
      return result;
    } catch (error) {
      const result: ActionResult = {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
      this.emit('adapter:error', this, error as Error);
      return result;
    }
  }

  /**
   * Start monitoring for events
   */
  public async startMonitoring(options?: any): Promise<void> {
    if (this.monitoringActive) {
      return;
    }

    try {
      await this.doStartMonitoring(options);
      this.monitoringActive = true;
      this.emit('monitoring:started');
    } catch (error) {
      this.emit('adapter:error', this, error as Error);
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  public async stopMonitoring(): Promise<void> {
    if (!this.monitoringActive) {
      return;
    }

    try {
      await this.doStopMonitoring();
      this.monitoringActive = false;
      this.emit('monitoring:stopped');
    } catch (error) {
      this.emit('adapter:error', this, error as Error);
      throw error;
    }
  }

  /**
   * Validate content before posting
   */
  public async validateContent(content: ContentItem): Promise<boolean> {
    // Check content length
    if (this.capabilities.maxContentLength && 
        content.content.length > this.capabilities.maxContentLength) {
      return false;
    }

    // Check content type support
    if (!this.capabilities.supportedContentTypes.includes(content.type)) {
      return false;
    }

    // Check media attachments
    if (content.media) {
      for (const media of content.media) {
        if (this.capabilities.maxMediaSize && 
            media.size && media.size > this.capabilities.maxMediaSize) {
          return false;
        }
      }
    }

    // Platform-specific validation
    return await this.doValidateContent(content);
  }

  /**
   * Setup rate limiter
   */
  private setupRateLimiter(): void {
    if (this.config.rateLimit) {
      // Rate limiter would be initialized here
      // this.rateLimiter = new RateLimiterMemory({
      //   points: this.config.rateLimit.requests,
      //   duration: Math.floor(this.config.rateLimit.window / 1000),
      // });
    }
  }

  /**
   * Check rate limit before making requests
   */
  protected async checkRateLimit(): Promise<void> {
    if (this.rateLimiter) {
      try {
        await this.rateLimiter.consume(this.config.platform);
      } catch (rateLimiterRes) {
        const info: RateLimitInfo = {
          limit: this.config.rateLimit!.requests,
          remaining: 0,
          reset: new Date(Date.now() + (rateLimiterRes as any).msBeforeNext),
          retryAfter: Math.ceil((rateLimiterRes as any).msBeforeNext / 1000)
        };
        
        this._rateLimitInfo = info;
        this.emit('adapter:ratelimit', this, info);
        
        throw new Error(`Rate limit exceeded. Retry after ${info.retryAfter} seconds`);
      }
    }
  }

  /**
   * Handle webhook events
   */
  protected handleWebhookEvent(event: WebhookEvent): void {
    this.emit('webhook:received', this, event);
    
    // Handle specific event types
    switch (event.type) {
      case 'mention':
        this.emit('mention:received', this, event.data);
        break;
      case 'message':
        this.emit('message:received', this, event.data);
        break;
      default:
        // Handle other event types
        break;
    }
  }

  // Abstract methods to be implemented by concrete adapters
  protected abstract doInitialize(): Promise<void>;
  protected abstract doAuthenticate(): Promise<boolean>;
  protected abstract doDisconnect(): Promise<void>;
  
  protected abstract doPost(content: ContentItem): Promise<ActionResult>;
  protected abstract doComment(postId: string, content: string): Promise<ActionResult>;
  protected abstract doShare(postId: string, comment?: string): Promise<ActionResult>;
  protected abstract doDelete(postId: string): Promise<ActionResult>;
  
  protected abstract doLike(postId: string): Promise<ActionResult>;
  protected abstract doUnlike(postId: string): Promise<ActionResult>;
  protected abstract doFollow(userId: string): Promise<ActionResult>;
  protected abstract doUnfollow(userId: string): Promise<ActionResult>;
  
  public abstract getProfile(userId?: string): Promise<UserProfile>;
  public abstract getContent(postId: string): Promise<ContentItem>;
  public abstract search(query: string, options?: any): Promise<ContentItem[]>;
  public abstract getAnalytics(postId: string): Promise<any>;
  
  public abstract setupWebhook(url: string, events: string[]): Promise<boolean>;
  public abstract removeWebhook(webhookId: string): Promise<boolean>;
  
  protected abstract doStartMonitoring(options?: any): Promise<void>;
  protected abstract doStopMonitoring(): Promise<void>;
  protected abstract doValidateContent(content: ContentItem): Promise<boolean>;
}
