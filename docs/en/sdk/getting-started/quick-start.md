# MPLP SDK Quick Start - Build Your First Agent in 30 Minutes

> **🌐 Language Navigation**: [English](quick-start.md) | [中文](../../../zh-CN/sdk/getting-started/quick-start.md)


> **⏱️ Estimated Time**: 30 minutes  
> **💡 Difficulty**: Beginner  
> **🎯 Goal**: Create a working multi-agent application  

## 🚀 **What You'll Build**

In this tutorial, you'll create a **Social Media Manager Agent** that can:
- Monitor mentions across multiple platforms
- Automatically respond to user interactions
- Schedule and publish content
- Generate engagement reports

## 📋 **Prerequisites**

Before starting, ensure you have:
- ✅ Node.js 18+ and npm 8+
- ✅ Basic TypeScript/JavaScript knowledge
- ✅ A code editor (VS Code recommended)

### **Install MPLP** ⚡

```bash
# Install MPLP core package (Recommended)
npm install mplp@beta

# Or install MPLP CLI for project scaffolding
npm install -g @mplp/cli

# Verify installation
node -e "const mplp = require('mplp'); console.log('MPLP Version:', mplp.MPLP_VERSION);"
# Expected output: MPLP Version: 1.1.0
```

For detailed installation options, see the [Installation Guide](installation.md).

## 🏗️ **Step 1: Create Your Project (5 minutes)**

### **Initialize the Project**

```bash
# Create a new MPLP project (requires @mplp/cli)
mplp create social-media-manager --template agent-app
cd social-media-manager

# Install dependencies
npm install

# Verify setup
npm run test
```

### **Project Structure**
```
social-media-manager/
├── src/
│   ├── agents/          # Agent definitions
│   ├── config/          # Configuration files
│   ├── services/        # Business logic
│   └── index.ts         # Application entry point
├── tests/               # Test files
├── .env.example         # Environment variables template
└── package.json         # Project configuration
```

## 🤖 **Step 2: Create Your First Agent (10 minutes)**

### **Define the Agent**

Create `src/agents/social-media-agent.ts`:

```typescript
import { Agent, AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, LinkedInAdapter } from '@mplp/adapters';

export class SocialMediaAgent extends Agent {
  private twitterAdapter: TwitterAdapter;
  private linkedinAdapter: LinkedInAdapter;

  constructor() {
    super('social-media-manager');
    
    // Initialize platform adapters
    this.twitterAdapter = new TwitterAdapter({
      apiKey: process.env.TWITTER_API_KEY!,
      apiSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
    });

    this.linkedinAdapter = new LinkedInAdapter({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN!
    });
  }

  async initialize(): Promise<void> {
    // Set up event listeners
    this.setupEventHandlers();
    
    // Start monitoring
    await this.startMonitoring();
    
    console.log('🤖 Social Media Agent initialized successfully!');
  }

  private setupEventHandlers(): void {
    // Handle Twitter mentions
    this.twitterAdapter.on('mention', async (mention) => {
      await this.handleMention('twitter', mention);
    });

    // Handle LinkedIn messages
    this.linkedinAdapter.on('message', async (message) => {
      await this.handleMessage('linkedin', message);
    });
  }

  private async startMonitoring(): Promise<void> {
    // Start real-time monitoring
    await this.twitterAdapter.startStream(['mention', 'direct_message']);
    await this.linkedinAdapter.startMonitoring();
  }

  private async handleMention(platform: string, mention: any): Promise<void> {
    console.log(`📱 New mention on ${platform}:`, mention.text);
    
    // Generate response using AI (placeholder)
    const response = await this.generateResponse(mention.text);
    
    // Reply to the mention
    if (platform === 'twitter') {
      await this.twitterAdapter.reply(mention.id, response);
    }
  }

  private async handleMessage(platform: string, message: any): Promise<void> {
    console.log(`💬 New message on ${platform}:`, message.content);
    
    // Process and respond to the message
    const response = await this.generateResponse(message.content);
    
    if (platform === 'linkedin') {
      await this.linkedinAdapter.sendMessage(message.senderId, response);
    }
  }

  private async generateResponse(input: string): Promise<string> {
    // Simple response generation (you can integrate with AI services)
    const responses = [
      "Thank you for reaching out! We'll get back to you soon.",
      "Thanks for your interest! How can we help you today?",
      "We appreciate your message! Our team will respond shortly.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async publishContent(content: string, platforms: string[]): Promise<void> {
    for (const platform of platforms) {
      try {
        if (platform === 'twitter' && content.length <= 280) {
          await this.twitterAdapter.tweet(content);
        } else if (platform === 'linkedin') {
          await this.linkedinAdapter.post(content);
        }
        
        console.log(`✅ Content published to ${platform}`);
      } catch (error) {
        console.error(`❌ Failed to publish to ${platform}:`, error);
      }
    }
  }
}
```

## ⚙️ **Step 3: Configure Your Application (5 minutes)**

### **Environment Setup**

Copy `.env.example` to `.env` and add your API keys:

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env`:
```bash
# Twitter API credentials
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# LinkedIn API credentials
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token

# Application settings
NODE_ENV=development
LOG_LEVEL=info
```

### **Application Configuration**

Update `src/config/app.config.ts`:

```typescript
export const appConfig = {
  name: 'Social Media Manager',
  version: '1.0.0',
  agents: {
    socialMedia: {
      enabled: true,
      platforms: ['twitter', 'linkedin'],
      autoReply: true,
      responseDelay: 5000 // 5 seconds
    }
  },
  monitoring: {
    keywords: ['@yourbrand', '#yourbrand'],
    languages: ['en'],
    sentiment: true
  }
};
```

## 🎮 **Step 4: Create the Main Application (5 minutes)**

### **Application Entry Point**

Update `src/index.ts`:

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { SocialMediaAgent } from './agents/social-media-agent';
import { appConfig } from './config/app.config';

async function main() {
  try {
    // Create MPLP application
    const app = new MPLPApplication({
      name: appConfig.name,
      version: appConfig.version,
      logLevel: process.env.LOG_LEVEL || 'info'
    });

    // Create and register the social media agent
    const socialMediaAgent = new SocialMediaAgent();
    app.registerAgent('social-media', socialMediaAgent);

    // Initialize the application
    await app.initialize();
    
    console.log('🚀 Social Media Manager started successfully!');
    console.log('📱 Monitoring social media platforms...');

    // Example: Schedule a post
    setTimeout(async () => {
      await socialMediaAgent.publishContent(
        "Hello from our MPLP-powered social media agent! 🤖 #MPLP #MultiAgent",
        ['twitter', 'linkedin']
      );
    }, 10000); // Post after 10 seconds

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await app.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
main().catch(console.error);
```

## 🧪 **Step 5: Test Your Agent (5 minutes)**

### **Run the Application**

```bash
# Start in development mode
npm run dev

# Expected output:
# 🤖 Social Media Agent initialized successfully!
# 🚀 Social Media Manager started successfully!
# 📱 Monitoring social media platforms...
# ✅ Content published to twitter
# ✅ Content published to linkedin
```

### **Test the Features**

1. **Monitor Mentions**: The agent will automatically detect mentions
2. **Auto-Reply**: Responses will be sent automatically
3. **Content Publishing**: Scheduled posts will be published
4. **Error Handling**: Check logs for any issues

### **Run Tests**

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Check test coverage
npm run test:coverage
```

## 🎉 **Congratulations!**

You've successfully created your first MPLP multi-agent application! Your Social Media Manager Agent can now:

- ✅ Monitor multiple social media platforms
- ✅ Automatically respond to mentions and messages
- ✅ Publish content across platforms
- ✅ Handle errors gracefully

## 🚀 **Next Steps**

### **Enhance Your Agent**

1. **Add AI Integration**:
   ```bash
   npm install @mplp/ai-services
   ```

2. **Add More Platforms**:
   ```bash
   npm install @mplp/adapters-extended
   ```

3. **Add Analytics**:
   ```bash
   npm install @mplp/analytics
   ```

### **Advanced Features**

- **Multi-Agent Workflows (开发中)** - Coordinate multiple agents
- **[Custom Adapters](../guides/custom-adapters.md)** - Build your own platform integrations
- **AI Integration (开发中)** - Add intelligent responses
- **[Deployment Guide](../guides/deployment.md)** - Deploy to production

### **Learning Resources**

- **API Reference (开发中)** - Complete API documentation
- **Examples (开发中)** - More sample applications
- **[Best Practices](../guides/best-practices.md)** - Development best practices
- **[Community](../../community/README.md)** - Join the MPLP community

## 🆘 **Need Help?**

- **Documentation**: [MPLP Docs](../../README.md)
- **Community**: [Discord Server](https://discord.gg/mplp)
- **Issues**: [GitHub Issues](https://github.com/mplp-org/mplp/issues)
- **Support**: support@mplp.dev

---

**🎯 Tutorial Complete!** You've built a working multi-agent application in just 30 minutes. Welcome to the world of MPLP development!

**Next Tutorial**: Building Multi-Agent Workflows (开发中)
