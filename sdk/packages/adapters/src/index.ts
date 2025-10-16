/**
 * @fileoverview MPLP Platform Adapters - Main exports
 */

// Core exports
export * from './core/types';
export { BaseAdapter } from './core/BaseAdapter';
export { AdapterFactory } from './core/AdapterFactory';
export { AdapterManager } from './core/AdapterManager';

// Platform adapters
export { TwitterAdapter } from './platforms/twitter/TwitterAdapter';
export { LinkedInAdapter } from './platforms/linkedin/LinkedInAdapter';
export { GitHubAdapter } from './platforms/github/GitHubAdapter';
export { DiscordAdapter } from './platforms/discord/DiscordAdapter';
export { SlackAdapter } from './platforms/slack/SlackAdapter';
export { RedditAdapter } from './platforms/reddit/RedditAdapter';
export { MediumAdapter } from './platforms/medium/MediumAdapter';

// Utilities
export * from './utils';

// Re-export commonly used types for convenience
export type {
  IPlatformAdapter,
  IAdapterFactory,
  IAdapterManager,
  AdapterConfig,
  PlatformCapabilities,
  ContentItem,
  ActionResult,
  UserProfile,
  ContentMetrics,
  WebhookEvent,
  RateLimitInfo
} from './core/types';
