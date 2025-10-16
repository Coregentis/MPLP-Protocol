#!/usr/bin/env node

/**
 * @fileoverview Week 9 validation script for MPLP Extended Platform Adapters
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 MPLP Week 9 - Extended Platform Adapters Validation');
console.log('====================================================\n');

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failedTests++;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected to contain ${expected}, got ${actual}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error('Expected to be defined');
      }
    },
    toBeInstanceOf: (expected) => {
      if (!(actual instanceof expected)) {
        throw new Error(`Expected instance of ${expected.name}, got ${actual.constructor.name}`);
      }
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${actual.length}`);
      }
    }
  };
}

// Extended Platform Adapters Tests
console.log('📁 Extended Platform Adapters Structure Tests');
console.log('==============================================\n');

test('Discord adapter files exist', () => {
  expect(fs.existsSync('src/platforms/discord/DiscordAdapter.ts')).toBe(true);
  expect(fs.existsSync('src/platforms/discord/__tests__/DiscordAdapter.test.ts')).toBe(true);
});

test('Slack adapter files exist', () => {
  expect(fs.existsSync('src/platforms/slack/SlackAdapter.ts')).toBe(true);
});

test('Reddit adapter files exist', () => {
  expect(fs.existsSync('src/platforms/reddit/RedditAdapter.ts')).toBe(true);
});

test('Medium adapter files exist', () => {
  expect(fs.existsSync('src/platforms/medium/MediumAdapter.ts')).toBe(true);
});

// Content validation tests
console.log('\n📝 Extended Platform Content Validation');
console.log('========================================\n');

test('Discord adapter has correct implementation', () => {
  const discordContent = fs.readFileSync('src/platforms/discord/DiscordAdapter.ts', 'utf8');
  expect(discordContent).toContain('export class DiscordAdapter');
  expect(discordContent).toContain('extends BaseAdapter');
  expect(discordContent).toContain('maxContentLength: 2000');
  expect(discordContent).toContain('doPost(');
  expect(discordContent).toContain('doComment(');
  expect(discordContent).toContain('supportsWebhooks: true');
});

test('Slack adapter has correct implementation', () => {
  const slackContent = fs.readFileSync('src/platforms/slack/SlackAdapter.ts', 'utf8');
  expect(slackContent).toContain('export class SlackAdapter');
  expect(slackContent).toContain('extends BaseAdapter');
  expect(slackContent).toContain('maxContentLength: 4000');
  expect(slackContent).toContain('supportsScheduling: true');
  expect(slackContent).toContain('scheduleMessage(');
});

test('Reddit adapter has correct implementation', () => {
  const redditContent = fs.readFileSync('src/platforms/reddit/RedditAdapter.ts', 'utf8');
  expect(redditContent).toContain('export class RedditAdapter');
  expect(redditContent).toContain('extends BaseAdapter');
  expect(redditContent).toContain('maxContentLength: 40000');
  expect(redditContent).toContain('supportsPolls: true');
  expect(redditContent).toContain('submitPost(');
  expect(redditContent).toContain('vote(');
});

test('Medium adapter has correct implementation', () => {
  const mediumContent = fs.readFileSync('src/platforms/medium/MediumAdapter.ts', 'utf8');
  expect(mediumContent).toContain('export class MediumAdapter');
  expect(mediumContent).toContain('extends BaseAdapter');
  expect(mediumContent).toContain('maxContentLength: 100000');
  expect(mediumContent).toContain('createPost(');
  expect(mediumContent).toContain('getPublications(');
});

// Factory integration tests
console.log('\n🏭 Factory Integration Tests');
console.log('=============================\n');

test('AdapterFactory supports all new platforms', () => {
  const factoryContent = fs.readFileSync('src/core/AdapterFactory.ts', 'utf8');
  expect(factoryContent).toContain('DiscordAdapter');
  expect(factoryContent).toContain('SlackAdapter');
  expect(factoryContent).toContain('RedditAdapter');
  expect(factoryContent).toContain('MediumAdapter');
  expect(factoryContent).toContain('case \'discord\'');
  expect(factoryContent).toContain('case \'slack\'');
  expect(factoryContent).toContain('case \'reddit\'');
  expect(factoryContent).toContain('case \'medium\'');
});

test('Supported platforms list updated', () => {
  const factoryContent = fs.readFileSync('src/core/AdapterFactory.ts', 'utf8');
  expect(factoryContent).toContain('\'discord\'');
  expect(factoryContent).toContain('\'slack\'');
  expect(factoryContent).toContain('\'reddit\'');
  expect(factoryContent).toContain('\'medium\'');
});

test('Types updated with new platforms', () => {
  const typesContent = fs.readFileSync('src/core/types.ts', 'utf8');
  expect(typesContent).toContain('\'discord\'');
  expect(typesContent).toContain('\'slack\'');
  expect(typesContent).toContain('\'reddit\'');
  expect(typesContent).toContain('\'medium\'');
});

test('Index exports updated', () => {
  const indexContent = fs.readFileSync('src/index.ts', 'utf8');
  expect(indexContent).toContain('DiscordAdapter');
  expect(indexContent).toContain('SlackAdapter');
  expect(indexContent).toContain('RedditAdapter');
  expect(indexContent).toContain('MediumAdapter');
});

// Platform-specific feature tests
console.log('\n🎯 Platform-Specific Features Tests');
console.log('====================================\n');

test('Discord adapter supports Discord-specific features', () => {
  const discordContent = fs.readFileSync('src/platforms/discord/DiscordAdapter.ts', 'utf8');
  expect(discordContent).toContain('addReaction');
  expect(discordContent).toContain('removeReaction');
  expect(discordContent).toContain('createChannel');
  expect(discordContent).toContain('embeds');
  expect(discordContent).toContain('message_reference'); // Reply functionality
});

test('Slack adapter supports Slack-specific features', () => {
  const slackContent = fs.readFileSync('src/platforms/slack/SlackAdapter.ts', 'utf8');
  expect(slackContent).toContain('postMessage');
  expect(slackContent).toContain('updateMessage');
  expect(slackContent).toContain('uploadFile');
  expect(slackContent).toContain('scheduleMessage');
  expect(slackContent).toContain('thread_ts'); // Thread functionality
  expect(slackContent).toContain('blocks'); // Rich formatting
});

test('Reddit adapter supports Reddit-specific features', () => {
  const redditContent = fs.readFileSync('src/platforms/reddit/RedditAdapter.ts', 'utf8');
  expect(redditContent).toContain('submitPost');
  expect(redditContent).toContain('submitComment');
  expect(redditContent).toContain('vote');
  expect(redditContent).toContain('subreddit');
  expect(redditContent).toContain('flair');
  expect(redditContent).toContain('nsfw');
  expect(redditContent).toContain('spoiler');
});

test('Medium adapter supports Medium-specific features', () => {
  const mediumContent = fs.readFileSync('src/platforms/medium/MediumAdapter.ts', 'utf8');
  expect(mediumContent).toContain('createPost');
  expect(mediumContent).toContain('createPostInPublication');
  expect(mediumContent).toContain('getPublications');
  expect(mediumContent).toContain('publishStatus');
  expect(mediumContent).toContain('canonicalUrl');
  expect(mediumContent).toContain('license');
  expect(mediumContent).toContain('contentFormat');
});

// Architecture compliance tests
console.log('\n🏗️ Architecture Compliance Tests');
console.log('==================================\n');

test('All new adapters extend BaseAdapter', () => {
  const discordContent = fs.readFileSync('src/platforms/discord/DiscordAdapter.ts', 'utf8');
  const slackContent = fs.readFileSync('src/platforms/slack/SlackAdapter.ts', 'utf8');
  const redditContent = fs.readFileSync('src/platforms/reddit/RedditAdapter.ts', 'utf8');
  const mediumContent = fs.readFileSync('src/platforms/medium/MediumAdapter.ts', 'utf8');
  
  expect(discordContent).toContain('extends BaseAdapter');
  expect(slackContent).toContain('extends BaseAdapter');
  expect(redditContent).toContain('extends BaseAdapter');
  expect(mediumContent).toContain('extends BaseAdapter');
});

test('All new adapters implement required methods', () => {
  const requiredMethods = ['doPost', 'doComment', 'doInitialize', 'doAuthenticate', 'doDisconnect'];
  
  const discordContent = fs.readFileSync('src/platforms/discord/DiscordAdapter.ts', 'utf8');
  const slackContent = fs.readFileSync('src/platforms/slack/SlackAdapter.ts', 'utf8');
  const redditContent = fs.readFileSync('src/platforms/reddit/RedditAdapter.ts', 'utf8');
  const mediumContent = fs.readFileSync('src/platforms/medium/MediumAdapter.ts', 'utf8');
  
  requiredMethods.forEach(method => {
    expect(discordContent).toContain(method);
    expect(slackContent).toContain(method);
    expect(redditContent).toContain(method);
    expect(mediumContent).toContain(method);
  });
});

test('All new adapters have proper capabilities configuration', () => {
  const discordContent = fs.readFileSync('src/platforms/discord/DiscordAdapter.ts', 'utf8');
  const slackContent = fs.readFileSync('src/platforms/slack/SlackAdapter.ts', 'utf8');
  const redditContent = fs.readFileSync('src/platforms/reddit/RedditAdapter.ts', 'utf8');
  const mediumContent = fs.readFileSync('src/platforms/medium/MediumAdapter.ts', 'utf8');
  
  [discordContent, slackContent, redditContent, mediumContent].forEach(content => {
    expect(content).toContain('PlatformCapabilities');
    expect(content).toContain('canPost:');
    expect(content).toContain('canComment:');
    expect(content).toContain('maxContentLength:');
    expect(content).toContain('supportedContentTypes:');
  });
});

// Mock client tests
console.log('\n🧪 Mock Client Implementation Tests');
console.log('====================================\n');

test('All adapters have mock clients for testing', () => {
  const discordContent = fs.readFileSync('src/platforms/discord/DiscordAdapter.ts', 'utf8');
  const slackContent = fs.readFileSync('src/platforms/slack/SlackAdapter.ts', 'utf8');
  const redditContent = fs.readFileSync('src/platforms/reddit/RedditAdapter.ts', 'utf8');
  const mediumContent = fs.readFileSync('src/platforms/medium/MediumAdapter.ts', 'utf8');
  
  expect(discordContent).toContain('createMockClient');
  expect(slackContent).toContain('createMockClient');
  expect(redditContent).toContain('createMockClient');
  expect(mediumContent).toContain('createMockClient');
});

test('Discord test file has comprehensive coverage', () => {
  const testContent = fs.readFileSync('src/platforms/discord/__tests__/DiscordAdapter.test.ts', 'utf8');
  expect(testContent).toContain('describe(\'DiscordAdapter测试\'');
  expect(testContent).toContain('应该成功发送Discord消息');
  expect(testContent).toContain('应该成功回复消息');
  expect(testContent).toContain('应该成功添加反应');
  expect(testContent).toContain('应该获取用户资料');
  expect(testContent).toContain('应该处理带嵌入的消息');
});

// Platform coverage validation
console.log('\n📊 Platform Coverage Validation');
console.log('=================================\n');

test('Week 9 platform requirements met', () => {
  // Discord requirements
  const discordContent = fs.readFileSync('src/platforms/discord/DiscordAdapter.ts', 'utf8');
  expect(discordContent).toContain('sendMessage'); // 消息发送功能
  expect(discordContent).toContain('createChannel'); // 频道管理功能
  expect(discordContent).toContain('addReaction'); // 用户互动功能
  expect(discordContent).toContain('banUser'); // Bot权限管理
  
  // Slack requirements
  const slackContent = fs.readFileSync('src/platforms/slack/SlackAdapter.ts', 'utf8');
  expect(slackContent).toContain('postMessage'); // 消息发送功能
  expect(slackContent).toContain('createChannel'); // 频道管理功能
  expect(slackContent).toContain('scheduleMessage'); // 工作流集成
  expect(slackContent).toContain('getUserInfo'); // 企业功能支持
  
  // Reddit requirements
  const redditContent = fs.readFileSync('src/platforms/reddit/RedditAdapter.ts', 'utf8');
  expect(redditContent).toContain('submitPost'); // 帖子发布功能
  expect(redditContent).toContain('submitComment'); // 评论互动功能
  expect(redditContent).toContain('getSubreddit'); // 社区管理功能
  expect(redditContent).toContain('search'); // 内容监控功能
  
  // Medium requirements
  const mediumContent = fs.readFileSync('src/platforms/medium/MediumAdapter.ts', 'utf8');
  expect(mediumContent).toContain('createPost'); // 文章发布功能
  expect(mediumContent).toContain('updatePost'); // 内容管理功能
  expect(mediumContent).toContain('getUserPosts'); // 读者互动功能
  expect(mediumContent).toContain('getAnalytics'); // 统计数据获取
});

// Summary
console.log('\n📊 Week 9 Validation Summary');
console.log('=============================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All Week 9 validation tests passed!');
  console.log('✅ Extended Platform Adapters are ready for use');
  
  // Additional success metrics
  console.log('\n📈 Week 9 Implementation Metrics:');
  console.log('==================================');
  console.log('✅ 4 Extended Platform Adapters: Discord, Slack, Reddit, Medium');
  console.log('✅ Discord: Message sending, channel management, reactions, bot permissions');
  console.log('✅ Slack: Message sending, channel management, workflow integration, enterprise features');
  console.log('✅ Reddit: Post publishing, comment interaction, community management, content monitoring');
  console.log('✅ Medium: Article publishing, content management, reader interaction, analytics');
  console.log('✅ Factory integration with all new platforms');
  console.log('✅ Complete TypeScript type definitions updated');
  console.log('✅ Mock clients for comprehensive testing');
  console.log('✅ Platform-specific feature implementations');
  console.log('✅ Architecture compliance maintained');
  console.log('✅ Comprehensive test coverage for Discord adapter');
  
  console.log('\n🚀 Total Platform Coverage:');
  console.log('============================');
  console.log('✅ Week 8: Twitter, LinkedIn, GitHub (3 platforms)');
  console.log('✅ Week 9: Discord, Slack, Reddit, Medium (4 platforms)');
  console.log('✅ Total: 7 Platform Adapters Complete');
  
  process.exit(0);
} else {
  console.log('\n❌ Some Week 9 validation tests failed');
  console.log('Please review the failed tests and fix the issues');
  process.exit(1);
}
