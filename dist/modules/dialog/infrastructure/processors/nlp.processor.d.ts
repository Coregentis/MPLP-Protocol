/**
 * NLP Processor Implementation
 * @description NLP处理器实现 - 按指南第534行要求
 * @version 1.0.0
 */
import { INLPProcessor, SentimentResult, LanguageComplexity, LanguageDetectionResult } from '../../types';
/**
 * NLP处理器实现
 * 职责：文本分析、情感分析、主题提取、语言检测
 */
export declare class NLPProcessor implements INLPProcessor {
    private topicKeywords;
    private sentimentLexicon;
    constructor();
    /**
     * 提取主题
     * @param content 内容
     * @returns 主题列表
     */
    extractTopics(content: string): Promise<string[]>;
    /**
     * 分析情感
     * @param content 内容
     * @returns 情感结果
     */
    analyzeSentiment(content: string): Promise<SentimentResult>;
    /**
     * 提取关键短语
     * @param content 内容
     * @returns 关键短语列表
     */
    extractKeyPhrases(content: string): Promise<string[]>;
    /**
     * 分析语言复杂度
     * @param content 内容
     * @returns 语言复杂度
     */
    analyzeComplexity(content: string): Promise<LanguageComplexity>;
    /**
     * 检测语言
     * @param content 内容
     * @returns 语言检测结果
     */
    detectLanguage(content: string): Promise<LanguageDetectionResult>;
    private initializeLexicons;
    private tokenize;
    private splitIntoSentences;
    private getFrequentWords;
    private extractNounPhrases;
    private extractVerbPhrases;
    private isLikelyNounPhrase;
    private isLikelyVerbPhrase;
    private calculateAverageSyllables;
    private countSyllables;
    private isComplexWord;
    private identifyTechnicalTerms;
}
//# sourceMappingURL=nlp.processor.d.ts.map