/**
 * Network模块功能场景测试
 * 
 * 基于真实用户需求和实际源代码实现的功能场景测试，确保90%功能场景覆盖率
 * 
 * 测试目的：发现源代码和源功能中的不足，从用户角度验证功能是否满足实际需求
 * 
 * 用户真实场景：
 * 1. 网络管理员需要创建和管理网络拓扑
 * 2. 系统管理员需要管理节点和路由
 * 3. 开发者需要集成网络发现功能
 * 4. 运维人员需要监控网络状态和性能
 * 5. 架构师需要设计分布式网络架构
 * 6. 用户需要可靠的网络通信
 * 
 * @version 1.0.0
 * @created 2025-08-02
 */

import { NetworkService } from '../../src/modules/network/application/services/network.service';
import { Network } from '../../src/modules/network/domain/entities/network.entity';
import { NetworkRepository, NodeDiscoveryRepository, RoutingRepository } from '../../src/modules/network/domain/repositories/network.repository';
import { IEventBus } from '../../src/core/event-bus';
import { 
  CreateNetworkRequest, 
  UpdateNetworkRequest,
  NetworkQueryParams,
  NodeDiscoveryRequest,
  NodeRegistrationRequest,
  RoutingRequest,
  AddNodeRequest,
  RemoveNodeRequest,
  UpdateNodeRequest,
  NetworkResponse,
  NetworkListResponse,
  NodeDiscoveryResponse,
  RoutingResponse,
  NetworkNode,
  NetworkTopology,
  DiscoveryMechanism,
  RoutingStrategy,
  NodeType,
  NodeStatus,
  NodeCapability,
  NodeAddress,
  RoutingResult,
  NetworkStatus
} from '../../src/modules/network/types';
import { v4 as uuidv4 } from 'uuid';

describe('Network模块功能场景测试 - 基于真实用户需求', () => {
  let networkService: NetworkService;
  let mockNetworkRepository: jest.Mocked<NetworkRepository>;
  let mockNodeDiscoveryRepository: jest.Mocked<NodeDiscoveryRepository>;
  let mockRoutingRepository: jest.Mocked<RoutingRepository>;
  let mockEventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    // 基于实际接口创建Mock依赖
    mockNetworkRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByContextId: jest.fn(),
      findByQuery: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
      deleteBatch: jest.fn(),
      updateStatus: jest.fn(),
      getStatistics: jest.fn()
    } as unknown as jest.Mocked<NetworkRepository>;

    mockNodeDiscoveryRepository = {
      registerNode: jest.fn(),
      unregisterNode: jest.fn(),
      discoverNodes: jest.fn(),
      findNodesByCapability: jest.fn(),
      findNodesByType: jest.fn(),
      updateNodeStatus: jest.fn(),
      getNodeHealth: jest.fn()
    } as unknown as jest.Mocked<NodeDiscoveryRepository>;

    mockRoutingRepository = {
      calculateRoute: jest.fn(),
      cacheRoute: jest.fn(),
      getCachedRoute: jest.fn(),
      clearRouteCache: jest.fn(),
      updateRoutingTable: jest.fn(),
      getRoutingStatistics: jest.fn()
    } as unknown as jest.Mocked<RoutingRepository>;

    mockEventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn()
    } as unknown as jest.Mocked<IEventBus>;

    // 创建服务实例 - 基于实际构造函数
    networkService = new NetworkService(
      mockNetworkRepository, 
      mockNodeDiscoveryRepository, 
      mockRoutingRepository, 
      mockEventBus
    );
  });

  describe('1. 网络拓扑管理场景 - 网络管理员日常使用', () => {
    describe('基本网络创建 - 用户最常见的需求', () => {
      it('应该让管理员能够创建一个基本的星型网络', async () => {
        // 用户场景：网络管理员创建一个中心化的星型网络
        const contextId = uuidv4();
        
        // Mock仓库返回值
        mockNetworkRepository.save.mockResolvedValue();
        mockNodeDiscoveryRepository.registerNode.mockResolvedValue();

        const createRequest: CreateNetworkRequest = {
          context_id: contextId,
          name: '企业内部网络',
          description: '企业内部AI Agent通信网络',
          topology: 'star',
          nodes: [
            {
              agent_id: 'central-coordinator',
              node_type: 'coordinator',
              status: 'online',
              capabilities: ['coordination', 'routing', 'monitoring'],
              address: {
                host: '192.168.1.100',
                port: 8080,
                protocol: 'http'
              }
            },
            {
              agent_id: 'worker-agent-1',
              node_type: 'worker',
              status: 'online',
              capabilities: ['processing', 'storage'],
              address: {
                host: '192.168.1.101',
                port: 8080,
                protocol: 'http'
              }
            },
            {
              agent_id: 'worker-agent-2',
              node_type: 'worker',
              status: 'online',
              capabilities: ['processing', 'analytics'],
              address: {
                host: '192.168.1.102',
                port: 8080,
                protocol: 'http'
              }
            }
          ],
          discovery_mechanism: {
            type: 'registry',
            registry_config: {
              endpoint: 'http://registry.company.com:8080',
              authentication: true,
              refresh_interval: 30000
            }
          },
          routing_strategy: {
            algorithm: 'shortest_path',
            load_balancing: {
              method: 'round_robin'
            }
          },
          metadata: {
            environment: 'production',
            department: 'IT',
            priority: 'high'
          }
        };

        const result = await networkService.createNetwork(createRequest);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.name).toBe('企业内部网络');
        expect(result.data?.topology).toBe('star');
        expect(result.data?.nodes).toHaveLength(3);
        expect(result.data?.status).toBe('pending');
        
        // 验证仓库调用
        expect(mockNetworkRepository.save).toHaveBeenCalledWith(expect.any(Network));
        
        // 验证节点注册
        expect(mockNodeDiscoveryRepository.registerNode).toHaveBeenCalledTimes(3);
        
        // 验证事件发布
        expect(mockEventBus.publish).toHaveBeenCalledWith('network_created', expect.objectContaining({
          network_id: expect.any(String),
          context_id: contextId,
          name: '企业内部网络',
          topology: 'star',
          nodes_count: 3
        }));
      });

      it('应该让管理员能够创建一个高可用的网状网络', async () => {
        // 用户场景：管理员创建一个去中心化的网状网络
        const contextId = uuidv4();
        
        mockNetworkRepository.save.mockResolvedValue();
        mockNodeDiscoveryRepository.registerNode.mockResolvedValue();

        const createRequest: CreateNetworkRequest = {
          context_id: contextId,
          name: '分布式AI网络',
          description: '高可用的分布式AI Agent网络',
          topology: 'mesh',
          nodes: [
            {
              agent_id: 'mesh-node-1',
              node_type: 'coordinator',
              status: 'online',
              capabilities: ['coordination', 'backup'],
              address: {
                host: '10.0.1.10',
                port: 9090,
                protocol: 'https'
              }
            },
            {
              agent_id: 'mesh-node-2',
              node_type: 'coordinator',
              status: 'online',
              capabilities: ['coordination', 'backup'],
              address: {
                host: '10.0.1.11',
                port: 9090,
                protocol: 'https'
              }
            },
            {
              agent_id: 'mesh-node-3',
              node_type: 'worker',
              status: 'online',
              capabilities: ['processing', 'storage'],
              address: {
                host: '10.0.1.12',
                port: 9090,
                protocol: 'https'
              }
            }
          ],
          discovery_mechanism: {
            type: 'broadcast'
          },
          routing_strategy: {
            algorithm: 'adaptive',
            load_balancing: {
              method: 'least_connections'
            }
          }
        };

        const result = await networkService.createNetwork(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.topology).toBe('mesh');
        expect(result.data?.discovery_mechanism.type).toBe('broadcast');
        expect(result.data?.routing_strategy.algorithm).toBe('adaptive');
        expect(result.data?.nodes).toHaveLength(3);
      });

      it('应该验证网络至少需要一个节点', async () => {
        // 用户场景：管理员忘记添加节点
        const contextId = uuidv4();
        
        const createRequest: CreateNetworkRequest = {
          context_id: contextId,
          name: '空网络测试',
          topology: 'star',
          nodes: [], // 没有节点
          discovery_mechanism: {
            type: 'registry'
          },
          routing_strategy: {
            algorithm: 'shortest_path'
          }
        };

        const result = await networkService.createNetwork(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('网络至少需要1个节点才能启动');
        expect(mockNetworkRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('网络拓扑验证 - 防止用户错误', () => {
      it('应该支持所有有效的网络拓扑类型', async () => {
        // 用户场景：验证所有支持的拓扑类型
        const contextId = uuidv4();
        const validTopologies: NetworkTopology[] = ['star', 'mesh', 'tree', 'ring', 'bus', 'hybrid', 'hierarchical'];
        
        mockNetworkRepository.save.mockResolvedValue();
        mockNodeDiscoveryRepository.registerNode.mockResolvedValue();

        for (const topology of validTopologies) {
          const createRequest: CreateNetworkRequest = {
            context_id: contextId,
            name: `${topology}网络测试`,
            topology: topology,
            nodes: [
              {
                agent_id: `${topology}-node-1`,
                node_type: 'coordinator',
                status: 'online',
                capabilities: ['coordination']
              }
            ],
            discovery_mechanism: {
              type: 'registry'
            },
            routing_strategy: {
              algorithm: 'shortest_path'
            }
          };

          const result = await networkService.createNetwork(createRequest);
          expect(result.success).toBe(true);
          expect(result.data?.topology).toBe(topology);
        }
      });
    });

    describe('异常处理 - 系统健壮性', () => {
      it('应该处理创建网络时的数据库异常', async () => {
        // 用户场景：数据库连接失败等系统异常
        const contextId = uuidv4();
        
        mockNetworkRepository.save.mockRejectedValue(new Error('数据库连接失败'));

        const createRequest: CreateNetworkRequest = {
          context_id: contextId,
          name: '测试网络',
          topology: 'star',
          nodes: [
            {
              agent_id: 'test-node',
              node_type: 'coordinator',
              status: 'online',
              capabilities: ['coordination']
            }
          ],
          discovery_mechanism: {
            type: 'registry'
          },
          routing_strategy: {
            algorithm: 'shortest_path'
          }
        };

        const result = await networkService.createNetwork(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('数据库连接失败');
      });
    });
  });

  describe('2. 节点管理场景 - 动态节点操作', () => {
    describe('节点注册 - 扩展网络规模', () => {
      it('应该让管理员能够向网络中注册新节点', async () => {
        // 用户场景：管理员发现需要增加处理能力，添加新的工作节点
        const networkId = uuidv4();
        const contextId = uuidv4();

        // 创建一个现有的网络
        const existingNetwork = new Network({
          network_id: networkId,
          context_id: contextId,
          name: '现有网络',
          topology: 'star',
          nodes: [
            {
              node_id: uuidv4(),
              agent_id: 'existing-coordinator',
              node_type: 'coordinator',
              status: 'online',
              capabilities: ['coordination'],
              address: {
                host: '192.168.1.100',
                port: 8080,
                protocol: 'http'
              }
            }
          ],
          discovery_mechanism: {
            type: 'registry'
          },
          routing_strategy: {
            algorithm: 'shortest_path'
          },
          created_by: contextId
        });

        mockNetworkRepository.findById.mockResolvedValue(existingNetwork);
        mockNetworkRepository.save.mockResolvedValue();
        mockNodeDiscoveryRepository.registerNode.mockResolvedValue();

        const nodeRegistrationRequest: NodeRegistrationRequest = {
          network_id: networkId,
          agent_id: 'new-worker-ai',
          node_type: 'worker',
          capabilities: ['processing', 'analytics'],
          address: {
            host: '192.168.1.103',
            port: 8080,
            protocol: 'http'
          }
        };

        const result = await networkService.registerNode(nodeRegistrationRequest);

        expect(result.success).toBe(true);
        expect(mockNetworkRepository.findById).toHaveBeenCalledWith(networkId);
        expect(mockNetworkRepository.save).toHaveBeenCalledWith(existingNetwork);
        expect(mockNodeDiscoveryRepository.registerNode).toHaveBeenCalledWith(
          networkId,
          expect.objectContaining({
            agent_id: 'new-worker-ai',
            node_type: 'worker'
          })
        );
        expect(mockEventBus.publish).toHaveBeenCalledWith('node_registered', expect.objectContaining({
          network_id: networkId,
          agent_id: 'new-worker-ai',
          node_type: 'worker'
        }));
      });

      it('应该处理网络不存在的情况', async () => {
        // 用户场景：尝试向不存在的网络注册节点
        const nonExistentNetworkId = uuidv4();

        mockNetworkRepository.findById.mockResolvedValue(null);

        const nodeRegistrationRequest: NodeRegistrationRequest = {
          network_id: nonExistentNetworkId,
          agent_id: 'new-node',
          node_type: 'worker',
          capabilities: ['processing']
        };

        const result = await networkService.registerNode(nodeRegistrationRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('网络不存在');
        expect(mockNetworkRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('节点发现 - 自动化网络管理', () => {
      it('应该让系统能够发现网络中的可用节点', async () => {
        // 用户场景：系统管理员需要查看网络中所有可用的节点
        const networkId = uuidv4();

        const discoveredNodes: NetworkNode[] = [
          {
            node_id: uuidv4(),
            agent_id: 'discovered-node-1',
            node_type: 'worker',
            status: 'online',
            capabilities: ['processing'],
            address: {
              host: '192.168.1.201',
              port: 8080,
              protocol: 'http'
            }
          },
          {
            node_id: uuidv4(),
            agent_id: 'discovered-node-2',
            node_type: 'gateway',
            status: 'online',
            capabilities: ['gateway', 'security'],
            address: {
              host: '192.168.1.202',
              port: 8080,
              protocol: 'https'
            }
          }
        ];

        mockNodeDiscoveryRepository.discoverNodes.mockResolvedValue(discoveredNodes);

        const discoveryRequest: NodeDiscoveryRequest = {
          network_id: networkId,
          discovery_timeout: 5000,
          node_types: ['worker', 'gateway'],
          capabilities: ['processing', 'gateway']
        };

        const result = await networkService.discoverNodes(discoveryRequest);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data?.[0].agent_id).toBe('discovered-node-1');
        expect(result.data?.[1].agent_id).toBe('discovered-node-2');
        expect(mockNodeDiscoveryRepository.discoverNodes).toHaveBeenCalledWith(
          expect.objectContaining({
            network_id: networkId,
            discovery_timeout: 5000,
            node_types: ['worker', 'gateway'],
            capabilities: ['processing', 'gateway']
          })
        );
      });

      it('应该处理节点发现超时的情况', async () => {
        // 用户场景：网络环境不稳定，节点发现超时
        const networkId = uuidv4();

        mockNodeDiscoveryRepository.discoverNodes.mockRejectedValue(new Error('节点发现超时'));

        const discoveryRequest: NodeDiscoveryRequest = {
          network_id: networkId,
          discovery_timeout: 1000
        };

        const result = await networkService.discoverNodes(discoveryRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('节点发现超时');
      });
    });
  });

  describe('3. 路由管理场景 - 智能路径规划', () => {
    describe('路由计算 - 优化网络性能', () => {
      it('应该让系统能够计算最优路由路径', async () => {
        // 用户场景：系统需要在两个节点间找到最优通信路径
        const networkId = uuidv4();
        const sourceNodeId = 'source-node-001';
        const targetNodeId = 'target-node-001';

        const routingResult: RoutingResult = {
          path: [sourceNodeId, 'intermediate-node-001', targetNodeId],
          estimated_latency: 150,
          estimated_cost: 0.5,
          reliability: 0.95,
          alternative_paths: [
            [sourceNodeId, 'intermediate-node-002', targetNodeId],
            [sourceNodeId, 'intermediate-node-003', 'intermediate-node-004', targetNodeId]
          ]
        };

        mockRoutingRepository.calculateRoute.mockResolvedValue(routingResult);

        const routingRequest: RoutingRequest = {
          network_id: networkId,
          source_node_id: sourceNodeId,
          target_node_id: targetNodeId,
          routing_preferences: {
            optimize_for: 'latency',
            max_hops: 5,
            avoid_nodes: ['unreliable-node-001']
          }
        };

        const result = await networkService.calculateRoute(routingRequest);

        expect(result.success).toBe(true);
        expect(result.data?.path).toEqual([sourceNodeId, 'intermediate-node-001', targetNodeId]);
        expect(result.data?.estimated_latency).toBe(150);
        expect(result.data?.reliability).toBe(0.95);
        expect(result.data?.alternative_paths).toHaveLength(2);
        expect(mockRoutingRepository.calculateRoute).toHaveBeenCalledWith(
          expect.objectContaining({
            network_id: networkId,
            source_node_id: sourceNodeId,
            target_node_id: targetNodeId,
            routing_preferences: expect.objectContaining({
              optimize_for: 'latency',
              max_hops: 5,
              avoid_nodes: ['unreliable-node-001']
            })
          })
        );
      });

      it('应该使用缓存的路由结果提高性能', async () => {
        // 用户场景：频繁使用的路由应该被缓存以提高性能
        const networkId = uuidv4();
        const sourceNodeId = 'cached-source';
        const targetNodeId = 'cached-target';

        const cachedRoute: RoutingResult = {
          path: [sourceNodeId, targetNodeId],
          estimated_latency: 50,
          estimated_cost: 0.1,
          reliability: 0.99
        };

        mockRoutingRepository.getCachedRoute.mockResolvedValue(cachedRoute);

        const routingRequest: RoutingRequest = {
          network_id: networkId,
          source_node_id: sourceNodeId,
          target_node_id: targetNodeId
        };

        const result = await networkService.calculateRoute(routingRequest);

        expect(result.success).toBe(true);
        expect(result.data?.path).toEqual([sourceNodeId, targetNodeId]);
        expect(result.data?.estimated_latency).toBe(50);
        expect(mockRoutingRepository.getCachedRoute).toHaveBeenCalledWith(
          expect.objectContaining({
            network_id: networkId,
            source_node_id: sourceNodeId,
            target_node_id: targetNodeId
          })
        );
        // 验证没有调用实际的路由计算
        expect(mockRoutingRepository.calculateRoute).not.toHaveBeenCalled();
      });

      it('应该处理路由计算失败的情况', async () => {
        // 用户场景：网络分区导致无法找到路由
        const networkId = uuidv4();

        mockRoutingRepository.getCachedRoute.mockResolvedValue(null);
        mockRoutingRepository.calculateRoute.mockRejectedValue(new Error('无法找到可用路由'));

        const routingRequest: RoutingRequest = {
          network_id: networkId,
          source_node_id: 'isolated-node-1',
          target_node_id: 'isolated-node-2'
        };

        const result = await networkService.calculateRoute(routingRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('无法找到可用路由');
      });
    });
  });

  describe('4. 网络状态管理场景 - 生命周期控制', () => {
    describe('网络启动 - 激活网络服务', () => {
      it('应该让管理员能够启动一个准备好的网络', async () => {
        // 用户场景：管理员启动一个已配置好的网络
        const networkId = uuidv4();

        const readyNetwork = new Network({
          network_id: networkId,
          context_id: uuidv4(),
          name: '准备启动的网络',
          topology: 'mesh',
          nodes: [
            {
              node_id: uuidv4(),
              agent_id: 'ready-node-1',
              node_type: 'coordinator',
              status: 'online',
              capabilities: ['coordination']
            },
            {
              node_id: uuidv4(),
              agent_id: 'ready-node-2',
              node_type: 'worker',
              status: 'online',
              capabilities: ['processing']
            }
          ],
          discovery_mechanism: {
            type: 'registry'
          },
          routing_strategy: {
            algorithm: 'shortest_path'
          },
          status: 'pending',
          created_by: uuidv4()
        });

        mockNetworkRepository.findById.mockResolvedValue(readyNetwork);
        mockNetworkRepository.save.mockResolvedValue();

        // 通过updateNetwork来启动网络
        const updateRequest: UpdateNetworkRequest = {
          network_id: networkId,
          status: 'active'
        };

        const result = await networkService.updateNetwork(updateRequest);

        expect(result.success).toBe(true);
        expect(result.data?.status).toBe('active');
        expect(mockNetworkRepository.findById).toHaveBeenCalledWith(networkId);
        expect(mockNetworkRepository.save).toHaveBeenCalledWith(readyNetwork);
      });

      it('应该处理网络不存在的情况', async () => {
        // 用户场景：尝试启动不存在的网络
        const nonExistentNetworkId = uuidv4();

        mockNetworkRepository.findById.mockResolvedValue(null);

        const updateRequest: UpdateNetworkRequest = {
          network_id: nonExistentNetworkId,
          status: 'active'
        };

        const result = await networkService.updateNetwork(updateRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('网络不存在');
        expect(mockNetworkRepository.save).not.toHaveBeenCalled();
      });
    });
  });

  describe('5. 网络查询场景 - 信息检索需求', () => {
    describe('基本查询功能', () => {
      it('应该让用户能够根据ID查找网络详情', async () => {
        // 用户场景：用户查看特定网络的详细信息
        const networkId = uuidv4();
        const contextId = uuidv4();

        const network = new Network({
          network_id: networkId,
          context_id: contextId,
          name: '查询测试网络',
          description: '用于测试查询功能的网络',
          topology: 'star',
          nodes: [
            {
              node_id: uuidv4(),
              agent_id: 'query-test-node',
              node_type: 'coordinator',
              status: 'online',
              capabilities: ['coordination']
            }
          ],
          discovery_mechanism: {
            type: 'registry'
          },
          routing_strategy: {
            algorithm: 'shortest_path'
          },
          status: 'active',
          created_by: contextId
        });

        mockNetworkRepository.findById.mockResolvedValue(network);

        const result = await networkService.getNetwork(networkId);

        expect(result.success).toBe(true);
        expect(result.data?.network_id).toBe(networkId);
        expect(result.data?.name).toBe('查询测试网络');
        expect(result.data?.description).toBe('用于测试查询功能的网络');
        expect(result.data?.status).toBe('active');
        expect(result.data?.nodes).toHaveLength(1);
        expect(mockNetworkRepository.findById).toHaveBeenCalledWith(networkId);
      });

      it('应该处理网络不存在的情况', async () => {
        // 用户场景：查询不存在的网络
        const nonExistentNetworkId = uuidv4();

        mockNetworkRepository.findById.mockResolvedValue(null);

        const result = await networkService.getNetwork(nonExistentNetworkId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('网络不存在');
      });

      it('应该让用户能够按条件查询网络列表', async () => {
        // 用户场景：用户查看所有活跃的网络
        const contextId = uuidv4();

        const networks = [
          new Network({
            network_id: uuidv4(),
            context_id: contextId,
            name: '网络1',
            topology: 'star',
            nodes: [],
            discovery_mechanism: { type: 'registry' },
            routing_strategy: { algorithm: 'shortest_path' },
            status: 'active',
            created_by: contextId
          }),
          new Network({
            network_id: uuidv4(),
            context_id: contextId,
            name: '网络2',
            topology: 'mesh',
            nodes: [],
            discovery_mechanism: { type: 'broadcast' },
            routing_strategy: { algorithm: 'adaptive' },
            status: 'active',
            created_by: contextId
          })
        ];

        // 修复：Mock返回正确的格式，包含networks和total
        mockNetworkRepository.findByQuery.mockResolvedValue({
          networks: networks,
          total: networks.length,
          limit: 10,
          offset: 0
        });

        const queryParams: NetworkQueryParams = {
          context_id: contextId,
          status: 'active',
          limit: 10,
          offset: 0
        };

        const result = await networkService.listNetworks(queryParams);

        expect(result.success).toBe(true);
        expect(result.data?.networks).toHaveLength(2);
        expect(result.data?.total).toBe(2);
        expect(result.data?.networks[0].status).toBe('active');
        expect(result.data?.networks[1].status).toBe('active');
        expect(mockNetworkRepository.findByQuery).toHaveBeenCalledWith(queryParams);
      });
    });
  });

  describe('6. 边界条件和异常处理 - 系统健壮性', () => {
    describe('异常处理', () => {
      it('应该处理查询网络时的异常情况', async () => {
        // 用户场景：系统异常导致查询失败
        const networkId = uuidv4();

        mockNetworkRepository.findById.mockRejectedValue(new Error('数据库连接超时'));

        const result = await networkService.getNetwork(networkId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('数据库连接超时');
      });

      it('应该处理节点注册时的异常情况', async () => {
        // 用户场景：系统异常导致节点注册失败
        const networkId = uuidv4();

        mockNetworkRepository.findById.mockRejectedValue(new Error('网络服务不可用'));

        const nodeRegistrationRequest: NodeRegistrationRequest = {
          network_id: networkId,
          agent_id: 'test-node',
          node_type: 'worker',
          capabilities: ['processing']
        };

        const result = await networkService.registerNode(nodeRegistrationRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('网络服务不可用');
      });
    });

    describe('边界条件', () => {
      it('应该处理大规模网络的查询', async () => {
        // 用户场景：系统中有大量节点的网络
        const networkId = uuidv4();
        const contextId = uuidv4();

        // 创建有100个节点的网络
        const nodes = Array.from({ length: 100 }, (_, i) => ({
          node_id: uuidv4(),
          agent_id: `large-network-node-${i}`,
          node_type: 'worker' as NodeType,
          status: 'online' as NodeStatus,
          capabilities: ['processing'] as NodeCapability[]
        }));

        const largeNetwork = new Network({
          network_id: networkId,
          context_id: contextId,
          name: '大规模网络',
          topology: 'mesh',
          nodes: nodes,
          discovery_mechanism: {
            type: 'registry'
          },
          routing_strategy: {
            algorithm: 'shortest_path'
          },
          status: 'active',
          created_by: contextId
        });

        mockNetworkRepository.findById.mockResolvedValue(largeNetwork);

        const result = await networkService.getNetwork(networkId);

        expect(result.success).toBe(true);
        expect(result.data?.nodes).toHaveLength(100);
        expect(result.data?.status).toBe('active');
      });
    });
  });
});
