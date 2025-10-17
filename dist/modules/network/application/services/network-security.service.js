"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkSecurityService = void 0;
class NetworkSecurityService {
    networkRepository;
    securityPolicies = new Map();
    threatDetections = new Map();
    auditHistory = new Map();
    accessControls = new Map();
    constructor(networkRepository) {
        this.networkRepository = networkRepository;
    }
    async createSecurityPolicy(policy) {
        const newPolicy = {
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
    async performThreatDetection(networkId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            throw new Error(`Network ${networkId} not found`);
        }
        const threats = [];
        const unauthorizedAccess = await this.detectUnauthorizedAccess(network);
        threats.push(...unauthorizedAccess);
        const anomalousTraffic = await this.detectAnomalousTraffic(network);
        threats.push(...anomalousTraffic);
        const configVulnerabilities = await this.detectConfigurationVulnerabilities(network);
        threats.push(...configVulnerabilities);
        this.threatDetections.set(networkId, threats);
        return threats;
    }
    async performSecurityAudit(networkId, auditType) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            throw new Error(`Network ${networkId} not found`);
        }
        const audit = {
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
            audit.recommendations = this.generateSecurityRecommendations(audit.findings);
            audit.complianceScore = this.calculateComplianceScore(audit.findings);
            audit.status = 'completed';
            audit.completedAt = new Date().toISOString();
        }
        catch (error) {
            audit.status = 'failed';
            audit.completedAt = new Date().toISOString();
        }
        const history = this.auditHistory.get(networkId) || [];
        history.push(audit);
        this.auditHistory.set(networkId, history);
        return audit;
    }
    async configureAccessControl(networkId, config) {
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
        const updatedControl = {
            ...existingControl,
            ...config,
            networkId
        };
        this.accessControls.set(networkId, updatedControl);
        return updatedControl;
    }
    async validateAccess(networkId, userId, resource, action) {
        const accessControl = this.accessControls.get(networkId);
        if (!accessControl) {
            return false;
        }
        const activeSession = accessControl.sessions.find(s => s.userId === userId && s.authenticated);
        if (!activeSession) {
            return false;
        }
        const hasPermission = accessControl.permissions.some(permission => {
            if (permission.resource !== resource)
                return false;
            if (!permission.actions.includes(action))
                return false;
            const userRoles = accessControl.roles.filter(role => role.members.includes(userId));
            const hasRole = userRoles.some(role => permission.grantedTo.includes(role.id));
            const directGrant = permission.grantedTo.includes(userId);
            return hasRole || directGrant;
        });
        return hasPermission;
    }
    async getSecurityDashboard(networkId) {
        const threats = this.threatDetections.get(networkId) || [];
        const policies = this.securityPolicies.get(networkId) || [];
        const audits = this.auditHistory.get(networkId) || [];
        const activeThreats = threats.filter(t => t.status === 'active').length;
        const activePolicies = policies.filter(p => p.enabled).length;
        const threatLevel = this.calculateThreatLevel(threats);
        const securityScore = this.calculateSecurityScore(networkId);
        const lastAudit = audits.length > 0 ?
            audits.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0].startedAt :
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
    async detectUnauthorizedAccess(network) {
        const threats = [];
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
    async detectAnomalousTraffic(network) {
        const threats = [];
        const highTrafficEdges = network.edges.filter(e => e.metadata.bandwidth && typeof e.metadata.bandwidth === 'number' && e.metadata.bandwidth > 1000);
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
    async detectConfigurationVulnerabilities(network) {
        const threats = [];
        const unencryptedEdges = network.edges.filter(e => !e.metadata.encrypted || e.metadata.encrypted === false);
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
    async performComplianceAudit(network) {
        const findings = [];
        const unencryptedEdges = network.edges.filter(e => !e.metadata.encrypted || e.metadata.encrypted === false);
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
    async performVulnerabilityAudit(network) {
        const findings = [];
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
    async performAccessReview(network) {
        const findings = [];
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
    async performPolicyReview(network) {
        const findings = [];
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
    generateSecurityRecommendations(findings) {
        const recommendations = [];
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
    calculateComplianceScore(findings) {
        if (findings.length === 0)
            return 100;
        const totalRisk = findings.reduce((sum, finding) => sum + finding.riskScore, 0);
        const maxRisk = findings.length * 10;
        return Math.max(0, Math.round(100 - (totalRisk / maxRisk) * 100));
    }
    calculateThreatLevel(threats) {
        const activeThreats = threats.filter(t => t.status === 'active');
        if (activeThreats.some(t => t.severity === 'critical'))
            return 'critical';
        if (activeThreats.some(t => t.severity === 'high'))
            return 'high';
        if (activeThreats.some(t => t.severity === 'medium'))
            return 'medium';
        return 'low';
    }
    calculateSecurityScore(networkId) {
        const threats = this.threatDetections.get(networkId) || [];
        const policies = this.securityPolicies.get(networkId) || [];
        const audits = this.auditHistory.get(networkId) || [];
        let score = 100;
        const activeThreats = threats.filter(t => t.status === 'active');
        activeThreats.forEach(threat => {
            switch (threat.severity) {
                case 'critical':
                    score -= 20;
                    break;
                case 'high':
                    score -= 10;
                    break;
                case 'medium':
                    score -= 5;
                    break;
                case 'low':
                    score -= 2;
                    break;
            }
        });
        const activePolicies = policies.filter(p => p.enabled);
        score += Math.min(20, activePolicies.length * 2);
        const recentAudits = audits.filter(a => new Date(a.startedAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000));
        if (recentAudits.length > 0) {
            score += 10;
        }
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
exports.NetworkSecurityService = NetworkSecurityService;
