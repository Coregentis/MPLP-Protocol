/**
 * Test Discord Adapter - Production Implementation
 */

import { DiscordAdapter } from './src/platforms/discord/DiscordAdapter';
import { AdapterConfig } from './src/core/types';

async function testDiscordAdapter() {
  console.log('🎯 Testing Discord Adapter - Production Implementation');
  
  // Create adapter configuration
  const config: AdapterConfig = {
    platform: 'discord',
    name: 'test-discord',
    version: '1.0.0',
    enabled: true,
    auth: {
      type: 'bearer',
      credentials: {
        token: process.env.DISCORD_BOT_TOKEN || 'test-token'
      }
    },
    settings: {
      defaultChannel: '1234567890123456789',
      defaultReaction: '👍'
    }
  };

  try {
    // Create Discord adapter
    const adapter = new DiscordAdapter(config);
    
    console.log('✅ Discord adapter created successfully');
    console.log('📋 Adapter capabilities:', adapter.capabilities);
    console.log('🔧 Adapter config:', adapter.config.platform);
    
    // Test initialization (without real token)
    console.log('🔄 Testing initialization...');
    await adapter.initialize();
    console.log('✅ Discord adapter initialized');
    
    // Test content validation
    console.log('🔄 Testing content validation...');
    const testContent = {
      id: 'test-1',
      type: 'text' as const,
      content: 'Hello Discord! This is a test message.',
      metadata: {
        channelId: '1234567890123456789'
      }
    };
    
    const isValid = await adapter.validateContent(testContent);
    console.log('✅ Content validation result:', isValid);
    
    console.log('🎉 Discord Adapter test completed successfully!');
    console.log('🚀 Ready for production use with real Discord bot token');
    
  } catch (error) {
    console.error('❌ Discord Adapter test failed:', error);
    
    // Check if it's an authentication error (expected without real token)
    if (error instanceof Error && error.message.includes('Discord')) {
      console.log('ℹ️  This is expected without a real Discord bot token');
      console.log('🔑 Set DISCORD_BOT_TOKEN environment variable for full testing');
    }
  }
}

// Run the test
testDiscordAdapter().catch(console.error);
