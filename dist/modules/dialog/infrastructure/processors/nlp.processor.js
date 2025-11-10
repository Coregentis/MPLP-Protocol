"use strict";
/**
 * NLP Processor Implementation
 * @description NLP处理器实现 - 按指南第534行要求
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLPProcessor = void 0;
/**
 * NLP处理器实现
 * 职责：文本分析、情感分析、主题提取、语言检测
 */
class NLPProcessor {
    constructor() {
        this.topicKeywords = new Map();
        this.sentimentLexicon = new Map();
        this.initializeLexicons();
    }
    /**
     * 提取主题
     * @param content 内容
     * @returns 主题列表
     */
    async extractTopics(content) {
        const words = this.tokenize(content);
        const topics = new Set();
        // 基于关键词匹配提取主题
        for (const [topic, keywords] of this.topicKeywords.entries()) {
            const matchCount = keywords.filter(keyword => words.some(word => word.toLowerCase().includes(keyword.toLowerCase()))).length;
            if (matchCount > 0) {
                topics.add(topic);
            }
        }
        // 如果没有匹配的主题，使用频率分析
        if (topics.size === 0) {
            const frequentWords = this.getFrequentWords(words, 3);
            frequentWords.forEach(word => topics.add(`topic_${word}`));
        }
        return Array.from(topics);
    }
    /**
     * 分析情感
     * @param content 内容
     * @returns 情感结果
     */
    async analyzeSentiment(content) {
        const words = this.tokenize(content);
        let totalScore = 0;
        let scoredWords = 0;
        // 基于词典的情感分析
        for (const word of words) {
            const score = this.sentimentLexicon.get(word.toLowerCase());
            if (score !== undefined) {
                totalScore += score;
                scoredWords++;
            }
        }
        // 计算平均分数
        const averageScore = scoredWords > 0 ? totalScore / scoredWords : 0;
        // 归一化到-1到1之间
        const normalizedScore = Math.max(-1, Math.min(1, averageScore));
        // 确定标签
        let label;
        if (normalizedScore > 0.1) {
            label = 'positive';
        }
        else if (normalizedScore < -0.1) {
            label = 'negative';
        }
        else {
            label = 'neutral';
        }
        // 计算置信度
        const confidence = Math.abs(normalizedScore);
        return {
            score: normalizedScore,
            label,
            confidence
        };
    }
    /**
     * 提取关键短语
     * @param content 内容
     * @returns 关键短语列表
     */
    async extractKeyPhrases(content) {
        const sentences = this.splitIntoSentences(content);
        const phrases = [];
        for (const sentence of sentences) {
            // 提取名词短语
            const nounPhrases = this.extractNounPhrases(sentence);
            phrases.push(...nounPhrases);
            // 提取动词短语
            const verbPhrases = this.extractVerbPhrases(sentence);
            phrases.push(...verbPhrases);
        }
        // 去重并按频率排序
        const phraseFreq = new Map();
        phrases.forEach(phrase => {
            phraseFreq.set(phrase, (phraseFreq.get(phrase) || 0) + 1);
        });
        return Array.from(phraseFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([phrase]) => phrase);
    }
    /**
     * 分析语言复杂度
     * @param content 内容
     * @returns 语言复杂度
     */
    async analyzeComplexity(content) {
        const words = this.tokenize(content);
        const sentences = this.splitIntoSentences(content);
        // 计算可读性分数（简化版Flesch Reading Ease）
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = this.calculateAverageSyllables(words);
        const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        // 确定词汇水平
        let vocabularyLevel;
        const complexWords = words.filter(word => word.length > 6 || this.isComplexWord(word));
        const complexityRatio = complexWords.length / words.length;
        if (complexityRatio > 0.3) {
            vocabularyLevel = 'advanced';
        }
        else if (complexityRatio > 0.15) {
            vocabularyLevel = 'intermediate';
        }
        else {
            vocabularyLevel = 'basic';
        }
        // 计算句子复杂度
        const sentenceComplexity = avgWordsPerSentence / 20; // 归一化
        // 识别技术术语
        const technicalTerms = this.identifyTechnicalTerms(words);
        return {
            readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
            vocabularyLevel,
            sentenceComplexity: Math.max(0, Math.min(1, sentenceComplexity)),
            technicalTerms
        };
    }
    /**
     * 检测语言
     * @param content 内容
     * @returns 语言检测结果
     */
    async detectLanguage(content) {
        // 简化的语言检测（基于字符特征）
        const languages = [
            { code: 'en', patterns: /[a-zA-Z]/, weight: 1 },
            { code: 'zh', patterns: /[\u4e00-\u9fff]/, weight: 1 },
            { code: 'ja', patterns: /[\u3040-\u309f\u30a0-\u30ff]/, weight: 1 },
            { code: 'ko', patterns: /[\uac00-\ud7af]/, weight: 1 },
            { code: 'ar', patterns: /[\u0600-\u06ff]/, weight: 1 },
            { code: 'ru', patterns: /[\u0400-\u04ff]/, weight: 1 }
        ];
        const scores = languages.map(lang => {
            const matches = content.match(lang.patterns);
            const score = matches ? matches.length / content.length : 0;
            return { language: lang.code, confidence: score };
        });
        // 排序并获取最高分
        scores.sort((a, b) => b.confidence - a.confidence);
        const primary = scores[0];
        if (!primary) {
            // Fallback: 默认返回英语
            return {
                language: 'en',
                confidence: 0,
                alternativeLanguages: []
            };
        }
        const alternatives = scores.slice(1, 3).filter(s => s.confidence > 0.1);
        return {
            language: primary.language,
            confidence: primary.confidence,
            alternativeLanguages: alternatives
        };
    }
    // ===== 私有方法 =====
    initializeLexicons() {
        // 初始化主题关键词
        this.topicKeywords.set('technology', ['computer', 'software', 'programming', 'code', 'system', 'data']);
        this.topicKeywords.set('business', ['company', 'market', 'sales', 'customer', 'revenue', 'profit']);
        this.topicKeywords.set('health', ['doctor', 'medicine', 'hospital', 'treatment', 'patient', 'health']);
        this.topicKeywords.set('education', ['school', 'student', 'teacher', 'learning', 'study', 'education']);
        this.topicKeywords.set('sports', ['game', 'team', 'player', 'score', 'match', 'sport']);
        // 初始化情感词典（简化版）
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'joy'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'disappointed', 'frustrated'];
        positiveWords.forEach(word => this.sentimentLexicon.set(word, 1));
        negativeWords.forEach(word => this.sentimentLexicon.set(word, -1));
    }
    tokenize(content) {
        return content
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }
    splitIntoSentences(content) {
        return content
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }
    getFrequentWords(words, count) {
        const frequency = new Map();
        words.forEach(word => {
            if (word.length > 3) { // 忽略短词
                frequency.set(word, (frequency.get(word) || 0) + 1);
            }
        });
        return Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([word]) => word);
    }
    extractNounPhrases(sentence) {
        // 简化的名词短语提取
        const words = sentence.split(/\s+/);
        const phrases = [];
        for (let i = 0; i < words.length - 1; i++) {
            const phrase = `${words[i]} ${words[i + 1]}`;
            if (this.isLikelyNounPhrase(phrase)) {
                phrases.push(phrase);
            }
        }
        return phrases;
    }
    extractVerbPhrases(sentence) {
        // 简化的动词短语提取
        const words = sentence.split(/\s+/);
        const phrases = [];
        for (let i = 0; i < words.length - 1; i++) {
            const phrase = `${words[i]} ${words[i + 1]}`;
            if (this.isLikelyVerbPhrase(phrase)) {
                phrases.push(phrase);
            }
        }
        return phrases;
    }
    isLikelyNounPhrase(phrase) {
        // 简单的名词短语识别
        const nounIndicators = ['the', 'a', 'an', 'this', 'that', 'these', 'those'];
        const words = phrase.split(' ');
        const firstWord = words[0];
        if (!firstWord) {
            return false;
        }
        return nounIndicators.includes(firstWord.toLowerCase()) || /^[A-Z]/.test(phrase);
    }
    isLikelyVerbPhrase(phrase) {
        // 简单的动词短语识别
        const verbIndicators = ['is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'can', 'could'];
        const words = phrase.split(' ');
        const firstWord = words[0];
        if (!firstWord) {
            return false;
        }
        return verbIndicators.includes(firstWord.toLowerCase());
    }
    calculateAverageSyllables(words) {
        const totalSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
        return totalSyllables / words.length;
    }
    countSyllables(word) {
        // 简化的音节计数
        const vowels = word.match(/[aeiouy]/gi);
        return vowels ? Math.max(1, vowels.length) : 1;
    }
    isComplexWord(word) {
        // 简单的复杂词识别
        return word.length > 8 ||
            word.includes('-') ||
            /[A-Z].*[A-Z]/.test(word) || // 包含多个大写字母
            this.countSyllables(word) > 3;
    }
    identifyTechnicalTerms(words) {
        const technicalPatterns = [
            /^[A-Z]{2,}$/, // 全大写缩写
            /\w+\.\w+/, // 包含点的词（如文件扩展名）
            /\w+_\w+/, // 包含下划线的词
            /\d+\w+/, // 数字+字母组合
        ];
        return words.filter(word => technicalPatterns.some(pattern => pattern.test(word)) ||
            word.length > 10).slice(0, 10); // 限制数量
    }
}
exports.NLPProcessor = NLPProcessor;
//# sourceMappingURL=nlp.processor.js.map