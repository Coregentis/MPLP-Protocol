/**
 * @fileoverview Debug Manager Tests
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { DebugManager } from '../debug/DebugManager';
import { DebugConfig } from '../types/debug';

describe('DebugManager', () => {
  let debugManager: DebugManager;
  let mockConfig: DebugConfig;

  beforeEach(() => {
    mockConfig = {
      enabled: true,
      logLevel: 'info',
      breakpoints: [],
      watchExpressions: []
    };
    debugManager = new DebugManager(mockConfig);
  });

  afterEach(async () => {
    if (debugManager) {
      await debugManager.stop();
    }
  });

  describe('Initialization', () => {
    it('should create debug manager with default config', () => {
      const manager = new DebugManager();
      expect(manager).toBeInstanceOf(DebugManager);
      expect(manager.getConfig()).toBeDefined();
    });

    it('should create debug manager with custom config', () => {
      const config = debugManager.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.logLevel).toBe('info');
    });
  });

  describe('Lifecycle Management', () => {
    it('should start debug manager successfully', async () => {
      const startSpy = jest.fn();
      debugManager.on('started', startSpy);

      await debugManager.start();
      
      expect(startSpy).toHaveBeenCalled();
      const stats = debugManager.getStatistics();
      expect(stats.isActive).toBe(true);
    });

    it('should stop debug manager successfully', async () => {
      const stopSpy = jest.fn();
      debugManager.on('stopped', stopSpy);

      await debugManager.start();
      await debugManager.stop();
      
      expect(stopSpy).toHaveBeenCalled();
      const stats = debugManager.getStatistics();
      expect(stats.isActive).toBe(false);
    });

    it('should not start if already active', async () => {
      await debugManager.start();
      
      // Starting again should not throw
      await expect(debugManager.start()).resolves.not.toThrow();
    });

    it('should not stop if already inactive', async () => {
      // Stopping when not started should not throw
      await expect(debugManager.stop()).resolves.not.toThrow();
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      await debugManager.start();
    });

    it('should create debug session', () => {
      const sessionCreatedSpy = jest.fn();
      debugManager.on('sessionCreated', sessionCreatedSpy);

      const target = { id: 'test-target' };
      const session = debugManager.createSession('test-session', target);

      expect(session).toBeDefined();
      expect(session.id).toBe('test-session');
      expect(session.target).toBe(target);
      expect(session.isActive).toBe(true);
      expect(sessionCreatedSpy).toHaveBeenCalledWith(session);
    });

    it('should get debug session', () => {
      const target = { id: 'test-target' };
      debugManager.createSession('test-session', target);

      const session = debugManager.getSession('test-session');
      expect(session).toBeDefined();
      expect(session!.id).toBe('test-session');
    });

    it('should end debug session', () => {
      const sessionEndedSpy = jest.fn();
      debugManager.on('sessionEnded', sessionEndedSpy);

      const target = { id: 'test-target' };
      debugManager.createSession('test-session', target);
      debugManager.endSession('test-session');

      const session = debugManager.getSession('test-session');
      expect(session).toBeUndefined();
      expect(sessionEndedSpy).toHaveBeenCalled();
    });

    it('should throw error for duplicate session', () => {
      const target = { id: 'test-target' };
      debugManager.createSession('test-session', target);

      expect(() => {
        debugManager.createSession('test-session', target);
      }).toThrow('Debug session \'test-session\' already exists');
    });
  });

  describe('Breakpoint Management', () => {
    beforeEach(async () => {
      await debugManager.start();
      const target = { id: 'test-target' };
      debugManager.createSession('test-session', target);
    });

    it('should add breakpoint', () => {
      const breakpointAddedSpy = jest.fn();
      debugManager.on('breakpointAdded', breakpointAddedSpy);

      debugManager.addBreakpoint('test-session', 'file.ts:10');

      expect(breakpointAddedSpy).toHaveBeenCalled();
      const session = debugManager.getSession('test-session');
      expect(session!.breakpoints).toHaveLength(1);
      expect(session!.breakpoints[0].location).toBe('file.ts:10');
    });

    it('should add breakpoint with condition', () => {
      debugManager.addBreakpoint('test-session', 'file.ts:10', 'x > 5');

      const session = debugManager.getSession('test-session');
      expect(session!.breakpoints[0].condition).toBe('x > 5');
    });

    it('should remove breakpoint', () => {
      const breakpointRemovedSpy = jest.fn();
      debugManager.on('breakpointRemoved', breakpointRemovedSpy);

      debugManager.addBreakpoint('test-session', 'file.ts:10');
      const session = debugManager.getSession('test-session');
      const breakpointId = session!.breakpoints[0].id;

      debugManager.removeBreakpoint('test-session', breakpointId);

      expect(breakpointRemovedSpy).toHaveBeenCalled();
      expect(session!.breakpoints).toHaveLength(0);
    });
  });

  describe('Watch Expression Management', () => {
    beforeEach(async () => {
      await debugManager.start();
      const target = { id: 'test-target' };
      debugManager.createSession('test-session', target);
    });

    it('should add watch expression', () => {
      const watchAddedSpy = jest.fn();
      debugManager.on('watchAdded', watchAddedSpy);

      debugManager.addWatchExpression('test-session', 'variable.value');

      expect(watchAddedSpy).toHaveBeenCalled();
      const session = debugManager.getSession('test-session');
      expect(session!.watchExpressions).toHaveLength(1);
      expect(session!.watchExpressions[0].expression).toBe('variable.value');
    });
  });

  describe('Statistics', () => {
    it('should return correct statistics when inactive', () => {
      const stats = debugManager.getStatistics();
      
      expect(stats.isActive).toBe(false);
      expect(stats.activeSessions).toBe(0);
      expect(stats.totalBreakpoints).toBe(0);
      expect(stats.totalWatchExpressions).toBe(0);
    });

    it('should return correct statistics when active with sessions', async () => {
      await debugManager.start();
      
      const target1 = { id: 'target1' };
      const target2 = { id: 'target2' };
      debugManager.createSession('session1', target1);
      debugManager.createSession('session2', target2);
      
      debugManager.addBreakpoint('session1', 'file1.ts:10');
      debugManager.addBreakpoint('session1', 'file1.ts:20');
      debugManager.addBreakpoint('session2', 'file2.ts:15');
      
      debugManager.addWatchExpression('session1', 'var1');
      debugManager.addWatchExpression('session2', 'var2');

      const stats = debugManager.getStatistics();
      
      expect(stats.isActive).toBe(true);
      expect(stats.activeSessions).toBe(2);
      expect(stats.totalBreakpoints).toBe(3);
      expect(stats.totalWatchExpressions).toBe(2);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const configUpdatedSpy = jest.fn();
      debugManager.on('configUpdated', configUpdatedSpy);

      const newConfig = { logLevel: 'debug' as const };
      debugManager.updateConfig(newConfig);

      expect(configUpdatedSpy).toHaveBeenCalled();
      const config = debugManager.getConfig();
      expect(config.logLevel).toBe('debug');
    });

    it('should preserve existing config when updating', () => {
      const originalConfig = debugManager.getConfig();

      debugManager.updateConfig({ logLevel: 'debug' });

      const updatedConfig = debugManager.getConfig();
      expect(updatedConfig.enabled).toBe(originalConfig.enabled);
      expect(updatedConfig.logLevel).toBe('debug');
    });
  });

  describe('企业级功能测试', () => {
    beforeEach(async () => {
      await debugManager.start();
    });

    describe('远程调试连接管理', () => {
      it('应该建立远程调试连接', async () => {
        const connectionSpy = jest.fn();
        debugManager.on('remoteConnectionEstablished', connectionSpy);

        const connectionId = 'remote-1';
        const config = { host: 'localhost', port: 9229 };

        await debugManager.connectRemoteDebugger(connectionId, config);

        expect(connectionSpy).toHaveBeenCalled();
        const connections = debugManager.getRemoteConnections();
        expect(connections).toHaveLength(1);
        expect(connections[0].id).toBe(connectionId);
        expect(connections[0].config).toEqual(config);
      });

      it('应该断开远程调试连接', async () => {
        const connectionId = 'remote-1';
        const config = { host: 'localhost', port: 9229 };

        await debugManager.connectRemoteDebugger(connectionId, config);

        const disconnectionSpy = jest.fn();
        debugManager.on('remoteConnectionClosed', disconnectionSpy);

        await debugManager.disconnectRemoteDebugger(connectionId);

        expect(disconnectionSpy).toHaveBeenCalledWith({ connectionId });
        const connections = debugManager.getRemoteConnections();
        expect(connections).toHaveLength(0);
      });

      it('应该处理重复连接错误', async () => {
        const connectionId = 'remote-1';
        const config = { host: 'localhost', port: 9229 };

        await debugManager.connectRemoteDebugger(connectionId, config);

        await expect(debugManager.connectRemoteDebugger(connectionId, config))
          .rejects.toThrow(`Remote connection ${connectionId} already exists`);
      });

      it('应该处理不存在的连接断开', async () => {
        const connectionId = 'non-existent';

        await expect(debugManager.disconnectRemoteDebugger(connectionId))
          .rejects.toThrow(`Remote connection ${connectionId} not found`);
      });
    });

    describe('告警规则管理', () => {
      it('应该添加告警规则', () => {
        const alertSpy = jest.fn();
        debugManager.on('alertRuleAdded', alertSpy);

        const rule = {
          name: 'High CPU Alert',
          condition: 'cpu > 80',
          action: 'notify'
        };

        debugManager.addAlertRule(rule);

        expect(alertSpy).toHaveBeenCalled();
        const rules = debugManager.getAlertRules();
        expect(rules).toHaveLength(1);
        expect(rules[0].name).toBe(rule.name);
        expect(rules[0].condition).toBe(rule.condition);
        expect(rules[0].enabled).toBe(true);
      });

      it('应该移除告警规则', () => {
        const rule = {
          id: 'alert-1',
          name: 'High CPU Alert',
          condition: 'cpu > 80',
          action: 'notify'
        };

        debugManager.addAlertRule(rule);

        const removeSpy = jest.fn();
        debugManager.on('alertRuleRemoved', removeSpy);

        debugManager.removeAlertRule('alert-1');

        expect(removeSpy).toHaveBeenCalledWith({ ruleId: 'alert-1', rule: expect.any(Object) });
        const rules = debugManager.getAlertRules();
        expect(rules).toHaveLength(0);
      });

      it('应该处理不存在的告警规则移除', () => {
        expect(() => debugManager.removeAlertRule('non-existent'))
          .toThrow('Alert rule non-existent not found');
      });
    });

    describe('性能阈值管理', () => {
      it('应该设置性能阈值', () => {
        const thresholdSpy = jest.fn();
        debugManager.on('performanceThresholdUpdated', thresholdSpy);

        debugManager.setPerformanceThreshold('cpu', 90);

        expect(thresholdSpy).toHaveBeenCalledWith({ metric: 'cpu', threshold: 90 });
        expect(debugManager.getPerformanceThreshold('cpu')).toBe(90);
      });

      it('应该获取所有性能阈值', () => {
        debugManager.setPerformanceThreshold('cpu', 90);
        debugManager.setPerformanceThreshold('memory', 95);

        const thresholds = debugManager.getAllPerformanceThresholds();
        expect(thresholds.cpu).toBe(90);
        expect(thresholds.memory).toBe(95);
      });

      it('应该返回undefined对于不存在的阈值', () => {
        expect(debugManager.getPerformanceThreshold('non-existent')).toBeUndefined();
      });
    });

    describe('审计日志管理', () => {
      it('应该记录审计日志', () => {
        const logSpy = jest.fn();
        debugManager.on('auditLogEntry', logSpy);

        // 触发一个会记录审计日志的操作
        debugManager.setPerformanceThreshold('cpu', 90);

        expect(logSpy).toHaveBeenCalled();
        const logs = debugManager.getAuditLog();
        expect(logs.length).toBeGreaterThan(0);
        expect(logs[0].action).toBe('performance_threshold_updated');
      });

      it('应该限制审计日志数量', () => {
        // 模拟添加大量日志
        for (let i = 0; i < 1005; i++) {
          debugManager.setPerformanceThreshold('test', i);
        }

        const logs = debugManager.getAuditLog();
        expect(logs.length).toBeLessThanOrEqual(1000);
      });

      it('应该支持限制日志查询', () => {
        debugManager.setPerformanceThreshold('cpu', 90);
        debugManager.setPerformanceThreshold('memory', 95);

        const logs = debugManager.getAuditLog(1);
        expect(logs).toHaveLength(1);
      });

      it('应该清除审计日志', () => {
        debugManager.setPerformanceThreshold('cpu', 90);

        debugManager.clearAuditLog();

        const logs = debugManager.getAuditLog();
        expect(logs).toHaveLength(1); // 只有清除日志的记录
        expect(logs[0].action).toBe('audit_log_cleared');
      });
    });

    describe('配置备份管理', () => {
      it('应该创建配置备份', () => {
        const backupSpy = jest.fn();
        debugManager.on('configBackupCreated', backupSpy);

        debugManager.createConfigBackup('Test Backup');

        expect(backupSpy).toHaveBeenCalled();
        const backups = debugManager.getConfigBackups();
        expect(backups).toHaveLength(1);
        expect(backups[0].name).toBe('Test Backup');
      });

      it('应该恢复配置备份', () => {
        const originalConfig = debugManager.getConfig();
        debugManager.createConfigBackup('Original');

        // 修改配置
        debugManager.updateConfig({ logLevel: 'debug' });

        const restoreSpy = jest.fn();
        debugManager.on('configBackupRestored', restoreSpy);

        const backups = debugManager.getConfigBackups();
        debugManager.restoreConfigBackup(backups[0].id);

        expect(restoreSpy).toHaveBeenCalled();
        const restoredConfig = debugManager.getConfig();
        expect(restoredConfig.logLevel).toBe(originalConfig.logLevel);
      });

      it('应该删除配置备份', () => {
        debugManager.createConfigBackup('Test Backup');

        const deleteSpy = jest.fn();
        debugManager.on('configBackupDeleted', deleteSpy);

        const backups = debugManager.getConfigBackups();
        debugManager.deleteConfigBackup(backups[0].id);

        expect(deleteSpy).toHaveBeenCalled();
        const remainingBackups = debugManager.getConfigBackups();
        expect(remainingBackups).toHaveLength(0);
      });

      it('应该限制备份数量', () => {
        // 创建超过限制的备份
        for (let i = 0; i < 12; i++) {
          debugManager.createConfigBackup(`Backup ${i}`);
        }

        const backups = debugManager.getConfigBackups();
        expect(backups.length).toBeLessThanOrEqual(10);
      });

      it('应该处理不存在的备份恢复', () => {
        expect(() => debugManager.restoreConfigBackup('non-existent'))
          .toThrow('Config backup non-existent not found');
      });

      it('应该处理不存在的备份删除', () => {
        expect(() => debugManager.deleteConfigBackup('non-existent'))
          .toThrow('Config backup non-existent not found');
      });
    });

    describe('企业级运行模式', () => {
      it('应该记录运行指标', async () => {
        const enterpriseSpy = jest.fn();
        debugManager.on('enterpriseModeStarted', enterpriseSpy);

        const metrics = await debugManager.runWithEnterpriseFeatures();

        expect(enterpriseSpy).toHaveBeenCalled();
        expect(metrics).toBeDefined();
        expect(metrics.startTime).toBeInstanceOf(Date);
        expect(typeof metrics.duration).toBe('number');
        expect(typeof metrics.activeConnections).toBe('number');
        expect(typeof metrics.alertRules).toBe('number');
      });

      it('应该获取企业级统计信息', () => {
        const stats = debugManager.getEnterpriseStatistics();

        expect(stats.enterprise).toBeDefined();
        expect(typeof stats.enterprise.remoteConnections).toBe('number');
        expect(typeof stats.enterprise.alertRules).toBe('number');
        expect(typeof stats.enterprise.performanceThresholds).toBe('number');
        expect(typeof stats.enterprise.auditLogEntries).toBe('number');
        expect(typeof stats.enterprise.configBackups).toBe('number');
        expect(typeof stats.enterprise.securityPolicies).toBe('number');
      });
    });
  });
});
