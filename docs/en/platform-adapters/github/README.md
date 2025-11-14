# GitHub Platform Adapter - Complete Usage Guide

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/platform-adapters/github/README.md)


> **Platform**: GitHub  
> **Adapter**: @mplp/adapters - GitHubAdapter  
> **Version**: v1.1.0  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Overview**

The GitHub Platform Adapter provides comprehensive integration with GitHub's development platform, enabling intelligent agents to interact with repositories, manage issues and pull requests, automate workflows, and engage with the developer community. It uses GitHub's REST API v4 and Octokit SDK with enterprise-grade features for both personal and organizational accounts.

### **🎯 Key Features**

- **📁 Repository Management**: Create, clone, fork repositories, manage branches and releases
- **🐛 Issue Tracking**: Create, update, comment on issues, manage labels and milestones
- **🔄 Pull Request Automation**: Create PRs, review code, merge automation
- **⭐ Community Engagement**: Star repositories, follow users, manage notifications
- **🔐 Token Authentication**: Personal Access Tokens and GitHub Apps authentication
- **⚡ Rate Limiting**: Intelligent API rate limit management (5000 requests/hour)
- **🔄 Real-time Events**: Webhook integration for repository events
- **🛡️ Error Handling**: Comprehensive error handling and retry mechanisms

### **📦 Installation**

```bash
# Install the adapters package
npm install @mplp/adapters

# Or install globally for CLI usage
npm install -g @mplp/adapters
```

## 🚀 **Quick Start**

### **Basic Setup**

```typescript
import { GitHubAdapter } from '@mplp/adapters';

// Create GitHub adapter with Personal Access Token
const github = new GitHubAdapter({
  platform: 'github',
  name: 'My GitHub Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'token',
    credentials: {
      token: process.env.GITHUB_TOKEN! // Personal Access Token
    }
  }
});

// Initialize and authenticate
await github.initialize();
await github.authenticate();

console.log('✅ GitHub adapter ready!');
```

### **Create Your First Issue**

```typescript
// Create an issue in a repository
const result = await github.post({
  type: 'issue',
  repository: 'owner/repo-name',
  content: {
    title: 'Feature Request: Add AI Integration',
    body: `## Description
    We need to integrate AI capabilities into our application.
    
    ## Requirements
    - [ ] Natural language processing
    - [ ] Machine learning models
    - [ ] API integration
    
    ## Acceptance Criteria
    - AI features should be configurable
    - Performance impact should be minimal
    - Documentation should be updated`,
    labels: ['enhancement', 'ai', 'feature-request'],
    assignees: ['developer1', 'developer2']
  }
});

console.log(`Issue created: ${result.data.url}`);
```

## 🔧 **Configuration**

### **Authentication Methods**

#### **Personal Access Token (Recommended)**

```typescript
const githubConfig = {
  platform: 'github',
  name: 'GitHub Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'token',
    credentials: {
      token: 'ghp_your_personal_access_token_here'
    }
  },
  rateLimits: {
    core: { requests: 5000, window: 3600000 }, // 5000 requests per hour
    search: { requests: 30, window: 60000 },   // 30 searches per minute
    graphql: { requests: 5000, window: 3600000 } // 5000 GraphQL requests per hour
  }
};
```

#### **GitHub App Authentication**

```typescript
const githubAppConfig = {
  platform: 'github',
  name: 'GitHub App Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'app',
    credentials: {
      appId: 'your-github-app-id',
      privateKey: process.env.GITHUB_PRIVATE_KEY!,
      installationId: 'your-installation-id'
    }
  }
};
```

### **Advanced Configuration**

```typescript
const enterpriseConfig = {
  platform: 'github',
  name: 'Enterprise GitHub Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'token',
    credentials: {
      token: process.env.GITHUB_TOKEN!
    }
  },
  baseUrl: 'https://api.github.com', // For GitHub Enterprise: https://your-domain/api/v3
  rateLimits: {
    core: { requests: 5000, window: 3600000 },
    search: { requests: 30, window: 60000 }
  },
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    maxBackoffTime: 30000
  },
  monitoring: {
    enabled: true,
    webhookUrl: 'https://yourapp.com/webhooks/github',
    events: ['issues', 'pull_request', 'push', 'release']
  },
  repositories: {
    allowedRepos: ['owner/repo1', 'owner/repo2'], // Restrict to specific repos
    defaultLabels: ['bot', 'automated'],
    autoAssign: ['maintainer1', 'maintainer2']
  }
};
```

## 📝 **Core Operations**

### **Repository Management**

#### **Repository Operations**

```typescript
// Create a new repository
await github.createRepository({
  name: 'my-new-project',
  description: 'An innovative AI-powered application',
  private: false,
  autoInit: true,
  gitignoreTemplate: 'Node',
  licenseTemplate: 'MIT'
});

// Fork a repository
await github.forkRepository('original-owner/repo-name', {
  organization: 'my-org' // Optional: fork to organization
});

// Star a repository
await github.share('owner/repo-name'); // Stars the repository

// Get repository information
const repo = await github.getRepository('owner/repo-name');
console.log(`Repository: ${repo.name}`);
console.log(`Stars: ${repo.stargazersCount}`);
console.log(`Language: ${repo.language}`);
```

#### **Branch and Release Management**

```typescript
// Create a new branch
await github.createBranch('owner/repo-name', {
  branchName: 'feature/ai-integration',
  fromBranch: 'main'
});

// Create a release
await github.createRelease('owner/repo-name', {
  tagName: 'v1.2.0',
  name: 'Version 1.2.0 - AI Integration',
  body: `## What's New
  - Added AI-powered features
  - Improved performance
  - Bug fixes and stability improvements
  
  ## Breaking Changes
  - Updated API endpoints
  - Changed configuration format`,
  draft: false,
  prerelease: false
});
```

### **Issue Management**

#### **Creating and Managing Issues**

```typescript
// Create a detailed issue
await github.post({
  type: 'issue',
  repository: 'owner/repo-name',
  content: {
    title: 'Bug: Application crashes on startup',
    body: `## Bug Description
    The application crashes immediately after startup on Windows 10.
    
    ## Steps to Reproduce
    1. Download the latest release
    2. Run the executable
    3. Application crashes with error code 0x80004005
    
    ## Expected Behavior
    Application should start normally and show the main interface.
    
    ## Environment
    - OS: Windows 10 Pro (Build 19043)
    - Version: v1.1.0
    - Node.js: v18.17.0
    
    ## Additional Context
    This issue started appearing after the latest update.`,
    labels: ['bug', 'high-priority', 'windows'],
    assignees: ['developer1'],
    milestone: 'v1.2.0'
  }
});

// Comment on an issue
await github.comment('owner/repo-name/issues/123', 
  `Thanks for reporting this issue! I've reproduced the problem and identified the root cause.
  
  The issue is related to a missing dependency in the Windows build. I'll have a fix ready in the next patch release.
  
  **Workaround:** You can temporarily resolve this by installing the Visual C++ Redistributable.`
);

// Update issue labels and assignees
await github.updateIssue('owner/repo-name', 123, {
  labels: ['bug', 'high-priority', 'windows', 'in-progress'],
  assignees: ['developer1', 'developer2'],
  state: 'open'
});
```

#### **Issue Automation**

```typescript
// Auto-triage new issues
github.on('issue_opened', async (issue) => {
  // Auto-label based on content
  const labels = [];
  if (issue.title.toLowerCase().includes('bug')) {
    labels.push('bug');
  }
  if (issue.title.toLowerCase().includes('feature')) {
    labels.push('enhancement');
  }
  if (issue.body.includes('Windows')) {
    labels.push('windows');
  }
  
  // Apply labels
  if (labels.length > 0) {
    await github.updateIssue(issue.repository, issue.number, { labels });
  }
  
  // Auto-assign based on labels
  if (labels.includes('bug')) {
    await github.updateIssue(issue.repository, issue.number, {
      assignees: ['bug-triage-team']
    });
  }
  
  // Add welcome comment
  await github.comment(`${issue.repository}/issues/${issue.number}`,
    `Thank you for opening this issue! 🙏
    
    Our team will review it shortly. In the meantime, please make sure you've provided:
    - [ ] Clear description of the issue
    - [ ] Steps to reproduce (if applicable)
    - [ ] Expected vs actual behavior
    - [ ] Environment details
    
    We appreciate your contribution to making our project better!`
  );
});
```

### **Pull Request Management**

#### **Creating and Managing Pull Requests**

```typescript
// Create a pull request
await github.createPullRequest('owner/repo-name', {
  title: 'feat: Add AI-powered code suggestions',
  head: 'feature/ai-suggestions',
  base: 'main',
  body: `## Description
  This PR adds AI-powered code suggestions to improve developer productivity.
  
  ## Changes Made
  - Integrated OpenAI API for code completion
  - Added configuration options for AI features
  - Implemented caching for better performance
  - Added comprehensive tests
  
  ## Testing
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] Manual testing completed
  - [ ] Performance benchmarks meet requirements
  
  ## Breaking Changes
  None
  
  ## Related Issues
  Closes #123, #124`,
  draft: false,
  maintainerCanModify: true
});

// Review a pull request
await github.reviewPullRequest('owner/repo-name', 456, {
  event: 'APPROVE', // or 'REQUEST_CHANGES', 'COMMENT'
  body: `Great work on this feature! 🚀
  
  The implementation looks solid and the tests provide good coverage. I particularly like:
  - Clean separation of concerns
  - Comprehensive error handling
  - Well-documented API
  
  Ready to merge!`
});

// Merge a pull request
await github.mergePullRequest('owner/repo-name', 456, {
  commitTitle: 'feat: Add AI-powered code suggestions (#456)',
  commitMessage: 'Adds AI integration with OpenAI API for enhanced developer experience',
  mergeMethod: 'squash' // or 'merge', 'rebase'
});
```

### **Community Engagement**

#### **User and Repository Interaction**

```typescript
// Follow a user
await github.follow('username');

// Get user profile
const profile = await github.getProfile('username');
console.log(`User: ${profile.displayName} (@${profile.username})`);
console.log(`Bio: ${profile.bio}`);
console.log(`Public repos: ${profile.metadata.publicRepos}`);
console.log(`Followers: ${profile.metadata.followers}`);

// Search for repositories
const repos = await github.search('machine learning python', {
  type: 'repositories',
  sort: 'stars',
  order: 'desc',
  language: 'python'
});

// Engage with popular repositories
for (const repo of repos.slice(0, 10)) {
  if (repo.metrics.stars > 1000) {
    // Star interesting repositories
    await github.share(repo.fullName);
    
    // Add thoughtful comments to recent issues
    const issues = await github.getRepositoryIssues(repo.fullName, {
      state: 'open',
      sort: 'created',
      direction: 'desc',
      per_page: 5
    });
    
    for (const issue of issues) {
      if (issue.comments < 5) { // Engage with issues that need attention
        await github.comment(`${repo.fullName}/issues/${issue.number}`,
          `Interesting issue! I've encountered similar challenges in my projects. 
          
          Have you considered using [relevant technology/approach]? It might help with [specific aspect of the problem].
          
          Happy to contribute if you need help with implementation!`
        );
      }
    }
  }
}
```

## 📊 **Analytics and Insights**

### **Repository Analytics**

```typescript
// Get repository statistics
const stats = await github.getRepositoryStats('owner/repo-name');
console.log(`Stars: ${stats.stars}`);
console.log(`Forks: ${stats.forks}`);
console.log(`Open issues: ${stats.openIssues}`);
console.log(`Contributors: ${stats.contributors}`);

// Get commit activity
const activity = await github.getCommitActivity('owner/repo-name');
console.log(`Commits this week: ${activity.thisWeek}`);
console.log(`Total commits: ${activity.total}`);

// Get language statistics
const languages = await github.getLanguageStats('owner/repo-name');
Object.entries(languages).forEach(([lang, bytes]) => {
  console.log(`${lang}: ${((bytes / languages.total) * 100).toFixed(1)}%`);
});
```

### **Issue and PR Analytics**

```typescript
// Analyze issue trends
const issueStats = await github.getIssueAnalytics('owner/repo-name', {
  timeRange: 'last-30-days'
});
console.log(`Issues opened: ${issueStats.opened}`);
console.log(`Issues closed: ${issueStats.closed}`);
console.log(`Average resolution time: ${issueStats.avgResolutionTime} hours`);

// Get pull request metrics
const prStats = await github.getPullRequestAnalytics('owner/repo-name');
console.log(`PRs merged: ${prStats.merged}`);
console.log(`Average review time: ${prStats.avgReviewTime} hours`);
console.log(`Code review participation: ${prStats.reviewParticipation}%`);
```

## 🔄 **Real-time Features**

### **Webhook Integration**

```typescript
// Set up comprehensive webhook monitoring
const webhookConfig = {
  url: 'https://yourapp.com/webhooks/github',
  events: [
    'issues',           // Issue events
    'pull_request',     // PR events
    'push',            // Push events
    'release',         // Release events
    'star',            // Star events
    'fork',            // Fork events
    'watch'            // Watch events
  ],
  secret: 'your-webhook-secret'
};

await github.setupWebhook('owner/repo-name', webhookConfig);

// Handle webhook events
github.on('issue_opened', (issue) => {
  console.log(`New issue: ${issue.title}`);
  // Auto-triage logic here
});

github.on('pull_request_opened', (pr) => {
  console.log(`New PR: ${pr.title}`);
  // Auto-review assignment logic here
});

github.on('push', (push) => {
  console.log(`New push to ${push.ref} by ${push.pusher.name}`);
  // CI/CD trigger logic here
});
```

### **Real-time Monitoring**

```typescript
// Monitor repository activity
github.on('repository_activity', (activity) => {
  switch (activity.type) {
    case 'star':
      console.log(`⭐ Repository starred by ${activity.user.login}`);
      // Thank new stargazers
      github.follow(activity.user.login);
      break;
      
    case 'fork':
      console.log(`🍴 Repository forked by ${activity.user.login}`);
      // Engage with fork creators
      github.comment(`${activity.repository}/issues/1`,
        `Thanks for forking our project, @${activity.user.login}! 
        Feel free to reach out if you need any help or want to contribute back.`
      );
      break;
      
    case 'issue_comment':
      console.log(`💬 New comment on issue #${activity.issue.number}`);
      // Auto-respond to mentions
      if (activity.comment.body.includes('@bot')) {
        github.comment(`${activity.repository}/issues/${activity.issue.number}`,
          `Thanks for mentioning me! I'll look into this and get back to you soon.`
        );
      }
      break;
  }
});
```

## 🛠️ **Advanced Use Cases**

### **Automated Code Review**

```typescript
// Automated code review bot
github.on('pull_request_opened', async (pr) => {
  // Get PR diff and files changed
  const diff = await github.getPullRequestDiff(pr.repository, pr.number);
  const files = await github.getPullRequestFiles(pr.repository, pr.number);
  
  const reviewComments = [];
  
  for (const file of files) {
    // Check for common issues
    if (file.filename.endsWith('.js') || file.filename.endsWith('.ts')) {
      // Check for console.log statements
      if (file.patch.includes('console.log')) {
        reviewComments.push({
          path: file.filename,
          line: getLineNumber(file.patch, 'console.log'),
          body: '🚨 Please remove console.log statements before merging.'
        });
      }
      
      // Check for TODO comments
      if (file.patch.includes('TODO')) {
        reviewComments.push({
          path: file.filename,
          line: getLineNumber(file.patch, 'TODO'),
          body: '📝 Consider creating an issue for this TODO item.'
        });
      }
    }
    
    // Check for large files
    if (file.changes > 500) {
      reviewComments.push({
        path: file.filename,
        line: 1,
        body: '📏 This file has many changes. Consider breaking it into smaller commits.'
      });
    }
  }
  
  // Submit review with comments
  if (reviewComments.length > 0) {
    await github.reviewPullRequest(pr.repository, pr.number, {
      event: 'REQUEST_CHANGES',
      body: 'Automated review found some issues that should be addressed.',
      comments: reviewComments
    });
  } else {
    await github.reviewPullRequest(pr.repository, pr.number, {
      event: 'APPROVE',
      body: '✅ Automated review passed! Code looks good to merge.'
    });
  }
});
```

### **Release Automation**

```typescript
// Automated release management
const automateRelease = async (repository: string) => {
  // Get latest commits since last release
  const lastRelease = await github.getLatestRelease(repository);
  const commits = await github.getCommitsSince(repository, lastRelease.tagName);
  
  // Analyze commit messages for version bump
  let versionBump = 'patch';
  const breakingChanges = [];
  const features = [];
  const fixes = [];
  
  for (const commit of commits) {
    const message = commit.message.toLowerCase();
    
    if (message.includes('breaking change') || message.startsWith('feat!:')) {
      versionBump = 'major';
      breakingChanges.push(commit.message);
    } else if (message.startsWith('feat:')) {
      if (versionBump !== 'major') versionBump = 'minor';
      features.push(commit.message);
    } else if (message.startsWith('fix:')) {
      fixes.push(commit.message);
    }
  }
  
  // Generate release notes
  const releaseNotes = generateReleaseNotes({
    breakingChanges,
    features,
    fixes,
    version: calculateNextVersion(lastRelease.tagName, versionBump)
  });
  
  // Create release
  await github.createRelease(repository, {
    tagName: calculateNextVersion(lastRelease.tagName, versionBump),
    name: `Release ${calculateNextVersion(lastRelease.tagName, versionBump)}`,
    body: releaseNotes,
    draft: false,
    prerelease: versionBump === 'major'
  });
};
```

### **Community Management**

```typescript
// Automated community engagement
const manageCommunity = async () => {
  const repositories = ['owner/repo1', 'owner/repo2', 'owner/repo3'];
  
  for (const repo of repositories) {
    // Welcome new contributors
    const recentContributors = await github.getRecentContributors(repo);
    for (const contributor of recentContributors) {
      if (contributor.isFirstTime) {
        await github.comment(`${repo}/issues/${contributor.firstPR}`,
          `🎉 Welcome to the project, @${contributor.username}! 
          
          Thank you for your first contribution. We're excited to have you as part of our community!
          
          If you have any questions or need help with anything, feel free to:
          - Check out our [Contributing Guide](CONTRIBUTING.md)
          - Join our [Discord community](https://discord.gg/project)
          - Reach out to any of the maintainers
          
          Looking forward to more contributions from you! 🚀`
        );
      }
    }
    
    // Engage with active issues
    const activeIssues = await github.getRepositoryIssues(repo, {
      state: 'open',
      sort: 'updated',
      direction: 'desc'
    });
    
    for (const issue of activeIssues.slice(0, 5)) {
      if (issue.comments === 0 && isOlderThan(issue.createdAt, '2 days')) {
        await github.comment(`${repo}/issues/${issue.number}`,
          `Thanks for opening this issue! 👋
          
          We've received your report and will look into it. To help us resolve this faster, could you please:
          
          - Provide more details about your environment
          - Share any error messages or logs
          - Include steps to reproduce the issue
          
          We appreciate your patience and contribution to improving our project!`
        );
      }
    }
  }
};
```

## 🚨 **Error Handling and Troubleshooting**

### **Common Error Scenarios**

```typescript
try {
  await github.post({
    type: 'issue',
    repository: 'owner/repo-name',
    content: { title: 'Test Issue', body: 'Test content' }
  });
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    console.log('GitHub rate limit hit, waiting before retry...');
    const resetTime = error.response?.headers['x-ratelimit-reset'];
    const waitTime = (resetTime * 1000) - Date.now();
    await new Promise(resolve => setTimeout(resolve, waitTime));
    // Retry the operation
  } else if (error.message.includes('Not Found')) {
    console.log('Repository not found or no access permissions');
    // Handle repository access issues
  } else if (error.message.includes('Validation Failed')) {
    console.log('Invalid data provided:', error.response?.data?.errors);
    // Handle validation errors
  } else if (error.message.includes('Bad credentials')) {
    console.log('Authentication failed, checking token...');
    await github.authenticate(); // Re-authenticate
  } else {
    console.error('Unexpected GitHub error:', error.message);
  }
}
```

### **Rate Limit Management**

```typescript
// Check rate limit status
const rateLimitStatus = await github.getRateLimitStatus();
console.log('Core API remaining:', rateLimitStatus.core.remaining);
console.log('Search API remaining:', rateLimitStatus.search.remaining);
console.log('Reset time:', new Date(rateLimitStatus.core.reset * 1000));

// Implement smart rate limiting
async function smartGitHubOperation(operation: () => Promise<any>) {
  const status = await github.getRateLimitStatus();
  
  if (status.core.remaining < 100) {
    const waitTime = (status.core.reset * 1000) - Date.now();
    console.log(`Waiting ${waitTime}ms for GitHub rate limit reset...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  return await operation();
}
```

## 🔗 **Integration Examples**

### **With Agent Builder**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { GitHubAdapter } from '@mplp/adapters';

const githubBot = new AgentBuilder('GitHubBot')
  .withName('Repository Management Assistant')
  .withPlatform('github', new GitHubAdapter(githubConfig))
  .withCapability('issueManagement', async (repository) => {
    // Automated issue triage and management
    const issues = await this.platform.getRepositoryIssues(repository);
    
    for (const issue of issues) {
      if (issue.labels.length === 0) {
        // Auto-label based on content analysis
        const labels = analyzeIssueContent(issue.title, issue.body);
        await this.platform.updateIssue(repository, issue.number, { labels });
      }
    }
  })
  .build();

await githubBot.start();
```

### **With Orchestrator**

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

const orchestrator = new MultiAgentOrchestrator();

// Create repository maintenance workflow
const maintenanceWorkflow = orchestrator.createWorkflow('RepositoryMaintenance')
  .addStep('analyzeIssues', async () => {
    // Analyze open issues across repositories
    return await github.getRepositoryIssues('owner/repo', { state: 'open' });
  })
  .addStep('triageIssues', async (issues) => {
    // Auto-triage and label issues
    for (const issue of issues) {
      const labels = await analyzeIssueForLabels(issue);
      await github.updateIssue('owner/repo', issue.number, { labels });
    }
  })
  .addStep('engageCommunity', async () => {
    // Engage with community members
    const recentActivity = await github.getRepositoryActivity('owner/repo');
    await processRecentActivity(recentActivity);
  });

await maintenanceWorkflow.execute();
```

## 📚 **Best Practices**

### **Repository Management**

- **Clear Documentation**: Maintain comprehensive README, CONTRIBUTING, and CODE_OF_CONDUCT files
- **Issue Templates**: Use issue and PR templates for consistent reporting
- **Branch Protection**: Enable branch protection rules for main branches
- **Automated Testing**: Set up CI/CD pipelines for automated testing
- **Security**: Enable security features like dependency scanning and secret scanning

### **Community Engagement**

- **Responsive Communication**: Respond to issues and PRs within 48 hours
- **Welcoming Environment**: Create an inclusive and welcoming community
- **Recognition**: Acknowledge and thank contributors regularly
- **Clear Guidelines**: Provide clear contribution guidelines and coding standards

### **API Usage Optimization**

- **Rate Limit Awareness**: Monitor and respect GitHub's rate limits
- **Efficient Queries**: Use GraphQL for complex queries to reduce API calls
- **Caching**: Cache frequently accessed data to minimize API usage
- **Batch Operations**: Group related operations to optimize API usage

## 🔗 **Related Documentation**

- [Platform Adapters Overview](../../README.md) - Complete platform adapter system
- [Agent Builder Integration](../../sdk-api/agent-builder/README.md) - Building GitHub-enabled agents
- [Orchestrator Workflows](../../sdk-api/orchestrator/README.md) - Multi-platform orchestration
- [Twitter Adapter](../twitter/README.md) - Twitter platform integration
- [LinkedIn Adapter](../linkedin/README.md) - LinkedIn platform integration

---

**Adapter Maintainer**: MPLP Platform Team  
**Last Review**: 2025-09-20  
**Test Coverage**: 100% (94/94 tests passing)  
**Status**: ✅ Production Ready
