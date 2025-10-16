# MPLP 테스트 스위트

> **🌐 언어 내비게이션**: [English](../../en/testing/test-suites.md) | [中文](../../zh-CN/testing/test-suites.md) | [日本語](../../ja/testing/test-suites.md) | [한국어](test-suites.md) | [Español](../../es/testing/test-suites.md) | [Français](../../fr/testing/test-suites.md) | [Русский](../../ru/testing/test-suites.md) | [Deutsch](../../de/testing/test-suites.md)



**멀티 에이전트 프로토콜 라이프사이클 플랫폼 - 테스트 스위트 v1.0.0-alpha**

[![테스트 스위트](https://img.shields.io/badge/test%20suites-2869%2F2869%20Pass-brightgreen.svg)](./README.md)
[![커버리지](https://img.shields.io/badge/coverage-Enterprise%20Grade-brightgreen.svg)](./protocol-compliance-testing.md)
[![CI/CD](https://img.shields.io/badge/ci%2Fcd-Production%20Ready-brightgreen.svg)](../implementation/deployment-models.md)
[![구현](https://img.shields.io/badge/implementation-10%2F10%20Modules-brightgreen.svg)](./README.md)
[![언어](https://img.shields.io/badge/language-English-blue.svg)](../zh-CN/testing/test-suites.md)

---

## 🎯 테스트 스위트 개요

이 가이드는 단위 테스트, 통합 테스트, 시스템 테스트, 그리고 프로토콜 준수, 성능 및 보안 검증을 위한 전문 테스트 스위트를 포함하여 MPLP의 포괄적인 자동화 테스트 스위트를 제공합니다. 모든 테스트 스위트는 지속적 통합과 자동 실행을 위해 설계되었습니다.

### **테스트 스위트 카테고리**
- **단위 테스트 스위트**: 개별 컴포넌트 및 함수 테스트
- **통합 테스트 스위트**: 모듈 상호작용 및 워크플로우 테스트
- **시스템 테스트 스위트**: 엔드투엔드 시스템 동작 검증
- **준수 테스트 스위트**: 프로토콜 및 규제 준수 검증
- **성능 테스트 스위트**: 부하, 스트레스 및 확장성 테스트
- **보안 테스트 스위트**: 취약성 및 보안 검증

### **테스트 자동화 표준**
- **100% 자동 실행**: 모든 테스트는 수동 개입 없이 실행
- **CI/CD 통합**: 배포 파이프라인과의 원활한 통합
- **병렬 실행**: 빠른 피드백과 효율성을 위해 최적화
- **포괄적 보고**: 상세한 테스트 결과 및 커버리지 보고서
- **장애 분석**: 자동화된 장애 감지 및 근본 원인 분석

---

## 🧪 핵심 테스트 스위트

### **단위 테스트 스위트**

#### **Context 모듈 단위 테스트 스위트**
```typescript
// Context 모듈 포괄적 단위 테스트 스위트
describe('Context Module Unit Test Suite', () => {
  let contextService: ContextService;
  let contextRepository: ContextRepository;
  let contextMapper: ContextMapper;
  let mockDatabase: MockDatabase;
  let mockCache: MockCache;

  beforeEach(() => {
    mockDatabase = new MockDatabase();
    mockCache = new MockCache();
    contextRepository = new ContextRepository(mockDatabase);
    contextMapper = new ContextMapper();
    contextService = new ContextService(contextRepository, mockCache, contextMapper);
  });

  describe('Context Creation Unit Tests', () => {
    it('should create context with valid input', async () => {
      const createRequest = {
        contextId: 'ctx-unit-test-001',
        contextType: 'unit_test',
        contextData: { testData: 'unit test data' },
        createdBy: 'unit-test-suite'
      };

      const result = await contextService.createContext(createRequest);

      expect(result).toBeDefined();
      expect(result.contextId).toBe(createRequest.contextId);
      expect(result.contextType).toBe(createRequest.contextType);
      expect(result.contextStatus).toBe('active');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdBy).toBe(createRequest.createdBy);
    });

    it('should validate input parameters', async () => {
      const invalidRequests = [
        { contextId: '', contextType: 'test', contextData: {}, createdBy: 'test' },
        { contextId: 'ctx-001', contextType: '', contextData: {}, createdBy: 'test' },
        { contextId: 'ctx-001', contextType: 'test', contextData: {}, createdBy: '' },
        { contextId: 'invalid-format', contextType: 'test', contextData: {}, createdBy: 'test' }
      ];

      for (const request of invalidRequests) {
        await expect(contextService.createContext(request)).rejects.toThrow();
      }
    });

    it('should handle duplicate context ID', async () => {
      const createRequest = {
        contextId: 'ctx-duplicate-test',
        contextType: 'test',
        contextData: {},
        createdBy: 'test'
      };

      // Create first context
      await contextService.createContext(createRequest);

      // Attempt to create duplicate
      await expect(contextService.createContext(createRequest))
        .rejects.toThrow('Context already exists');
    });

    it('should apply dual naming convention mapping', async () => {
      const schemaRequest = {
        context_id: 'ctx-naming-test-001',
        context_type: 'naming_test',
        context_data: { test_field: 'test_value' },
        created_by: 'naming-test'
      };

      const mappedRequest = contextMapper.fromSchema(schemaRequest);
      expect(mappedRequest.contextId).toBe(schemaRequest.context_id);
      expect(mappedRequest.contextType).toBe(schemaRequest.context_type);
      expect(mappedRequest.contextData.testField).toBe(schemaRequest.context_data.test_field);
      expect(mappedRequest.createdBy).toBe(schemaRequest.created_by);

      const result = await contextService.createContext(mappedRequest);
      const schemaResult = contextMapper.toSchema(result);
      expect(schemaResult.context_id).toBe(result.contextId);
      expect(schemaResult.context_type).toBe(result.contextType);
      expect(schemaResult.created_by).toBe(result.createdBy);
    });
  });

  describe('Context Query Unit Tests', () => {
    beforeEach(async () => {
      // Pre-populate test data
      await this.createTestContexts(10);
    });

    it('should retrieve context by ID', async () => {
      const contextId = 'ctx-query-test-001';
      const context = await contextService.getContext(contextId);

      expect(context).toBeDefined();
      expect(context.contextId).toBe(contextId);
    });

    it('should return null for non-existent context', async () => {
      const context = await contextService.getContext('non-existent-context');
      expect(context).toBeNull();
    });

    it('should search contexts with filters', async () => {
      const searchResults = await contextService.searchContexts({
        contextType: 'unit_test',
        limit: 5,
        offset: 0
      });

      expect(searchResults).toBeDefined();
      expect(searchResults.results).toHaveLength(5);
      expect(searchResults.totalCount).toBeGreaterThan(0);
      expect(searchResults.pagination).toBeDefined();
    });

    it('should validate search parameters', async () => {
      const invalidSearches = [
        { limit: -1 },
        { limit: 1001 }, // Exceeds max limit
        { offset: -1 },
        { sortBy: 'invalid_field' }
      ];

      for (const search of invalidSearches) {
        await expect(contextService.searchContexts(search)).rejects.toThrow();
      }
    });
  });

  describe('Context Update Unit Tests', () => {
    let existingContext: ContextEntity;

    beforeEach(async () => {
      existingContext = await contextService.createContext({
        contextId: 'ctx-update-test-001',
        contextType: 'update_test',
        contextData: { originalData: 'original' },
        createdBy: 'update-test'
      });
    });

    it('should update context data', async () => {
      const updateRequest = {
        contextData: { updatedData: 'updated', newField: 'new' },
        updatedBy: 'update-test'
      };

      const updatedContext = await contextService.updateContext(
        existingContext.contextId,
        updateRequest
      );

      expect(updatedContext.contextData.updatedData).toBe('updated');
      expect(updatedContext.contextData.newField).toBe('new');
      expect(updatedContext.updatedAt).toBeInstanceOf(Date);
      expect(updatedContext.updatedBy).toBe('update-test');
    });

    it('should validate update permissions', async () => {
      const updateRequest = {
        contextData: { maliciousData: 'malicious' },
        updatedBy: 'unauthorized-user'
      };

      // Mock authorization failure
      mockDatabase.setAuthorizationResult(false);

      await expect(contextService.updateContext(
        existingContext.contextId,
        updateRequest
      )).rejects.toThrow('Unauthorized');
    });

    it('should handle concurrent updates', async () => {
      const updatePromises = Array.from({ length: 5 }, (_, i) =>
        contextService.updateContext(existingContext.contextId, {
          contextData: { concurrentUpdate: i },
          updatedBy: `concurrent-user-${i}`
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful).toHaveLength(1); // Only one should succeed
      expect(failed).toHaveLength(4); // Others should fail due to optimistic locking
    });
  });

  describe('Context Deletion Unit Tests', () => {
    let existingContext: ContextEntity;

    beforeEach(async () => {
      existingContext = await contextService.createContext({
        contextId: 'ctx-delete-test-001',
        contextType: 'delete_test',
        contextData: { testData: 'to be deleted' },
        createdBy: 'delete-test'
      });
    });

    it('should delete existing context', async () => {
      await contextService.deleteContext(existingContext.contextId);

      const deletedContext = await contextService.getContext(existingContext.contextId);
      expect(deletedContext).toBeNull();
    });

    it('should handle deletion of non-existent context', async () => {
      await expect(contextService.deleteContext('non-existent-context'))
        .rejects.toThrow('Context not found');
    });

    it('should validate deletion permissions', async () => {
      // Mock authorization failure
      mockDatabase.setAuthorizationResult(false);

      await expect(contextService.deleteContext(existingContext.contextId))
        .rejects.toThrow('Unauthorized');
    });

    it('should handle cascade deletion', async () => {
      // Create dependent resources
      await this.createDependentResources(existingContext.contextId);

      await contextService.deleteContext(existingContext.contextId);

      // Verify dependent resources are also deleted
      const dependentResources = await this.getDependentResources(existingContext.contextId);
      expect(dependentResources).toHaveLength(0);
    });
  });

  // Helper methods
  private async createTestContexts(count: number): Promise<void> {
    const promises = Array.from({ length: count }, (_, i) =>
      contextService.createContext({
        contextId: `ctx-query-test-${String(i + 1).padStart(3, '0')}`,
        contextType: 'unit_test',
        contextData: { testIndex: i },
        createdBy: 'unit-test-suite'
      })
    );

    await Promise.all(promises);
  }

  private async createDependentResources(contextId: string): Promise<void> {
    // Mock creation of dependent resources (plans, traces, etc.)
    await mockDatabase.insert('plans', { contextId, planId: 'plan-001' });
    await mockDatabase.insert('traces', { contextId, traceId: 'trace-001' });
  }

  private async getDependentResources(contextId: string): Promise<any[]> {
    const plans = await mockDatabase.find('plans', { contextId });
    const traces = await mockDatabase.find('traces', { contextId });
    return [...plans, ...traces];
  }
});
```

### **통합 테스트 스위트**

#### **멀티 모듈 통합 테스트 스위트**
```typescript
// 멀티 모듈 통합 테스트 스위트
describe('Multi-Module Integration Test Suite', () => {
  let testEnvironment: TestEnvironment;
  let contextService: ContextService;
  let planService: PlanService;
  let roleService: RoleService;
  let confirmService: ConfirmService;
  let traceService: TraceService;

  beforeAll(async () => {
    testEnvironment = await TestEnvironment.setup({
      modules: ['context', 'plan', 'role', 'confirm', 'trace'],
      database: 'test',
      cache: 'test',
      messageQueue: 'test'
    });

    contextService = testEnvironment.getService('context');
    planService = testEnvironment.getService('plan');
    roleService = testEnvironment.getService('role');
    confirmService = testEnvironment.getService('confirm');
    traceService = testEnvironment.getService('trace');
  });

  afterAll(async () => {
    await testEnvironment.teardown();
  });

  describe('Context-Plan Integration', () => {
    it('should create plan with valid context', async () => {
      // Create context
      const context = await contextService.createContext({
        contextId: 'ctx-integration-001',
        contextType: 'integration_test',
        contextData: { testType: 'context-plan-integration' },
        createdBy: 'integration-test'
      });

      // Create plan with context
      const plan = await planService.createPlan({
        planId: 'plan-integration-001',
        contextId: context.contextId,
        planType: 'automated_workflow',
        planSteps: [
          { stepId: 'step-001', operation: 'data_processing', estimatedDuration: 30 },
          { stepId: 'step-002', operation: 'validation', estimatedDuration: 15 }
        ],
        createdBy: 'integration-test'
      });

      expect(plan.contextId).toBe(context.contextId);
      expect(plan.planSteps).toHaveLength(2);

      // Verify context-plan relationship
      const contextPlans = await planService.getPlansByContext(context.contextId);
      expect(contextPlans).toContain(plan.planId);
    });

    it('should reject plan creation with invalid context', async () => {
      await expect(planService.createPlan({
        planId: 'plan-invalid-context',
        contextId: 'non-existent-context',
        planType: 'automated_workflow',
        planSteps: [],
        createdBy: 'integration-test'
      })).rejects.toThrow('Context not found');
    });
  });

  describe('Role-Based Access Control Integration', () => {
    it('should enforce role-based access across modules', async () => {
      // Create user with limited role
      const user = await roleService.createUser({
        userId: 'user-rbac-test',
        username: 'rbac-test-user',
        roles: ['viewer']
      });

      // Create context as admin
      const context = await contextService.createContext({
        contextId: 'ctx-rbac-test',
        contextType: 'rbac_test',
        contextData: { sensitive: true },
        createdBy: 'admin'
      });

      // User should be able to read context
      const readResult = await contextService.getContext(context.contextId, {
        userId: user.userId
      });
      expect(readResult).toBeDefined();

      // User should not be able to update context
      await expect(contextService.updateContext(context.contextId, {
        contextData: { modified: true },
        updatedBy: user.userId
      }, { userId: user.userId })).rejects.toThrow('Insufficient privileges');

      // User should not be able to delete context
      await expect(contextService.deleteContext(context.contextId, {
        userId: user.userId
      })).rejects.toThrow('Insufficient privileges');
    });
  });

  describe('Approval Workflow Integration', () => {
    it('should integrate approval workflow with plan execution', async () => {
      // Create context and plan
      const context = await contextService.createContext({
        contextId: 'ctx-approval-test',
        contextType: 'approval_test',
        contextData: { requiresApproval: true },
        createdBy: 'integration-test'
      });

      const plan = await planService.createPlan({
        planId: 'plan-approval-test',
        contextId: context.contextId,
        planType: 'approval_required_workflow',
        planSteps: [
          { stepId: 'step-001', operation: 'sensitive_operation', requiresApproval: true }
        ],
        createdBy: 'integration-test'
      });

      // Request approval
      const approvalRequest = await confirmService.requestApproval({
        approvalId: 'approval-integration-test',
        contextId: context.contextId,
        planId: plan.planId,
        approvalType: 'plan_execution',
        requestedBy: 'integration-test',
        approvers: ['approver-001'],
        approvalData: {
          operation: 'sensitive_operation',
          impact: 'high',
          justification: 'Integration test'
        }
      });

      expect(approvalRequest.approvalStatus).toBe('pending');

      // Approve the request
      const approval = await confirmService.processApproval({
        approvalId: approvalRequest.approvalId,
        approverId: 'approver-001',
        decision: 'approved',
        comments: 'Integration test approval'
      });

      expect(approval.approvalStatus).toBe('approved');

      // Execute plan (should now be allowed)
      const executionResult = await planService.executePlan(plan.planId);
      expect(executionResult.executionStatus).toBe('completed');
    });
  });

  describe('Distributed Tracing Integration', () => {
    it('should create distributed trace across modules', async () => {
      const traceId = 'trace-integration-001';

      // Start trace
      const trace = await traceService.startTrace({
        traceId: traceId,
        traceType: 'integration_test',
        operation: 'multi_module_workflow',
        startedBy: 'integration-test'
      });

      // Create context with trace
      const context = await contextService.createContext({
        contextId: 'ctx-trace-test',
        contextType: 'trace_test',
        contextData: { traceId: traceId },
        createdBy: 'integration-test'
      }, { traceId: traceId });

      // Create plan with trace
      const plan = await planService.createPlan({
        planId: 'plan-trace-test',
        contextId: context.contextId,
        planType: 'traced_workflow',
        planSteps: [{ stepId: 'step-001', operation: 'traced_operation' }],
        createdBy: 'integration-test'
      }, { traceId: traceId });

      // Execute plan with trace
      await planService.executePlan(plan.planId, { traceId: traceId });

      // End trace
      await traceService.endTrace(traceId);

      // Verify trace spans
      const traceData = await traceService.getTrace(traceId);
      expect(traceData.spans).toHaveLength(4); // start, context, plan, execution
      expect(traceData.spans.map(s => s.operation)).toContain('create_context');
      expect(traceData.spans.map(s => s.operation)).toContain('create_plan');
      expect(traceData.spans.map(s => s.operation)).toContain('execute_plan');
    });
  });
});
```

---

## 🚀 자동화된 테스트 실행

### **CI/CD 테스트 파이프라인 구성**

#### **GitHub Actions 테스트 워크플로우**
```yaml
# .github/workflows/test-suites.yml
name: MPLP Test Suites

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

env:
  NODE_VERSION: '18'
  POSTGRES_VERSION: '15'
  REDIS_VERSION: '7'

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        module: [context, plan, role, confirm, trace, extension, dialog, collab, network, core]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests for ${{ matrix.module }}
        run: npm run test:unit:${{ matrix.module }}
        env:
          CI: true
          NODE_ENV: test

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/${{ matrix.module }}/lcov.info
          flags: unit-tests,${{ matrix.module }}

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:${{ env.POSTGRES_VERSION }}
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: mplp_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:${{ env.REDIS_VERSION }}
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        run: npm run db:setup:test
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/mplp_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          CI: true
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/mplp_test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/integration/lcov.info
          flags: integration-tests

  system-tests:
    name: System Tests
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Start test environment
        run: docker-compose -f docker-compose.test.yml up -d

      - name: Wait for services
        run: npm run wait-for-services

      - name: Run system tests
        run: npm run test:system
        env:
          CI: true
          NODE_ENV: test
          MPLP_API_URL: http://localhost:3000
          MPLP_WS_URL: ws://localhost:3001

      - name: Cleanup test environment
        if: always()
        run: docker-compose -f docker-compose.test.yml down

  compliance-tests:
    name: Compliance Tests
    runs-on: ubuntu-latest
    needs: [system-tests]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run protocol compliance tests
        run: npm run test:compliance:protocol

      - name: Run security compliance tests
        run: npm run test:compliance:security

      - name: Run performance compliance tests
        run: npm run test:compliance:performance

      - name: Generate compliance report
        run: npm run generate:compliance-report

      - name: Upload compliance report
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: reports/compliance/

  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    needs: [system-tests]
    if: github.event_name == 'schedule' || contains(github.event.head_commit.message, '[perf-test]')
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup performance test environment
        run: docker-compose -f docker-compose.perf.yml up -d

      - name: Run performance benchmarks
        run: npm run test:performance
        env:
          PERFORMANCE_TEST_DURATION: 300 # 5 minutes
          PERFORMANCE_TEST_CONCURRENCY: 50

      - name: Generate performance report
        run: npm run generate:performance-report

      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: reports/performance/

  security-tests:
    name: Security Tests
    runs-on: ubuntu-latest
    needs: [system-tests]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security tests
        run: npm run test:security

      - name: Run OWASP ZAP scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: 'http://localhost:3000'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'

      - name: Generate security report
        run: npm run generate:security-report

      - name: Upload security report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: reports/security/
```

### **테스트 스위트 관리**

#### **테스트 스위트 구성**
```typescript
// 테스트 스위트 구성 및 관리
export interface TestSuiteConfig {
  name: string;
  type: 'unit' | 'integration' | 'system' | 'compliance' | 'performance' | 'security';
  modules: string[];
  environment: TestEnvironmentConfig;
  execution: TestExecutionConfig;
  reporting: TestReportingConfig;
}

export class TestSuiteManager {
  private readonly testSuites: Map<string, TestSuite>;
  private readonly testRunner: TestRunner;
  private readonly reportGenerator: TestReportGenerator;

  constructor() {
    this.testSuites = new Map();
    this.testRunner = new TestRunner();
    this.reportGenerator = new TestReportGenerator();
    this.loadTestSuites();
  }

  async runTestSuite(suiteName: string, options: TestRunOptions = {}): Promise<TestSuiteResult> {
    const suite = this.testSuites.get(suiteName);
    if (!suite) {
      throw new Error(`Test suite not found: ${suiteName}`);
    }

    const startTime = Date.now();

    try {
      // Setup test environment
      await this.setupTestEnvironment(suite.config.environment);

      // Execute test suite
      const result = await this.testRunner.execute(suite, options);

      // Generate reports
      const report = await this.reportGenerator.generate(result, suite.config.reporting);

      return {
        suiteName: suiteName,
        startTime: new Date(startTime),
        endTime: new Date(),
        duration: Date.now() - startTime,
        result: result,
        report: report
      };

    } finally {
      // Cleanup test environment
      await this.cleanupTestEnvironment(suite.config.environment);
    }
  }

  async runAllTestSuites(options: TestRunOptions = {}): Promise<TestSuiteResults> {
    const results: TestSuiteResult[] = [];
    const startTime = Date.now();

    for (const [suiteName, suite] of this.testSuites) {
      if (options.suiteFilter && !options.suiteFilter.includes(suiteName)) {
        continue;
      }

      try {
        const result = await this.runTestSuite(suiteName, options);
        results.push(result);
      } catch (error) {
        results.push({
          suiteName: suiteName,
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          result: { success: false, error: error.message },
          report: null
        });
      }
    }

    return {
      startTime: new Date(startTime),
      endTime: new Date(),
      totalDuration: Date.now() - startTime,
      totalSuites: results.length,
      passedSuites: results.filter(r => r.result.success).length,
      failedSuites: results.filter(r => !r.result.success).length,
      results: results,
      overallReport: await this.reportGenerator.generateOverallReport(results)
    };
  }

  private loadTestSuites(): void {
    const suiteConfigs: TestSuiteConfig[] = [
      {
        name: 'unit-tests',
        type: 'unit',
        modules: ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'network', 'core'],
        environment: { type: 'isolated', database: 'mock', cache: 'mock' },
        execution: { parallel: true, timeout: 300000 },
        reporting: { format: 'junit', coverage: true }
      },
      {
        name: 'integration-tests',
        type: 'integration',
        modules: ['context', 'plan', 'role', 'confirm', 'trace'],
        environment: { type: 'containerized', database: 'postgres', cache: 'redis' },
        execution: { parallel: false, timeout: 600000 },
        reporting: { format: 'junit', coverage: true }
      },
      {
        name: 'system-tests',
        type: 'system',
        modules: ['all'],
        environment: { type: 'full-stack', database: 'postgres', cache: 'redis', messageQueue: 'rabbitmq' },
        execution: { parallel: false, timeout: 1800000 },
        reporting: { format: 'html', screenshots: true }
      },
      {
        name: 'compliance-tests',
        type: 'compliance',
        modules: ['all'],
        environment: { type: 'production-like', database: 'postgres', cache: 'redis' },
        execution: { parallel: true, timeout: 3600000 },
        reporting: { format: 'compliance', audit: true }
      },
      {
        name: 'performance-tests',
        type: 'performance',
        modules: ['all'],
        environment: { type: 'performance', database: 'postgres', cache: 'redis', monitoring: true },
        execution: { parallel: false, timeout: 7200000 },
        reporting: { format: 'performance', metrics: true }
      },
      {
        name: 'security-tests',
        type: 'security',
        modules: ['all'],
        environment: { type: 'security', database: 'postgres', cache: 'redis', vulnerability_scanner: true },
        execution: { parallel: true, timeout: 3600000 },
        reporting: { format: 'security', vulnerabilities: true }
      }
    ];

    suiteConfigs.forEach(config => {
      this.testSuites.set(config.name, new TestSuite(config));
    });
  }
}
```

---

## 🔗 관련 문서

- [Testing Framework Overview](./README.md) - 테스트 프레임워크 개요
- [Protocol Compliance Testing](./protocol-compliance-testing.md) - L1-L3 프로토콜 검증
- [Interoperability Testing](./interoperability-testing.md) - 크로스 플랫폼 호환성
- [Performance Benchmarking](./performance-benchmarking.md) - 성능 검증
- [Security Testing](./security-testing.md) - 보안 검증

---

**Test Suites Version**: 1.0.0-alpha
**Last Updated**: September 4, 2025
**Next Review**: December 4, 2025
**Status**: Automated and Integrated

**⚠️ Alpha Notice**: This test suites guide provides comprehensive automated testing capabilities for MPLP v1.0 Alpha. Additional test automation features and advanced CI/CD integration will be added in Beta release based on testing feedback and deployment requirements.
