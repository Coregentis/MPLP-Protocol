# Plan Module - Troubleshooting Guide

**Version**: v1.0.0  
**Last Updated**: 2025-08-08 15:52:52  
**Status**: Production Ready ✅  
**Module**: Plan (Planning and Coordination Protocol)

---

## 📋 **Overview**

This document provides troubleshooting guidance for common issues encountered when using the Plan Module.

## 🚨 **Common Issues and Solutions**

### **1. Plan Creation Issues**

#### **Issue: Plan Creation Fails with Validation Error**
```
Error: PlanValidationError: Invalid plan data provided
```

**Possible Causes:**
- Missing required fields
- Invalid date ranges
- Incorrect enum values
- Schema validation failures

**Solutions:**
```typescript
// ✅ Correct plan creation
const plan = await planService.createPlan({
  name: "Valid Plan Name", // Required, non-empty
  description: "Valid description", // Required, non-empty
  priority: PlanPriority.HIGH, // Valid enum value
  status: PlanStatus.DRAFT, // Valid initial status
  startDate: new Date('2025-09-01'), // Valid future date
  endDate: new Date('2025-12-31'), // End date after start date
  budget: 50000 // Positive number
});

// ❌ Common mistakes to avoid
const invalidPlan = {
  name: "", // Empty name
  priority: "INVALID", // Invalid enum
  startDate: new Date('2025-12-31'),
  endDate: new Date('2025-09-01'), // End before start
  budget: -1000 // Negative budget
};
```

**Debugging Steps:**
1. Check all required fields are provided
2. Validate enum values against schema
3. Ensure date logic is correct
4. Verify budget and numeric values are positive

#### **Issue: Duplicate Plan Names**
```
Error: PlanConflictError: Plan with this name already exists
```

**Solution:**
```typescript
// Check for existing plans before creation
const existingPlan = await planService.findByName(planName);
if (existingPlan) {
  // Handle duplicate name
  const uniqueName = `${planName} (${new Date().getTime()})`;
  planData.name = uniqueName;
}

const plan = await planService.createPlan(planData);
```

### **2. Task Management Issues**

#### **Issue: Circular Dependency Detected**
```
Error: CircularDependencyError: Circular dependency detected in task chain
```

**Solution:**
```typescript
// Use dependency validation before adding dependencies
const dependencyChain = await taskService.validateDependencyChain(taskId, dependencyIds);
if (dependencyChain.hasCircularDependency) {
  console.error('Circular dependency detected:', dependencyChain.circularPath);
  // Remove problematic dependencies
  const safeDependencies = dependencyIds.filter(id => 
    !dependencyChain.circularPath.includes(id)
  );
  await taskService.updateTaskDependencies(taskId, safeDependencies);
} else {
  await taskService.addTaskDependencies(taskId, dependencyIds);
}
```

#### **Issue: Task Status Transition Error**
```
Error: InvalidStatusTransitionError: Cannot transition from COMPLETED to IN_PROGRESS
```

**Valid Status Transitions:**
```typescript
const validTransitions = {
  [TaskStatus.DRAFT]: [TaskStatus.READY, TaskStatus.CANCELLED],
  [TaskStatus.READY]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.BLOCKED, TaskStatus.CANCELLED],
  [TaskStatus.BLOCKED]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.COMPLETED]: [], // Terminal state
  [TaskStatus.CANCELLED]: [] // Terminal state
};

// Check valid transitions before updating
const currentStatus = task.status;
const newStatus = TaskStatus.IN_PROGRESS;

if (validTransitions[currentStatus].includes(newStatus)) {
  await taskService.updateTaskStatus(taskId, newStatus);
} else {
  console.error(`Invalid transition from ${currentStatus} to ${newStatus}`);
}
```

### **3. Resource Management Issues**

#### **Issue: Resource Allocation Conflict**
```
Error: ResourceConflictError: Insufficient resources available
```

**Solution:**
```typescript
// Check resource availability before allocation
const availability = await resourceService.checkAvailability({
  timeRange: { start: startDate, end: endDate },
  resourceTypes: ['developer', 'designer'],
  requiredCapacity: { developer: 2, designer: 1 }
});

if (availability.sufficient) {
  await resourceService.allocateResources(planId, resourceRequirements);
} else {
  // Handle insufficient resources
  console.log('Available resources:', availability.available);
  console.log('Required resources:', availability.required);
  
  // Option 1: Adjust timeline
  const alternativeTimeRange = await resourceService.findAvailableTimeSlot(
    resourceRequirements, 
    { minDuration: plannedDuration }
  );
  
  // Option 2: Reduce resource requirements
  const reducedRequirements = await resourceService.optimizeRequirements(
    resourceRequirements,
    availability.available
  );
}
```

#### **Issue: Resource Over-allocation**
```
Error: ResourceOverallocationError: Resource capacity exceeded
```

**Solution:**
```typescript
// Monitor resource utilization
const utilization = await resourceService.getResourceUtilization(resourceId, timeRange);

if (utilization.percentage > 100) {
  // Rebalance resource allocation
  const rebalanceOptions = await resourceService.getRebalanceOptions(resourceId);
  
  for (const option of rebalanceOptions) {
    console.log(`Option: ${option.description}`);
    console.log(`Impact: ${option.impact}`);
    console.log(`Effort: ${option.effort}`);
  }
  
  // Apply selected rebalancing strategy
  await resourceService.rebalanceAllocation(resourceId, selectedOption);
}
```

### **4. Performance Issues**

#### **Issue: Slow Plan Loading**
```
Symptom: Plan queries taking longer than expected
```

**Optimization Strategies:**
```typescript
// Use pagination for large datasets
const plans = await planService.getPlans({
  page: 1,
  limit: 20,
  sortBy: 'updatedAt',
  sortOrder: 'desc'
});

// Use selective field loading
const planSummary = await planService.getPlanSummary(planId, {
  fields: ['planId', 'name', 'status', 'progress']
});

// Implement caching for frequently accessed data
const cachedPlan = await cacheService.get(`plan:${planId}`);
if (!cachedPlan) {
  const plan = await planService.getPlanById(planId);
  await cacheService.set(`plan:${planId}`, plan, { ttl: 300 }); // 5 minutes
  return plan;
}
return cachedPlan;
```

#### **Issue: Memory Usage High**
```
Symptom: High memory consumption during plan operations
```

**Memory Optimization:**
```typescript
// Use streaming for large data processing
const taskStream = await taskService.getTasksStream(planId);
taskStream.on('data', (task) => {
  // Process task individually
  processTask(task);
});

// Clean up resources after use
try {
  const result = await planService.processLargePlan(planId);
  return result;
} finally {
  // Cleanup
  await planService.cleanup();
  if (global.gc) {
    global.gc(); // Force garbage collection if available
  }
}
```

### **5. Integration Issues**

#### **Issue: External API Integration Failures**
```
Error: ExternalAPIError: Failed to sync with external system
```

**Retry Strategy:**
```typescript
import { retry } from 'async-retry';

const syncWithExternalSystem = async (planId: string) => {
  return await retry(
    async () => {
      return await externalAPI.syncPlan(planId);
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
      onRetry: (error, attempt) => {
        console.log(`Retry attempt ${attempt} for plan ${planId}:`, error.message);
      }
    }
  );
};

// Implement circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold && 
           (Date.now() - this.lastFailureTime) < this.timeout;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }
}
```

## 🔍 **Debugging Tools and Techniques**

### **1. Logging and Monitoring**

#### **Enable Debug Logging**
```typescript
// Enable detailed logging
process.env.LOG_LEVEL = 'debug';
process.env.PLAN_MODULE_DEBUG = 'true';

// Use structured logging
import { logger } from 'mplp/common/logger';

logger.debug('Plan operation started', {
  planId,
  operation: 'createTask',
  userId,
  timestamp: new Date().toISOString()
});
```

#### **Performance Monitoring**
```typescript
// Add performance monitoring
const performanceMonitor = {
  startTime: Date.now(),
  
  measure(operation: string) {
    const duration = Date.now() - this.startTime;
    logger.info(`Operation ${operation} completed in ${duration}ms`);
    
    if (duration > 5000) { // Warn if operation takes more than 5 seconds
      logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
    }
  }
};

// Usage
performanceMonitor.startTime = Date.now();
await planService.createPlan(planData);
performanceMonitor.measure('createPlan');
```

### **2. Health Checks**

#### **Module Health Check**
```typescript
// Implement health check endpoint
export class PlanHealthCheck {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkExternalAPIs(),
      this.checkResourceAvailability(),
      this.checkCacheStatus()
    ]);

    const results = checks.map((check, index) => ({
      name: ['database', 'external_apis', 'resources', 'cache'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason
    }));

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results
    };
  }

  private async checkDatabase(): Promise<any> {
    // Test database connectivity
    return await planRepository.healthCheck();
  }

  private async checkExternalAPIs(): Promise<any> {
    // Test external API connectivity
    return await externalAPIService.ping();
  }

  private async checkResourceAvailability(): Promise<any> {
    // Check resource service availability
    return await resourceService.healthCheck();
  }

  private async checkCacheStatus(): Promise<any> {
    // Check cache service status
    return await cacheService.ping();
  }
}
```

## 📊 **Monitoring and Alerting**

### **1. Key Metrics to Monitor**
```typescript
const keyMetrics = {
  performance: {
    planCreationTime: 'avg_time_to_create_plan',
    taskUpdateTime: 'avg_time_to_update_task',
    queryResponseTime: 'avg_query_response_time'
  },
  reliability: {
    errorRate: 'error_rate_percentage',
    uptime: 'service_uptime_percentage',
    failedOperations: 'failed_operations_count'
  },
  business: {
    activePlans: 'active_plans_count',
    completedTasks: 'completed_tasks_count',
    resourceUtilization: 'resource_utilization_percentage'
  }
};
```

### **2. Alert Thresholds**
```typescript
const alertThresholds = {
  errorRate: 5, // Alert if error rate > 5%
  responseTime: 5000, // Alert if response time > 5 seconds
  memoryUsage: 85, // Alert if memory usage > 85%
  diskUsage: 90, // Alert if disk usage > 90%
  failedIntegrations: 3 // Alert if > 3 integration failures in 5 minutes
};
```

## 🆘 **Emergency Procedures**

### **1. Service Recovery**
```typescript
// Emergency service restart procedure
export class EmergencyRecovery {
  async emergencyRestart(): Promise<void> {
    logger.warn('Initiating emergency restart procedure');
    
    // 1. Stop accepting new requests
    await this.stopAcceptingRequests();
    
    // 2. Complete ongoing operations
    await this.completeOngoingOperations();
    
    // 3. Save critical state
    await this.saveCriticalState();
    
    // 4. Restart services
    await this.restartServices();
    
    // 5. Verify system health
    await this.verifySystemHealth();
    
    // 6. Resume normal operations
    await this.resumeNormalOperations();
    
    logger.info('Emergency restart completed successfully');
  }
}
```

### **2. Data Recovery**
```typescript
// Data corruption recovery
export class DataRecovery {
  async recoverCorruptedPlan(planId: string): Promise<void> {
    // 1. Create backup of current state
    const backup = await this.createBackup(planId);
    
    // 2. Attempt automatic recovery
    const recovered = await this.attemptAutoRecovery(planId);
    
    if (!recovered) {
      // 3. Manual recovery from backup
      await this.recoverFromBackup(planId, backup);
    }
    
    // 4. Validate recovered data
    await this.validateRecoveredData(planId);
  }
}
```

---

**Documentation Version**: v1.0.0  
**Last Updated**: 2025-08-08 15:52:52  
**Module Status**: Production Ready ✅  
**Quality Standard**: MPLP Production Grade
