/**
 * Network控制器单元测试
 * 
 * @description 基于实际接口的NetworkController测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { NetworkController } from '../../../../src/modules/network/api/controllers/network.controller';
import { NetworkManagementService } from '../../../../src/modules/network/application/services/network-management.service';
import { MemoryNetworkRepository } from '../../../../src/modules/network/infrastructure/repositories/network.repository';
import { NetworkTestFactory } from '../factories/network-test.factory';
import { NetworkEntity } from '../../../../src/modules/network/domain/entities/network.entity';

describe('NetworkController测试', () => {
  let controller: NetworkController;
  let service: NetworkManagementService;
  let repository: MemoryNetworkRepository;

  beforeEach(async () => {
    repository = new MemoryNetworkRepository();
    service = new NetworkManagementService(repository);
    controller = new NetworkController(service);
    await repository.clearCache();
  });

  describe('网络创建API', () => {
    it('应该成功创建网络并返回DTO', async () => {
      // 📋 Arrange
      const createDto = {
        contextId: 'ctx-test-001',
        name: 'Test Network',
        description: 'Test network description',
        topology: 'star' as const,
        nodes: [
          {
            agentId: 'agent-001',
            nodeType: 'coordinator' as const,
            capabilities: ['compute', 'coordination'],
            address: {
              host: 'localhost',
              port: 8001,
              protocol: 'http' as const
            }
          }
        ],
        discoveryMechanism: {
          type: 'registry' as const,
          enabled: true,
          configuration: {}
        },
        routingStrategy: {
          algorithm: 'shortest_path' as const,
          loadBalancing: 'round_robin' as const,
          configuration: {}
        },
        createdBy: 'test-user'
      };

      // 🎬 Act
      const result = await controller.createNetwork(createDto);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Network');
      expect(result.topology).toBe('star');
      expect(result.contextId).toBe('ctx-test-001');
      expect(result.networkId).toBeDefined();
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].agentId).toBe('agent-001');
    });

    it('应该正确设置网络初始状态', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();

      // 🎬 Act
      const result = await controller.createNetwork(createDto);

      // ✅ Assert
      expect(result.status).toBe('pending');
      expect(result.protocolVersion).toBe('1.0.0');
      expect(result.createdAt).toBeDefined();
      expect(result.auditTrail).toEqual([]);
    });
  });

  describe('网络查询API', () => {
    it('应该根据ID获取网络', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const created = await controller.createNetwork(createDto);

      // 🎬 Act
      const result = await controller.getNetworkById(created.networkId);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result!.networkId).toBe(created.networkId);
      expect(result!.name).toBe(created.name);
    });

    it('应该在网络不存在时返回null', async () => {
      // 🎬 Act
      const result = await controller.getNetworkById('non-existent-id');

      // ✅ Assert
      expect(result).toBeNull();
    });

    it('应该根据名称获取网络', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto({ name: 'Unique Network' });
      const created = await controller.createNetwork(createDto);

      // 🎬 Act
      const result = await controller.getNetworkByName('Unique Network');

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result!.networkId).toBe(created.networkId);
      expect(result!.name).toBe('Unique Network');
    });

    it('应该根据上下文ID获取网络列表', async () => {
      // 📋 Arrange
      const contextId = 'ctx-test-context';
      const createDto1 = NetworkTestFactory.createNetworkDto({ contextId, name: 'Network 1' });
      const createDto2 = NetworkTestFactory.createNetworkDto({ contextId, name: 'Network 2' });
      
      await controller.createNetwork(createDto1);
      await controller.createNetwork(createDto2);

      // 🎬 Act
      const results = await controller.getNetworksByContextId(contextId);

      // ✅ Assert
      expect(results).toHaveLength(2);
      expect(results.every(n => n.contextId === contextId)).toBe(true);
    });
  });

  describe('网络更新API', () => {
    it('应该成功更新网络', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const created = await controller.createNetwork(createDto);
      const updateDto = {
        name: 'Updated Network',
        description: 'Updated description',
        status: 'active' as const
      };

      // 🎬 Act
      const result = await controller.updateNetwork(created.networkId, updateDto);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result!.name).toBe('Updated Network');
      expect(result!.description).toBe('Updated description');
      expect(result!.status).toBe('active');
      expect(result!.updatedAt).toBeDefined();
    });

    it('应该在网络不存在时返回null', async () => {
      // 🎬 Act
      const result = await controller.updateNetwork('non-existent-id', { name: 'New Name' });

      // ✅ Assert
      expect(result).toBeNull();
    });
  });

  describe('网络删除API', () => {
    it('应该成功删除网络', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const created = await controller.createNetwork(createDto);

      // 🎬 Act
      const result = await controller.deleteNetwork(created.networkId);

      // ✅ Assert
      expect(result).toBe(true);

      // 验证网络已被删除
      const found = await controller.getNetworkById(created.networkId);
      expect(found).toBeNull();
    });

    it('应该在网络不存在时返回false', async () => {
      // 🎬 Act
      const result = await controller.deleteNetwork('non-existent-id');

      // ✅ Assert
      expect(result).toBe(false);
    });
  });

  describe('节点管理API', () => {
    it('应该成功添加节点', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const network = await controller.createNetwork(createDto);
      const addNodeDto = {
        agentId: 'new-agent',
        nodeType: 'worker' as const,
        capabilities: ['compute'],
        address: {
          host: 'localhost',
          port: 8003,
          protocol: 'http' as const
        }
      };

      // 🎬 Act
      const result = await controller.addNodeToNetwork(network.networkId, addNodeDto);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result!.nodes).toHaveLength(network.nodes.length + 1);
      
      const addedNode = result!.nodes.find(n => n.agentId === 'new-agent');
      expect(addedNode).toBeDefined();
      expect(addedNode!.nodeType).toBe('worker');
    });

    it('应该成功移除节点', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const network = await controller.createNetwork(createDto);
      const nodeToRemove = network.nodes[0];

      // 🎬 Act
      const result = await controller.removeNodeFromNetwork(network.networkId, nodeToRemove.nodeId);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result!.nodes).toHaveLength(network.nodes.length - 1);
      
      const removedNode = result!.nodes.find(n => n.nodeId === nodeToRemove.nodeId);
      expect(removedNode).toBeUndefined();
    });

    it('应该成功更新节点状态', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const network = await controller.createNetwork(createDto);
      const nodeToUpdate = network.nodes[0];

      // 🎬 Act
      const result = await controller.updateNodeStatus(
        network.networkId, 
        nodeToUpdate.nodeId, 
        { status: 'online' }
      );

      // ✅ Assert
      expect(result).toBeDefined();
      
      const updatedNode = result!.nodes.find(n => n.nodeId === nodeToUpdate.nodeId);
      expect(updatedNode).toBeDefined();
      expect(updatedNode!.status).toBe('online');
    });
  });

  describe('边缘连接管理API', () => {
    it('应该成功添加边缘连接', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const network = await controller.createNetwork(createDto);
      const addEdgeDto = {
        sourceNodeId: network.nodes[0].nodeId,
        targetNodeId: network.nodes[1].nodeId,
        edgeType: 'data',
        direction: 'bidirectional' as const,
        weight: 1.5
      };

      // 🎬 Act
      const result = await controller.addEdgeToNetwork(network.networkId, addEdgeDto);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result!.edges).toHaveLength(network.edges.length + 1);
      
      const addedEdge = result!.edges.find(e => 
        e.sourceNodeId === addEdgeDto.sourceNodeId && 
        e.targetNodeId === addEdgeDto.targetNodeId
      );
      expect(addedEdge).toBeDefined();
      expect(addedEdge!.weight).toBe(1.5);
    });
  });

  describe('网络统计API', () => {
    it('应该返回网络统计信息', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const network = await controller.createNetwork(createDto);

      // 🎬 Act
      const stats = await controller.getNetworkStatistics(network.networkId);

      // ✅ Assert
      expect(stats).toBeDefined();
      expect(stats!.totalNodes).toBe(network.nodes.length);
      expect(stats!.totalEdges).toBe(network.edges.length);
      expect(typeof stats!.topologyEfficiency).toBe('number');
    });

    it('应该返回全局统计信息', async () => {
      // 📋 Arrange
      const createDto1 = NetworkTestFactory.createNetworkDto({ name: 'Network 1' });
      const createDto2 = NetworkTestFactory.createNetworkDto({ name: 'Network 2' });
      await controller.createNetwork(createDto1);
      await controller.createNetwork(createDto2);

      // 🎬 Act
      const globalStats = await controller.getGlobalStatistics();

      // ✅ Assert
      expect(globalStats).toBeDefined();
      expect(globalStats.totalNetworks).toBeGreaterThanOrEqual(2);
      expect(globalStats.topologyDistribution).toBeDefined();
      expect(globalStats.statusDistribution).toBeDefined();
    });
  });

  describe('网络健康检查API', () => {
    it('应该检查网络健康状态', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto();
      const network = await controller.createNetwork(createDto);

      // 🎬 Act
      const isHealthy = await controller.checkNetworkHealth(network.networkId);

      // ✅ Assert
      expect(typeof isHealthy).toBe('boolean');
    });

    it('应该在网络不存在时返回null', async () => {
      // 🎬 Act
      const result = await controller.checkNetworkHealth('non-existent-id');

      // ✅ Assert
      expect(result).toBeNull();
    });
  });

  describe('搜索API', () => {
    it('应该搜索网络', async () => {
      // 📋 Arrange
      const createDto = NetworkTestFactory.createNetworkDto({ 
        name: 'Searchable Network',
        description: 'This network can be searched'
      });
      await controller.createNetwork(createDto);

      // 🎬 Act
      const results = await controller.searchNetworks({
        query: 'Searchable',
        filters: { topology: 'star' }
      });

      // ✅ Assert
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
