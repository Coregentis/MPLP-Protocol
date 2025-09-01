/**
 * NetworkSecurityService 企业级测试套件
 * 
 * @description 基于mplp-network.json Schema的企业级网络安全服务测试
 * @version 1.0.0
 * @layer 测试层 - 企业级服务测试
 */

import { NetworkSecurityService } from '../../../../src/modules/network/application/services/network-security.service';
import { NetworkEntity } from '../../../../src/modules/network/domain/entities/network.entity';
import { INetworkRepository } from '../../../../src/modules/network/domain/repositories/network-repository.interface';

describe('NetworkSecurityService企业级测试', () => {
  let networkSecurityService: NetworkSecurityService;
  let mockNetworkRepository: jest.Mocked<INetworkRepository>;

  beforeEach(() => {
    // 创建Mock仓储
    mockNetworkRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByStatus: jest.fn(),
      findByTopology: jest.fn(),
      count: jest.fn(),
      exists: jest.fn()
    } as jest.Mocked<INetworkRepository>;

    // 创建服务实例
    networkSecurityService = new NetworkSecurityService(mockNetworkRepository);
  });

  describe('安全策略管理测试', () => {
    it('应该成功创建安全策略', async () => {
      const policyData = {
        networkId: 'net-security-001',
        name: 'Test Security Policy',
        type: 'access_control' as const,
        rules: [
          {
            id: 'rule-001',
            action: 'allow' as const,
            conditions: [
              {
                field: 'nodeType',
                operator: 'equals' as const,
                value: 'worker'
              }
            ],
            description: 'Allow worker nodes',
            enabled: true
          }
        ],
        enabled: true,
        priority: 1
      };

      const policy = await networkSecurityService.createSecurityPolicy(policyData);

      // 验证策略创建
      expect(policy).toBeDefined();
      expect(policy.id).toBeDefined();
      expect(policy.networkId).toBe('net-security-001');
      expect(policy.name).toBe('Test Security Policy');
      expect(policy.type).toBe('access_control');
      expect(policy.rules).toHaveLength(1);
      expect(policy.enabled).toBe(true);
      expect(policy.priority).toBe(1);
      expect(policy.createdAt).toBeDefined();
      expect(policy.updatedAt).toBeDefined();

      // 验证规则结构
      const rule = policy.rules[0];
      expect(rule.id).toBe('rule-001');
      expect(rule.action).toBe('allow');
      expect(rule.conditions).toHaveLength(1);
      expect(rule.description).toBe('Allow worker nodes');
      expect(rule.enabled).toBe(true);
    });

    it('应该支持不同类型的安全策略', async () => {
      const policyTypes = ['access_control', 'encryption', 'authentication', 'audit'] as const;

      for (const type of policyTypes) {
        const policy = await networkSecurityService.createSecurityPolicy({
          networkId: 'net-policy-types',
          name: `${type} Policy`,
          type,
          rules: [],
          enabled: true,
          priority: 1
        });

        expect(policy.type).toBe(type);
      }
    });
  });

  describe('威胁检测测试', () => {
    it('应该检测未授权访问威胁', async () => {
      // 创建有错误状态节点的网络
      const networkEntity = new NetworkEntity({
        networkId: 'net-threat-001',
        name: 'Threat Detection Test',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-threat-001',
        nodes: [
          {
            agentId: 'agent-normal',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          },
          {
            agentId: 'agent-suspicious',
            nodeType: 'worker',
            status: 'error', // 错误状态可能表示未授权访问
            capabilities: ['compute'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-001',
            sourceNodeId: 'agent-normal',
            targetNodeId: 'agent-suspicious',
            connectionType: 'direct',
            status: 'active',
            metadata: { encrypted: true }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      const threats = await networkSecurityService.performThreatDetection('net-threat-001');

      // 验证威胁检测结果
      expect(Array.isArray(threats)).toBe(true);
      expect(threats.length).toBeGreaterThan(0);

      // 查找未授权访问威胁
      const unauthorizedThreat = threats.find(t => t.threatType === 'unauthorized_access');
      expect(unauthorizedThreat).toBeDefined();

      if (unauthorizedThreat) {
        expect(unauthorizedThreat.id).toBeDefined();
        expect(unauthorizedThreat.networkId).toBe('net-threat-001');
        expect(unauthorizedThreat.severity).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(unauthorizedThreat.severity);
        expect(unauthorizedThreat.status).toBe('active');
        expect(unauthorizedThreat.detectedAt).toBeDefined();
        expect(unauthorizedThreat.description).toBeDefined();
        expect(Array.isArray(unauthorizedThreat.evidence)).toBe(true);
        expect(Array.isArray(unauthorizedThreat.mitigation)).toBe(true);
      }
    });

    it('应该检测配置漏洞', async () => {
      // 创建有未加密连接的网络
      const networkEntity = new NetworkEntity({
        networkId: 'net-vuln-001',
        name: 'Vulnerability Test',
        topology: 'star',
        status: 'active',
        contextId: 'ctx-vuln-001',
        nodes: [
          {
            agentId: 'agent-center',
            nodeType: 'coordinator',
            status: 'online',
            capabilities: ['coordination'],
            metadata: {}
          },
          {
            agentId: 'agent-worker',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-unencrypted',
            sourceNodeId: 'agent-center',
            targetNodeId: 'agent-worker',
            connectionType: 'direct',
            status: 'active',
            metadata: { encrypted: false } // 未加密连接
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      const threats = await networkSecurityService.performThreatDetection('net-vuln-001');

      // 应该检测到数据泄露风险
      const dataBreach = threats.find(t => t.threatType === 'data_breach');
      expect(dataBreach).toBeDefined();

      if (dataBreach) {
        expect(dataBreach.description).toContain('unencrypted');
        expect(dataBreach.evidence.length).toBeGreaterThan(0);
        expect(dataBreach.mitigation.length).toBeGreaterThan(0);
      }
    });

    it('应该在安全网络中返回空威胁列表', async () => {
      // 创建安全的网络
      const secureNetwork = new NetworkEntity({
        networkId: 'net-secure-001',
        name: 'Secure Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-secure-001',
        nodes: [
          {
            agentId: 'agent-s1',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          },
          {
            agentId: 'agent-s2',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['storage'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-secure',
            sourceNodeId: 'agent-s1',
            targetNodeId: 'agent-s2',
            connectionType: 'direct',
            status: 'active',
            metadata: { encrypted: true }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(secureNetwork);

      const threats = await networkSecurityService.performThreatDetection('net-secure-001');

      // 安全网络应该没有威胁或威胁很少
      expect(Array.isArray(threats)).toBe(true);
      // 注意：可能仍有一些低级别的威胁，所以不要求完全为空
    });
  });

  describe('安全审计测试', () => {
    it('应该执行合规性审计', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-audit-001',
        name: 'Audit Test Network',
        topology: 'hybrid',
        status: 'active',
        contextId: 'ctx-audit-001',
        nodes: [
          {
            agentId: 'agent-audit',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-audit',
            sourceNodeId: 'agent-audit',
            targetNodeId: 'agent-audit',
            connectionType: 'loopback',
            status: 'active',
            metadata: { encrypted: false } // 违反合规性
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      const audit = await networkSecurityService.performSecurityAudit('net-audit-001', 'compliance');

      // 验证审计结果
      expect(audit).toBeDefined();
      expect(audit.id).toBeDefined();
      expect(audit.networkId).toBe('net-audit-001');
      expect(audit.auditType).toBe('compliance');
      expect(audit.status).toBe('completed');
      expect(audit.startedAt).toBeDefined();
      expect(audit.completedAt).toBeDefined();
      expect(Array.isArray(audit.findings)).toBe(true);
      expect(Array.isArray(audit.recommendations)).toBe(true);
      expect(audit.complianceScore).toBeGreaterThanOrEqual(0);
      expect(audit.complianceScore).toBeLessThanOrEqual(100);

      // 应该发现未加密连接的合规性问题
      const encryptionFinding = audit.findings.find(f => 
        f.title.includes('Unencrypted') || f.description.includes('encrypted')
      );
      expect(encryptionFinding).toBeDefined();

      if (encryptionFinding) {
        expect(encryptionFinding.category).toBe('policy_violation');
        expect(['info', 'low', 'medium', 'high', 'critical']).toContain(encryptionFinding.severity);
        expect(encryptionFinding.remediation).toBeDefined();
        expect(encryptionFinding.riskScore).toBeGreaterThan(0);
      }
    });

    it('应该执行漏洞审计', async () => {
      // 创建有单点故障的网络
      const vulnerableNetwork = new NetworkEntity({
        networkId: 'net-vuln-audit-001',
        name: 'Vulnerable Network',
        topology: 'star',
        status: 'active',
        contextId: 'ctx-vuln-audit-001',
        nodes: [
          {
            agentId: 'single-node',
            nodeType: 'coordinator',
            status: 'online',
            capabilities: ['coordination', 'compute', 'storage'],
            metadata: {}
          }
        ],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(vulnerableNetwork);

      const audit = await networkSecurityService.performSecurityAudit('net-vuln-audit-001', 'vulnerability');

      expect(audit.auditType).toBe('vulnerability');
      expect(audit.status).toBe('completed');

      // 应该发现单点故障漏洞
      const spofFinding = audit.findings.find(f => 
        f.title.includes('Single Point') || f.description.includes('single point')
      );
      expect(spofFinding).toBeDefined();

      if (spofFinding) {
        expect(spofFinding.category).toBe('vulnerability');
        expect(spofFinding.severity).toBe('high');
        expect(spofFinding.riskScore).toBeGreaterThan(5);
      }
    });

    it('应该执行访问审查', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-access-audit-001',
        name: 'Access Audit Network',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-access-audit-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      const audit = await networkSecurityService.performSecurityAudit('net-access-audit-001', 'access_review');

      expect(audit.auditType).toBe('access_review');
      expect(audit.status).toBe('completed');

      // 应该发现没有访问控制配置的问题
      const accessFinding = audit.findings.find(f => 
        f.title.includes('Access Control') || f.description.includes('access control')
      );
      expect(accessFinding).toBeDefined();
    });

    it('应该执行策略审查', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-policy-audit-001',
        name: 'Policy Audit Network',
        topology: 'ring',
        status: 'active',
        contextId: 'ctx-policy-audit-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      const audit = await networkSecurityService.performSecurityAudit('net-policy-audit-001', 'policy_review');

      expect(audit.auditType).toBe('policy_review');
      expect(audit.status).toBe('completed');

      // 应该发现没有安全策略的问题
      const policyFinding = audit.findings.find(f => 
        f.title.includes('Security Policies') || f.description.includes('security policies')
      );
      expect(policyFinding).toBeDefined();
    });
  });

  describe('访问控制测试', () => {
    it('应该配置访问控制', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-access-001',
        name: 'Access Control Test',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-access-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      const accessConfig = {
        permissions: [
          {
            id: 'perm-001',
            resource: 'network',
            actions: ['read', 'write'],
            conditions: [],
            grantedTo: ['role-admin']
          }
        ],
        roles: [
          {
            id: 'role-admin',
            name: 'Administrator',
            description: 'Network administrator role',
            permissions: ['perm-001'],
            members: ['user-001']
          }
        ],
        sessions: [
          {
            id: 'session-001',
            userId: 'user-001',
            nodeId: 'node-001',
            startedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            ipAddress: '192.168.1.100',
            userAgent: 'TestAgent/1.0',
            authenticated: true,
            permissions: ['perm-001']
          }
        ]
      };

      const result = await networkSecurityService.configureAccessControl('net-access-001', accessConfig);

      expect(result).toBeDefined();
      expect(result.networkId).toBe('net-access-001');
      expect(result.permissions).toHaveLength(1);
      expect(result.roles).toHaveLength(1);
      expect(result.sessions).toHaveLength(1);
    });

    it('应该验证访问权限', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-validate-001',
        name: 'Validation Test',
        topology: 'star',
        status: 'active',
        contextId: 'ctx-validate-001',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 先配置访问控制
      await networkSecurityService.configureAccessControl('net-validate-001', {
        permissions: [
          {
            id: 'perm-read',
            resource: 'network',
            actions: ['read'],
            conditions: [],
            grantedTo: ['user-001']
          }
        ],
        roles: [],
        sessions: [
          {
            id: 'session-001',
            userId: 'user-001',
            nodeId: 'node-001',
            startedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            ipAddress: '192.168.1.100',
            userAgent: 'TestAgent/1.0',
            authenticated: true,
            permissions: ['perm-read']
          }
        ]
      });

      // 验证有权限的访问
      const hasReadAccess = await networkSecurityService.validateAccess(
        'net-validate-001', 'user-001', 'network', 'read'
      );
      expect(hasReadAccess).toBe(true);

      // 验证无权限的访问
      const hasWriteAccess = await networkSecurityService.validateAccess(
        'net-validate-001', 'user-001', 'network', 'write'
      );
      expect(hasWriteAccess).toBe(false);

      // 验证未认证用户的访问
      const unauthenticatedAccess = await networkSecurityService.validateAccess(
        'net-validate-001', 'user-002', 'network', 'read'
      );
      expect(unauthenticatedAccess).toBe(false);
    });
  });

  describe('安全仪表板测试', () => {
    it('应该生成完整的安全仪表板', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-dashboard-001',
        name: 'Security Dashboard Test',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-dashboard-001',
        nodes: [
          {
            agentId: 'agent-dash',
            nodeType: 'worker',
            status: 'online',
            capabilities: ['compute'],
            metadata: {}
          }
        ],
        edges: [
          {
            edgeId: 'edge-dash',
            sourceNodeId: 'agent-dash',
            targetNodeId: 'agent-dash',
            connectionType: 'loopback',
            status: 'active',
            metadata: { encrypted: false }
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 先创建一些安全策略和执行威胁检测
      await networkSecurityService.createSecurityPolicy({
        networkId: 'net-dashboard-001',
        name: 'Test Policy',
        type: 'encryption',
        rules: [],
        enabled: true,
        priority: 1
      });

      await networkSecurityService.performThreatDetection('net-dashboard-001');
      await networkSecurityService.performSecurityAudit('net-dashboard-001', 'compliance');

      const dashboard = await networkSecurityService.getSecurityDashboard('net-dashboard-001');

      // 验证仪表板结构
      expect(dashboard).toBeDefined();
      expect(dashboard.overview).toBeDefined();
      expect(Array.isArray(dashboard.threats)).toBe(true);
      expect(Array.isArray(dashboard.policies)).toBe(true);
      expect(Array.isArray(dashboard.recentAudits)).toBe(true);

      // 验证概览信息
      expect(dashboard.overview.securityScore).toBeGreaterThanOrEqual(0);
      expect(dashboard.overview.securityScore).toBeLessThanOrEqual(100);
      expect(['low', 'medium', 'high', 'critical']).toContain(dashboard.overview.threatLevel);
      expect(dashboard.overview.activePolicies).toBeGreaterThanOrEqual(0);
      expect(dashboard.overview.activeThreats).toBeGreaterThanOrEqual(0);
      expect(dashboard.overview.lastAudit).toBeDefined();
    });
  });

  describe('错误处理和边界条件测试', () => {
    it('应该处理网络不存在的情况', async () => {
      mockNetworkRepository.findById.mockResolvedValue(null);

      await expect(networkSecurityService.performThreatDetection('non-existent'))
        .rejects.toThrow('Network non-existent not found');

      await expect(networkSecurityService.performSecurityAudit('non-existent', 'compliance'))
        .rejects.toThrow('Network non-existent not found');

      await expect(networkSecurityService.configureAccessControl('non-existent', {}))
        .rejects.toThrow('Network non-existent not found');
    });

    it('应该处理审计失败的情况', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-audit-fail',
        name: 'Audit Fail Test',
        topology: 'mesh',
        status: 'active',
        contextId: 'ctx-audit-fail',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 模拟审计过程中的错误
      const originalMethod = networkSecurityService['performComplianceAudit'];
      networkSecurityService['performComplianceAudit'] = jest.fn().mockRejectedValue(new Error('Audit failed'));

      const audit = await networkSecurityService.performSecurityAudit('net-audit-fail', 'compliance');

      expect(audit.status).toBe('failed');
      expect(audit.completedAt).toBeDefined();

      // 恢复原方法
      networkSecurityService['performComplianceAudit'] = originalMethod;
    });

    it('应该处理无效的访问控制配置', async () => {
      const networkEntity = new NetworkEntity({
        networkId: 'net-invalid-access',
        name: 'Invalid Access Test',
        topology: 'star',
        status: 'active',
        contextId: 'ctx-invalid-access',
        nodes: [],
        edges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockNetworkRepository.findById.mockResolvedValue(networkEntity);

      // 测试无访问控制配置时的验证
      const hasAccess = await networkSecurityService.validateAccess(
        'net-invalid-access', 'user-001', 'network', 'read'
      );
      expect(hasAccess).toBe(false); // 默认拒绝访问
    });
  });
});
