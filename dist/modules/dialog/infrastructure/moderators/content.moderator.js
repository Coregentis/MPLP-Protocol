"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModerator = void 0;
class ContentModerator {
    profanityList = new Set();
    hateSpeechPatterns = [];
    spamPatterns = [];
    personalInfoPatterns = new Map();
    policies = new Map();
    constructor() {
        this.initializeModerationRules();
        this.initializePolicies();
    }
    async moderate(content) {
        const violations = [];
        const profanityViolations = await this.checkProfanity(content);
        violations.push(...profanityViolations);
        const hateSpeechViolations = await this.checkHateSpeech(content);
        violations.push(...hateSpeechViolations);
        const spamViolations = await this.checkSpam(content);
        violations.push(...spamViolations);
        const personalInfoViolations = await this.checkPersonalInfo(content);
        violations.push(...personalInfoViolations);
        const inappropriateViolations = await this.checkInappropriateContent(content);
        violations.push(...inappropriateViolations);
        const confidence = this.calculateModerationConfidence(violations);
        const approved = this.shouldApprove(violations);
        const sanitizedContent = approved ? undefined : await this.sanitizeContent(content);
        return {
            approved,
            confidence,
            violations,
            sanitizedContent
        };
    }
    async detectInappropriateContent(content) {
        const violations = [];
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
    async sanitizeContent(content) {
        let sanitized = content;
        for (const word of this.profanityList) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            sanitized = sanitized.replace(regex, '*'.repeat(word.length));
        }
        for (const [type, pattern] of this.personalInfoPatterns.entries()) {
            sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REMOVED]`);
        }
        for (const pattern of this.spamPatterns) {
            sanitized = sanitized.replace(pattern, '[SPAM_REMOVED]');
        }
        return sanitized;
    }
    async checkContentPolicy(content, policy) {
        const policyConfig = this.policies.get(policy);
        if (!policyConfig) {
            throw new Error(`Policy ${policy} not found`);
        }
        const violations = [];
        let score = 100;
        if (policyConfig.maxLength && content.length > policyConfig.maxLength) {
            violations.push(`内容长度超过限制 (${content.length}/${policyConfig.maxLength})`);
            score -= 20;
        }
        if (policyConfig.bannedWords) {
            for (const word of policyConfig.bannedWords) {
                if (content.toLowerCase().includes(word.toLowerCase())) {
                    violations.push(`包含禁用词汇: ${word}`);
                    score -= 15;
                }
            }
        }
        if (policyConfig.requiredElements) {
            for (const element of policyConfig.requiredElements) {
                if (!content.includes(element)) {
                    violations.push(`缺少必需元素: ${element}`);
                    score -= 10;
                }
            }
        }
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
    initializeModerationRules() {
        const profanityWords = [
            'damn', 'hell', 'shit', 'fuck', 'bitch', 'asshole',
        ];
        profanityWords.forEach(word => this.profanityList.add(word));
        this.hateSpeechPatterns = [
            /\b(hate|racist|discrimination)\b/gi,
            /\b(nazi|fascist|terrorist)\b/gi,
            /\b(kill all|death to)\b/gi
        ];
        this.spamPatterns = [
            /\b(click here|buy now|limited time|act now)\b/gi,
            /\b(free money|get rich|make money fast)\b/gi,
            /\b(viagra|casino|lottery|winner)\b/gi
        ];
        this.personalInfoPatterns.set('email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
        this.personalInfoPatterns.set('phone', /\b\d{3}-\d{3}-\d{4}\b/g);
        this.personalInfoPatterns.set('ssn', /\b\d{3}-\d{2}-\d{4}\b/g);
        this.personalInfoPatterns.set('credit_card', /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g);
    }
    initializePolicies() {
        this.policies.set('general', {
            name: 'General Content Policy',
            maxLength: 5000,
            bannedWords: ['spam', 'scam', 'fraud'],
            requiredElements: [],
            formatRules: []
        });
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
        if (violations.length === 0)
            return true;
        const hasHighSeverity = violations.some(v => v.severity === 'high' || v.severity === 'critical');
        if (hasHighSeverity)
            return false;
        const mediumViolations = violations.filter(v => v.severity === 'medium');
        if (mediumViolations.length > 3)
            return false;
        return true;
    }
}
exports.ContentModerator = ContentModerator;
