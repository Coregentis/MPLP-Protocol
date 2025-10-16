/**
 * @fileoverview Main application entry point for workflow automation example
 * @version 1.1.0-beta
 */

import { CustomerSupportWorkflow } from './workflows/CustomerSupportWorkflow';
import { TicketService } from './services/TicketService';
import { Ticket, Customer, WorkflowInput } from './types';
import { appConfig, validateConfig } from './config/AppConfig';

export class WorkflowAutomationApp {
  private readonly workflow: CustomerSupportWorkflow;
  private readonly ticketService: TicketService;

  constructor() {
    // Validate configuration
    validateConfig(appConfig);
    
    // Initialize services
    this.ticketService = new TicketService();
    this.workflow = new CustomerSupportWorkflow();
    
    console.log('🚀 Workflow Automation App initialized successfully');
  }

  /**
   * Process a new customer support ticket through the automated workflow
   */
  public async processTicket(ticketData: {
    customerId: string;
    content: string;
    subject?: string;
    priority?: Ticket['priority'];
    category?: string;
    tags?: string[];
  }): Promise<{
    ticket: Ticket;
    workflowExecutionId: string;
    estimatedResolutionTime?: number;
  }> {
    try {
      // Get customer information
      const customer = await this.ticketService.getCustomer(ticketData.customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${ticketData.customerId}`);
      }

      // Create ticket
      const ticket = await this.ticketService.createTicket({
        customerId: ticketData.customerId,
        content: ticketData.content,
        subject: ticketData.subject || undefined,
        priority: ticketData.priority || 'medium',
        status: 'open',
        category: ticketData.category || undefined,
        tags: ticketData.tags || undefined
      });

      console.log(`📝 Created ticket: ${ticket.id} for customer: ${customer.name}`);

      // Prepare workflow input
      const workflowInput: WorkflowInput = {
        ticket,
        customer,
        context: {
          customerName: customer.name,
          customerTier: customer.tier,
          source: 'api'
        }
      };

      // Execute workflow
      const execution = await this.workflow.executeWorkflow(workflowInput);
      
      console.log(`⚡ Started workflow execution: ${execution.id}`);

      return {
        ticket,
        workflowExecutionId: execution.id,
        estimatedResolutionTime: this.estimateResolutionTime(ticket, customer)
      };

    } catch (error) {
      console.error('❌ Error processing ticket:', error);
      throw error;
    }
  }

  /**
   * Get the status of a workflow execution
   */
  public async getWorkflowStatus(executionId: string): Promise<any> {
    return await this.workflow.getWorkflowStatus(executionId);
  }

  /**
   * Get ticket information
   */
  public async getTicket(ticketId: string): Promise<Ticket | null> {
    return await this.ticketService.getTicket(ticketId);
  }

  /**
   * Get customer information
   */
  public async getCustomer(customerId: string): Promise<Customer | null> {
    return await this.ticketService.getCustomer(customerId);
  }

  /**
   * Get workflow metrics for a time period
   */
  public async getMetrics(timeWindow: { start: Date; end: Date }): Promise<any> {
    return await this.workflow.getMetrics(timeWindow);
  }

  /**
   * Get ticket metrics from the service
   */
  public async getTicketMetrics(timeWindow: { start: Date; end: Date }): Promise<any> {
    return await this.ticketService.getWorkflowMetrics(timeWindow);
  }

  /**
   * Search tickets
   */
  public async searchTickets(query: string): Promise<Ticket[]> {
    return await this.ticketService.searchTickets(query);
  }

  /**
   * Get tickets by status
   */
  public async getTicketsByStatus(status: Ticket['status']): Promise<Ticket[]> {
    return await this.ticketService.getTicketsByStatus(status);
  }

  /**
   * Get tickets by customer
   */
  public async getTicketsByCustomer(customerId: string): Promise<Ticket[]> {
    return await this.ticketService.getTicketsByCustomer(customerId);
  }

  /**
   * Create a new customer
   */
  public async createCustomer(customerData: {
    name: string;
    email: string;
    tier: Customer['tier'];
    metadata?: Record<string, unknown>;
  }): Promise<Customer> {
    return await this.ticketService.createCustomer(customerData);
  }

  /**
   * Update ticket status
   */
  public async updateTicket(
    ticketId: string, 
    updates: Partial<Ticket>, 
    updatedBy: string = 'system'
  ): Promise<Ticket | null> {
    return await this.ticketService.updateTicket(ticketId, updates, updatedBy);
  }

  /**
   * Cancel a workflow execution
   */
  public async cancelWorkflow(executionId: string): Promise<void> {
    await this.workflow.cancelWorkflow(executionId);
  }

  /**
   * Get ticket trends
   */
  public async getTicketTrends(days: number = 30): Promise<Record<string, number[]>> {
    return await this.ticketService.getTicketTrends(days);
  }

  private estimateResolutionTime(ticket: Ticket, customer: Customer): number {
    // Base resolution time in minutes
    let estimatedTime = 30;

    // Adjust based on priority
    switch (ticket.priority) {
      case 'urgent':
        estimatedTime = 15;
        break;
      case 'high':
        estimatedTime = 30;
        break;
      case 'medium':
        estimatedTime = 60;
        break;
      case 'low':
        estimatedTime = 120;
        break;
    }

    // Adjust based on customer tier
    switch (customer.tier) {
      case 'enterprise':
        estimatedTime *= 0.5; // Faster resolution for enterprise
        break;
      case 'premium':
        estimatedTime *= 0.7;
        break;
      case 'standard':
        estimatedTime *= 1.0;
        break;
      case 'basic':
        estimatedTime *= 1.5;
        break;
    }

    // Adjust based on category
    if (ticket.category === 'billing_inquiry') {
      estimatedTime *= 0.8; // Billing issues are often faster to resolve
    } else if (ticket.category === 'technical_support') {
      estimatedTime *= 1.5; // Technical issues may take longer
    }

    return Math.round(estimatedTime);
  }
}

// Export types for external use
export type {
  Ticket,
  Customer,
  WorkflowInput,
  WorkflowMetrics,
  TicketClassification,
  TicketResponse,
  EscalationRequest
} from './types';

// Export configuration
export { appConfig } from './config/AppConfig';

// Default export for convenience
export default WorkflowAutomationApp;
