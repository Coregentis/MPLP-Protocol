/**
 * @fileoverview Ticket Service for managing customer support tickets
 * @version 1.1.0-beta
 */

import { Ticket, Customer, TicketUpdate, WorkflowMetrics } from '../types';

export class TicketService {
  private readonly tickets: Map<string, Ticket>;
  private readonly customers: Map<string, Customer>;
  private readonly ticketHistory: Map<string, TicketUpdate[]>;

  constructor() {
    this.tickets = new Map();
    this.customers = new Map();
    this.ticketHistory = new Map();
    this.initializeSampleData();
  }

  public async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    const ticket: Ticket = {
      id: this.generateTicketId(),
      ...ticketData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tickets.set(ticket.id, ticket);
    this.ticketHistory.set(ticket.id, []);

    return ticket;
  }

  public async getTicket(ticketId: string): Promise<Ticket | null> {
    return this.tickets.get(ticketId) || null;
  }

  public async updateTicket(ticketId: string, updates: Partial<Ticket>, updatedBy: string): Promise<Ticket | null> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      return null;
    }

    const updatedTicket: Ticket = {
      ...ticket,
      ...updates,
      updatedAt: new Date()
    };

    this.tickets.set(ticketId, updatedTicket);

    // Record the update in history
    const update: TicketUpdate = {
      ticketId,
      status: updates.status,
      priority: updates.priority,
      assignedTo: updates.metadata?.assignedTo as string,
      notes: updates.metadata?.notes as string,
      updatedBy,
      timestamp: new Date()
    };

    const history = this.ticketHistory.get(ticketId) || [];
    history.push(update);
    this.ticketHistory.set(ticketId, history);

    return updatedTicket;
  }

  public async getTicketHistory(ticketId: string): Promise<TicketUpdate[]> {
    return this.ticketHistory.get(ticketId) || [];
  }

  public async getCustomer(customerId: string): Promise<Customer | null> {
    return this.customers.get(customerId) || null;
  }

  public async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const customer: Customer = {
      id: this.generateCustomerId(),
      ...customerData,
      createdAt: new Date()
    };

    this.customers.set(customer.id, customer);
    return customer;
  }

  public async getTicketsByCustomer(customerId: string): Promise<Ticket[]> {
    const tickets: Ticket[] = [];
    for (const ticket of this.tickets.values()) {
      if (ticket.customerId === customerId) {
        tickets.push(ticket);
      }
    }
    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getTicketsByStatus(status: Ticket['status']): Promise<Ticket[]> {
    const tickets: Ticket[] = [];
    for (const ticket of this.tickets.values()) {
      if (ticket.status === status) {
        tickets.push(ticket);
      }
    }
    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getTicketsByPriority(priority: Ticket['priority']): Promise<Ticket[]> {
    const tickets: Ticket[] = [];
    for (const ticket of this.tickets.values()) {
      if (ticket.priority === priority) {
        tickets.push(ticket);
      }
    }
    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async searchTickets(query: string): Promise<Ticket[]> {
    const lowerQuery = query.toLowerCase();
    const tickets: Ticket[] = [];
    
    for (const ticket of this.tickets.values()) {
      if (
        ticket.content.toLowerCase().includes(lowerQuery) ||
        ticket.subject?.toLowerCase().includes(lowerQuery) ||
        ticket.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        tickets.push(ticket);
      }
    }
    
    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getWorkflowMetrics(timeWindow: { start: Date; end: Date }): Promise<WorkflowMetrics> {
    const ticketsInWindow = Array.from(this.tickets.values()).filter(
      ticket => ticket.createdAt >= timeWindow.start && ticket.createdAt <= timeWindow.end
    );

    const totalTickets = ticketsInWindow.length;
    const resolvedTickets = ticketsInWindow.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const escalatedTickets = ticketsInWindow.filter(t => t.status === 'escalated').length;

    // Calculate average resolution time
    const resolvedTicketsWithTime = ticketsInWindow.filter(t => t.resolvedAt);
    const totalResolutionTime = resolvedTicketsWithTime.reduce((sum, ticket) => {
      if (ticket.resolvedAt) {
        return sum + (ticket.resolvedAt.getTime() - ticket.createdAt.getTime());
      }
      return sum;
    }, 0);
    const averageResolutionTime = resolvedTicketsWithTime.length > 0 ? 
      totalResolutionTime / resolvedTicketsWithTime.length / (1000 * 60) : 0; // in minutes

    // Simulate customer satisfaction (in real implementation, this would come from surveys)
    const customerSatisfaction = 4.2; // 4.2/5.0

    // Calculate automation rate (tickets resolved without escalation)
    const automatedTickets = totalTickets - escalatedTickets;
    const automationRate = totalTickets > 0 ? automatedTickets / totalTickets : 0;

    // Simulate agent utilization
    const agentUtilization = {
      'classification_agent': 0.75,
      'response_agent': 0.68,
      'escalation_agent': 0.45,
      'monitoring_agent': 0.30
    };

    return {
      totalTickets,
      resolvedTickets,
      escalatedTickets,
      averageResolutionTime,
      customerSatisfaction,
      automationRate,
      agentUtilization
    };
  }

  public async getTicketTrends(days: number = 30): Promise<Record<string, number[]>> {
    const now = new Date();
    const trends: Record<string, number[]> = {
      daily_tickets: [],
      daily_resolved: [],
      daily_escalated: []
    };

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dayTickets = Array.from(this.tickets.values()).filter(
        ticket => ticket.createdAt >= startOfDay && ticket.createdAt < endOfDay
      );

      const dailyTickets = trends.daily_tickets;
      const dailyResolved = trends.daily_resolved;
      const dailyEscalated = trends.daily_escalated;

      if (dailyTickets) dailyTickets.push(dayTickets.length);
      if (dailyResolved) dailyResolved.push(dayTickets.filter(t => t.status === 'resolved').length);
      if (dailyEscalated) dailyEscalated.push(dayTickets.filter(t => t.status === 'escalated').length);
    }

    return trends;
  }

  public async deleteTicket(ticketId: string): Promise<boolean> {
    const deleted = this.tickets.delete(ticketId);
    if (deleted) {
      this.ticketHistory.delete(ticketId);
    }
    return deleted;
  }

  public async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private generateTicketId(): string {
    return `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateCustomerId(): string {
    return `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private initializeSampleData(): void {
    // Create sample customers
    const sampleCustomers: Customer[] = [
      {
        id: 'CUST_001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        tier: 'enterprise',
        createdAt: new Date('2024-01-15'),
        metadata: { company: 'Acme Corp', industry: 'Technology' }
      },
      {
        id: 'CUST_002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        tier: 'premium',
        createdAt: new Date('2024-02-20'),
        metadata: { company: 'Beta Inc', industry: 'Finance' }
      },
      {
        id: 'CUST_003',
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        tier: 'standard',
        createdAt: new Date('2024-03-10'),
        metadata: { company: 'Gamma LLC', industry: 'Retail' }
      }
    ];

    for (const customer of sampleCustomers) {
      this.customers.set(customer.id, customer);
    }

    // Create sample tickets
    const sampleTickets: Ticket[] = [
      {
        id: 'TICKET_001',
        customerId: 'CUST_001',
        content: 'I am having trouble logging into my account. The password reset is not working.',
        subject: 'Login Issues',
        priority: 'high',
        status: 'open',
        category: 'technical_support',
        tags: ['login', 'password', 'authentication'],
        createdAt: new Date('2024-12-01T10:00:00Z'),
        updatedAt: new Date('2024-12-01T10:00:00Z'),
        metadata: { source: 'email', browser: 'Chrome' }
      },
      {
        id: 'TICKET_002',
        customerId: 'CUST_002',
        content: 'I was charged twice for my subscription this month. Please help me get a refund.',
        subject: 'Billing Issue - Double Charge',
        priority: 'medium',
        status: 'in_progress',
        category: 'billing_inquiry',
        tags: ['billing', 'refund', 'subscription'],
        createdAt: new Date('2024-12-01T14:30:00Z'),
        updatedAt: new Date('2024-12-01T15:00:00Z'),
        metadata: { source: 'chat', amount: '$99.99' }
      },
      {
        id: 'TICKET_003',
        customerId: 'CUST_003',
        content: 'What are the differences between your Pro and Enterprise plans?',
        subject: 'Product Inquiry',
        priority: 'low',
        status: 'resolved',
        category: 'product_inquiry',
        tags: ['pricing', 'plans', 'features'],
        createdAt: new Date('2024-11-30T09:15:00Z'),
        updatedAt: new Date('2024-11-30T16:45:00Z'),
        resolvedAt: new Date('2024-11-30T16:45:00Z'),
        metadata: { source: 'web_form', interested_plan: 'Enterprise' }
      }
    ];

    for (const ticket of sampleTickets) {
      this.tickets.set(ticket.id, ticket);
      this.ticketHistory.set(ticket.id, []);
    }
  }
}
