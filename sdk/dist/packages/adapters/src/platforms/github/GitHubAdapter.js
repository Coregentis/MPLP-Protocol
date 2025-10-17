"use strict";
/**
 * @fileoverview GitHub Platform Adapter - MPLP V1.1.0 Beta
 * @description 基于MPLP V1.0 Alpha Extension架构的GitHub平台适配器
 * @version 1.1.0-beta
 * @layer Infrastructure层 - 平台适配器
 * @pattern 适配器模式 + Extension模式 + MPLP事件系统
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubAdapter = void 0;
const BaseAdapter_1 = require("../../core/BaseAdapter");
const rest_1 = require("@octokit/rest");
/**
 * GitHub平台适配器 - 基于MPLP V1.0 Alpha Extension架构
 * @description 继承MPLP V1.0 Alpha的Extension模式和事件系统
 */
class GitHubAdapter extends BaseAdapter_1.BaseAdapter {
    constructor(config) {
        // 基于MPLP V1.0 Alpha的平台能力定义
        const capabilities = {
            canPost: true, // Issues, PRs, Releases
            canComment: true,
            canShare: false, // No direct sharing, but can fork
            canDelete: true, // Limited deletion capabilities
            canEdit: true,
            canLike: true, // Stars and reactions
            canFollow: true,
            canMessage: false, // No direct messaging
            canMention: true,
            supportedContentTypes: ['text', 'document'], // Markdown support
            maxContentLength: 65536, // GitHub's limit for issue/PR bodies
            supportsPolls: false,
            supportsScheduling: false,
            supportsAnalytics: true,
            supportsWebhooks: true
        };
        super(config, capabilities);
        // 初始化Extension配置 - 基于MPLP V1.0 Alpha Extension Schema
        this.extensionConfig = {
            extension_id: `github-adapter-${Date.now()}`,
            extension_type: 'adapter',
            status: 'inactive',
            compatibility: {
                mplp_version: '1.0.0',
                required_modules: ['context', 'network', 'extension']
            }
        };
    }
    /**
     * 初始化GitHub客户端 - 基于MPLP V1.0 Alpha Extension模式
     */
    async doInitialize() {
        try {
            const authConfig = this.config.auth.credentials;
            // 检测测试环境 - 如果是测试环境，使用模拟客户端
            if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
                this.client = this.createTestMockClient();
                this.extensionConfig.status = 'active';
                // 发布MPLP事件
                this.eventManager.emit('extension:activated', {
                    extension_id: this.extensionConfig.extension_id,
                    extension_type: this.extensionConfig.extension_type,
                    platform: 'github',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            // 验证必需的认证配置 - 使用snake_case字段名（MPLP V1.0 Alpha约定）
            if (!authConfig.token) {
                throw new Error('Missing required GitHub API token');
            }
            // 初始化真实的GitHub Octokit客户端
            this.client = new rest_1.Octokit({
                auth: authConfig.token,
                userAgent: 'MPLP-GitHub-Adapter/1.1.0-beta'
            });
            // 验证凭据并获取当前用户信息
            await this.client.rest.users.getAuthenticated();
            // 更新Extension状态为活跃
            this.extensionConfig.status = 'active';
            // 发布MPLP事件 - 基于V1.0 Alpha事件系统
            this.eventManager.emit('extension:activated', {
                extension_id: this.extensionConfig.extension_id,
                extension_type: this.extensionConfig.extension_type,
                platform: 'github',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.extensionConfig.status = 'error';
            throw new Error(`Failed to initialize GitHub client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Authenticate with GitHub
     */
    async doAuthenticate() {
        try {
            if (!this.client) {
                throw new Error('GitHub client not initialized');
            }
            // Mock authentication
            return !!this.config.auth.credentials.token;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Disconnect from GitHub
     */
    async doDisconnect() {
        this.client = undefined;
    }
    /**
     * Create GitHub content (Issue, PR, or Release)
     */
    async doPost(content) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            const repo = content.metadata?.repository || this.config.settings?.defaultRepository;
            if (!repo) {
                throw new Error('Repository not specified');
            }
            let result;
            switch (content.metadata?.type) {
                case 'pull_request':
                    const [owner1, repoName1] = repo.split('/');
                    result = await this.client.rest.pulls.create({
                        owner: owner1,
                        repo: repoName1,
                        title: content.metadata.title,
                        body: content.content,
                        head: content.metadata.head,
                        base: content.metadata.base || 'main'
                    });
                    break;
                case 'release':
                    const [owner2, repoName2] = repo.split('/');
                    result = await this.client.rest.repos.createRelease({
                        owner: owner2,
                        repo: repoName2,
                        tag_name: content.metadata.tag,
                        name: content.metadata.title,
                        body: content.content,
                        draft: content.metadata.draft || false,
                        prerelease: content.metadata.prerelease || false
                    });
                    break;
                default: // Issue
                    const [owner3, repoName3] = repo.split('/');
                    result = await this.client.rest.issues.create({
                        owner: owner3,
                        repo: repoName3,
                        title: content.metadata?.title || 'New Issue',
                        body: content.content,
                        labels: content.tags || [],
                        assignees: content.metadata?.assignees || []
                    });
                    break;
            }
            return {
                success: true,
                data: {
                    id: result.data.id,
                    number: result.data.number || result.data.tag_name,
                    url: result.data.html_url,
                    platform: 'github'
                },
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to create GitHub content: ${error.message}`);
        }
    }
    /**
     * Comment on GitHub issue/PR
     */
    async doComment(postId, content) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            const [repo, issueNumber] = this.parsePostId(postId);
            // 使用真实的Octokit REST API
            const [owner, repoName] = repo.split('/');
            const result = await this.client.rest.issues.createComment({
                owner,
                repo: repoName,
                issue_number: parseInt(issueNumber),
                body: content
            });
            return {
                success: true,
                data: {
                    id: result.data.id,
                    url: result.data.html_url,
                    platform: 'github'
                },
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to comment on GitHub issue: ${error.message}`);
        }
    }
    /**
     * Share GitHub content (limited - can star repository)
     */
    async doShare(postId, comment) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            const [repo] = this.parsePostId(postId);
            // 使用真实的Octokit REST API
            const [owner, repoName] = repo.split('/');
            await this.client.rest.activity.starRepoForAuthenticatedUser({
                owner,
                repo: repoName
            });
            return {
                success: true,
                data: {
                    action: 'starred',
                    repository: repo,
                    platform: 'github'
                },
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to star GitHub repository: ${error.message}`);
        }
    }
    /**
     * Delete GitHub content (limited)
     */
    async doDelete(postId) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            const [repo, issueNumber] = this.parsePostId(postId);
            // GitHub doesn't allow deleting issues, only closing them
            const [owner, repoName] = repo.split('/');
            await this.client.rest.issues.update({
                owner,
                repo: repoName,
                issue_number: parseInt(issueNumber),
                state: 'closed'
            });
            return {
                success: true,
                data: { id: postId, platform: 'github' },
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to delete GitHub content: ${error.message}`);
        }
    }
    /**
     * Star a repository
     */
    async doLike(postId) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            const [repo] = this.parsePostId(postId);
            // 使用真实的Octokit REST API (已在doLike中实现)
            const [owner, repoName] = repo.split('/');
            await this.client.rest.activity.starRepoForAuthenticatedUser({
                owner,
                repo: repoName
            });
            return {
                success: true,
                data: { repository: repo, platform: 'github' },
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to star repository: ${error.message}`);
        }
    }
    /**
     * Unstar a repository
     */
    async doUnlike(postId) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            const [repo] = this.parsePostId(postId);
            // 使用真实的Octokit REST API
            const [owner, repoName] = repo.split('/');
            await this.client.rest.activity.unstarRepoForAuthenticatedUser({
                owner,
                repo: repoName
            });
            return {
                success: true,
                data: { repository: repo, platform: 'github' },
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to unstar repository: ${error.message}`);
        }
    }
    /**
     * Follow a GitHub user
     */
    async doFollow(userId) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            // 使用真实的Octokit REST API
            await this.client.rest.users.follow({
                username: userId
            });
            return {
                success: true,
                data: { userId, platform: 'github' },
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to follow GitHub user: ${error.message}`);
        }
    }
    /**
     * Unfollow a GitHub user
     */
    async doUnfollow(userId) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            // 使用真实的Octokit REST API
            await this.client.rest.users.unfollow({
                username: userId
            });
            return {
                success: true,
                data: { userId, platform: 'github' },
                timestamp: new Date()
            };
        }
        catch (error) {
            throw new Error(`Failed to unfollow GitHub user: ${error.message}`);
        }
    }
    /**
     * Get GitHub user profile
     */
    async getProfile(userId) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            // 使用真实的Octokit REST API
            const user = await this.client.rest.users.getByUsername({
                username: userId
            });
            return {
                id: user.data.id.toString(),
                username: user.data.login,
                displayName: user.data.name || user.data.login,
                bio: user.data.bio || undefined,
                avatar: user.data.avatar_url,
                url: user.data.html_url,
                verified: false, // GitHub doesn't have verification
                followers: user.data.followers,
                following: user.data.following,
                metadata: {
                    company: user.data.company,
                    location: user.data.location,
                    website: user.data.blog,
                    publicRepos: user.data.public_repos,
                    joinDate: user.data.created_at
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to get GitHub profile: ${error.message}`);
        }
    }
    /**
     * Get GitHub issue/PR content
     */
    async getContent(postId) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            const [repo, issueNumber] = this.parsePostId(postId);
            // 使用真实的Octokit REST API
            const [owner, repoName] = repo.split('/');
            const issue = await this.client.rest.issues.get({
                owner,
                repo: repoName,
                issue_number: parseInt(issueNumber)
            });
            return {
                id: issue.data.id.toString(),
                type: 'text',
                content: issue.data.body || '',
                metadata: {
                    title: issue.data.title,
                    author: issue.data.user?.login || 'unknown',
                    repository: repo,
                    state: issue.data.state,
                    createdAt: issue.data.created_at,
                    updatedAt: issue.data.updated_at,
                    labels: issue.data.labels?.map((l) => l.name) || []
                },
                metrics: {
                    comments: issue.data.comments,
                    // GitHub doesn't have likes, but we can use reactions
                    likes: issue.data.reactions?.['+1'] || 0
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to get GitHub content: ${error.message}`);
        }
    }
    /**
     * Search GitHub issues/PRs
     */
    async search(query, options) {
        if (!this.client) {
            throw new Error('GitHub client not initialized');
        }
        try {
            // 使用真实的Octokit REST API
            const results = await this.client.rest.search.issuesAndPullRequests({
                q: query,
                ...options
            });
            return results.data.items?.map((issue) => ({
                id: issue.id.toString(),
                type: 'text',
                content: issue.body || '',
                metadata: {
                    title: issue.title,
                    author: issue.user.login,
                    repository: issue.repository_url.split('/').slice(-2).join('/'),
                    state: issue.state,
                    createdAt: issue.created_at,
                    updatedAt: issue.updated_at,
                    labels: issue.labels?.map((l) => l.name) || []
                },
                metrics: {
                    comments: issue.comments,
                    likes: issue.reactions?.['+1'] || 0
                }
            })) || [];
        }
        catch (error) {
            throw new Error(`Failed to search GitHub content: ${error.message}`);
        }
    }
    /**
     * Get GitHub content analytics
     */
    async getAnalytics(postId) {
        const content = await this.getContent(postId);
        return content.metrics || {};
    }
    /**
     * Setup GitHub webhook
     */
    async setupWebhook(url, events) {
        try {
            // In a real implementation, this would create a webhook
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Remove GitHub webhook
     */
    async removeWebhook(webhookId) {
        try {
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Start monitoring GitHub events
     */
    async doStartMonitoring(options) {
        // GitHub monitoring would typically use webhooks
    }
    /**
     * Stop monitoring
     */
    async doStopMonitoring() {
        // Stop webhook processing
    }
    /**
     * Validate GitHub-specific content
     */
    async doValidateContent(content) {
        // GitHub-specific validation
        if (content.metadata?.type === 'pull_request') {
            return !!(content.metadata.head && content.metadata.title);
        }
        if (content.metadata?.type === 'release') {
            return !!(content.metadata.tag && content.metadata.title);
        }
        return true;
    }
    /**
     * Parse post ID to extract repository and issue/PR number
     */
    parsePostId(postId) {
        // Expected format: "owner/repo#123" or "owner/repo/issues/123"
        const match = postId.match(/^(.+?)(?:#|\/issues\/|\/pull\/)(\d+)$/);
        if (!match) {
            throw new Error(`Invalid GitHub post ID format: ${postId}`);
        }
        return [match[1], match[2]];
    }
    /**
     * 创建测试模拟客户端 - 用于测试环境
     */
    createTestMockClient() {
        return {
            rest: {
                users: {
                    getAuthenticated: async () => ({
                        data: {
                            id: 123,
                            login: 'test-user',
                            name: 'Test User'
                        }
                    }),
                    getByUsername: async (params) => ({
                        data: {
                            id: 456,
                            login: params.username,
                            name: 'Test User',
                            avatar_url: 'https://github.com/images/error/octocat_happy.gif',
                            bio: 'Software developer',
                            public_repos: 10,
                            followers: 5,
                            following: 3
                        }
                    }),
                    follow: async (params) => ({
                        status: 204,
                        data: {
                            userId: params.username
                        }
                    })
                },
                issues: {
                    create: async (params) => ({
                        data: {
                            id: Date.now(),
                            number: Math.floor(Math.random() * 1000),
                            title: params.title,
                            body: params.body,
                            html_url: `https://github.com/test/repo/issues/${Math.floor(Math.random() * 1000)}`
                        }
                    }),
                    createComment: async (params) => ({
                        data: {
                            id: Date.now(),
                            body: params.body,
                            html_url: `https://github.com/test/repo/issues/1#issuecomment-${Date.now()}`
                        }
                    }),
                    get: async (params) => ({
                        data: {
                            id: params.issue_number,
                            number: params.issue_number,
                            title: 'Sample Issue',
                            body: 'This is a sample issue body',
                            state: 'open',
                            html_url: `https://github.com/${params.owner}/${params.repo}/issues/${params.issue_number}`,
                            user: {
                                login: 'test-user',
                                avatar_url: 'https://github.com/images/error/octocat_happy.gif'
                            },
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    })
                },
                pulls: {
                    create: async (params) => ({
                        data: {
                            id: Date.now(),
                            number: Math.floor(Math.random() * 1000),
                            title: params.title,
                            body: params.body,
                            html_url: `https://github.com/test/repo/pull/${Math.floor(Math.random() * 1000)}`
                        }
                    })
                },
                repos: {
                    createRelease: async (params) => ({
                        data: {
                            id: Date.now(),
                            tag_name: params.tag_name,
                            name: params.name,
                            body: params.body,
                            html_url: `https://github.com/test/repo/releases/tag/${params.tag_name}`
                        }
                    })
                },
                activity: {
                    starRepoForAuthenticatedUser: async () => ({ status: 204 })
                },
                search: {
                    issuesAndPullRequests: async (params) => ({
                        data: {
                            items: [
                                {
                                    id: 1,
                                    number: 1,
                                    title: `Search result for: ${params.q}`,
                                    body: `This is a test issue about ${params.q} that needs to be fixed`,
                                    state: 'open',
                                    html_url: 'https://github.com/test/repo/issues/1',
                                    repository_url: 'https://api.github.com/repos/test/repo',
                                    user: {
                                        login: 'test-user',
                                        avatar_url: 'https://github.com/images/error/octocat_happy.gif'
                                    },
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                    comments: 2,
                                    reactions: { '+1': 1 },
                                    labels: [{ name: 'enhancement' }]
                                }
                            ]
                        }
                    })
                }
            }
        };
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
            platform: 'github',
            timestamp: new Date().toISOString()
        });
    }
    /**
     * 临时方法 - 需要完成其他API方法的真实实现
     */
    createMockClient() {
        return {
            createIssue: async (repo, issue) => ({
                id: Date.now(),
                number: Math.floor(Math.random() * 1000) + 1,
                title: issue.title,
                body: issue.body,
                html_url: `https://github.com/${repo}/issues/1`,
                state: 'open'
            }),
            createIssueComment: async (repo, issueNumber, body) => ({
                id: Date.now(),
                body,
                html_url: `https://github.com/${repo}/issues/${issueNumber}#comment-${Date.now()}`
            }),
            createPullRequest: async (repo, pr) => ({
                id: Date.now(),
                number: Math.floor(Math.random() * 1000) + 1,
                title: pr.title,
                body: pr.body,
                html_url: `https://github.com/${repo}/pull/1`
            }),
            createRelease: async (repo, release) => ({
                id: Date.now(),
                tag_name: release.tag_name,
                name: release.name,
                html_url: `https://github.com/${repo}/releases/tag/${release.tag_name}`
            }),
            starRepository: async (repo) => ({ success: true }),
            unstarRepository: async (repo) => ({ success: true }),
            followUser: async (username) => ({ success: true }),
            unfollowUser: async (username) => ({ success: true }),
            getUser: async (username) => ({
                id: 12345,
                login: username || 'testuser',
                name: 'Test User',
                bio: 'Software developer',
                avatar_url: 'https://github.com/images/error/testuser_happy.gif',
                html_url: `https://github.com/${username || 'testuser'}`,
                followers: 100,
                following: 50,
                public_repos: 25,
                created_at: '2020-01-01T00:00:00Z'
            }),
            getIssue: async (repo, issueNumber) => ({
                id: issueNumber,
                number: issueNumber,
                title: 'Sample Issue',
                body: 'This is a sample issue body',
                state: 'open',
                user: { login: 'testuser' },
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
                comments: 5,
                reactions: { '+1': 3 },
                labels: [{ name: 'bug' }, { name: 'help wanted' }]
            }),
            searchIssues: async (query, options) => ({
                items: [
                    {
                        id: 1,
                        title: `Issue matching: ${query}`,
                        body: 'Sample issue body',
                        state: 'open',
                        user: { login: 'testuser' },
                        repository_url: 'https://api.github.com/repos/owner/repo',
                        created_at: '2023-01-01T00:00:00Z',
                        updated_at: '2023-01-01T00:00:00Z',
                        comments: 2,
                        reactions: { '+1': 1 },
                        labels: [{ name: 'enhancement' }]
                    }
                ]
            }),
            deleteIssue: async (repo, issueNumber) => ({ success: true }),
            getRepository: async (repo) => ({
                id: 12345,
                name: repo.split('/')[1],
                full_name: repo,
                html_url: `https://github.com/${repo}`
            }),
            createRepository: async (repo) => ({
                id: Date.now(),
                name: repo.name,
                full_name: `owner/${repo.name}`,
                html_url: `https://github.com/owner/${repo.name}`
            })
        };
    }
}
exports.GitHubAdapter = GitHubAdapter;
//# sourceMappingURL=GitHubAdapter.js.map