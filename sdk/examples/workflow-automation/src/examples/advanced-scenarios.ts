/**
 * @fileoverview Advanced scenarios example for workflow automation
 * @version 1.1.0-beta
 */

import { WorkflowAutomationApp } from '../index';
import { Customer, Ticket } from '../types';

async function advancedScenariosExample(): Promise<void> {
  console.log('🚀 Starting Workflow Automation Advanced Scenarios Example\n');

  try {
    const app = new WorkflowAutomationApp();

    // Scenario 1: High-volume ticket processing
    console.log('📋 Scenario 1: High-volume ticket processing...');
    await highVolumeProcessing(app);

    // Scenario 2: Escalation workflow
    console.log('\n📋 Scenario 2: Escalation workflow...');
    await escalationWorkflow(app);

    // Scenario 3: Multi-customer batch processing
    console.log('\n📋 Scenario 3: Multi-customer batch processing...');
    await batchProcessing(app);

    // Scenario 4: Real-time monitoring and alerting
    console.log('\n📋 Scenario 4: Real-time monitoring and alerting...');
    await monitoringAndAlerting(app);

    // Scenario 5: Customer journey analysis
    console.log('\n📋 Scenario 5: Customer journey analysis...');
    await customerJourneyAnalysis(app);

    console.log('\n✅ All advanced scenarios completed successfully!');

  } catch (error) {
    console.error('❌ Error in advanced scenarios:', error);
    throw error;
  }
}

async function highVolumeProcessing(app: WorkflowAutomationApp): Promise<void> {
  console.log('   Processing 10 tickets simultaneously...');

  // Create a customer for high-volume testing
  const customer = await app.createCustomer({
    name: 'High Volume Customer',
    email: 'highvolume@example.com',
    tier: 'enterprise'
  });

  // Create multiple tickets with different priorities and categories
  const ticketPromises = [];
  const ticketTypes = [
    { content: 'Login issue with SSO', category: 'technical_support', priority: 'high' },
    { content: 'Billing question about invoice', category: 'billing_inquiry', priority: 'medium' },
    { content: 'Feature request for API', category: 'product_inquiry', priority: 'low' },
    { content: 'Password reset not working', category: 'technical_support', priority: 'medium' },
    { content: 'Refund request for overpayment', category: 'billing_inquiry', priority: 'high' },
    { content: 'Integration documentation needed', category: 'product_inquiry', priority: 'low' },
    { content: 'URGENT: Data export failing', category: 'technical_support', priority: 'urgent' },
    { content: 'Account upgrade inquiry', category: 'product_inquiry', priority: 'medium' },
    { content: 'Invoice discrepancy found', category: 'billing_inquiry', priority: 'medium' },
    { content: 'Performance issues reported', category: 'technical_support', priority: 'high' }
  ];

  for (let i = 0; i < ticketTypes.length; i++) {
    const ticketType = ticketTypes[i];
    if (ticketType) {
      ticketPromises.push(
        app.processTicket({
          customerId: customer.id,
          content: ticketType.content,
          subject: `Ticket ${i + 1}: ${ticketType.category}`,
          priority: ticketType.priority as Ticket['priority'],
          category: ticketType.category,
          tags: [ticketType.category, ticketType.priority]
        })
      );
    }
  }

  const results = await Promise.all(ticketPromises);
  console.log(`   ✅ Successfully processed ${results.length} tickets`);
  
  // Analyze processing results
  const avgResolutionTime = results.reduce((sum, r) => sum + (r.estimatedResolutionTime || 0), 0) / results.length;
  console.log(`   📊 Average estimated resolution time: ${avgResolutionTime.toFixed(1)} minutes`);
  
  const priorityDistribution = results.reduce((acc, r) => {
    acc[r.ticket.priority] = (acc[r.ticket.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`   📈 Priority distribution:`, priorityDistribution);
}

async function escalationWorkflow(app: WorkflowAutomationApp): Promise<void> {
  console.log('   Testing escalation scenarios...');

  // Create enterprise customer (higher escalation likelihood)
  const enterpriseCustomer = await app.createCustomer({
    name: 'Enterprise Escalation Customer',
    email: 'escalation@enterprise.com',
    tier: 'enterprise'
  });

  // Create tickets that should trigger escalation
  const escalationTickets = [
    {
      content: 'CRITICAL: Complete system outage affecting all users. Revenue impact estimated at $10,000 per hour.',
      subject: 'Critical System Outage',
      priority: 'urgent' as Ticket['priority'],
      category: 'technical_support',
      tags: ['critical', 'outage', 'revenue-impact']
    },
    {
      content: 'Security breach detected. Unauthorized access to customer data. Need immediate response.',
      subject: 'Security Incident',
      priority: 'urgent' as Ticket['priority'],
      category: 'technical_support',
      tags: ['security', 'breach', 'data']
    },
    {
      content: 'Legal compliance issue. GDPR violation reported by customer. Requires legal review.',
      subject: 'Compliance Issue',
      priority: 'high' as Ticket['priority'],
      category: 'general_inquiry',
      tags: ['legal', 'compliance', 'gdpr']
    }
  ];

  for (const ticketData of escalationTickets) {
    const result = await app.processTicket({
      customerId: enterpriseCustomer.id,
      ...ticketData
    });
    
    console.log(`   🚨 Processed escalation ticket: ${result.ticket.id}`);
    console.log(`      Priority: ${result.ticket.priority}`);
    console.log(`      Estimated resolution: ${result.estimatedResolutionTime} minutes`);
    
    // Check workflow status to see if escalation occurred
    const workflowStatus = await app.getWorkflowStatus(result.workflowExecutionId);
    console.log(`      Workflow status: ${workflowStatus ? 'Active' : 'Completed'}`);
  }
}

async function batchProcessing(app: WorkflowAutomationApp): Promise<void> {
  console.log('   Processing tickets for multiple customer tiers...');

  // Create customers of different tiers
  const customers = await Promise.all([
    app.createCustomer({
      name: 'Basic Tier Customer',
      email: 'basic@example.com',
      tier: 'basic'
    }),
    app.createCustomer({
      name: 'Standard Tier Customer',
      email: 'standard@example.com',
      tier: 'standard'
    }),
    app.createCustomer({
      name: 'Premium Tier Customer',
      email: 'premium@example.com',
      tier: 'premium'
    }),
    app.createCustomer({
      name: 'Enterprise Tier Customer',
      email: 'enterprise@example.com',
      tier: 'enterprise'
    })
  ]);

  // Process similar tickets for each customer tier
  const batchPromises = customers.map(async (customer, index) => {
    const result = await app.processTicket({
      customerId: customer.id,
      content: 'I need help setting up my account and understanding the features available to me.',
      subject: 'Account Setup Assistance',
      priority: 'medium',
      category: 'product_inquiry',
      tags: ['setup', 'account', 'features']
    });

    return {
      customer,
      ticket: result.ticket,
      estimatedResolution: result.estimatedResolutionTime
    };
  });

  const batchResults = await Promise.all(batchPromises);
  
  console.log('   📊 Batch processing results by tier:');
  batchResults.forEach(result => {
    console.log(`      ${result.customer.tier}: ${result.estimatedResolution} min resolution`);
  });

  // Analyze tier-based processing differences
  const tierResolutionTimes = batchResults.reduce((acc, result) => {
    acc[result.customer.tier] = result.estimatedResolution || 0;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('   🎯 Tier-based SLA compliance:');
  Object.entries(tierResolutionTimes).forEach(([tier, time]) => {
    const slaTarget = getSLATarget(tier);
    const compliance = time <= slaTarget ? '✅' : '❌';
    console.log(`      ${tier}: ${time}min (target: ${slaTarget}min) ${compliance}`);
  });
}

async function monitoringAndAlerting(app: WorkflowAutomationApp): Promise<void> {
  console.log('   Testing monitoring and alerting capabilities...');

  // Get current metrics
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const metrics = await app.getMetrics({
    start: oneHourAgo,
    end: now
  });

  console.log('   📊 Current system metrics:');
  console.log(`      Health score: ${(metrics.healthScore * 100).toFixed(1)}%`);
  console.log(`      Active alerts: ${metrics.alerts.length}`);
  
  if (metrics.alerts.length > 0) {
    console.log('   🚨 Active alerts:');
    metrics.alerts.forEach((alert: any, index: number) => {
      console.log(`      ${index + 1}. ${alert.type.toUpperCase()}: ${alert.message}`);
    });
  }

  console.log(`      Recommendations: ${metrics.recommendations.length}`);
  if (metrics.recommendations.length > 0) {
    console.log('   💡 System recommendations:');
    metrics.recommendations.forEach((rec: string, index: number) => {
      console.log(`      ${index + 1}. ${rec}`);
    });
  }

  // Get ticket trends for trend analysis
  const trends = await app.getTicketTrends(7);
  const totalTicketsLastWeek = trends.daily_tickets?.reduce((sum, count) => sum + count, 0) || 0;
  const totalResolvedLastWeek = trends.daily_resolved?.reduce((sum, count) => sum + count, 0) || 0;
  const resolutionRate = totalTicketsLastWeek > 0 ? (totalResolvedLastWeek / totalTicketsLastWeek) * 100 : 0;
  
  console.log('   📈 7-day trend analysis:');
  console.log(`      Total tickets: ${totalTicketsLastWeek}`);
  console.log(`      Resolution rate: ${resolutionRate.toFixed(1)}%`);
}

async function customerJourneyAnalysis(app: WorkflowAutomationApp): Promise<void> {
  console.log('   Analyzing customer journey patterns...');

  // Create a customer and simulate a journey
  const journeyCustomer = await app.createCustomer({
    name: 'Journey Analysis Customer',
    email: 'journey@example.com',
    tier: 'standard'
  });

  // Simulate customer journey with multiple touchpoints
  const journeySteps = [
    {
      content: 'I am interested in your product. Can you provide more information?',
      subject: 'Product Information Request',
      priority: 'low' as Ticket['priority'],
      category: 'product_inquiry',
      tags: ['information', 'interest']
    },
    {
      content: 'I would like to schedule a demo of your platform.',
      subject: 'Demo Request',
      priority: 'medium' as Ticket['priority'],
      category: 'product_inquiry',
      tags: ['demo', 'sales']
    },
    {
      content: 'I have signed up but need help with initial setup.',
      subject: 'Setup Assistance',
      priority: 'medium' as Ticket['priority'],
      category: 'technical_support',
      tags: ['setup', 'onboarding']
    },
    {
      content: 'I am having trouble with a specific feature. Can you help?',
      subject: 'Feature Support',
      priority: 'medium' as Ticket['priority'],
      category: 'technical_support',
      tags: ['feature', 'support']
    }
  ];

  const journeyResults = [];
  for (const step of journeySteps) {
    const result = await app.processTicket({
      customerId: journeyCustomer.id,
      ...step
    });
    journeyResults.push(result);
    
    // Simulate time between interactions
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('   🛤️ Customer journey analysis:');
  journeyResults.forEach((result, index) => {
    console.log(`      Step ${index + 1}: ${result.ticket.subject}`);
    console.log(`         Category: ${result.ticket.category}`);
    console.log(`         Priority: ${result.ticket.priority}`);
    console.log(`         Est. resolution: ${result.estimatedResolutionTime} min`);
  });

  // Analyze journey patterns
  const customerTickets = await app.getTicketsByCustomer(journeyCustomer.id);
  const categoryProgression = customerTickets.map(t => t.category);
  const priorityProgression = customerTickets.map(t => t.priority);
  
  console.log('   📊 Journey insights:');
  console.log(`      Total interactions: ${customerTickets.length}`);
  console.log(`      Category progression: ${categoryProgression.join(' → ')}`);
  console.log(`      Priority progression: ${priorityProgression.join(' → ')}`);
  
  const avgResolutionTime = journeyResults.reduce((sum, r) => sum + (r.estimatedResolutionTime || 0), 0) / journeyResults.length;
  console.log(`      Average resolution time: ${avgResolutionTime.toFixed(1)} minutes`);
}

function getSLATarget(tier: string): number {
  const slaTargets: Record<string, number> = {
    'basic': 120,      // 2 hours
    'standard': 60,    // 1 hour
    'premium': 30,     // 30 minutes
    'enterprise': 15   // 15 minutes
  };
  return slaTargets[tier] || 60;
}

// Run the example if this file is executed directly
if (require.main === module) {
  advancedScenariosExample()
    .then(() => {
      console.log('\n🎉 Advanced scenarios completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Advanced scenarios failed:', error);
      process.exit(1);
    });
}

export { advancedScenariosExample };
