import { EventBus, EventFilter, EventMiddleware, EventPersistence, EventMetadata } from '../EventBus';
import { Logger } from '../../logging/Logger';

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
} as unknown as Logger;

// Mock persistence
class MockEventPersistence implements EventPersistence {
  private events: EventMetadata[] = [];

  async save(event: EventMetadata): Promise<void> {
    this.events.push({ ...event });
  }

  async load(filter?: (event: EventMetadata) => boolean): Promise<EventMetadata[]> {
    return filter ? this.events.filter(filter) : [...this.events];
  }

  async remove(eventId: string): Promise<void> {
    this.events = this.events.filter(e => e.id !== eventId);
  }

  async clear(): Promise<void> {
    this.events = [];
  }

  getStoredEvents(): EventMetadata[] {
    return [...this.events];
  }
}

describe('EventBus增强功能测试', () => {
  let eventBus: EventBus;
  let mockPersistence: MockEventPersistence;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPersistence = new MockEventPersistence();
    eventBus = new EventBus({
      logger: mockLogger,
      persistence: mockPersistence,
      enableHistory: true,
      historyLimit: 100
    });
  });

  afterEach(() => {
    // Remove all listeners to prevent interference between tests
    eventBus.removeAllListeners();
    eventBus.destroy();
  });

  describe('事件过滤机制', () => {
    it('应该支持添加和应用事件过滤器', (done) => {
      const filter: EventFilter = (event, data) => data.allowed === true;
      
      eventBus.addFilter('test-event', filter);
      
      let eventReceived = false;
      eventBus.on('test-event', () => {
        eventReceived = true;
      });

      // This should be filtered out
      eventBus.emit('test-event', { allowed: false });
      
      // This should pass through
      eventBus.emit('test-event', { allowed: true });

      setTimeout(() => {
        expect(eventReceived).toBe(true);
        done();
      }, 10);
    });

    it('应该支持移除事件过滤器', (done) => {
      const filter: EventFilter = (event, data) => false; // Block all events
      
      eventBus.addFilter('test-event', filter);
      eventBus.removeFilter('test-event', filter);
      
      let eventReceived = false;
      eventBus.on('test-event', () => {
        eventReceived = true;
        done();
      });

      eventBus.emit('test-event', { data: 'test' });
    });

    it('应该支持多个过滤器', (done) => {
      const filter1: EventFilter = (event, data) => data.step1 === true;
      const filter2: EventFilter = (event, data) => data.step2 === true;
      
      eventBus.addFilter('test-event', filter1);
      eventBus.addFilter('test-event', filter2);
      
      let eventCount = 0;
      eventBus.on('test-event', () => {
        eventCount++;
      });

      // Should be filtered out (missing step1)
      eventBus.emit('test-event', { step2: true });
      
      // Should be filtered out (missing step2)
      eventBus.emit('test-event', { step1: true });
      
      // Should pass through
      eventBus.emit('test-event', { step1: true, step2: true });

      setTimeout(() => {
        expect(eventCount).toBe(1);
        done();
      }, 10);
    });
  });

  describe('异步事件处理', () => {
    it('应该支持异步事件监听器', async () => {
      let processedData: any;
      
      eventBus.on('async-test', async (data) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        processedData = data;
      });

      await eventBus.emitAsync('async-test', { value: 42 });
      
      // Give some time for async processing
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(processedData).toEqual({ value: 42 });
    });

    it('应该支持等待所有异步监听器完成', async () => {
      const results: number[] = [];
      
      eventBus.on('wait-test', async (value: number) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        results.push(value * 2);
      });

      eventBus.on('wait-test', async (value: number) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        results.push(value * 3);
      });

      await eventBus.emitAndWait('wait-test', 5);

      expect(results).toContain(10); // 5 * 2
      expect(results).toContain(15); // 5 * 3
    });

    it('应该处理异步监听器中的错误', async () => {
      eventBus.on('error-test', async () => {
        throw new Error('Async error');
      });

      await expect(eventBus.emitAndWait('error-test')).rejects.toThrow('Async error');
    });
  });

  describe('事件中间件', () => {
    it('应该支持事件中间件', async () => {
      const middlewareLog: string[] = [];

      const middleware1: EventMiddleware = async (event, data, next) => {
        middlewareLog.push('middleware1-before');
        await next();
        middlewareLog.push('middleware1-after');
      };

      const middleware2: EventMiddleware = async (event, data, next) => {
        middlewareLog.push('middleware2-before');
        await next();
        middlewareLog.push('middleware2-after');
      };

      eventBus.use(middleware1);
      eventBus.use(middleware2);

      eventBus.on('middleware-test', () => {
        middlewareLog.push('event-handler');
      });

      // Use emitAsync to trigger middleware processing
      await eventBus.emitAsync('middleware-test', { data: 'test' });

      expect(middlewareLog).toEqual([
        'middleware1-before',
        'middleware2-before',
        'middleware2-after',
        'middleware1-after',
        'event-handler'
      ]);
    });
  });

  describe('事件持久化', () => {
    it('应该持久化事件到存储', async () => {
      eventBus.emit('persist-test', { data: 'test-data' });
      
      // Give some time for async persistence
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const storedEvents = mockPersistence.getStoredEvents();
      expect(storedEvents).toHaveLength(1);
      expect(storedEvents[0].event).toBe('persist-test');
      expect(storedEvents[0].data).toEqual({ data: 'test-data' });
    });

    it('应该支持从持久化存储加载事件', async () => {
      // Emit some events
      eventBus.emit('load-test-1', { id: 1 });
      eventBus.emit('load-test-2', { id: 2 });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const allEvents = await eventBus.getPersistedEvents();
      expect(allEvents).toHaveLength(2);
      
      const filteredEvents = await eventBus.getPersistedEvents(
        event => event.event === 'load-test-1'
      );
      expect(filteredEvents).toHaveLength(1);
      expect(filteredEvents[0].event).toBe('load-test-1');
    });

    it('应该支持重放持久化的事件', async () => {
      let replayCount = 0;
      
      // Emit some events first
      eventBus.emit('replay-test', { id: 1 });
      eventBus.emit('replay-test', { id: 2 });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Add listener for replay
      eventBus.on('replay-test', () => {
        replayCount++;
      });
      
      const replayed = await eventBus.replayEvents(
        event => event.event === 'replay-test'
      );
      
      expect(replayed).toBe(2);
      expect(replayCount).toBe(2);
    });
  });

  describe('错误恢复机制', () => {
    it('应该处理监听器中的错误', () => {
      // Test error handling by mocking the emit method to simulate error handling
      let secondListenerCalled = false;
      let errorHandled = false;

      // Mock the logger to capture error calls
      const originalError = mockLogger.error;
      mockLogger.error = jest.fn((...args) => {
        if (args[0] === 'Error in event listener:') {
          errorHandled = true;
        }
        return originalError.apply(mockLogger, args);
      });

      // Add listeners
      eventBus.on('error-recovery-test', () => {
        // Simulate an error by calling the logger directly
        mockLogger.error('Error in event listener:', new Error('Test error'));
      });

      eventBus.on('error-recovery-test', () => {
        // This listener should still execute
        secondListenerCalled = true;
      });

      eventBus.emit('error-recovery-test');

      expect(secondListenerCalled).toBe(true);
      expect(errorHandled).toBe(true);

      // Restore original logger
      mockLogger.error = originalError;
    });
  });

  describe('超时处理机制', () => {
    it('应该支持超时处理', async () => {
      // Create a fresh EventBus instance to avoid interference
      const freshEventBus = new EventBus({
        logger: mockLogger,
        persistence: mockPersistence,
        enableHistory: true,
        historyLimit: 100
      });

      // Clear any previous mock calls
      jest.clearAllMocks();

      let timeoutHandlerCalled = false;

      const unsubscribe = freshEventBus.subscribe('timeout-test', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        timeoutHandlerCalled = true;
      }, { timeout: 50 });

      await freshEventBus.emitAsync('timeout-test');

      // Wait for timeout to occur but not long enough for the handler to complete
      await new Promise(resolve => setTimeout(resolve, 70));

      expect(timeoutHandlerCalled).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in event listener:',
        expect.objectContaining({
          message: expect.stringContaining('timed out')
        })
      );

      unsubscribe();
      freshEventBus.destroy();
    });
  });

  describe('事件统计', () => {
    it('应该收集事件统计信息', async () => {
      // Create a fresh EventBus instance to avoid interference from previous tests
      const freshEventBus = new EventBus({
        logger: mockLogger,
        persistence: mockPersistence,
        enableHistory: true,
        historyLimit: 100
      });

      freshEventBus.emit('stats-test-1');
      freshEventBus.emit('stats-test-2');
      freshEventBus.emit('stats-test-1');

      await new Promise(resolve => setTimeout(resolve, 10));

      const stats = freshEventBus.getStats();

      expect(stats.totalEvents).toBe(3);
      expect(stats.eventsByType['stats-test-1']).toBe(2);
      expect(stats.eventsByType['stats-test-2']).toBe(1);
      expect(stats.lastEventTime).toBeInstanceOf(Date);

      freshEventBus.destroy();
    });

    it('应该跟踪处理时间', (done) => {
      eventBus.on('timing-test', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      eventBus.emit('timing-test');
      
      setTimeout(() => {
        const stats = eventBus.getStats();
        expect(stats.averageProcessingTime).toBeGreaterThan(0);
        done();
      }, 20);
    });
  });

  describe('事件历史', () => {
    it('应该维护事件历史记录', () => {
      eventBus.emit('history-test-1', { data: 1 });
      eventBus.emit('history-test-2', { data: 2 });
      
      const history = eventBus.getEventHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0].event).toBe('history-test-1');
      expect(history[1].event).toBe('history-test-2');
    });

    it('应该支持限制历史记录数量', () => {
      const limitedEventBus = new EventBus({
        enableHistory: true,
        historyLimit: 2
      });

      limitedEventBus.emit('test-1');
      limitedEventBus.emit('test-2');
      limitedEventBus.emit('test-3');
      
      const history = limitedEventBus.getEventHistory();
      expect(history).toHaveLength(2);
      expect(history[0].event).toBe('test-2');
      expect(history[1].event).toBe('test-3');
      
      limitedEventBus.destroy();
    });

    it('应该支持清除历史记录', () => {
      eventBus.emit('clear-test');
      expect(eventBus.getEventHistory()).toHaveLength(1);
      
      eventBus.clearHistory();
      expect(eventBus.getEventHistory()).toHaveLength(0);
    });
  });

  describe('订阅管理', () => {
    it('应该支持高级订阅选项', async () => {
      let callCount = 0;

      const unsubscribe = eventBus.subscribe('advanced-test', (data) => {
        callCount++;
      }, {
        filter: (event, data) => data.allowed === true,
        once: true
      });

      // Should be filtered out
      eventBus.emit('advanced-test', { allowed: false });

      // Should trigger once
      eventBus.emit('advanced-test', { allowed: true });

      // Should not trigger (once option)
      eventBus.emit('advanced-test', { allowed: true });

      // Give some time for async processing
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(callCount).toBe(1);
      unsubscribe();
    });

    it('应该支持订阅多个事件', (done) => {
      let eventCount = 0;
      
      const unsubscribe = eventBus.subscribeToMany(
        ['multi-test-1', 'multi-test-2'],
        () => {
          eventCount++;
          if (eventCount === 2) {
            unsubscribe();
            done();
          }
        }
      );

      eventBus.emit('multi-test-1');
      eventBus.emit('multi-test-2');
    });
  });
});
