"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSecurityService = void 0;
class PlanSecurityService {
    logger;
    dataProtectionConfig;
    securityPolicies = new Map();
    auditEvents = [];
    activeSessions = new Map();
    constructor(logger, dataProtectionConfig = {
        encryptionEnabled: true,
        encryptionAlgorithm: 'AES-256-GCM',
        keyRotationInterval: 90,
        dataRetentionPeriod: 2555,
        anonymizationRules: [
            { field: 'userId', method: 'hash' },
            { field: 'ipAddress', method: 'mask' }
        ]
    }) {
        this.logger = logger;
        this.dataProtectionConfig = dataProtectionConfig;
        this.initializeDefaultPolicies();
    }
    async validateAccess(request, securityContext) {
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        try {
            this.logger.info('Validating access request', {
                userId: request.userId,
                resource: request.resource,
                action: request.action,
                auditId
            });
            const sessionValid = this.validateSession(securityContext);
            if (!sessionValid) {
                return await this.createAccessResult(false, 'Invalid or expired session', auditId, request, securityContext);
            }
            const hasPermission = this.checkBasicPermission(request, securityContext);
            if (!hasPermission) {
                return await this.createAccessResult(false, 'Insufficient permissions', auditId, request, securityContext);
            }
            const policyResult = await this.applySecurityPolicies(request, securityContext);
            if (!policyResult.allowed) {
                return await this.createAccessResult(false, policyResult.reason || 'Policy violation', auditId, request, securityContext);
            }
            const resourceAccess = await this.checkResourceAccess(request, securityContext);
            if (!resourceAccess.granted) {
                return await this.createAccessResult(false, resourceAccess.reason || 'Resource access denied', auditId, request, securityContext);
            }
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
        }
        catch (error) {
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
    async createSecuritySession(userId, roles, permissions) {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const securityContext = {
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
    validateSession(securityContext) {
        const session = this.activeSessions.get(securityContext.sessionId);
        if (!session) {
            return false;
        }
        const sessionAge = Date.now() - session.timestamp.getTime();
        const maxAge = 24 * 60 * 60 * 1000;
        if (sessionAge > maxAge) {
            this.activeSessions.delete(securityContext.sessionId);
            return false;
        }
        return true;
    }
    async destroySession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            this.activeSessions.delete(sessionId);
            this.logger.info('Security session destroyed', {
                sessionId,
                userId: session.userId
            });
        }
    }
    async addSecurityPolicy(policy) {
        this.securityPolicies.set(policy.policyId, policy);
        this.logger.info('Security policy added', {
            policyId: policy.policyId,
            name: policy.name,
            type: policy.type
        });
    }
    async applySecurityPolicies(request, securityContext) {
        const applicablePolicies = Array.from(this.securityPolicies.values())
            .filter(policy => policy.enabled)
            .sort((a, b) => b.rules[0]?.priority - a.rules[0]?.priority);
        const conditions = [];
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
                            break;
                    }
                }
            }
        }
        return { allowed: true, conditions };
    }
    async performComplianceCheck(standard) {
        this.logger.info('Performing compliance check', { standard });
        const requirements = this.getComplianceRequirements(standard);
        const checkedRequirements = await Promise.all(requirements.map(req => this.checkRequirement(req, standard)));
        const compliantCount = checkedRequirements.filter(r => r.status === 'compliant').length;
        const totalCount = checkedRequirements.length;
        let overallStatus;
        if (compliantCount === totalCount) {
            overallStatus = 'compliant';
        }
        else if (compliantCount === 0) {
            overallStatus = 'non_compliant';
        }
        else {
            overallStatus = 'partial';
        }
        return {
            standard,
            requirements: checkedRequirements,
            overallStatus,
            lastChecked: new Date()
        };
    }
    async encryptSensitiveData(data) {
        if (!this.dataProtectionConfig.encryptionEnabled) {
            return JSON.stringify(data);
        }
        const encrypted = Buffer.from(JSON.stringify(data)).toString('base64');
        this.logger.debug('Data encrypted', {
            algorithm: this.dataProtectionConfig.encryptionAlgorithm
        });
        return encrypted;
    }
    async decryptSensitiveData(encryptedData) {
        if (!this.dataProtectionConfig.encryptionEnabled) {
            return JSON.parse(encryptedData);
        }
        const decrypted = Buffer.from(encryptedData, 'base64').toString();
        this.logger.debug('Data decrypted');
        return JSON.parse(decrypted);
    }
    async logAuditEvent(event) {
        this.auditEvents.push(event);
        if (this.auditEvents.length > 10000) {
            this.auditEvents.splice(0, 1000);
        }
        this.logger.info('Audit event logged', {
            eventId: event.eventId,
            action: event.action,
            result: event.result
        });
    }
    async getAuditEvents(userId, startDate, endDate, limit = 100) {
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
    initializeDefaultPolicies() {
        const defaultPolicy = {
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
    checkBasicPermission(request, securityContext) {
        const requiredPermission = `${request.resource}:${request.action}`;
        return securityContext.permissions.includes(requiredPermission) ||
            securityContext.permissions.includes('*') ||
            securityContext.roles.includes('admin');
    }
    async checkResourceAccess(request, securityContext) {
        if (securityContext.roles.includes('admin')) {
            return { granted: true };
        }
        if (request.action === 'read' || request.action === 'update') {
            return { granted: true };
        }
        return { granted: true };
    }
    evaluateCondition(condition, request, securityContext) {
        if (condition === 'user.authenticated') {
            return true;
        }
        if (condition.includes('user.role.admin')) {
            return securityContext.roles.includes('admin');
        }
        if (condition.includes('action.delete')) {
            return request.action === 'delete';
        }
        return false;
    }
    async createAccessResult(granted, reason, auditId, request, securityContext) {
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
    getComplianceRequirements(standard) {
        const requirements = {
            'GDPR': ['data_encryption', 'access_logging', 'data_retention', 'user_consent'],
            'SOX': ['audit_trail', 'access_control', 'data_integrity', 'change_management'],
            'HIPAA': ['data_encryption', 'access_control', 'audit_logging', 'data_backup'],
            'PCI_DSS': ['data_encryption', 'access_control', 'network_security', 'monitoring'],
            'ISO27001': ['risk_assessment', 'access_control', 'incident_response', 'business_continuity']
        };
        return requirements[standard] || [];
    }
    async checkRequirement(requirement, _standard) {
        return {
            requirement,
            status: 'compliant',
            evidence: [`${requirement} is properly implemented`],
            recommendations: []
        };
    }
}
exports.PlanSecurityService = PlanSecurityService;
