/**
 * @fileoverview Ticket type definitions for workflow automation
 * @version 1.1.0-beta
 */

export interface Customer {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly tier: 'basic' | 'standard' | 'premium' | 'enterprise';
  readonly createdAt: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface Ticket {
  readonly id: string;
  readonly customerId: string;
  readonly content: string;
  readonly subject?: string | undefined;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  readonly category?: string | undefined;
  readonly tags?: string[] | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly resolvedAt?: Date | undefined;
  readonly metadata?: Record<string, unknown> | undefined;
}

export interface TicketClassification {
  readonly category: string;
  readonly subcategory?: string | undefined;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly confidence: number;
  readonly suggestedActions: string[];
  readonly estimatedResolutionTime?: number | undefined;
  readonly requiresHumanIntervention: boolean;
  readonly sentiment?: 'positive' | 'neutral' | 'negative' | undefined;
  readonly urgencyIndicators: string[];
}

export interface TicketResponse {
  readonly ticketId: string;
  readonly message: string;
  readonly responseType: 'automated' | 'template' | 'escalated';
  readonly confidence: number;
  readonly suggestedFollowUp?: string[];
  readonly attachments?: ResponseAttachment[];
  readonly metadata?: Record<string, unknown>;
}

export interface ResponseAttachment {
  readonly type: 'link' | 'document' | 'image';
  readonly url: string;
  readonly title: string;
  readonly description?: string;
}

export interface EscalationRequest {
  readonly ticketId: string;
  readonly reason: string;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly assignedTo?: string;
  readonly context: EscalationContext;
  readonly createdAt: Date;
}

export interface EscalationContext {
  readonly customerTier: string;
  readonly previousAttempts: number;
  readonly classification: TicketClassification;
  readonly customerHistory: CustomerInteraction[];
  readonly relatedTickets: string[];
}

export interface CustomerInteraction {
  readonly id: string;
  readonly ticketId: string;
  readonly type: 'email' | 'chat' | 'phone' | 'social';
  readonly content: string;
  readonly timestamp: Date;
  readonly resolution?: string;
  readonly satisfaction?: number;
}

export interface WorkflowMetrics {
  readonly totalTickets: number;
  readonly resolvedTickets: number;
  readonly escalatedTickets: number;
  readonly averageResolutionTime: number;
  readonly customerSatisfaction: number;
  readonly automationRate: number;
  readonly agentUtilization: Record<string, number>;
}

export interface TicketUpdate {
  readonly ticketId: string;
  readonly status?: Ticket['status'] | undefined;
  readonly priority?: Ticket['priority'] | undefined;
  readonly assignedTo?: string | undefined;
  readonly notes?: string | undefined;
  readonly updatedBy: string;
  readonly timestamp: Date;
}
