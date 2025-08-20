/**
 * 版本历史服务测试
 */

import {
  VersionHistoryService,
  Version,
  VersionHistoryConfig,
  AutoVersioningConfig,
  CreateVersionRequest,
  ChangeType
} from '../../../src/modules/context/application/services/version-history.service';
import { UUID } from '../../../src/modules/context/types';

describe('VersionHistoryService', () => {
  let service: VersionHistoryService;
  let mockContextId: UUID;
  let mockUserId: string;

  beforeEach(() => {
    service = new VersionHistoryService();
    mockContextId = 'context-123e4567-e89b-42d3-a456-426614174000' as UUID;
    mockUserId = 'user-123';
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认版本历史配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.maxVersions).toBe(50);
      expect(defaultConfig.autoVersioning?.enabled).toBe(true);
      expect(defaultConfig.autoVersioning?.versionOnConfigChange).toBe(true);
      expect(defaultConfig.autoVersioning?.versionOnStateChange).toBe(true);
      expect(defaultConfig.autoVersioning?.versionOnCacheChange).toBe(false);
    });
  });

  describe('createVersion', () => {
    it('应该成功创建版本', async () => {
      const request: CreateVersionRequest = {
        contextId: mockContextId,
        createdBy: mockUserId,
        changeSummary: 'Initial version',
        contextSnapshot: { name: 'Test Context', value: 123 },
        changeType: 'context_created'
      };

      const version = await service.createVersion(request);

      expect(version).toBeDefined();
      expect(version?.versionNumber).toBe(1);
      expect(version?.createdBy).toBe(mockUserId);
      expect(version?.changeSummary).toBe('Initial version');
      expect(version?.changeType).toBe('context_created');
      expect(version?.contextSnapshot).toEqual({ name: 'Test Context', value: 123 });
    });

    it('应该在服务禁用时返回null', async () => {
      const disabledService = new VersionHistoryService({ enabled: false });
      
      const request: CreateVersionRequest = {
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { test: 'data' },
        changeType: 'context_created'
      };

      const version = await disabledService.createVersion(request);

      expect(version).toBeNull();
    });

    it('应该自动递增版本号', async () => {
      const baseRequest: CreateVersionRequest = {
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { test: 'data' },
        changeType: 'context_created'
      };

      const version1 = await service.createVersion(baseRequest);
      const version2 = await service.createVersion({
        ...baseRequest,
        changeType: 'configuration_updated'
      });

      expect(version1?.versionNumber).toBe(1);
      expect(version2?.versionNumber).toBe(2);
    });

    it('应该自动生成版本ID和时间戳', async () => {
      const request: CreateVersionRequest = {
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { test: 'data' },
        changeType: 'context_created'
      };

      const version = await service.createVersion(request);

      expect(version?.versionId).toBeDefined();
      expect(version?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getVersions', () => {
    beforeEach(async () => {
      // 创建测试版本
      await service.createVersion({
        contextId: mockContextId,
        createdBy: 'user1',
        contextSnapshot: { version: 1 },
        changeType: 'context_created'
      });

      await service.createVersion({
        contextId: mockContextId,
        createdBy: 'user2',
        contextSnapshot: { version: 2 },
        changeType: 'configuration_updated'
      });

      await service.createVersion({
        contextId: mockContextId,
        createdBy: 'user1',
        contextSnapshot: { version: 3 },
        changeType: 'state_modified'
      });
    });

    it('应该返回所有版本', async () => {
      const versions = await service.getVersions(mockContextId);

      expect(versions).toHaveLength(3);
    });

    it('应该按版本号降序排序', async () => {
      const versions = await service.getVersions(mockContextId);

      expect(versions[0].versionNumber).toBe(3);
      expect(versions[1].versionNumber).toBe(2);
      expect(versions[2].versionNumber).toBe(1);
    });

    it('应该支持限制返回数量', async () => {
      const versions = await service.getVersions(mockContextId, 2);

      expect(versions).toHaveLength(2);
      expect(versions[0].versionNumber).toBe(3);
      expect(versions[1].versionNumber).toBe(2);
    });

    it('应该在没有版本时返回空数组', async () => {
      const versions = await service.getVersions('non-existent-context' as UUID);

      expect(versions).toEqual([]);
    });
  });

  describe('getVersion', () => {
    beforeEach(async () => {
      await service.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { test: 'data' },
        changeType: 'context_created'
      });
    });

    it('应该返回指定版本', async () => {
      const version = await service.getVersion(mockContextId, 1);

      expect(version).toBeDefined();
      expect(version?.versionNumber).toBe(1);
    });

    it('应该在版本不存在时返回null', async () => {
      const version = await service.getVersion(mockContextId, 999);

      expect(version).toBeNull();
    });
  });

  describe('getLatestVersion', () => {
    it('应该返回最新版本', async () => {
      await service.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { version: 1 },
        changeType: 'context_created'
      });

      await service.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { version: 2 },
        changeType: 'configuration_updated'
      });

      const latestVersion = await service.getLatestVersion(mockContextId);

      expect(latestVersion?.versionNumber).toBe(2);
      expect(latestVersion?.contextSnapshot).toEqual({ version: 2 });
    });

    it('应该在没有版本时返回null', async () => {
      const latestVersion = await service.getLatestVersion('non-existent-context' as UUID);

      expect(latestVersion).toBeNull();
    });
  });

  describe('compareVersions', () => {
    beforeEach(async () => {
      await service.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { name: 'Test', value: 100, oldField: 'old' },
        changeType: 'context_created'
      });

      await service.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { name: 'Test Updated', value: 200, newField: 'new' },
        changeType: 'configuration_updated'
      });
    });

    it('应该比较两个版本的差异', async () => {
      const comparison = await service.compareVersions(mockContextId, 1, 2);

      expect(comparison).toBeDefined();
      expect(comparison?.fromVersion.versionNumber).toBe(1);
      expect(comparison?.toVersion.versionNumber).toBe(2);
      expect(comparison?.changes).toBeDefined();
      expect(comparison?.summary).toBeDefined();
    });

    it('应该检测字段变更', async () => {
      const comparison = await service.compareVersions(mockContextId, 1, 2);

      const changes = comparison?.changes || [];
      
      // 应该检测到修改的字段
      const nameChange = changes.find(c => c.field === 'name');
      expect(nameChange?.changeType).toBe('modified');
      expect(nameChange?.oldValue).toBe('Test');
      expect(nameChange?.newValue).toBe('Test Updated');

      const valueChange = changes.find(c => c.field === 'value');
      expect(valueChange?.changeType).toBe('modified');
      expect(valueChange?.oldValue).toBe(100);
      expect(valueChange?.newValue).toBe(200);

      // 应该检测到删除的字段
      const removedField = changes.find(c => c.field === 'oldField');
      expect(removedField?.changeType).toBe('removed');

      // 应该检测到新增的字段
      const addedField = changes.find(c => c.field === 'newField');
      expect(addedField?.changeType).toBe('added');
    });

    it('应该生成变更摘要', async () => {
      const comparison = await service.compareVersions(mockContextId, 1, 2);

      expect(comparison?.summary).toContain('changes');
      expect(comparison?.summary).toContain('modified');
      expect(comparison?.summary).toContain('added');
      expect(comparison?.summary).toContain('removed');
    });

    it('应该在版本不存在时返回null', async () => {
      const comparison = await service.compareVersions(mockContextId, 1, 999);

      expect(comparison).toBeNull();
    });
  });

  describe('revertToVersion', () => {
    beforeEach(async () => {
      await service.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { version: 1, data: 'original' },
        changeType: 'context_created'
      });

      await service.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { version: 2, data: 'modified' },
        changeType: 'configuration_updated'
      });
    });

    it('应该恢复到指定版本', async () => {
      const revertedSnapshot = await service.revertToVersion(mockContextId, 1);

      expect(revertedSnapshot).toEqual({ version: 1, data: 'original' });
    });

    it('应该创建恢复版本记录', async () => {
      await service.revertToVersion(mockContextId, 1);

      const versions = await service.getVersions(mockContextId);
      const revertVersion = versions.find(v => v.changeSummary?.includes('Reverted to version 1'));

      expect(revertVersion).toBeDefined();
      expect(revertVersion?.createdBy).toBe('system');
    });

    it('应该在版本不存在时返回null', async () => {
      const result = await service.revertToVersion(mockContextId, 999);

      expect(result).toBeNull();
    });
  });

  describe('autoCreateVersion', () => {
    it('应该在启用自动版本控制时创建版本', async () => {
      const version = await service.autoCreateVersion(
        mockContextId,
        'configuration_updated',
        { test: 'data' },
        mockUserId
      );

      expect(version).toBeDefined();
      expect(version?.changeType).toBe('configuration_updated');
      expect(version?.changeSummary).toContain('Auto-generated');
    });

    it('应该在禁用自动版本控制时返回null', async () => {
      const disabledService = new VersionHistoryService({
        autoVersioning: { enabled: false, versionOnConfigChange: true, versionOnStateChange: true, versionOnCacheChange: true }
      });

      const version = await disabledService.autoCreateVersion(
        mockContextId,
        'configuration_updated',
        { test: 'data' },
        mockUserId
      );

      expect(version).toBeNull();
    });

    it('应该根据变更类型决定是否创建版本', async () => {
      const serviceWithCacheDisabled = new VersionHistoryService({
        autoVersioning: { enabled: true, versionOnConfigChange: true, versionOnStateChange: true, versionOnCacheChange: false }
      });

      const configVersion = await serviceWithCacheDisabled.autoCreateVersion(
        mockContextId,
        'configuration_updated',
        { test: 'data' },
        mockUserId
      );

      const cacheVersion = await serviceWithCacheDisabled.autoCreateVersion(
        mockContextId,
        'cache_updated',
        { test: 'data' },
        mockUserId
      );

      expect(configVersion).toBeDefined();
      expect(cacheVersion).toBeNull();
    });
  });

  describe('deleteVersion', () => {
    beforeEach(async () => {
      await service.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { test: 'data' },
        changeType: 'context_created'
      });
    });

    it('应该成功删除版本', async () => {
      const result = await service.deleteVersion(mockContextId, 1);

      expect(result).toBe(true);

      const versions = await service.getVersions(mockContextId);
      expect(versions).toHaveLength(0);
    });

    it('应该在版本不存在时返回false', async () => {
      const result = await service.deleteVersion(mockContextId, 999);

      expect(result).toBe(false);
    });
  });

  describe('cleanupOldVersions', () => {
    it('应该清理超出限制的旧版本', async () => {
      const limitedService = new VersionHistoryService({ maxVersions: 2 });

      // 创建3个版本
      await limitedService.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { version: 1 },
        changeType: 'context_created'
      });

      await limitedService.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { version: 2 },
        changeType: 'configuration_updated'
      });

      await limitedService.createVersion({
        contextId: mockContextId,
        createdBy: mockUserId,
        contextSnapshot: { version: 3 },
        changeType: 'state_modified'
      });

      const cleanedCount = await limitedService.cleanupOldVersions(mockContextId);

      expect(cleanedCount).toBe(1);

      const remainingVersions = await limitedService.getVersions(mockContextId);
      expect(remainingVersions).toHaveLength(2);
      expect(remainingVersions[0].versionNumber).toBe(3);
      expect(remainingVersions[1].versionNumber).toBe(2);
    });
  });

  describe('getVersionStatistics', () => {
    beforeEach(async () => {
      await service.createVersion({
        contextId: mockContextId,
        createdBy: 'user1',
        contextSnapshot: { test: 'data1' },
        changeType: 'context_created'
      });

      await service.createVersion({
        contextId: mockContextId,
        createdBy: 'user2',
        contextSnapshot: { test: 'data2' },
        changeType: 'configuration_updated'
      });

      await service.createVersion({
        contextId: mockContextId,
        createdBy: 'user1',
        contextSnapshot: { test: 'data3' },
        changeType: 'configuration_updated'
      });
    });

    it('应该返回正确的统计信息', async () => {
      const stats = await service.getVersionStatistics(mockContextId);

      expect(stats.totalVersions).toBe(3);
      expect(stats.versionsByType['context_created']).toBe(1);
      expect(stats.versionsByType['configuration_updated']).toBe(2);
      expect(stats.versionsByUser['user1']).toBe(2);
      expect(stats.versionsByUser['user2']).toBe(1);
      expect(stats.oldestVersion?.versionNumber).toBe(1);
      expect(stats.newestVersion?.versionNumber).toBe(3);
    });

    it('应该包含所有变更类型的统计', async () => {
      const stats = await service.getVersionStatistics(mockContextId);

      const expectedChangeTypes: ChangeType[] = [
        'context_created', 'configuration_updated', 'state_modified',
        'cache_updated', 'sync_configured'
      ];

      expectedChangeTypes.forEach(changeType => {
        expect(stats.versionsByType).toHaveProperty(changeType);
        expect(typeof stats.versionsByType[changeType]).toBe('number');
      });
    });
  });

  describe('updateAutoVersioningConfig', () => {
    it('应该成功更新自动版本控制配置', async () => {
      const newConfig: Partial<AutoVersioningConfig> = {
        versionOnConfigChange: false,
        versionOnCacheChange: true
      };

      const result = await service.updateAutoVersioningConfig(newConfig);

      expect(result).toBe(true);
    });
  });
});
