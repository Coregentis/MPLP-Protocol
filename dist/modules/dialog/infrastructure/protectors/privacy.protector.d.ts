/**
 * Privacy Protector Implementation
 * @description 隐私保护器实现 - 按指南第867行要求
 * @version 1.0.0
 */
import { IPrivacyProtector, ComplianceResult } from '../../types';
/**
 * 隐私保护器实现
 * 职责：隐私保护、敏感数据检测、数据匿名化、合规检查
 */
export declare class PrivacyProtector implements IPrivacyProtector {
    private sensitivePatterns;
    private anonymizationRules;
    private complianceStandards;
    constructor();
    /**
     * 保护内容
     * @param content 内容
     * @returns 保护后的内容
     */
    protectContent(content: string): Promise<string>;
    /**
     * 检测敏感数据
     * @param content 内容
     * @returns 是否包含敏感数据
     */
    detectSensitiveData(content: string): Promise<boolean>;
    /**
     * 匿名化数据
     * @param data 数据对象
     * @returns 匿名化后的数据
     */
    anonymizeData(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * 检查隐私合规性
     * @param data 数据对象
     * @param standard 合规标准
     * @returns 合规检查结果
     */
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