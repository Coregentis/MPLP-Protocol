---
title: Orchestration
description: Plan execution orchestration in MPLP covering DAG-based step
  execution, topological sorting, parallel execution, control signals, and
  resource management.
keywords:
  - orchestration
  - DAG execution
  - topological sort
  - parallel steps
  - pipeline stages
  - control signals
  - concurrency limits
  - Plan execution
sidebar_label: Orchestration
doc_status: informative
doc_role: functional-spec
normative_refs:
  - MPLP-CORPUS-v1.0.0
protocol_alignment:
  truth_level: T0
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/mplp-plan.schema.json
      binding: manual
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes:
    - Manual binding applied per Remediation Option A/B.
  doc_status: normative
  normativity_scope: protocol_function
normative_id: MPLP-CORE-ORCHESTRATION
sidebar_position: 6
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Orchestration

## 1. Purpose

**Orchestration** is the cross-cutting concern that governs the execution control flow of MPLP Plans. It defines how Plans are decomposed into Steps, how dependencies are resolved, how parallelism is exploited, and how the runtime schedules agent actions. Orchestration is the "conductor" that turns static Plan definitions into dynamic execution.

**Key Responsibilities**:
- Execute Plans in dependency order (topological sort)
- Maximize parallelism (execute independent steps concurrently)
- Enforce blocking (steps wait for dependencies)
- Handle control signals (pause, resume, cancel)
- Emit pipeline_stage events for all transitions
- Manage resource limits (max concurrent steps)

**Design Principle**: "Let the DAG guide execution, but exploit all available parallelism"

## 2. Plan Execution Model

### 2.1 Plans as DAGs

**From**: L2 Plan Module spec

Every Plan is a **Directed Acyclic Graph (DAG)** where:
- **Nodes**: Steps (executable tasks)
- **Edges**: Dependencies (`step.dependencies[]` references)
- **Constraint**: No cycles allowed

**Example Plan DAG**:
```
Step 1: Setup       (no dependencies) 
Step 2: Build       (depends on: Step 1)  
Step 3: Test Unit   (depends on: Step 2)
Step 4: Test E2E    (depends on: Step 2)  
Step 5: Deploy      (depends on: Step 3, Step 4)
```

**Parallelism Opportunity**: Steps 3 and 4 can run concurrently

### 2.2 Topological Sort

**Algorithm**: Kahn's Algorithm for topological ordering

**Implementation**:
```python
def topological_sort(steps: List[Step]) -> List[Step]:
  """
  Sort steps in dependency order.
  Returns: List of steps in execution order
  Raises: CycleDetectedError if DAG has cycle
  """
  # Build adjacency list and in-degree count
  graph = defaultdict(list)
  in_degree = {step.step_id: 0 for step in steps}
  
  for step in steps:
    for dep_id in step.dependencies:
      graph[dep_id].append(step.step_id)
      in_degree[step.step_id] += 1
  
  # Find all nodes with in-degree 0
  queue = deque([step.step_id for step in steps if in_degree[step.step_id] == 0])
  sorted_ids = []
  
  while queue:
    current_id = queue.popleft()
    sorted_ids.append(current_id)
    
    # Reduce in-degree for neighbors
    for neighbor_id in graph[current_id]:
      in_degree[neighbor_id] -= 1
      if in_degree[neighbor_id] == 0:
        queue.append(neighbor_id)
  
  # Check for cycles
  if len(sorted_ids) != len(steps):
    raise CycleDetectedError("Plan contains circular dependencies")
  
  # Return steps in topological order
  step_map = {s.step_id: s for s in steps}
  return [step_map[sid] for sid in sorted_ids]
```

**Cycle Detection**:
```python
def detect_cycle(steps: List[Step]) -> Optional[List[str]]:
  """
  Detect cycles in step dependencies.
  Returns: List of step IDs forming cycle, or None if acyclic
  """
  visited = set()
  rec_stack = set()
  cycle_path = []
  
  def dfs(step_id: str, path: List[str]) -> bool:
    visited.add(step_id)
    rec_stack.add(step_id)
    path.append(step_id)
    
    step = next(s for s in steps if s.step_id == step_id)
    for dep_id in step.dependencies:
      if dep_id not in visited:
        if dfs(dep_id, path):
          return True
      elif dep_id in rec_stack:
        # Cycle found
        cycle_start = path.index(dep_id)
        cycle_path.extend(path[cycle_start:])
        return True
    
    rec_stack.remove(step_id)
    path.pop()
    return False
  
  for step in steps:
    if step.step_id not in visited:
      if dfs(step.step_id, []):
        return cycle_path
  
  return None
```

### 2.3 Parallel Execution

**Strategy**: Execute all steps with satisfied dependencies concurrently (up to resource limits)

**Implementation**:
```typescript
async function executeParallel(
  plan: Plan,
  ael: ActionExecutionLayer,
  maxConcurrency: number = 10
): Promise<void> {
  const stepMap = new Map(plan.steps.map(s => [s.step_id, s]));
  const completed = new Set<string>();
  const inProgress = new Set<string>();
  
  while (completed.size < plan.steps.length) {
    // Find steps ready to execute
    const ready = plan.steps.filter(step => {
      // Not completed, not in progress
      if (completed.has(step.step_id) || inProgress.has(step.step_id)) {
        return false;
      }
      // All dependencies completed
      return step.dependencies.every(dep => completed.has(dep));
    });
    
    if (ready.length === 0 && inProgress.size === 0) {
      throw new Error("Deadlock: no steps ready and none in progress");
    }
    
    // Limit concurrency
    const toExecute = ready.slice(0, maxConcurrency - inProgress.size);
    
    // Execute steps in parallel
    await Promise.all(
      toExecute.map(async (step) => {
        inProgress.add(step.step_id);
        
        try {
          // Emit pipeline_stage event: step_started
          await emitPipelineStageEvent({
            event_type: 'step_started',
            pipeline_id: plan.plan_id,
            stage_id: step.step_id,
            stage_status: 'running'
          });
          
          // Execute step
          const result = await ael.execute({
            action_type: 'step_execution',
            step_id: step.step_id,
            params: step.params
          });
          
          // Update step status
          step.status = result.status === 'completed'  'completed' : 'failed';
          step.output = result.output;
          
          // Emit pipeline_stage event: step_completed/failed
          await emitPipelineStageEvent({
            event_type: step.status === 'completed'  'step_completed' : 'step_failed',
            pipeline_id: plan.plan_id,
            stage_id: step.step_id,
            stage_status: step.status
          });
          
          if (step.status === 'completed') {
            completed.add(step.step_id);
          } else {
            throw new Error(`Step ${step.step_id} failed`);
          }
        } finally {
          inProgress.delete(step.step_id);
        }
      })
    );
  }
}
```

### 2.4 Blocking Semantics

**Rule**: A step **CANNOT** start until ALL its dependencies are `completed`

**Enforcement**:
```python
def can_execute(step: Step, completed_steps: Set[str]) -> bool:
  """
  Check if step is ready to execute.
  Returns: True if all dependencies completed, False otherwise
  """
  for dep_id in step.dependencies:
    if dep_id not in completed_steps:
      return False  # Dependency not yet completed
  return True

def wait_for_dependencies(
  step: Step,
  vsl: VSL,
  poll_interval_ms: int = 1000
) -> None:
  """
  Block until all dependencies are completed.
  """
  while True:
    all_completed = True
    for dep_id in step.dependencies:
      dep_step = await vsl.get(f"steps/{dep_id}")
      if dep_step.status != "completed":
        all_completed = False
        break
    
    if all_completed:
      return  # All dependencies satisfied
    
    await asyncio.sleep(poll_interval_ms / 1000)
```

## 3. Pipeline Stages & Events

### 3.1 Pipeline Stage Model

**From**: `schemas/v2/events/mplp-pipeline-stage-event.schema.json`

Orchestration is visualized as a **pipeline** of stages, where each stage transition emits a `pipeline_stage` event.

**Plan-Level Stages**:
1. `plan_created` - Plan document created
2. `plan_proposed` - Plan ready for review
3. `plan_approved` - Plan approved for execution
4. `plan_started` - Execution begins
5. `plan_completed` - All steps succeeded
6. `plan_failed` - At least one step failed
7. `plan_cancelled` - Execution aborted

**Step-Level Stages**:
1. `step_pending` - Step waiting for dependencies
2. `step_started` - Step execution begins
3. `step_in_progress` - Step actively executing
4. `step_completed` - Step succeeded
5. `step_failed` - Step failed
6. `step_skipped` - Step skipped (conditional execution)
7. `step_cancelled` - Step aborted

### 3.2 Event Emission (REQUIRED)

**Requirement**: Orchestrator **MUST** emit `pipeline_stage` events for all transitions

**Example Event Sequence** (3-step Plan):
```json
[
  {
    "event_family": "pipeline_stage",
    "event_type": "plan_started",
    "pipeline_id": "plan-123",
    "timestamp": "2025-12-07T00:00:00.000Z"
  },
  {
    "event_family": "pipeline_stage",
    "event_type": "step_started",
    "pipeline_id": "plan-123",
    "stage_id": "step-1",
    "stage_status": "running",
    "timestamp": "2025-12-07T00:00:01.000Z"
  },
  {
    "event_family": "pipeline_stage",
    "event_type": "step_completed",
    "pipeline_id": "plan-123",
    "stage_id": "step-1",
    "stage_status": "completed",
    "timestamp": "2025-12-07T00:00:05.000Z"
  },
  // Step 2 and 3 execute in parallel
  {
    "event_family": "pipeline_stage",
    "event_type": "step_started",
    "pipeline_id": "plan-123",
    "stage_id": "step-2",
    "timestamp": "2025-12-07T00:00:06.000Z"
  },
  {
    "event_family": "pipeline_stage",
    "event_type": "step_started",
    "pipeline_id": "plan-123",
    "stage_id": "step-3",
    "timestamp": "2025-12-07T00:00:06.100Z"
  },
  {
    "event_family": "pipeline_stage",
    "event_type": "step_completed",
    "pipeline_id": "plan-123",
    "stage_id": "step-2",
    "timestamp": "2025-12-07T00:00:10.000Z"
  },
  {
    "event_family": "pipeline_stage",
    "event_type": "step_completed",
    "pipeline_id": "plan-123",
    "stage_id": "step-3",
    "timestamp": "2025-12-07T00:00:12.000Z"
  },
  {
    "event_family": "pipeline_stage",
    "event_type": "plan_completed",
    "pipeline_id": "plan-123",
    "timestamp": "2025-12-07T00:00:12.100Z"
  }
]
```

**Analysis**: Steps 2 and 3 started at nearly the same time (parallel execution)

## 4. Control Signals

### 4.1 Signal Types

**The runtime MUST respond to** 3 control signals:

| Signal | Semantics | Transitio | Duration |
|:---|:---|:---|:---|
| **Pause** | Suspend execution gracefully | `running` `paused` | Until Resume |
| **Resume** | Continue paused execution | `paused` `running` | Immediate |
| **Cancel** | Terminate execution immediately | `running` `cancelled` | Permanent |

### 4.2 Pause Implementation

**Semantics**: Finish current steps, do NOT start new ones

**Implementation**:
```typescript
class OrchestrationController {
  private paused = false;
  private inProgressSteps = new Set<string>();
  
  async pause(): Promise<void> {
    this.paused = true;
    
    // Wait for all in-progress steps to complete
    while (this.inProgressSteps.size > 0) {
      await sleep(100);
    }
    
    // Emit event
    await this.emitEvent({
      event_family: 'pipeline_stage',
      event_type: 'plan_paused',
      pipeline_id: this.plan.plan_id
    });
  }
  
  async executePlan(plan: Plan): Promise<void> {
    while (hasMoreSteps(plan)) {
      // Check if paused
      while (this.paused) {
        await sleep(1000);  // Wait for resume
      }
      
      // Get next ready steps
      const readySteps = getReadySteps(plan);
      
      for (const step of readySteps) {
        this.inProgressSteps.add(step.step_id);
        
        executeStep(step).finally(() => {
          this.inProgressSteps.delete(step.step_id);
        });
      }
    }
  }
}
```

### 4.3 Resume Implementation

**Semantics**: Continue from where paused

**Implementation**:
```typescript
async resume(): Promise<void> {
  if (!this.paused) {
    throw new Error("Cannot resume: not paused");
  }
  
  this.paused = false;
  
  // Emit event
  await this.emitEvent({
    event_family: 'pipeline_stage',
    event_type: 'plan_resumed',
    pipeline_id: this.plan.plan_id
  });
}
```

### 4.4 Cancel Implementation

**Semantics**: Terminate immediately, abandon in-progress steps

**Implementation**:
```typescript
async cancel(): Promise<void> {
  this.cancelled = true;
  
  // Signal all in-progress steps to abort
  for (const stepId of this.inProgressSteps) {
    await this.abortStep(stepId);
  }
  
  // Update plan status
  this.plan.status = 'cancelled';
  await this.vsl.writeNode('Plan', this.plan.plan_id, this.plan);
  
  // Emit event
  await this.emitEvent({
    event_family: 'pipeline_stage',
    event_type: 'plan_cancelled',
    pipeline_id: this.plan.plan_id
  });
}

private async abortStep(stepId: string): Promise<void> {
  const step = await this.vsl.readNode('Step', stepId);
  step.status = 'cancelled';
  await this.vsl.writeNode('Step', stepId, step);
  
  // Emit step cancelled event
  await this.emitEvent({
    event_family: 'pipeline_stage',
    event_type: 'step_cancelled',
    pipeline_id: this.plan.plan_id,
    stage_id: stepId
  });
}
```

## 5. Resource Management

### 5.1 Concurrency Limits

**Problem**: Unbounded parallelism can exhaust resources

**Solution**: Limit max concurrent steps

**Implementation**:
```typescript
class ResourceLimiter {
  private readonly maxConcurrentSteps: number;
  private activeSteps = 0;
  private waitQueue: Array<() => void> = [];
  
  constructor(maxConcurrency: number = 10) {
    this.maxConcurrentSteps = maxConcurrency;
  }
  
  async acquire(): Promise<void> {
    if (this.activeSteps < this.maxConcurrentSteps) {
      this.activeSteps++;
      return;
    }
    
    // Wait in queue
    await new Promise<void>(resolve => {
      this.waitQueue.push(resolve);
    });
  }
  
  release(): void {
    this.activeSteps--;
    
    // Wake up next waiter
    const next = this.waitQueue.shift();
    if (next) {
      this.activeSteps++;
      next();
    }
  }
  
  async executeStep(
    step: Step,
    ael: ActionExecutionLayer
  ): Promise<void> {
    await this.acquire();
    
    try {
      await ael.execute({ step_id: step.step_id });
    } finally {
      this.release();
    }
  }
}
```

### 5.2 Memory Management

**Problem**: Large Plans can consume excessive memory

**Solution**: Stream processing, lazy loading

**Implementation**:
```typescript
class StreamingOrchestrator {
  async executeLargePlan(
    plan_id: string,
    vsl: VSL
  ): Promise<void> {
    // Don't load entire plan into memory
    const planMetadata = await vsl.get(`plans/${plan_id}/metadata`);
    const totalSteps = planMetadata.step_count;
    
    let processedSteps = 0;
    
    while (processedSteps < totalSteps) {
      // Load batch of steps (e.g., 100 at a time)
      const batch = await vsl.get(`plans/${plan_id}/steps`, {
        offset: processedSteps,
        limit: 100
      });
      
      // Execute batch
      await this.executeBatch(batch);
      
      processedSteps += batch.length;
    }
  }
}
```

## 6. SA vs MAP Orchestration

### 6.1 SA Profile Orchestration

**Pattern**: Single agent, sequential or parallel step execution

**From**: SA Profile invariants + `runtime-minimal/index.ts`

```typescript
async function orchestrateSA(
  plan: Plan,
  ael: ActionExecutionLayer
): Promise<void> {
  // Validate SA invariants
  assert(plan.steps.length >= 1, "SA Plan requires at least 1 step");
  
  // Topological sort
  const sortedSteps = topologicalSort(plan.steps);
  
  // Execute in order (with parallelism for independent steps)
  for (const step of sortedSteps) {
    await executeStep(step, ael);
  }
}
```

### 6.2 MAP Profile Orchestration

**Pattern**: Multi-agent, coordinator dispatch

**From**: MAP Profile spec + coordination modes

```typescript
async function orchestrateMAP(
  plan: Plan,
  session: CollabSession,
  ael: ActionExecutionLayer
): Promise<void> {
  // Validate MAP invariants
  assert(session.participants.length >= 2, "MAP requires  participants");
  
  // Coordination mode determines orchestration
  switch (session.mode) {
    case 'broadcast':
      await broadcastOrchestration(plan, session, ael);
      break;
    case 'round_robin':
      await roundRobinOrchestration(plan, session, ael);
      break;
    case 'orchestrated':
      await orchestratedMode(plan, session, ael);
      break;
    case 'swarm':
      await swarmOrchestration(plan, session, ael);
      break;
    case 'pair':
      await pairOrchestration(plan, session, ael);
      break;
  }
}
```

## 7. Conditional Execution

### 7.1 Skip Conditions

**Use Case**: Execute step only if condition true

**Implementation**:
```typescript
interface ConditionalStep extends Step {
  condition?: {
    type: 'always' | 'on_success' | 'on_failure' | 'custom';
    expression?: string;  // For 'custom' type
  };
}

async function shouldExecuteStep(
  step: ConditionalStep,
  plan: Plan
): Promise<boolean> {
  if (!step.condition) return true;  // Default: always execute
  
  switch (step.condition.type) {
    case 'always':
      return true;
    
    case 'on_success':
      // Execute only if all dependencies succeeded
      return step.dependencies.every(dep_id => {
        const dep = plan.steps.find(s => s.step_id === dep_id);
        return dep?.status === 'completed';
      });
    
    case 'on_failure':
      // Execute only if any dependency failed
      return step.dependencies.some(dep_id => {
        const dep = plan.steps.find(s => s.step_id === dep_id);
        return dep?.status === 'failed';
      });
    
    case 'custom':
      // Evaluate custom expression
      return await evaluateExpression(step.condition.expression, plan);
  }
}
```

**Example**: Rollback step only on failure
```json
{
  "step_id": "rollback-step",
  "description": "Rollback changes",
  "dependencies": ["deploy-step"],
  "condition": {
    "type": "on_failure"
  }
}
```

### 7.2 Dynamic Plan Modification

**Use Case**: Agent modifies Plan during execution

**Implementation**:
```typescript
async function insertStep(
  plan: Plan,
  newStep: Step,
  afterStepId: string
): Promise<void> {
  // Find insertion point
  const index = plan.steps.findIndex(s => s.step_id === afterStepId);
  if (index === -1) {
    throw new Error(`Step ${afterStepId} not found`);
  }
  
  // Insert new step
  plan.steps.splice(index + 1, 0, newStep);
  
  // Update dependencies
  const nextSteps = plan.steps.slice(index + 2);
  for (const step of nextSteps) {
    if (step.dependencies.includes(afterStepId)) {
      // Redirect dependency to new step
      step.dependencies = step.dependencies.map(dep =>
        dep === afterStepId  newStep.step_id : dep
      );
      newStep.dependencies.push(afterStepId);
    }
  }
  
  // Persist updated plan
  await vsl.writeNode('Plan', plan.plan_id, plan);
  
  // Emit graph_update event
  await emitGraphUpdateEvent({
    update_kind: 'node_add',
    node_id: newStep.step_id,
    node_type: 'Step'
  });
}
```

## 8. Performance Optimization

### 8.1 Work Stealing

**Problem**: Some agents finish early, sit idle while others still working

**Solution**: Idle agents "steal" work from busy agents' queues

**Implementation**:
```typescript
class WorkStealingOrchestrator {
  private queues: Map<string, Step[]> = new Map();  // agent_id pending steps
  
  async assignWork(
    agents: Participant[],
    steps: Step[]
  ): Promise<void> {
    // Initial assignment (round-robin)
    for (let i = 0; i < steps.length; i++) {
      const agent = agents[i % agents.length];
      if (!this.queues.has(agent.participant_id)) {
        this.queues.set(agent.participant_id, []);
      }
      this.queues.get(agent.participant_id)!.push(steps[i]);
    }
    
    // Execute with work stealing
    await Promise.all(
      agents.map(agent => this.executeWithStealing(agent))
    );
  }
  
  private async executeWithStealing(agent: Participant): Promise<void> {
    while (true) {
      // Try to get work from own queue
      let step = this.queues.get(agent.participant_id)?.shift();
      
      if (!step) {
        // Try to steal from others
        step = this.steal();
        if (!step) break;  // No work left
      }
      
      await this.executeStep(step, agent);
    }
  }
  
  private steal(): Step | null {
    // Find queue with most work
    let maxQueue: Step[] | null = null;
    let maxSize = 0;
    
    for (const queue of this.queues.values()) {
      if (queue.length > maxSize) {
        maxSize = queue.length;
        maxQueue = queue;
      }
    }
    
    // Steal from end (LIFO)
    return maxQueue?.pop() || null;
  }
}
```

### 8.2 Prefetching

**Problem**: Steps wait for data loading

**Solution**: Prefetch data for upcoming steps

**Implementation**:
```typescript
class PrefetchingOrchestrator {
  async executePlan(plan: Plan): Promise<void> {
    const sortedSteps = topologicalSort(plan.steps);
    
    for (let i = 0; i < sortedSteps.length; i++) {
      const currentStep = sortedSteps[i];
      
      // Prefetch data for next steps
      if (i + 1 < sortedSteps.length) {
        const nextSteps = sortedSteps.slice(i + 1, i + 4);  // Next 3 steps
        this.prefetch(nextSteps);  // Non-blocking
      }
      
      // Execute current step
      await this.executeStep(currentStep);
    }
  }
  
  private prefetch(steps: Step[]): void {
    for (const step of steps) {
      // Load data in background
      this.loadStepData(step).catch(err => {
        console.warn(`Prefetch failed for ${step.step_id}:`, err);
      });
    }
  }
}
```

## 9. Related Documents

**Architecture**:
- [L2 Coordination & Governance](../l2-coordination-governance.md)
- [L3 Execution & Orchestration](../l3-execution-orchestration.md)

**Cross-Cutting Concerns**:
- [Coordination](coordination.md)
- [AEL](ael.md) (action execution)
- [Performance](performance.md)

**Runtime Details**:
- [Runtime Glue Overview](../../06-runtime/runtime-glue-overview.md)

**Algorithms**:
- Topological Sort: Kahn's Algorithm
- Cycle Detection: DFS-based
- Work Stealing: LIFO queue stealing

---

**Document Status**: Specification (Normative execution semantics)  
**Core Algorithm**: Topological sort with parallel execution  
**Required Events**: pipeline_stage (plan_started, step_started, step_completed, plan_completed)  
**Control Signals**: Pause (graceful), Resume, Cancel (immediate)  
**Optimizations**: Work stealing, prefetching, resource limits
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
