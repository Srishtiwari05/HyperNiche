export type UserRole = 'business' | 'creator' | 'CREATOR' | 'BRAND' | 'ADMIN';

export interface CreatorRoleData {
  handle: string;
  followers: string;
  niche: string;
  name?: string;
  bio?: string;
  minRate?: number;
  portfolio?: string;
  platform?: string;
  contentType?: string;
  city?: string;
  letBrandsFindMe?: boolean;
}

export interface BusinessRoleData {
  name: string;
  handle?: string;
  websiteOrInstagram: string;
  whatYouSell: string;
  bio?: string;
  city?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface CreatorProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  niche?: string;
  instagramHandle?: string;
  youtubeHandle?: string;
  tiktokHandle?: string;
  twitterHandle?: string;
  websiteUrl?: string;
  followersCount: number;
  avgViews: number;
  engagementRate: number;
  rateReelInr: number;
  ratePostInr: number;
  rateStoryInr: number;
  rateVideoInr: number;
  isVerified: boolean;
  verificationPaid: boolean;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  handle: string;
  followers?: string;
  niche?: string;
  websiteOrInstagram?: string;
  whatYouSell?: string;
  bio?: string;
  minRate?: number;
  portfolio?: string;
  platform?: string;
  contentType?: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  verified?: boolean;
  letBrandsFindMe?: boolean;

  avatarUrl?: string;
  coverUrl?: string;
  coverStyle?: string; // Preset gradient 1 to 6
  isSample?: boolean;

  // Dual role profiles
  hasCreatorProfile?: boolean;
  hasBusinessProfile?: boolean;
  creatorProfile?: CreatorRoleData;
  businessProfile?: BusinessRoleData;
  lastActiveRole?: UserRole;
  activeRole?: UserRole;
  roles?: string[];
  // Moderation & strikes
  strikesCount?: number;
  chatMutedUntil?: string;
  accountFlaggedForReview?: boolean;
  // Business monthly decisions tracking (1 free per month for unverified)
  monthlyDecisionsUsed?: number;
  monthlyDecisionsMonth?: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  businessName: string;
  businessHandle: string;
  businessIsVerified?: boolean;
  title: string;
  category: string;
  budget: number; // in INR
  budgetInr?: number;
  brandId?: string;
  brandName?: string;
  brandAvatar?: string;
  platforms: string[]; // multi-platform array e.g. ['Instagram Reels', 'YouTube Shorts']
  platform?: string; // legacy fallback
  deadline: string;
  submissionDeadline?: string; // alias
  contentType: string; // e.g. 1x 60s Reel, 2x Stories
  description: string;
  requirements?: string;
  creatorRequirements?: string;
  status: 'open' | 'closed' | 'removed' | 'DRAFT' | 'ACTIVE' | 'IN_REVIEW' | 'PAUSED' | 'COMPLETED' | string;
  removed?: boolean;
  isSample?: boolean;
  applicantsCount: number;
  applicationsCount?: number;
  createdAt: string;
  imageUrl?: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

export interface Application {
  id: string;
  campaignId: string;
  campaignTitle: string;
  businessId: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorFollowers: string;
  creatorNiche: string;
  creatorAvatar?: string;
  creatorIsVerified?: boolean;
  pitch: string;
  proposedRate: number; // in INR
  proposedRateInr?: number;
  status: ApplicationStatus;
  isInvitation?: boolean;
  isFreeApplication?: boolean; // Whether this was the creator's free monthly application
  paymentId?: string; // Stored if paid application (beyond free quota)
  isPaidExtra?: boolean;
  isBoosted?: boolean; // Future paid "Boost my application" placeholder
  createdAt: string;
  updatedAt?: string;
  decidedAt?: string;
}

export interface Conversation {
  id: string;
  brandId: string;
  brandName: string;
  brandAvatar?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  campaignId?: string;
  campaignTitle?: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  campaignId: string;
  campaignTitle?: string;
  businessId: string;
  creatorId: string;
  senderId: string;
  receiverId?: string;
  senderName: string;
  senderRole?: UserRole;
  senderAvatar?: string;
  senderIsVerified?: boolean;
  text?: string;
  messageText?: string;
  isRead?: boolean;
  isInvitation?: boolean;
  createdAt: string;
  read?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  bgPastel: string; // pastel color class or hex
  darkBg: string;
  iconName: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  messageId: string;
  messageText: string;
  conversationId: string;
  reason?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}
