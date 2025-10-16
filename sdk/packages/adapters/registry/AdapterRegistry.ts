/**
 * @fileoverview Adapter Registry - Central registry for platform adapters
 */

import { EventEmitter } from 'events';
import { PlatformType, PlatformCapabilities, AdapterConfig } from '../src/core/types';

/**
 * Adapter registry entry
 */
export interface AdapterRegistryEntry {
  id: string;                    // Unique adapter ID
  name: string;                  // Human-readable name
  platform: PlatformType;       // Platform type
  version: string;               // Adapter version
  description: string;           // Description
  author: string;                // Author information
  homepage?: string;             // Homepage URL
  repository?: string;           // Repository URL
  license: string;               // License type
  keywords: string[];            // Search keywords
  capabilities: PlatformCapabilities; // Platform capabilities
  dependencies: string[];        // Required dependencies
  peerDependencies: string[];    // Peer dependencies
  minimumNodeVersion: string;    // Minimum Node.js version
  status: 'active' | 'deprecated' | 'experimental'; // Status
  rating: {                      // Community rating
    average: number;             // Average rating (1-5)
    count: number;               // Number of ratings
  };
  downloads: {                   // Download statistics
    total: number;               // Total downloads
    monthly: number;             // Monthly downloads
    weekly: number;              // Weekly downloads
  };
  createdAt: Date;              // Registration date
  updatedAt: Date;              // Last update date
  verifiedAt?: Date;            // Verification date
  tags: string[];               // Classification tags
  metadata: Record<string, any>; // Additional metadata
}

/**
 * Registry search options
 */
export interface RegistrySearchOptions {
  query?: string;               // Search query
  platform?: PlatformType;     // Filter by platform
  status?: string;              // Filter by status
  tags?: string[];              // Filter by tags
  author?: string;              // Filter by author
  minRating?: number;           // Minimum rating
  sortBy?: 'name' | 'rating' | 'downloads' | 'updated'; // Sort criteria
  sortOrder?: 'asc' | 'desc';   // Sort order
  limit?: number;               // Result limit
  offset?: number;              // Result offset
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  totalAdapters: number;
  activeAdapters: number;
  deprecatedAdapters: number;
  experimentalAdapters: number;
  platformCounts: Record<PlatformType, number>;
  totalDownloads: number;
  monthlyDownloads: number;
  averageRating: number;
  topAuthors: { author: string; count: number }[];
  popularTags: { tag: string; count: number }[];
}

/**
 * Central registry for platform adapters
 */
export class AdapterRegistry extends EventEmitter {
  private entries: Map<string, AdapterRegistryEntry> = new Map();
  private platformIndex: Map<PlatformType, Set<string>> = new Map();
  private authorIndex: Map<string, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map();

  constructor() {
    super();
    this.initializeBuiltinAdapters();
  }

  /**
   * Register a new adapter
   */
  public async registerAdapter(entry: Omit<AdapterRegistryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateAdapterId(entry.name, entry.platform);
    
    // Check if adapter already exists
    if (this.entries.has(id)) {
      throw new Error(`Adapter ${id} is already registered`);
    }

    // Validate entry
    this.validateEntry(entry);

    // Create full entry
    const fullEntry: AdapterRegistryEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store entry
    this.entries.set(id, fullEntry);

    // Update indexes
    this.updateIndexes(id, fullEntry);

    // Emit event
    this.emit('adapterRegistered', { id, entry: fullEntry });

    console.log(`✅ Registered adapter: ${id}`);
    return id;
  }

  /**
   * Update existing adapter
   */
  public async updateAdapter(id: string, updates: Partial<AdapterRegistryEntry>): Promise<void> {
    const existing = this.entries.get(id);
    if (!existing) {
      throw new Error(`Adapter ${id} not found`);
    }

    // Remove from old indexes
    this.removeFromIndexes(id, existing);

    // Apply updates
    const updated: AdapterRegistryEntry = {
      ...existing,
      ...updates,
      id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    // Validate updated entry
    this.validateEntry(updated);

    // Store updated entry
    this.entries.set(id, updated);

    // Update indexes
    this.updateIndexes(id, updated);

    // Emit event
    this.emit('adapterUpdated', { id, entry: updated, previous: existing });

    console.log(`✅ Updated adapter: ${id}`);
  }

  /**
   * Unregister adapter
   */
  public async unregisterAdapter(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new Error(`Adapter ${id} not found`);
    }

    // Remove from storage
    this.entries.delete(id);

    // Remove from indexes
    this.removeFromIndexes(id, entry);

    // Emit event
    this.emit('adapterUnregistered', { id, entry });

    console.log(`✅ Unregistered adapter: ${id}`);
  }

  /**
   * Get adapter by ID
   */
  public getAdapter(id: string): AdapterRegistryEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Search adapters
   */
  public searchAdapters(options: RegistrySearchOptions = {}): AdapterRegistryEntry[] {
    let results = Array.from(this.entries.values());

    // Apply filters
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(entry =>
        entry.name.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    if (options.platform) {
      results = results.filter(entry => entry.platform === options.platform);
    }

    if (options.status) {
      results = results.filter(entry => entry.status === options.status);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(entry =>
        options.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    if (options.author) {
      results = results.filter(entry => entry.author === options.author);
    }

    if (options.minRating) {
      results = results.filter(entry => entry.rating.average >= options.minRating!);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'name';
    const sortOrder = options.sortOrder || 'asc';
    
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = a.rating.average - b.rating.average;
          break;
        case 'downloads':
          comparison = a.downloads.total - b.downloads.total;
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      results = results.slice(start, end);
    }

    return results;
  }

  /**
   * Get adapters by platform
   */
  public getAdaptersByPlatform(platform: PlatformType): AdapterRegistryEntry[] {
    const adapterIds = this.platformIndex.get(platform) || new Set();
    return Array.from(adapterIds)
      .map(id => this.entries.get(id)!)
      .filter(Boolean);
  }

  /**
   * Get adapters by author
   */
  public getAdaptersByAuthor(author: string): AdapterRegistryEntry[] {
    const adapterIds = this.authorIndex.get(author) || new Set();
    return Array.from(adapterIds)
      .map(id => this.entries.get(id)!)
      .filter(Boolean);
  }

  /**
   * Get registry statistics
   */
  public getStats(): RegistryStats {
    const entries = Array.from(this.entries.values());
    
    const stats: RegistryStats = {
      totalAdapters: entries.length,
      activeAdapters: entries.filter(e => e.status === 'active').length,
      deprecatedAdapters: entries.filter(e => e.status === 'deprecated').length,
      experimentalAdapters: entries.filter(e => e.status === 'experimental').length,
      platformCounts: {} as Record<PlatformType, number>,
      totalDownloads: entries.reduce((sum, e) => sum + e.downloads.total, 0),
      monthlyDownloads: entries.reduce((sum, e) => sum + e.downloads.monthly, 0),
      averageRating: entries.reduce((sum, e) => sum + e.rating.average, 0) / entries.length || 0,
      topAuthors: [],
      popularTags: []
    };

    // Calculate platform counts
    for (const entry of entries) {
      stats.platformCounts[entry.platform] = (stats.platformCounts[entry.platform] || 0) + 1;
    }

    // Calculate top authors
    const authorCounts = new Map<string, number>();
    for (const entry of entries) {
      authorCounts.set(entry.author, (authorCounts.get(entry.author) || 0) + 1);
    }
    stats.topAuthors = Array.from(authorCounts.entries())
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate popular tags
    const tagCounts = new Map<string, number>();
    for (const entry of entries) {
      for (const tag of entry.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
    stats.popularTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return stats;
  }

  /**
   * Rate adapter
   */
  public async rateAdapter(id: string, rating: number, userId: string): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const entry = this.entries.get(id);
    if (!entry) {
      throw new Error(`Adapter ${id} not found`);
    }

    // In a real implementation, you would store individual ratings
    // and calculate the average. For this example, we'll simulate it.
    const newCount = entry.rating.count + 1;
    const newAverage = ((entry.rating.average * entry.rating.count) + rating) / newCount;

    await this.updateAdapter(id, {
      rating: {
        average: Math.round(newAverage * 100) / 100,
        count: newCount
      }
    });

    this.emit('adapterRated', { id, rating, userId, newAverage });
  }

  /**
   * Increment download count
   */
  public async incrementDownloads(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new Error(`Adapter ${id} not found`);
    }

    await this.updateAdapter(id, {
      downloads: {
        total: entry.downloads.total + 1,
        monthly: entry.downloads.monthly + 1,
        weekly: entry.downloads.weekly + 1
      }
    });

    this.emit('adapterDownloaded', { id });
  }

  /**
   * Verify adapter
   */
  public async verifyAdapter(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new Error(`Adapter ${id} not found`);
    }

    await this.updateAdapter(id, {
      verifiedAt: new Date()
    });

    this.emit('adapterVerified', { id });
  }

  /**
   * Export registry data
   */
  public exportRegistry(): AdapterRegistryEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Import registry data
   */
  public async importRegistry(entries: AdapterRegistryEntry[]): Promise<void> {
    for (const entry of entries) {
      this.entries.set(entry.id, entry);
      this.updateIndexes(entry.id, entry);
    }

    this.emit('registryImported', { count: entries.length });
  }

  /**
   * Generate adapter ID
   */
  private generateAdapterId(name: string, platform: PlatformType): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${platform}-${cleanName}`;
  }

  /**
   * Validate registry entry
   */
  private validateEntry(entry: Partial<AdapterRegistryEntry>): void {
    if (!entry.name || entry.name.trim().length === 0) {
      throw new Error('Adapter name is required');
    }

    if (!entry.platform) {
      throw new Error('Platform is required');
    }

    if (!entry.version || !/^\d+\.\d+\.\d+/.test(entry.version)) {
      throw new Error('Valid semantic version is required');
    }

    if (!entry.author || entry.author.trim().length === 0) {
      throw new Error('Author is required');
    }

    if (!entry.license || entry.license.trim().length === 0) {
      throw new Error('License is required');
    }

    if (!entry.capabilities) {
      throw new Error('Capabilities are required');
    }
  }

  /**
   * Update search indexes
   */
  private updateIndexes(id: string, entry: AdapterRegistryEntry): void {
    // Platform index
    if (!this.platformIndex.has(entry.platform)) {
      this.platformIndex.set(entry.platform, new Set());
    }
    this.platformIndex.get(entry.platform)!.add(id);

    // Author index
    if (!this.authorIndex.has(entry.author)) {
      this.authorIndex.set(entry.author, new Set());
    }
    this.authorIndex.get(entry.author)!.add(id);

    // Tag index
    for (const tag of entry.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(id);
    }

    // Keyword index
    for (const keyword of entry.keywords) {
      if (!this.keywordIndex.has(keyword)) {
        this.keywordIndex.set(keyword, new Set());
      }
      this.keywordIndex.get(keyword)!.add(id);
    }
  }

  /**
   * Remove from search indexes
   */
  private removeFromIndexes(id: string, entry: AdapterRegistryEntry): void {
    // Platform index
    this.platformIndex.get(entry.platform)?.delete(id);

    // Author index
    this.authorIndex.get(entry.author)?.delete(id);

    // Tag index
    for (const tag of entry.tags) {
      this.tagIndex.get(tag)?.delete(id);
    }

    // Keyword index
    for (const keyword of entry.keywords) {
      this.keywordIndex.get(keyword)?.delete(id);
    }
  }

  /**
   * Initialize built-in adapters
   */
  private initializeBuiltinAdapters(): void {
    const builtinAdapters = [
      {
        name: 'Twitter Adapter',
        platform: 'twitter' as PlatformType,
        version: '1.0.0',
        description: 'Official Twitter platform adapter with full API support',
        author: 'MPLP Team',
        license: 'MIT',
        keywords: ['twitter', 'social', 'microblogging'],
        capabilities: {
          canPost: true,
          canComment: true,
          canShare: true,
          canDelete: true,
          canEdit: false,
          canLike: true,
          canFollow: true,
          canMessage: true,
          canMention: true,
          supportedContentTypes: ['text', 'image', 'video'],
          maxContentLength: 280,
          maxMediaSize: 5 * 1024 * 1024,
          supportsPolls: true,
          supportsScheduling: false,
          supportsAnalytics: true,
          supportsWebhooks: true
        },
        dependencies: [],
        peerDependencies: [],
        minimumNodeVersion: '16.0.0',
        status: 'active' as const,
        rating: { average: 4.8, count: 150 },
        downloads: { total: 10000, monthly: 1500, weekly: 400 },
        tags: ['official', 'social-media', 'microblogging'],
        metadata: {}
      },
      // Add other built-in adapters...
    ];

    for (const adapter of builtinAdapters) {
      const id = this.generateAdapterId(adapter.name, adapter.platform);
      const entry: AdapterRegistryEntry = {
        ...adapter,
        id,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        verifiedAt: new Date()
      };

      this.entries.set(id, entry);
      this.updateIndexes(id, entry);
    }
  }
}

/**
 * Global registry instance
 */
export const globalRegistry = new AdapterRegistry();

/**
 * Registry CLI commands
 */
export class RegistryCLI {
  constructor(private registry: AdapterRegistry) {}

  /**
   * Search adapters from CLI
   */
  public async search(query: string, options: any = {}): Promise<void> {
    const results = this.registry.searchAdapters({
      query,
      platform: options.platform,
      status: options.status,
      limit: options.limit || 10
    });

    console.log(`\n🔍 Found ${results.length} adapters:\n`);

    for (const adapter of results) {
      console.log(`📦 ${adapter.name} (${adapter.platform})`);
      console.log(`   Version: ${adapter.version}`);
      console.log(`   Author: ${adapter.author}`);
      console.log(`   Rating: ${'⭐'.repeat(Math.round(adapter.rating.average))} (${adapter.rating.average}/5)`);
      console.log(`   Downloads: ${adapter.downloads.total.toLocaleString()}`);
      console.log(`   Description: ${adapter.description}`);
      console.log('');
    }
  }

  /**
   * Show registry statistics
   */
  public async stats(): Promise<void> {
    const stats = this.registry.getStats();

    console.log('\n📊 Registry Statistics:\n');
    console.log(`Total Adapters: ${stats.totalAdapters}`);
    console.log(`Active: ${stats.activeAdapters}`);
    console.log(`Deprecated: ${stats.deprecatedAdapters}`);
    console.log(`Experimental: ${stats.experimentalAdapters}`);
    console.log(`Total Downloads: ${stats.totalDownloads.toLocaleString()}`);
    console.log(`Average Rating: ${stats.averageRating.toFixed(1)}/5`);

    console.log('\nPlatform Distribution:');
    for (const [platform, count] of Object.entries(stats.platformCounts)) {
      console.log(`  ${platform}: ${count}`);
    }

    console.log('\nTop Authors:');
    for (const { author, count } of stats.topAuthors.slice(0, 5)) {
      console.log(`  ${author}: ${count} adapters`);
    }
  }
}
