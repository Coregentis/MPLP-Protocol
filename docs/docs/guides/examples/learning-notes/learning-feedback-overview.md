---
sidebar_position: 5

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Overview of the MPLP learning feedback loop including sample collection and training."
title: Learning & Feedback

---


# Learning & Feedback


## 1. Purpose

**Learning & Feedback** defines mechanisms for capturing high-value interaction data to improve agent performance over time. It standardizes the format of "Learning Samples" extracted from successful and failed execution traces.

**Design Principle**: "Every interaction is a potential training sample"

## 2. Normative Scope

**From**: `schemas/v2/learning/` directory

This specification applies to:
- **L2 Coordination**: `Plan`, `Confirm`, `Dialog` modules (primary feedback sources)
- **L3 Runtime**: Collection and storage logic
- **Learning Module**: Optional v1.0 module for sample extraction

## 3. Learning Sample Structure

**From**: `schemas/v2/learning/mplp-learning-sample.schema.json`

```typescript
interface LearningSample {
  sample_id: string;          // UUID v4
  sample_family: string;      // e.g., 'intent_resolution', 'error_correction'
  created_at: string;         // ISO 8601 timestamp
  
  input: {
    intent_text?: string;     // User's original request
    context?: any;            // Project context
    plan_state?: any;         // Current plan state
  };
  
  output: {
    plan_structure?: any;     // Generated plan
    action_taken?: any;       // Agent action
    result?: any;             // Execution result
  };
  
  feedback: {
    source: 'user' | 'system';
    type: 'approval' | 'rejection' | 'correction' | 'score';
    details?: any;
    quality_label?: 'good' | 'acceptable' | 'poor';
  };
}
```

## 4. Collection Points (SHOULD Capture)

### 4.1 Implicit Feedback

**User actions indicate quality**:

| Action | Feedback Signal | Quality Label |
|:---|:---|:---|
| Approves Plan | Positive | `good` |
| Rejects Plan | Negative | `poor` |
| Executes without changes | Positive | `good` |
| Modifies then executes | Correction | `acceptable` |

**Example**:
```typescript
async function capturePlanApproval(
  plan: Plan,
  confirm: Confirm
): Promise<LearningSample> {
  return {
    sample_id: generateUUID(),
    sample_family: 'intent_resolution',
    created_at: new Date().toISOString(),
    input: {
      intent_text: plan.original_intent,
      context: await getContext(plan.context_id)
    },
    output: {
      plan_structure: plan.steps
    },
    feedback: {
      source: 'user',
      type: confirm.approved  'approval' : 'rejection',
      quality_label: confirm.approved  'good' : 'poor'
    }
  };
}
```

### 4.2 Explicit Feedback

**User provides corrections**:

```typescript
async function captureDeltaIntent(
  originalPlan: Plan,
  deltaIntent: DeltaIntent
): Promise<LearningSample> {
  return {
    sample_id: generateUUID(),
    sample_family: 'error_correction',
    created_at: new Date().toISOString(),
    input: {
      intent_text: originalPlan.original_intent,
      plan_state: originalPlan
    },
    output: {
      action_taken: 'plan_modification',
      result: deltaIntent.changes
    },
    feedback: {
      source: 'user',
      type: 'correction',
      details: {
        user_feedback: deltaIntent.feedback_text,
        corrected_fields: deltaIntent.corrected_fields
      },
      quality_label: 'acceptable'  // User had to correct, but not reject
    }
  };
}
```

## 5. Responsibilities (MUST/SHALL/SHOULD)

### 5.1 Runtime Obligations

1. Runtime **SHOULD** capture `LearningSample` objects at defined collection points
2. Samples **MUST** conform to `schemas/v2/learning/` schemas
3. Samples **MUST** include: `input`, `output`, and `feedback`
4. Runtime **MUST** anonymize PII if configured
5. Collection **MUST NOT** block critical execution path (async)

### 5.2 Sample Validity

```typescript
function validateLearningSample(sample: LearningSample): boolean {
  // MUST have all required fields
  if (!sample.sample_id || !sample.sample_family || !sample.created_at) {
    return false;
  }
  
  // MUST have input and output
  if (!sample.input || !sample.output) {
    return false;
  }
  
  // MUST have feedback with source
  if (!sample.feedback || !sample.feedback.source) {
    return false;
  }
  
  return true;
}
```

## 6. Storage (SHALL Persist)

**PSG Binding**: `psg.learning_samples` or dedicated storage

```typescript
async function storelearningSample(
  sample: LearningSample,
  vsl: VSL
): Promise<void> {
  // Validate sample
  if (!validateLearningSample(sample)) {
    throw new Error('Invalid learning sample');
  }
  
  // Anonymize PII if configured
  if (config.anonymize_pii) {
    sample = await anonymizeSample(sample);
  }
  
  // Store in VSL
  await vsl.set(`learning_samples/${sample.sample_id}`, sample);
  
  // Emit event (optional)
  await eventBus.emit({
    event_family: 'external_integration',
    event_type: 'learning_sample_captured',
    payload: {
      sample_id: sample.sample_id,
      sample_family: sample.sample_family
    }
  });
}
```

## 7. Sample Families

**Common sample types**:

| Family | Input | Output | Feedback Source |
|:---|:---|:---|:---|
| `intent_resolution` | User intent | Generated plan | User approval/rejection |
| `error_correction` | Failed action | Corrected action | User delta intent |
| `plan_optimization` | Slow plan | Optimized plan | System metrics |
| `dialog_response` | User question | Agent answer | User rating |

## 8. Privacy & Governance

### 8.1 PII Anonymization

**MUST anonymize** before storage:

```typescript
async function anonymizeSample(sample: LearningSample): Promise<LearningSample> {
  const redactor = new PIIRedactor();
  
  // Anonymize input
  if (sample.input.intent_text) {
    sample.input.intent_text = redactor.redact(sample.input.intent_text).redacted;
  }
  
  // Anonymize context
  if (sample.input.context) {
    sample.input.context = redactContext(sample.input.context);
  }
  
  return sample;
}
```

### 8.2 Opt-Out

**Users MUST be able to opt out**:

```typescript
const config = {
  learning: {
    enabled: true,          // Can be disabled
    anonymize_pii: true,
    opt_out_patterns: ['*.secret', '*.env']  // Never include these files
  }
};
```

## 9. Usage Examples

### 9.1 Training Data Export

```typescript
async function exportTrainingData(
  startDate: Date,
  endDate: Date
): Promise<TrainingDataset> {
  const samples = await vsl.queryByDateRange(
    'learning_samples',
    startDate,
    endDate
  );
  
  // Filter by quality
  const goodSamples = samples.filter(s => 
    s.feedback.quality_label === 'good'
  );
  
  // Format for training
  return {
    version: '1.0.0',
    sample_count: goodSamples.length,
    samples: goodSamples.map(s => ({
      prompt: formatPrompt(s.input),
      completion: formatCompletion(s.output),
      metadata: {
        sample_id: s.sample_id,
        quality: s.feedback.quality_label
      }
    }))
  };
}
```

### 9.2 Quality Metrics

```typescript
async function calculateQualityMetrics(): Promise<QualityMetrics> {
  const samples = await vsl.getAllSamples();
  
  const total = samples.length;
  const good = samples.filter(s => s.feedback.quality_label === 'good').length;
  const acceptable = samples.filter(s => s.feedback.quality_label === 'acceptable').length;
  const poor = samples.filter(s => s.feedback.quality_label === 'poor').length;
  
  return {
    total_samples: total,
    approval_rate: good / total,
    correction_rate: acceptable / total,
    rejection_rate: poor / total
  };
}
```

## 10. Optionality

**Learning is OPTIONAL for v1.0 compliance**:
- Runtimes MAY implement learning collection
- Projects MAY disable learning
- Learning does NOT affect core protocol execution

**However, learning is RECOMMENDED** for production deployments to improve agent quality over time.

## 11. Related Documents

**Sample Structure**: Input + Output + Feedback  
**Collection**: Async, non-blocking, PII-anonymized  
**Privacy**: MUST support opt-out, SHOULD anonymize PII