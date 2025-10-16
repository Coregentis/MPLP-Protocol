/**
 * AI Coordination Example - Creator Agent Implementation
 * Specialized agent for content creation and writing
 */

import { BaseAgent, BaseAgentConfig } from './BaseAgent';
import {
  Task,
  AgentMessage,
  TaskRequirements,
  ContentStyle,
  AgentError
} from '../types';
import { ContentPlan } from './PlannerAgent';

export interface CreatorAgentConfig extends Omit<BaseAgentConfig, 'type' | 'capabilities'> {
  readonly writing_styles?: WritingStyle[];
  readonly content_types?: ContentType[];
  readonly language_capabilities?: LanguageCapability[];
  readonly creativity_level?: number; // 0-1
}

export type WritingStyle = 
  | 'narrative'
  | 'expository'
  | 'persuasive'
  | 'descriptive'
  | 'technical'
  | 'conversational'
  | 'academic'
  | 'journalistic';

export type ContentType = 
  | 'article'
  | 'blog_post'
  | 'white_paper'
  | 'case_study'
  | 'tutorial'
  | 'news_story'
  | 'product_description'
  | 'social_media_post';

export interface LanguageCapability {
  readonly language: string;
  readonly proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
  readonly specializations: string[];
}

export interface CreatedContent {
  readonly title: string;
  readonly content: string;
  readonly word_count: number;
  readonly language: string;
  readonly style: ContentStyle;
  readonly sections: ContentSection[];
  readonly metadata: ContentMetadata;
  readonly quality_indicators: QualityIndicator[];
}

export interface ContentSection {
  readonly title: string;
  readonly content: string;
  readonly word_count: number;
  readonly key_points_covered: string[];
}

export interface ContentMetadata {
  readonly created_at: Date;
  readonly estimated_reading_time: number;
  readonly complexity_score: number;
  readonly tone: string;
  readonly target_audience: string;
  readonly seo_optimized: boolean;
}

export interface QualityIndicator {
  readonly metric: string;
  readonly score: number;
  readonly description: string;
}

export class CreatorAgent extends BaseAgent {
  private readonly writingStyles: WritingStyle[];
  private readonly contentTypes: ContentType[];
  private readonly languageCapabilities: LanguageCapability[];
  private readonly creativityLevel: number;
  private readonly creationHistory: CreatedContent[] = [];

  constructor(config: CreatorAgentConfig) {
    super({
      ...config,
      type: 'creator',
      capabilities: [
        'content_creation',
        'multi_language',
        'quality_assessment'
      ]
    });

    this.writingStyles = config.writing_styles ?? [
      'narrative',
      'expository',
      'technical',
      'conversational'
    ];

    this.contentTypes = config.content_types ?? [
      'article',
      'blog_post',
      'tutorial',
      'case_study'
    ];

    this.languageCapabilities = config.language_capabilities ?? [
      {
        language: 'en-US',
        proficiency: 'native',
        specializations: ['technical_writing', 'business_communication']
      },
      {
        language: 'zh-CN',
        proficiency: 'fluent',
        specializations: ['general_content', 'technical_documentation']
      }
    ];

    this.creativityLevel = Math.max(0, Math.min(1, config.creativity_level ?? 0.7));
  }

  protected async onInitialize(): Promise<void> {
    // Initialize writing models and style templates
    await this.loadWritingTemplates();
    await this.calibrateCreativityModels();
    
    console.log(`✍️ CreatorAgent "${this.name}" initialized with styles:`, 
      this.writingStyles.join(', '));
  }

  protected async onProcessTask(task: Task): Promise<CreatedContent> {
    if (task.type !== 'content_creation') {
      throw new AgentError(
        `CreatorAgent can only handle content_creation tasks`,
        this.id,
        'UNSUPPORTED_TASK_TYPE',
        { taskType: task.type }
      );
    }

    const requirements = task.requirements;
    
    // Check if we have a content plan from planner
    const contentPlan = task.context.metadata?.['contentPlan'] as ContentPlan | undefined;
    
    // Create content based on requirements and plan
    const createdContent = await this.createContent(requirements, contentPlan);
    
    // Enhance content quality
    const enhancedContent = await this.enhanceContent(createdContent, requirements);
    
    // Store in creation history
    this.creationHistory.push(enhancedContent);
    
    return enhancedContent;
  }

  protected async onCommunicate(message: AgentMessage): Promise<unknown> {
    switch (message.type) {
      case 'decision_request':
        return await this.handleDecisionRequest(message);
      
      case 'information_sharing':
        return await this.handleInformationSharing(message);
      
      case 'coordination_request':
        return await this.handleCoordinationRequest(message);
      
      default:
        return {
          status: 'acknowledged',
          message: `CreatorAgent received ${message.type} message`,
          timestamp: new Date()
        };
    }
  }

  protected async onShutdown(): Promise<void> {
    // Save creation history and cleanup resources
    await this.saveCreationHistory();
    console.log(`✍️ CreatorAgent "${this.name}" shutdown completed`);
  }

  // ============================================================================
  // Content Creation Implementation Methods
  // ============================================================================

  private async createContent(
    requirements: TaskRequirements,
    contentPlan?: ContentPlan
  ): Promise<CreatedContent> {
    const topic = requirements.topic ?? 'General Content';
    const style = requirements.style ?? 'professional';
    const targetLength = requirements.length ?? 1000;
    const language = requirements.languages?.[0] ?? 'en-US';

    // Use content plan if available, otherwise create basic structure
    const sections = contentPlan 
      ? await this.createFromPlan(contentPlan, targetLength)
      : await this.createBasicStructure(topic, targetLength, style);

    // Generate title
    const title = await this.generateTitle(topic, style);

    // Combine sections into full content
    const fullContent = sections.map(section => 
      `## ${section.title}\n\n${section.content}`
    ).join('\n\n');

    const wordCount = this.countWords(fullContent);

    // Generate metadata
    const metadata: ContentMetadata = {
      created_at: new Date(),
      estimated_reading_time: Math.ceil(wordCount / 200), // 200 words per minute
      complexity_score: await this.calculateComplexityScore(fullContent),
      tone: await this.analyzeTone(fullContent, style),
      target_audience: contentPlan?.target_audience ?? 'general_audience',
      seo_optimized: contentPlan?.seo_keywords ? true : false
    };

    // Assess quality
    const qualityIndicators = await this.assessContentQuality(fullContent, requirements);

    return {
      title,
      content: fullContent,
      word_count: wordCount,
      language,
      style,
      sections,
      metadata,
      quality_indicators: qualityIndicators
    };
  }

  private async createFromPlan(plan: ContentPlan, targetLength: number): Promise<ContentSection[]> {
    const sections: ContentSection[] = [];

    for (const planSection of plan.structure_outline) {
      const content = await this.generateSectionContent(
        planSection.title,
        planSection.key_points,
        planSection.estimated_length,
        plan.content_style
      );

      sections.push({
        title: planSection.title,
        content,
        word_count: this.countWords(content),
        key_points_covered: planSection.key_points
      });
    }

    return sections;
  }

  private async createBasicStructure(
    topic: string,
    targetLength: number,
    style: ContentStyle
  ): Promise<ContentSection[]> {
    const sectionsCount = Math.max(3, Math.min(6, Math.floor(targetLength / 200)));
    const avgSectionLength = Math.floor(targetLength / sectionsCount);

    const sections: ContentSection[] = [];

    // Introduction
    sections.push({
      title: 'Introduction',
      content: await this.generateSectionContent(
        'Introduction',
        [`Overview of ${topic}`, 'Why this matters', 'What you will learn'],
        Math.floor(avgSectionLength * 0.8),
        style
      ),
      word_count: 0,
      key_points_covered: ['introduction', 'overview', 'objectives']
    });

    // Main sections
    for (let i = 1; i < sectionsCount - 1; i++) {
      const sectionTitle = `Key Aspect ${i}`;
      const content = await this.generateSectionContent(
        sectionTitle,
        [`Main point ${i}`, 'Supporting details', 'Practical examples'],
        avgSectionLength,
        style
      );

      sections.push({
        title: sectionTitle,
        content,
        word_count: this.countWords(content),
        key_points_covered: [`aspect_${i}`, 'examples', 'details']
      });
    }

    // Conclusion
    sections.push({
      title: 'Conclusion',
      content: await this.generateSectionContent(
        'Conclusion',
        ['Summary of key points', 'Next steps', 'Final thoughts'],
        Math.floor(avgSectionLength * 0.8),
        style
      ),
      word_count: 0,
      key_points_covered: ['summary', 'next_steps', 'conclusion']
    });

    // Update word counts
    sections.forEach(section => {
      (section as any).word_count = this.countWords(section.content);
    });

    return sections;
  }

  private async generateSectionContent(
    title: string,
    keyPoints: string[],
    targetLength: number,
    style: ContentStyle
  ): Promise<string> {
    // Simulate content generation based on style and requirements
    const paragraphs: string[] = [];
    const wordsPerParagraph = Math.max(50, Math.floor(targetLength / Math.max(2, keyPoints.length)));

    for (const point of keyPoints) {
      const paragraph = await this.generateParagraph(point, wordsPerParagraph, style);
      paragraphs.push(paragraph);
    }

    return paragraphs.join('\n\n');
  }

  private async generateParagraph(
    topic: string,
    targetWords: number,
    style: ContentStyle
  ): Promise<string> {
    // Simulate paragraph generation based on style
    const styleTemplates: Record<ContentStyle, string> = {
      professional: `${topic} represents a significant development in the field. Through careful analysis and implementation, organizations can achieve substantial benefits. This approach has been validated through extensive research and practical application across various industries.`,
      casual: `So, ${topic} is pretty interesting stuff! It's one of those things that can really make a difference when you get it right. People have been seeing great results with this approach, and it's definitely worth considering for your next project.`,
      technical: `The implementation of ${topic} requires careful consideration of system architecture and performance parameters. Key technical specifications include optimized algorithms, scalable infrastructure, and robust error handling mechanisms to ensure reliable operation.`,
      creative: `Imagine a world where ${topic} transforms the way we think and work. This innovative approach opens new possibilities, challenging conventional wisdom and inspiring fresh perspectives on familiar challenges.`,
      formal: `${topic} constitutes a fundamental component of contemporary strategic frameworks. The systematic application of these principles demonstrates measurable improvements in operational efficiency and organizational effectiveness.`,
      conversational: `Let's talk about ${topic} for a moment. You know how sometimes you come across something that just makes sense? That's exactly what this is. It's straightforward, practical, and gets results.`
    };

    let content = styleTemplates[style] || styleTemplates.professional;
    
    // Adjust length to meet target
    const currentWords = this.countWords(content);
    if (currentWords < targetWords) {
      const additionalContent = ` Furthermore, this approach provides additional value through enhanced capabilities and improved outcomes. The implementation process is straightforward and can be adapted to various contexts and requirements.`;
      content += additionalContent;
    }

    return content;
  }

  private async generateTitle(topic: string, style: ContentStyle): Promise<string> {
    const styleTemplates: Record<ContentStyle, string> = {
      professional: `Understanding ${topic}: A Comprehensive Guide`,
      casual: `Everything You Need to Know About ${topic}`,
      technical: `${topic}: Technical Implementation and Best Practices`,
      creative: `Exploring the Future of ${topic}`,
      formal: `An Analysis of ${topic} in Contemporary Context`,
      conversational: `Let's Talk About ${topic}`
    };

    return styleTemplates[style] || `A Guide to ${topic}`;
  }

  private async enhanceContent(
    content: CreatedContent,
    requirements: TaskRequirements
  ): Promise<CreatedContent> {
    // Apply enhancements based on requirements
    let enhancedContent = { ...content };

    // SEO optimization if keywords provided
    if (requirements.custom_requirements?.['seo_keywords']) {
      enhancedContent = await this.applySEOOptimization(enhancedContent, requirements);
    }

    // Multi-language support
    if (requirements.languages && requirements.languages.length > 1) {
      enhancedContent = await this.addLanguageVariants(enhancedContent, requirements.languages);
    }

    return enhancedContent;
  }

  private async applySEOOptimization(
    content: CreatedContent,
    requirements: TaskRequirements
  ): Promise<CreatedContent> {
    // Simulate SEO optimization
    const optimizedMetadata = {
      ...content.metadata,
      seo_optimized: true
    };

    return {
      ...content,
      metadata: optimizedMetadata
    };
  }

  private async addLanguageVariants(
    content: CreatedContent,
    languages: string[]
  ): Promise<CreatedContent> {
    // For this example, we'll just mark as multi-language capable
    // In a real implementation, this would generate content in multiple languages
    return {
      ...content,
      metadata: {
        ...content.metadata,
        target_audience: `${content.metadata.target_audience}_multilingual`
      }
    };
  }

  // ============================================================================
  // Quality Assessment Methods
  // ============================================================================

  private async assessContentQuality(
    content: string,
    requirements: TaskRequirements
  ): Promise<QualityIndicator[]> {
    const indicators: QualityIndicator[] = [];

    // Readability assessment
    const readabilityScore = await this.calculateReadabilityScore(content);
    indicators.push({
      metric: 'readability',
      score: readabilityScore,
      description: 'Content readability and clarity'
    });

    // Coherence assessment
    const coherenceScore = await this.calculateCoherenceScore(content);
    indicators.push({
      metric: 'coherence',
      score: coherenceScore,
      description: 'Logical flow and structure'
    });

    // Completeness assessment
    const completenessScore = await this.calculateCompletenessScore(content, requirements);
    indicators.push({
      metric: 'completeness',
      score: completenessScore,
      description: 'Coverage of required topics'
    });

    // Engagement assessment
    const engagementScore = await this.calculateEngagementScore(content);
    indicators.push({
      metric: 'engagement',
      score: engagementScore,
      description: 'Potential for reader engagement'
    });

    return indicators;
  }

  private async calculateReadabilityScore(content: string): Promise<number> {
    // Simplified readability calculation
    const sentences = content.split(/[.!?]+/).length;
    const words = this.countWords(content);
    const avgWordsPerSentence = words / sentences;
    
    // Score based on sentence length (shorter = more readable)
    return Math.max(0, Math.min(1, 1 - (avgWordsPerSentence - 15) / 20));
  }

  private async calculateCoherenceScore(content: string): Promise<number> {
    // Simplified coherence calculation based on structure
    const hasIntroduction = content.toLowerCase().includes('introduction');
    const hasConclusion = content.toLowerCase().includes('conclusion');
    const hasTransitions = /\b(however|therefore|furthermore|moreover|additionally)\b/gi.test(content);
    
    let score = 0.5; // Base score
    if (hasIntroduction) score += 0.2;
    if (hasConclusion) score += 0.2;
    if (hasTransitions) score += 0.1;
    
    return Math.min(1, score);
  }

  private async calculateCompletenessScore(
    content: string,
    requirements: TaskRequirements
  ): Promise<number> {
    let score = 0.7; // Base score
    
    // Check if topic is covered
    if (requirements.topic && content.toLowerCase().includes(requirements.topic.toLowerCase())) {
      score += 0.2;
    }
    
    // Check length requirement
    const wordCount = this.countWords(content);
    const targetLength = requirements.length ?? 1000;
    const lengthRatio = wordCount / targetLength;
    if (lengthRatio >= 0.8 && lengthRatio <= 1.2) {
      score += 0.1;
    }
    
    return Math.min(1, score);
  }

  private async calculateEngagementScore(content: string): Promise<number> {
    // Simplified engagement calculation
    const hasQuestions = /\?/g.test(content);
    const hasExamples = /\b(example|for instance|such as)\b/gi.test(content);
    const hasCallToAction = /\b(try|start|begin|consider|explore)\b/gi.test(content);
    
    let score = 0.5; // Base score
    if (hasQuestions) score += 0.15;
    if (hasExamples) score += 0.2;
    if (hasCallToAction) score += 0.15;
    
    return Math.min(1, score);
  }

  private async calculateComplexityScore(content: string): Promise<number> {
    const words = this.countWords(content);
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Complexity based on sentence length and vocabulary
    return Math.max(0, Math.min(1, avgWordsPerSentence / 25));
  }

  private async analyzeTone(content: string, style: ContentStyle): Promise<string> {
    const toneMap: Record<ContentStyle, string> = {
      professional: 'formal_authoritative',
      casual: 'friendly_approachable',
      technical: 'precise_analytical',
      creative: 'inspiring_imaginative',
      formal: 'serious_academic',
      conversational: 'warm_engaging'
    };

    return toneMap[style] || 'neutral_informative';
  }

  // ============================================================================
  // Communication Handlers
  // ============================================================================

  private async handleDecisionRequest(message: AgentMessage): Promise<unknown> {
    return {
      agent_perspective: 'content_creation',
      recommendation: 'Prioritize clarity and engagement in content',
      confidence: 0.8,
      reasoning: 'Based on content creation best practices and audience engagement data'
    };
  }

  private async handleInformationSharing(message: AgentMessage): Promise<unknown> {
    return {
      status: 'information_processed',
      impact: 'Updated content creation models with new insights',
      timestamp: new Date()
    };
  }

  private async handleCoordinationRequest(message: AgentMessage): Promise<unknown> {
    return {
      status: 'coordination_accepted',
      available_capabilities: this.capabilities,
      current_load: this.getActiveTasks().length,
      estimated_response_time: '10 minutes'
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private async loadWritingTemplates(): Promise<void> {
    // Simulate loading writing templates
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async calibrateCreativityModels(): Promise<void> {
    // Simulate model calibration
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async saveCreationHistory(): Promise<void> {
    console.log(`Saved ${this.creationHistory.length} created contents to history`);
  }

  public getCreationHistory(): readonly CreatedContent[] {
    return [...this.creationHistory];
  }

  public getWritingStyles(): readonly WritingStyle[] {
    return [...this.writingStyles];
  }

  public getContentTypes(): readonly ContentType[] {
    return [...this.contentTypes];
  }

  public getLanguageCapabilities(): readonly LanguageCapability[] {
    return [...this.languageCapabilities];
  }
}
