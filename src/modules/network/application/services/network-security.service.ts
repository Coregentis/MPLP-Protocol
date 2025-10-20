/**
 * Network Security Service - 企业级网络安全服务
 * 
 * @description 提供网络安全管理、威胁检测和访问控制功能
 * @version 1.0.0
 * @layer 应用层 - 企业级服务
 */

import { NetworkEntity } from '../../domain/entities/network.entity';
import { INetworkRepository } from '../../domain/repositories/network-repository.interface';

export interface SecurityPolicy {
  id: string;
  networkId: string;
  name: string;
  type: 'access_control' | 'encryption' | 'authentication' | 'audit';
  rules: SecurityRule[];
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityRule {
  id: string;
  action: 'allow' | 'deny' | 'monitor';
  conditions: SecurityCondition[];
  description: string;
  enabled: boolean;
}

export interface SecurityCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'in' | 'not_in';
  value: string | string[];
}

export interface ThreatDetection {
  id: string;
  networkId: string;
  threatType: 'intrusion' | 'ddos' | 'malware' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'mitigated' | 'resolved';
  detectedAt: string;
  source: string;
  target: string;
  description: string;
  evidence: ThreatEvidence[];
  mitigation: MitigationAction[];
}

export interface ThreatEvidence {
  type: 'log' | 'network_traffic' | 'system_behavior' | 'user_activity';
  timestamp: string;
  data: Record<string, unknown>;
  confidence: number;
}

export interface MitigationAction {
  id: string;
  type: 'block_ip' | 'isolate_node' | 'rate_limit' | 'alert_admin' | 'log_activity';
  status: 'pending' | 'executed' | 'failed';
  executedAt?: string;
  result?: string;
}

export interface SecurityAudit {
  id: string;
  networkId: string;
  auditType: 'compliance' | 'vulnerability' | 'access_review' | 'policy_review';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  findings: AuditFinding[];
  recommendations: string[];
  complianceScore: number;
}

export interface AuditFinding {
  id: string;
  category: 'vulnerability' | 'policy_violation' | 'access_issue' | 'configuration_error';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedComponents: string[];
  remediation: string;
  riskScore: number;
}

export interface AccessControl {
  networkId: string;
  permissions: NetworkPermission[];
  roles: SecurityRole[];
  sessions: ActiveSession[];
}

export interface NetworkPermission {
  id: string;
  resource: string;
  actions: string[];
  conditions: SecurityCondition[];
  grantedTo: string[]; // role IDs or user IDs
}

export interface SecurityRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  members: string[];
}

export interface ActiveSession {
  id: string;
  userId: string;
  nodeId: string;
  startedAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  authenticated: boolean;
  permissions: string[];
}

export class NetworkSecurityService {
  private securityPolicies: Map<string, SecurityPolicy[]> = new Map();
  private threatDetections: Map<string, ThreatDetection[]> = new Map();
  private auditHistory: Map<string, SecurityAudit[]> = new Map();
  private accessControls: Map<string, AccessControl> = new Map();

  constructor(
    private readonly networkRepository: INetworkRepository
  ) {}

  /**
   * 创建安全策略
   */
  async createSecurityPolicy(policy: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityPolicy> {
    const newPolicy: SecurityPolicy = {
      ...policy,
      id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const policies = this.securityPolicies.get(policy.networkId) || [];
    policies.push(newPolicy);
    this.securityPolicies.set(policy.networkId, policies);

    return newPolicy;
  }

  /**
   * 执行威胁检测扫描
   */
  async performThreatDetection(networkId: string): Promise<ThreatDetection[]> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    const threats: ThreatDetection[] = [];

    // 检测未授权访问
    const unauthorizedAccess = await this.detectUnauthorizedAccess(network);
    threats.push(...unauthorizedAccess);

    // 检测异常流量
    const anomalousTraffic = await this.detectAnomalousTraffic(network);
    threats.push(...anomalousTraffic);

    // 检测配置漏洞
    const configVulnerabilities = await this.detectConfigurationVulnerabilities(network);
    threats.push(...configVulnerabilities);

    // 存储检测结果
    this.threatDetections.set(networkId, threats);

    return threats;
  }

  /**
   * 执行安全审计
   */
  async performSecurityAudit(networkId: string, auditType: SecurityAudit['auditType']): Promise<SecurityAudit> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    const audit: SecurityAudit = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      networkId,
      auditType,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      findings: [],
      recommendations: [],
      complianceScore: 0
    };

    try {
      // 执行不同类型的审计
      switch (auditType) {
        case 'compliance':
          audit.findings = await this.performComplianceAudit(network);
          break;
        case 'vulnerability':
          audit.findings = await this.performVulnerabilityAudit(network);
          break;
        case 'access_review':
          audit.findings = await this.performAccessReview(network);
          break;
        case 'policy_review':
          audit.findings = await this.performPolicyReview(network);
          break;
      }

      // 生成建议
      audit.recommendations = this.generateSecurityRecommendations(audit.findings);
      
      // 计算合规分数
      audit.complianceScore = this.calculateComplianceScore(audit.findings);
      
      audit.status = 'completed';
      audit.completedAt = new Date().toISOString();

    } catch (error) {
      audit.status = 'failed';
      audit.completedAt = new Date().toISOString();
    }

    // 存储审计历史
    const history = this.auditHistory.get(networkId) || [];
    history.push(audit);
    this.auditHistory.set(networkId, history);

    return audit;
  }

  /**
   * 配置访问控制
   */
  async configureAccessControl(networkId: string, config: Partial<AccessControl>): Promise<AccessControl> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      throw new Error(`Network ${networkId} not found`);
    }

    const existingControl = this.accessControls.get(networkId) || {
      networkId,
      permissions: [],
      roles: [],
      sessions: []
    };

    const updatedControl: AccessControl = {
      ...existingControl,
      ...config,
      networkId
    };

    this.accessControls.set(networkId, updatedControl);
    return updatedControl;
  }

  /**
   * 验证访问权限
   */
  async validateAccess(networkId: string, userId: string, resource: string, action: string): Promise<boolean> {
    const accessControl = this.accessControls.get(networkId);
    if (!accessControl) {
      return false; // 默认拒绝访问
    }

    // 检查用户会话
    const activeSession = accessControl.sessions.find(s => s.userId === userId && s.authenticated);
    if (!activeSession) {
      return false;
    }

    // 检查权限
    const hasPermission = accessControl.permissions.some(permission => {
      if (permission.resource !== resource) return false;
      if (!permission.actions.includes(action)) return false;
      
      // 检查用户是否有权限
      const userRoles = accessControl.roles.filter(role => role.members.includes(userId));
      const hasRole = userRoles.some(role => permission.grantedTo.includes(role.id));
      const directGrant = permission.grantedTo.includes(userId);
      
      return hasRole || directGrant;
    });

    return hasPermission;
  }

  /**
   * 获取安全仪表板
   */
  async getSecurityDashboard(networkId: string): Promise<{
    overview: {
      securityScore: number;
      threatLevel: 'low' | 'medium' | 'high' | 'critical';
      activePolicies: number;
      activeThreats: number;
      lastAudit: string;
    };
    threats: ThreatDetection[];
    policies: SecurityPolicy[];
    recentAudits: SecurityAudit[];
  }> {
    const threats = this.threatDetections.get(networkId) || [];
    const policies = this.securityPolicies.get(networkId) || [];
    const audits = this.auditHistory.get(networkId) || [];

    const activeThreats = threats.filter(t => t.status === 'active').length;
    const activePolicies = policies.filter(p => p.enabled).length;
    
    const threatLevel = this.calculateThreatLevel(threats);
    const securityScore = this.calculateSecurityScore(networkId);
    
    const lastAudit = audits.length > 0 ?
      audits.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]!.startedAt :
      'Never';

    return {
      overview: {
        securityScore,
        threatLevel,
        activePolicies,
        activeThreats,
        lastAudit
      },
      threats: threats.slice(0, 10),
      policies: policies.slice(0, 10),
      recentAudits: audits.slice(0, 5)
    };
  }

  // ===== 私有方法 =====

  private async detectUnauthorizedAccess(network: NetworkEntity): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];
    
    // 模拟检测逻辑 - 检测错误状态的节点
    if (network.nodes.some(n => n.status === 'error')) {
      threats.push({
        id: `threat-${Date.now()}-1`,
        networkId: network.networkId,
        threatType: 'unauthorized_access',
        severity: 'medium',
        status: 'active',
        detectedAt: new Date().toISOString(),
        source: 'unknown',
        target: network.networkId,
        description: 'Detected nodes with error status, potential unauthorized access',
        evidence: [{
          type: 'system_behavior',
          timestamp: new Date().toISOString(),
          data: { errorNodes: network.nodes.filter(n => n.status === 'error').length },
          confidence: 0.7
        }],
        mitigation: [{
          id: `mitigation-${Date.now()}`,
          type: 'isolate_node',
          status: 'pending'
        }]
      });
    }

    return threats;
  }

  private async detectAnomalousTraffic(network: NetworkEntity): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];
    
    // 模拟异常流量检测 - 使用metadata中的bandwidth
    const highTrafficEdges = network.edges.filter(e =>
      e.metadata.bandwidth && typeof e.metadata.bandwidth === 'number' && e.metadata.bandwidth > 1000
    );
    if (highTrafficEdges.length > network.edges.length * 0.5) {
      threats.push({
        id: `threat-${Date.now()}-2`,
        networkId: network.networkId,
        threatType: 'ddos',
        severity: 'high',
        status: 'active',
        detectedAt: new Date().toISOString(),
        source: 'multiple',
        target: network.networkId,
        description: 'Detected unusually high traffic patterns, potential DDoS attack',
        evidence: [{
          type: 'network_traffic',
          timestamp: new Date().toISOString(),
          data: { highTrafficConnections: highTrafficEdges.length },
          confidence: 0.8
        }],
        mitigation: [{
          id: `mitigation-${Date.now()}`,
          type: 'rate_limit',
          status: 'pending'
        }]
      });
    }

    return threats;
  }

  private async detectConfigurationVulnerabilities(network: NetworkEntity): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];
    
    // 检测未加密连接 - 基于metadata中的encrypted标志
    const unencryptedEdges = network.edges.filter(e =>
      !e.metadata.encrypted || e.metadata.encrypted === false
    );
    if (unencryptedEdges.length > 0) {
      threats.push({
        id: `threat-${Date.now()}-3`,
        networkId: network.networkId,
        threatType: 'data_breach',
        severity: 'medium',
        status: 'active',
        detectedAt: new Date().toISOString(),
        source: 'configuration',
        target: network.networkId,
        description: 'Detected unencrypted connections, potential data exposure risk',
        evidence: [{
          type: 'system_behavior',
          timestamp: new Date().toISOString(),
          data: { unencryptedConnections: unencryptedEdges.length },
          confidence: 0.9
        }],
        mitigation: [{
          id: `mitigation-${Date.now()}`,
          type: 'alert_admin',
          status: 'pending'
        }]
      });
    }

    return threats;
  }

  private async performComplianceAudit(network: NetworkEntity): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = [];

    // 检查加密合规性 - 基于metadata中的encrypted标志
    const unencryptedEdges = network.edges.filter(e =>
      !e.metadata.encrypted || e.metadata.encrypted === false
    );
    if (unencryptedEdges.length > 0) {
      findings.push({
        id: `finding-${Date.now()}-1`,
        category: 'policy_violation',
        severity: 'medium',
        title: 'Unencrypted Network Connections',
        description: `${unencryptedEdges.length} connections are not encrypted`,
        affectedComponents: unencryptedEdges.map(e => e.edgeId),
        remediation: 'Enable encryption for all network connections',
        riskScore: 6
      });
    }

    return findings;
  }

  private async performVulnerabilityAudit(network: NetworkEntity): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = [];

    // 检查单点故障
    if (network.nodes.length === 1) {
      findings.push({
        id: `finding-${Date.now()}-2`,
        category: 'vulnerability',
        severity: 'high',
        title: 'Single Point of Failure',
        description: 'Network has only one node, creating a single point of failure',
        affectedComponents: [network.networkId],
        remediation: 'Add redundant nodes to improve network resilience',
        riskScore: 8
      });
    }

    return findings;
  }

  private async performAccessReview(network: NetworkEntity): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = [];
    const accessControl = this.accessControls.get(network.networkId);

    if (!accessControl || accessControl.permissions.length === 0) {
      findings.push({
        id: `finding-${Date.now()}-3`,
        category: 'access_issue',
        severity: 'medium',
        title: 'No Access Control Configured',
        description: 'Network has no access control policies configured',
        affectedComponents: [network.networkId],
        remediation: 'Configure appropriate access control policies',
        riskScore: 5
      });
    }

    return findings;
  }

  private async performPolicyReview(network: NetworkEntity): Promise<AuditFinding[]> {
    const findings: AuditFinding[] = [];
    const policies = this.securityPolicies.get(network.networkId) || [];

    if (policies.length === 0) {
      findings.push({
        id: `finding-${Date.now()}-4`,
        category: 'policy_violation',
        severity: 'low',
        title: 'No Security Policies Defined',
        description: 'Network has no security policies configured',
        affectedComponents: [network.networkId],
        remediation: 'Define and implement security policies',
        riskScore: 3
      });
    }

    return findings;
  }

  private generateSecurityRecommendations(findings: AuditFinding[]): string[] {
    const recommendations: string[] = [];
    
    findings.forEach(finding => {
      if (!recommendations.includes(finding.remediation)) {
        recommendations.push(finding.remediation);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Security configuration appears optimal');
    }

    return recommendations;
  }

  private calculateComplianceScore(findings: AuditFinding[]): number {
    if (findings.length === 0) return 100;
    
    const totalRisk = findings.reduce((sum, finding) => sum + finding.riskScore, 0);
    const maxRisk = findings.length * 10; // 假设最大风险分数为10
    
    return Math.max(0, Math.round(100 - (totalRisk / maxRisk) * 100));
  }

  private calculateThreatLevel(threats: ThreatDetection[]): 'low' | 'medium' | 'high' | 'critical' {
    const activeThreats = threats.filter(t => t.status === 'active');
    
    if (activeThreats.some(t => t.severity === 'critical')) return 'critical';
    if (activeThreats.some(t => t.severity === 'high')) return 'high';
    if (activeThreats.some(t => t.severity === 'medium')) return 'medium';
    return 'low';
  }

  private calculateSecurityScore(networkId: string): number {
    const threats = this.threatDetections.get(networkId) || [];
    const policies = this.securityPolicies.get(networkId) || [];
    const audits = this.auditHistory.get(networkId) || [];

    let score = 100;

    // 威胁扣分
    const activeThreats = threats.filter(t => t.status === 'active');
    activeThreats.forEach(threat => {
      switch (threat.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    // 策略加分
    const activePolicies = policies.filter(p => p.enabled);
    score += Math.min(20, activePolicies.length * 2);

    // 审计加分
    const recentAudits = audits.filter(a => 
      new Date(a.startedAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
    );
    if (recentAudits.length > 0) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
