# LinkedIn Platform Adapter - Complete Usage Guide

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/platform-adapters/linkedin/README.md)


> **Platform**: LinkedIn  
> **Adapter**: @mplp/adapters - LinkedInAdapter  
> **Version**: v1.1.0  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Overview**

The LinkedIn Platform Adapter provides comprehensive integration with LinkedIn's professional networking platform, enabling intelligent agents to interact with LinkedIn through posting content, managing connections, company page management, and professional networking automation. It supports OAuth 2.0 authentication with enterprise-grade features for business and personal profiles.

### **🎯 Key Features**

- **💼 Professional Content**: Post articles, updates, and professional content
- **🤝 Network Management**: Connect with professionals, manage connections
- **🏢 Company Pages**: Manage company pages, post company updates
- **📊 Analytics**: Content performance, engagement metrics, audience insights
- **🔐 OAuth 2.0**: Secure authentication with LinkedIn's API
- **⚡ Rate Limiting**: Intelligent API rate limit management
- **🔄 Real-time Events**: Connection requests, message monitoring
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
import { LinkedInAdapter } from '@mplp/adapters';

// Create LinkedIn adapter with OAuth 2.0
const linkedin = new LinkedInAdapter({
  platform: 'linkedin',
  name: 'My LinkedIn Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirectUri: 'https://yourapp.com/auth/linkedin/callback',
      scopes: ['r_liteprofile', 'w_member_social', 'r_organization_social', 'w_organization_social']
    }
  }
});

// Initialize and authenticate
await linkedin.initialize();
await linkedin.authenticate();

console.log('✅ LinkedIn adapter ready!');
```

### **Post Your First Update**

```typescript
// Simple text post
const result = await linkedin.post({
  type: 'text',
  content: 'Excited to share insights about AI and automation in the workplace! 🚀 #AI #Automation #Innovation'
});

console.log(`Post published: ${result.data.url}`);
```

## 🔧 **Configuration**

### **OAuth 2.0 Authentication**

#### **Personal Profile Access**

```typescript
const personalConfig = {
  platform: 'linkedin',
  name: 'LinkedIn Personal Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: 'your-linkedin-client-id',
      clientSecret: 'your-linkedin-client-secret',
      redirectUri: 'https://yourapp.com/auth/linkedin/callback',
      scopes: [
        'r_liteprofile',      // Read basic profile
        'r_emailaddress',     // Read email address
        'w_member_social',    // Write posts as member
        'r_member_social'     // Read member's posts
      ]
    }
  },
  rateLimits: {
    posts: { requests: 100, window: 86400000 }, // 100 posts per day
    connections: { requests: 100, window: 86400000 }, // 100 connection requests per day
    searches: { requests: 500, window: 86400000 } // 500 searches per day
  }
};
```

#### **Company Page Management**

```typescript
const companyConfig = {
  platform: 'linkedin',
  name: 'LinkedIn Company Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: 'your-linkedin-client-id',
      clientSecret: 'your-linkedin-client-secret',
      redirectUri: 'https://yourapp.com/auth/linkedin/callback',
      scopes: [
        'r_organization_social',  // Read company posts
        'w_organization_social',  // Write company posts
        'rw_organization_admin',  // Manage company page
        'r_basicprofile'         // Read basic profile info
      ]
    }
  },
  companyId: 'your-company-id', // LinkedIn company ID
  rateLimits: {
    companyPosts: { requests: 50, window: 86400000 },
    analytics: { requests: 1000, window: 86400000 }
  }
};
```

### **Advanced Configuration**

```typescript
const enterpriseConfig = {
  platform: 'linkedin',
  name: 'Enterprise LinkedIn Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirectUri: process.env.LINKEDIN_REDIRECT_URI!,
      scopes: [
        'r_liteprofile', 'w_member_social', 'r_organization_social', 
        'w_organization_social', 'rw_organization_admin'
      ]
    }
  },
  rateLimits: {
    posts: { requests: 100, window: 86400000 },
    connections: { requests: 100, window: 86400000 },
    analytics: { requests: 1000, window: 86400000 }
  },
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    maxBackoffTime: 60000
  },
  monitoring: {
    enabled: true,
    webhookUrl: 'https://yourapp.com/webhooks/linkedin',
    events: ['connection_request', 'message', 'post_engagement']
  },
  contentFilters: {
    maxLength: 3000, // LinkedIn post character limit
    allowedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
    requireApproval: true, // Require approval for company posts
    profanityFilter: true
  }
};
```

## 📝 **Core Operations**

### **Personal Profile Posts**

#### **Text Posts**

```typescript
// Simple professional update
await linkedin.post({
  type: 'text',
  content: 'Thrilled to announce our latest AI breakthrough! Our team has developed a revolutionary approach to natural language processing. #AI #Innovation #TechNews'
});

// Post with professional insights
await linkedin.post({
  type: 'text',
  content: `Key takeaways from today's AI conference:
  
  🔹 Machine learning is transforming every industry
  🔹 Ethical AI development is crucial
  🔹 Human-AI collaboration is the future
  
  What are your thoughts on the future of AI? #ArtificialIntelligence #MachineLearning #Future`,
  metadata: {
    tags: ['AI', 'MachineLearning', 'Conference'],
    visibility: 'public'
  }
});
```

#### **Posts with Media**

```typescript
// Post with image
await linkedin.post({
  type: 'text',
  content: 'Proud to share our team\'s achievement at the tech summit! 🏆',
  media: [
    {
      type: 'image',
      url: 'https://example.com/team-photo.jpg',
      altText: 'Our development team receiving the innovation award'
    }
  ]
});

// Post with document (PDF, presentation)
await linkedin.post({
  type: 'text',
  content: 'Sharing our latest research paper on AI ethics. Download the full PDF below! 📄',
  media: [
    {
      type: 'document',
      url: 'https://example.com/ai-ethics-research.pdf',
      title: 'AI Ethics in Modern Development',
      description: 'Comprehensive research on ethical AI development practices'
    }
  ]
});

// Post with video
await linkedin.post({
  type: 'text',
  content: 'Watch our CEO discuss the future of automation in this exclusive interview! 🎥',
  media: [
    {
      type: 'video',
      url: 'https://example.com/ceo-interview.mp4',
      thumbnail: 'https://example.com/video-thumbnail.jpg',
      duration: 300 // 5 minutes
    }
  ]
});
```

### **Company Page Management**

#### **Company Posts**

```typescript
// Post as company
await linkedin.postAsCompany({
  companyId: 'your-company-id',
  content: {
    type: 'text',
    content: `🚀 We're hiring! Join our innovative AI team and help shape the future of technology.

    Open positions:
    • Senior AI Engineer
    • Machine Learning Researcher  
    • Data Scientist
    • Product Manager - AI

    Apply now: https://company.com/careers #Hiring #AI #Careers #Innovation`,
    media: [
      {
        type: 'image',
        url: 'https://company.com/hiring-banner.jpg',
        altText: 'Join our AI team - We are hiring'
      }
    ]
  }
});

// Company milestone announcement
await linkedin.postAsCompany({
  companyId: 'your-company-id',
  content: {
    type: 'text',
    content: `🎉 Milestone Alert! We've reached 1 million users on our AI platform!

    Thank you to our incredible community for making this possible. This is just the beginning of our journey to democratize AI technology.

    #Milestone #AI #Community #Gratitude`,
    visibility: 'public'
  }
});
```

### **Professional Networking**

#### **Connection Management**

```typescript
// Send connection request
await linkedin.connect('user-profile-id', {
  message: 'Hi! I noticed we both work in AI development. Would love to connect and share insights about the industry!'
});

// Accept connection request
await linkedin.acceptConnection('connection-request-id');

// Get connections
const connections = await linkedin.getConnections();
console.log(`Total connections: ${connections.length}`);

// Search for professionals
const aiProfessionals = await linkedin.searchPeople({
  keywords: 'artificial intelligence machine learning',
  location: 'San Francisco Bay Area',
  industry: 'Technology',
  currentCompany: 'Google, Microsoft, OpenAI'
});
```

#### **Professional Messaging**

```typescript
// Send professional message
await linkedin.sendMessage('connection-id', {
  subject: 'Collaboration Opportunity',
  content: `Hi [Name],

  I hope this message finds you well. I came across your recent post about AI ethics and found your insights fascinating.

  I'm working on a similar project and would love to explore potential collaboration opportunities. Would you be interested in a brief call to discuss?

  Best regards,
  [Your Name]`
});

// Follow up on previous conversations
await linkedin.sendMessage('connection-id', {
  content: 'Thanks for the great conversation yesterday! As promised, here\'s the research paper we discussed: [link]'
});
```

### **Content Discovery and Engagement**

#### **Feed Interaction**

```typescript
// Get LinkedIn feed
const feed = await linkedin.getFeed({ limit: 20 });

// Engage with posts
for (const post of feed) {
  if (post.content.includes('AI') || post.content.includes('automation')) {
    // Like relevant posts
    await linkedin.react(post.id, 'like');
    
    // Comment on interesting posts
    if (post.metrics.likes > 100) {
      await linkedin.comment(post.id, 'Great insights! Thanks for sharing your perspective on this important topic.');
    }
  }
}
```

#### **Industry Content Search**

```typescript
// Search for industry content
const aiContent = await linkedin.searchPosts({
  keywords: 'artificial intelligence trends 2025',
  dateRange: 'past-week',
  sortBy: 'relevance'
});

// Curate and share valuable content
for (const post of aiContent) {
  if (post.metrics.engagement > 500) {
    await linkedin.share(post.id, 'Excellent analysis of AI trends. This aligns perfectly with what we\'re seeing in the industry.');
  }
}
```

## 📊 **Analytics and Insights**

### **Personal Profile Analytics**

```typescript
// Get profile analytics
const profileStats = await linkedin.getProfileAnalytics();
console.log(`Profile views: ${profileStats.profileViews}`);
console.log(`Post impressions: ${profileStats.postImpressions}`);
console.log(`Engagement rate: ${profileStats.engagementRate}%`);

// Get post performance
const postAnalytics = await linkedin.getPostAnalytics('post-id');
console.log(`Impressions: ${postAnalytics.impressions}`);
console.log(`Clicks: ${postAnalytics.clicks}`);
console.log(`Comments: ${postAnalytics.comments}`);
console.log(`Shares: ${postAnalytics.shares}`);
```

### **Company Page Analytics**

```typescript
// Get company page analytics
const companyStats = await linkedin.getCompanyAnalytics('company-id');
console.log(`Followers: ${companyStats.followers}`);
console.log(`Page views: ${companyStats.pageViews}`);
console.log(`Post reach: ${companyStats.postReach}`);

// Track follower growth
const followerGrowth = await linkedin.getFollowerGrowth('company-id', {
  timeRange: 'last-30-days',
  granularity: 'daily'
});
```

## 🔄 **Real-time Features**

### **Event Monitoring**

```typescript
// Monitor connection requests
linkedin.on('connectionRequest', (request) => {
  console.log(`New connection request from: ${request.sender.name}`);
  
  // Auto-accept connections from specific companies
  const targetCompanies = ['Google', 'Microsoft', 'OpenAI'];
  if (targetCompanies.includes(request.sender.company)) {
    linkedin.acceptConnection(request.id);
  }
});

// Monitor messages
linkedin.on('message', (message) => {
  console.log(`New message from: ${message.sender.name}`);
  
  // Auto-respond to common inquiries
  if (message.content.toLowerCase().includes('collaboration')) {
    linkedin.sendMessage(message.sender.id, {
      content: 'Thank you for reaching out! I\'d be happy to discuss collaboration opportunities. Let me get back to you within 24 hours.'
    });
  }
});

// Monitor post engagement
linkedin.on('postEngagement', (engagement) => {
  console.log(`New ${engagement.type} on post: ${engagement.postId}`);
});
```

### **Webhook Integration**

```typescript
// Set up webhook for real-time events
const webhookConfig = {
  url: 'https://yourapp.com/webhooks/linkedin',
  events: ['connection_request', 'message', 'post_engagement', 'profile_view'],
  secret: 'your-webhook-secret'
};

await linkedin.setupWebhook(webhookConfig);
```

## 🛠️ **Advanced Use Cases**

### **Professional Lead Generation**

```typescript
// Automated lead generation for B2B
const leadGeneration = async () => {
  // Search for decision makers in target industries
  const prospects = await linkedin.searchPeople({
    keywords: 'CTO CEO VP Engineering',
    industry: 'Software Development',
    companySize: '201-500',
    location: 'United States'
  });

  for (const prospect of prospects.slice(0, 10)) { // Limit to 10 per day
    // Send personalized connection request
    await linkedin.connect(prospect.id, {
      message: `Hi ${prospect.firstName}, I noticed your work in ${prospect.industry}. I'd love to connect and share insights about AI automation solutions that could benefit ${prospect.company}.`
    });
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay
  }
};
```

### **Content Marketing Automation**

```typescript
// Automated content marketing strategy
const contentSchedule = [
  {
    day: 'Monday',
    time: '09:00',
    type: 'industry-insights',
    content: 'Weekly AI industry roundup and trends analysis'
  },
  {
    day: 'Wednesday', 
    time: '14:00',
    type: 'company-update',
    content: 'Behind-the-scenes look at our development process'
  },
  {
    day: 'Friday',
    time: '16:00',
    type: 'thought-leadership',
    content: 'Opinion piece on the future of AI in business'
  }
];

// Schedule content posting
contentSchedule.forEach(({ day, time, type, content }) => {
  // Implementation would use a job scheduler like node-cron
  console.log(`Scheduled ${type} for ${day} at ${time}: ${content}`);
});
```

### **Employee Advocacy Program**

```typescript
// Automate employee advocacy for company content
const employeeAdvocacy = async () => {
  // Get latest company posts
  const companyPosts = await linkedin.getCompanyPosts('company-id', { limit: 5 });
  
  // Get employee list (would be maintained separately)
  const employees = await getEmployeeLinkedInProfiles();
  
  for (const post of companyPosts) {
    // Encourage employees to engage with company content
    for (const employee of employees) {
      if (employee.advocacyOptIn) {
        // Send notification to employee about new company content
        await sendEmployeeNotification(employee.id, {
          type: 'company-content-available',
          postId: post.id,
          suggestedComment: generatePersonalizedComment(post.content, employee.role)
        });
      }
    }
  }
};
```

## 🚨 **Error Handling and Troubleshooting**

### **Common Error Scenarios**

```typescript
try {
  await linkedin.post({
    type: 'text',
    content: 'This post might fail for various reasons'
  });
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    console.log('LinkedIn rate limit hit, waiting before retry...');
    await new Promise(resolve => setTimeout(resolve, 3600000)); // Wait 1 hour
    // Retry the operation
  } else if (error.message.includes('Invalid access token')) {
    console.log('Access token expired, refreshing...');
    await linkedin.refreshToken();
  } else if (error.message.includes('Content policy violation')) {
    console.log('Content violates LinkedIn policy, reviewing...');
    // Implement content review process
  } else if (error.message.includes('Insufficient permissions')) {
    console.log('Missing required scopes, updating permissions...');
    // Guide user to re-authorize with additional scopes
  } else {
    console.error('Unexpected LinkedIn error:', error.message);
  }
}
```

### **Rate Limit Management**

```typescript
// Check rate limit status
const rateLimitStatus = await linkedin.getRateLimitStatus();
console.log('Remaining posts:', rateLimitStatus.posts.remaining);
console.log('Reset time:', new Date(rateLimitStatus.posts.resetTime));

// Implement intelligent rate limiting
async function smartPost(content: any) {
  const status = await linkedin.getRateLimitStatus();
  
  if (status.posts.remaining < 5) {
    const waitTime = status.posts.resetTime - Date.now();
    console.log(`Waiting ${waitTime}ms for LinkedIn rate limit reset...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  return await linkedin.post(content);
}
```

## 🔗 **Integration Examples**

### **With Agent Builder**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { LinkedInAdapter } from '@mplp/adapters';

const linkedinBot = new AgentBuilder('LinkedInBot')
  .withName('Professional Networking Assistant')
  .withPlatform('linkedin', new LinkedInAdapter(linkedinConfig))
  .withCapability('networkGrowth', async () => {
    // Automated networking strategy
    const prospects = await this.platform.searchPeople({
      keywords: 'AI machine learning',
      industry: 'Technology'
    });
    
    for (const prospect of prospects.slice(0, 5)) {
      await this.platform.connect(prospect.id, {
        message: 'Hi! I\'d love to connect and share insights about AI development.'
      });
    }
  })
  .build();

await linkedinBot.start();
```

### **With Orchestrator**

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

const orchestrator = new MultiAgentOrchestrator();

// Create professional networking workflow
const networkingWorkflow = orchestrator.createWorkflow('ProfessionalNetworking')
  .addStep('research', async () => {
    // Research industry trends and topics
    return await linkedin.searchPosts({ keywords: 'AI trends 2025' });
  })
  .addStep('engage', async (trendingPosts) => {
    // Engage with trending content
    for (const post of trendingPosts.slice(0, 10)) {
      await linkedin.react(post.id, 'like');
      if (post.metrics.engagement > 100) {
        await linkedin.comment(post.id, 'Great insights! Thanks for sharing.');
      }
    }
  })
  .addStep('share', async () => {
    // Share valuable insights
    await linkedin.post({
      type: 'text',
      content: 'Key AI trends I\'m seeing this week: [insights based on research]'
    });
  });

await networkingWorkflow.execute();
```

## 📚 **Best Practices**

### **Professional Content Strategy**

- **Value-First**: Always provide value in your posts - insights, tips, or industry news
- **Authenticity**: Maintain a professional but authentic voice
- **Consistency**: Post regularly (3-5 times per week) to maintain visibility
- **Engagement**: Respond to comments and engage with others' content
- **Visual Content**: Include images, videos, or documents to increase engagement

### **Networking Etiquette**

- **Personalized Messages**: Always personalize connection requests
- **Mutual Value**: Focus on how you can provide value to connections
- **Follow-Up**: Follow up on conversations and maintain relationships
- **Respect Boundaries**: Don't be overly aggressive with outreach
- **Quality over Quantity**: Focus on meaningful connections over connection count

### **Compliance and Ethics**

- **LinkedIn Terms**: Follow LinkedIn's User Agreement and Professional Community Policies
- **Data Privacy**: Respect user privacy and data protection regulations
- **Authentic Engagement**: Avoid fake engagement or spam-like behavior
- **Professional Standards**: Maintain high professional standards in all interactions

## 🔗 **Related Documentation**

- [Platform Adapters Overview](../../README.md) - Complete platform adapter system
- [Agent Builder Integration](../../sdk-api/agent-builder/README.md) - Building LinkedIn-enabled agents
- [Orchestrator Workflows](../../sdk-api/orchestrator/README.md) - Multi-platform orchestration
- [Twitter Adapter](../twitter/README.md) - Twitter platform integration
- [GitHub Adapter](../github/README.md) - GitHub platform integration

---

**Adapter Maintainer**: MPLP Platform Team  
**Last Review**: 2025-09-20  
**Test Coverage**: 100% (76/76 tests passing)  
**Status**: ✅ Production Ready
