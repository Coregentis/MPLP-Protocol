/**
 * 错误处理服务测试
 */

import {
  ErrorHandlingService,
  ErrorContext,
  ErrorHandlingConfig,
  ErrorPolicy,
  CircuitBreakerConfig,
  CircuitBreakerState,
  ErrorSeverity,
  ErrorAction
} from '../../../src/modules/context/application/services/error-handling.service';
import { UUID } from '../../../src/modules/context/types';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;
  let mockContextId: UUID;

  beforeEach(() => {
    service = new ErrorHandlingService();
    mockContextId = 'context-123e4567-e89b-42d3-a456-426614174000' as UUID;
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认错误处理配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.errorPolicies).toHaveLength(3);
      expect(defaultConfig.circuitBreaker?.enabled).toBe(true);
      expect(defaultConfig.recoveryStrategy?.autoRecovery).toBe(true);
    });
  });

  describe('handleError', () => {
    let errorContext: ErrorContext;
    let config: ErrorHandlingConfig;

    beforeEach(() => {
      errorContext = {
        contextId: mockContextId,
        errorType: 'timeout',
        errorMessage: 'Operation timed out',
        timestamp: new Date(),
        severity: 'medium' as ErrorSeverity
      };

      config = {
        enabled: true,
        errorPolicies: [
          {
            errorType: 'timeout',
            severity: 'medium',
            action: 'retry',
            retryConfig: {
              maxAttempts: 3,
              backoffStrategy: 'exponential',
              baseDelayMs: 1000
            }
          }
        ]
      };
    });

    it('应该处理匹配的错误类型', async () => {
      const result = await service.handleError(errorContext, config);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('retry');
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it('应该忽略未匹配的错误类型', async () => {
      errorContext.errorType = 'unknown';

      const result = await service.handleError(errorContext, config);

      expect(result.handled).toBe(false);
      expect(result.action).toBe('ignore');
    });

    it('应该在配置禁用时忽略错误', async () => {
      config.enabled = false;

      const result = await service.handleError(errorContext, config);

      expect(result.handled).toBe(false);
      expect(result.action).toBe('ignore');
    });

    it('应该处理通配符错误策略', async () => {
      config.errorPolicies = [
        {
          errorType: '*',
          severity: 'low',
          action: 'ignore'
        }
      ];
      errorContext.errorType = 'any_error';

      const result = await service.handleError(errorContext, config);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('ignore');
    });

    it('应该处理升级动作', async () => {
      config.errorPolicies = [
        {
          errorType: 'critical',
          severity: 'critical',
          action: 'escalate'
        }
      ];
      errorContext.errorType = 'critical';

      const result = await service.handleError(errorContext, config);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('escalate');
      expect(result.escalated).toBe(true);
    });

    it('应该处理回退动作', async () => {
      config.errorPolicies = [
        {
          errorType: 'fallback_error',
          severity: 'medium',
          action: 'fallback'
        }
      ];
      errorContext.errorType = 'fallback_error';

      const result = await service.handleError(errorContext, config);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('fallback');
    });
  });

  describe('熔断器功能', () => {
    let circuitBreakerConfig: CircuitBreakerConfig;
    let errorContext: ErrorContext;
    let config: ErrorHandlingConfig;

    beforeEach(() => {
      circuitBreakerConfig = {
        enabled: true,
        failureThreshold: 3,
        timeoutMs: 30000,
        resetTimeoutMs: 60000
      };

      errorContext = {
        contextId: mockContextId,
        errorType: 'network',
        errorMessage: 'Network error',
        timestamp: new Date(),
        severity: 'high' as ErrorSeverity
      };

      config = {
        enabled: true,
        errorPolicies: [
          {
            errorType: 'network',
            severity: 'high',
            action: 'circuit_break'
          }
        ],
        circuitBreaker: circuitBreakerConfig
      };
    });

    it('应该在初始状态下为CLOSED', () => {
      const state = service.getCircuitBreakerState(mockContextId);
      expect(state).toBe(CircuitBreakerState.CLOSED);
    });

    it('应该记录成功操作', () => {
      service.recordSuccess(mockContextId);
      const state = service.getCircuitBreakerState(mockContextId);
      expect(state).toBe(CircuitBreakerState.CLOSED);
    });

    it('应该重置熔断器', () => {
      service.resetCircuitBreaker(mockContextId);
      const state = service.getCircuitBreakerState(mockContextId);
      expect(state).toBe(CircuitBreakerState.CLOSED);
    });

    it('应该处理熔断器动作', async () => {
      const result = await service.handleError(errorContext, config);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('circuit_break');
    });
  });

  describe('重试延迟计算', () => {
    let errorContext: ErrorContext;

    beforeEach(() => {
      errorContext = {
        contextId: mockContextId,
        errorType: 'retry_test',
        errorMessage: 'Retry test error',
        timestamp: new Date(),
        severity: 'medium' as ErrorSeverity
      };
    });

    it('应该计算线性退避延迟', async () => {
      const config: ErrorHandlingConfig = {
        enabled: true,
        errorPolicies: [
          {
            errorType: 'retry_test',
            severity: 'medium',
            action: 'retry',
            retryConfig: {
              maxAttempts: 3,
              backoffStrategy: 'linear',
              baseDelayMs: 1000
            }
          }
        ]
      };

      const result = await service.handleError(errorContext, config);

      expect(result.retryAfterMs).toBe(1000);
    });

    it('应该计算指数退避延迟', async () => {
      const config: ErrorHandlingConfig = {
        enabled: true,
        errorPolicies: [
          {
            errorType: 'retry_test',
            severity: 'medium',
            action: 'retry',
            retryConfig: {
              maxAttempts: 3,
              backoffStrategy: 'exponential',
              baseDelayMs: 1000
            }
          }
        ]
      };

      const result = await service.handleError(errorContext, config);

      expect(result.retryAfterMs).toBe(2000); // 1000 * 2^1
    });

    it('应该计算固定延迟', async () => {
      const config: ErrorHandlingConfig = {
        enabled: true,
        errorPolicies: [
          {
            errorType: 'retry_test',
            severity: 'medium',
            action: 'retry',
            retryConfig: {
              maxAttempts: 3,
              backoffStrategy: 'fixed',
              baseDelayMs: 500
            }
          }
        ]
      };

      const result = await service.handleError(errorContext, config);

      expect(result.retryAfterMs).toBe(500);
    });
  });

  describe('错误策略匹配', () => {
    let config: ErrorHandlingConfig;

    beforeEach(() => {
      config = {
        enabled: true,
        errorPolicies: [
          {
            errorType: 'timeout',
            severity: 'medium',
            action: 'retry'
          },
          {
            errorType: 'network',
            severity: 'high',
            action: 'fallback'
          },
          {
            errorType: 'critical',
            severity: 'critical',
            action: 'escalate'
          }
        ]
      };
    });

    it('应该匹配精确的错误类型', async () => {
      const errorContext: ErrorContext = {
        contextId: mockContextId,
        errorType: 'timeout',
        errorMessage: 'Timeout error',
        timestamp: new Date(),
        severity: 'medium'
      };

      const result = await service.handleError(errorContext, config);

      expect(result.action).toBe('retry');
    });

    it('应该匹配包含的错误类型', async () => {
      config.errorPolicies = [
        {
          errorType: 'net',
          severity: 'medium',
          action: 'retry'
        }
      ];

      const errorContext: ErrorContext = {
        contextId: mockContextId,
        errorType: 'network_timeout',
        errorMessage: 'Network timeout error',
        timestamp: new Date(),
        severity: 'medium'
      };

      const result = await service.handleError(errorContext, config);

      expect(result.action).toBe('retry');
    });
  });
});
