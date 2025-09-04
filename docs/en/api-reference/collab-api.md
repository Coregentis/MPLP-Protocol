# Collab API Reference

**Multi-Agent Collaboration and Coordination - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Collab%20Module-blue.svg)](../modules/collab/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--collab.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-146%2F146%20passing-green.svg)](../modules/collab/testing-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/collab-api.md)

---

## 🎯 Overview

The Collab API provides comprehensive multi-agent collaboration and coordination capabilities. It enables collaborative decision-making, task allocation, conflict resolution, and large-scale collaboration management. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  CollabController,
  CollabManagementService,
  CreateCollabDto,
  UpdateCollabDto,
  CollabResponseDto
} from 'mplp/modules/collab';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const collabModule = mplp.getModule('collab');
```

## 🏗️ Core Interfaces

### **CollabResponseDto** (Response Interface)

```typescript
interface CollabResponseDto {
  // Basic protocol fields
  protocolVersion: string;        // Protocol version "1.0.0"
  timestamp: string;              // ISO 8601 timestamp
  collabId: string;               // Unique collaboration identifier
  contextId: string;              // Associated context ID
  name: string;                   // Collaboration name
  status: CollabStatus;           // Collaboration status
  type: CollabType;               // Collaboration type
  
  // Participants and roles
  participants: CollabParticipant[];
  coordinators: string[];         // Coordinator agent IDs
  
  // Collaboration structure
  objectives: CollabObjective[];
  tasks: CollabTask[];
  decisions: CollabDecision[];
  
  // Coordination mechanisms
  coordinationPatterns: CoordinationPattern[];
  conflictResolution: ConflictResolutionConfig;
  
  // Performance and metrics
  performanceMetrics: CollabMetrics;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateCollabDto** (Create Request Interface)

```typescript
interface CreateCollabDto {
  contextId: string;              // Required: Associated context ID
  name: string;                   // Required: Collaboration name
  type: CollabType;               // Required: Collaboration type
  
  // Participants
  participants: Array<{
    agentId: string;
    role: ParticipantRole;
    capabilities: string[];
    weight?: number;              // Decision weight
  }>;
  
  // Objectives
  objectives: Array<{
    id: string;
    description: string;
    priority: Priority;
    metrics?: ObjectiveMetric[];
  }>;
  
  // Configuration
  configuration?: CollabConfiguration;
  
  // Metadata
  metadata?: Record<string, any>;
}
```

## 🔧 Core Enums

### **CollabStatus** (Collaboration Status)

```typescript
enum CollabStatus {
  INITIALIZING = 'initializing',  // Initializing collaboration
  ACTIVE = 'active',              // Active collaboration
  PAUSED = 'paused',              // Paused collaboration
  COMPLETED = 'completed',        // Completed collaboration
  FAILED = 'failed',              // Failed collaboration
  CANCELLED = 'cancelled'         // Cancelled collaboration
}
```

### **CollabType** (Collaboration Type)

```typescript
enum CollabType {
  TASK_ORIENTED = 'task_oriented',        // Task-oriented collaboration
  DECISION_MAKING = 'decision_making',    // Decision-making collaboration
  PROBLEM_SOLVING = 'problem_solving',    // Problem-solving collaboration
  RESOURCE_SHARING = 'resource_sharing',  // Resource sharing
  KNOWLEDGE_EXCHANGE = 'knowledge_exchange', // Knowledge exchange
  COMPETITIVE = 'competitive'             // Competitive collaboration
}
```

### **CoordinationPattern** (Coordination Pattern)

```typescript
enum CoordinationPattern {
  CENTRALIZED = 'centralized',    // Centralized coordination
  DECENTRALIZED = 'decentralized', // Decentralized coordination
  HIERARCHICAL = 'hierarchical',  // Hierarchical coordination
  PEER_TO_PEER = 'peer_to_peer',  // Peer-to-peer coordination
  MARKET_BASED = 'market_based',  // Market-based coordination
  CONSENSUS = 'consensus'         // Consensus-based coordination
}
```

## 🎮 Controller API

### **CollabController**

Main REST API controller providing HTTP endpoint access.

#### **Create Collaboration**
```typescript
async createCollab(dto: CreateCollabDto): Promise<CollabOperationResult>
```

**HTTP Endpoint**: `POST /api/collabs`

**Request Example**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "Multi-Agent Data Analysis Collaboration",
  "type": "task_oriented",
  "participants": [
    {
      "agentId": "data-analyst-001",
      "role": "coordinator",
      "capabilities": ["data_analysis", "visualization", "reporting"],
      "weight": 0.4
    },
    {
      "agentId": "ml-specialist-002",
      "role": "specialist",
      "capabilities": ["machine_learning", "model_training"],
      "weight": 0.3
    },
    {
      "agentId": "domain-expert-003",
      "role": "advisor",
      "capabilities": ["domain_knowledge", "validation"],
      "weight": 0.3
    }
  ],
  "objectives": [
    {
      "id": "obj-001",
      "description": "Analyze customer behavior patterns",
      "priority": "high",
      "metrics": [
        {
          "name": "accuracy",
          "target": 0.95,
          "weight": 0.6
        },
        {
          "name": "completion_time",
          "target": 3600,
          "weight": 0.4
        }
      ]
    }
  ],
  "configuration": {
    "coordinationPattern": "hierarchical",
    "decisionMaking": "weighted_voting",
    "conflictResolution": "escalation"
  }
}
```

#### **Join Collaboration**
```typescript
async joinCollab(collabId: string, participantInfo: JoinCollabDto): Promise<CollabOperationResult>
```

**HTTP Endpoint**: `POST /api/collabs/{collabId}/join`

#### **Leave Collaboration**
```typescript
async leaveCollab(collabId: string, agentId: string): Promise<CollabOperationResult>
```

**HTTP Endpoint**: `POST /api/collabs/{collabId}/leave`

#### **Make Decision**
```typescript
async makeDecision(collabId: string, decision: CollabDecisionDto): Promise<CollabOperationResult>
```

**HTTP Endpoint**: `POST /api/collabs/{collabId}/decisions`

#### **Allocate Task**
```typescript
async allocateTask(collabId: string, task: TaskAllocationDto): Promise<CollabOperationResult>
```

**HTTP Endpoint**: `POST /api/collabs/{collabId}/tasks/allocate`

#### **Resolve Conflict**
```typescript
async resolveConflict(collabId: string, conflict: ConflictResolutionDto): Promise<CollabOperationResult>
```

**HTTP Endpoint**: `POST /api/collabs/{collabId}/conflicts/resolve`

#### **Get Collaboration**
```typescript
async getCollab(collabId: string): Promise<CollabResponseDto>
```

**HTTP Endpoint**: `GET /api/collabs/{collabId}`

#### **Update Collaboration**
```typescript
async updateCollab(collabId: string, dto: UpdateCollabDto): Promise<CollabOperationResult>
```

**HTTP Endpoint**: `PUT /api/collabs/{collabId}`

#### **End Collaboration**
```typescript
async endCollab(collabId: string, reason?: string): Promise<CollabOperationResult>
```

**HTTP Endpoint**: `POST /api/collabs/{collabId}/end`

## 🔧 Service Layer API

### **CollabManagementService**

Core business logic service providing collaboration management functionality.

#### **Main Methods**

```typescript
class CollabManagementService {
  // Basic CRUD operations
  async createCollab(request: CreateCollabRequest): Promise<CollabEntity>;
  async getCollabById(collabId: string): Promise<CollabEntity | null>;
  async updateCollab(collabId: string, request: UpdateCollabRequest): Promise<CollabEntity>;
  async deleteCollab(collabId: string): Promise<boolean>;
  
  // Participant management
  async addParticipant(collabId: string, participant: CollabParticipant): Promise<CollabEntity>;
  async removeParticipant(collabId: string, agentId: string): Promise<CollabEntity>;
  async updateParticipantRole(collabId: string, agentId: string, role: ParticipantRole): Promise<CollabEntity>;
  
  // Task management
  async allocateTask(collabId: string, task: CollabTask): Promise<TaskAllocationResult>;
  async completeTask(collabId: string, taskId: string, result: TaskResult): Promise<CollabEntity>;
  async reassignTask(collabId: string, taskId: string, newAssignee: string): Promise<CollabEntity>;
  
  // Decision making
  async proposeDecision(collabId: string, proposal: DecisionProposal): Promise<CollabDecision>;
  async voteOnDecision(collabId: string, decisionId: string, vote: DecisionVote): Promise<CollabDecision>;
  async finalizeDecision(collabId: string, decisionId: string): Promise<CollabDecision>;
  
  // Conflict resolution
  async detectConflicts(collabId: string): Promise<ConflictDetectionResult>;
  async resolveConflict(collabId: string, conflictId: string, resolution: ConflictResolution): Promise<ConflictResolutionResult>;
  
  // Analytics and monitoring
  async getCollabMetrics(collabId: string): Promise<CollabMetrics>;
  async getCollabHealth(collabId: string): Promise<CollabHealth>;
}
```

## 📊 Data Structures

### **CollabParticipant** (Collaboration Participant)

```typescript
interface CollabParticipant {
  agentId: string;                // Agent identifier
  role: ParticipantRole;          // Participant role
  capabilities: string[];         // Agent capabilities
  status: ParticipantStatus;      // Participation status
  weight: number;                 // Decision weight (0-1)
  joinedAt: Date;                 // Join timestamp
  contribution: ContributionMetrics; // Contribution metrics
}
```

### **CollabTask** (Collaboration Task)

```typescript
interface CollabTask {
  taskId: string;                 // Task identifier
  name: string;                   // Task name
  description: string;            // Task description
  assignedTo: string[];           // Assigned agent IDs
  status: TaskStatus;             // Task status
  priority: Priority;             // Task priority
  dependencies: string[];         // Task dependencies
  deadline?: Date;                // Task deadline
  resources: TaskResource[];      // Required resources
  progress: TaskProgress;         // Task progress
}
```

### **CollabDecision** (Collaboration Decision)

```typescript
interface CollabDecision {
  decisionId: string;             // Decision identifier
  title: string;                  // Decision title
  description: string;            // Decision description
  proposedBy: string;             // Proposer agent ID
  status: DecisionStatus;         // Decision status
  options: DecisionOption[];      // Decision options
  votes: DecisionVote[];          // Cast votes
  deadline?: Date;                // Voting deadline
  result?: DecisionResult;        // Final decision result
}
```

### **ConflictResolutionConfig** (Conflict Resolution Configuration)

```typescript
interface ConflictResolutionConfig {
  strategy: ConflictResolutionStrategy;
  escalationLevels: Array<{
    level: number;
    threshold: number;            // Conflict severity threshold
    resolvers: string[];          // Resolver agent IDs
    timeout: number;              // Resolution timeout
  }>;
  votingMechanism?: VotingMechanism;
  mediationRules?: MediationRule[];
}
```

---

## 🔗 Related Documentation

- **[Implementation Guide](../modules/collab/implementation-guide.md)**: Detailed implementation instructions
- **[Configuration Guide](../modules/collab/configuration-guide.md)**: Configuration options reference
- **[Integration Examples](../modules/collab/integration-examples.md)**: Real-world usage examples
- **[Protocol Specification](../modules/collab/protocol-specification.md)**: Underlying protocol specification

---

**Last Updated**: September 4, 2025  
**API Version**: v1.0.0  
**Status**: Enterprise Grade Production Ready  
**Language**: English
