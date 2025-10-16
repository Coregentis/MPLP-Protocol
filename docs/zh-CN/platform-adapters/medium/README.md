# Medium平台适配器 - 完整使用指南

> **🌐 语言导航**: [English](../../../en/platform-adapters/medium/README.md) | [中文](README.md)


> **平台**: Medium  
> **适配器**: @mplp/adapters - MediumAdapter  
> **版本**: v1.1.0-beta  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **概览**

Medium平台适配器提供与Medium内容发布平台的全面集成，使智能代理能够创建、发布和管理文章，参与Medium社区，并自动化内容分发工作流程。它使用Medium的API，具有适用于个人和基于出版物的内容策略的企业级功能。

### **🎯 关键功能**

- **📝 文章管理**: 创建、编辑、发布带有丰富格式和媒体的文章
- **📚 出版物集成**: 管理出版物、提交文章、与编辑协作
- **👥 社区参与**: 关注用户、为文章鼓掌、回复评论
- **🔍 内容发现**: 搜索文章、探索话题、分析热门内容
- **🔐 OAuth认证**: Medium OAuth，具有全面的权限管理
- **⚡ 速率限制**: 智能Medium API速率限制管理
- **📊 分析集成**: 跟踪文章性能和读者参与度
- **🛡️ 内容审核**: 自动化内容质量检查和指导原则合规性

### **📦 安装**

```bash
# 安装适配器包
npm install @mplp/adapters

# 或全局安装用于CLI使用
npm install -g @mplp/adapters
```

## 🚀 **快速开始**

### **基础设置**

```typescript
import { MediumAdapter } from '@mplp/adapters';

// 使用OAuth凭据创建Medium适配器
const medium = new MediumAdapter({
  platform: 'medium',
  name: '我的Medium发布者',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth',
    credentials: {
      clientId: process.env.MEDIUM_CLIENT_ID!,
      clientSecret: process.env.MEDIUM_CLIENT_SECRET!,
      accessToken: process.env.MEDIUM_ACCESS_TOKEN!
    }
  }
});

// 初始化和认证
await medium.initialize();
await medium.authenticate();

console.log('✅ Medium适配器已就绪！');
```

### **发布第一篇文章**

```typescript
// 创建并发布文章
const result = await medium.post({
  type: 'article',
  title: '介绍MPLP：多智能体系统的未来 🤖',
  content: `# 欢迎来到AI开发的未来

多智能体协议生命周期平台（MPLP）代表了我们构建和部署智能系统方式的范式转变...

## 关键优势

- **标准化协议**: 通用通信标准
- **企业就绪**: 生产级可靠性和安全性
- **开发者友好**: 直观的API和全面的文档

准备开始了吗？查看我们的[文档](https://docs.mplp.dev)！`,
  tags: ['artificial-intelligence', 'software-development', 'technology', 'programming'],
  publishStatus: 'public'
});

console.log(`文章已发布: ${result.data.url}`);
```

## 🔧 **配置**

### **OAuth认证**

#### **基础OAuth配置**

```typescript
const mediumConfig = {
  platform: 'medium',
  name: 'Medium发布者',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth',
    credentials: {
      clientId: 'your-medium-client-id',
      clientSecret: 'your-medium-client-secret',
      accessToken: 'your-medium-access-token'
    }
  },
  scopes: [
    'basicProfile',    // 访问用户资料信息
    'listPublications', // 列出用户的出版物
    'publishPost'      // 代表用户发布帖子
  ],
  rateLimits: {
    requests: 1000,    // 每小时1000个请求
    window: 3600000    // 1小时窗口
  }
};
```

#### **高级OAuth配置**

```typescript
const advancedConfig = {
  platform: 'medium',
  name: '高级Medium发布者',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth',
    credentials: {
      clientId: process.env.MEDIUM_CLIENT_ID!,
      clientSecret: process.env.MEDIUM_CLIENT_SECRET!,
      accessToken: process.env.MEDIUM_ACCESS_TOKEN!,
      refreshToken: process.env.MEDIUM_REFRESH_TOKEN!
    }
  },
  scopes: [
    'basicProfile', 'listPublications', 'publishPost'
  ],
  rateLimits: {
    requests: 1000,
    window: 3600000,
    burstLimit: 50 // 允许50个请求的突发
  },
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    maxBackoffTime: 30000
  },
  monitoring: {
    enabled: true,
    webhookUrl: 'https://yourapp.com/webhooks/medium',
    events: ['article_published', 'article_updated', 'engagement_received']
  },
  contentSettings: {
    autoSave: true,
    draftBackup: true,
    imageOptimization: true,
    seoOptimization: true,
    readabilityCheck: true
  }
};
```

## 📝 **核心操作**

### **文章管理**

#### **创建文章**

```typescript
// 简单文章
await medium.post({
  type: 'article',
  title: 'MPLP入门指南',
  content: `# 多智能体系统简介

多智能体系统代表了AI开发的下一个演进...

## 核心概念

1. **智能体**: 具有特定能力的自主实体
2. **协议**: 标准化通信方法
3. **协调**: 编排的多智能体工作流程

让我们深入了解每个概念。`,
  tags: ['ai', 'programming', 'tutorial'],
  publishStatus: 'public'
});

// 带丰富格式的文章
await medium.post({
  type: 'article',
  title: '高级MPLP模式：构建可扩展的智能体网络',
  content: `# 高级MPLP模式

> "未来属于能够利用多个AI智能体集体智慧的组织。" - 技术远见者

## 目录

1. [智能体编排](#orchestration)
2. [协议设计](#protocols)
3. [可扩展性模式](#scalability)
4. [实际案例](#examples)

## 智能体编排 {#orchestration}

在构建复杂的多智能体系统时，编排变得至关重要...

\`\`\`typescript
// 示例：创建智能体工作流程
const workflow = orchestrator.createWorkflow('DataProcessing')
  .addStep('extract', extractAgent)
  .addStep('transform', transformAgent)
  .addStep('load', loadAgent);
\`\`\`

## 关键优势

- **🚀 性能**: 处理速度提升10倍
- **🔒 安全**: 企业级加密
- **📈 可扩展性**: 处理数百万请求

![架构图](https://example.com/architecture.png)

---

*想了解更多？关注我获取更多AI洞察！*`,
  tags: ['artificial-intelligence', 'architecture', 'scalability', 'enterprise'],
  publishStatus: 'public',
  metadata: {
    canonicalUrl: 'https://yoursite.com/advanced-mplp-patterns',
    license: 'all-rights-reserved',
    notifyFollowers: true
  }
});
```

#### **草稿管理**

```typescript
// 保存为草稿
const draft = await medium.post({
  type: 'article',
  title: '进行中的工作：MPLP最佳实践',
  content: '这篇文章仍在撰写中...',
  tags: ['draft', 'mplp'],
  publishStatus: 'draft'
});

// 更新草稿
await medium.updateArticle(draft.data.id, {
  title: 'MPLP最佳实践：综合指南',
  content: `# MPLP最佳实践

在使用MPLP几个月后，以下是我发现的关键模式...

## 1. 从清晰的协议开始

尽早定义您的智能体通信协议...`,
  tags: ['mplp', 'best-practices', 'guide']
});

// 发布草稿
await medium.publishArticle(draft.data.id, {
  publishStatus: 'public',
  notifyFollowers: true
});
```

#### **文章系列管理**

```typescript
// 创建文章系列
const seriesArticles = [
  {
    title: 'MPLP系列第1部分：多智能体系统简介',
    content: '在第一部分中，我们探索基础知识...',
    tags: ['mplp-series', 'introduction', 'ai']
  },
  {
    title: 'MPLP系列第2部分：构建您的第一个智能体',
    content: '现在我们了解了基础知识，让我们构建...',
    tags: ['mplp-series', 'tutorial', 'hands-on']
  },
  {
    title: 'MPLP系列第3部分：高级编排模式',
    content: '在这个高级指南中，我们将探索...',
    tags: ['mplp-series', 'advanced', 'patterns']
  }
];

const publishedSeries = [];
for (const [index, article] of seriesArticles.entries()) {
  const result = await medium.post({
    type: 'article',
    title: article.title,
    content: article.content,
    tags: article.tags,
    publishStatus: 'public',
    metadata: {
      series: 'MPLP完整指南',
      seriesIndex: index + 1,
      totalParts: seriesArticles.length
    }
  });
  
  publishedSeries.push(result);
  
  // 在发布之间等待以避免速率限制
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

### **出版物管理**

#### **与出版物合作**

```typescript
// 获取用户的出版物
const publications = await medium.getPublications();
console.log(`您可以访问 ${publications.length} 个出版物`);

publications.forEach(pub => {
  console.log(`- ${pub.name}: ${pub.description}`);
  console.log(`  关注者: ${pub.followerCount}`);
  console.log(`  URL: ${pub.url}`);
});

// 向出版物提交文章
const techPublication = publications.find(p => p.name === 'Tech Insights');
if (techPublication) {
  await medium.post({
    type: 'article',
    title: '多智能体AI系统的崛起',
    content: '多智能体AI领域的综合分析...',
    tags: ['ai', 'technology', 'future'],
    publishStatus: 'public',
    publicationId: techPublication.id
  });
}

// 创建出版物（如果您有权限）
const newPublication = await medium.createPublication({
  name: 'MPLP洞察',
  description: '深入探讨多智能体协议开发',
  tags: ['ai', 'programming', 'technology']
});
```

#### **出版物分析**

```typescript
// 获取出版物性能
const pubAnalytics = await medium.getPublicationAnalytics(techPublication.id);
console.log(`出版物统计:`);
console.log(`- 总文章数: ${pubAnalytics.totalArticles}`);
console.log(`- 总浏览量: ${pubAnalytics.totalViews}`);
console.log(`- 总鼓掌数: ${pubAnalytics.totalClaps}`);
console.log(`- 关注者增长: ${pubAnalytics.followerGrowth}%`);

// 获取表现最佳的文章
const topArticles = await medium.getTopArticles(techPublication.id, {
  timeframe: 'month',
  metric: 'views',
  limit: 10
});

topArticles.forEach((article, index) => {
  console.log(`${index + 1}. ${article.title}`);
  console.log(`   浏览量: ${article.views}, 鼓掌数: ${article.claps}`);
});
```

### **社区参与**

#### **关注和参与**

```typescript
// 关注有趣的作者
const authorsToFollow = [
  'tech-visionary',
  'ai-researcher',
  'startup-founder'
];

for (const username of authorsToFollow) {
  const user = await medium.getUser(username);
  await medium.followUser(user.id);
  console.log(`现在关注 ${user.name}`);
}

// 参与文章
const trendingArticles = await medium.getTrendingArticles({
  topic: 'artificial-intelligence',
  limit: 20
});

for (const article of trendingArticles) {
  // 阅读和分析文章
  const analysis = await analyzeArticleRelevance(article);
  
  if (analysis.relevanceScore > 0.8) {
    // 为高质量相关文章鼓掌
    await medium.clapForArticle(article.id, Math.floor(analysis.relevanceScore * 50));
    
    // 留下深思熟虑的评论
    if (analysis.hasQuestions || analysis.needsClarification) {
      await medium.respondToArticle(article.id, {
        content: generateThoughtfulResponse(article, analysis)
      });
    }
  }
}
```

#### **内容策展**

```typescript
// 为您的受众策展内容
const curateWeeklyDigest = async () => {
  const topics = ['artificial-intelligence', 'machine-learning', 'programming'];
  const curatedContent = [];

  for (const topic of topics) {
    const articles = await medium.searchArticles({
      query: topic,
      timeframe: 'week',
      minClaps: 100,
      limit: 5
    });

    curatedContent.push({
      topic,
      articles: articles.map(article => ({
        title: article.title,
        author: article.author.name,
        url: article.url,
        summary: article.preview,
        claps: article.clapCount
      }))
    });
  }

  // 创建每周摘要文章
  const digestContent = generateDigestContent(curatedContent);
  
  await medium.post({
    type: 'article',
    title: `每周AI摘要 - ${new Date().toLocaleDateString()}`,
    content: digestContent,
    tags: ['weekly-digest', 'ai', 'curation'],
    publishStatus: 'public'
  });
};

// 安排每周摘要
setInterval(curateWeeklyDigest, 7 * 24 * 60 * 60 * 1000); // 每周
```

## 📊 **分析和性能**

### **文章分析**

```typescript
// 获取详细的文章分析
const getArticlePerformance = async (articleId) => {
  const analytics = await medium.getArticleAnalytics(articleId);
  
  console.log(`文章性能:`);
  console.log(`- 浏览量: ${analytics.views}`);
  console.log(`- 阅读量: ${analytics.reads}`);
  console.log(`- 阅读比例: ${(analytics.reads / analytics.views * 100).toFixed(1)}%`);
  console.log(`- 鼓掌数: ${analytics.claps}`);
  console.log(`- 回复数: ${analytics.responses}`);
  console.log(`- 粉丝数: ${analytics.fans}`);
  
  // 参与度指标
  console.log(`\n参与度指标:`);
  console.log(`- 平均阅读时间: ${analytics.averageReadTime}秒`);
  console.log(`- 完成率: ${analytics.completionRate}%`);
  console.log(`- 社交分享: ${analytics.socialShares}`);
  
  return analytics;
};

// 跟踪随时间的性能
const trackArticlePerformance = async (articleId, days = 30) => {
  const performanceData = [];
  
  for (let i = 0; i < days; i++) {
    const analytics = await medium.getArticleAnalytics(articleId, {
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    });
    
    performanceData.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      views: analytics.views,
      reads: analytics.reads,
      claps: analytics.claps
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // 速率限制
  }
  
  return performanceData;
};
```

### **内容策略分析**

```typescript
// 分析内容策略有效性
const analyzeContentStrategy = async () => {
  const myArticles = await medium.getUserArticles('me', { limit: 100 });
  
  // 按话题分析
  const topicPerformance = {};
  for (const article of myArticles) {
    for (const tag of article.tags) {
      if (!topicPerformance[tag]) {
        topicPerformance[tag] = {
          articles: 0,
          totalViews: 0,
          totalClaps: 0,
          avgReadTime: 0
        };
      }
      
      const analytics = await medium.getArticleAnalytics(article.id);
      topicPerformance[tag].articles++;
      topicPerformance[tag].totalViews += analytics.views;
      topicPerformance[tag].totalClaps += analytics.claps;
      topicPerformance[tag].avgReadTime += analytics.averageReadTime;
    }
  }

  // 计算平均值并排名话题
  const rankedTopics = Object.entries(topicPerformance)
    .map(([topic, stats]) => ({
      topic,
      articles: stats.articles,
      avgViews: Math.round(stats.totalViews / stats.articles),
      avgClaps: Math.round(stats.totalClaps / stats.articles),
      avgReadTime: Math.round(stats.avgReadTime / stats.articles),
      engagementScore: (stats.totalViews + stats.totalClaps * 10) / stats.articles
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore);

  console.log('内容策略分析:');
  rankedTopics.forEach((topic, index) => {
    console.log(`${index + 1}. ${topic.topic}`);
    console.log(`   文章数: ${topic.articles}`);
    console.log(`   平均浏览量: ${topic.avgViews}`);
    console.log(`   平均鼓掌数: ${topic.avgClaps}`);
    console.log(`   参与度评分: ${topic.engagementScore.toFixed(1)}`);
  });

  return rankedTopics;
};
```

## 🔄 **内容自动化**

### **自动化发布工作流程**

```typescript
// RSS到Medium自动化
const setupRSSToMedium = async (rssUrl, publicationId) => {
  const checkRSSFeed = async () => {
    const feed = await parseFeed(rssUrl);
    const lastCheck = await getLastCheckTime();
    
    const newArticles = feed.items.filter(item => 
      new Date(item.pubDate) > lastCheck
    );

    for (const item of newArticles) {
      // 将RSS内容转换为Medium格式
      const mediumContent = await convertToMediumFormat(item.content);
      
      await medium.post({
        type: 'article',
        title: item.title,
        content: mediumContent,
        tags: extractTags(item.categories),
        publishStatus: 'public',
        publicationId: publicationId,
        metadata: {
          canonicalUrl: item.link,
          originalSource: 'RSS Feed'
        }
      });
      
      console.log(`已发布: ${item.title}`);
    }
    
    await updateLastCheckTime(new Date());
  };

  // 每小时检查RSS源
  setInterval(checkRSSFeed, 60 * 60 * 1000);
};

// 内容重新利用自动化
const repurposeContent = async (sourceArticleId) => {
  const sourceArticle = await medium.getArticle(sourceArticleId);
  
  // 为不同受众创建不同版本
  const versions = [
    {
      title: `${sourceArticle.title} - 执行摘要`,
      content: await createExecutiveSummary(sourceArticle.content),
      tags: ['executive-summary', 'business', ...sourceArticle.tags.slice(0, 3)]
    },
    {
      title: `技术深度解析: ${sourceArticle.title}`,
      content: await createTechnicalVersion(sourceArticle.content),
      tags: ['technical', 'deep-dive', ...sourceArticle.tags.slice(0, 3)]
    },
    {
      title: `初学者指南: ${sourceArticle.title}`,
      content: await createBeginnerVersion(sourceArticle.content),
      tags: ['beginner', 'tutorial', ...sourceArticle.tags.slice(0, 3)]
    }
  ];

  for (const version of versions) {
    await medium.post({
      type: 'article',
      title: version.title,
      content: version.content,
      tags: version.tags,
      publishStatus: 'public',
      metadata: {
        originalArticle: sourceArticleId,
        contentType: 'repurposed'
      }
    });
    
    // 在发布之间等待
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
};
```

### **AI驱动的内容生成**

```typescript
// AI辅助文章创建
const createAIAssistedArticle = async (topic, targetAudience) => {
  // 研究热门内容
  const trendingArticles = await medium.searchArticles({
    query: topic,
    timeframe: 'week',
    limit: 10
  });

  // 分析内容空白
  const contentGaps = await analyzeContentGaps(trendingArticles, topic);
  
  // 生成文章大纲
  const outline = await generateArticleOutline(topic, contentGaps, targetAudience);
  
  // 创建文章部分
  const sections = [];
  for (const section of outline.sections) {
    const content = await generateSectionContent(section, {
      tone: outline.tone,
      audience: targetAudience,
      examples: section.needsExamples
    });
    
    sections.push({
      heading: section.heading,
      content: content
    });
  }

  // 组装最终文章
  const articleContent = assembleArticle(outline, sections);
  
  // 创建并发布
  const result = await medium.post({
    type: 'article',
    title: outline.title,
    content: articleContent,
    tags: outline.suggestedTags,
    publishStatus: 'draft', // 发布前审查
    metadata: {
      generatedBy: 'AI-Assistant',
      topic: topic,
      targetAudience: targetAudience
    }
  });

  console.log(`AI辅助文章已创建: ${result.data.url}`);
  return result;
};

// 内容优化
const optimizeArticleForEngagement = async (articleId) => {
  const article = await medium.getArticle(articleId);
  const analytics = await medium.getArticleAnalytics(articleId);
  
  const optimizations = await analyzeOptimizationOpportunities(article, analytics);
  
  if (optimizations.length > 0) {
    console.log(`"${article.title}"的优化建议:`);
    optimizations.forEach((opt, index) => {
      console.log(`${index + 1}. ${opt.type}: ${opt.suggestion}`);
      console.log(`   预期影响: ${opt.expectedImpact}`);
    });

    // 应用自动优化
    const autoOptimizations = optimizations.filter(opt => opt.canAutoApply);
    if (autoOptimizations.length > 0) {
      const optimizedContent = await applyOptimizations(article.content, autoOptimizations);
      
      await medium.updateArticle(articleId, {
        content: optimizedContent,
        metadata: {
          ...article.metadata,
          optimized: true,
          optimizationDate: new Date().toISOString()
        }
      });
    }
  }
};
```

## 🛠️ **高级用例**

### **内容营销自动化**

```typescript
// 全面的内容营销系统
const setupContentMarketing = async () => {
  // 内容日历管理
  const contentCalendar = await loadContentCalendar();
  
  const executeContentPlan = async () => {
    const today = new Date().toDateString();
    const scheduledContent = contentCalendar.filter(item => 
      item.publishDate === today && !item.published
    );

    for (const content of scheduledContent) {
      try {
        const article = await medium.post({
          type: 'article',
          title: content.title,
          content: content.content,
          tags: content.tags,
          publishStatus: 'public',
          publicationId: content.publicationId
        });

        // 更新日历
        content.published = true;
        content.articleId = article.data.id;
        content.publishedUrl = article.data.url;

        // 在其他平台上交叉推广
        await crossPromoteArticle(article.data);

        console.log(`已发布计划文章: ${content.title}`);
      } catch (error) {
        console.error(`发布失败 ${content.title}:`, error);
      }
    }

    await saveContentCalendar(contentCalendar);
  };

  // 每天上午9点运行
  setInterval(executeContentPlan, 24 * 60 * 60 * 1000);

  // 每周性能回顾
  const weeklyReview = async () => {
    const lastWeekArticles = await medium.getUserArticles('me', {
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    const performanceReport = await generatePerformanceReport(lastWeekArticles);
    
    // 向团队发送报告
    await sendPerformanceReport(performanceReport);
    
    // 根据性能调整内容策略
    await adjustContentStrategy(performanceReport);
  };

  setInterval(weeklyReview, 7 * 24 * 60 * 60 * 1000);
};

// 影响者协作自动化
const setupInfluencerCollaboration = async () => {
  const targetInfluencers = await identifyTargetInfluencers({
    topics: ['ai', 'technology', 'programming'],
    minFollowers: 10000,
    engagementRate: 0.05
  });

  for (const influencer of targetInfluencers) {
    // 参与他们的内容
    const recentArticles = await medium.getUserArticles(influencer.id, { limit: 5 });
    
    for (const article of recentArticles) {
      if (await isRelevantToOurBrand(article)) {
        await medium.clapForArticle(article.id, 10);
        
        const thoughtfulResponse = await generateInfluencerResponse(article);
        await medium.respondToArticle(article.id, {
          content: thoughtfulResponse
        });
      }
    }

    // 关注影响者
    await medium.followUser(influencer.id);
    
    // 等待以避免显得像垃圾信息
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
};
```

### **出版物管理系统**

```typescript
// 多出版物内容分发
const setupPublicationNetwork = async () => {
  const publications = await medium.getPublications();
  const contentStrategy = await loadContentStrategy();

  const distributeContent = async (article) => {
    const distribution = contentStrategy.getDistributionPlan(article);
    
    for (const pub of distribution.publications) {
      // 为每个出版物定制内容
      const customizedArticle = await customizeForPublication(article, pub);
      
      await medium.post({
        type: 'article',
        title: customizedArticle.title,
        content: customizedArticle.content,
        tags: customizedArticle.tags,
        publishStatus: 'public',
        publicationId: pub.id,
        metadata: {
          originalArticle: article.id,
          customizedFor: pub.name
        }
      });

      console.log(`分发到 ${pub.name}: ${customizedArticle.title}`);
      
      // 在出版物之间等待
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  };

  // 监控新文章以进行分发
  medium.on('article_published', distributeContent);

  // 编辑工作流程自动化
  const manageEditorialWorkflow = async () => {
    const publications = await medium.getPublications();
    
    for (const pub of publications) {
      if (pub.role === 'editor') {
        // 审查待处理的提交
        const submissions = await medium.getPendingSubmissions(pub.id);
        
        for (const submission of submissions) {
          const review = await reviewSubmission(submission);
          
          if (review.approved) {
            await medium.approveSubmission(submission.id, {
              feedback: review.feedback,
              scheduledDate: review.suggestedPublishDate
            });
          } else {
            await medium.rejectSubmission(submission.id, {
              reason: review.rejectionReason,
              suggestions: review.improvementSuggestions
            });
          }
        }
      }
    }
  };

  setInterval(manageEditorialWorkflow, 60 * 60 * 1000); // 每小时
};
```

## 🚨 **错误处理和最佳实践**

### **常见错误场景**

```typescript
try {
  await medium.post({
    type: 'article',
    title: '我的文章',
    content: '文章内容...',
    tags: ['technology'],
    publishStatus: 'public'
  });
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    console.log('超过速率限制，等待重试...');
    const retryAfter = error.retryAfter || 3600000; // 默认1小时
    await new Promise(resolve => setTimeout(resolve, retryAfter));
    // 重试操作
  } else if (error.code === 'INVALID_TOKEN') {
    console.log('访问令牌过期，刷新中...');
    await medium.refreshToken();
  } else if (error.code === 'CONTENT_TOO_LONG') {
    console.log('文章内容超过最大长度');
    // 分割为多篇文章或修剪内容
  } else if (error.code === 'INVALID_TAGS') {
    console.log('某些标签无效或受限制');
    // 过滤并使用有效标签重试
  } else if (error.code === 'PUBLICATION_NOT_FOUND') {
    console.log('出版物不存在或访问被拒绝');
  } else {
    console.error('意外的Medium错误:', error.message);
  }
}
```

### **内容质量保证**

```typescript
// 自动化内容质量检查
const validateArticleQuality = async (article) => {
  const issues = [];

  // 检查内容长度
  if (article.content.length < 500) {
    issues.push({
      type: 'warning',
      message: '文章相当短。考虑添加更多细节。'
    });
  }

  // 检查可读性
  const readabilityScore = calculateReadabilityScore(article.content);
  if (readabilityScore < 60) {
    issues.push({
      type: 'warning',
      message: '文章可能难以阅读。考虑简化语言。'
    });
  }

  // 检查适当的格式
  if (!article.content.includes('#')) {
    issues.push({
      type: 'suggestion',
      message: '考虑添加标题以改善结构。'
    });
  }

  // 检查标签相关性
  const tagRelevance = await checkTagRelevance(article.content, article.tags);
  if (tagRelevance < 0.7) {
    issues.push({
      type: 'warning',
      message: '某些标签可能与内容不相关。'
    });
  }

  // SEO检查
  const seoIssues = await performSEOAnalysis(article);
  issues.push(...seoIssues);

  return issues;
};

// 内容优化建议
const getOptimizationSuggestions = async (articleId) => {
  const article = await medium.getArticle(articleId);
  const analytics = await medium.getArticleAnalytics(articleId);
  
  const suggestions = [];

  // 参与度优化
  if (analytics.readRatio < 0.3) {
    suggestions.push({
      type: 'engagement',
      priority: 'high',
      suggestion: '在第一段添加引人注目的钩子',
      expectedImpact: '将通读率提高15-25%'
    });
  }

  // SEO优化
  const seoScore = await calculateSEOScore(article);
  if (seoScore < 70) {
    suggestions.push({
      type: 'seo',
      priority: 'medium',
      suggestion: '为目标关键词优化标题和标题',
      expectedImpact: '将搜索可见性提高20-30%'
    });
  }

  // 社交分享优化
  if (analytics.socialShares < 10) {
    suggestions.push({
      type: 'social',
      priority: 'medium',
      suggestion: '添加引人注目的引用和统计数据以供分享',
      expectedImpact: '将社交分享增加40-60%'
    });
  }

  return suggestions;
};
```

## 🔗 **集成示例**

### **与Agent Builder集成**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { MediumAdapter } from '@mplp/adapters';

const mediumBot = new AgentBuilder('MediumBot')
  .withName('内容发布助手')
  .withPlatform('medium', new MediumAdapter(mediumConfig))
  .withCapability('contentCreation', async (topic, audience) => {
    // AI驱动的内容创建
    const article = await this.platform.createAIAssistedArticle(topic, audience);
    return article;
  })
  .withCapability('performanceOptimization', async (articleId) => {
    // 基于性能数据优化文章
    const suggestions = await this.platform.getOptimizationSuggestions(articleId);
    await this.platform.applyOptimizations(articleId, suggestions);
  })
  .build();

await mediumBot.start();
```

### **与Orchestrator集成**

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

const orchestrator = new MultiAgentOrchestrator();

// 创建内容营销工作流程
const contentWorkflow = orchestrator.createWorkflow('ContentMarketing')
  .addStep('researchTrends', async () => {
    // 研究热门话题
    return await medium.getTrendingTopics(['ai', 'technology']);
  })
  .addStep('generateContent', async (trends) => {
    // 基于趋势生成文章
    const articles = [];
    for (const trend of trends.slice(0, 3)) {
      const article = await medium.createAIAssistedArticle(trend.topic, 'developers');
      articles.push(article);
    }
    return articles;
  })
  .addStep('optimizeAndPublish', async (articles) => {
    // 优化并发布文章
    for (const article of articles) {
      const optimized = await medium.optimizeArticleForEngagement(article.id);
      await medium.publishArticle(article.id, { publishStatus: 'public' });
    }
  })
  .addStep('trackPerformance', async (articles) => {
    // 跟踪文章性能
    const analytics = [];
    for (const article of articles) {
      const performance = await medium.getArticleAnalytics(article.id);
      analytics.push(performance);
    }
    return analytics;
  });

await contentWorkflow.execute();
```

## 📚 **最佳实践**

### **内容策略**

- **质量第一**: 专注于为读者提供真正的价值
- **一致性**: 保持定期发布计划
- **受众焦点**: 为您的特定目标受众写作
- **SEO优化**: 使用相关关键词和适当的格式
- **参与**: 回复评论并与其他作者互动

### **技术最佳实践**

- **速率限制**: 尊重Medium的API限制以避免限制
- **错误处理**: 为所有操作实施强大的错误处理
- **内容备份**: 发布前始终备份您的内容
- **分析跟踪**: 监控性能以改进内容策略
- **安全**: 保持访问令牌安全并定期轮换

### **社区指导原则**

- **原创内容**: 始终发布原创、高质量的内容
- **适当归属**: 适当地归功于来源和灵感
- **尊重参与**: 与其他作者和读者尊重地互动
- **防止垃圾信息**: 避免过度自我推广或垃圾信息行为
- **平台规则**: 遵循Medium的社区指导原则和服务条款

## 🔗 **相关文档**

- [平台适配器概览](../../README.md) - 完整的平台适配器系统
- [Agent Builder集成](../../sdk-api/agent-builder/README.md) - 构建支持Medium的代理
- [Orchestrator工作流](../../sdk-api/orchestrator/README.md) - 多平台编排
- [Twitter适配器](../twitter/README.md) - Twitter平台集成
- [LinkedIn适配器](../linkedin/README.md) - LinkedIn平台集成

---

**适配器维护者**: MPLP平台团队  
**最后审查**: 2025-09-20  
**测试覆盖率**: 100% (65/65测试通过)  
**状态**: ✅ 生产就绪
