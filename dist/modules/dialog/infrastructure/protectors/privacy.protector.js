"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyProtector = void 0;
class PrivacyProtector {
    sensitivePatterns = new Map();
    anonymizationRules = new Map();
    complianceStandards = new Map();
    constructor() {
        this.initializeSensitivePatterns();
        this.initializeAnonymizationRules();
        this.initializeComplianceStandards();
    }
    async protectContent(content) {
        let protectedContent = content;
        for (const [type, pattern] of this.sensitivePatterns.entries()) {
            const rule = this.anonymizationRules.get(type);
            if (rule) {
                protectedContent = protectedContent.replace(pattern, rule.replacement);
            }
        }
        protectedContent = this.applyAdditionalProtection(protectedContent);
        return protectedContent;
    }
    async detectSensitiveData(content) {
        for (const pattern of this.sensitivePatterns.values()) {
            if (pattern.test(content)) {
                return true;
            }
        }
        return false;
    }
    async anonymizeData(data) {
        const anonymized = {};
        for (const [key, value] of Object.entries(data)) {
            if (this.isSensitiveField(key)) {
                anonymized[key] = this.anonymizeValue(key, value);
            }
            else if (typeof value === 'string') {
                anonymized[key] = await this.protectContent(value);
            }
            else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                anonymized[key] = await this.anonymizeData(value);
            }
            else if (Array.isArray(value)) {
                anonymized[key] = await this.anonymizeArray(value);
            }
            else {
                anonymized[key] = value;
            }
        }
        return anonymized;
    }
    async checkPrivacyCompliance(data, standard) {
        const complianceStd = this.complianceStandards.get(standard);
        if (!complianceStd) {
            throw new Error(`Compliance standard ${standard} not supported`);
        }
        const violations = [];
        let score = 100;
        const dataCollectionViolations = this.checkDataCollection(data, complianceStd);
        violations.push(...dataCollectionViolations);
        score -= dataCollectionViolations.length * 10;
        const dataProcessingViolations = this.checkDataProcessing(data, complianceStd);
        violations.push(...dataProcessingViolations);
        score -= dataProcessingViolations.length * 15;
        const dataStorageViolations = this.checkDataStorage(data, complianceStd);
        violations.push(...dataStorageViolations);
        score -= dataStorageViolations.length * 20;
        const userRightsViolations = this.checkUserRights(data, complianceStd);
        violations.push(...userRightsViolations);
        score -= userRightsViolations.length * 25;
        const compliant = violations.length === 0;
        const finalScore = Math.max(0, score);
        const recommendations = this.generateComplianceRecommendations(violations, standard);
        return {
            standard,
            compliant,
            score: finalScore,
            violations,
            recommendations
        };
    }
    initializeSensitivePatterns() {
        this.sensitivePatterns.set('email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
        this.sensitivePatterns.set('phone', /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g);
        this.sensitivePatterns.set('ssn', /\b\d{3}-\d{2}-\d{4}\b/g);
        this.sensitivePatterns.set('credit_card', /\b(?:\d{4}[-\s]?){3}\d{4}\b/g);
        this.sensitivePatterns.set('ip_address', /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g);
        this.sensitivePatterns.set('id_number', /\b\d{15}|\d{18}\b/g);
        this.sensitivePatterns.set('bank_account', /\b\d{10,20}\b/g);
        this.sensitivePatterns.set('address', /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi);
    }
    initializeAnonymizationRules() {
        this.anonymizationRules.set('email', {
            replacement: '[EMAIL_PROTECTED]',
            preserveFormat: false
        });
        this.anonymizationRules.set('phone', {
            replacement: '[PHONE_PROTECTED]',
            preserveFormat: false
        });
        this.anonymizationRules.set('ssn', {
            replacement: 'XXX-XX-XXXX',
            preserveFormat: true
        });
        this.anonymizationRules.set('credit_card', {
            replacement: 'XXXX-XXXX-XXXX-XXXX',
            preserveFormat: true
        });
        this.anonymizationRules.set('ip_address', {
            replacement: 'XXX.XXX.XXX.XXX',
            preserveFormat: true
        });
        this.anonymizationRules.set('id_number', {
            replacement: '[ID_PROTECTED]',
            preserveFormat: false
        });
        this.anonymizationRules.set('bank_account', {
            replacement: '[ACCOUNT_PROTECTED]',
            preserveFormat: false
        });
        this.anonymizationRules.set('address', {
            replacement: '[ADDRESS_PROTECTED]',
            preserveFormat: false
        });
    }
    initializeComplianceStandards() {
        this.complianceStandards.set('GDPR', {
            name: 'General Data Protection Regulation',
            requirements: {
                dataMinimization: true,
                consentRequired: true,
                rightToErasure: true,
                dataPortability: true,
                privacyByDesign: true,
                dataProtectionOfficer: false
            },
            sensitiveDataTypes: ['email', 'phone', 'ip_address', 'id_number'],
            retentionLimits: {
                personalData: 365 * 2,
                sensitiveData: 365 * 1
            }
        });
        this.complianceStandards.set('CCPA', {
            name: 'California Consumer Privacy Act',
            requirements: {
                dataMinimization: true,
                consentRequired: false,
                rightToErasure: true,
                dataPortability: true,
                privacyByDesign: false,
                dataProtectionOfficer: false
            },
            sensitiveDataTypes: ['email', 'phone', 'ssn', 'credit_card'],
            retentionLimits: {
                personalData: 365 * 3,
                sensitiveData: 365 * 1
            }
        });
        this.complianceStandards.set('HIPAA', {
            name: 'Health Insurance Portability and Accountability Act',
            requirements: {
                dataMinimization: true,
                consentRequired: true,
                rightToErasure: false,
                dataPortability: true,
                privacyByDesign: true,
                dataProtectionOfficer: true
            },
            sensitiveDataTypes: ['email', 'phone', 'ssn', 'id_number', 'address'],
            retentionLimits: {
                personalData: 365 * 6,
                sensitiveData: 365 * 6
            }
        });
    }
    applyAdditionalProtection(content) {
        let protectedContent = content.replace(/\s{2,}/g, ' ').trim();
        protectedContent = protectedContent.replace(/@\w+/g, '@[USERNAME]');
        protectedContent = protectedContent.replace(/https?:\/\/[^\s]+/g, '[URL_PROTECTED]');
        return protectedContent;
    }
    isSensitiveField(fieldName) {
        const sensitiveFields = [
            'email', 'phone', 'ssn', 'password', 'creditCard', 'bankAccount',
            'address', 'firstName', 'lastName', 'fullName', 'dateOfBirth',
            'socialSecurityNumber', 'driverLicense', 'passport'
        ];
        return sensitiveFields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()));
    }
    anonymizeValue(fieldName, value) {
        if (typeof value !== 'string') {
            return '[PROTECTED]';
        }
        const lowerFieldName = fieldName.toLowerCase();
        if (lowerFieldName.includes('email')) {
            return '[EMAIL_PROTECTED]';
        }
        else if (lowerFieldName.includes('phone')) {
            return '[PHONE_PROTECTED]';
        }
        else if (lowerFieldName.includes('name')) {
            return '[NAME_PROTECTED]';
        }
        else if (lowerFieldName.includes('address')) {
            return '[ADDRESS_PROTECTED]';
        }
        else if (lowerFieldName.includes('ssn') || lowerFieldName.includes('social')) {
            return 'XXX-XX-XXXX';
        }
        else {
            return '[PROTECTED]';
        }
    }
    async anonymizeArray(array) {
        const anonymized = [];
        for (const item of array) {
            if (typeof item === 'object' && item !== null) {
                anonymized.push(await this.anonymizeData(item));
            }
            else if (typeof item === 'string') {
                anonymized.push(await this.protectContent(item));
            }
            else {
                anonymized.push(item);
            }
        }
        return anonymized;
    }
    checkDataCollection(data, standard) {
        const violations = [];
        const sensitiveFieldCount = Object.keys(data).filter(key => this.isSensitiveField(key)).length;
        if (sensitiveFieldCount > 5) {
            violations.push('收集的敏感数据字段过多，违反数据最小化原则');
        }
        for (const key of Object.keys(data)) {
            if (this.isSensitiveField(key) && !standard.sensitiveDataTypes.includes(key)) {
                violations.push(`收集了不被${standard.name}允许的敏感数据类型: ${key}`);
            }
        }
        return violations;
    }
    checkDataProcessing(data, standard) {
        const violations = [];
        if (!data.processingPurpose) {
            violations.push('缺少数据处理目的说明');
        }
        if (!data.processingLegalBasis && standard.requirements.consentRequired) {
            violations.push('缺少数据处理的法律依据');
        }
        return violations;
    }
    checkDataStorage(data, _standard) {
        const violations = [];
        if (!data.encryptionEnabled) {
            violations.push('数据存储未启用加密');
        }
        if (!data.accessControls) {
            violations.push('缺少适当的数据访问控制');
        }
        return violations;
    }
    checkUserRights(data, standard) {
        const violations = [];
        if (standard.requirements.rightToErasure && !data.deletionMechanism) {
            violations.push('缺少数据删除机制，违反用户删除权');
        }
        if (standard.requirements.dataPortability && !data.exportMechanism) {
            violations.push('缺少数据导出机制，违反数据可携带权');
        }
        return violations;
    }
    generateComplianceRecommendations(violations, standard) {
        const recommendations = [];
        if (violations.length === 0) {
            recommendations.push(`继续维护${standard}合规性的良好实践`);
            return recommendations;
        }
        if (violations.some(v => v.includes('数据最小化'))) {
            recommendations.push('减少收集的敏感数据字段，只收集业务必需的数据');
        }
        if (violations.some(v => v.includes('加密'))) {
            recommendations.push('启用数据加密存储和传输');
        }
        if (violations.some(v => v.includes('删除'))) {
            recommendations.push('实施用户数据删除机制');
        }
        if (violations.some(v => v.includes('导出'))) {
            recommendations.push('提供用户数据导出功能');
        }
        if (violations.some(v => v.includes('访问控制'))) {
            recommendations.push('建立严格的数据访问控制机制');
        }
        recommendations.push('定期进行隐私合规审计');
        recommendations.push('建立数据保护培训计划');
        return recommendations;
    }
}
exports.PrivacyProtector = PrivacyProtector;
