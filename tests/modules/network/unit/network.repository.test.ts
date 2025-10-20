/**
 * Network Repository 企业级测试套件
 * 测试目标：提升Repository覆盖率从27.55%到90%+
 */

import { MemoryNetworkRepository } from '../../../../src/modules/network/infrastructure/repositories/network.repository';
import { NetworkTestFactory } from '../factories/network-test.factory';
import { NetworkEntity } from '../../../../src/modules/network/domain/entities/network.entity';

describe('MemoryNetworkRepository企业级测试', () => {
  let networkRepository: MemoryNetworkRepository;

  beforeEach(() => {
    networkRepository = new MemoryNetworkRepository();
  });

  describe('网络CRUD操作', () => {
    it('应该成功保存网络', async () => {
      const networkData = NetworkTestFactory.createNetworkEntity();

      const result = await networkRepository.save(networkData);

      expect(result).toBeDefined();
      expect(result.networkId).toBe(networkData.networkId);
      expect(result.name).toBe(networkData.name);
      expect(result.status).toBe(networkData.status);
    });

    it('应该成功根据ID查找网络', async () => {
      const networkData = NetworkTestFactory.createNetworkEntity();
      await networkRepository.save(networkData);

      const result = await networkRepository.findById(networkData.networkId);

      expect(result).toBeDefined();
      expect(result?.networkId).toBe(networkData.networkId);
    });

    it('应该在网络不存在时返回null', async () => {
      const result = await networkRepository.findById('non-existent-id');
      
      expect(result).toBeNull();
    });

    it('应该成功更新网络', async () => {
      const networkData = NetworkTestFactory.createNetworkEntity();
      await networkRepository.save(networkData);

      const updateData = { name: 'Updated Network Name' };
      const result = await networkRepository.update(networkData.networkId, updateData);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Updated Network Name');
    });

    it('应该成功删除网络', async () => {
      const networkData = NetworkTestFactory.createNetworkEntity();
      await networkRepository.save(networkData);

      const result = await networkRepository.delete(networkData.networkId);

      expect(result).toBe(true);

      // 验证网络已被删除
      const deletedNetwork = await networkRepository.findById(networkData.networkId);
      expect(deletedNetwork).toBeNull();
    });

    it('应该在删除不存在的网络时返回false', async () => {
      const result = await networkRepository.delete('non-existent-id');
      
      expect(result).toBe(false);
    });
  });

  describe('网络查询操作', () => {
    beforeEach(async () => {
      // 创建测试数据
      const networks = [
        NetworkTestFactory.createNetworkEntity({ name: 'Network 1', status: 'active' }),
        NetworkTestFactory.createNetworkEntity({ name: 'Network 2', status: 'inactive' }),
        NetworkTestFactory.createNetworkEntity({ name: 'Network 3', status: 'active' })
      ];

      for (const network of networks) {
        await networkRepository.save(network);
      }
    });

    it('应该返回所有网络', async () => {
      const result = await networkRepository.findAll();
      
      expect(result).toHaveLength(3);
      expect(result.map(n => n.name)).toContain('Network 1');
      expect(result.map(n => n.name)).toContain('Network 2');
      expect(result.map(n => n.name)).toContain('Network 3');
    });

    it('应该根据状态过滤网络', async () => {
      const result = await networkRepository.findByStatus('active');
      
      expect(result).toHaveLength(2);
      expect(result.every(n => n.status === 'active')).toBe(true);
    });

    it('应该根据名称查找网络', async () => {
      const result = await networkRepository.findByName('Network 1');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('Network 1');
    });

    it('应该在名称不存在时返回null', async () => {
      const result = await networkRepository.findByName('Non-existent Network');
      
      expect(result).toBeNull();
    });
  });

  describe('网络节点管理', () => {
    let testNetwork: NetworkEntity;

    beforeEach(async () => {
      testNetwork = NetworkTestFactory.createNetworkEntity();
      await networkRepository.save(testNetwork);
    });

    it('应该成功获取网络拓扑数据', async () => {
      const result = await networkRepository.getTopologyData(testNetwork.networkId);

      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
    });

    it('应该成功更新网络拓扑', async () => {
      const newTopology = {
        nodes: testNetwork.nodes,
        edges: testNetwork.edges
      };

      const result = await networkRepository.updateTopology(testNetwork.networkId, newTopology);

      expect(result).toBe(true);
    });
  });

  describe('网络边缘连接管理', () => {
    let testNetwork: NetworkEntity;

    beforeEach(async () => {
      testNetwork = NetworkTestFactory.createNetworkEntityWithNodes();
      await networkRepository.save(testNetwork);
    });

    it('应该成功获取网络健康状态', async () => {
      const result = await networkRepository.getHealthStatus(testNetwork.networkId);

      expect(result).toBeDefined();
      if (result) {
        expect(result.networkId).toBe(testNetwork.networkId);
        expect(result.isHealthy).toBeDefined();
        expect(result.healthScore).toBeGreaterThanOrEqual(0);
        expect(result.healthScore).toBeLessThanOrEqual(1);
        expect(Array.isArray(result.issues)).toBe(true);
        expect(Array.isArray(result.recommendations)).toBe(true);
      }
    });

    it('应该成功检查网络是否存在', async () => {
      const result = await networkRepository.exists(testNetwork.networkId);

      expect(result).toBe(true);
    });

    it('应该在网络不存在时返回false', async () => {
      const result = await networkRepository.exists('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('网络统计和分析', () => {
    let testNetwork: NetworkEntity;

    beforeEach(async () => {
      testNetwork = NetworkTestFactory.createNetworkEntityWithNodes();
      await networkRepository.save(testNetwork);
    });

    it('应该返回正确的网络统计信息', async () => {
      const result = await networkRepository.getStatistics();

      expect(result).toBeDefined();
      expect(result.totalNetworks).toBeGreaterThanOrEqual(0);
      expect(result.activeNetworks).toBeGreaterThanOrEqual(0);
      expect(result.totalNodes).toBeGreaterThanOrEqual(0);
      expect(result.totalEdges).toBeGreaterThanOrEqual(0);
      expect(result.topologyDistribution).toBeDefined();
      expect(result.statusDistribution).toBeDefined();
    });

    it('应该返回网络拓扑信息', async () => {
      const result = await networkRepository.getTopologyData(testNetwork.networkId);

      expect(result).toBeDefined();
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
    });

    it('应该支持搜索功能', async () => {
      const result = await networkRepository.search('Network', { limit: 10 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('批量操作', () => {
    it('应该成功批量保存网络', async () => {
      const networks = [
        NetworkTestFactory.createNetworkEntity({ name: 'Batch Network 1' }),
        NetworkTestFactory.createNetworkEntity({ name: 'Batch Network 2' }),
        NetworkTestFactory.createNetworkEntity({ name: 'Batch Network 3' })
      ];

      const result = await networkRepository.saveBatch(networks);

      expect(result).toHaveLength(3);
      expect(result.every(n => n.networkId)).toBe(true);
    });

    it('应该成功批量删除网络', async () => {
      // 先创建一些网络
      const networks = [
        NetworkTestFactory.createNetworkEntity(),
        NetworkTestFactory.createNetworkEntity(),
        NetworkTestFactory.createNetworkEntity()
      ];

      const createdNetworks = await networkRepository.saveBatch(networks);
      const networkIds = createdNetworks.map(n => n.networkId);

      const result = await networkRepository.deleteBatch(networkIds);

      expect(result).toBe(true);

      // 验证网络已被删除
      for (const networkId of networkIds) {
        const deletedNetwork = await networkRepository.findById(networkId);
        expect(deletedNetwork).toBeNull();
      }
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的网络ID', async () => {
      const result = await networkRepository.update('', { name: 'Test' });
      expect(result).toBeNull();
    });

    it('应该处理无效的网络数据', async () => {
      const invalidNetwork = { networkId: '', name: '', topology: '', nodes: [], edges: [] } as any;

      // Repository应该能处理无效数据而不抛出异常
      const result = await networkRepository.save(invalidNetwork);
      expect(result).toBeDefined();
    });

    it('应该支持缓存清理', async () => {
      await networkRepository.clearCache();
      // 验证缓存已清理（通过重新查询验证）
      const testNetwork = NetworkTestFactory.createNetworkEntity();
      await networkRepository.save(testNetwork);
      const result = await networkRepository.findById(testNetwork.networkId);
      expect(result).toBeDefined();
    });
  });
});
