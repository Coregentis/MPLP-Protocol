import { IPrivacyProtector, ComplianceResult } from '../../types';
export declare class PrivacyProtector implements IPrivacyProtector {
    private sensitivePatterns;
    private anonymizationRules;
    private complianceStandards;
    constructor();
    protectContent(content: string): Promise<string>;
    detectSensitiveData(content: string): Promise<boolean>;
    anonymizeData(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    checkPrivacyCompliance(data: Record<string, unknown>, standard: string): Promise<ComplianceResult>;
    private initializeSensitivePatterns;
    private initializeAnonymizationRules;
    private initializeComplianceStandards;
    private applyAdditionalProtection;
    private isSensitiveField;
    private anonymizeValue;
    private anonymizeArray;
    private checkDataCollection;
    private checkDataProcessing;
    private checkDataStorage;
    private checkUserRights;
    private generateComplianceRecommendations;
}
//# sourceMappingURL=privacy.protector.d.ts.map