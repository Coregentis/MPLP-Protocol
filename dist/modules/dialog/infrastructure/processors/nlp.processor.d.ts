import { INLPProcessor, SentimentResult, LanguageComplexity, LanguageDetectionResult } from '../../types';
export declare class NLPProcessor implements INLPProcessor {
    private topicKeywords;
    private sentimentLexicon;
    constructor();
    extractTopics(content: string): Promise<string[]>;
    analyzeSentiment(content: string): Promise<SentimentResult>;
    extractKeyPhrases(content: string): Promise<string[]>;
    analyzeComplexity(content: string): Promise<LanguageComplexity>;
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