# Collab Module Testing Guide

## 📋 **Testing Overview**

This comprehensive testing guide provides detailed instructions for testing the Collab module, including unit tests, integration tests, protocol tests, and end-to-end tests. The testing strategy ensures enterprise-grade quality and reliability for multi-agent collaboration management.

**Testing Framework**: Jest + TypeScript
**Test Suites**: 10 complete test suites
**Total Tests**: 146 tests (100% passing)
**Quality Standard**: Enterprise-Grade
**Test Philosophy**: Test-Driven Development (TDD)

## 🧪 **Testing Strategy**

### **Testing Pyramid**
```
    /\
   /  \     E2E Tests (10%)
  /____\    - Full workflow testing
 /      \   - User journey validation
/________\  Integration Tests (30%)
           - Module interaction testing
           - Protocol interface testing
           
           Unit Tests (60%)
           - Component isolation testing
           - Business logic validation
```

### **Test Categories (All Implemented)**
1. **Unit Tests**: 5 test suites covering entities, services, controllers, mappers, repositories
2. **Functional Tests**: Complete business logic and workflow testing
3. **Integration Tests**: Full API and service integration testing
4. **Enterprise Tests**: Large-scale collaboration scenario testing
5. **Performance Tests**: 2 performance test suites with benchmarks
6. **Security Tests**: Access control and governance testing (integrated)

## 🔧 **Test Setup**

### **Prerequisites**
```bash
# Install dependencies
npm install

# Install test dependencies
npm install --save-dev jest @types/jest ts-jest

# Install testing utilities
npm install --save-dev @testing-library/jest-dom
```

### **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/modules/collab/**/*.ts',
    '!src/modules/collab/**/*.d.ts',
    '!src/modules/collab/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
};
```

## 🧩 **Unit Testing**

### **Service Testing**
```typescript
// src/modules/collab/__tests__/services/collab-management.service.test.ts
import { CollabManagementService } from '../../application/services/collab-management.service';
import { CollabRepositoryImpl } from '../../infrastructure/repositories/collab.repository.impl';
import { generateUUID } from '../../../../shared/utils';

describe('CollabManagementService', () => {
  let service: CollabManagementService;
  let repository: CollabRepositoryImpl;

  beforeEach(() => {
    repository = new CollabRepositoryImpl();
    service = new CollabManagementService(repository as any);
  });

  describe('createCollaboration', () => {
    it('should create collaboration successfully', async () => {
      const collaborationData = {
        contextId: generateUUID(),
        planId: generateUUID(),
        name: 'Test Collaboration',
        mode: 'distributed' as const,
        coordinationStrategy: {
          type: 'distributed' as const,
          decisionMaking: 'consensus' as const
        },
        participants: [],
        createdBy: 'test-user'
      };

      const result = await service.createCollaboration(collaborationData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Collaboration');
      expect(result.status).toBe('draft');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        contextId: generateUUID(),
        planId: generateUUID(),
        name: '', // Invalid empty name
        mode: 'distributed' as const,
        coordinationStrategy: {
          type: 'distributed' as const,
          decisionMaking: 'consensus' as const
        },
        participants: [],
        createdBy: 'test-user'
      };

      await expect(service.createCollaboration(invalidData))
        .rejects.toThrow('Collaboration name is required');
    });
  });

  describe('getCollaboration', () => {
    it('should retrieve collaboration by ID', async () => {
      const created = await service.createCollaboration({
        contextId: generateUUID(),
        planId: generateUUID(),
        name: 'Retrieve Test',
        mode: 'sequential',
        coordinationStrategy: {
          type: 'centralized',
          decisionMaking: 'coordinator'
        },
        participants: [],
        createdBy: 'test-user'
      });

      const retrieved = await service.getCollaboration(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Retrieve Test');
    });

    it('should return null for non-existent collaboration', async () => {
      const nonExistentId = generateUUID();
      const result = await service.getCollaboration(nonExistentId);

      expect(result).toBeNull();
    });
  });
});
```

### **Entity Testing**
```typescript
// src/modules/collab/__tests__/entities/collab.entity.test.ts
import { CollabEntity } from '../../domain/entities/collab.entity';
import { generateUUID } from '../../../../shared/utils';

describe('CollabEntity', () => {
  let collaboration: CollabEntity;

  beforeEach(() => {
    collaboration = new CollabEntity({
      id: generateUUID(),
      contextId: generateUUID(),
      planId: generateUUID(),
      name: 'Test Collaboration',
      mode: 'hybrid',
      coordinationStrategy: {
        type: 'hierarchical',
        decisionMaking: 'majority'
      },
      participants: [],
      status: 'draft',
      createdBy: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      protocolVersion: '1.0.0'
    });
  });

  describe('participant management', () => {
    it('should add participant successfully', () => {
      const participant = {
        participantId: generateUUID(),
        agentId: generateUUID(),
        roleId: generateUUID(),
        capabilities: ['analysis'],
        status: 'pending' as const,
        joinedAt: new Date()
      };

      collaboration.addParticipant(participant);

      expect(collaboration.participants).toHaveLength(1);
      expect(collaboration.participants[0]).toEqual(participant);
    });

    it('should prevent duplicate participants', () => {
      const agentId = generateUUID();
      const participant1 = {
        participantId: generateUUID(),
        agentId,
        roleId: generateUUID(),
        capabilities: ['analysis'],
        status: 'pending' as const,
        joinedAt: new Date()
      };

      const participant2 = {
        participantId: generateUUID(),
        agentId, // Same agent ID
        roleId: generateUUID(),
        capabilities: ['coordination'],
        status: 'pending' as const,
        joinedAt: new Date()
      };

      collaboration.addParticipant(participant1);

      expect(() => collaboration.addParticipant(participant2))
        .toThrow('Agent is already a participant');
    });
  });

  describe('status transitions', () => {
    it('should allow valid status transitions', () => {
      expect(collaboration.status).toBe('draft');

      collaboration.start('test-user');
      expect(collaboration.status).toBe('active');

      collaboration.pause('test-user');
      expect(collaboration.status).toBe('paused');

      collaboration.resume('test-user');
      expect(collaboration.status).toBe('active');

      collaboration.complete('test-user');
      expect(collaboration.status).toBe('completed');
    });

    it('should prevent invalid status transitions', () => {
      collaboration.complete('test-user');
      expect(collaboration.status).toBe('completed');

      expect(() => collaboration.start('test-user'))
        .toThrow('Cannot start completed collaboration');
    });
  });
});
```

## 🔗 **Integration Testing**

### **Module Integration Testing**
```typescript
// src/modules/collab/__tests__/integration/collab-module.integration.test.ts
import { CollabModule } from '../../module';
import { generateUUID } from '../../../../shared/utils';

describe('Collab Module Integration', () => {
  let collabModule: CollabModule;

  beforeAll(async () => {
    collabModule = CollabModule.getInstance();
    await collabModule.start();
  });

  afterAll(async () => {
    await collabModule.stop();
  });

  describe('service integration', () => {
    it('should integrate management and coordination services', async () => {
      const managementService = collabModule.getCollabManagementService();
      const coordinationService = collabModule.getCollabCoordinationService();

      // Create collaboration via management service
      const collaboration = await managementService.createCollaboration({
        contextId: generateUUID(),
        planId: generateUUID(),
        name: 'Integration Test',
        mode: 'distributed',
        coordinationStrategy: {
          type: 'distributed',
          decisionMaking: 'consensus'
        },
        participants: [],
        createdBy: 'integration-test'
      });

      // Coordinate via coordination service
      const coordinationResult = await coordinationService.coordinateCollaboration(
        collaboration.id,
        {
          action: 'initialize',
          participants: collaboration.participants
        }
      );

      expect(coordinationResult).toBeDefined();
      expect(coordinationResult.success).toBe(true);
    });
  });

  describe('MPLP module integration', () => {
    it('should integrate with Context module', async () => {
      const adapter = collabModule.getCollabModuleAdapter();
      
      const contextData = {
        name: 'Context Integration Test',
        description: 'Testing context integration'
      };

      const collaboration = await adapter.createCollaborationFromContext(
        generateUUID(),
        contextData,
        'integration-test'
      );

      expect(collaboration).toBeDefined();
      expect(collaboration.name).toBe('Context Integration Test');
    });

    it('should integrate with Role module', async () => {
      const adapter = collabModule.getCollabModuleAdapter();
      const managementService = collabModule.getCollabManagementService();

      // Create test collaboration
      const collaboration = await managementService.createCollaboration({
        contextId: generateUUID(),
        planId: generateUUID(),
        name: 'Role Integration Test',
        mode: 'hierarchical',
        coordinationStrategy: {
          type: 'hierarchical',
          decisionMaking: 'weighted'
        },
        participants: [],
        createdBy: 'integration-test'
      });

      // Test role validation
      const participantRoles = [
        { agentId: generateUUID(), roleId: generateUUID() }
      ];

      const validation = await adapter.validateParticipantRoles(
        collaboration.id,
        participantRoles
      );

      expect(validation).toBeDefined();
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.violations)).toBe(true);
      expect(Array.isArray(validation.recommendations)).toBe(true);
    });
  });
});
```

## 🌐 **Protocol Testing**

### **Protocol Interface Testing**
```typescript
// src/modules/collab/__tests__/protocols/collab.protocol.test.ts
import { CollabProtocol } from '../../infrastructure/protocols/collab.protocol';
import { generateUUID } from '../../../../shared/utils';

describe('CollabProtocol', () => {
  let protocol: CollabProtocol;

  beforeEach(() => {
    // Setup with mocked dependencies
    protocol = setupMockedProtocol();
  });

  describe('executeOperation', () => {
    it('should handle create operation', async () => {
      const request = {
        operation: 'create',
        protocolVersion: '1.0.0',
        payload: {
          collaborationData: {
            contextId: generateUUID(),
            planId: generateUUID(),
            name: 'Protocol Test',
            mode: 'parallel',
            coordinationStrategy: {
              type: 'hierarchical',
              decisionMaking: 'majority'
            },
            participants: [],
            createdBy: 'protocol-test'
          }
        },
        requestId: generateUUID(),
        timestamp: new Date().toISOString()
      };

      const response = await protocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result).toBeDefined();
      expect(response.protocolVersion).toBe('1.0.0');
      expect(response.requestId).toBe(request.requestId);
    });

    it('should handle batch_create operation', async () => {
      const request = {
        operation: 'batch_create',
        protocolVersion: '1.0.0',
        payload: {
          collaborationsData: [
            {
              contextId: generateUUID(),
              planId: generateUUID(),
              name: 'Batch Test 1',
              mode: 'sequential',
              coordinationStrategy: {
                type: 'centralized',
                decisionMaking: 'coordinator'
              },
              participants: [],
              createdBy: 'batch-test'
            },
            {
              contextId: generateUUID(),
              planId: generateUUID(),
              name: 'Batch Test 2',
              mode: 'mesh',
              coordinationStrategy: {
                type: 'peer_to_peer',
                decisionMaking: 'consensus'
              },
              participants: [],
              createdBy: 'batch-test'
            }
          ]
        },
        requestId: generateUUID(),
        timestamp: new Date().toISOString()
      };

      const response = await protocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result?.batchResults).toBeDefined();
      expect(response.result?.batchResults?.successful).toHaveLength(2);
      expect(response.result?.batchResults?.failed).toHaveLength(0);
    });

    it('should handle invalid operations', async () => {
      const request = {
        operation: 'invalid_operation',
        protocolVersion: '1.0.0',
        payload: {},
        requestId: generateUUID(),
        timestamp: new Date().toISOString()
      };

      const response = await protocol.executeOperation(request);

      expect(response.status).toBe('error');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe('PROTOCOL_EXECUTION_ERROR');
    });
  });

  describe('health check', () => {
    it('should return health status', async () => {
      const health = await protocol.healthCheck();

      expect(health).toBeDefined();
      expect(health.status).toMatch(/healthy|degraded|unhealthy/);
      expect(health.timestamp).toBeDefined();
      expect(Array.isArray(health.checks)).toBe(true);
    });
  });
});
```

## 🚀 **End-to-End Testing**

### **Complete Workflow Testing**
```typescript
// src/modules/collab/__tests__/e2e/collaboration-workflow.e2e.test.ts
describe('Collaboration Workflow E2E', () => {
  let collabModule: CollabModule;

  beforeAll(async () => {
    collabModule = CollabModule.getInstance();
    await collabModule.start();
  });

  afterAll(async () => {
    await collabModule.stop();
  });

  it('should complete full collaboration lifecycle', async () => {
    const managementService = collabModule.getCollabManagementService();
    
    // 1. Create collaboration
    const collaboration = await managementService.createCollaboration({
      contextId: generateUUID(),
      planId: generateUUID(),
      name: 'E2E Test Collaboration',
      mode: 'hybrid',
      coordinationStrategy: {
        type: 'distributed',
        decisionMaking: 'consensus'
      },
      participants: [],
      createdBy: 'e2e-test'
    });

    expect(collaboration.status).toBe('draft');

    // 2. Add participants
    const participant1 = {
      agentId: generateUUID(),
      roleId: generateUUID(),
      capabilities: ['analysis', 'coordination']
    };

    const updatedCollab1 = await managementService.addParticipant(
      collaboration.id,
      participant1,
      'e2e-test'
    );

    expect(updatedCollab1.participants).toHaveLength(1);

    // 3. Start collaboration
    const startedCollab = await managementService.startCollaboration(
      collaboration.id,
      'e2e-test'
    );

    expect(startedCollab.status).toBe('active');

    // 4. Update collaboration
    const updatedCollab2 = await managementService.updateCollaboration(
      collaboration.id,
      {
        description: 'Updated during E2E test',
        updatedBy: 'e2e-test'
      }
    );

    expect(updatedCollab2.description).toBe('Updated during E2E test');

    // 5. Complete collaboration
    const completedCollab = await managementService.stopCollaboration(
      collaboration.id,
      'e2e-test'
    );

    expect(completedCollab.status).toBe('completed');

    // 6. Verify final state
    const finalCollab = await managementService.getCollaboration(collaboration.id);
    expect(finalCollab?.status).toBe('completed');
    expect(finalCollab?.participants).toHaveLength(1);
    expect(finalCollab?.description).toBe('Updated during E2E test');
  });
});
```

## 📊 **Performance Testing**

### **Load Testing**
```typescript
// src/modules/collab/__tests__/performance/load.test.ts
describe('Collab Module Performance', () => {
  it('should handle concurrent collaboration creation', async () => {
    const collabModule = CollabModule.getInstance();
    await collabModule.start();

    const managementService = collabModule.getCollabManagementService();
    const concurrentRequests = 50;

    const startTime = Date.now();

    const promises = Array.from({ length: concurrentRequests }, (_, i) =>
      managementService.createCollaboration({
        contextId: generateUUID(),
        planId: generateUUID(),
        name: `Load Test ${i}`,
        mode: 'distributed',
        coordinationStrategy: {
          type: 'distributed',
          decisionMaking: 'consensus'
        },
        participants: [],
        createdBy: 'load-test'
      })
    );

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(results).toHaveLength(concurrentRequests);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    await collabModule.stop();
  });
});
```

## 🔒 **Security Testing**

### **Input Validation Testing**
```typescript
// src/modules/collab/__tests__/security/validation.test.ts
describe('Security Validation', () => {
  let managementService: CollabManagementService;

  beforeEach(() => {
    const repository = new CollabRepositoryImpl();
    managementService = new CollabManagementService(repository as any);
  });

  it('should prevent SQL injection attempts', async () => {
    const maliciousData = {
      contextId: generateUUID(),
      planId: generateUUID(),
      name: "'; DROP TABLE collaborations; --",
      mode: 'distributed' as const,
      coordinationStrategy: {
        type: 'distributed' as const,
        decisionMaking: 'consensus' as const
      },
      participants: [],
      createdBy: 'security-test'
    };

    // Should not throw SQL injection error, but handle as normal string
    const result = await managementService.createCollaboration(maliciousData);
    expect(result.name).toBe("'; DROP TABLE collaborations; --");
  });

  it('should validate UUID formats', async () => {
    const invalidData = {
      contextId: 'invalid-uuid',
      planId: generateUUID(),
      name: 'UUID Test',
      mode: 'distributed' as const,
      coordinationStrategy: {
        type: 'distributed' as const,
        decisionMaking: 'consensus' as const
      },
      participants: [],
      createdBy: 'security-test'
    };

    await expect(managementService.createCollaboration(invalidData))
      .rejects.toThrow('Invalid UUID format');
  });
});
```

## 📈 **Test Execution**

### **Running Tests**
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern=collab

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test src/modules/collab/__tests__/services/collab-management.service.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with verbose output
npm test -- --verbose
```

### **Coverage Reports**
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 📊 **Test Quality Metrics**

### **Coverage Targets**
- **Unit Tests**: ≥90% line coverage
- **Integration Tests**: ≥80% feature coverage
- **Protocol Tests**: 100% operation coverage
- **E2E Tests**: 100% workflow coverage

### **Quality Gates**
- All tests must pass
- Coverage targets must be met
- No test flakiness allowed
- Performance benchmarks must be met

---

**Testing Guide Version**: 1.0.0  
**Last Updated**: 2025-08-28  
**Testing Framework**: Jest + TypeScript  
**Quality Standard**: Enterprise-Grade  
**Maintainer**: MPLP Development Team
