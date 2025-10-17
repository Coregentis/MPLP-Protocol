"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLPProcessor = void 0;
class NLPProcessor {
    topicKeywords = new Map();
    sentimentLexicon = new Map();
    constructor() {
        this.initializeLexicons();
    }
    async extractTopics(content) {
        const words = this.tokenize(content);
        const topics = new Set();
        for (const [topic, keywords] of this.topicKeywords.entries()) {
            const matchCount = keywords.filter(keyword => words.some(word => word.toLowerCase().includes(keyword.toLowerCase()))).length;
            if (matchCount > 0) {
                topics.add(topic);
            }
        }
        if (topics.size === 0) {
            const frequentWords = this.getFrequentWords(words, 3);
            frequentWords.forEach(word => topics.add(`topic_${word}`));
        }
        return Array.from(topics);
    }
    async analyzeSentiment(content) {
        const words = this.tokenize(content);
        let totalScore = 0;
        let scoredWords = 0;
        for (const word of words) {
            const score = this.sentimentLexicon.get(word.toLowerCase());
            if (score !== undefined) {
                totalScore += score;
                scoredWords++;
            }
        }
        const averageScore = scoredWords > 0 ? totalScore / scoredWords : 0;
        const normalizedScore = Math.max(-1, Math.min(1, averageScore));
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
        const confidence = Math.abs(normalizedScore);
        return {
            score: normalizedScore,
            label,
            confidence
        };
    }
    async extractKeyPhrases(content) {
        const sentences = this.splitIntoSentences(content);
        const phrases = [];
        for (const sentence of sentences) {
            const nounPhrases = this.extractNounPhrases(sentence);
            phrases.push(...nounPhrases);
            const verbPhrases = this.extractVerbPhrases(sentence);
            phrases.push(...verbPhrases);
        }
        const phraseFreq = new Map();
        phrases.forEach(phrase => {
            phraseFreq.set(phrase, (phraseFreq.get(phrase) || 0) + 1);
        });
        return Array.from(phraseFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([phrase]) => phrase);
    }
    async analyzeComplexity(content) {
        const words = this.tokenize(content);
        const sentences = this.splitIntoSentences(content);
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = this.calculateAverageSyllables(words);
        const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
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
        const sentenceComplexity = avgWordsPerSentence / 20;
        const technicalTerms = this.identifyTechnicalTerms(words);
        return {
            readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
            vocabularyLevel,
            sentenceComplexity: Math.max(0, Math.min(1, sentenceComplexity)),
            technicalTerms
        };
    }
    async detectLanguage(content) {
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
        scores.sort((a, b) => b.confidence - a.confidence);
        const primary = scores[0];
        const alternatives = scores.slice(1, 3).filter(s => s.confidence > 0.1);
        return {
            language: primary.language,
            confidence: primary.confidence,
            alternativeLanguages: alternatives
        };
    }
    initializeLexicons() {
        this.topicKeywords.set('technology', ['computer', 'software', 'programming', 'code', 'system', 'data']);
        this.topicKeywords.set('business', ['company', 'market', 'sales', 'customer', 'revenue', 'profit']);
        this.topicKeywords.set('health', ['doctor', 'medicine', 'hospital', 'treatment', 'patient', 'health']);
        this.topicKeywords.set('education', ['school', 'student', 'teacher', 'learning', 'study', 'education']);
        this.topicKeywords.set('sports', ['game', 'team', 'player', 'score', 'match', 'sport']);
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
            if (word.length > 3) {
                frequency.set(word, (frequency.get(word) || 0) + 1);
            }
        });
        return Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([word]) => word);
    }
    extractNounPhrases(sentence) {
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
        const nounIndicators = ['the', 'a', 'an', 'this', 'that', 'these', 'those'];
        const firstWord = phrase.split(' ')[0].toLowerCase();
        return nounIndicators.includes(firstWord) || /^[A-Z]/.test(phrase);
    }
    isLikelyVerbPhrase(phrase) {
        const verbIndicators = ['is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'can', 'could'];
        const firstWord = phrase.split(' ')[0].toLowerCase();
        return verbIndicators.includes(firstWord);
    }
    calculateAverageSyllables(words) {
        const totalSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
        return totalSyllables / words.length;
    }
    countSyllables(word) {
        const vowels = word.match(/[aeiouy]/gi);
        return vowels ? Math.max(1, vowels.length) : 1;
    }
    isComplexWord(word) {
        return word.length > 8 ||
            word.includes('-') ||
            /[A-Z].*[A-Z]/.test(word) ||
            this.countSyllables(word) > 3;
    }
    identifyTechnicalTerms(words) {
        const technicalPatterns = [
            /^[A-Z]{2,}$/,
            /\w+\.\w+/,
            /\w+_\w+/,
            /\d+\w+/,
        ];
        return words.filter(word => technicalPatterns.some(pattern => pattern.test(word)) ||
            word.length > 10).slice(0, 10);
    }
}
exports.NLPProcessor = NLPProcessor;
