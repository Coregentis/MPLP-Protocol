/**
 * @fileoverview Response Agent for generating automated customer responses
 * @version 1.1.0-beta
 */

import { MPLPAgent, AgentConfig as MPLPAgentConfig } from '@mplp/agent-builder';
import {
  Ticket,
  TicketClassification,
  TicketResponse,
  ResponseAgentInput,
  ResponseAgentOutput,
  AgentConfig,
  ResponseAttachment
} from '../types';
import { appConfig } from '../config/AppConfig';

export class ResponseAgent extends MPLPAgent {
  private readonly responseTimeout: number;
  private readonly responseTemplates: Map<string, ResponseTemplate>;
  private readonly knowledgeBaseCache: Map<string, KnowledgeBaseEntry[]>;

  constructor(config: AgentConfig) {
    // Convert our AgentConfig to MPLP AgentConfig
    const mplpConfig: MPLPAgentConfig = {
      id: config.id,
      name: config.name,
      description: `${config.type} agent`,
      capabilities: ['content_generation', 'communication'],
      metadata: config.metadata
    };
    super(mplpConfig);
    this.responseTimeout = appConfig.agents.responseGenerationTimeout;
    this.responseTemplates = this.initializeResponseTemplates();
    this.knowledgeBaseCache = new Map();
  }

  public async sendMessage(message: ResponseAgentInput): Promise<void> {
    try {
      const result = await this.generateResponse(message);
      this.emit('response_generated', {
        ticketId: message.ticket.id,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      this.emit('response_error', {
        ticketId: message.ticket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  public async execute(action: string, parameters: ResponseAgentInput): Promise<ResponseAgentOutput> {
    switch (action) {
      case 'generate_response':
        return await this.generateResponse(parameters);
      case 'generate_alternative_responses':
        return await this.generateAlternativeResponses(parameters);
      case 'validate_response':
        return await this.validateResponse(parameters);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async generateResponse(input: ResponseAgentInput): Promise<ResponseAgentOutput> {
    const { ticket, classification, customerHistory = [], knowledgeBase = [], context = {} } = input;
    
    // Get response template based on classification
    const template = this.getResponseTemplate(classification);
    
    // Gather relevant knowledge base entries
    const relevantKnowledge = await this.gatherRelevantKnowledge(classification, knowledgeBase);
    
    // Generate personalized response
    const response = await this.generatePersonalizedResponse(
      ticket,
      classification,
      template,
      relevantKnowledge,
      customerHistory,
      context
    );
    
    // Calculate confidence based on template match and knowledge availability
    const confidence = this.calculateResponseConfidence(classification, relevantKnowledge, template);
    
    // Generate alternative responses if confidence is low
    let alternativeResponses: TicketResponse[] | undefined;
    if (confidence < 0.8) {
      const altResult = await this.generateAlternativeResponses({ ticket, classification, customerHistory, knowledgeBase, context });
      alternativeResponses = altResult.alternativeResponses;
    }

    return {
      response,
      confidence,
      alternativeResponses,
      usedKnowledgeBase: relevantKnowledge.length > 0
    };
  }

  private async generateAlternativeResponses(input: ResponseAgentInput): Promise<ResponseAgentOutput> {
    const primaryResult = await this.generateResponse(input);
    
    // Generate 2-3 alternative responses with different tones/approaches
    const alternatives: TicketResponse[] = [];
    const templates = Array.from(this.responseTemplates.values())
      .filter(t => t.category === input.classification.category)
      .slice(0, 3);
    
    for (const template of templates) {
      if (template.id !== primaryResult.response.responseType) {
        const altResponse = await this.generatePersonalizedResponse(
          input.ticket,
          input.classification,
          template,
          [],
          input.customerHistory || [],
          input.context || {}
        );
        alternatives.push(altResponse);
      }
    }
    
    return {
      ...primaryResult,
      alternativeResponses: alternatives
    };
  }

  private async validateResponse(input: ResponseAgentInput): Promise<ResponseAgentOutput> {
    const result = await this.generateResponse(input);

    // Additional validation checks
    const validationIssues = this.validateResponseContent(result.response);

    if (validationIssues.length > 0) {
      // Regenerate response with corrections
      const correctedResponse = await this.correctResponse(result.response, validationIssues);
      const correctedConfidence = Math.max(0.5, result.confidence - 0.2); // Reduce confidence due to corrections

      return {
        ...result,
        response: correctedResponse,
        confidence: correctedConfidence
      };
    }

    return result;
  }

  private getResponseTemplate(classification: TicketClassification): ResponseTemplate {
    const categoryTemplate = this.responseTemplates.get(classification.category);
    if (categoryTemplate) {
      return categoryTemplate;
    }
    
    // Fallback to general template
    return this.responseTemplates.get('general_inquiry') || this.getDefaultTemplate();
  }

  private async gatherRelevantKnowledge(
    classification: TicketClassification, 
    knowledgeBase: unknown[]
  ): Promise<KnowledgeBaseEntry[]> {
    const cacheKey = `${classification.category}_${classification.subcategory || 'default'}`;
    
    // Check cache first
    if (this.knowledgeBaseCache.has(cacheKey)) {
      return this.knowledgeBaseCache.get(cacheKey) || [];
    }
    
    // Simulate knowledge base search
    const relevantEntries = this.searchKnowledgeBase(classification, knowledgeBase);
    
    // Cache the results
    this.knowledgeBaseCache.set(cacheKey, relevantEntries);
    
    return relevantEntries;
  }

  private async generatePersonalizedResponse(
    ticket: Ticket,
    classification: TicketClassification,
    template: ResponseTemplate,
    knowledgeBase: KnowledgeBaseEntry[],
    customerHistory: unknown[],
    context: Record<string, unknown>
  ): Promise<TicketResponse> {
    // Build response context
    const responseContext = {
      customerName: context.customerName || 'Valued Customer',
      ticketId: ticket.id,
      category: classification.category,
      priority: classification.priority,
      hasHistory: customerHistory.length > 0,
      knowledgeAvailable: knowledgeBase.length > 0
    };
    
    // Generate message using template
    let message = this.applyTemplate(template, responseContext);
    
    // Add knowledge base information if available
    if (knowledgeBase.length > 0) {
      message += this.appendKnowledgeBaseInfo(knowledgeBase);
    }
    
    // Add personalization based on customer history
    if (customerHistory.length > 0) {
      message = this.personalizeMessage(message, customerHistory);
    }
    
    // Generate attachments if needed
    const attachments = this.generateAttachments(classification, knowledgeBase);
    
    return {
      ticketId: ticket.id,
      message,
      responseType: template.type,
      confidence: this.calculateResponseConfidence(classification, knowledgeBase, template),
      suggestedFollowUp: template.followUpActions,
      attachments,
      metadata: {
        templateId: template.id,
        knowledgeBaseUsed: knowledgeBase.length > 0,
        personalized: customerHistory.length > 0,
        generatedAt: new Date().toISOString()
      }
    };
  }

  private applyTemplate(template: ResponseTemplate, context: Record<string, unknown>): string {
    let message = template.content;
    
    // Replace placeholders with actual values
    for (const [key, value] of Object.entries(context)) {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return message;
  }

  private appendKnowledgeBaseInfo(knowledgeBase: KnowledgeBaseEntry[]): string {
    if (knowledgeBase.length === 0) return '';
    
    let info = '\n\nHere are some helpful resources:\n';
    
    for (const entry of knowledgeBase.slice(0, 3)) { // Limit to top 3 entries
      info += `• ${entry.title}: ${entry.summary}\n`;
      if (entry.url) {
        info += `  Learn more: ${entry.url}\n`;
      }
    }
    
    return info;
  }

  private personalizeMessage(message: string, customerHistory: unknown[]): string {
    // Add personalization based on customer history
    if (customerHistory.length > 2) {
      return `Thank you for being a loyal customer. ${message}`;
    } else if (customerHistory.length === 1) {
      return `Welcome back! ${message}`;
    }
    
    return message;
  }

  private generateAttachments(
    classification: TicketClassification, 
    knowledgeBase: KnowledgeBaseEntry[]
  ): ResponseAttachment[] {
    const attachments: ResponseAttachment[] = [];
    
    // Add relevant documentation links
    for (const entry of knowledgeBase.slice(0, 2)) {
      if (entry.url) {
        attachments.push({
          type: 'link',
          url: entry.url,
          title: entry.title,
          description: entry.summary
        });
      }
    }
    
    // Add category-specific attachments
    if (classification.category === 'technical_support') {
      attachments.push({
        type: 'link',
        url: 'https://support.example.com/troubleshooting',
        title: 'Troubleshooting Guide',
        description: 'Step-by-step troubleshooting instructions'
      });
    }
    
    return attachments;
  }

  private calculateResponseConfidence(
    classification: TicketClassification,
    knowledgeBase: KnowledgeBaseEntry[],
    template: ResponseTemplate
  ): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence if classification is confident
    if (classification.confidence > 0.8) {
      confidence += 0.1;
    }
    
    // Increase confidence if knowledge base entries are available
    if (knowledgeBase.length > 0) {
      confidence += 0.1;
    }
    
    // Increase confidence if template is specific to category
    if (template.category === classification.category) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, confidence);
  }

  private searchKnowledgeBase(
    classification: TicketClassification, 
    knowledgeBase: unknown[]
  ): KnowledgeBaseEntry[] {
    // Simulate knowledge base search based on classification
    const mockEntries: KnowledgeBaseEntry[] = [];
    
    switch (classification.category) {
      case 'billing_inquiry':
        mockEntries.push({
          id: 'kb_billing_001',
          title: 'Understanding Your Bill',
          summary: 'Detailed explanation of billing components and charges',
          content: 'Your bill includes...',
          url: 'https://support.example.com/billing-guide',
          category: 'billing',
          relevanceScore: 0.9
        });
        break;
        
      case 'technical_support':
        mockEntries.push({
          id: 'kb_tech_001',
          title: 'Common Technical Issues',
          summary: 'Solutions for frequently encountered technical problems',
          content: 'If you are experiencing...',
          url: 'https://support.example.com/tech-issues',
          category: 'technical',
          relevanceScore: 0.85
        });
        break;
        
      case 'product_inquiry':
        mockEntries.push({
          id: 'kb_product_001',
          title: 'Product Features Overview',
          summary: 'Comprehensive guide to all product features',
          content: 'Our product offers...',
          url: 'https://support.example.com/features',
          category: 'product',
          relevanceScore: 0.8
        });
        break;
    }
    
    return mockEntries.filter(entry => entry.relevanceScore > 0.7);
  }

  private validateResponseContent(response: TicketResponse): string[] {
    const issues: string[] = [];
    
    // Check message length
    if (response.message.length < 50) {
      issues.push('Response too short');
    }
    
    if (response.message.length > 2000) {
      issues.push('Response too long');
    }
    
    // Check for placeholder text
    if (response.message.includes('{{') || response.message.includes('}}')) {
      issues.push('Unresolved placeholders in response');
    }
    
    // Check for appropriate tone
    if (response.message.toLowerCase().includes('sorry') && response.confidence > 0.9) {
      issues.push('Unnecessary apology in confident response');
    }
    
    return issues;
  }

  private async correctResponse(response: TicketResponse, issues: string[]): Promise<TicketResponse> {
    let correctedMessage = response.message;
    
    for (const issue of issues) {
      switch (issue) {
        case 'Response too short':
          correctedMessage += ' Please let us know if you need any additional assistance.';
          break;
        case 'Unresolved placeholders in response':
          correctedMessage = correctedMessage.replace(/\{\{[^}]+\}\}/g, '[Information]');
          break;
        case 'Unnecessary apology in confident response':
          correctedMessage = correctedMessage.replace(/sorry/gi, 'happy to help');
          break;
      }
    }
    
    return {
      ...response,
      message: correctedMessage,
      metadata: {
        ...response.metadata,
        corrected: true,
        originalIssues: issues
      }
    };
  }

  private initializeResponseTemplates(): Map<string, ResponseTemplate> {
    const templates = new Map<string, ResponseTemplate>();
    
    templates.set('billing_inquiry', {
      id: 'billing_template_001',
      category: 'billing_inquiry',
      type: 'template',
      content: 'Hello {{customerName}}, thank you for contacting us about your billing inquiry. I\'d be happy to help you with your account. Let me look into this for you.',
      followUpActions: ['Check billing history', 'Verify payment status', 'Provide detailed explanation'],
      tone: 'professional',
      estimatedLength: 150
    });
    
    templates.set('technical_support', {
      id: 'tech_template_001',
      category: 'technical_support',
      type: 'template',
      content: 'Hi {{customerName}}, I understand you\'re experiencing a technical issue. Let me help you resolve this quickly. Based on your description, here are some steps we can try.',
      followUpActions: ['Gather system information', 'Provide troubleshooting steps', 'Escalate if needed'],
      tone: 'helpful',
      estimatedLength: 200
    });
    
    templates.set('product_inquiry', {
      id: 'product_template_001',
      category: 'product_inquiry',
      type: 'template',
      content: 'Hello {{customerName}}, thank you for your interest in our products. I\'m excited to help you learn more about what we offer.',
      followUpActions: ['Provide product information', 'Share relevant resources', 'Offer demo or trial'],
      tone: 'enthusiastic',
      estimatedLength: 120
    });
    
    templates.set('general_inquiry', {
      id: 'general_template_001',
      category: 'general_inquiry',
      type: 'template',
      content: 'Hello {{customerName}}, thank you for reaching out to us. I\'m here to help with your inquiry.',
      followUpActions: ['Gather more information', 'Route to appropriate team', 'Provide general assistance'],
      tone: 'friendly',
      estimatedLength: 100
    });
    
    return templates;
  }

  private getDefaultTemplate(): ResponseTemplate {
    return {
      id: 'default_template',
      category: 'general',
      type: 'automated',
      content: 'Thank you for contacting us. We have received your message and will respond shortly.',
      followUpActions: ['Route to appropriate agent'],
      tone: 'neutral',
      estimatedLength: 80
    };
  }
}

// Supporting interfaces
interface ResponseTemplate {
  readonly id: string;
  readonly category: string;
  readonly type: 'automated' | 'template' | 'escalated';
  readonly content: string;
  readonly followUpActions: string[];
  readonly tone: string;
  readonly estimatedLength: number;
}

interface KnowledgeBaseEntry {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly url?: string;
  readonly category: string;
  readonly relevanceScore: number;
}
