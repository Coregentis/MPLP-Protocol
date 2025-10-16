/**
 * @fileoverview Classification Agent for ticket categorization and priority assignment
 * @version 1.1.0-beta
 */

import { MPLPAgent, AgentConfig as MPLPAgentConfig } from '@mplp/agent-builder';
import {
  Ticket,
  TicketClassification,
  ClassificationAgentInput,
  ClassificationAgentOutput,
  AgentConfig
} from '../types';
import { appConfig } from '../config/AppConfig';

export class ClassificationAgent extends MPLPAgent {
  private readonly confidenceThreshold: number;
  private readonly categoryRules: Map<string, CategoryRule>;
  private readonly priorityRules: Map<string, PriorityRule>;

  constructor(config: AgentConfig) {
    // Convert our AgentConfig to MPLP AgentConfig
    const mplpConfig: MPLPAgentConfig = {
      id: config.id,
      name: config.name,
      description: `${config.type} agent`,
      capabilities: ['task_automation', 'data_analysis'], // Map to MPLP capabilities
      metadata: config.metadata
    };
    super(mplpConfig);
    this.confidenceThreshold = appConfig.agents.classificationConfidenceThreshold;
    this.categoryRules = this.initializeCategoryRules();
    this.priorityRules = this.initializePriorityRules();
  }

  public async sendMessage(message: ClassificationAgentInput): Promise<void> {
    try {
      const result = await this.classifyTicket(message);
      this.emit('classification_complete', {
        ticketId: message.ticket.id,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      this.emit('classification_error', {
        ticketId: message.ticket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  public async execute(action: string, parameters: ClassificationAgentInput): Promise<ClassificationAgentOutput> {
    switch (action) {
      case 'classify':
        return await this.classifyTicket(parameters);
      case 'validate_classification':
        return await this.validateClassification(parameters);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async classifyTicket(input: ClassificationAgentInput): Promise<ClassificationAgentOutput> {
    const { ticket, customerHistory = [], context = {} } = input;
    
    // Extract features from ticket content
    const features = this.extractFeatures(ticket);
    
    // Classify category
    const categoryResult = this.classifyCategory(features, ticket);
    
    // Determine priority
    const priorityResult = this.determinePriority(features, ticket, customerHistory);
    
    // Calculate overall confidence
    const confidence = Math.min(categoryResult.confidence, priorityResult.confidence);
    
    // Generate suggested actions
    const suggestedActions = this.generateSuggestedActions(categoryResult.category, priorityResult.priority);
    
    // Detect urgency indicators
    const urgencyIndicators = this.detectUrgencyIndicators(ticket.content);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(ticket.content);
    
    const classification: TicketClassification = {
      category: categoryResult.category,
      subcategory: categoryResult.subcategory || undefined,
      priority: priorityResult.priority,
      confidence,
      suggestedActions,
      estimatedResolutionTime: this.estimateResolutionTime(categoryResult.category, priorityResult.priority),
      requiresHumanIntervention: confidence < this.confidenceThreshold || priorityResult.priority === 'urgent',
      sentiment,
      urgencyIndicators
    };

    const reasoning = this.generateReasoning(features, categoryResult, priorityResult, classification);
    const suggestedNextSteps = this.generateNextSteps(classification);

    return {
      classification,
      confidence,
      reasoning,
      suggestedNextSteps
    };
  }

  private async validateClassification(input: ClassificationAgentInput): Promise<ClassificationAgentOutput> {
    const result = await this.classifyTicket(input);

    // Additional validation logic
    if (result.confidence < this.confidenceThreshold) {
      // Create a new classification object with updated requiresHumanIntervention
      const updatedClassification: TicketClassification = {
        ...result.classification,
        requiresHumanIntervention: true
      };

      return {
        ...result,
        classification: updatedClassification,
        suggestedNextSteps: ['Request human review due to low confidence', ...result.suggestedNextSteps]
      };
    }

    return result;
  }

  private extractFeatures(ticket: Ticket): TicketFeatures {
    const content = ticket.content.toLowerCase();
    const subject = ticket.subject?.toLowerCase() || '';
    
    return {
      keywords: this.extractKeywords(content + ' ' + subject),
      length: content.length,
      hasUrgentWords: this.hasUrgentWords(content),
      hasQuestionWords: this.hasQuestionWords(content),
      hasComplaintWords: this.hasComplaintWords(content),
      hasRequestWords: this.hasRequestWords(content),
      mentionsProduct: this.mentionsProduct(content),
      mentionsBilling: this.mentionsBilling(content),
      mentionsTechnical: this.mentionsTechnical(content),
      customerTier: ticket.metadata?.customerTier as string || 'standard'
    };
  }

  private classifyCategory(features: TicketFeatures, ticket: Ticket): CategoryResult {
    let bestMatch: CategoryResult = {
      category: 'general_inquiry',
      subcategory: 'other',
      confidence: 0.5
    };

    for (const [category, rule] of this.categoryRules) {
      const score = rule.evaluate(features, ticket);
      if (score > bestMatch.confidence) {
        bestMatch = {
          category,
          subcategory: rule.getSubcategory(features),
          confidence: score
        };
      }
    }

    return bestMatch;
  }

  private determinePriority(features: TicketFeatures, ticket: Ticket, customerHistory: unknown[]): PriorityResult {
    let priority: Ticket['priority'] = 'medium';
    let confidence = 0.8;

    // Check for urgent indicators
    if (features.hasUrgentWords || features.customerTier === 'enterprise') {
      priority = 'urgent';
      confidence = 0.9;
    } else if (features.hasComplaintWords && customerHistory.length > 3) {
      priority = 'high';
      confidence = 0.85;
    } else if (features.hasQuestionWords && !features.hasComplaintWords) {
      priority = 'low';
      confidence = 0.8;
    }

    return { priority, confidence };
  }

  private generateSuggestedActions(category: string, priority: Ticket['priority']): string[] {
    const actions: string[] = [];
    
    switch (category) {
      case 'billing_inquiry':
        actions.push('check_billing_history', 'verify_payment_status');
        break;
      case 'technical_support':
        actions.push('check_system_status', 'gather_technical_details');
        break;
      case 'product_inquiry':
        actions.push('provide_product_information', 'check_availability');
        break;
      default:
        actions.push('gather_more_information');
    }

    if (priority === 'urgent' || priority === 'high') {
      actions.unshift('escalate_to_senior_agent');
    }

    return actions;
  }

  private detectUrgencyIndicators(content: string): string[] {
    const indicators: string[] = [];
    const urgentPatterns = [
      /urgent/i,
      /emergency/i,
      /asap/i,
      /immediately/i,
      /critical/i,
      /down/i,
      /not working/i,
      /broken/i
    ];

    for (const pattern of urgentPatterns) {
      if (pattern.test(content)) {
        indicators.push(pattern.source);
      }
    }

    return indicators;
  }

  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['thank', 'great', 'excellent', 'good', 'happy', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private estimateResolutionTime(category: string, priority: Ticket['priority']): number {
    const baseTime = this.getCategoryBaseTime(category);
    const priorityMultiplier = this.getPriorityMultiplier(priority);
    return Math.round(baseTime * priorityMultiplier);
  }

  private getCategoryBaseTime(category: string): number {
    const baseTimes: Record<string, number> = {
      'billing_inquiry': 15,
      'technical_support': 30,
      'product_inquiry': 10,
      'general_inquiry': 20
    };
    return baseTimes[category] || 20;
  }

  private getPriorityMultiplier(priority: Ticket['priority']): number {
    const multipliers: Record<string, number> = {
      'low': 1.5,
      'medium': 1.0,
      'high': 0.7,
      'urgent': 0.3
    };
    return multipliers[priority] || 1.0;
  }

  private generateReasoning(
    features: TicketFeatures, 
    categoryResult: CategoryResult, 
    priorityResult: PriorityResult,
    classification: TicketClassification
  ): string {
    const reasons: string[] = [];
    
    reasons.push(`Classified as ${categoryResult.category} based on keyword analysis`);
    reasons.push(`Priority set to ${priorityResult.priority} due to content analysis`);
    
    if (features.hasUrgentWords) {
      reasons.push('Urgent keywords detected in content');
    }
    
    if (features.customerTier === 'enterprise') {
      reasons.push('Enterprise customer tier requires higher priority');
    }
    
    if (classification.confidence < this.confidenceThreshold) {
      reasons.push('Low confidence score requires human review');
    }
    
    return reasons.join('. ');
  }

  private generateNextSteps(classification: TicketClassification): string[] {
    const steps: string[] = [];
    
    if (classification.requiresHumanIntervention) {
      steps.push('Route to human agent for review');
    } else {
      steps.push('Generate automated response');
    }
    
    steps.push('Update ticket status');
    steps.push('Log classification results');
    
    return steps;
  }

  // Helper methods for feature extraction
  private extractKeywords(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 3);
  }

  private hasUrgentWords(content: string): boolean {
    const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical'];
    return urgentWords.some(word => content.includes(word));
  }

  private hasQuestionWords(content: string): boolean {
    const questionWords = ['how', 'what', 'when', 'where', 'why', 'which', '?'];
    return questionWords.some(word => content.includes(word));
  }

  private hasComplaintWords(content: string): boolean {
    const complaintWords = ['complaint', 'problem', 'issue', 'wrong', 'error', 'bug'];
    return complaintWords.some(word => content.includes(word));
  }

  private hasRequestWords(content: string): boolean {
    const requestWords = ['please', 'request', 'need', 'want', 'require'];
    return requestWords.some(word => content.includes(word));
  }

  private mentionsProduct(content: string): boolean {
    const productWords = ['product', 'feature', 'service', 'plan', 'subscription'];
    return productWords.some(word => content.includes(word));
  }

  private mentionsBilling(content: string): boolean {
    const billingWords = ['bill', 'payment', 'charge', 'invoice', 'refund', 'money'];
    return billingWords.some(word => content.includes(word));
  }

  private mentionsTechnical(content: string): boolean {
    const technicalWords = ['error', 'bug', 'crash', 'slow', 'login', 'password'];
    return technicalWords.some(word => content.includes(word));
  }

  private initializeCategoryRules(): Map<string, CategoryRule> {
    const rules = new Map<string, CategoryRule>();
    
    rules.set('billing_inquiry', new BillingCategoryRule());
    rules.set('technical_support', new TechnicalCategoryRule());
    rules.set('product_inquiry', new ProductCategoryRule());
    rules.set('general_inquiry', new GeneralCategoryRule());
    
    return rules;
  }

  private initializePriorityRules(): Map<string, PriorityRule> {
    const rules = new Map<string, PriorityRule>();
    
    rules.set('urgent', new UrgentPriorityRule());
    rules.set('high', new HighPriorityRule());
    rules.set('medium', new MediumPriorityRule());
    rules.set('low', new LowPriorityRule());
    
    return rules;
  }
}

// Supporting interfaces and classes
interface TicketFeatures {
  keywords: string[];
  length: number;
  hasUrgentWords: boolean;
  hasQuestionWords: boolean;
  hasComplaintWords: boolean;
  hasRequestWords: boolean;
  mentionsProduct: boolean;
  mentionsBilling: boolean;
  mentionsTechnical: boolean;
  customerTier: string;
}

interface CategoryResult {
  category: string;
  subcategory?: string;
  confidence: number;
}

interface PriorityResult {
  priority: Ticket['priority'];
  confidence: number;
}

abstract class CategoryRule {
  abstract evaluate(features: TicketFeatures, ticket: Ticket): number;
  abstract getSubcategory(features: TicketFeatures): string;
}

abstract class PriorityRule {
  abstract evaluate(features: TicketFeatures, ticket: Ticket): number;
}

class BillingCategoryRule extends CategoryRule {
  evaluate(features: TicketFeatures): number {
    return features.mentionsBilling ? 0.9 : 0.1;
  }
  
  getSubcategory(features: TicketFeatures): string {
    if (features.keywords.some(k => k.includes('refund'))) return 'refund_request';
    if (features.keywords.some(k => k.includes('payment'))) return 'payment_issue';
    return 'general_billing';
  }
}

class TechnicalCategoryRule extends CategoryRule {
  evaluate(features: TicketFeatures): number {
    return features.mentionsTechnical ? 0.9 : 0.1;
  }
  
  getSubcategory(features: TicketFeatures): string {
    if (features.keywords.some(k => k.includes('login'))) return 'authentication';
    if (features.keywords.some(k => k.includes('error'))) return 'system_error';
    return 'general_technical';
  }
}

class ProductCategoryRule extends CategoryRule {
  evaluate(features: TicketFeatures): number {
    return features.mentionsProduct ? 0.8 : 0.2;
  }
  
  getSubcategory(): string {
    return 'product_information';
  }
}

class GeneralCategoryRule extends CategoryRule {
  evaluate(): number {
    return 0.5; // Default fallback
  }
  
  getSubcategory(): string {
    return 'other';
  }
}

class UrgentPriorityRule extends PriorityRule {
  evaluate(features: TicketFeatures): number {
    return features.hasUrgentWords || features.customerTier === 'enterprise' ? 0.9 : 0.1;
  }
}

class HighPriorityRule extends PriorityRule {
  evaluate(features: TicketFeatures): number {
    return features.hasComplaintWords && features.customerTier === 'premium' ? 0.8 : 0.3;
  }
}

class MediumPriorityRule extends PriorityRule {
  evaluate(): number {
    return 0.6; // Default priority
  }
}

class LowPriorityRule extends PriorityRule {
  evaluate(features: TicketFeatures): number {
    return features.hasQuestionWords && !features.hasComplaintWords ? 0.8 : 0.2;
  }
}
