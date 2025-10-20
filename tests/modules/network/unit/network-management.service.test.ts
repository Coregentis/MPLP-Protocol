/**
 * Network管理服务单元测试
 * 
 * @description 基于实际接口的NetworkManagementService测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { NetworkManagementService } from '../../../../src/modules/network/application/services/network-management.service';
import { MemoryNetworkRepository } from '../../../../src/modules/network/infrastructure/repositories/network.repository';
import { NetworkTestFactory } from '../factories/network-test.factory';
import { NetworkEntity } from '../../../../src/modules/network/domain/entities/network.entity';

describe('NetworkManagementService测试', () => {
  let service: NetworkManagementService;
  let repository: MemoryNetworkRepository;

  beforeEach(async () => {
    repository = new MemoryNetworkRepository();
    service = new NetworkManagementService(repository);
    // 确保每个测试开始时repository是干净的
    await repository.clearCache();
  });

  describe('网络创建功能', () => {
    it('应该成功创建网络', async () => {
      // 📋 Arrange - 准备测试数据
      const createData = NetworkTestFactory.createNetworkData({
        name: 'Test Network',
        topology: 'star',
        contextId: 'ctx-test-001'
      });

      // 🎬 Act - 执行操作
      const result = await service.createNetwork(createData);

      // ✅ Assert - 验证结果
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Network');
      expect(result.topology).toBe('star');
      expect(result.contextId).toBe('ctx-test-001');
      expect(result.status).toBe('pending');
      expect(result.nodes).toHaveLength(createData.nodes.length);
    });

    it('应该为新网络生成唯一ID', async () => {
      // 📋 Arrange
      const createData1 = NetworkTestFactory.createNetworkData({ name: 'Network 1' });
      const createData2 = NetworkTestFactory.createNetworkData({ name: 'Network 2' });

      // 🎬 Act
      const network1 = await service.createNetwork(createData1);
      const network2 = await service.createNetwork(createData2);

      // ✅ Assert
      expect(network1.networkId).toBeDefined();
      expect(network2.networkId).toBeDefined();
      expect(network1.networkId).not.toBe(network2.networkId);
    });

    it('应该正确设置网络初始状态', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();

      // 🎬 Act
      const result = await service.createNetwork(createData);

      // ✅ Assert
      expect(result.status).toBe('pending');
      expect(result.protocolVersion).toBe('1.0.0');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.auditTrail).toEqual([]);
      expect(result.versionHistory).toEqual([]);
    });
  });

  describe('网络查询功能', () => {
    it('应该根据ID查找网络', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const created = await service.createNetwork(createData);

      // 🎬 Act
      const found = await service.getNetworkById(created.networkId);

      // ✅ Assert
      expect(found).toBeDefined();
      expect(found!.networkId).toBe(created.networkId);
      expect(found!.name).toBe(created.name);
    });

    it('应该在网络不存在时返回null', async () => {
      // 🎬 Act
      const result = await service.getNetworkById('non-existent-id');

      // ✅ Assert
      expect(result).toBeNull();
    });

    it('应该根据名称查找网络', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData({ name: 'Unique Network Name' });
      const created = await service.createNetwork(createData);

      // 🎬 Act
      const found = await service.getNetworkByName('Unique Network Name');

      // ✅ Assert
      expect(found).toBeDefined();
      expect(found!.networkId).toBe(created.networkId);
      expect(found!.name).toBe('Unique Network Name');
    });

    it('应该根据上下文ID查找网络列表', async () => {
      // 📋 Arrange
      const contextId = 'ctx-test-context';
      const createData1 = NetworkTestFactory.createNetworkData({ contextId, name: 'Network 1' });
      const createData2 = NetworkTestFactory.createNetworkData({ contextId, name: 'Network 2' });
      const createData3 = NetworkTestFactory.createNetworkData({ contextId: 'other-context', name: 'Network 3' });

      await service.createNetwork(createData1);
      await service.createNetwork(createData2);
      await service.createNetwork(createData3);

      // 🎬 Act
      const results = await service.getNetworksByContextId(contextId);

      // ✅ Assert
      expect(results).toHaveLength(2);
      expect(results.every(n => n.contextId === contextId)).toBe(true);
    });
  });

  describe('网络更新功能', () => {
    it('应该成功更新网络信息', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const created = await service.createNetwork(createData);
      const updateData = {
        name: 'Updated Network Name',
        description: 'Updated description',
        status: 'active' as const
      };

      // 🎬 Act
      const updated = await service.updateNetwork(created.networkId, updateData);

      // ✅ Assert
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Network Name');
      expect(updated!.description).toBe('Updated description');
      expect(updated!.status).toBe('active');
      expect(updated!.updatedAt).toBeInstanceOf(Date);
    });

    it('应该在网络不存在时返回null', async () => {
      // 🎬 Act
      const result = await service.updateNetwork('non-existent-id', { name: 'New Name' });

      // ✅ Assert
      expect(result).toBeNull();
    });
  });

  describe('网络删除功能', () => {
    it('应该成功删除网络', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const created = await service.createNetwork(createData);

      // 🎬 Act
      const deleted = await service.deleteNetwork(created.networkId);

      // ✅ Assert
      expect(deleted).toBe(true);

      // 验证网络已被删除
      const found = await service.getNetworkById(created.networkId);
      expect(found).toBeNull();
    });

    it('应该在网络不存在时返回false', async () => {
      // 🎬 Act
      const result = await service.deleteNetwork('non-existent-id');

      // ✅ Assert
      expect(result).toBe(false);
    });
  });

  describe('节点管理功能', () => {
    it('应该成功添加节点到网络', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const network = await service.createNetwork(createData);
      const initialNodeCount = network.nodes.length;
      const nodeData = NetworkTestFactory.createNodeData();

      // 🎬 Act
      const updated = await service.addNodeToNetwork(network.networkId, nodeData);

      // ✅ Assert
      expect(updated).toBeDefined();
      expect(updated!.nodes).toHaveLength(initialNodeCount + 1);

      const addedNode = updated!.nodes.find(n => n.agentId === nodeData.agentId);
      expect(addedNode).toBeDefined();
      expect(addedNode!.nodeType).toBe(nodeData.nodeType);
    });

    it('应该成功从网络移除节点', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const network = await service.createNetwork(createData);
      const initialNodeCount = network.nodes.length;
      const nodeToRemove = network.nodes[0];

      // 🎬 Act
      const updated = await service.removeNodeFromNetwork(network.networkId, nodeToRemove.nodeId);

      // ✅ Assert
      expect(updated).toBeDefined();
      expect(updated!.nodes).toHaveLength(initialNodeCount - 1);

      const removedNode = updated!.nodes.find(n => n.nodeId === nodeToRemove.nodeId);
      expect(removedNode).toBeUndefined();
    });

    it('应该成功更新节点状态', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const network = await service.createNetwork(createData);
      const nodeToUpdate = network.nodes[0];

      // 🎬 Act
      const updated = await service.updateNodeStatus(network.networkId, nodeToUpdate.nodeId, 'online');

      // ✅ Assert
      expect(updated).toBeDefined();
      
      const updatedNode = updated!.nodes.find(n => n.nodeId === nodeToUpdate.nodeId);
      expect(updatedNode).toBeDefined();
      expect(updatedNode!.status).toBe('online');
    });
  });

  describe('边缘连接管理功能', () => {
    it('应该成功添加边缘连接', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const network = await service.createNetwork(createData);
      const initialEdgeCount = network.edges.length;
      const edgeData = NetworkTestFactory.createEdgeData({
        sourceNodeId: network.nodes[0].nodeId,
        targetNodeId: network.nodes[1].nodeId
      });

      // 🎬 Act
      const updated = await service.addEdgeToNetwork(network.networkId, edgeData);

      // ✅ Assert
      expect(updated).toBeDefined();
      expect(updated!.edges).toHaveLength(initialEdgeCount + 1);

      const addedEdge = updated!.edges.find(e =>
        e.sourceNodeId === edgeData.sourceNodeId &&
        e.targetNodeId === edgeData.targetNodeId
      );
      expect(addedEdge).toBeDefined();
      expect(addedEdge!.edgeType).toBe(edgeData.edgeType);
    });
  });

  describe('网络统计功能', () => {
    it('应该返回正确的网络统计信息', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const network = await service.createNetwork(createData);

      // 🎬 Act
      const stats = await service.getNetworkStatistics(network.networkId);

      // ✅ Assert
      expect(stats).toBeDefined();
      expect(stats!.totalNodes).toBe(network.nodes.length);
      expect(stats!.totalEdges).toBe(network.edges.length);
      expect(stats!.onlineNodes).toBeGreaterThanOrEqual(0);
      expect(stats!.activeEdges).toBeGreaterThanOrEqual(0);
      expect(stats!.topologyEfficiency).toBeGreaterThanOrEqual(0);
    });

    it('应该返回全局统计信息', async () => {
      // 📋 Arrange
      const createData1 = NetworkTestFactory.createNetworkData({ name: 'Network 1' });
      const createData2 = NetworkTestFactory.createNetworkData({ name: 'Network 2' });
      await service.createNetwork(createData1);
      await service.createNetwork(createData2);

      // 🎬 Act
      const globalStats = await service.getGlobalStatistics();

      // ✅ Assert
      expect(globalStats).toBeDefined();
      expect(globalStats.totalNetworks).toBeGreaterThanOrEqual(2);
      expect(globalStats.totalNodes).toBeGreaterThanOrEqual(0);
      expect(globalStats.totalEdges).toBeGreaterThanOrEqual(0);
      expect(globalStats.topologyDistribution).toBeDefined();
      expect(globalStats.statusDistribution).toBeDefined();
    });
  });

  describe('网络健康检查功能', () => {
    it('应该正确检查网络健康状态', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData();
      const network = await service.createNetwork(createData);

      // 🎬 Act
      const isHealthy = await service.checkNetworkHealth(network.networkId);

      // ✅ Assert
      expect(typeof isHealthy).toBe('boolean');
    });

    it('应该在网络不存在时返回null', async () => {
      // 🎬 Act
      const result = await service.checkNetworkHealth('non-existent-id');

      // ✅ Assert
      expect(result).toBeNull();
    });
  });

  describe('搜索功能', () => {
    it('应该根据查询条件搜索网络', async () => {
      // 📋 Arrange
      const createData = NetworkTestFactory.createNetworkData({ 
        name: 'Searchable Network',
        description: 'This is a test network for searching'
      });
      await service.createNetwork(createData);

      // 🎬 Act
      const results = await service.searchNetworks('Searchable');

      // ✅ Assert
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(n => n.name.includes('Searchable'))).toBe(true);
    });
  });
});
