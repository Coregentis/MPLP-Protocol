"use strict";
/**
 * Content Moderator Implementation
 * @description 内容审核器实现 - 按指南第842行要求
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModerator = void 0;
/**
 * 内容审核器实现
 * 职责：内容审核、违规检测、内容净化、策略检查
 */
class ContentModerator {
    constructor() {
        this.profanityList = new Set();
        this.hateSpeechPatterns = [];
        this.spamPatterns = [];
        this.personalInfoPatterns = new Map();
        this.policies = new Map();
        this.initializeModerationRules();
        this.initializePolicies();
    }
    /**
     * 审核内容
     * @param content 内容
     * @returns 审核结果
     */
    async moderate(content) {
        const violations = [];
        // 检查亵渎内容
        const profanityViolations = await this.checkProfanity(content);
        violations.push(...profanityViolations);
        // 检查仇恨言论
        const hateSpeechViolations = await this.checkHateSpeech(content);
        violations.push(...hateSpeechViolations);
        // 检查垃圾信息
        const spamViolations = await this.checkSpam(content);
        violations.push(...spamViolations);
        // 检查个人信息
        const personalInfoViolations = await this.checkPersonalInfo(content);
        violations.push(...personalInfoViolations);
        // 检查不当内容
        const inappropriateViolations = await this.checkInappropriateContent(content);
        violations.push(...inappropriateViolations);
        // 计算总体置信度
        const confidence = this.calculateModerationConfidence(violations);
        // 确定是否批准
        const approved = this.shouldApprove(violations);
        // 生成净化内容（如果需要）
        const sanitizedContent = approved ? undefined : await this.sanitizeContent(content);
        return {
            approved,
            confidence,
            violations,
            sanitizedContent
        };
    }
    /**
     * 检测不当内容
     * @param content 内容
     * @returns 内容违规列表
     */
    async detectInappropriateContent(content) {
        const violations = [];
        // 检查暴力内容
        const violencePatterns = [
            /\b(kill|murder|violence|attack|harm)\b/gi,
            /\b(weapon|gun|knife|bomb)\b/gi
        ];
        for (const pattern of violencePatterns) {
            const matches = content.match(pattern);
            if (matches) {
                violations.push({
                    type: 'inappropriate',
                    severity: 'high',
                    description: `检测到暴力相关内容: ${matches.join(', ')}`,
                    location: this.findPatternLocation(content, pattern),
                    suggestion: '请使用更温和的表达方式'
                });
            }
        }
        // 检查成人内容
        const adultPatterns = [
            /\b(sex|sexual|adult|explicit)\b/gi,
            /\b(porn|nude|naked)\b/gi
        ];
        for (const pattern of adultPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                violations.push({
                    type: 'inappropriate',
                    severity: 'high',
                    description: `检测到成人内容: ${matches.join(', ')}`,
                    location: this.findPatternLocation(content, pattern),
                    suggestion: '请避免使用成人相关内容'
                });
            }
        }
        return violations;
    }
    /**
     * 净化内容
     * @param content 内容
     * @returns 净化后的内容
     */
    async sanitizeContent(content) {
        let sanitized = content;
        // 替换亵渎词汇
        for (const word of this.profanityList) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            sanitized = sanitized.replace(regex, '*'.repeat(word.length));
        }
        // 移除个人信息
        for (const [type, pattern] of this.personalInfoPatterns.entries()) {
            sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REMOVED]`);
        }
        // 清理垃圾信息标记
        for (const pattern of this.spamPatterns) {
            sanitized = sanitized.replace(pattern, '[SPAM_REMOVED]');
        }
        return sanitized;
    }
    /**
     * 检查内容策略
     * @param content 内容
     * @param policy 策略名称
     * @returns 策略检查结果
     */
    async checkContentPolicy(content, policy) {
        const policyConfig = this.policies.get(policy);
        if (!policyConfig) {
            throw new Error(`Policy ${policy} not found`);
        }
        const violations = [];
        let score = 100;
        // 检查长度限制
        if (policyConfig.maxLength && content.length > policyConfig.maxLength) {
            violations.push(`内容长度超过限制 (${content.length}/${policyConfig.maxLength})`);
            score -= 20;
        }
        // 检查禁用词汇
        if (policyConfig.bannedWords) {
            for (const word of policyConfig.bannedWords) {
                if (content.toLowerCase().includes(word.toLowerCase())) {
                    violations.push(`包含禁用词汇: ${word}`);
                    score -= 15;
                }
            }
        }
        // 检查必需元素
        if (policyConfig.requiredElements) {
            for (const element of policyConfig.requiredElements) {
                if (!content.includes(element)) {
                    violations.push(`缺少必需元素: ${element}`);
                    score -= 10;
                }
            }
        }
        // 检查格式要求
        if (policyConfig.formatRules) {
            for (const rule of policyConfig.formatRules) {
                if (!rule.pattern.test(content)) {
                    violations.push(`不符合格式要求: ${rule.description}`);
                    score -= 5;
                }
            }
        }
        const compliant = violations.length === 0;
        const finalScore = Math.max(0, score);
        return {
            compliant,
            policy,
            violations,
            score: finalScore
        };
    }
    // ===== 私有方法 =====
    initializeModerationRules() {
        // 初始化亵渎词汇列表
        const profanityWords = [
            'damn', 'hell', 'shit', 'fuck', 'bitch', 'asshole',
            // 添加更多词汇...
        ];
        profanityWords.forEach(word => this.profanityList.add(word));
        // 初始化仇恨言论模式 - ✅ Security fix: Simplified patterns to avoid ReDoS
        this.hateSpeechPatterns = [
            /\b(?:hate|racist|discrimination)\b/gi,
            /\b(?:nazi|fascist|terrorist)\b/gi,
            /\b(?:kill all|death to)\b/gi
        ];
        // 初始化垃圾信息模式 - ✅ Security fix: Simplified patterns to avoid ReDoS
        this.spamPatterns = [
            /\b(?:click here|buy now|limited time|act now)\b/gi,
            /\b(?:free money|get rich|make money fast)\b/gi,
            /\b(?:viagra|casino|lottery|winner)\b/gi
        ];
        // 初始化个人信息模式
        this.personalInfoPatterns.set('email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
        this.personalInfoPatterns.set('phone', /\b\d{3}-\d{3}-\d{4}\b/g);
        this.personalInfoPatterns.set('ssn', /\b\d{3}-\d{2}-\d{4}\b/g);
        this.personalInfoPatterns.set('credit_card', /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g);
    }
    initializePolicies() {
        // 通用内容策略
        this.policies.set('general', {
            name: 'General Content Policy',
            maxLength: 5000,
            bannedWords: ['spam', 'scam', 'fraud'],
            requiredElements: [],
            formatRules: []
        });
        // 商业内容策略
        this.policies.set('business', {
            name: 'Business Content Policy',
            maxLength: 2000,
            bannedWords: ['illegal', 'unauthorized', 'pirated'],
            requiredElements: [],
            formatRules: [
                {
                    pattern: /^[A-Z]/,
                    description: '内容应以大写字母开头'
                }
            ]
        });
        // 教育内容策略
        this.policies.set('educational', {
            name: 'Educational Content Policy',
            maxLength: 10000,
            bannedWords: ['cheat', 'plagiarism'],
            requiredElements: [],
            formatRules: []
        });
    }
    async checkProfanity(content) {
        const violations = [];
        const lowerContent = content.toLowerCase();
        for (const word of this.profanityList) {
            const index = lowerContent.indexOf(word);
            if (index !== -1) {
                violations.push({
                    type: 'profanity',
                    severity: 'medium',
                    description: `检测到亵渎词汇: ${word}`,
                    location: { start: index, end: index + word.length },
                    suggestion: '请使用更文明的语言'
                });
            }
        }
        return violations;
    }
    async checkHateSpeech(content) {
        const violations = [];
        for (const pattern of this.hateSpeechPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                violations.push({
                    type: 'hate_speech',
                    severity: 'high',
                    description: `检测到仇恨言论: ${matches.join(', ')}`,
                    location: this.findPatternLocation(content, pattern),
                    suggestion: '请避免使用仇恨或歧视性语言'
                });
            }
        }
        return violations;
    }
    async checkSpam(content) {
        const violations = [];
        for (const pattern of this.spamPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                violations.push({
                    type: 'spam',
                    severity: 'medium',
                    description: `检测到垃圾信息标识: ${matches.join(', ')}`,
                    location: this.findPatternLocation(content, pattern),
                    suggestion: '请避免使用营销或垃圾信息用语'
                });
            }
        }
        return violations;
    }
    async checkPersonalInfo(content) {
        const violations = [];
        for (const [type, pattern] of this.personalInfoPatterns.entries()) {
            const matches = content.match(pattern);
            if (matches) {
                violations.push({
                    type: 'personal_info',
                    severity: 'high',
                    description: `检测到个人信息 (${type}): ${matches.length} 处`,
                    location: this.findPatternLocation(content, pattern),
                    suggestion: '请移除个人敏感信息'
                });
            }
        }
        return violations;
    }
    async checkInappropriateContent(content) {
        return await this.detectInappropriateContent(content);
    }
    findPatternLocation(content, pattern) {
        const match = content.match(pattern);
        if (match && match.index !== undefined) {
            return {
                start: match.index,
                end: match.index + match[0].length
            };
        }
        return { start: 0, end: 0 };
    }
    calculateModerationConfidence(violations) {
        if (violations.length === 0)
            return 0.95;
        const severityWeights = {
            low: 0.1,
            medium: 0.3,
            high: 0.6,
            critical: 0.9
        };
        const totalWeight = violations.reduce((sum, violation) => {
            return sum + (severityWeights[violation.severity] || 0.3);
        }, 0);
        const averageWeight = totalWeight / violations.length;
        return Math.max(0.5, 1 - averageWeight);
    }
    shouldApprove(violations) {
        // 如果没有违规，批准
        if (violations.length === 0)
            return true;
        // 如果有高危或严重违规，不批准
        const hasHighSeverity = violations.some(v => v.severity === 'high' || v.severity === 'critical');
        if (hasHighSeverity)
            return false;
        // 如果中等违规过多，不批准
        const mediumViolations = violations.filter(v => v.severity === 'medium');
        if (mediumViolations.length > 3)
            return false;
        // 其他情况批准
        return true;
    }
}
exports.ContentModerator = ContentModerator;
//# sourceMappingURL=content.moderator.js.map