/**
 * Customer Types
 * Type definitions for customer management and segmentation
 */

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | undefined;
  tier: CustomerTier;
  createdAt: Date;
  lastContactAt?: Date;
  segments: string[];
  preferences: CustomerPreferences;
  profile: CustomerProfile;
  behavior: CustomerBehavior;
  metadata: Record<string, any>;
}

export enum CustomerTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export interface CustomerPreferences {
  emailMarketing: boolean;
  smsMarketing: boolean;
  pushNotifications: boolean;
  frequency: ContactFrequency;
  interests: string[];
  timezone: string;
  language: string;
  unsubscribedChannels: string[];
}

export enum ContactFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

export interface CustomerProfile {
  company?: string;
  jobTitle?: string;
  industry?: string;
  location: {
    country: string;
    state?: string;
    city?: string;
    zipCode?: string;
  };
  demographics: {
    age?: number;
    gender?: string;
    income?: string;
  };
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface CustomerBehavior {
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate?: Date;
  lifetimeValue: number;
  engagementScore: number;
  churnRisk: ChurnRisk;
  preferredChannels: string[];
  activityHistory: CustomerActivity[];
}

export enum ChurnRisk {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  channel: string;
  metadata: Record<string, any>;
}

export enum ActivityType {
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  WEBSITE_VISIT = 'website_visit',
  PURCHASE = 'purchase',
  SUPPORT_TICKET = 'support_ticket',
  WEBINAR_ATTENDED = 'webinar_attended',
  CONTENT_DOWNLOADED = 'content_downloaded',
  SOCIAL_ENGAGEMENT = 'social_engagement'
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customerCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface SegmentCriteria {
  demographics?: {
    ageRange?: [number, number];
    gender?: string;
    location?: string[];
    income?: string[];
  };
  behavior?: {
    totalSpentRange?: [number, number];
    purchaseFrequency?: string;
    lastPurchaseWithin?: number; // days
    engagementScoreRange?: [number, number];
  };
  preferences?: {
    interests?: string[];
    channels?: string[];
    frequency?: ContactFrequency[];
  };
  customFields?: Record<string, any>;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  campaignId?: string;
  type: InteractionType;
  channel: string;
  content: string;
  timestamp: Date;
  response?: string;
  outcome: InteractionOutcome;
  metadata: Record<string, any>;
}

export enum InteractionType {
  EMAIL_SENT = 'email_sent',
  SMS_SENT = 'sms_sent',
  PUSH_NOTIFICATION = 'push_notification',
  SOCIAL_POST = 'social_post',
  AD_IMPRESSION = 'ad_impression',
  WEBSITE_PERSONALIZATION = 'website_personalization'
}

export enum InteractionOutcome {
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  CONVERTED = 'converted',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced',
  IGNORED = 'ignored'
}
