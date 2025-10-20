/**
 * Content Moderator Implementation
 * @description 内容审核器实现 - 按指南第842行要求
 * @version 1.0.0
 */
import { IContentModerator, ModerationResult, ContentViolation, PolicyCheckResult } from '../../types';
/**
 * 内容审核器实现
 * 职责：内容审核、违规检测、内容净化、策略检查
 */
export declare class ContentModerator implements IContentModerator {
    private profanityList;
    private hateSpeechPatterns;
    private spamPatterns;
    private personalInfoPatterns;
    private policies;
    constructor();
    /**
     * 审核内容
     * @param content 内容
     * @returns 审核结果
     */
    moderate(content: string): Promise<ModerationResult>;
    /**
     * 检测不当内容
     * @param content 内容
     * @returns 内容违规列表
     */
    detectInappropriateContent(content: string): Promise<ContentViolation[]>;
    /**
     * 净化内容
     * @param content 内容
     * @returns 净化后的内容
     */
    sanitizeContent(content: string): Promise<string>;
    /**
     * 检查内容策略
     * @param content 内容
     * @param policy 策略名称
     * @returns 策略检查结果
     */
    checkContentPolicy(content: string, policy: string): Promise<PolicyCheckResult>;
    private initializeModerationRules;
    private initializePolicies;
    private checkProfanity;
    private checkHateSpeech;
    private checkSpam;
    private checkPersonalInfo;
    private checkInappropriateContent;
    private findPatternLocation;
    private calculateModerationConfidence;
    private shouldApprove;
}
//# sourceMappingURL=content.moderator.d.ts.map