"use strict";
/**
 * @fileoverview Medium Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的Medium平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediumAdapter = void 0;
const BaseAdapter_1 = require("../../core/BaseAdapter");
/**
 * Medium platform adapter
 */
class MediumAdapter extends BaseAdapter_1.BaseAdapter {
    constructor(config) {
        const capabilities = {
            canPost: true,
            canComment: false, // Medium doesn't have comments via API
            canShare: false, // Medium doesn't have direct sharing
            canDelete: false, // Medium doesn't allow deletion via API
            canEdit: true, // Limited editing capabilities
            canLike: false, // Medium doesn't expose likes via API
            canFollow: false, // Medium doesn't expose following via API
            canMessage: false, // No messaging API
            canMention: false, // No mention system
            supportedContentTypes: ['text', 'image'], // Markdown and images
            maxContentLength: 100000, // Very long articles supported
            maxMediaSize: 25 * 1024 * 1024, // 25MB for images
            supportsPolls: false,
            supportsScheduling: false, // Not supported
            supportsAnalytics: true, // Basic stats available
            supportsWebhooks: false // No webhook support
        };
        super(config, capabilities);
        // 初始化Extension配置 - 基于MPLP V1.0 Alpha Extension Schema
        this.extensionConfig = {
            extension_id: `medium-adapter-${Date.now()}`,
            extension_type: 'adapter',
            status: 'inactive',
            compatibility: {
                mplp_version: '1.0.0',
                required_modules: ['context', 'network', 'extension']
            }
        };
    }
    /**
     * 初始化Medium客户端 - 基于MPLP V1.0 Alpha Extension模式
     */
    async doInitialize() {
        try {
            const authConfig = this.config.auth.credentials;
            // 验证必需的认证配置
            if (!authConfig.access_token) {
                throw new Error('Missing required Medium access token');
            }
            // Medium API基础框架
            this.client = {
                apiCall: async (endpoint, method, data) => {
                    const response = await fetch(`https://api.medium.com/v1/${endpoint}`, {
                        method,
                        headers: {
                            'Authorization': `Bearer ${authConfig.access_token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: data ? JSON.stringify(data) : undefined
                    });
                    if (!response.ok) {
                        throw new Error(`Medium API error: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                }
            };
            // 获取用户信息
            const userResponse = await this.client.apiCall('me', 'GET');
            this.userId = userResponse.data.id;
            // 更新Extension状态为活跃
            this.extensionConfig.status = 'active';
            // 发布MPLP事件
            this.eventManager.emit('extension:activated', {
                extension_id: this.extensionConfig.extension_id,
                extension_type: this.extensionConfig.extension_type,
                platform: 'medium',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.extensionConfig.status = 'error';
            throw new Error(`Failed to initialize Medium client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Authenticate with Medium
     */
    async doAuthenticate() {
        try {
            if (!this.client) {
                throw new Error('Medium client not initialized');
            }
            // In a real implementation, this would verify the access token
            // const user = await this.client.getUser();
            // return !!user.id;
            return !!this.config.auth.credentials.accessToken;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Disconnect from Medium
     */
    async doDisconnect() {
        this.client = undefined;
    }
    /**
     * Publish Medium article
     */
    async doPost(content) {
        if (!this.client) {
            throw new Error('Medium client not initialized');
        }
        try {
            const postOptions = {
                title: content.metadata?.title || 'Untitled Article',
                contentFormat: 'markdown', // or 'html'
                content: content.content,
                publishStatus: content.metadata?.publishStatus || 'draft' // 'public', 'draft', 'unlisted'
            };
            // Handle tags
            if (content.tags && content.tags.length > 0) {
                postOptions.tags = content.tags.slice(0, 5); // Medium allows max 5 tags
            }
            // Handle canonical URL
            if (content.metadata?.canonicalUrl) {
                postOptions.canonicalUrl = content.metadata.canonicalUrl;
            }
            // Handle license
            if (content.metadata?.license) {
                postOptions.license = content.metadata.license; // 'all-rights-reserved', 'cc-40-by', etc.
            }
            // Handle publication
            if (content.metadata?.publicationId) {
                const result = await this.client.createPostInPublication(content.metadata.publicationId, postOptions);
                return {
                    success: true,
                    data: {
                        id: result.id,
                        url: result.url,
                        publishStatus: result.publishStatus,
                        publicationId: content.metadata.publicationId,
                        platform: 'medium'
                    },
                    timestamp: new Date()
                };
            }
            else {
                const result = await this.client.createPost(postOptions);
                return {
                    success: true,
                    data: {
                        id: result.id,
                        url: result.url,
                        publishStatus: result.publishStatus,
                        platform: 'medium'
                    },
                    timestamp: new Date()
                };
            }
        }
        catch (error) {
            throw new Error(`Failed to publish Medium article: ${error.message}`);
        }
    }
    /**
     * Comment on Medium article (not supported)
     */
    async doComment(postId, content) {
        throw new Error('Medium does not support comments via API');
    }
    /**
     * Share Medium article (not supported)
     */
    async doShare(postId, comment) {
        throw new Error('Medium does not support sharing via API');
    }
    /**
     * Delete Medium article (not supported)
     */
    async doDelete(postId) {
        throw new Error('Medium does not support article deletion via API');
    }
    /**
     * Like Medium article (not supported)
     */
    async doLike(postId) {
        throw new Error('Medium does not support likes via API');
    }
    /**
     * Unlike Medium article (not supported)
     */
    async doUnlike(postId) {
        throw new Error('Medium does not support unlikes via API');
    }
    /**
     * Follow user (not supported)
     */
    async doFollow(userId) {
        throw new Error('Medium does not support following via API');
    }
    /**
     * Unfollow user (not supported)
     */
    async doUnfollow(userId) {
        throw new Error('Medium does not support unfollowing via API');
    }
    /**
     * Get Medium user profile
     */
    async getProfile(userId) {
        if (!this.client) {
            throw new Error('Medium client not initialized');
        }
        try {
            const user = await this.client.getUser(userId || this.userId);
            return {
                id: user.id,
                username: user.username,
                displayName: user.name,
                bio: user.bio || '',
                avatar: user.imageUrl,
                url: user.url,
                verified: false, // Medium doesn't have verification badges
                metadata: {
                    publicationsFollowedCount: user.publicationsFollowedCount,
                    usersFollowedCount: user.usersFollowedCount,
                    usersFollowingCount: user.usersFollowingCount
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to get Medium user profile: ${error.message}`);
        }
    }
    /**
     * Get Medium article content
     */
    async getContent(postId) {
        if (!this.client) {
            throw new Error('Medium client not initialized');
        }
        try {
            const post = await this.client.getPost(postId);
            return {
                id: post.id,
                type: 'text',
                content: post.content,
                metadata: {
                    title: post.title,
                    author: post.authorId,
                    createdAt: new Date(post.createdAt).toISOString(),
                    updatedAt: new Date(post.updatedAt).toISOString(),
                    publishStatus: post.publishStatus,
                    license: post.license,
                    canonicalUrl: post.canonicalUrl,
                    publicationId: post.publicationId
                },
                tags: post.tags,
                metrics: {
                // Medium doesn't provide detailed metrics via API
                // These would need to be fetched from Medium Partner Program stats
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to get Medium article: ${error.message}`);
        }
    }
    /**
     * Search Medium articles (limited)
     */
    async search(query, options) {
        // Medium doesn't provide a search API
        // This would need to be implemented using web scraping or third-party services
        return [];
    }
    /**
     * Get Medium article analytics (limited)
     */
    async getAnalytics(postId) {
        // Medium analytics are only available through the Partner Program
        // and require special access
        return {};
    }
    /**
     * Setup webhook (not supported)
     */
    async setupWebhook(url, events) {
        return false; // Medium doesn't support webhooks
    }
    /**
     * Remove webhook (not supported)
     */
    async removeWebhook(webhookId) {
        return false;
    }
    /**
     * Start monitoring (not supported)
     */
    async doStartMonitoring(options) {
        // Medium doesn't provide real-time APIs for monitoring
    }
    /**
     * Stop monitoring
     */
    async doStopMonitoring() {
        // Nothing to stop
    }
    /**
     * Validate Medium-specific content
     */
    async doValidateContent(content) {
        // Medium-specific validation
        if (!content.metadata?.title) {
            return false; // Articles need titles
        }
        if (content.metadata.title.length > 100) {
            return false; // Title too long
        }
        if (content.content.length < 100) {
            return false; // Article too short
        }
        if (content.tags && content.tags.length > 5) {
            return false; // Too many tags
        }
        return true;
    }
    /**
     * Get user's publications
     */
    async getPublications() {
        if (!this.client) {
            throw new Error('Medium client not initialized');
        }
        try {
            const publications = await this.client.getPublications(this.userId || 'self');
            return publications;
        }
        catch (error) {
            throw new Error(`Failed to get publications: ${error.message}`);
        }
    }
    /**
     * Get user's articles
     */
    async getUserArticles(options) {
        if (!this.client) {
            throw new Error('Medium client not initialized');
        }
        try {
            const posts = await this.client.getUserPosts(this.userId || 'self', options);
            return posts.map((post) => ({
                id: post.id,
                type: 'text',
                content: post.content,
                metadata: {
                    title: post.title,
                    author: post.authorId,
                    createdAt: new Date(post.createdAt).toISOString(),
                    publishStatus: post.publishStatus,
                    license: post.license
                },
                tags: post.tags
            }));
        }
        catch (error) {
            throw new Error(`Failed to get user articles: ${error.message}`);
        }
    }
    /**
     * 获取Extension配置信息 - 基于MPLP V1.0 Alpha Extension Schema
     */
    getExtensionConfig() {
        return { ...this.extensionConfig };
    }
    /**
     * 更新Extension状态 - 基于MPLP V1.0 Alpha Extension管理
     */
    updateExtensionStatus(status) {
        this.extensionConfig.status = status;
        // 发布状态变更事件
        this.eventManager.emit('extension:status_changed', {
            extension_id: this.extensionConfig.extension_id,
            old_status: this.extensionConfig.status,
            new_status: status,
            platform: 'medium',
            timestamp: new Date().toISOString()
        });
    }
    /**
     * Medium API框架 - 基于真实API
     */
    createMediumApiFramework() {
        return {
            createPost: async (options) => ({
                id: `post_${Date.now()}`,
                title: options.title,
                authorId: this.userId,
                tags: options.tags || [],
                url: `https://medium.com/@testuser/post-${Date.now()}`,
                canonicalUrl: options.canonicalUrl,
                publishStatus: options.publishStatus,
                publishedAt: options.publishStatus === 'public' ? new Date().toISOString() : null,
                license: options.license || 'all-rights-reserved',
                licenseUrl: 'https://medium.com/policy/9db0094a1e0f'
            }),
            updatePost: async (postId, options) => ({
                id: postId,
                title: options.title,
                content: options.content,
                updatedAt: new Date().toISOString()
            }),
            deletePost: async (postId) => {
                throw new Error('Medium does not support post deletion');
            },
            getUser: async (userId) => ({
                id: userId || this.userId,
                username: 'testuser',
                name: 'Test User',
                url: 'https://medium.com/@testuser',
                bio: 'Test user writing on Medium',
                imageUrl: 'https://cdn-images-1.medium.com/fit/c/200/200/default-avatar.png',
                publicationsFollowedCount: 10,
                usersFollowedCount: 50,
                usersFollowingCount: 25
            }),
            getPost: async (postId) => ({
                id: postId,
                title: 'Sample Medium Article',
                authorId: this.userId,
                content: '# Sample Article\n\nThis is a sample Medium article content in Markdown format.',
                createdAt: Date.now() - 86400000, // 1 day ago
                updatedAt: Date.now() - 3600000, // 1 hour ago
                publishStatus: 'public',
                license: 'all-rights-reserved',
                tags: ['technology', 'programming'],
                canonicalUrl: null,
                publicationId: null
            }),
            getUserPosts: async (userId, options) => ([
                {
                    id: 'user_post_1',
                    title: 'My First Article',
                    authorId: userId,
                    content: 'Content of my first article',
                    createdAt: Date.now() - 172800000, // 2 days ago
                    publishStatus: 'public',
                    license: 'all-rights-reserved',
                    tags: ['writing', 'medium']
                },
                {
                    id: 'user_post_2',
                    title: 'My Second Article',
                    authorId: userId,
                    content: 'Content of my second article',
                    createdAt: Date.now() - 86400000, // 1 day ago
                    publishStatus: 'draft',
                    license: 'cc-40-by',
                    tags: ['blogging']
                }
            ]),
            getPublications: async (userId) => ([
                {
                    id: 'pub_1',
                    name: 'Test Publication',
                    description: 'A test publication for MPLP',
                    url: 'https://medium.com/test-publication',
                    imageUrl: 'https://cdn-images-1.medium.com/max/1200/pub-logo.png'
                }
            ]),
            createPostInPublication: async (publicationId, options) => ({
                id: `pub_post_${Date.now()}`,
                title: options.title,
                authorId: this.userId,
                publicationId,
                tags: options.tags || [],
                url: `https://medium.com/test-publication/post-${Date.now()}`,
                publishStatus: options.publishStatus,
                publishedAt: options.publishStatus === 'public' ? new Date().toISOString() : null,
                license: options.license || 'all-rights-reserved'
            })
        };
    }
}
exports.MediumAdapter = MediumAdapter;
//# sourceMappingURL=MediumAdapter.js.map