/**
 * @fileoverview Basic usage example for workflow automation
 * @version 1.1.0-beta
 */

import { WorkflowAutomationApp } from '../index';

async function basicUsageExample(): Promise<void> {
  console.log('🚀 Starting Workflow Automation Basic Usage Example\n');

  try {
    // Initialize the application
    const app = new WorkflowAutomationApp();

    // Step 1: Create customers
    console.log('📋 Step 1: Creating customers...');
    
    const enterpriseCustomer = await app.createCustomer({
      name: 'Alice Johnson',
      email: 'alice.johnson@enterprise.com',
      tier: 'enterprise',
      metadata: {
        company: 'Enterprise Corp',
        industry: 'Technology',
        contractValue: 100000
      }
    });
    console.log(`✅ Created enterprise customer: ${enterpriseCustomer.name} (${enterpriseCustomer.id})`);

    const standardCustomer = await app.createCustomer({
      name: 'Bob Smith',
      email: 'bob.smith@standard.com',
      tier: 'standard',
      metadata: {
        company: 'Standard Inc',
        industry: 'Retail'
      }
    });
    console.log(`✅ Created standard customer: ${standardCustomer.name} (${standardCustomer.id})`);

    // Step 2: Process different types of tickets
    console.log('\n📋 Step 2: Processing various ticket types...');

    // Technical support ticket (urgent)
    const urgentTicket = await app.processTicket({
      customerId: enterpriseCustomer.id,
      content: 'URGENT: Our production system is down and users cannot access the application. This is affecting all our customers.',
      subject: 'Production System Outage',
      priority: 'urgent',
      category: 'technical_support',
      tags: ['urgent', 'outage', 'production', 'system']
    });
    console.log(`🚨 Processed urgent ticket: ${urgentTicket.ticket.id}`);
    console.log(`   Estimated resolution: ${urgentTicket.estimatedResolutionTime} minutes`);

    // Billing inquiry (medium priority)
    const billingTicket = await app.processTicket({
      customerId: standardCustomer.id,
      content: 'I noticed I was charged twice for my monthly subscription. Can you please help me understand why and process a refund if necessary?',
      subject: 'Double Billing Issue',
      priority: 'medium',
      category: 'billing_inquiry',
      tags: ['billing', 'refund', 'subscription']
    });
    console.log(`💰 Processed billing ticket: ${billingTicket.ticket.id}`);
    console.log(`   Estimated resolution: ${billingTicket.estimatedResolutionTime} minutes`);

    // Product inquiry (low priority)
    const productTicket = await app.processTicket({
      customerId: standardCustomer.id,
      content: 'I am interested in upgrading to your premium plan. Can you provide more details about the additional features and pricing?',
      subject: 'Premium Plan Inquiry',
      priority: 'low',
      category: 'product_inquiry',
      tags: ['upgrade', 'premium', 'pricing', 'features']
    });
    console.log(`📦 Processed product inquiry: ${productTicket.ticket.id}`);
    console.log(`   Estimated resolution: ${productTicket.estimatedResolutionTime} minutes`);

    // Step 3: Check workflow status
    console.log('\n📋 Step 3: Checking workflow status...');
    
    const urgentWorkflowStatus = await app.getWorkflowStatus(urgentTicket.workflowExecutionId);
    console.log(`🔍 Urgent ticket workflow status: ${urgentWorkflowStatus ? 'Found' : 'Not found'}`);

    // Step 4: Update ticket status
    console.log('\n📋 Step 4: Updating ticket status...');
    
    const updatedBillingTicket = await app.updateTicket(billingTicket.ticket.id, {
      status: 'in_progress',
      metadata: {
        assignedTo: 'billing_agent_001',
        notes: 'Investigating double charge issue'
      }
    }, 'system');
    console.log(`📝 Updated billing ticket status: ${updatedBillingTicket?.status}`);

    // Step 5: Search and filter tickets
    console.log('\n📋 Step 5: Searching and filtering tickets...');
    
    const urgentTickets = await app.getTicketsByStatus('open');
    console.log(`🔍 Found ${urgentTickets.length} open tickets`);

    const enterpriseTickets = await app.getTicketsByCustomer(enterpriseCustomer.id);
    console.log(`🏢 Found ${enterpriseTickets.length} tickets for enterprise customer`);

    const searchResults = await app.searchTickets('billing');
    console.log(`🔎 Found ${searchResults.length} tickets containing 'billing'`);

    // Step 6: Get metrics and analytics
    console.log('\n📋 Step 6: Getting metrics and analytics...');
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const ticketMetrics = await app.getTicketMetrics({
      start: oneHourAgo,
      end: now
    });
    console.log('📊 Ticket Metrics:');
    console.log(`   Total tickets: ${ticketMetrics.totalTickets}`);
    console.log(`   Resolved tickets: ${ticketMetrics.resolvedTickets}`);
    console.log(`   Escalated tickets: ${ticketMetrics.escalatedTickets}`);
    console.log(`   Average resolution time: ${ticketMetrics.averageResolutionTime.toFixed(1)} minutes`);
    console.log(`   Customer satisfaction: ${ticketMetrics.customerSatisfaction.toFixed(1)}/5.0`);
    console.log(`   Automation rate: ${(ticketMetrics.automationRate * 100).toFixed(1)}%`);

    const workflowMetrics = await app.getMetrics({
      start: oneHourAgo,
      end: now
    });
    console.log('\n🔧 Workflow Metrics:');
    console.log(`   System health score: ${(workflowMetrics.healthScore * 100).toFixed(1)}%`);
    console.log(`   Active alerts: ${workflowMetrics.alerts.length}`);
    console.log(`   Recommendations: ${workflowMetrics.recommendations.length}`);

    // Step 7: Get trends
    console.log('\n📋 Step 7: Getting ticket trends...');
    
    const trends = await app.getTicketTrends(7);
    console.log('📈 7-Day Trends:');
    console.log(`   Daily tickets: [${trends.daily_tickets?.join(', ') || 'N/A'}]`);
    console.log(`   Daily resolved: [${trends.daily_resolved?.join(', ') || 'N/A'}]`);
    console.log(`   Daily escalated: [${trends.daily_escalated?.join(', ') || 'N/A'}]`);

    console.log('\n✅ Basic usage example completed successfully!');

  } catch (error) {
    console.error('❌ Error in basic usage example:', error);
    throw error;
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicUsageExample()
    .then(() => {
      console.log('\n🎉 Example completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Example failed:', error);
      process.exit(1);
    });
}

export { basicUsageExample };
