/**
 * @fileoverview Escalation Agent for handling complex issues requiring human intervention
 * @version 1.1.0-beta
 */

import { MPLPAgent, AgentConfig as MPLPAgentConfig } from '@mplp/agent-builder';
import {
  Ticket,
  TicketClassification,
  EscalationRequest,
  EscalationContext,
  EscalationAgentInput,
  EscalationAgentOutput,
  AgentConfig,
  AgentResult,
  CustomerInteraction
} from '../types';
import { appConfig } from '../config/AppConfig';

export class EscalationAgent extends MPLPAgent {
  private readonly escalationThreshold: number;
  private readonly escalationRules: Map<string, EscalationRule>;
  private readonly agentAssignments: Map<string, AgentAssignment>;

  constructor(config: AgentConfig) {
    // Convert our AgentConfig to MPLP AgentConfig
    const mplpConfig: MPLPAgentConfig = {
      id: config.id,
      name: config.name,
      description: `${config.type} agent`,
      capabilities: ['task_automation', 'communication'],
      metadata: config.metadata
    };
    super(mplpConfig);
    this.escalationThreshold = appConfig.agents.escalationThreshold;
    this.escalationRules = this.initializeEscalationRules();
    this.agentAssignments = this.initializeAgentAssignments();
  }

  public async sendMessage(message: EscalationAgentInput): Promise<void> {
    try {
      const result = await this.evaluateEscalation(message);
      this.emit('escalation_evaluated', {
        ticketId: message.ticket.id,
        shouldEscalate: result.shouldEscalate,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      this.emit('escalation_error', {
        ticketId: message.ticket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      throw error;
    }
  }

  public async execute(action: string, parameters: EscalationAgentInput): Promise<EscalationAgentOutput> {
    switch (action) {
      case 'evaluate_escalation':
        return await this.evaluateEscalation(parameters);
      case 'create_escalation_request':
        return await this.createEscalationRequest(parameters);
      case 'assign_agent':
        return await this.assignAgent(parameters);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async evaluateEscalation(input: EscalationAgentInput): Promise<EscalationAgentOutput> {
    const { ticket, classification, previousAttempts, context = {} } = input;
    
    // Evaluate escalation criteria
    const escalationScore = this.calculateEscalationScore(ticket, classification, previousAttempts);
    const shouldEscalate = escalationScore >= this.escalationThreshold;
    
    // Generate escalation reasoning
    const reason = this.generateEscalationReason(ticket, classification, previousAttempts, escalationScore);
    
    // Calculate confidence in escalation decision
    const confidence = this.calculateEscalationConfidence(escalationScore, classification);
    
    let escalationRequest: EscalationRequest | undefined;
    let suggestedAssignee: string | undefined;
    
    if (shouldEscalate) {
      // Create escalation context
      const escalationContext = await this.buildEscalationContext(ticket, classification, previousAttempts);
      
      // Suggest appropriate agent assignment
      suggestedAssignee = this.suggestAgentAssignment(ticket, classification, escalationContext);
      
      // Create escalation request
      escalationRequest = {
        ticketId: ticket.id,
        reason,
        priority: this.determineEscalationPriority(ticket, classification, escalationScore),
        assignedTo: suggestedAssignee,
        context: escalationContext,
        createdAt: new Date()
      };
    }
    
    return {
      shouldEscalate,
      escalationRequest,
      reason,
      confidence,
      suggestedAssignee
    };
  }

  private async createEscalationRequest(input: EscalationAgentInput): Promise<EscalationAgentOutput> {
    // Force creation of escalation request regardless of score
    const { ticket, classification, previousAttempts } = input;
    
    const escalationContext = await this.buildEscalationContext(ticket, classification, previousAttempts);
    const suggestedAssignee = this.suggestAgentAssignment(ticket, classification, escalationContext);
    
    const escalationRequest: EscalationRequest = {
      ticketId: ticket.id,
      reason: 'Manual escalation requested',
      priority: ticket.priority,
      assignedTo: suggestedAssignee,
      context: escalationContext,
      createdAt: new Date()
    };
    
    return {
      shouldEscalate: true,
      escalationRequest,
      reason: 'Manual escalation requested',
      confidence: 1.0,
      suggestedAssignee
    };
  }

  private async assignAgent(input: EscalationAgentInput): Promise<EscalationAgentOutput> {
    const result = await this.evaluateEscalation(input);

    if (result.shouldEscalate && result.escalationRequest) {
      // Find the best available agent
      const bestAgent = this.findBestAvailableAgent(input.ticket, input.classification);

      if (bestAgent) {
        const updatedEscalationRequest: EscalationRequest = {
          ...result.escalationRequest,
          assignedTo: bestAgent.id
        };

        return {
          ...result,
          escalationRequest: updatedEscalationRequest,
          suggestedAssignee: bestAgent.id
        };
      }
    }

    return result;
  }

  private calculateEscalationScore(
    ticket: Ticket, 
    classification: TicketClassification, 
    previousAttempts: AgentResult[]
  ): number {
    let score = 0;
    
    // Base score from classification confidence
    if (classification.confidence < 0.7) {
      score += 0.3;
    }
    
    // Score based on priority
    const priorityScores: Record<string, number> = {
      'urgent': 0.4,
      'high': 0.3,
      'medium': 0.1,
      'low': 0.0
    };
    score += priorityScores[ticket.priority] || 0;
    
    // Score based on previous failed attempts
    const failedAttempts = previousAttempts.filter(attempt => !attempt.success).length;
    score += Math.min(failedAttempts * 0.2, 0.4);
    
    // Score based on customer tier
    const customerTier = ticket.metadata?.customerTier as string;
    if (customerTier === 'enterprise') {
      score += 0.2;
    } else if (customerTier === 'premium') {
      score += 0.1;
    }
    
    // Score based on urgency indicators
    if (classification.urgencyIndicators.length > 0) {
      score += Math.min(classification.urgencyIndicators.length * 0.1, 0.3);
    }
    
    // Score based on sentiment
    if (classification.sentiment === 'negative') {
      score += 0.2;
    }
    
    // Score based on requires human intervention flag
    if (classification.requiresHumanIntervention) {
      score += 0.3;
    }
    
    return Math.min(score, 1.0);
  }

  private generateEscalationReason(
    ticket: Ticket, 
    classification: TicketClassification, 
    previousAttempts: AgentResult[],
    escalationScore: number
  ): string {
    const reasons: string[] = [];
    
    if (classification.confidence < 0.7) {
      reasons.push('Low classification confidence');
    }
    
    if (ticket.priority === 'urgent' || ticket.priority === 'high') {
      reasons.push(`${ticket.priority} priority ticket`);
    }
    
    const failedAttempts = previousAttempts.filter(attempt => !attempt.success).length;
    if (failedAttempts > 0) {
      reasons.push(`${failedAttempts} previous automation attempts failed`);
    }
    
    if (classification.urgencyIndicators.length > 0) {
      reasons.push(`Urgency indicators detected: ${classification.urgencyIndicators.join(', ')}`);
    }
    
    if (classification.sentiment === 'negative') {
      reasons.push('Negative customer sentiment detected');
    }
    
    if (classification.requiresHumanIntervention) {
      reasons.push('Classification indicates human intervention required');
    }
    
    const customerTier = ticket.metadata?.customerTier as string;
    if (customerTier === 'enterprise' || customerTier === 'premium') {
      reasons.push(`${customerTier} customer tier requires priority handling`);
    }
    
    if (reasons.length === 0) {
      reasons.push(`Escalation score ${escalationScore.toFixed(2)} exceeds threshold`);
    }
    
    return reasons.join('; ');
  }

  private calculateEscalationConfidence(escalationScore: number, classification: TicketClassification): number {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence if score is clearly above or below threshold
    const distanceFromThreshold = Math.abs(escalationScore - this.escalationThreshold);
    confidence += Math.min(distanceFromThreshold * 2, 0.3);
    
    // Higher confidence if classification is confident
    if (classification.confidence > 0.8) {
      confidence += 0.1;
    }
    
    // Lower confidence if classification requires human intervention but score is low
    if (classification.requiresHumanIntervention && escalationScore < this.escalationThreshold) {
      confidence -= 0.2;
    }
    
    return Math.min(1.0, Math.max(0.1, confidence));
  }

  private async buildEscalationContext(
    ticket: Ticket, 
    classification: TicketClassification, 
    previousAttempts: AgentResult[]
  ): Promise<EscalationContext> {
    // Simulate customer history retrieval
    const customerHistory = await this.getCustomerHistory(ticket.customerId);
    
    // Find related tickets
    const relatedTickets = await this.findRelatedTickets(ticket);
    
    return {
      customerTier: ticket.metadata?.customerTier as string || 'standard',
      previousAttempts: previousAttempts.length,
      classification,
      customerHistory,
      relatedTickets
    };
  }

  private suggestAgentAssignment(
    ticket: Ticket, 
    classification: TicketClassification, 
    context: EscalationContext
  ): string {
    // Find the best agent based on category and customer tier
    const categoryAgents = this.agentAssignments.get(classification.category);
    
    if (!categoryAgents) {
      return this.getDefaultAgent(context.customerTier);
    }
    
    // Prefer senior agents for enterprise customers or complex issues
    if (context.customerTier === 'enterprise' || ticket.priority === 'urgent') {
      return categoryAgents.seniorAgent || categoryAgents.primaryAgent;
    }
    
    return categoryAgents.primaryAgent;
  }

  private determineEscalationPriority(
    ticket: Ticket, 
    classification: TicketClassification, 
    escalationScore: number
  ): Ticket['priority'] {
    // Escalation priority can be higher than original ticket priority
    if (escalationScore > 0.9 || ticket.priority === 'urgent') {
      return 'urgent';
    }
    
    if (escalationScore > 0.8 || ticket.priority === 'high') {
      return 'high';
    }
    
    if (escalationScore > 0.6) {
      return 'medium';
    }
    
    return ticket.priority;
  }

  private findBestAvailableAgent(ticket: Ticket, classification: TicketClassification): AgentInfo | null {
    const categoryAgents = this.agentAssignments.get(classification.category);
    
    if (!categoryAgents) {
      return null;
    }
    
    // Simulate agent availability check
    const availableAgents = this.getAvailableAgents(categoryAgents);
    
    if (availableAgents.length === 0) {
      return null;
    }
    
    // Return the agent with the best match for this ticket type
    const bestMatch = availableAgents.find(agent =>
      agent.specializations.includes(classification.category)
    );
    if (bestMatch) {
      return bestMatch;
    }
    return availableAgents.length > 0 ? (availableAgents[0] || null) : null;
  }

  private async getCustomerHistory(customerId: string): Promise<CustomerInteraction[]> {
    // Simulate customer history retrieval
    return [
      {
        id: 'interaction_001',
        ticketId: 'TICKET_PREV_001',
        type: 'email',
        content: 'Previous billing inquiry resolved successfully',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        resolution: 'Billing issue resolved',
        satisfaction: 4
      }
    ];
  }

  private async findRelatedTickets(ticket: Ticket): Promise<string[]> {
    // Simulate related ticket search based on customer and content similarity
    return ['TICKET_REL_001', 'TICKET_REL_002'];
  }

  private getDefaultAgent(customerTier: string): string {
    const defaultAgents: Record<string, string> = {
      'enterprise': 'senior_agent_001',
      'premium': 'experienced_agent_001',
      'standard': 'standard_agent_001',
      'basic': 'junior_agent_001'
    };
    
    return defaultAgents[customerTier] || 'standard_agent_001';
  }

  private getAvailableAgents(categoryAgents: AgentAssignment): AgentInfo[] {
    // Simulate agent availability check
    return [
      {
        id: categoryAgents.primaryAgent,
        name: 'Primary Agent',
        specializations: ['general'],
        currentLoad: 0.6,
        available: true
      },
      {
        id: categoryAgents.seniorAgent || 'senior_agent_001',
        name: 'Senior Agent',
        specializations: ['complex_issues', 'enterprise'],
        currentLoad: 0.8,
        available: true
      }
    ].filter(agent => agent.available && agent.currentLoad < 0.9);
  }

  private initializeEscalationRules(): Map<string, EscalationRule> {
    const rules = new Map<string, EscalationRule>();
    
    rules.set('confidence_threshold', new ConfidenceThresholdRule(0.7));
    rules.set('priority_escalation', new PriorityEscalationRule(['urgent', 'high']));
    rules.set('failed_attempts', new FailedAttemptsRule(2));
    rules.set('customer_tier', new CustomerTierRule(['enterprise', 'premium']));
    
    return rules;
  }

  private initializeAgentAssignments(): Map<string, AgentAssignment> {
    const assignments = new Map<string, AgentAssignment>();
    
    assignments.set('billing_inquiry', {
      primaryAgent: 'billing_agent_001',
      seniorAgent: 'senior_billing_agent_001',
      backupAgent: 'billing_agent_002'
    });
    
    assignments.set('technical_support', {
      primaryAgent: 'tech_agent_001',
      seniorAgent: 'senior_tech_agent_001',
      backupAgent: 'tech_agent_002'
    });
    
    assignments.set('product_inquiry', {
      primaryAgent: 'product_agent_001',
      seniorAgent: 'senior_product_agent_001',
      backupAgent: 'product_agent_002'
    });
    
    assignments.set('general_inquiry', {
      primaryAgent: 'general_agent_001',
      seniorAgent: 'senior_general_agent_001',
      backupAgent: 'general_agent_002'
    });
    
    return assignments;
  }
}

// Supporting interfaces and classes
interface AgentAssignment {
  readonly primaryAgent: string;
  readonly seniorAgent?: string;
  readonly backupAgent?: string;
}

interface AgentInfo {
  readonly id: string;
  readonly name: string;
  readonly specializations: string[];
  readonly currentLoad: number;
  readonly available: boolean;
}

abstract class EscalationRule {
  abstract evaluate(
    ticket: Ticket, 
    classification: TicketClassification, 
    previousAttempts: AgentResult[]
  ): number;
}

class ConfidenceThresholdRule extends EscalationRule {
  constructor(private threshold: number) {
    super();
  }
  
  evaluate(_ticket: Ticket, classification: TicketClassification): number {
    return classification.confidence < this.threshold ? 0.3 : 0;
  }
}

class PriorityEscalationRule extends EscalationRule {
  constructor(private escalationPriorities: string[]) {
    super();
  }
  
  evaluate(ticket: Ticket): number {
    return this.escalationPriorities.includes(ticket.priority) ? 0.4 : 0;
  }
}

class FailedAttemptsRule extends EscalationRule {
  constructor(private maxAttempts: number) {
    super();
  }
  
  evaluate(_ticket: Ticket, _classification: TicketClassification, previousAttempts: AgentResult[]): number {
    const failedAttempts = previousAttempts.filter(attempt => !attempt.success).length;
    return failedAttempts >= this.maxAttempts ? 0.5 : 0;
  }
}

class CustomerTierRule extends EscalationRule {
  constructor(private priorityTiers: string[]) {
    super();
  }
  
  evaluate(ticket: Ticket): number {
    const customerTier = ticket.metadata?.customerTier as string;
    return this.priorityTiers.includes(customerTier) ? 0.2 : 0;
  }
}
