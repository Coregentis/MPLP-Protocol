/**
 * @fileoverview Adapter utilities
 */

import { ContentItem, PlatformType, AdapterConfig } from '../core/types';

/**
 * Content validation utilities
 */
export class ContentValidator {
  /**
   * Validate content for platform
   */
  public static validateForPlatform(content: ContentItem, platform: PlatformType): boolean {
    switch (platform) {
      case 'twitter':
        return this.validateTwitterContent(content);
      case 'linkedin':
        return this.validateLinkedInContent(content);
      case 'github':
        return this.validateGitHubContent(content);
      default:
        return true;
    }
  }

  /**
   * Validate Twitter content
   */
  private static validateTwitterContent(content: ContentItem): boolean {
    if (content.content.length > 280) return false;
    
    // Check mention limits
    const mentions = content.content.match(/@\w+/g) || [];
    if (mentions.length > 10) return false;
    
    // Check hashtag limits
    const hashtags = content.content.match(/#\w+/g) || [];
    if (hashtags.length > 10) return false;
    
    return true;
  }

  /**
   * Validate LinkedIn content
   */
  private static validateLinkedInContent(content: ContentItem): boolean {
    if (content.content.length > 3000) return false;
    return true;
  }

  /**
   * Validate GitHub content
   */
  private static validateGitHubContent(content: ContentItem): boolean {
    if (content.content.length > 65536) return false;
    return true;
  }
}

/**
 * Content transformation utilities
 */
export class ContentTransformer {
  /**
   * Transform content for platform
   */
  public static transformForPlatform(content: ContentItem, platform: PlatformType): ContentItem {
    const transformed = { ...content };

    switch (platform) {
      case 'twitter':
        return this.transformForTwitter(transformed);
      case 'linkedin':
        return this.transformForLinkedIn(transformed);
      case 'github':
        return this.transformForGitHub(transformed);
      default:
        return transformed;
    }
  }

  /**
   * Transform content for Twitter
   */
  private static transformForTwitter(content: ContentItem): ContentItem {
    // Add hashtags if specified
    if (content.tags && content.tags.length > 0) {
      const hashtags = content.tags.map(tag => `#${tag}`).join(' ');
      content.content = `${content.content} ${hashtags}`;
    }

    // Add mentions if specified
    if (content.mentions && content.mentions.length > 0) {
      const mentions = content.mentions.map(mention => `@${mention}`).join(' ');
      content.content = `${mentions} ${content.content}`;
    }

    // Truncate if too long
    if (content.content.length > 280) {
      content.content = content.content.substring(0, 277) + '...';
    }

    return content;
  }

  /**
   * Transform content for LinkedIn
   */
  private static transformForLinkedIn(content: ContentItem): ContentItem {
    // LinkedIn supports longer content, so we can be more descriptive
    if (content.tags && content.tags.length > 0) {
      const hashtags = content.tags.map(tag => `#${tag}`).join(' ');
      content.content = `${content.content}\n\n${hashtags}`;
    }

    return content;
  }

  /**
   * Transform content for GitHub
   */
  private static transformForGitHub(content: ContentItem): ContentItem {
    // GitHub uses Markdown, so we can format accordingly
    if (content.metadata?.type === 'issue' && !content.metadata.title) {
      // Extract title from first line
      const lines = content.content.split('\n');
      content.metadata.title = lines[0].substring(0, 100);
      content.content = lines.slice(1).join('\n');
    }

    return content;
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimitHelper {
  /**
   * Calculate delay for exponential backoff
   */
  public static calculateBackoffDelay(attempt: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  }

  /**
   * Calculate delay for linear backoff
   */
  public static calculateLinearDelay(attempt: number, baseDelay: number = 1000): number {
    return baseDelay * (attempt + 1);
  }

  /**
   * Check if rate limit is exceeded
   */
  public static isRateLimited(rateLimitInfo: any): boolean {
    if (!rateLimitInfo) return false;
    return rateLimitInfo.remaining <= 0 && new Date() < rateLimitInfo.reset;
  }

  /**
   * Get time until rate limit reset
   */
  public static getTimeUntilReset(rateLimitInfo: any): number {
    if (!rateLimitInfo || !rateLimitInfo.reset) return 0;
    return Math.max(0, rateLimitInfo.reset.getTime() - Date.now());
  }
}

/**
 * Configuration utilities
 */
export class ConfigHelper {
  /**
   * Merge configurations
   */
  public static mergeConfigs(base: Partial<AdapterConfig>, override: Partial<AdapterConfig>): AdapterConfig {
    return {
      ...base,
      ...override,
      auth: {
        ...base.auth,
        ...override.auth,
        credentials: {
          ...base.auth?.credentials,
          ...override.auth?.credentials
        }
      },
      rateLimit: {
        ...base.rateLimit,
        ...override.rateLimit
      },
      retry: {
        ...base.retry,
        ...override.retry
      },
      settings: {
        ...base.settings,
        ...override.settings
      }
    } as AdapterConfig;
  }

  /**
   * Validate configuration completeness
   */
  public static validateConfig(config: AdapterConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.platform) errors.push('Platform is required');
    if (!config.name) errors.push('Name is required');
    if (!config.version) errors.push('Version is required');
    if (!config.auth) errors.push('Auth configuration is required');
    if (!config.auth?.type) errors.push('Auth type is required');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize configuration for logging
   */
  public static sanitizeConfig(config: AdapterConfig): Partial<AdapterConfig> {
    const sanitized = { ...config };
    
    // Remove sensitive information
    if (sanitized.auth?.credentials) {
      sanitized.auth.credentials = Object.keys(sanitized.auth.credentials).reduce((acc, key) => {
        acc[key] = '***';
        return acc;
      }, {} as Record<string, any>);
    }

    return sanitized;
  }
}

/**
 * URL and link utilities
 */
export class UrlHelper {
  /**
   * Extract URLs from text
   */
  public static extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }

  /**
   * Shorten URLs for platforms with character limits
   */
  public static shortenUrls(text: string, maxLength: number = 23): string {
    const urls = this.extractUrls(text);
    let result = text;

    urls.forEach(url => {
      if (url.length > maxLength) {
        const shortened = url.substring(0, maxLength - 3) + '...';
        result = result.replace(url, shortened);
      }
    });

    return result;
  }

  /**
   * Build platform-specific URLs
   */
  public static buildPlatformUrl(platform: PlatformType, type: string, id: string): string {
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/user/status/${id}`;
      case 'linkedin':
        return `https://www.linkedin.com/feed/update/${id}`;
      case 'github':
        return `https://github.com/${id}`;
      default:
        return '';
    }
  }
}

/**
 * Error handling utilities
 */
export class ErrorHelper {
  /**
   * Create standardized error response
   */
  public static createErrorResult(error: Error | string, metadata?: any): any {
    return {
      success: false,
      error: typeof error === 'string' ? error : error.message,
      metadata,
      timestamp: new Date()
    };
  }

  /**
   * Check if error is rate limit related
   */
  public static isRateLimitError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('rate limit') || 
           message.includes('too many requests') ||
           error.status === 429;
  }

  /**
   * Check if error is authentication related
   */
  public static isAuthError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('unauthorized') || 
           message.includes('authentication') ||
           error.status === 401;
  }

  /**
   * Get retry delay from error
   */
  public static getRetryDelay(error: any): number {
    if (error.retryAfter) {
      return error.retryAfter * 1000; // Convert to milliseconds
    }
    
    if (this.isRateLimitError(error)) {
      return 60000; // 1 minute default for rate limits
    }
    
    return 5000; // 5 seconds default
  }
}

/**
 * Analytics utilities
 */
export class AnalyticsHelper {
  /**
   * Calculate engagement rate
   */
  public static calculateEngagementRate(metrics: any): number {
    const { likes = 0, shares = 0, comments = 0, views = 0 } = metrics;
    
    if (views === 0) return 0;
    
    const totalEngagement = likes + shares + comments;
    return (totalEngagement / views) * 100;
  }

  /**
   * Aggregate metrics from multiple platforms
   */
  public static aggregateMetrics(metricsMap: Map<string, any>): any {
    const aggregated = {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      clicks: 0,
      impressions: 0,
      reach: 0
    };

    metricsMap.forEach(metrics => {
      Object.keys(aggregated).forEach(key => {
        if (metrics[key]) {
          aggregated[key as keyof typeof aggregated] += metrics[key];
        }
      });
    });

    return {
      ...aggregated,
      engagement: this.calculateEngagementRate(aggregated),
      platforms: metricsMap.size
    };
  }
}
