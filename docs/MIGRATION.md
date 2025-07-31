# Migration Guide: v1.0.0 → v1.0.1

This guide helps you migrate from MPLP v1.0.0 to v1.0.1, which introduces major infrastructure improvements and enhanced testing capabilities.

## 🚀 Overview

Version 1.0.1 introduces:
- Advanced caching infrastructure
- Workflow orchestration engine
- Enhanced schema validation
- Comprehensive event system
- Improved error handling
- Complete testing framework

## 📋 Pre-Migration Checklist

- [ ] Backup your current implementation
- [ ] Review breaking changes below
- [ ] Update TypeScript to 5.0+
- [ ] Ensure Node.js 18+ is installed
- [ ] Review your current error handling patterns

## 🔄 Breaking Changes

### 1. Enhanced Error Handling

**Before (v1.0.0):**
```typescript
try {
  await someOperation();
} catch (error) {
  console.error('Operation failed:', error);
}
```

**After (v1.0.1):**
```typescript
import { MPLPError, ErrorFactory } from 'mplp/core/error';

try {
  await someOperation();
} catch (error) {
  if (error instanceof MPLPError) {
    // Handle structured MPLP errors
    console.error(`[${error.code}] ${error.message}`, error.context);
  } else {
    // Handle unexpected errors
    throw ErrorFactory.internal('Unexpected error', { originalError: error });
  }
}
```

### 2. New Cache System

**Before (v1.0.0):**
```typescript
// Manual caching implementation
const cache = new Map();
```

**After (v1.0.1):**
```typescript
import { CacheManager, createCacheClient } from 'mplp/core/cache';

const cacheManager = new CacheManager({
  defaultTTL: 300,
  maxSize: 1000,
  storageBackend: 'memory'
});

const cache = createCacheClient(cacheManager, {
  namespace: 'my-app',
  enableSerialization: true
});

// Use the cache
await cache.set('key', data, { ttl: 600 });
const result = await cache.get('key');
```

### 3. Workflow System Integration

**Before (v1.0.0):**
```typescript
// Manual workflow coordination
await planService.execute();
await confirmService.execute();
await traceService.execute();
```

**After (v1.0.1):**
```typescript
import { WorkflowManager } from 'mplp/core/workflow';

const workflowManager = new WorkflowManager({
  maxConcurrentWorkflows: 10,
  enableRetry: true,
  maxRetries: 3
});

const context = {
  user_id: 'user-123',
  priority: WorkflowPriority.NORMAL,
  metadata: { source: 'api' }
};

const { workflow_id } = await workflowManager.initializeWorkflow(context);
await workflowManager.startWorkflow(workflow_id);
```

### 4. Enhanced Event System

**Before (v1.0.0):**
```typescript
// Basic event handling
eventBus.on('event', handler);
eventBus.emit('event', data);
```

**After (v1.0.1):**
```typescript
import { EventBus } from 'mplp/core/event-bus';

const eventBus = new EventBus();

// Subscribe with options
const subscriptionId = eventBus.subscribe('event', handler, {
  priority: 10,
  timeout: 5000,
  once: false
});

// Publish with return value
const handlerCount = eventBus.publish('event', data);

// Async publishing
const handlerCount = await eventBus.publishAsync('event', data);

// Error handling
eventBus.addErrorHandler((error, eventType, data) => {
  console.error(`Event error in ${eventType}:`, error);
});
```

## 🔧 Step-by-Step Migration

### Step 1: Update Dependencies

```bash
npm update mplp
npm install --save-dev @types/jest jest ts-jest
```

### Step 2: Update Import Paths

Replace old imports:
```typescript
// Old
import { ContextService } from 'mplp/modules/context';
import { PlanService } from 'mplp/modules/plan';

// New
import { ContextService } from 'mplp/modules/context/application/services';
import { PlanService } from 'mplp/modules/plan/application/services';
```

### Step 3: Migrate Error Handling

1. Replace generic error handling with structured MPLP errors
2. Use error factories for consistent error creation
3. Implement proper error context and recovery strategies

### Step 4: Integrate New Infrastructure

1. **Cache System**: Replace manual caching with CacheManager
2. **Workflow Engine**: Use WorkflowManager for complex operations
3. **Schema Validation**: Migrate to AJV-based validation
4. **Event System**: Upgrade to enhanced EventBus

### Step 5: Update Tests

```typescript
// Old test structure
describe('My Test', () => {
  it('should work', () => {
    // Basic test
  });
});

// New test structure with utilities
import { createMockContext, createTestWorkflow } from 'mplp/test-utils';

describe('My Test', () => {
  let context: IWorkflowContext;
  
  beforeEach(() => {
    context = createMockContext();
  });
  
  it('should work with workflow', async () => {
    const workflow = createTestWorkflow();
    const result = await workflow.execute(context);
    expect(result).toBeDefined();
  });
});
```

## 🧪 Testing Your Migration

### 1. Run Type Checking
```bash
npm run type-check
```

### 2. Run Tests
```bash
npm test
npm run test:integration
```

### 3. Validate Schema Compliance
```bash
npm run validate:schemas
```

### 4. Performance Testing
```bash
npm run test:performance
```

## 📊 Verification Checklist

After migration, verify:

- [ ] All TypeScript errors resolved
- [ ] Tests pass with new infrastructure
- [ ] Error handling follows new patterns
- [ ] Cache system integrated correctly
- [ ] Workflow orchestration working
- [ ] Event system functioning properly
- [ ] Performance metrics available
- [ ] Schema validation active

## 🆘 Troubleshooting

### Common Issues

**Issue**: TypeScript errors after migration
**Solution**: Update import paths and ensure all new types are properly imported

**Issue**: Tests failing with new infrastructure
**Solution**: Use new test utilities and mock factories

**Issue**: Performance degradation
**Solution**: Configure cache settings and enable performance monitoring

**Issue**: Event system not working
**Solution**: Check event handler registration and error handlers

### Getting Help

- Check the [FAQ](./FAQ.md)
- Review [API Documentation](./API.md)
- See [Examples](../examples/)
- Open an issue on GitHub

## 🎯 Next Steps

After successful migration:

1. **Optimize Performance**: Configure cache and workflow settings
2. **Enhance Monitoring**: Set up performance monitoring
3. **Improve Testing**: Increase test coverage using new utilities
4. **Explore Features**: Try advanced workflow patterns and caching strategies

## 📚 Additional Resources

- [Architecture Guide](./ARCHITECTURE.md)
- [Performance Tuning](./PERFORMANCE.md)
- [Testing Guide](./TESTING.md)
- [API Reference](./API.md)
- [Examples](../examples/)

---

**Need Help?** If you encounter issues during migration, please:
1. Check this guide thoroughly
2. Review the examples in the `/examples` directory
3. Open an issue with detailed information about your setup
