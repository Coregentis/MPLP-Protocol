# Role Module - Troubleshooting Guide

**Version**: v1.0.0
**Last Updated**: 2025-08-09 16:30:00
**Status**: Enterprise-Grade Production Ready ✅

---

## 📋 **Troubleshooting Overview**

This guide provides comprehensive troubleshooting solutions for common issues encountered when using the Role Module in production environments. All solutions are based on real-world enterprise deployment experience.

## 🚨 **Common Issues and Solutions**

### Role Creation Issues

#### Issue: Role Creation Fails with Validation Error
**Symptoms**:
```json
{
  "status": 400,
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "code": "REQUIRED",
      "message": "Role name is required"
    }
  ]
}
```

**Solution**:
```typescript
// Ensure all required fields are provided
const createRequest = {
  context_id: 'valid-context-id',  // ✅ Required
  name: 'Role Name',               // ✅ Required
  role_type: 'functional',         // ✅ Required
  permissions: []                  // ✅ Required (can be empty)
};

// Validate request before sending
if (!createRequest.context_id || !createRequest.name || !createRequest.role_type) {
  throw new Error('Missing required fields');
}
```

#### Issue: Duplicate Role Name Error
**Symptoms**:
```json
{
  "status": 409,
  "error": "Role name already exists in context"
}
```

**Solution**:
```typescript
// Check for existing role before creation
const existingRole = await roleService.queryRoles({
  context_id: 'ctx-123',
  name_pattern: 'exact-role-name'
});

if (existingRole.data.roles.length > 0) {
  // Handle duplicate name
  const uniqueName = `${originalName}-${Date.now()}`;
  createRequest.name = uniqueName;
}
```

### Permission Issues

#### Issue: Permission Check Returns False Unexpectedly
**Symptoms**:
- User should have permission but check returns false
- Inconsistent permission results

**Diagnosis Steps**:
```typescript
// 1. Verify role exists and is active
const role = await roleService.getRoleById('role-123');
if (!role.success || role.data.status !== 'active') {
  console.log('Role is inactive or not found');
}

// 2. Check permission details
const permissions = role.data.permissions;
console.log('Role permissions:', permissions);

// 3. Verify permission expiration
const now = new Date();
const validPermissions = permissions.filter(p => 
  !p.expiry || new Date(p.expiry) > now
);
console.log('Valid permissions:', validPermissions);

// 4. Check inheritance
if (role.data.inheritance) {
  console.log('Checking inherited permissions...');
  // Debug inheritance chain
}
```

**Solution**:
```typescript
// Clear permission cache and retry
await cacheService.invalidateRole('role-123');
const freshResult = await roleService.checkPermission(
  'role-123', 'resource_type', 'resource_id', 'action'
);
```

#### Issue: Permission Inheritance Not Working
**Symptoms**:
- Child roles don't inherit parent permissions
- Inheritance conflicts not resolved correctly

**Solution**:
```typescript
// Verify inheritance configuration
const childRole = await roleService.getRoleById('child-role');
const inheritance = childRole.data.inheritance;

if (!inheritance || !inheritance.parent_roles.length) {
  console.log('No parent roles configured');
  return;
}

// Check parent role status
for (const parentId of inheritance.parent_roles) {
  const parent = await roleService.getRoleById(parentId);
  if (!parent.success || parent.data.status !== 'active') {
    console.log(`Parent role ${parentId} is inactive`);
  }
}

// Verify inheritance rules
if (inheritance.inheritance_rules) {
  console.log('Merge strategy:', inheritance.inheritance_rules.merge_strategy);
  console.log('Conflict resolution:', inheritance.inheritance_rules.conflict_resolution);
}
```

### Performance Issues

#### Issue: Slow Permission Checks
**Symptoms**:
- Permission checks taking > 100ms
- High database load
- Timeout errors

**Diagnosis**:
```typescript
// Monitor permission check performance
const startTime = Date.now();
const result = await roleService.checkPermission('role-123', 'project', 'proj-456', 'read');
const duration = Date.now() - startTime;

console.log(`Permission check took ${duration}ms`);

if (duration > 50) {
  console.log('Performance issue detected');
  
  // Check cache hit rate
  const stats = await cacheService.getStats();
  console.log('Cache hit rate:', stats.hitRate);
  
  if (stats.hitRate < 0.8) {
    console.log('Low cache hit rate - consider cache tuning');
  }
}
```

**Solutions**:

1. **Enable Caching**:
```typescript
// Ensure caching is properly configured
const cacheConfig = {
  role_ttl: 300,        // 5 minutes
  permission_ttl: 60,   // 1 minute
  effective_ttl: 600,   // 10 minutes
  max_size: 10000
};

await cacheService.configure(cacheConfig);
```

2. **Optimize Database Queries**:
```sql
-- Add indexes for common queries
CREATE INDEX idx_roles_context_status ON roles(context_id, status);
CREATE INDEX idx_permissions_role_resource ON permissions(role_id, resource_type, resource_id);
CREATE INDEX idx_role_inheritance_parent ON role_inheritance(parent_role_id);
```

3. **Use Bulk Operations**:
```typescript
// Instead of multiple individual checks
const permissions = [
  { resource_type: 'project', resource_id: 'proj-1', action: 'read' },
  { resource_type: 'project', resource_id: 'proj-2', action: 'read' }
];

// Use bulk checking
const results = await Promise.all(
  permissions.map(p => roleService.checkPermission('role-123', p.resource_type, p.resource_id, p.action))
);
```

### Cache Issues

#### Issue: Stale Cache Data
**Symptoms**:
- Permission changes not reflected immediately
- Inconsistent behavior across requests

**Solution**:
```typescript
// Implement cache invalidation strategy
class RoleService {
  async updateRoleStatus(roleId: string, status: RoleStatus) {
    // Update database
    const result = await this.repository.updateStatus(roleId, status);
    
    if (result.success) {
      // Invalidate related cache entries
      await this.cacheService.invalidateRole(roleId);
      await this.cacheService.invalidatePermissionChecks(roleId);
      
      // Invalidate child role caches if inheritance is involved
      const childRoles = await this.repository.findChildRoles(roleId);
      for (const child of childRoles) {
        await this.cacheService.invalidateRole(child.roleId);
      }
    }
    
    return result;
  }
}
```

#### Issue: Cache Memory Issues
**Symptoms**:
- High memory usage
- Out of memory errors
- Cache performance degradation

**Solution**:
```typescript
// Implement cache size management
const cacheConfig = {
  max_size: 10000,           // Limit cache size
  eviction_policy: 'LRU',    // Use LRU eviction
  memory_threshold: 0.8,     // Trigger cleanup at 80%
  cleanup_interval: 300000   // Cleanup every 5 minutes
};

// Monitor cache metrics
setInterval(async () => {
  const stats = await cacheService.getStats();
  
  if (stats.memoryUsage > cacheConfig.memory_threshold) {
    console.log('High cache memory usage, triggering cleanup');
    await cacheService.cleanup();
  }
}, cacheConfig.cleanup_interval);
```

### Integration Issues

#### Issue: Module Integration Failures
**Symptoms**:
- Role module not responding to other modules
- Integration timeouts
- Workflow execution failures

**Diagnosis**:
```typescript
// Test module adapter health
const adapter = new RoleModuleAdapter();

try {
  const healthCheck = await adapter.healthCheck();
  console.log('Module health:', healthCheck);
  
  if (!healthCheck.healthy) {
    console.log('Health issues:', healthCheck.issues);
  }
} catch (error) {
  console.error('Module adapter error:', error);
}
```

**Solution**:
```typescript
// Implement retry logic with exponential backoff
class RoleModuleAdapter {
  async executeWorkflow(workflow: WorkflowRequest, retries = 3): Promise<WorkflowResult> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.doExecuteWorkflow(workflow);
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Workflow attempt ${attempt} failed, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
```

### Database Issues

#### Issue: Database Connection Failures
**Symptoms**:
- Connection timeout errors
- Database unavailable errors
- Transaction failures

**Solution**:
```typescript
// Implement connection pooling and retry logic
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'mplp_role',
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  }
};

// Health check implementation
class DatabaseHealthCheck {
  async check(): Promise<HealthStatus> {
    try {
      await this.repository.healthCheck();
      return { healthy: true };
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
```

## 🔧 **Debugging Tools**

### Enable Debug Logging
```typescript
// Enable detailed logging
process.env.DEBUG = 'mplp:role:*';

// Or specific components
process.env.DEBUG = 'mplp:role:service,mplp:role:cache';
```

### Performance Monitoring
```typescript
// Add performance monitoring
class PerformanceMonitor {
  static async monitor<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      console.log(`${operation} completed in ${duration}ms`);
      
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${operation} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`${operation} failed after ${duration}ms:`, error);
      throw error;
    }
  }
}

// Usage
const result = await PerformanceMonitor.monitor(
  'checkPermission',
  () => roleService.checkPermission('role-123', 'project', 'proj-456', 'read')
);
```

### Health Check Endpoint
```typescript
// Implement comprehensive health check
app.get('/health/role', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await databaseHealthCheck(),
      cache: await cacheHealthCheck(),
      module: await moduleHealthCheck()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check.healthy);
  health.status = isHealthy ? 'healthy' : 'unhealthy';
  
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## 📊 **Monitoring and Alerts**

### Key Metrics to Monitor
- **Permission Check Latency**: < 10ms target
- **Cache Hit Rate**: > 90% target
- **Error Rate**: < 1% target
- **Database Connection Pool**: Monitor usage
- **Memory Usage**: Monitor cache memory

### Alert Thresholds
```typescript
const alertThresholds = {
  permission_check_latency: 50,    // ms
  cache_hit_rate: 0.8,            // 80%
  error_rate: 0.05,               // 5%
  memory_usage: 0.9,              // 90%
  database_connections: 0.8        // 80% of pool
};
```

## 🆘 **Emergency Procedures**

### Cache Reset
```bash
# Clear all role caches
curl -X POST /api/v1/admin/cache/clear \
  -H "Authorization: Bearer <admin-token>"
```

### Database Recovery
```sql
-- Check database health
SELECT COUNT(*) FROM roles WHERE status = 'active';

-- Rebuild indexes if needed
REINDEX TABLE roles;
REINDEX TABLE permissions;
```

### Module Restart
```bash
# Graceful module restart
curl -X POST /api/v1/admin/module/restart \
  -H "Authorization: Bearer <admin-token>"
```

---

**This troubleshooting guide provides comprehensive solutions for production issues, ensuring reliable operation of the Role Module in enterprise environments.**
