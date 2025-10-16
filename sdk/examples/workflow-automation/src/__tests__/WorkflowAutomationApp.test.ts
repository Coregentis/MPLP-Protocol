/**
 * @fileoverview Tests for WorkflowAutomationApp
 * @version 1.1.0-beta
 */

import { WorkflowAutomationApp } from '../index';
import { Ticket, Customer } from '../types';

describe('WorkflowAutomationApp', () => {
  let app: WorkflowAutomationApp;

  beforeEach(() => {
    app = new WorkflowAutomationApp();
  });

  describe('Customer Management', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        tier: 'standard' as Customer['tier'],
        metadata: { company: 'Test Corp' }
      };

      const customer = await app.createCustomer(customerData);

      expect(customer).toBeDefined();
      expect(customer.id).toBeDefined();
      expect(customer.name).toBe(customerData.name);
      expect(customer.email).toBe(customerData.email);
      expect(customer.tier).toBe(customerData.tier);
      expect(customer.createdAt).toBeInstanceOf(Date);
    });

    it('should retrieve an existing customer', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        tier: 'premium' as Customer['tier']
      };

      const createdCustomer = await app.createCustomer(customerData);
      const retrievedCustomer = await app.getCustomer(createdCustomer.id);

      expect(retrievedCustomer).toBeDefined();
      expect(retrievedCustomer?.id).toBe(createdCustomer.id);
      expect(retrievedCustomer?.name).toBe(customerData.name);
    });

    it('should return null for non-existent customer', async () => {
      const customer = await app.getCustomer('NON_EXISTENT_ID');
      expect(customer).toBeNull();
    });
  });

  describe('Ticket Processing', () => {
    let testCustomer: Customer;

    beforeEach(async () => {
      testCustomer = await app.createCustomer({
        name: 'Test Customer',
        email: 'test@example.com',
        tier: 'standard'
      });
    });

    it('should process a new ticket successfully', async () => {
      const ticketData = {
        customerId: testCustomer.id,
        content: 'I need help with my account login',
        subject: 'Login Issue',
        priority: 'medium' as Ticket['priority'],
        category: 'technical_support',
        tags: ['login', 'account']
      };

      const result = await app.processTicket(ticketData);

      expect(result).toBeDefined();
      expect(result.ticket).toBeDefined();
      expect(result.workflowExecutionId).toBeDefined();
      expect(result.estimatedResolutionTime).toBeGreaterThan(0);
      expect(result.ticket.customerId).toBe(testCustomer.id);
      expect(result.ticket.content).toBe(ticketData.content);
      expect(result.ticket.status).toBe('open');
    });

    it('should handle urgent priority tickets', async () => {
      const ticketData = {
        customerId: testCustomer.id,
        content: 'URGENT: System is down and we cannot access our data',
        subject: 'System Outage',
        priority: 'urgent' as Ticket['priority'],
        category: 'technical_support',
        tags: ['urgent', 'outage', 'system']
      };

      const result = await app.processTicket(ticketData);

      expect(result.ticket.priority).toBe('urgent');
      expect(result.estimatedResolutionTime).toBeLessThan(30); // Urgent tickets should have faster resolution
    });

    it('should handle billing inquiries', async () => {
      const ticketData = {
        customerId: testCustomer.id,
        content: 'I was charged twice for my subscription',
        subject: 'Billing Issue',
        priority: 'high' as Ticket['priority'],
        category: 'billing_inquiry',
        tags: ['billing', 'refund']
      };

      const result = await app.processTicket(ticketData);

      expect(result.ticket.category).toBe('billing_inquiry');
      expect(result.ticket.tags).toContain('billing');
    });

    it('should throw error for non-existent customer', async () => {
      const ticketData = {
        customerId: 'NON_EXISTENT_CUSTOMER',
        content: 'Test content',
        subject: 'Test subject'
      };

      await expect(app.processTicket(ticketData)).rejects.toThrow('Customer not found');
    });
  });

  describe('Ticket Management', () => {
    let testCustomer: Customer;
    let testTicket: Ticket;

    beforeEach(async () => {
      testCustomer = await app.createCustomer({
        name: 'Test Customer',
        email: 'test@example.com',
        tier: 'standard'
      });

      const result = await app.processTicket({
        customerId: testCustomer.id,
        content: 'Test ticket content',
        subject: 'Test Ticket'
      });

      testTicket = result.ticket;
    });

    it('should retrieve a ticket by ID', async () => {
      const retrievedTicket = await app.getTicket(testTicket.id);

      expect(retrievedTicket).toBeDefined();
      expect(retrievedTicket?.id).toBe(testTicket.id);
      expect(retrievedTicket?.content).toBe(testTicket.content);
    });

    it('should update ticket status', async () => {
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const updatedTicket = await app.updateTicket(testTicket.id, {
        status: 'in_progress',
        metadata: { assignedTo: 'agent_001' }
      });

      expect(updatedTicket).toBeDefined();
      expect(updatedTicket?.status).toBe('in_progress');
      expect(updatedTicket?.updatedAt).not.toEqual(testTicket.updatedAt);
    });

    it('should get tickets by status', async () => {
      await app.updateTicket(testTicket.id, { status: 'resolved' });
      const resolvedTickets = await app.getTicketsByStatus('resolved');

      expect(resolvedTickets).toBeDefined();
      expect(resolvedTickets.length).toBeGreaterThan(0);
      expect(resolvedTickets.some(t => t.id === testTicket.id)).toBe(true);
    });

    it('should get tickets by customer', async () => {
      const customerTickets = await app.getTicketsByCustomer(testCustomer.id);

      expect(customerTickets).toBeDefined();
      expect(customerTickets.length).toBeGreaterThan(0);
      expect(customerTickets.some(t => t.id === testTicket.id)).toBe(true);
    });

    it('should search tickets by content', async () => {
      const searchResults = await app.searchTickets('Test ticket');

      expect(searchResults).toBeDefined();
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults.some(t => t.id === testTicket.id)).toBe(true);
    });
  });

  describe('Metrics and Reporting', () => {
    beforeEach(async () => {
      // Create some test data
      const customer = await app.createCustomer({
        name: 'Metrics Test Customer',
        email: 'metrics@example.com',
        tier: 'premium'
      });

      await app.processTicket({
        customerId: customer.id,
        content: 'Test ticket for metrics',
        subject: 'Metrics Test'
      });
    });

    it('should get ticket metrics for a time window', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const metrics = await app.getTicketMetrics({
        start: oneHourAgo,
        end: now
      });

      expect(metrics).toBeDefined();
      expect(metrics.totalTickets).toBeGreaterThanOrEqual(0);
      expect(metrics.resolvedTickets).toBeGreaterThanOrEqual(0);
      expect(metrics.escalatedTickets).toBeGreaterThanOrEqual(0);
      expect(metrics.averageResolutionTime).toBeGreaterThanOrEqual(0);
      expect(metrics.customerSatisfaction).toBeGreaterThan(0);
      expect(metrics.automationRate).toBeGreaterThanOrEqual(0);
      expect(metrics.agentUtilization).toBeDefined();
    });

    it('should get workflow metrics', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const metrics = await app.getMetrics({
        start: oneHourAgo,
        end: now
      });

      expect(metrics).toBeDefined();
      expect(metrics.metrics).toBeDefined();
      expect(metrics.healthScore).toBeGreaterThanOrEqual(0);
      expect(metrics.healthScore).toBeLessThanOrEqual(1);
    });

    it('should get ticket trends', async () => {
      const trends = await app.getTicketTrends(7); // Last 7 days

      expect(trends).toBeDefined();
      expect(trends.daily_tickets).toBeDefined();
      expect(trends.daily_resolved).toBeDefined();
      expect(trends.daily_escalated).toBeDefined();
      expect(trends.daily_tickets?.length).toBe(7);
    });
  });

  describe('Workflow Management', () => {
    let testCustomer: Customer;
    let workflowExecutionId: string;

    beforeEach(async () => {
      testCustomer = await app.createCustomer({
        name: 'Workflow Test Customer',
        email: 'workflow@example.com',
        tier: 'enterprise'
      });

      const result = await app.processTicket({
        customerId: testCustomer.id,
        content: 'Workflow test ticket',
        subject: 'Workflow Test'
      });

      workflowExecutionId = result.workflowExecutionId;
    });

    it('should get workflow status', async () => {
      const status = await app.getWorkflowStatus(workflowExecutionId);

      expect(status).toBeDefined();
      // Note: In a real implementation, this would return actual workflow execution details
    });

    it('should cancel workflow', async () => {
      await expect(app.cancelWorkflow(workflowExecutionId)).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid ticket data gracefully', async () => {
      const invalidTicketData = {
        customerId: '',
        content: '',
        subject: ''
      };

      await expect(app.processTicket(invalidTicketData)).rejects.toThrow();
    });

    it('should handle non-existent ticket updates', async () => {
      const result = await app.updateTicket('NON_EXISTENT_TICKET', {
        status: 'resolved'
      });

      expect(result).toBeNull();
    });
  });
});
