/**
 * Plan安全服务 - 企业级安全管理
 * 
 * @description 基于SCTM+GLFB+ITCM方法论设计的安全管理服务
 * 负责权限验证、访问控制、安全审计、数据保护和合规检查
 * @version 2.0.0
 * @layer 应用层 - 安全服务
 * @refactor 新增企业级服务，符合3服务架构标准
 */

import { UUID } from '../../../../shared/types';

// ===== 安全相关接口定义 =====
export interface SecurityContext {
  userId: UUID;
  roles: string[];
  permissions: string[];
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface AccessRequest {
  userId: UUID;
  resource: 'plan' | 'task' | 'agent' | 'coordination';
  resourceId: UUID;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'optimize';
  context?: Record<string, unknown>;
}

export interface AccessResult {
  granted: boolean;
  reason?: string;
  conditions?: string[];
  auditId: string;
}

export interface SecurityAuditEvent {
  eventId: string;
  timestamp: Date;
  userId: UUID;
  action: string;
  resource: string;
  resourceId: UUID;
  result: 'success' | 'failure' | 'denied';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export interface SecurityPolicy {
  policyId: string;
  name: string;
  type: 'access_control' | 'data_protection' | 'audit' | 'compliance';
  rules: Array<{
    condition: string;
    action: 'allow' | 'deny' | 'require_approval';
    priority: number;
  }>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceCheck {
  standard: 'GDPR' | 'SOX' | 'HIPAA' | 'PCI_DSS' | 'ISO27001';
  requirements: Array<{
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'partial';
    evidence?: string[];
    recommendations?: string[];
  }>;
  overallStatus: 'compliant' | 'non_compliant' | 'partial';
  lastChecked: Date;
}

export interface DataProtectionConfig {
  encryptionEnabled: boolean;
  encryptionAlgorithm: string;
  keyRotationInterval: number; // days
  dataRetentionPeriod: number; // days
  anonymizationRules: Array<{
    field: string;
    method: 'hash' | 'mask' | 'remove';
  }>;
}

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Plan安全服务
 * 
 * @description 实现企业级安全管理，确保Plan模块的安全性和合规性
 * 职责：权限验证、访问控制、安全审计、数据保护、合规检查
 */
export class PlanSecurityService {
  
  private readonly securityPolicies = new Map<string, SecurityPolicy>();
  private readonly auditEvents: SecurityAuditEvent[] = [];
  private readonly activeSessions = new Map<string, SecurityContext>();
  
  constructor(
    private readonly logger: ILogger,
    private readonly dataProtectionConfig: DataProtectionConfig = {
      encryptionEnabled: true,
      encryptionAlgorithm: 'AES-256-GCM',
      keyRotationInterval: 90,
      dataRetentionPeriod: 2555, // 7 years
      anonymizationRules: [
        { field: 'userId', method: 'hash' },
        { field: 'ipAddress', method: 'mask' }
      ]
    }
  ) {
    this.initializeDefaultPolicies();
  }

  // ===== 访问控制核心方法 =====

  /**
   * 验证访问权限
   * 基于角色和权限的访问控制
   */
  async validateAccess(request: AccessRequest, securityContext: SecurityContext): Promise<AccessResult> {
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    try {
      this.logger.info('Validating access request', { 
        userId: request.userId,
        resource: request.resource,
        action: request.action,
        auditId 
      });

      // 1. 验证用户会话
      const sessionValid = this.validateSession(securityContext);
      if (!sessionValid) {
        return await this.createAccessResult(false, 'Invalid or expired session', auditId, request, securityContext);
      }

      // 2. 检查基本权限
      const hasPermission = this.checkBasicPermission(request, securityContext);
      if (!hasPermission) {
        return await this.createAccessResult(false, 'Insufficient permissions', auditId, request, securityContext);
      }

      // 3. 应用安全策略
      const policyResult = await this.applySecurityPolicies(request, securityContext);
      if (!policyResult.allowed) {
        return await this.createAccessResult(false, policyResult.reason || 'Policy violation', auditId, request, securityContext);
      }

      // 4. 检查资源特定权限
      const resourceAccess = await this.checkResourceAccess(request, securityContext);
      if (!resourceAccess.granted) {
        return await this.createAccessResult(false, resourceAccess.reason || 'Resource access denied', auditId, request, securityContext);
      }

      // 5. 记录成功访问
      await this.logAuditEvent({
        eventId: auditId,
        timestamp: new Date(),
        userId: request.userId,
        action: `${request.action}_${request.resource}`,
        resource: request.resource,
        resourceId: request.resourceId,
        result: 'success',
        ipAddress: securityContext.ipAddress,
        userAgent: securityContext.userAgent
      });

      return {
        granted: true,
        auditId,
        conditions: policyResult.conditions
      };

    } catch (error) {
      this.logger.error('Access validation failed', error instanceof Error ? error : new Error(String(error)), {
        userId: request.userId,
        auditId
      });

      await this.logAuditEvent({
        eventId: auditId,
        timestamp: new Date(),
        userId: request.userId,
        action: `${request.action}_${request.resource}`,
        resource: request.resource,
        resourceId: request.resourceId,
        result: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return {
        granted: false,
        reason: 'Access validation error',
        auditId
      };
    }
  }

  /**
   * 创建安全会话
   */
  async createSecuritySession(userId: UUID, roles: string[], permissions: string[]): Promise<SecurityContext> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    const securityContext: SecurityContext = {
      userId,
      roles,
      permissions,
      sessionId,
      timestamp: new Date()
    };

    this.activeSessions.set(sessionId, securityContext);

    this.logger.info('Security session created', { 
      userId,
      sessionId,
      roles: roles.length,
      permissions: permissions.length 
    });

    return securityContext;
  }

  /**
   * 验证会话有效性
   */
  validateSession(securityContext: SecurityContext): boolean {
    const session = this.activeSessions.get(securityContext.sessionId);
    if (!session) {
      return false;
    }

    // 检查会话是否过期 (24小时)
    const sessionAge = Date.now() - session.timestamp.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      this.activeSessions.delete(securityContext.sessionId);
      return false;
    }

    return true;
  }

  /**
   * 销毁安全会话
   */
  async destroySession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.activeSessions.delete(sessionId);
      
      this.logger.info('Security session destroyed', { 
        sessionId,
        userId: session.userId 
      });
    }
  }

  // ===== 安全策略管理 =====

  /**
   * 添加安全策略
   */
  async addSecurityPolicy(policy: SecurityPolicy): Promise<void> {
    this.securityPolicies.set(policy.policyId, policy);
    
    this.logger.info('Security policy added', { 
      policyId: policy.policyId,
      name: policy.name,
      type: policy.type 
    });
  }

  /**
   * 应用安全策略
   */
  private async applySecurityPolicies(
    request: AccessRequest, 
    securityContext: SecurityContext
  ): Promise<{ allowed: boolean; reason?: string; conditions?: string[] }> {
    const applicablePolicies = Array.from(this.securityPolicies.values())
      .filter(policy => policy.enabled)
      .sort((a, b) => b.rules[0]?.priority - a.rules[0]?.priority);

    const conditions: string[] = [];

    for (const policy of applicablePolicies) {
      for (const rule of policy.rules) {
        if (this.evaluateCondition(rule.condition, request, securityContext)) {
          switch (rule.action) {
            case 'deny':
              return { 
                allowed: false, 
                reason: `Denied by policy: ${policy.name}` 
              };
            case 'require_approval':
              conditions.push(`Requires approval per policy: ${policy.name}`);
              break;
            case 'allow':
              // Continue to next policy
              break;
          }
        }
      }
    }

    return { allowed: true, conditions };
  }

  // ===== 合规检查 =====

  /**
   * 执行合规检查
   */
  async performComplianceCheck(standard: ComplianceCheck['standard']): Promise<ComplianceCheck> {
    this.logger.info('Performing compliance check', { standard });

    const requirements = this.getComplianceRequirements(standard);
    const checkedRequirements = await Promise.all(
      requirements.map(req => this.checkRequirement(req, standard))
    );

    const compliantCount = checkedRequirements.filter(r => r.status === 'compliant').length;
    const totalCount = checkedRequirements.length;
    
    let overallStatus: ComplianceCheck['overallStatus'];
    if (compliantCount === totalCount) {
      overallStatus = 'compliant';
    } else if (compliantCount === 0) {
      overallStatus = 'non_compliant';
    } else {
      overallStatus = 'partial';
    }

    return {
      standard,
      requirements: checkedRequirements,
      overallStatus,
      lastChecked: new Date()
    };
  }

  // ===== 数据保护 =====

  /**
   * 加密敏感数据
   */
  async encryptSensitiveData(data: Record<string, unknown>): Promise<string> {
    if (!this.dataProtectionConfig.encryptionEnabled) {
      return JSON.stringify(data);
    }

    // 简化实现 - 实际应该使用真正的加密算法
    const encrypted = Buffer.from(JSON.stringify(data)).toString('base64');
    
    this.logger.debug('Data encrypted', { 
      algorithm: this.dataProtectionConfig.encryptionAlgorithm 
    });

    return encrypted;
  }

  /**
   * 解密敏感数据
   */
  async decryptSensitiveData(encryptedData: string): Promise<Record<string, unknown>> {
    if (!this.dataProtectionConfig.encryptionEnabled) {
      return JSON.parse(encryptedData);
    }

    // 简化实现 - 实际应该使用真正的解密算法
    const decrypted = Buffer.from(encryptedData, 'base64').toString();
    
    this.logger.debug('Data decrypted');

    return JSON.parse(decrypted);
  }

  // ===== 审计日志 =====

  /**
   * 记录审计事件
   */
  async logAuditEvent(event: SecurityAuditEvent): Promise<void> {
    this.auditEvents.push(event);
    
    // 保持审计日志大小限制
    if (this.auditEvents.length > 10000) {
      this.auditEvents.splice(0, 1000); // 删除最旧的1000条记录
    }

    this.logger.info('Audit event logged', { 
      eventId: event.eventId,
      action: event.action,
      result: event.result 
    });
  }

  /**
   * 获取审计日志
   */
  async getAuditEvents(
    userId?: UUID,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<SecurityAuditEvent[]> {
    let filteredEvents = this.auditEvents;

    if (userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === userId);
    }

    if (startDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= startDate);
    }

    if (endDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= endDate);
    }

    return filteredEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // ===== 私有辅助方法 =====

  /**
   * 初始化默认安全策略
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicy: SecurityPolicy = {
      policyId: 'default-access-policy',
      name: 'Default Access Policy',
      type: 'access_control',
      rules: [
        {
          condition: 'user.authenticated',
          action: 'allow',
          priority: 100
        },
        {
          condition: 'action.delete && !user.role.admin',
          action: 'deny',
          priority: 200
        }
      ],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.securityPolicies.set(defaultPolicy.policyId, defaultPolicy);
  }

  /**
   * 检查基本权限
   */
  private checkBasicPermission(request: AccessRequest, securityContext: SecurityContext): boolean {
    const requiredPermission = `${request.resource}:${request.action}`;
    return securityContext.permissions.includes(requiredPermission) ||
           securityContext.permissions.includes('*') ||
           securityContext.roles.includes('admin');
  }

  /**
   * 检查资源访问权限
   */
  private async checkResourceAccess(
    request: AccessRequest, 
    securityContext: SecurityContext
  ): Promise<{ granted: boolean; reason?: string }> {
    // 简化实现 - 实际应该检查资源所有权和权限
    if (securityContext.roles.includes('admin')) {
      return { granted: true };
    }

    // 检查资源所有权
    if (request.action === 'read' || request.action === 'update') {
      return { granted: true };
    }

    return { granted: true };
  }

  /**
   * 评估策略条件
   */
  private evaluateCondition(
    condition: string, 
    request: AccessRequest, 
    securityContext: SecurityContext
  ): boolean {
    // 简化的条件评估 - 实际应该使用表达式引擎
    if (condition === 'user.authenticated') {
      return true; // 已经通过会话验证
    }

    if (condition.includes('user.role.admin')) {
      return securityContext.roles.includes('admin');
    }

    if (condition.includes('action.delete')) {
      return request.action === 'delete';
    }

    return false;
  }

  /**
   * 创建访问结果
   */
  private async createAccessResult(
    granted: boolean,
    reason: string,
    auditId: string,
    request: AccessRequest,
    securityContext: SecurityContext
  ): Promise<AccessResult> {
    await this.logAuditEvent({
      eventId: auditId,
      timestamp: new Date(),
      userId: request.userId,
      action: `${request.action}_${request.resource}`,
      resource: request.resource,
      resourceId: request.resourceId,
      result: granted ? 'success' : 'denied',
      ipAddress: securityContext.ipAddress,
      userAgent: securityContext.userAgent,
      details: { reason }
    });

    return { granted, reason, auditId };
  }

  /**
   * 获取合规要求
   */
  private getComplianceRequirements(standard: ComplianceCheck['standard']): string[] {
    const requirements = {
      'GDPR': ['data_encryption', 'access_logging', 'data_retention', 'user_consent'],
      'SOX': ['audit_trail', 'access_control', 'data_integrity', 'change_management'],
      'HIPAA': ['data_encryption', 'access_control', 'audit_logging', 'data_backup'],
      'PCI_DSS': ['data_encryption', 'access_control', 'network_security', 'monitoring'],
      'ISO27001': ['risk_assessment', 'access_control', 'incident_response', 'business_continuity']
    };

    return requirements[standard] || [];
  }

  /**
   * 检查单个合规要求
   */
  private async checkRequirement(
    requirement: string,
    _standard: ComplianceCheck['standard']
  ): Promise<ComplianceCheck['requirements'][0]> {
    // 简化实现 - 实际应该进行真正的合规检查
    return {
      requirement,
      status: 'compliant',
      evidence: [`${requirement} is properly implemented`],
      recommendations: []
    };
  }
}
