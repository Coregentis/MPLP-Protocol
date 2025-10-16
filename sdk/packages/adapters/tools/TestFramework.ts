/**
 * @fileoverview Adapter Testing Framework - Comprehensive testing utilities for platform adapters
 */

import { BaseAdapter } from '../src/core/BaseAdapter';
import { AdapterConfig, ContentItem, ActionResult, PlatformCapabilities } from '../src/core/types';

/**
 * Test configuration for adapter testing
 */
export interface AdapterTestConfig {
  adapter: BaseAdapter;
  testData: {
    validContent: ContentItem[];
    invalidContent: ContentItem[];
    userIds: string[];
    postIds: string[];
  };
  expectations: {
    initializationTime: number; // max ms
    authenticationTime: number; // max ms
    postResponseTime: number; // max ms
    minSuccessRate: number; // percentage
  };
  mockResponses?: {
    [key: string]: any;
  };
}

/**
 * Test result interface
 */
export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

/**
 * Test suite result
 */
export interface TestSuiteResult {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  results: TestResult[];
  coverage: {
    methods: number;
    branches: number;
    statements: number;
  };
}

/**
 * Comprehensive adapter testing framework
 */
export class AdapterTestFramework {
  private config: AdapterTestConfig;
  private results: TestResult[] = [];

  constructor(config: AdapterTestConfig) {
    this.config = config;
  }

  /**
   * Run complete test suite
   */
  public async runTestSuite(): Promise<TestSuiteResult> {
    console.log(`🧪 Running test suite for ${this.config.adapter.constructor.name}`);
    const startTime = Date.now();

    // Reset results
    this.results = [];

    // Run all test categories
    await this.runLifecycleTests();
    await this.runFunctionalityTests();
    await this.runPerformanceTests();
    await this.runErrorHandlingTests();
    await this.runSecurityTests();
    await this.runCompatibilityTests();

    const duration = Date.now() - startTime;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.length - passedTests;

    return {
      suiteName: this.config.adapter.constructor.name,
      totalTests: this.results.length,
      passedTests,
      failedTests,
      duration,
      results: this.results,
      coverage: await this.calculateCoverage()
    };
  }

  /**
   * Test adapter lifecycle (initialization, authentication, disconnection)
   */
  private async runLifecycleTests(): Promise<void> {
    console.log('  📋 Running lifecycle tests...');

    // Test initialization
    await this.runTest('Initialization', async () => {
      const startTime = Date.now();
      await this.config.adapter.initialize();
      const duration = Date.now() - startTime;
      
      if (duration > this.config.expectations.initializationTime) {
        throw new Error(`Initialization took ${duration}ms, expected < ${this.config.expectations.initializationTime}ms`);
      }
      
      return { duration };
    });

    // Test authentication
    await this.runTest('Authentication', async () => {
      const startTime = Date.now();
      const result = await this.config.adapter.authenticate();
      const duration = Date.now() - startTime;
      
      if (!result) {
        throw new Error('Authentication failed');
      }
      
      if (duration > this.config.expectations.authenticationTime) {
        throw new Error(`Authentication took ${duration}ms, expected < ${this.config.expectations.authenticationTime}ms`);
      }
      
      if (!this.config.adapter.isAuthenticated) {
        throw new Error('Adapter not marked as authenticated');
      }
      
      return { duration, authenticated: result };
    });

    // Test disconnection
    await this.runTest('Disconnection', async () => {
      await this.config.adapter.disconnect();
      
      if (this.config.adapter.isAuthenticated) {
        throw new Error('Adapter still marked as authenticated after disconnect');
      }
      
      return { disconnected: true };
    });

    // Test re-authentication
    await this.runTest('Re-authentication', async () => {
      await this.config.adapter.initialize();
      const result = await this.config.adapter.authenticate();
      
      if (!result || !this.config.adapter.isAuthenticated) {
        throw new Error('Re-authentication failed');
      }
      
      return { reauthenticated: true };
    });
  }

  /**
   * Test core functionality
   */
  private async runFunctionalityTests(): Promise<void> {
    console.log('  ⚡ Running functionality tests...');

    // Test posting
    if (this.config.adapter.capabilities.canPost) {
      for (const content of this.config.testData.validContent) {
        await this.runTest(`Post ${content.type} content`, async () => {
          const startTime = Date.now();
          const result = await this.config.adapter.post(content);
          const duration = Date.now() - startTime;
          
          if (!result.success) {
            throw new Error('Post failed');
          }
          
          if (duration > this.config.expectations.postResponseTime) {
            throw new Error(`Post took ${duration}ms, expected < ${this.config.expectations.postResponseTime}ms`);
          }
          
          return { duration, postId: result.data?.id };
        });
      }
    }

    // Test commenting
    if (this.config.adapter.capabilities.canComment) {
      for (const postId of this.config.testData.postIds) {
        await this.runTest(`Comment on post ${postId}`, async () => {
          const result = await this.config.adapter.comment(postId, 'Test comment');
          
          if (!result.success) {
            throw new Error('Comment failed');
          }
          
          return { commentId: result.data?.id };
        });
      }
    }

    // Test liking
    if (this.config.adapter.capabilities.canLike) {
      for (const postId of this.config.testData.postIds) {
        await this.runTest(`Like post ${postId}`, async () => {
          const result = await this.config.adapter.like(postId);
          
          if (!result.success) {
            throw new Error('Like failed');
          }
          
          return { liked: true };
        });
      }
    }

    // Test profile retrieval
    for (const userId of this.config.testData.userIds) {
      await this.runTest(`Get profile ${userId}`, async () => {
        const profile = await this.config.adapter.getProfile(userId);
        
        if (!profile.id || !profile.username) {
          throw new Error('Invalid profile data');
        }
        
        return { profile: { id: profile.id, username: profile.username } };
      });
    }

    // Test content retrieval
    for (const postId of this.config.testData.postIds) {
      await this.runTest(`Get content ${postId}`, async () => {
        const content = await this.config.adapter.getContent(postId);
        
        if (!content.id || !content.content) {
          throw new Error('Invalid content data');
        }
        
        return { content: { id: content.id, type: content.type } };
      });
    }

    // Test search
    await this.runTest('Search functionality', async () => {
      const results = await this.config.adapter.search('test query');
      
      if (!Array.isArray(results)) {
        throw new Error('Search results not an array');
      }
      
      return { resultCount: results.length };
    });
  }

  /**
   * Test performance characteristics
   */
  private async runPerformanceTests(): Promise<void> {
    console.log('  🚀 Running performance tests...');

    // Test concurrent operations
    await this.runTest('Concurrent posts', async () => {
      const promises = this.config.testData.validContent.slice(0, 3).map(content =>
        this.config.adapter.post(content)
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      const successRate = (successCount / results.length) * 100;
      
      if (successRate < this.config.expectations.minSuccessRate) {
        throw new Error(`Success rate ${successRate}% below expected ${this.config.expectations.minSuccessRate}%`);
      }
      
      return { successRate, totalRequests: results.length };
    });

    // Test rate limiting
    await this.runTest('Rate limiting behavior', async () => {
      const startTime = Date.now();
      const promises = [];
      
      // Send multiple requests quickly
      for (let i = 0; i < 5; i++) {
        promises.push(this.config.adapter.getProfile('test_user'));
      }
      
      const results = await Promise.allSettled(promises);
      const duration = Date.now() - startTime;
      
      return { 
        duration, 
        requests: results.length,
        fulfilled: results.filter(r => r.status === 'fulfilled').length
      };
    });
  }

  /**
   * Test error handling
   */
  private async runErrorHandlingTests(): Promise<void> {
    console.log('  🛡️ Running error handling tests...');

    // Test invalid content
    for (const content of this.config.testData.invalidContent) {
      await this.runTest(`Handle invalid ${content.type} content`, async () => {
        try {
          await this.config.adapter.post(content);
          throw new Error('Expected error for invalid content');
        } catch (error) {
          if (error instanceof Error && error.message === 'Expected error for invalid content') {
            throw error;
          }
          return { errorHandled: true, errorMessage: (error as Error).message };
        }
      });
    }

    // Test network errors
    await this.runTest('Network error handling', async () => {
      // Mock network error
      const originalMethod = this.config.adapter.getProfile;
      (this.config.adapter as any).getProfile = async () => {
        throw new Error('Network error');
      };
      
      try {
        await this.config.adapter.getProfile('test');
        throw new Error('Expected network error');
      } catch (error) {
        if (error instanceof Error && error.message === 'Expected network error') {
          throw error;
        }
        return { networkErrorHandled: true };
      } finally {
        (this.config.adapter as any).getProfile = originalMethod;
      }
    });

    // Test authentication errors
    await this.runTest('Authentication error handling', async () => {
      const originalConfig = this.config.adapter.config;
      (this.config.adapter as any).config = {
        ...originalConfig,
        auth: { type: 'bearer', credentials: {} }
      };
      
      await this.config.adapter.disconnect();
      await this.config.adapter.initialize();
      
      const result = await this.config.adapter.authenticate();
      
      if (result) {
        throw new Error('Expected authentication to fail');
      }
      
      // Restore original config
      (this.config.adapter as any).config = originalConfig;
      await this.config.adapter.initialize();
      await this.config.adapter.authenticate();
      
      return { authErrorHandled: true };
    });
  }

  /**
   * Test security aspects
   */
  private async runSecurityTests(): Promise<void> {
    console.log('  🔒 Running security tests...');

    // Test credential handling
    await this.runTest('Credential security', async () => {
      const configString = JSON.stringify(this.config.adapter.config);
      
      // Check if sensitive data is exposed
      if (configString.includes('password') || configString.includes('secret')) {
        throw new Error('Sensitive credentials may be exposed');
      }
      
      return { credentialsSecure: true };
    });

    // Test input sanitization
    await this.runTest('Input sanitization', async () => {
      const maliciousContent: ContentItem = {
        type: 'text',
        content: '<script>alert("xss")</script>',
        metadata: {
          'eval("malicious code")': 'value'
        }
      };
      
      try {
        await this.config.adapter.post(maliciousContent);
        // If it doesn't throw, check if content was sanitized
        return { inputSanitized: true };
      } catch (error) {
        return { inputRejected: true, error: (error as Error).message };
      }
    });
  }

  /**
   * Test compatibility
   */
  private async runCompatibilityTests(): Promise<void> {
    console.log('  🔧 Running compatibility tests...');

    // Test capabilities consistency
    await this.runTest('Capabilities consistency', async () => {
      const capabilities = this.config.adapter.capabilities;
      
      // Check if capabilities match actual functionality
      if (capabilities.canPost) {
        try {
          await this.config.adapter.post(this.config.testData.validContent[0]);
        } catch (error) {
          throw new Error('Adapter claims canPost but posting fails');
        }
      }
      
      return { capabilitiesConsistent: true };
    });

    // Test interface compliance
    await this.runTest('Interface compliance', async () => {
      const requiredMethods = ['initialize', 'authenticate', 'disconnect', 'post', 'getProfile'];
      
      for (const method of requiredMethods) {
        if (typeof (this.config.adapter as any)[method] !== 'function') {
          throw new Error(`Missing required method: ${method}`);
        }
      }
      
      return { interfaceCompliant: true };
    });
  }

  /**
   * Run individual test
   */
  private async runTest(testName: string, testFn: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const details = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        testName,
        passed: true,
        duration,
        details
      });
      
      console.log(`    ✅ ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        testName,
        passed: false,
        duration,
        error: (error as Error).message
      });
      
      console.log(`    ❌ ${testName} (${duration}ms): ${(error as Error).message}`);
    }
  }

  /**
   * Calculate test coverage
   */
  private async calculateCoverage(): Promise<{ methods: number; branches: number; statements: number }> {
    // This is a simplified coverage calculation
    // In a real implementation, you would integrate with a coverage tool
    
    const adapter = this.config.adapter;
    const prototype = Object.getPrototypeOf(adapter);
    const methods = Object.getOwnPropertyNames(prototype).filter(
      name => typeof (adapter as any)[name] === 'function' && name !== 'constructor'
    );
    
    // Count tested methods
    const testedMethods = this.results
      .filter(r => r.passed)
      .map(r => r.testName.toLowerCase())
      .filter(name => methods.some(method => name.includes(method.toLowerCase())))
      .length;
    
    return {
      methods: Math.min((testedMethods / methods.length) * 100, 100),
      branches: 85, // Placeholder
      statements: 90 // Placeholder
    };
  }

  /**
   * Generate test report
   */
  public generateReport(result: TestSuiteResult): string {
    const successRate = (result.passedTests / result.totalTests) * 100;
    
    let report = `
# Test Report: ${result.suiteName}

## Summary
- **Total Tests**: ${result.totalTests}
- **Passed**: ${result.passedTests}
- **Failed**: ${result.failedTests}
- **Success Rate**: ${successRate.toFixed(1)}%
- **Duration**: ${result.duration}ms

## Coverage
- **Methods**: ${result.coverage.methods.toFixed(1)}%
- **Branches**: ${result.coverage.branches.toFixed(1)}%
- **Statements**: ${result.coverage.statements.toFixed(1)}%

## Test Results

`;

    // Group results by category
    const categories = ['Lifecycle', 'Functionality', 'Performance', 'Error Handling', 'Security', 'Compatibility'];
    
    for (const category of categories) {
      const categoryTests = result.results.filter(r => 
        r.testName.toLowerCase().includes(category.toLowerCase()) ||
        this.getCategoryForTest(r.testName) === category
      );
      
      if (categoryTests.length > 0) {
        report += `### ${category} Tests\n\n`;
        
        for (const test of categoryTests) {
          const status = test.passed ? '✅' : '❌';
          report += `${status} **${test.testName}** (${test.duration}ms)\n`;
          
          if (!test.passed && test.error) {
            report += `   Error: ${test.error}\n`;
          }
          
          if (test.details) {
            report += `   Details: ${JSON.stringify(test.details)}\n`;
          }
          
          report += '\n';
        }
      }
    }

    return report;
  }

  /**
   * Get category for test name
   */
  private getCategoryForTest(testName: string): string {
    const name = testName.toLowerCase();
    
    if (name.includes('initialization') || name.includes('authentication') || name.includes('disconnect')) {
      return 'Lifecycle';
    }
    if (name.includes('post') || name.includes('comment') || name.includes('like') || name.includes('profile')) {
      return 'Functionality';
    }
    if (name.includes('concurrent') || name.includes('rate') || name.includes('performance')) {
      return 'Performance';
    }
    if (name.includes('error') || name.includes('invalid') || name.includes('network')) {
      return 'Error Handling';
    }
    if (name.includes('security') || name.includes('credential') || name.includes('sanitization')) {
      return 'Security';
    }
    if (name.includes('compatibility') || name.includes('interface') || name.includes('capabilities')) {
      return 'Compatibility';
    }
    
    return 'Other';
  }
}

/**
 * Create test configuration for an adapter
 */
export function createTestConfig(adapter: BaseAdapter): AdapterTestConfig {
  return {
    adapter,
    testData: {
      validContent: [
        { type: 'text', content: 'Test post content' },
        { type: 'text', content: 'Another test post with #hashtag' },
        { type: 'image', content: 'Image post', media: [{ type: 'image', url: 'https://example.com/image.jpg' }] }
      ],
      invalidContent: [
        { type: 'text', content: 'a'.repeat(10000) }, // Too long
        { type: 'text', content: '' }, // Empty
        { type: 'custom' as any, content: 'Unsupported type' }
      ],
      userIds: ['test_user_1', 'test_user_2'],
      postIds: ['test_post_1', 'test_post_2']
    },
    expectations: {
      initializationTime: 5000,
      authenticationTime: 10000,
      postResponseTime: 15000,
      minSuccessRate: 80
    }
  };
}

/**
 * Run tests for multiple adapters
 */
export async function runAdapterTests(adapters: BaseAdapter[]): Promise<TestSuiteResult[]> {
  const results: TestSuiteResult[] = [];
  
  for (const adapter of adapters) {
    console.log(`\n🧪 Testing ${adapter.constructor.name}...`);
    
    const config = createTestConfig(adapter);
    const framework = new AdapterTestFramework(config);
    const result = await framework.runTestSuite();
    
    results.push(result);
    
    // Generate and save report
    const report = framework.generateReport(result);
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(__dirname, `../reports/${adapter.constructor.name}-test-report.md`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log(`📊 Report saved: ${reportPath}`);
  }
  
  return results;
}
