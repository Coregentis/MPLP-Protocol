/**
 * Campaign Types
 * Type definitions for marketing campaigns and related entities
 */

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  channels: MarketingChannel[];
  targetSegments: string[];
  content: CampaignContent;
  schedule: CampaignSchedule;
  budget?: number | undefined;
  createdAt: Date;
  updatedAt: Date;
  launchedAt?: Date;
  completedAt?: Date;
  metrics: CampaignMetrics;
  metadata: Record<string, any>;
}

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  DISPLAY_ADS = 'display_ads',
  CONTENT_MARKETING = 'content_marketing',
  WEBINAR = 'webinar',
  PRODUCT_LAUNCH = 'product_launch'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MarketingChannel {
  EMAIL = 'email',
  SMS = 'sms',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  GOOGLE_ADS = 'google_ads',
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app'
}

export interface CampaignContent {
  subject?: string;
  headline: string;
  body: string;
  callToAction: string;
  images?: string[];
  videos?: string[];
  attachments?: string[];
  personalization: PersonalizationConfig;
}

export interface PersonalizationConfig {
  useCustomerName: boolean;
  useCompanyName: boolean;
  useLocation: boolean;
  customFields: string[];
  dynamicContent: Record<string, string>;
}

export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  timezone: string;
  frequency?: ScheduleFrequency;
  daysOfWeek?: number[];
  timeOfDay?: string;
  sendImmediately?: boolean;
}

export enum ScheduleFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  bounced: number;
  revenue: number;
  cost: number;
  roi: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
}

export interface CampaignUpdate {
  campaignId: string;
  field: keyof Campaign;
  oldValue: any;
  newValue: any;
  updatedBy: string;
  updatedAt: Date;
  reason?: string;
}

export interface CampaignAnalytics {
  campaignId: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  metrics: CampaignMetrics;
  segmentBreakdown: Record<string, CampaignMetrics>;
  channelBreakdown: Record<MarketingChannel, CampaignMetrics>;
  trends: {
    date: Date;
    metrics: CampaignMetrics;
  }[];
  insights: string[];
  recommendations: string[];
}
