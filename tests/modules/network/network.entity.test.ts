/**
 * MPLP Network Entity Tests
 * 
 * @version v1.0.0
 * @created 2025-08-02T02:10:00+08:00
 * @description Network实体的单元测试，基于实际实现编写
 */

import { Network } from '../../../src/modules/network/domain/entities/network.entity';
import {
  NetworkEntity,
  NetworkNode,
  NetworkEdge,
  NetworkTopology,
  DiscoveryMechanism,
  RoutingStrategy,
  NetworkStatus,
  NodeType,
  NodeStatus,
  NodeCapability,
  NodeAddress,
  EdgeType,
  EdgeDirection,
  EdgeStatus
} from '../../../src/modules/network/types';

describe('Network Entity', () => {
  let validNetworkData: Partial<NetworkEntity>;

  beforeEach(() => {
    validNetworkData = {
      context_id: 'test-context-001',
      name: 'Test Network',
      description: 'A test network for unit testing',
      topology: 'mesh' as NetworkTopology,
      nodes: [
        {
          node_id: 'node-001',
          agent_id: 'agent-001',
          node_type: 'coordinator' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['network', 'coordination'] as NodeCapability[],
          address: {
            host: '192.168.1.100',
            port: 8080,
            protocol: 'http'
          } as NodeAddress,
          metadata: {
            region: 'us-east-1',
            zone: 'a'
          }
        },
        {
          node_id: 'node-002',
          agent_id: 'agent-002',
          node_type: 'worker' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['compute', 'storage'] as NodeCapability[],
          address: {
            host: '192.168.1.101',
            port: 8080,
            protocol: 'http'
          } as NodeAddress,
          metadata: {
            region: 'us-east-1',
            zone: 'b'
          }
        }
      ],
      edges: [
        {
          edge_id: 'edge-001',
          source_node_id: 'node-001',
          target_node_id: 'node-002',
          edge_type: 'data',
          direction: 'bidirectional',
          status: 'active',
          weight: 1.0,
          metadata: {
            latency: 10,
            bandwidth: 1000
          }
        }
      ],
      discovery_mechanism: {
        type: 'broadcast',
        registry_config: {
          endpoint: 'http://registry.example.com',
          authentication: true,
          refresh_interval: 30000
        }
      } as DiscoveryMechanism,
      routing_strategy: {
        algorithm: 'shortest_path',
        load_balancing: {
          method: 'round_robin'
        }
      } as RoutingStrategy,
      created_by: 'test-user-001',
      metadata: {
        test: true,
        environment: 'unit-test'
      }
    };
  });

  describe('Constructor', () => {
    it('should create network with valid data', () => {
      const network = new Network(validNetworkData);

      expect(network.network_id).toBeDefined();
      expect(network.context_id).toBe(validNetworkData.context_id);
      expect(network.name).toBe(validNetworkData.name);
      expect(network.description).toBe(validNetworkData.description);
      expect(network.topology).toEqual(validNetworkData.topology);
      expect(network.nodes).toHaveLength(2);
      expect(network.edges).toEqual(validNetworkData.edges);
      expect(network.status).toBe('pending');
      expect(network.created_at).toBeDefined();
      expect(network.updated_at).toBeDefined();
    });

    it('should generate unique network_id if not provided', () => {
      const network1 = new Network(validNetworkData);
      const network2 = new Network(validNetworkData);

      expect(network1.network_id).toBeDefined();
      expect(network2.network_id).toBeDefined();
      expect(network1.network_id).not.toBe(network2.network_id);
    });

    it('should use provided network_id if given', () => {
      const customId = 'custom-network-id';
      const dataWithId = { ...validNetworkData, network_id: customId };
      const network = new Network(dataWithId);

      expect(network.network_id).toBe(customId);
    });

    it('should set default values correctly', () => {
      const minimalData = {
        context_id: 'test-context',
        name: 'Test Network',
        topology: validNetworkData.topology!,
        discovery_mechanism: validNetworkData.discovery_mechanism!,
        routing_strategy: validNetworkData.routing_strategy!,
        created_by: 'test-user'
      };

      const network = new Network(minimalData);

      expect(network.version).toBe('1.0.0');
      expect(network.status).toBe('pending');
      expect(network.nodes).toEqual([]);
      expect(network.timestamp).toBeDefined();
    });

    it('should throw error for missing required fields', () => {
      expect(() => new Network({})).toThrow();
      expect(() => new Network({ context_id: 'test' })).toThrow();
      expect(() => new Network({ 
        context_id: 'test', 
        name: 'test' 
      })).toThrow();
    });
  });

  describe('Business Methods', () => {
    let network: Network;

    beforeEach(() => {
      network = new Network(validNetworkData);
    });

    describe('addNode', () => {
      it('should add node successfully', () => {
        const newNode = {
          agent_id: 'agent-003',
          node_type: 'worker' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['compute'] as NodeCapability[],
          address: {
            host: '192.168.1.102',
            port: 8080,
            protocol: 'http'
          } as NodeAddress
        };

        const initialCount = network.nodes.length;
        network.addNode(newNode);

        expect(network.nodes).toHaveLength(initialCount + 1);
        const addedNode = network.nodes[network.nodes.length - 1];
        expect(addedNode.agent_id).toBe(newNode.agent_id);
        expect(addedNode.node_id).toBeDefined();
      });

      it('should throw error when adding duplicate agent', () => {
        const duplicateNode = {
          agent_id: 'agent-001', // 已存在的agent
          node_type: 'worker' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['compute'] as NodeCapability[]
        };

        expect(() => network.addNode(duplicateNode))
          .toThrow('Agent已经是网络节点');
      });

      it('should throw error when adding duplicate address', () => {
        const duplicateAddressNode = {
          agent_id: 'agent-003',
          node_type: 'worker' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['compute'] as NodeCapability[],
          address: {
            host: '192.168.1.100', // 已存在的地址
            port: 8080,
            protocol: 'http'
          } as NodeAddress
        };

        expect(() => network.addNode(duplicateAddressNode))
          .toThrow('地址已被使用: 192.168.1.100:8080');
      });

      it('should throw error when node limit reached', () => {
        // 创建一个有很多节点的网络来测试限制
        const manyNodes: NetworkNode[] = [];
        for (let i = 0; i < 1000; i++) {
          manyNodes.push({
            node_id: `node-${i}`,
            agent_id: `agent-${i}`,
            node_type: 'worker' as NodeType,
            status: 'active' as NodeStatus,
            capabilities: ['compute'] as NodeCapability[]
          });
        }

        const networkWithManyNodes = new Network({
          ...validNetworkData,
          nodes: manyNodes
        });

        const newNode = {
          agent_id: 'agent-new',
          node_type: 'worker' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['compute'] as NodeCapability[]
        };

        expect(() => networkWithManyNodes.addNode(newNode))
          .toThrow('网络节点数量已达上限');
      });
    });

    describe('removeNode', () => {
      it('should remove node successfully', () => {
        const nodeToRemove = network.nodes[0];
        const initialCount = network.nodes.length;

        network.removeNode(nodeToRemove.node_id);

        expect(network.nodes).toHaveLength(initialCount - 1);
        expect(network.nodes.find(n => n.node_id === nodeToRemove.node_id))
          .toBeUndefined();
      });

      it('should throw error when removing non-existent node', () => {
        expect(() => network.removeNode('non-existent-id'))
          .toThrow('节点不存在');
      });
    });

    describe('updateNode', () => {
      it('should update node successfully', () => {
        const nodeToUpdate = network.nodes[0];
        const updates = {
          status: 'inactive' as NodeStatus,
          capabilities: ['network', 'coordination'] as NodeCapability[]
        };

        network.updateNode(nodeToUpdate.node_id, updates);

        const updatedNode = network.nodes.find(
          n => n.node_id === nodeToUpdate.node_id
        );
        expect(updatedNode?.status).toBe(updates.status);
        expect(updatedNode?.capabilities).toEqual(updates.capabilities);
      });

      it('should throw error when updating non-existent node', () => {
        expect(() => network.updateNode('non-existent-id', { status: 'inactive' as NodeStatus }))
          .toThrow('节点不存在');
      });
    });

    describe('addEdge', () => {
      it('should add edge successfully', () => {
        const newEdge = {
          source_node_id: 'node-001',
          target_node_id: 'node-002',
          edge_type: 'backup' as EdgeType,
          direction: 'bidirectional' as EdgeDirection,
          weight: 2.0,
          status: 'active' as EdgeStatus,
          metadata: {
            latency: 20,
            bandwidth: 500
          }
        };

        const initialCount = network.edges?.length || 0;
        network.addEdge(newEdge);

        expect(network.edges).toHaveLength(initialCount + 1);
        const addedEdge = network.edges![network.edges!.length - 1];
        expect(addedEdge.source_node_id).toBe(newEdge.source_node_id);
        expect(addedEdge.target_node_id).toBe(newEdge.target_node_id);
        expect(addedEdge.edge_id).toBeDefined();
      });

      it('should throw error when adding edge with non-existent nodes', () => {
        const invalidEdge = {
          source_node_id: 'non-existent-node',
          target_node_id: 'node-002',
          edge_type: 'data' as EdgeType,
          direction: 'bidirectional' as EdgeDirection,
          weight: 1.0,
          status: 'active' as EdgeStatus
        };

        expect(() => network.addEdge(invalidEdge))
          .toThrow('源节点不存在');
      });
    });

    describe('updateStatus', () => {
      it('should update status successfully', () => {
        network.updateStatus('active');
        expect(network.status).toBe('active');
      });

      it('should update timestamp when status changes', () => {
        const originalTimestamp = network.updated_at;
        
        setTimeout(() => {
          network.updateStatus('active');
          expect(network.updated_at).not.toBe(originalTimestamp);
        }, 1);
      });
    });

    describe('updateBasicInfo', () => {
      it('should update basic info successfully', () => {
        const updates = {
          name: 'Updated Network Name',
          description: 'Updated description'
        };

        network.updateBasicInfo(updates);

        expect(network.name).toBe(updates.name);
        expect(network.description).toBe(updates.description);
      });
    });

    describe('updateTopology', () => {
      it('should update topology successfully', () => {
        const newTopology: NetworkTopology = 'star';

        network.updateTopology(newTopology);

        expect(network.topology).toEqual(newTopology);
      });
    });

    describe('updateDiscoveryMechanism', () => {
      it('should update discovery mechanism successfully', () => {
        const newDiscovery: DiscoveryMechanism = {
          type: 'registry',
          registry_config: {
            endpoint: 'http://new-registry.example.com',
            authentication: false,
            refresh_interval: 60000
          }
        };

        network.updateDiscoveryMechanism(newDiscovery);

        expect(network.discovery_mechanism).toEqual(newDiscovery);
      });
    });

    describe('updateRoutingStrategy', () => {
      it('should update routing strategy successfully', () => {
        const newRouting: RoutingStrategy = {
          algorithm: 'load_balanced',
          load_balancing: {
            method: 'weighted'
          }
        };

        network.updateRoutingStrategy(newRouting);

        expect(network.routing_strategy).toEqual(newRouting);
      });
    });
  });

  describe('Getters', () => {
    let network: Network;

    beforeEach(() => {
      network = new Network(validNetworkData);
    });

    it('should return correct property values', () => {
      expect(network.network_id).toBeDefined();
      expect(network.version).toBe('1.0.0');
      expect(network.context_id).toBe(validNetworkData.context_id);
      expect(network.name).toBe(validNetworkData.name);
      expect(network.description).toBe(validNetworkData.description);
      expect(network.topology).toEqual(validNetworkData.topology);
      expect(network.nodes).toEqual(validNetworkData.nodes);
      expect(network.edges).toEqual(validNetworkData.edges);
      expect(network.discovery_mechanism).toEqual(validNetworkData.discovery_mechanism);
      expect(network.routing_strategy).toEqual(validNetworkData.routing_strategy);
      expect(network.status).toBe('pending');
      expect(network.created_by).toBe(validNetworkData.created_by);
      expect(network.metadata).toEqual(validNetworkData.metadata);
    });
  });

  describe('Object Conversion', () => {
    let network: Network;

    beforeEach(() => {
      network = new Network(validNetworkData);
    });

    it('should convert to object correctly', () => {
      const obj = network.toObject();

      expect(obj.network_id).toBe(network.network_id);
      expect(obj.context_id).toBe(network.context_id);
      expect(obj.name).toBe(network.name);
      expect(obj.topology).toEqual(network.topology);
      expect(obj.nodes).toEqual(network.nodes);
      expect(obj.status).toBe(network.status);
    });

    it('should create network from object correctly', () => {
      const obj = network.toObject();
      const newNetwork = Network.fromObject(obj);

      expect(newNetwork.network_id).toBe(obj.network_id);
      expect(newNetwork.context_id).toBe(obj.context_id);
      expect(newNetwork.name).toBe(obj.name);
      expect(newNetwork.topology).toEqual(obj.topology);
      expect(newNetwork.nodes).toEqual(obj.nodes);
      expect(newNetwork.status).toBe(obj.status);
    });
  });

  describe('Node Management Extended', () => {
    let network: Network;

    beforeEach(() => {
      // 创建空网络，避免与validNetworkData中的节点冲突
      network = new Network({
        context_id: 'test-context-001',
        name: 'Test Network',
        topology: 'mesh',
        discovery_mechanism: {
          type: 'broadcast',
          registry_config: {
            endpoint: 'http://registry:8080',
            authentication: false,
            refresh_interval: 30000
          }
        },
        routing_strategy: {
          algorithm: 'shortest_path',
          load_balancing: {
            method: 'round_robin'
          }
        },
        created_by: 'user-001'
      });

      // 添加一些测试节点
      network.addNode({
        agent_id: 'agent-003',
        node_type: 'coordinator',
        status: 'online',
        address: {
          host: '192.168.1.3',
          port: 8080,
          protocol: 'http'
        },
        capabilities: ['coordination', 'network'],
        metadata: { test: true }
      });

      network.addNode({
        agent_id: 'agent-004',
        node_type: 'worker',
        status: 'offline',
        address: {
          host: '192.168.1.4',
          port: 8081,
          protocol: 'http'
        },
        capabilities: ['compute'],
        metadata: { test: true }
      });
    });

    describe('updateNodeStatus', () => {
      it('应该成功更新节点状态', () => {
        const nodeId = network.nodes[0].node_id;
        network.updateNodeStatus(nodeId, 'offline');

        const updatedNode = network.findNode(nodeId);
        expect(updatedNode?.status).toBe('offline');
      });

      it('应该防止更新不存在节点的状态', () => {
        expect(() => network.updateNodeStatus('non-existent', 'offline'))
          .toThrow('节点不存在');
      });
    });

    describe('updateNodeAddress', () => {
      it('应该成功更新节点地址', () => {
        const nodeId = network.nodes[0].node_id;
        const newAddress = {
          host: '192.168.1.100',
          port: 9090,
          protocol: 'https' as const
        };

        network.updateNodeAddress(nodeId, newAddress);

        const updatedNode = network.findNode(nodeId);
        expect(updatedNode?.address).toEqual(newAddress);
      });

      it('应该防止更新不存在节点的地址', () => {
        const newAddress = {
          host: '192.168.1.100',
          port: 9090,
          protocol: 'https' as const
        };

        expect(() => network.updateNodeAddress('non-existent', newAddress))
          .toThrow('节点不存在');
      });

      it('应该防止地址冲突', () => {
        const nodeId = network.nodes[0].node_id;
        const conflictAddress = network.nodes[1].address!; // 使用已存在的地址

        expect(() => network.updateNodeAddress(nodeId, conflictAddress))
          .toThrow('地址已被使用');
      });
    });

    describe('findNode methods', () => {
      it('应该通过node_id查找节点', () => {
        const nodeId = network.nodes[0].node_id;
        const foundNode = network.findNode(nodeId);

        expect(foundNode).toBeDefined();
        expect(foundNode?.node_id).toBe(nodeId);
      });

      it('应该通过agent_id查找节点', () => {
        const foundNode = network.findNodeByAgentId('agent-003');

        expect(foundNode).toBeDefined();
        expect(foundNode?.agent_id).toBe('agent-003');
      });

      it('应该通过类型查找节点', () => {
        const coordinatorNodes = network.findNodesByType('coordinator');
        const workerNodes = network.findNodesByType('worker');

        expect(coordinatorNodes).toHaveLength(1);
        expect(workerNodes).toHaveLength(1);
        expect(coordinatorNodes[0].node_type).toBe('coordinator');
      });

      it('应该通过能力查找节点', () => {
        const networkNodes = network.findNodesByCapability('network');
        const computeNodes = network.findNodesByCapability('compute');

        expect(networkNodes).toHaveLength(1);
        expect(computeNodes).toHaveLength(1);
        expect(networkNodes[0].capabilities).toContain('network');
      });

      it('应该获取在线节点', () => {
        const onlineNodes = network.getOnlineNodes();

        expect(onlineNodes).toHaveLength(1);
        expect(onlineNodes[0].status).toBe('online');
      });
    });

    describe('getNetworkHealth', () => {
      it('应该计算网络健康度', () => {
        const health = network.getNetworkHealth();

        // 2个节点中有1个在线，健康度应该是0.5
        expect(health).toBe(0.5);
      });

      it('应该处理没有节点的情况', () => {
        const emptyNetwork = new Network({
          context_id: 'context-001',
          name: 'Empty Network',
          topology: 'mesh',
          discovery_mechanism: {
            type: 'broadcast',
            interval: 30000,
            timeout: 5000
          },
          routing_strategy: {
            algorithm: 'shortest_path',
            load_balancing: true,
            failover: true
          },
          created_by: 'user-001'
        });

        expect(emptyNetwork.getNetworkHealth()).toBe(0);
      });
    });
  });

  describe('Network State Management', () => {
    let network: Network;

    beforeEach(() => {
      // 创建空网络，避免与validNetworkData中的节点冲突
      network = new Network({
        context_id: 'test-context-001',
        name: 'Test Network',
        topology: 'mesh',
        discovery_mechanism: {
          type: 'broadcast',
          registry_config: {
            endpoint: 'http://registry:8080',
            authentication: false,
            refresh_interval: 30000
          }
        },
        routing_strategy: {
          algorithm: 'shortest_path',
          load_balancing: {
            method: 'round_robin'
          }
        },
        created_by: 'user-001'
      });

      // 添加一个节点以满足启动条件
      network.addNode({
        agent_id: 'agent-005',
        node_type: 'coordinator',
        status: 'online',
        address: {
          host: '192.168.1.5',
          port: 8080,
          protocol: 'http'
        },
        capabilities: ['coordination'],
        metadata: { test: true }
      });
    });

    describe('start', () => {
      it('应该成功启动网络', () => {
        network.start();
        expect(network.status).toBe('active');
      });

      it('应该防止非pending状态启动网络', () => {
        network.start();
        expect(() => network.start()).toThrow('无法启动网络，当前状态: active');
      });

      it('应该防止没有节点时启动', () => {
        const emptyNetwork = new Network({
          context_id: 'context-001',
          name: 'Empty Network',
          topology: 'mesh',
          discovery_mechanism: {
            type: 'broadcast',
            registry_config: {
              endpoint: 'http://registry:8080',
              authentication: false,
              refresh_interval: 30000
            }
          },
          routing_strategy: {
            algorithm: 'shortest_path',
            load_balancing: {
              method: 'round_robin'
            }
          },
          created_by: 'user-001'
        });

        expect(() => emptyNetwork.start()).toThrow('网络至少需要1个节点才能启动');
      });
    });

    describe('pause', () => {
      it('应该成功暂停网络', () => {
        network.start();
        network.pause();
        expect(network.status).toBe('inactive');
      });

      it('应该防止非active状态暂停网络', () => {
        expect(() => network.pause()).toThrow('无法暂停网络，当前状态: pending');
      });
    });

    describe('resume', () => {
      it('应该成功恢复网络', () => {
        network.start();
        network.pause();
        network.resume();
        expect(network.status).toBe('active');
      });

      it('应该防止非inactive状态恢复网络', () => {
        expect(() => network.resume()).toThrow('无法恢复网络，当前状态: pending');
      });
    });

    describe('complete', () => {
      it('应该成功完成网络 - 从active状态', () => {
        network.start();
        network.complete();
        expect(network.status).toBe('completed');
      });

      it('应该成功完成网络 - 从inactive状态', () => {
        network.start();
        network.pause();
        network.complete();
        expect(network.status).toBe('completed');
      });

      it('应该防止无效状态完成网络', () => {
        expect(() => network.complete()).toThrow('无法完成网络，当前状态: pending');
      });
    });

    describe('cancel', () => {
      it('应该成功取消网络', () => {
        network.cancel();
        expect(network.status).toBe('cancelled');
      });

      it('应该防止已完成的网络取消', () => {
        network.start();
        network.complete();
        expect(() => network.cancel()).toThrow('无法取消网络，当前状态: completed');
      });

      it('应该防止已取消的网络再次取消', () => {
        network.cancel();
        expect(() => network.cancel()).toThrow('无法取消网络，当前状态: cancelled');
      });
    });

    describe('fail', () => {
      it('应该成功标记网络失败并记录原因', () => {
        // 确保网络有metadata
        network.updateMetadata({ test: true });

        const reason = 'Network connection lost';
        network.fail(reason);
        expect(network.status).toBe('failed');
        expect(network.metadata?.failure_reason).toBe(reason);
      });

      it('应该成功标记网络失败但不记录原因', () => {
        network.fail();
        expect(network.status).toBe('failed');
      });
    });
  });

  describe('Update Methods', () => {
    let network: Network;

    beforeEach(() => {
      network = new Network(validNetworkData);
    });

    describe('updateMetadata', () => {
      it('应该成功更新元数据', async () => {
        const originalUpdatedAt = network.updated_at;

        // 等待一毫秒确保时间戳不同
        await new Promise(resolve => setTimeout(resolve, 2));

        network.updateMetadata({
          new: 'metadata',
          version: '2.0'
        });

        expect(network.metadata?.new).toBe('metadata');
        expect(network.metadata?.version).toBe('2.0');
        expect(network.updated_at).not.toBe(originalUpdatedAt);
      });
    });

    describe('updateStatus', () => {
      beforeEach(() => {
        // 添加节点以满足启动条件
        network.addNode({
          agent_id: 'agent-006',
          node_type: 'coordinator',
          status: 'online',
          address: {
            host: '192.168.1.6',
            port: 8080,
            protocol: 'http'
          },
          capabilities: ['coordination'],
          metadata: { test: true }
        });
      });

      it('应该通过updateStatus启动网络', () => {
        network.updateStatus('active');
        expect(network.status).toBe('active');
      });

      it('应该通过updateStatus暂停网络', () => {
        network.start();
        network.updateStatus('inactive');
        expect(network.status).toBe('inactive');
      });

      it('应该通过updateStatus恢复网络', () => {
        network.start();
        network.pause();
        network.updateStatus('active');
        expect(network.status).toBe('active');
      });

      it('应该通过updateStatus完成网络', () => {
        network.start();
        network.updateStatus('completed');
        expect(network.status).toBe('completed');
      });

      it('应该通过updateStatus取消网络', () => {
        network.updateStatus('cancelled');
        expect(network.status).toBe('cancelled');
      });

      it('应该通过updateStatus标记失败', () => {
        network.updateStatus('failed');
        expect(network.status).toBe('failed');
      });

      it('应该处理pending状态', () => {
        network.start();
        network.updateStatus('pending');
        expect(network.status).toBe('pending');
      });
    });
  });
});
