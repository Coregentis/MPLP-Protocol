/**
 * @fileoverview Platform adapter factory
 */

import { IAdapterFactory, IPlatformAdapter, PlatformType, AdapterConfig } from './types';
import { TwitterAdapter } from '../platforms/twitter/TwitterAdapter';
import { LinkedInAdapter } from '../platforms/linkedin/LinkedInAdapter';
import { GitHubAdapter } from '../platforms/github/GitHubAdapter';
import { DiscordAdapter } from '../platforms/discord/DiscordAdapter';
import { SlackAdapter } from '../platforms/slack/SlackAdapter';
import { RedditAdapter } from '../platforms/reddit/RedditAdapter';
import { MediumAdapter } from '../platforms/medium/MediumAdapter';

/**
 * Platform adapter factory
 */
export class AdapterFactory implements IAdapterFactory {
  private static instance?: AdapterFactory;

  /**
   * Get singleton instance
   */
  public static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }
    return AdapterFactory.instance;
  }

  /**
   * Create platform adapter
   */
  public createAdapter(platform: PlatformType, config: AdapterConfig): IPlatformAdapter {
    switch (platform) {
      case 'twitter':
        return new TwitterAdapter(config);
        
      case 'linkedin':
        return new LinkedInAdapter(config);
        
      case 'github':
        return new GitHubAdapter(config);

      case 'discord':
        return new DiscordAdapter(config);

      case 'slack':
        return new SlackAdapter(config);

      case 'reddit':
        return new RedditAdapter(config);

      case 'medium':
        return new MediumAdapter(config);

      case 'telegram':
      case 'custom':
        throw new Error(`Platform ${platform} not yet implemented`);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Get supported platforms
   */
  public getSupportedPlatforms(): PlatformType[] {
    return ['twitter', 'linkedin', 'github', 'discord', 'slack', 'reddit', 'medium'];
  }

  /**
   * Get default configuration for platform
   */
  public getDefaultConfig(platform: PlatformType): Partial<AdapterConfig> {
    const baseConfig = {
      enabled: true,
      rateLimit: {
        requests: 100,
        window: 60000, // 1 minute
      },
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential' as const
      }
    };

    switch (platform) {
      case 'twitter':
        return {
          ...baseConfig,
          platform,
          name: 'Twitter Adapter',
          version: '1.0.0',
          auth: {
            type: 'oauth1',
            credentials: {}
          },
          rateLimit: {
            requests: 300, // Twitter's rate limit
            window: 900000, // 15 minutes
          }
        };

      case 'linkedin':
        return {
          ...baseConfig,
          platform,
          name: 'LinkedIn Adapter',
          version: '1.0.0',
          auth: {
            type: 'oauth2',
            credentials: {}
          },
          rateLimit: {
            requests: 100,
            window: 86400000, // 24 hours
          }
        };

      case 'github':
        return {
          ...baseConfig,
          platform,
          name: 'GitHub Adapter',
          version: '1.0.0',
          auth: {
            type: 'bearer',
            credentials: {}
          },
          rateLimit: {
            requests: 5000, // GitHub's rate limit
            window: 3600000, // 1 hour
          }
        };

      case 'discord':
        return {
          ...baseConfig,
          platform,
          name: 'Discord Adapter',
          version: '1.0.0',
          auth: {
            type: 'bearer',
            credentials: {}
          },
          rateLimit: {
            requests: 50, // Discord's rate limit per second
            window: 1000, // 1 second
          }
        };

      case 'slack':
        return {
          ...baseConfig,
          platform,
          name: 'Slack Adapter',
          version: '1.0.0',
          auth: {
            type: 'bearer',
            credentials: {}
          },
          rateLimit: {
            requests: 1, // Slack's rate limit per second
            window: 1000, // 1 second
          }
        };

      case 'reddit':
        return {
          ...baseConfig,
          platform,
          name: 'Reddit Adapter',
          version: '1.0.0',
          auth: {
            type: 'oauth2',
            credentials: {}
          },
          rateLimit: {
            requests: 60, // Reddit's rate limit
            window: 60000, // 1 minute
          }
        };

      case 'medium':
        return {
          ...baseConfig,
          platform,
          name: 'Medium Adapter',
          version: '1.0.0',
          auth: {
            type: 'bearer',
            credentials: {}
          },
          rateLimit: {
            requests: 1000, // Medium's rate limit
            window: 3600000, // 1 hour
          }
        };

      default:
        return baseConfig;
    }
  }

  /**
   * Validate adapter configuration
   */
  public validateConfig(config: AdapterConfig): boolean {
    // Basic validation
    if (!config.platform || !config.name || !config.version) {
      return false;
    }

    if (!config.auth || !config.auth.type) {
      return false;
    }

    // Platform-specific validation
    switch (config.platform) {
      case 'twitter':
        return this.validateTwitterConfig(config);
        
      case 'linkedin':
        return this.validateLinkedInConfig(config);
        
      case 'github':
        return this.validateGitHubConfig(config);
        
      default:
        return true;
    }
  }

  /**
   * Validate Twitter configuration
   */
  private validateTwitterConfig(config: AdapterConfig): boolean {
    if (config.auth.type !== 'oauth1') {
      return false;
    }

    const required = ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'];
    return required.every(key => config.auth.credentials[key]);
  }

  /**
   * Validate LinkedIn configuration
   */
  private validateLinkedInConfig(config: AdapterConfig): boolean {
    if (config.auth.type !== 'oauth2') {
      return false;
    }

    const required = ['clientId', 'clientSecret', 'accessToken'];
    return required.every(key => config.auth.credentials[key]);
  }

  /**
   * Validate GitHub configuration
   */
  private validateGitHubConfig(config: AdapterConfig): boolean {
    if (config.auth.type !== 'bearer') {
      return false;
    }

    return !!config.auth.credentials.token;
  }

  /**
   * Create adapter with validation
   */
  public createValidatedAdapter(platform: PlatformType, config: AdapterConfig): IPlatformAdapter {
    if (!this.validateConfig(config)) {
      throw new Error(`Invalid configuration for platform: ${platform}`);
    }

    return this.createAdapter(platform, config);
  }

  /**
   * Get platform-specific configuration template
   */
  public getConfigTemplate(platform: PlatformType): Record<string, any> {
    switch (platform) {
      case 'twitter':
        return {
          auth: {
            type: 'oauth1',
            credentials: {
              apiKey: 'YOUR_TWITTER_API_KEY',
              apiSecret: 'YOUR_TWITTER_API_SECRET',
              accessToken: 'YOUR_TWITTER_ACCESS_TOKEN',
              accessTokenSecret: 'YOUR_TWITTER_ACCESS_TOKEN_SECRET'
            }
          },
          settings: {
            enableRetweets: true,
            enableMentionMonitoring: true,
            defaultHashtags: []
          }
        };

      case 'linkedin':
        return {
          auth: {
            type: 'oauth2',
            credentials: {
              clientId: 'YOUR_LINKEDIN_CLIENT_ID',
              clientSecret: 'YOUR_LINKEDIN_CLIENT_SECRET',
              accessToken: 'YOUR_LINKEDIN_ACCESS_TOKEN'
            }
          },
          settings: {
            defaultVisibility: 'PUBLIC',
            enableCompanyPages: false
          }
        };

      case 'github':
        return {
          auth: {
            type: 'bearer',
            credentials: {
              token: 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'
            }
          },
          settings: {
            defaultRepository: 'owner/repo',
            enableWebhooks: true,
            webhookSecret: 'YOUR_WEBHOOK_SECRET'
          }
        };

      default:
        return {};
    }
  }

  /**
   * Get platform capabilities
   */
  public getPlatformCapabilities(platform: PlatformType): Record<string, any> {
    const adapter = this.createAdapter(platform, {
      platform,
      name: 'temp',
      version: '1.0.0',
      enabled: true,
      auth: { type: 'bearer', credentials: {} }
    });

    return {
      platform,
      capabilities: adapter.capabilities,
      features: {
        posting: adapter.capabilities.canPost,
        commenting: adapter.capabilities.canComment,
        sharing: adapter.capabilities.canShare,
        liking: adapter.capabilities.canLike,
        following: adapter.capabilities.canFollow,
        messaging: adapter.capabilities.canMessage,
        webhooks: adapter.capabilities.supportsWebhooks,
        analytics: adapter.capabilities.supportsAnalytics,
        scheduling: adapter.capabilities.supportsScheduling
      },
      limits: {
        maxContentLength: adapter.capabilities.maxContentLength,
        maxMediaSize: adapter.capabilities.maxMediaSize,
        supportedContentTypes: adapter.capabilities.supportedContentTypes
      }
    };
  }

  /**
   * Create multiple adapters from configuration
   */
  public createAdaptersFromConfig(configs: Record<string, AdapterConfig>): Map<string, IPlatformAdapter> {
    const adapters = new Map<string, IPlatformAdapter>();

    for (const [name, config] of Object.entries(configs)) {
      try {
        const adapter = this.createValidatedAdapter(config.platform, config);
        adapters.set(name, adapter);
      } catch (error) {
        console.error(`Failed to create adapter ${name}:`, error);
      }
    }

    return adapters;
  }

  /**
   * Get adapter information
   */
  public getAdapterInfo(platform: PlatformType): Record<string, any> {
    return {
      platform,
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Adapter`,
      description: `Official ${platform} platform adapter for MPLP`,
      version: '1.0.0',
      capabilities: this.getPlatformCapabilities(platform),
      configTemplate: this.getConfigTemplate(platform),
      documentation: `https://docs.mplp.org/adapters/${platform}`
    };
  }
}
