# Error Handling in MPLP

**Version:** 1.0.1  
**Date:** 2025-07-11T23:59:23Z  

## Introduction

This guide explains how to handle errors and failures in the MPLP system using the Plan module's failure_resolver functionality. The failure_resolver provides automatic recovery strategies for tasks that fail during execution, enhancing the reliability and resilience of your MPLP applications.

## Understanding Failure Resolution

When a task fails in MPLP, the failure_resolver can automatically attempt to recover using one or more of the following strategies:

1. **Retry**: Automatically retry the failed task after a delay
2. **Rollback**: Revert to a previous checkpoint
3. **Skip**: Mark the task as skipped and continue with dependent tasks
4. **Manual Intervention**: Request human intervention for complex failures

These strategies are applied in the order specified in the configuration, and the first successful strategy is used.

## Basic Configuration

The failure_resolver is enabled by default in the Plan module. You can enable or disable it in the plan configuration:

```typescript
const planConfig = createDefaultPlanConfiguration();
planConfig.failure_recovery_enabled = true; // or false to disable
```

## Custom Recovery Strategies

You can customize the recovery strategies for a specific plan:

```typescript
// Create a custom failure resolver configuration
const customResolver: FailureResolver = {
  enabled: true,
  strategies: ['retry', 'manual_intervention'], // Prioritize retry, then manual intervention
  retry_config: {
    max_attempts: 5,
    delay_ms: 2000,
    backoff_factor: 1.5,
    max_delay_ms: 60000
  },
  manual_intervention_config: {
    timeout_ms: 600000, // 10 minutes
    escalation_levels: ['developer', 'team_lead', 'manager'],
    approval_required: true
  },
  notification_channels: ['email', 'slack', 'console'],
  performance_thresholds: {
    max_execution_time_ms: 30000,
    max_memory_usage_mb: 1024,
    max_cpu_usage_percent: 90
  }
};

// Apply to a specific plan
await planService.updatePlan(planId, {
  failure_resolver: customResolver
});
```

## Strategy Configuration Options

### Retry Strategy

The retry strategy automatically retries failed tasks after a delay:

```typescript
const retryConfig: RetryConfig = {
  max_attempts: 3,           // Maximum number of retry attempts
  delay_ms: 1000,            // Initial delay between retries in milliseconds
  backoff_factor: 2.0,       // Backoff factor for exponential backoff
  max_delay_ms: 30000        // Maximum delay between retries in milliseconds
};
```

With exponential backoff, the delay between retries increases exponentially:
- First retry: 1000ms
- Second retry: 2000ms (1000ms * 2.0)
- Third retry: 4000ms (2000ms * 2.0)

### Rollback Strategy

The rollback strategy reverts to a previous checkpoint when recovery is not possible:

```typescript
const rollbackConfig: RollbackConfig = {
  enabled: true,             // Enable/disable rollback
  checkpoint_frequency: 5,   // Create a checkpoint every 5 tasks
  max_rollback_depth: 10     // Maximum number of tasks to roll back
};
```

### Skip Strategy

The skip strategy marks a task as skipped and continues with dependent tasks. This strategy has no additional configuration options.

### Manual Intervention Strategy

The manual intervention strategy requests human intervention for complex failures:

```typescript
const manualInterventionConfig: ManualInterventionConfig = {
  timeout_ms: 300000,        // Timeout for manual intervention (5 minutes)
  escalation_levels: ['team_lead', 'project_manager', 'director'],
  approval_required: true    // Whether approval is required
};
```

## Handling Manual Intervention

When a task requires manual intervention, you need to implement a UI to display the intervention request and collect the response:

```typescript
// Listen for manual intervention requests
planManager.on('manual_intervention_requested', async (event) => {
  const { task_id, plan_id, reason, timeout_ms } = event;
  
  // Display intervention request to user
  const userApproved = await showInterventionDialog(task_id, plan_id, reason);
  
  // Provide response
  await planManager.failureResolver.provideManualIntervention(
    task_id,
    userApproved,
    userApproved ? 'retry' : 'skip'
  );
});
```

You can also check for pending interventions:

```typescript
// Get pending interventions
const pendingInterventions = planManager.failureResolver.getPendingInterventions();

// Display pending interventions
for (const [taskId, intervention] of pendingInterventions.entries()) {
  console.log(`Task ${taskId} needs intervention: ${intervention.reason}`);
  console.log(`Requested at: ${intervention.requestedAt}`);
  console.log(`Plan ID: ${intervention.planId}`);
}
```

## Custom Notification Handling

You can implement custom notification handling to send notifications through different channels:

```typescript
// Create a failure resolver with custom notification handling
const failureResolver = new FailureResolverManager({
  default_resolver: createDefaultFailureResolver(),
  notification_handler: async (channel, message, data) => {
    if (channel === 'slack') {
      await sendSlackMessage(message, data);
    } else if (channel === 'email') {
      await sendEmail(message, data);
    } else {
      console.log(`[${channel}] ${message}`, data);
    }
  }
});
```

## Monitoring Failure Resolution

You can monitor the failure resolution process by listening to events:

```typescript
// Listen for recovery events
planManager.on('task_retry_scheduled', (event) => {
  console.log(`Task ${event.task_id} scheduled for retry in ${event.next_retry_ms}ms`);
});

planManager.on('task_retry_succeeded', (event) => {
  console.log(`Task ${event.task_id} retry succeeded after ${event.retry_count} attempts`);
});

planManager.on('task_retry_failed', (event) => {
  console.log(`Task ${event.task_id} retry failed after ${event.retry_count} attempts`);
  console.log(`Error: ${event.error}`);
});

planManager.on('recovery_completed', (event) => {
  console.log(`Task ${event.task_id} recovered using ${event.strategy} strategy`);
});

planManager.on('recovery_failed', (event) => {
  console.log(`Task ${event.task_id} recovery failed`);
  console.log(`Strategies attempted: ${event.strategies_attempted.join(', ')}`);
  console.log(`Error: ${event.error}`);
});
```

## Best Practices

### 1. Strategy Selection

Choose recovery strategies based on the nature of your tasks:

- **Retry**: Best for transient failures like network issues
- **Rollback**: Best for operations that need to maintain consistency
- **Skip**: Best for non-critical tasks that can be skipped
- **Manual Intervention**: Best for complex failures that require human judgment

### 2. Retry Configuration

Configure retry parameters based on the expected failure patterns:

- For quick transient failures, use short delays and more attempts
- For slow operations, use longer delays and fewer attempts
- Use exponential backoff for network-related failures
- Set a reasonable max_delay_ms to avoid excessive wait times

### 3. Notification Configuration

Configure notifications based on the importance of the tasks:

- For critical tasks, use multiple notification channels
- For non-critical tasks, use console or log notifications
- Include relevant context data in notifications
- Set up escalation levels for important failures

### 4. Performance Considerations

Consider performance implications when configuring failure resolution:

- Avoid excessive retries for high-throughput systems
- Set appropriate timeouts to prevent resource exhaustion
- Monitor memory and CPU usage during recovery operations
- Use skip strategy for non-critical tasks in high-load scenarios

## Troubleshooting

### Common Issues

1. **Excessive Retries**: If tasks are being retried too many times, reduce the max_attempts or increase the delay_ms.

2. **Slow Recovery**: If recovery is taking too long, check for network issues or resource constraints.

3. **Manual Intervention Timeout**: If manual intervention requests are timing out, increase the timeout_ms or ensure that someone is monitoring the requests.

4. **Recovery Failures**: If recovery consistently fails, check the error messages and consider adding more recovery strategies.

### Debugging

You can debug failure resolution by listening to events and logging relevant information:

```typescript
// Enable verbose logging
logger.setLevel('debug');

// Listen for all events
planManager.on('*', (event) => {
  logger.debug('Failure resolver event:', event);
});
```

## Conclusion

The failure_resolver functionality provides a powerful way to handle task failures in MPLP applications. By configuring appropriate recovery strategies, you can enhance the reliability and resilience of your applications and reduce the need for manual intervention.

For more information, see the [Failure Resolver API Reference](../api/failure-resolver.md).

---

*This user guide was generated as part of the Plan → Confirm → Trace → Delivery workflow.* 