# Collab Module API Reference

## 📋 **API Overview**

The Collab module provides comprehensive multi-agent collaboration management APIs, supporting both RESTful interfaces and protocol interfaces for accessing collaboration services.

## 🔧 **Core Service APIs**

### **CollabManagementService**

#### **Create Collaboration**
```typescript
async createCollaboration(data: Partial<CollabEntityData>): Promise<CollabEntity>
```

**Parameters**:
- `data`: Collaboration creation data
  - `contextId`: Context ID (required)
  - `planId`: Plan ID (required)
  - `name`: Collaboration name (required)
  - `description`: Collaboration description (optional)
  - `mode`: Collaboration mode (required)
  - `coordinationStrategy`: Coordination strategy (required)
  - `participants`: Participant list (optional)
  - `createdBy`: Creator (required)

**Returns**: `CollabEntity` - Created collaboration entity

**Example**:
```typescript
const collaboration = await service.createCollaboration({
  contextId: 'ctx-001',
  planId: 'plan-001',
  name: 'Example Collaboration',
  mode: 'distributed',
  coordinationStrategy: {
    type: 'distributed',
    decisionMaking: 'consensus'
  },
  participants: [],
  createdBy: 'user-001'
});
```

#### **Get Collaboration**
```typescript
async getCollaboration(id: UUID): Promise<CollabEntity | null>
```

**Parameters**:
- `id`: Collaboration ID

**Returns**: `CollabEntity | null` - Collaboration entity or null

#### **Update Collaboration**
```typescript
async updateCollaboration(id: UUID, data: Partial<CollabEntityData>): Promise<CollabEntity>
```

**Parameters**:
- `id`: Collaboration ID
- `data`: Update data

**Returns**: `CollabEntity` - Updated collaboration entity

#### **Delete Collaboration**
```typescript
async deleteCollaboration(id: UUID): Promise<void>
```

**Parameters**:
- `id`: Collaboration ID

#### **List Collaborations**
```typescript
async listCollaborations(query: CollabListQueryDTO): Promise<{
  items: CollabEntity[];
  pagination: PaginationInfo;
}>
```

**Parameters**:
- `query`: Query parameters
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `filters`: Filter conditions (optional)
  - `sort`: Sort conditions (optional)

**Returns**: Paginated collaboration list

#### **Start Collaboration**
```typescript
async startCollaboration(id: UUID, startedBy: string): Promise<CollabEntity>
```

**Parameters**:
- `id`: Collaboration ID
- `startedBy`: Starter

**Returns**: `CollabEntity` - Started collaboration entity

#### **Stop Collaboration**
```typescript
async stopCollaboration(id: UUID, stoppedBy: string): Promise<CollabEntity>
```

**Parameters**:
- `id`: Collaboration ID
- `stoppedBy`: Stopper

**Returns**: `CollabEntity` - Stopped collaboration entity

#### **Add Participant**
```typescript
async addParticipant(
  collaborationId: UUID,
  participantData: {
    agentId: UUID;
    roleId: UUID;
    capabilities?: string[];
  },
  addedBy: string
): Promise<CollabEntity>
```

**Parameters**:
- `collaborationId`: Collaboration ID
- `participantData`: Participant data
- `addedBy`: Adder

**Returns**: `CollabEntity` - Updated collaboration entity

#### **Remove Participant**
```typescript
async removeParticipant(
  collaborationId: UUID,
  participantId: UUID,
  removedBy: string
): Promise<CollabEntity>
```

**Parameters**:
- `collaborationId`: Collaboration ID
- `participantId`: Participant ID
- `removedBy`: Remover

**Returns**: `CollabEntity` - Updated collaboration entity

### **CollabCoordinationService**

#### **Coordinate Collaboration**
```typescript
async coordinateCollaboration(
  collaborationId: UUID,
  coordinationData: CoordinationRequest
): Promise<CoordinationResult>
```

**Parameters**:
- `collaborationId`: Collaboration ID
- `coordinationData`: Coordination data

**Returns**: `CoordinationResult` - Coordination result

#### **Update Coordination Strategy**
```typescript
async updateCoordinationStrategy(
  collaborationId: UUID,
  strategy: CoordinationStrategy
): Promise<CollabEntity>
```

**Parameters**:
- `collaborationId`: Collaboration ID
- `strategy`: New coordination strategy

**Returns**: `CollabEntity` - Updated collaboration entity

## 🌐 **Protocol Interface APIs**

### **CollabProtocol**

#### **Execute Operation**
```typescript
async executeOperation(request: MLPPRequest): Promise<MLPPResponse>
```

**Supported Operations**:
- `create`: Create collaboration
- `update`: Update collaboration
- `delete`: Delete collaboration
- `get`: Get collaboration
- `list`: List collaborations
- `start`: Start collaboration
- `stop`: Stop collaboration
- `add_participant`: Add participant
- `remove_participant`: Remove participant
- `batch_create`: Batch create collaborations
- `search`: Search collaborations
- `health_check`: Health check

#### **Create Operation Example**
```typescript
const response = await protocol.executeOperation({
  operation: 'create',
  protocolVersion: '1.0.0',
  payload: {
    collaborationData: {
      contextId: 'ctx-001',
      planId: 'plan-001',
      name: 'Protocol Collaboration',
      mode: 'parallel',
      coordinationStrategy: {
        type: 'hierarchical',
        decisionMaking: 'majority'
      },
      participants: [],
      createdBy: 'protocol-user'
    }
  },
  requestId: 'req-001',
  timestamp: new Date().toISOString()
});
```

#### **Batch Create Operation Example**
```typescript
const response = await protocol.executeOperation({
  operation: 'batch_create',
  protocolVersion: '1.0.0',
  payload: {
    collaborationsData: [
      {
        contextId: 'ctx-001',
        planId: 'plan-001',
        name: 'Batch Collaboration 1',
        mode: 'sequential',
        coordinationStrategy: {
          type: 'centralized',
          decisionMaking: 'coordinator'
        },
        participants: [],
        createdBy: 'batch-user'
      },
      // More collaboration data...
    ]
  },
  requestId: 'batch-req-001',
  timestamp: new Date().toISOString()
});
```

#### **Search Operation Example**
```typescript
const response = await protocol.executeOperation({
  operation: 'search',
  protocolVersion: '1.0.0',
  payload: {
    searchQuery: {
      query: 'keyword',
      filters: {
        mode: 'distributed',
        status: 'active'
      },
      page: 1,
      limit: 20
    }
  },
  requestId: 'search-req-001',
  timestamp: new Date().toISOString()
});
```

## 🔗 **Module Adapter APIs**

### **CollabModuleAdapter**

#### **Context Module Integration**
```typescript
// Create collaboration from context
async createCollaborationFromContext(
  contextId: UUID,
  contextData: Record<string, unknown>,
  userId: string
): Promise<CollabEntity>

// Update collaboration context
async updateCollaborationContext(
  collaborationId: UUID,
  contextUpdates: Record<string, unknown>
): Promise<void>
```

#### **Plan Module Integration**
```typescript
// Create collaboration from plan
async createCollaborationFromPlan(
  planId: UUID,
  planData: Record<string, unknown>,
  userId: string
): Promise<CollabEntity>

// Synchronize plan updates
async synchronizeWithPlanUpdates(
  collaborationId: UUID,
  planUpdates: Record<string, unknown>
): Promise<void>
```

#### **Role Module Integration**
```typescript
// Validate participant roles
async validateParticipantRoles(
  collaborationId: UUID,
  participantRoles: Array<{ agentId: UUID; roleId: UUID }>
): Promise<{
  valid: boolean;
  violations: string[];
  recommendations: string[];
}>

// Update participant roles
async updateParticipantRoles(
  collaborationId: UUID,
  roleUpdates: Array<{ participantId: UUID; newRoleId: UUID }>
): Promise<void>
```

#### **Confirm Module Integration**
```typescript
// Request collaboration approval
async requestCollaborationApproval(
  collaborationId: UUID,
  approvalRequest: Record<string, unknown>
): Promise<{
  approvalId: UUID;
  status: string;
  requiredApprovers: UUID[];
}>

// Process approval response
async processCollaborationApproval(
  collaborationId: UUID,
  approvalResponse: Record<string, unknown>
): Promise<void>
```

#### **Trace Module Integration**
```typescript
// Start collaboration tracing
async startCollaborationTracing(
  collaborationId: UUID,
  tracingConfig: Record<string, unknown>
): Promise<{
  traceId: UUID;
  tracingEnabled: boolean;
}>

// Record trace event
async recordCollaborationTraceEvent(
  collaborationId: UUID,
  traceEvent: Record<string, unknown>
): Promise<void>
```

#### **Extension Module Integration**
```typescript
// Load collaboration extensions
async loadCollaborationExtensions(
  collaborationId: UUID,
  extensionRequirements: string[]
): Promise<{
  loadedExtensions: string[];
  failedExtensions: string[];
}>

// Execute collaboration extension
async executeCollaborationExtension(
  collaborationId: UUID,
  extensionId: string,
  extensionData: Record<string, unknown>
): Promise<Record<string, unknown>>
```

## 📊 **Data Types**

### **CollabEntity**
```typescript
interface CollabEntity {
  id: UUID;
  contextId: UUID;
  planId: UUID;
  name: string;
  description?: string;
  mode: CollaborationMode;
  coordinationStrategy: CoordinationStrategy;
  participants: Participant[];
  status: CollaborationStatus;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  protocolVersion: string;
}
```

### **CoordinationStrategy**
```typescript
interface CoordinationStrategy {
  type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
  decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
  coordinatorId?: UUID;
}
```

### **Participant**
```typescript
interface Participant {
  participantId: UUID;
  agentId: UUID;
  roleId: UUID;
  capabilities: string[];
  status: 'pending' | 'active' | 'inactive' | 'removed';
  joinedAt: Date;
  lastActivity?: Date;
}
```

## ⚠️ **Error Handling**

### **Error Types**
- `COLLABORATION_NOT_FOUND`: Collaboration not found
- `INVALID_COLLABORATION_DATA`: Invalid collaboration data
- `PARTICIPANT_ALREADY_EXISTS`: Participant already exists
- `PARTICIPANT_NOT_FOUND`: Participant not found
- `INVALID_COORDINATION_STRATEGY`: Invalid coordination strategy
- `PROTOCOL_EXECUTION_ERROR`: Protocol execution error

### **Error Response Format**
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## 🔒 **Authentication and Authorization**

### **API Keys**
All API calls require a valid API key.

### **Permission Levels**
- `READ`: Read collaboration information
- `WRITE`: Create and update collaborations
- `DELETE`: Delete collaborations
- `ADMIN`: Administrator permissions

## 📈 **Rate Limiting**

- **Standard Users**: 1000 requests/hour
- **Premium Users**: 10000 requests/hour
- **Enterprise Users**: Unlimited

### **CollabAnalyticsService**

#### **Analyze Collaboration Effectiveness**
```typescript
async analyzeCollaborationEffectiveness(collabId: string): Promise<CollabEffectivenessAnalysis>
```

#### **Generate Performance Report**
```typescript
async generatePerformanceReport(collaborationId: UUID): Promise<CollabPerformanceReport>
```

### **CollabSecurityService**

#### **Validate Access**
```typescript
async validateAccess(userId: string, collaborationId: UUID, action: string): Promise<AccessValidationResult>
```

#### **Perform Governance Check**
```typescript
async performGovernanceCheck(collaborationId: UUID): Promise<GovernanceCheckResult>
```

## 📝 **Versioning**

Current API Version: `v1.0.0`

Version Compatibility:
- Backward compatible changes will not increment major version
- Breaking changes will increment major version
- New features will increment minor version

---

**Last Updated**: 2025-01-27
**API Version**: 1.0.0
