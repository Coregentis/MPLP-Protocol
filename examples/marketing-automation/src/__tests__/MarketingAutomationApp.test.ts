/**
 * Marketing Automation App - Main Application Tests
 * Comprehensive test suite for the marketing automation system
 */

import { MarketingAutomationApp } from '../MarketingAutomationApp';
import {
  CampaignType,
  CampaignStatus,
  MarketingChannel,
  CustomerTier
} from '../types';

describe('MarketingAutomationApp', () => {
  let app: MarketingAutomationApp;

  beforeEach(async () => {
    app = new MarketingAutomationApp();
    await app.initialize();
  });

  afterEach(async () => {
    if (app) {
      try {
        await app.shutdown();
      } catch (error) {
        // Ignore shutdown errors in tests
      }
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const newApp = new MarketingAutomationApp();
      await expect(newApp.initialize()).resolves.not.toThrow();
      await newApp.shutdown();
    });
  });

  describe('Campaign Management', () => {
    it('should create a new campaign', async () => {
      const campaignData = {
        name: 'Test Campaign',
        description: 'A test marketing campaign',
        type: CampaignType.EMAIL,
        channels: [MarketingChannel.EMAIL],
        targetSegments: ['high-value'],
        content: {
          headline: 'Test Headline',
          body: 'Test campaign body content',
          callToAction: 'Click here'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        },
        budget: 1000
      };

      const campaign = await app.createCampaign(campaignData);

      expect(campaign).toMatchObject({
        name: 'Test Campaign',
        description: 'A test marketing campaign',
        type: CampaignType.EMAIL,
        status: CampaignStatus.DRAFT,
        channels: [MarketingChannel.EMAIL],
        targetSegments: ['high-value'],
        budget: 1000
      });
      expect(campaign.id).toBeDefined();
      expect(campaign.createdAt).toBeInstanceOf(Date);
    });

    it('should launch a campaign', async () => {
      const campaignData = {
        name: 'Launch Test Campaign',
        description: 'Campaign to test launching',
        type: CampaignType.EMAIL,
        channels: [MarketingChannel.EMAIL],
        targetSegments: ['high-value'],
        content: {
          headline: 'Launch Test',
          body: 'Testing campaign launch',
          callToAction: 'Subscribe'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        }
      };

      const campaign = await app.createCampaign(campaignData);
      const launchedCampaign = await app.launchCampaign(campaign.id);

      expect(launchedCampaign.status).toBe(CampaignStatus.ACTIVE);
      expect(launchedCampaign.launchedAt).toBeInstanceOf(Date);
      expect(launchedCampaign.metrics.sent).toBeGreaterThan(0);
    });

    it('should get campaign by ID', async () => {
      const campaignData = {
        name: 'Get Test Campaign',
        description: 'Campaign to test retrieval',
        type: CampaignType.SMS,
        channels: [MarketingChannel.SMS],
        targetSegments: [],
        content: {
          headline: 'Get Test',
          body: 'Testing campaign retrieval',
          callToAction: 'Reply'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        }
      };

      const campaign = await app.createCampaign(campaignData);
      const retrievedCampaign = app.getCampaign(campaign.id);

      expect(retrievedCampaign).toEqual(campaign);
    });

    it('should return null for non-existent campaign', () => {
      const campaign = app.getCampaign('non-existent-id');
      expect(campaign).toBeNull();
    });

    it('should get all campaigns', async () => {
      // Use a fresh app instance for this test to avoid state interference
      const freshApp = new MarketingAutomationApp();
      await freshApp.initialize();

      const campaignData1 = {
        name: 'Campaign 1',
        description: 'First campaign',
        type: CampaignType.EMAIL,
        channels: [MarketingChannel.EMAIL],
        targetSegments: [],
        content: {
          headline: 'Campaign 1',
          body: 'First campaign content',
          callToAction: 'Click'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        }
      };

      const campaignData2 = {
        name: 'Campaign 2',
        description: 'Second campaign',
        type: CampaignType.SMS,
        channels: [MarketingChannel.SMS],
        targetSegments: [],
        content: {
          headline: 'Campaign 2',
          body: 'Second campaign content',
          callToAction: 'Reply'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        }
      };

      const campaign1 = await freshApp.createCampaign(campaignData1);
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const campaign2 = await freshApp.createCampaign(campaignData2);

      const allCampaigns = freshApp.getAllCampaigns();
      expect(allCampaigns.length).toBe(2); // Should be exactly 2 in fresh instance
      expect(allCampaigns.some(c => c.id === campaign1.id)).toBe(true);
      expect(allCampaigns.some(c => c.id === campaign2.id)).toBe(true);

      await freshApp.shutdown();
    });

    it('should get campaigns by status', async () => {
      const campaignData = {
        name: 'Status Test Campaign',
        description: 'Campaign to test status filtering',
        type: CampaignType.EMAIL,
        channels: [MarketingChannel.EMAIL],
        targetSegments: [],
        content: {
          headline: 'Status Test',
          body: 'Testing status filtering',
          callToAction: 'Click'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        }
      };

      const campaign = await app.createCampaign(campaignData);
      await app.launchCampaign(campaign.id);

      const activeCampaigns = app.getCampaignsByStatus(CampaignStatus.ACTIVE);
      const draftCampaigns = app.getCampaignsByStatus(CampaignStatus.DRAFT);

      expect(activeCampaigns).toHaveLength(1);
      expect(activeCampaigns[0]?.id).toBe(campaign.id);
      expect(draftCampaigns).toHaveLength(0);
    });

    it('should throw error for launching non-existent campaign', async () => {
      await expect(app.launchCampaign('non-existent-id')).rejects.toThrow('Campaign not found');
    });
  });

  describe('Customer Management', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890',
        tier: CustomerTier.PREMIUM,
        segments: ['test-segment']
      };

      const customer = await app.createCustomer(customerData);

      expect(customer).toMatchObject({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890',
        tier: CustomerTier.PREMIUM,
        segments: ['test-segment']
      });
      expect(customer.id).toBeDefined();
      expect(customer.createdAt).toBeInstanceOf(Date);
    });

    it('should get customer by ID', async () => {
      const customerData = {
        name: 'Get Test Customer',
        email: 'gettest@example.com',
        tier: CustomerTier.BASIC
      };

      const customer = await app.createCustomer(customerData);
      const retrievedCustomer = app.getCustomer(customer.id);

      expect(retrievedCustomer).toEqual(customer);
    });

    it('should return null for non-existent customer', () => {
      const customer = app.getCustomer('non-existent-id');
      expect(customer).toBeNull();
    });
  });

  describe('Metrics and Analytics', () => {
    it('should get campaign metrics', async () => {
      const campaignData = {
        name: 'Metrics Test Campaign',
        description: 'Campaign to test metrics',
        type: CampaignType.EMAIL,
        channels: [MarketingChannel.EMAIL],
        targetSegments: [],
        content: {
          headline: 'Metrics Test',
          body: 'Testing metrics collection',
          callToAction: 'Click'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        }
      };

      const campaign = await app.createCampaign(campaignData);
      await app.launchCampaign(campaign.id);

      const metrics = app.getCampaignMetrics(campaign.id);

      expect(metrics).toBeDefined();
      expect(metrics!.sent).toBeGreaterThanOrEqual(0);
      expect(metrics!.delivered).toBeGreaterThanOrEqual(0);
      expect(metrics!.openRate).toBeGreaterThanOrEqual(0);
      expect(metrics!.clickRate).toBeGreaterThanOrEqual(0);
    });

    it('should return null for non-existent campaign metrics', () => {
      const metrics = app.getCampaignMetrics('non-existent-id');
      expect(metrics).toBeNull();
    });

    it('should get overall metrics', async () => {
      const campaignData = {
        name: 'Overall Metrics Test',
        description: 'Campaign for overall metrics test',
        type: CampaignType.EMAIL,
        channels: [MarketingChannel.EMAIL],
        targetSegments: [],
        content: {
          headline: 'Overall Test',
          body: 'Testing overall metrics',
          callToAction: 'Click'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        }
      };

      await app.createCustomer({
        name: 'Metrics Customer',
        email: 'metrics@example.com',
        tier: CustomerTier.BASIC
      });

      await app.createCampaign(campaignData);

      const overallMetrics = app.getOverallMetrics();

      expect(overallMetrics).toMatchObject({
        totalCampaigns: expect.any(Number),
        activeCampaigns: expect.any(Number),
        totalCustomers: expect.any(Number),
        totalRevenue: expect.any(Number),
        averageROI: expect.any(Number)
      });
      expect(overallMetrics.totalCampaigns).toBeGreaterThan(0);
      expect(overallMetrics.totalCustomers).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw error if not initialized', async () => {
      const uninitializedApp = new MarketingAutomationApp();

      const campaignData = {
        name: 'Error Test Campaign',
        description: 'Campaign to test error handling',
        type: CampaignType.EMAIL,
        channels: [MarketingChannel.EMAIL],
        targetSegments: [],
        content: {
          headline: 'Error Test',
          body: 'Testing error handling',
          callToAction: 'Click'
        },
        schedule: {
          startDate: new Date(),
          timezone: 'UTC'
        }
      };

      await expect(uninitializedApp.createCampaign(campaignData)).rejects.toThrow('App not initialized');
    });
  });
});
