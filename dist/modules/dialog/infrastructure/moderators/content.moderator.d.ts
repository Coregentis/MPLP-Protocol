import { IContentModerator, ModerationResult, ContentViolation, PolicyCheckResult } from '../../types';
export declare class ContentModerator implements IContentModerator {
    private profanityList;
    private hateSpeechPatterns;
    private spamPatterns;
    private personalInfoPatterns;
    private policies;
    constructor();
    moderate(content: string): Promise<ModerationResult>;
    detectInappropriateContent(content: string): Promise<ContentViolation[]>;
    sanitizeContent(content: string): Promise<string>;
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