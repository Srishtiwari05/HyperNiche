import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Campaign, Application, Message, UserProfile, ReportItem, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { FREE_APPLICATIONS_PER_MONTH, FREE_BUSINESS_DECISIONS_PER_MONTH } from '../config/marketplaceConfig';
import { validateMessageSafety } from '../utils/moderationList';
import { toIsoDate } from '../lib/utils';

export interface ActiveConversation {
  campaignId: string;
  campaignTitle?: string;
  creatorId: string;
  businessId: string;
  peerName: string;
  peerHandle?: string;
  applicationId?: string;
  isInvitation?: boolean;
}

function pick(data: any, ...keys: string[]) {
  for (const key of keys) {
    if (data?.[key] !== undefined && data?.[key] !== null && data?.[key] !== '') {
      return data[key];
    }
  }
  return undefined;
}

function mapCampaignStatus(raw: string | undefined): Campaign['status'] {
  const value = String(raw || 'ACTIVE').toLowerCase();
  if (value === 'active' || value === 'open') return 'open';
  if (value === 'completed' || value === 'closed' || value === 'paused') return 'closed';
  if (value === 'removed') return 'removed';
  return 'open';
}

export function normalizeCampaign(data: any): Campaign {
  const rawPlatforms = data.platforms || (data.platform ? (typeof data.platform === 'string' ? data.platform.split(',').map((s: string) => s.trim()) : [data.platform]) : null);
  const platforms = Array.isArray(rawPlatforms) && rawPlatforms.length > 0 ? rawPlatforms : ['Instagram Reels'];
  const budgetRaw = pick(data, 'budget', 'budgetInr', 'budget_inr');
  const status = mapCampaignStatus(pick(data, 'status'));

  return {
    id: String(pick(data, 'id') || ''),
    businessId: String(pick(data, 'businessId', 'brandId', 'brand_id', 'business_id') || ''),
    businessName: pick(data, 'businessName', 'brandName', 'business_name', 'brand_name') || 'Brand Partner',
    businessHandle: pick(data, 'businessHandle', 'business_handle') || '@brandpartner',
    businessIsVerified: Boolean(pick(data, 'businessIsVerified', 'isVerified', 'verified')),
    title: pick(data, 'title') || 'Brand Deal Collaboration',
    category: pick(data, 'category') || 'Lifestyle',
    budget: typeof budgetRaw === 'number' && !isNaN(budgetRaw) ? budgetRaw : Number(budgetRaw) || 100,
    budgetInr: typeof budgetRaw === 'number' ? budgetRaw : Number(budgetRaw) || 100,
    brandId: pick(data, 'brandId', 'brand_id', 'businessId'),
    brandName: pick(data, 'brandName', 'brand_name', 'businessName'),
    brandAvatar: pick(data, 'brandAvatar', 'brand_avatar'),
    platforms,
    platform: platforms.join(', '),
    deadline: String(pick(data, 'deadline', 'submissionDeadline', 'submission_deadline') || ''),
    submissionDeadline: String(pick(data, 'submissionDeadline', 'deadline') || ''),
    contentType: pick(data, 'contentType', 'content_type') || 'Reels & Stories',
    description: pick(data, 'description') || '',
    requirements: pick(data, 'requirements', 'creatorRequirements', 'creator_requirements') || '',
    creatorRequirements: pick(data, 'creatorRequirements', 'requirements') || '',
    status,
    removed: Boolean(data.removed || status === 'removed'),
    isSample: Boolean(data.isSample),
    applicantsCount: typeof data.applicantsCount === 'number' ? data.applicantsCount : (data.applicationsCount || data.applications_count || 0),
    applicationsCount: data.applicationsCount || data.applications_count || 0,
    createdAt: String(pick(data, 'createdAt', 'created_at') || new Date().toISOString()),
    imageUrl: pick(data, 'imageUrl', 'image_url') || '',
  };
}

function upsertById<T extends { id: string }>(prev: T[], item: T): T[] {
  if (!item.id) return prev;
  const idx = prev.findIndex((row) => row.id === item.id);
  if (idx === -1) return [item, ...prev];
  const next = [...prev];
  next[idx] = { ...prev[idx], ...item };
  return next;
}

function mapApplicationFromApi(data: any): Application {
  const creatorName = data.creatorName || data.creator?.displayName || 'Creator';
  const creatorHandle = data.creatorHandle || (creatorName ? `@${creatorName.toLowerCase().replace(/\s+/g, '')}` : '@creator');

  return {
    id: data.id,
    campaignId: data.campaignId,
    campaignTitle: data.campaignTitle || 'Campaign',
    businessId: data.brandId || data.businessId || '',
    creatorId: data.creatorId,
    creatorName,
    creatorHandle,
    creatorFollowers: data.creatorFollowers || '10K-50K',
    creatorNiche: data.creatorNiche || 'Lifestyle',
    creatorAvatar: data.creatorAvatar || data.creator?.avatarUrl,
    creatorIsVerified: Boolean(data.creatorIsVerified ?? data.creator?.isVerified),
    pitch: data.pitch || '',
    proposedRate: Number(data.proposedRateInr ?? data.proposedRate ?? 0),
    proposedRateInr: Number(data.proposedRateInr ?? data.proposedRate ?? 0),
    status: (data.status || 'pending').toLowerCase(),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
  };
}

async function fetchCampaignsFromSupabase(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, users:brand_id(display_name, avatar_url, email)')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) {
    const fallback = await supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(1000);
    if (fallback.error) throw fallback.error;
    return (fallback.data || []).map(normalizeCampaign);
  }
  return (data || []).map((row: any) =>
    normalizeCampaign({
      ...row,
      brandName: row.users?.display_name,
      businessName: row.users?.display_name,
      brandAvatar: row.users?.avatar_url,
    })
  );
}

function toCampaignRow(uid: string, data: Partial<Campaign>, id?: string) {
  const row: Record<string, unknown> = {
    brand_id: uid,
    title: data.title,
    description: data.description,
    category: data.category,
    platform: Array.isArray(data.platforms) ? data.platforms.join(', ') : (data.platform || 'Instagram Reels'),
    budget_inr: data.budget,
    requirements: data.requirements || '',
    deadline: toIsoDate(data.deadline) || toIsoDate(data.submissionDeadline) || null,
    status: 'ACTIVE',
    image_url: data.imageUrl || null,
    content_type: data.contentType || null,
  };
  if (id) row.id = id;
  return row;
}

export function normalizeCreator(data: any): UserProfile {
  return {
    id: String(pick(data, 'id', 'userId', 'user_id') || ''),
    role: 'creator',
    activeRole: 'creator',
    lastActiveRole: 'creator',
    roles: ['creator'],
    name: pick(data, 'name', 'displayName', 'display_name') || 'Creator User',
    handle: pick(data, 'handle', 'instagramHandle', 'instagram_handle') || (data.displayName ? `@${data.displayName.toLowerCase().replace(/\s+/g, '')}` : '@creator'),
    followers: data.followers || (data.followersCount ? `${Math.round(data.followersCount / 1000)}K` : '10K-50K'),
    niche: pick(data, 'niche') || 'Fashion',
    minRate: typeof data.minRate === 'number' ? data.minRate : (data.rateReelInr || 15000),
    bio: pick(data, 'bio') || '',
    city: pick(data, 'city') || 'Mumbai',
    platform: pick(data, 'platform') || 'Instagram Reels',
    contentType: pick(data, 'contentType', 'content_type') || 'Reels & Stories',
    isVerified: Boolean(pick(data, 'isVerified', 'verified', 'is_verified')),
    verified: Boolean(pick(data, 'isVerified', 'verified', 'is_verified')),
    letBrandsFindMe: data.letBrandsFindMe !== false,
    email: pick(data, 'email') || '',
    avatarUrl: pick(data, 'avatarUrl', 'avatar_url') || '',
    isSample: Boolean(data.isSample),
    createdAt: String(pick(data, 'createdAt', 'created_at') || new Date().toISOString()),
    updatedAt: String(pick(data, 'updatedAt', 'updated_at') || new Date().toISOString()),
  };
}

export interface MarketplaceContextType {
  campaigns: Campaign[];
  creators: UserProfile[];
  applications: Application[];
  messages: Message[];
  isLoadingData: boolean;
  dataError: string | null;
  createCampaign: (data: Omit<Campaign, 'id' | 'businessId' | 'businessName' | 'businessHandle' | 'applicantsCount' | 'createdAt'>) => Promise<void>;
  updateCampaign: (campaignId: string, data: Partial<Campaign>) => Promise<void>;
  removeCampaign: (campaignId: string) => Promise<void>;
  restoreCampaign: (campaignId: string) => Promise<void>;
  applyToCampaign: (campaign: Campaign, pitch: string, proposedRate: number, paymentId?: string, options?: { isBoosted?: boolean }) => Promise<void>;
  getApplicationUsageStats: (creatorId?: string) => { usedThisMonth: number; freeLimit: number; freeLeft: number; paidExtras: number };
  getBusinessDecisionStats: (businessId?: string) => { usedThisMonth: number; freeLimit: number; freeLeft: number; hasFreeLeft: boolean };
  submitReport: (reportedUserId: string, reportedUserName: string, messageId: string, messageText: string, conversationId: string, reason?: string) => Promise<void>;
  recordAbuseStrike: (userId: string) => Promise<{ strikesCount: number; isMuted: boolean; isFlagged: boolean; mutedUntil?: string }>;
  updateApplicationStatus: (applicationId: string, newStatus: 'accepted' | 'rejected') => Promise<void>;
  sendMessage: (campaignId: string, creatorId: string, businessId: string, text: string, explicitReceiverId?: string, isInvitation?: boolean) => Promise<void>;
  markConversationAsRead: (conversationId: string) => void;
  activeConversation: ActiveConversation | null;
  setActiveConversation: (conv: ActiveConversation | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (p: string) => void;
  selectedFollowers: string;
  setSelectedFollowers: (f: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, isLoading: isAuthLoading } = useAuth();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creators, setCreators] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedFollowers, setSelectedFollowers] = useState('All');
  const loadMarketplace = async (showSpinner = true) => {
    const creatorParams: { niche?: string; size?: number } = { size: 100 };
    if (selectedCategory && selectedCategory !== 'All') creatorParams.niche = selectedCategory;

    if (showSpinner) {
      setIsLoadingData(true);
      setDataError(null);
    }

    try {
      setCampaigns(await fetchCampaignsFromSupabase());
    } catch {
      setCampaigns([]);
    }

    try {
      const creatorRes: any = await api.getCreators(creatorParams);
      setCreators((creatorRes?.content || creatorRes || []).map(normalizeCreator));
    } catch {
      const { data } = await supabase.from('creator_profiles').select('*, users(*)').limit(200);
      if (Array.isArray(data)) {
        setCreators(data.map((row: any) => normalizeCreator({ ...row.users, ...row })));
      }
    }

    setIsLoadingData(false);
  };

  useEffect(() => {
    if (isAuthLoading) return;
    void loadMarketplace(true);
  }, [selectedCategory, currentUser?.id, isAuthLoading]);

  // 2. Fetch authenticated user applications and conversations
  useEffect(() => {
    if (!currentUser) return;

    const isBrand = userProfile?.role === 'business' || userProfile?.role === 'BRAND';

    if (isBrand) {
      api.getBrandApplications()
        .then((res: any[]) => {
          if (Array.isArray(res)) {
            setApplications(res.map(mapApplicationFromApi));
          }
        })
        .catch((err) => console.warn('API getBrandApplications note:', err));
    } else {
      api.getMyApplications()
        .then((res: any[]) => {
          if (Array.isArray(res)) {
            setApplications(res.map(mapApplicationFromApi));
          }
        })
        .catch((err) => console.warn('API getMyApplications note:', err));
    }

    api.getConversations()
      .then((convs: any[]) => {
        if (Array.isArray(convs)) {
          convs.forEach((c: any) => {
            if (c.id) {
              api.getMessages(c.id).then((msgs: any[]) => {
                if (Array.isArray(msgs) && msgs.length > 0) {
                  setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    const newOnes = msgs
                      .filter((m: any) => !existingIds.has(m.id))
                      .map((m: any) => ({
                        id: m.id,
                        conversationId: m.conversationId || c.id,
                        campaignId: c.campaignId || '',
                        campaignTitle: c.campaignTitle || '',
                        businessId: c.brandId || '',
                        creatorId: c.creatorId || '',
                        senderId: m.senderId,
                        receiverId: m.senderId === c.brandId ? c.creatorId : c.brandId,
                        senderName: m.senderName || 'User',
                        senderRole: (m.senderId === c.brandId ? 'business' : 'creator') as UserRole,
                        text: m.messageText,
                        createdAt: m.createdAt,
                        read: m.isRead || false,
                      }));
                    return [...prev, ...newOnes];
                  });
                }
              }).catch(() => {});
            }
          });
        }
      })
      .catch((err) => console.warn('API getConversations note:', err));

  }, [currentUser, userProfile?.role]);

  // 3. Supabase Realtime subscriptions
  useEffect(() => {
    if (isAuthLoading) return;

    const campaignChannel = supabase
      .channel('public:campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            setCampaigns((prev) => prev.filter((c) => c.id !== payload.old.id));
            return;
          }

          const nextRow = payload.new as Record<string, any> | undefined;
          if (nextRow) {
            setCampaigns((prev) => upsertById(prev, normalizeCampaign(nextRow)));
          }
          await loadMarketplace(false).catch(() => {});
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void loadMarketplace(false);
      });

    const messageChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const row = payload?.new;
          if (!row?.id) return;

          const nextMsg: Message = {
            id: row.id,
            conversationId: row.conversation_id || '',
            campaignId: row.campaign_id || '',
            campaignTitle: row.campaign_title || '',
            businessId: row.business_id || '',
            creatorId: row.creator_id || '',
            senderId: row.sender_id || '',
            receiverId: row.receiver_id || '',
            senderName: row.sender_name || 'User',
            senderRole: row.sender_role || 'creator',
            text: row.message_text || row.text || '',
            createdAt: row.created_at || new Date().toISOString(),
            read: Boolean(row.is_read),
          };

          setMessages((prev) => (
            prev.some((m) => m.id === nextMsg.id) ? prev : [...prev, nextMsg]
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(campaignChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [currentUser?.id, isAuthLoading]);

  // CREATE CAMPAIGN
  const createCampaign = async (
    data: Omit<Campaign, 'id' | 'businessId' | 'businessName' | 'businessHandle' | 'applicantsCount' | 'createdAt'>
  ) => {
    if (!userProfile) throw new Error('You must be logged in to post a campaign.');

    const currentUid = currentUser?.id || userProfile.id;
    const isoDeadline = toIsoDate(data.deadline) || toIsoDate(data.submissionDeadline) || '2027-12-31';
    const platformValue = Array.isArray(data.platforms)
      ? data.platforms.join(', ')
      : (data.platforms || data.platform || 'Instagram Reels');

    const { error: profileError } = await supabase.from('users').upsert({
      id: currentUid,
      email: userProfile.email,
      role: 'BRAND',
      display_name: userProfile.name,
      avatar_url: userProfile.avatarUrl || null,
    });
    if (profileError) throw profileError;

    const { data: sbRow, error: sbErr } = await supabase
      .from('campaigns')
      .insert(toCampaignRow(currentUid, { ...data, deadline: isoDeadline, platform: platformValue }))
      .select()
      .single();
    if (sbErr) throw sbErr;
    setCampaigns((prev) => upsertById(prev, normalizeCampaign({
      ...sbRow,
      businessName: userProfile.name,
      businessHandle: userProfile.handle,
      businessId: currentUid,
    })));
  };

  // UPDATE CAMPAIGN
  const updateCampaign = async (campaignId: string, data: Partial<Campaign>) => {
    if (!userProfile) throw new Error('You must be logged in to edit a campaign.');
    const patch: Record<string, unknown> = {};
    if (data.title) patch.title = data.title;
    if (data.description) patch.description = data.description;
    if (data.category) patch.category = data.category;
    if (data.platforms || data.platform) {
      patch.platform = Array.isArray(data.platforms) ? data.platforms.join(', ') : data.platform;
    }
    if (data.budget != null) patch.budget_inr = data.budget;
    if (data.requirements != null) patch.requirements = data.requirements;
    if (data.deadline) patch.deadline = toIsoDate(data.deadline);
    if (data.imageUrl) patch.image_url = data.imageUrl;
    if (data.contentType) patch.content_type = data.contentType;
    if (Object.keys(patch).length) {
      const { error } = await supabase.from('campaigns').update(patch).eq('id', campaignId);
      if (error) throw error;
    }
    await loadMarketplace(false).catch(() => {});
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
    );
  };

  // REMOVE CAMPAIGN
  const removeCampaign = async (campaignId: string) => {
    if (!userProfile) throw new Error('You must be logged in to remove a campaign.');
    const { error } = await supabase.from('campaigns').update({ status: 'removed' }).eq('id', campaignId);
    if (error) throw error;
    await loadMarketplace(false).catch(() => {});
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'removed', removed: true } : c))
    );
  };

  // RESTORE CAMPAIGN
  const restoreCampaign = async (campaignId: string) => {
    if (!userProfile) throw new Error('You must be logged in to restore a campaign.');
    const { error } = await supabase.from('campaigns').update({ status: 'ACTIVE' }).eq('id', campaignId);
    if (error) throw error;
    await loadMarketplace(false).catch(() => {});
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'open', removed: false } : c))
    );
  };

  // APPLICATION USAGE STATS
  const getApplicationUsageStats = (creatorId?: string) => {
    const cid = creatorId || userProfile?.id;
    if (!cid) {
      return {
        usedThisMonth: 0,
        freeLimit: FREE_APPLICATIONS_PER_MONTH,
        freeLeft: FREE_APPLICATIONS_PER_MONTH,
        paidExtras: 0,
      };
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const thisMonthApps = applications.filter((app) => {
      if (app.creatorId !== cid) return false;
      const appDate = new Date(app.createdAt);
      return appDate.getFullYear() === currentYear && appDate.getMonth() === currentMonth;
    });

    const usedThisMonth = thisMonthApps.length;
    const freeLimit = FREE_APPLICATIONS_PER_MONTH;
    const freeLeft = Math.max(0, freeLimit - usedThisMonth);
    const paidExtras = Math.max(0, usedThisMonth - freeLimit);

    return {
      usedThisMonth,
      freeLimit,
      freeLeft,
      paidExtras,
    };
  };

  // BUSINESS DECISION STATS
  const getBusinessDecisionStats = (businessId?: string) => {
    const bid = businessId || userProfile?.id;
    if (!bid) {
      return {
        usedThisMonth: 0,
        freeLimit: FREE_BUSINESS_DECISIONS_PER_MONTH,
        freeLeft: FREE_BUSINESS_DECISIONS_PER_MONTH,
        hasFreeLeft: true,
      };
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const thisMonthDecisions = applications.filter((app) => {
      if (app.businessId !== bid) return false;
      if (app.status !== 'accepted' && app.status !== 'rejected') return false;
      const decisionDateStr = app.decidedAt || app.updatedAt || app.createdAt;
      const decisionDate = new Date(decisionDateStr);
      return decisionDate.getFullYear() === currentYear && decisionDate.getMonth() === currentMonth;
    });

    const currentMonthKey = `${currentYear}-${currentMonth + 1}`;
    let usedThisMonth = 0;
    if (userProfile && (userProfile.id === bid || !businessId)) {
      if (userProfile.monthlyDecisionsMonth === currentMonthKey) {
        usedThisMonth = userProfile.monthlyDecisionsUsed || 0;
      }
    }
    usedThisMonth = Math.max(usedThisMonth, thisMonthDecisions.length);
    const freeLimit = FREE_BUSINESS_DECISIONS_PER_MONTH;
    const freeLeft = Math.max(0, freeLimit - usedThisMonth);

    return {
      usedThisMonth,
      freeLimit,
      freeLeft,
      hasFreeLeft: freeLeft > 0,
    };
  };

  // RECORD ABUSE STRIKE
  const recordAbuseStrike = async (userId: string) => {
    const currentStrikes = (userProfile?.strikesCount || 0) + 1;
    let chatMutedUntil: string | undefined = undefined;
    let accountFlaggedForReview = false;

    if (currentStrikes >= 2) {
      chatMutedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    if (currentStrikes >= 3) {
      accountFlaggedForReview = true;
    }

    return {
      strikesCount: currentStrikes,
      isMuted: Boolean(chatMutedUntil),
      isFlagged: accountFlaggedForReview,
      mutedUntil: chatMutedUntil,
    };
  };

  // SUBMIT REPORT
  const submitReport = async (
    reportedUserId: string,
    reportedUserName: string,
    messageId: string,
    messageText: string,
    conversationId: string,
    reason?: string
  ) => {
    if (!userProfile) throw new Error('You must be logged in to report a message.');
    console.log('Report submitted:', { reportedUserId, reportedUserName, messageId, messageText, conversationId, reason });
  };

  // APPLY TO CAMPAIGN
  const applyToCampaign = async (
    campaign: Campaign,
    pitch: string,
    proposedRate: number,
    paymentId?: string,
    options?: { isBoosted?: boolean }
  ) => {
    if (!userProfile) throw new Error('You must be logged in to apply.');

    const safetyResult = validateMessageSafety(pitch);
    if (!safetyResult.allowed) {
      throw new Error(
        safetyResult.warningMessage || "This message can't be sent. Don't share personal contact details or use abusive language."
      );
    }

    const currentUid = currentUser?.id || userProfile.id;
    const isCreatorVerified = Boolean(userProfile.isVerified);
    const usage = getApplicationUsageStats(currentUid);
    const requiresPayment = !isCreatorVerified && usage.freeLeft <= 0;
    if (requiresPayment && !paymentId) {
      throw new Error('You have used your free application this month. Payment of ₹9 is required.');
    }

    let realApp: any = null;
    try {
      realApp = await api.applyToCampaign({
        campaignId: campaign.id,
        pitch: pitch.trim(),
        proposedRateInr: proposedRate,
      });
    } catch {
      // optimistic fallback
    }

    const appId = realApp?.id || `app_${Date.now()}`;
    const newApp: Application = {
      id: appId,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      businessId: campaign.businessId,
      creatorId: currentUid,
      creatorName: userProfile.name || 'Creator',
      creatorHandle: userProfile.handle || '@creator',
      creatorFollowers: userProfile.followers || '10K-50K',
      creatorNiche: userProfile.niche || campaign.category || 'Lifestyle',
      creatorIsVerified: isCreatorVerified,
      pitch: pitch.trim(),
      proposedRate,
      status: 'pending',
      isFreeApplication: isCreatorVerified ? false : (!requiresPayment && !paymentId),
      paymentId: paymentId || undefined,
      isPaidExtra: Boolean(requiresPayment || paymentId),
      isBoosted: Boolean(options?.isBoosted),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setApplications((prev) => [newApp, ...prev]);
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaign.id ? { ...c, applicantsCount: (c.applicantsCount || 0) + 1 } : c))
    );
  };

  // UPDATE APPLICATION STATUS
  const updateApplicationStatus = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    const targetApp = applications.find((a) => a.id === applicationId);
    const businessId = targetApp?.businessId || userProfile?.id;
    if (!businessId) throw new Error('Business identifier missing');

    const nowIso = new Date().toISOString();
    const normalizedStatus = newStatus === 'accepted' ? 'accepted' : 'rejected';

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: normalizedStatus, decidedAt: nowIso, updatedAt: nowIso } : a))
    );

    if (normalizedStatus === 'accepted' && targetApp) {
      const convId = `${targetApp.campaignId}_${targetApp.creatorId}`;
      const hasExistingMsg = messages.some((m) => m.conversationId === convId);

      if (!hasExistingMsg) {
        const welcomeMsg: Message = {
          id: `msg_${Date.now()}`,
          conversationId: convId,
          campaignId: targetApp.campaignId,
          campaignTitle: targetApp.campaignTitle,
          businessId: targetApp.businessId,
          creatorId: targetApp.creatorId,
          senderId: businessId,
          receiverId: targetApp.creatorId,
          senderName: userProfile?.name || 'Brand Partner',
          senderRole: 'business',
          text: `Deal accepted! Welcome to the "${targetApp.campaignTitle}" campaign. Let's discuss deliverables, sample shipping addresses, and content concepts here.`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        setMessages((prev) => [...prev, welcomeMsg]);
      }
    }

    try {
      await api.updateApplicationStatus(applicationId, normalizedStatus.toUpperCase());
      setApplications((prev) => prev.map((a) => {
        if (a.id !== applicationId) return a;
        return { ...a, status: normalizedStatus, decidedAt: nowIso, updatedAt: nowIso };
      }));
    } catch {
      // ignore
    }
  };

  // SEND MESSAGE
  const sendMessage = async (
    campaignId: string,
    creatorId: string,
    businessId: string,
    text: string,
    explicitReceiverId?: string,
    isInvitation?: boolean
  ) => {
    if (!userProfile || !text.trim()) return;

    if (userProfile.chatMutedUntil && new Date(userProfile.chatMutedUntil).getTime() > Date.now()) {
      const muteRemainingHours = Math.ceil(
        (new Date(userProfile.chatMutedUntil).getTime() - Date.now()) / (1000 * 60 * 60)
      );
      throw new Error(`Your chat is currently muted for ${muteRemainingHours}h due to safety policy violations.`);
    }

    const safetyResult = validateMessageSafety(text);
    if (!safetyResult.allowed) {
      if (safetyResult.reason === 'abuse') {
        await recordAbuseStrike(userProfile.id);
      }
      throw new Error(
        safetyResult.warningMessage || "This message can't be sent. Don't share personal contact details or use abusive language."
      );
    }

    const currentUid = currentUser?.id || userProfile.id;
    const conversationId = `${campaignId}_${creatorId}`;
    const camp = campaigns.find((c) => c.id === campaignId);
    const campaignTitle = camp?.title || 'Brand Deal Campaign';
    const receiverId = explicitReceiverId || (currentUid === businessId ? creatorId : businessId);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      campaignId,
      campaignTitle,
      businessId,
      creatorId,
      senderId: currentUid,
      receiverId,
      senderName: userProfile.name || 'User',
      senderRole: userProfile.role,
      senderIsVerified: Boolean(userProfile.isVerified),
      text: text.trim(),
      isInvitation: Boolean(isInvitation),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Sync to real backend & Supabase
    try {
      await api.sendMessage({
        campaignId: campaignId.includes('_') ? null : campaignId,
        recipientId: receiverId.includes('_') ? null : receiverId,
        messageText: text.trim(),
      });
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUid,
        message_text: text.trim(),
      });
    } catch {
      // optimistic update maintained
    }
  };

  const markConversationAsRead = (conversationId: string) => {
    const currentUid = currentUser?.id || userProfile?.id;
    if (!currentUid) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.conversationId === conversationId && m.receiverId === currentUid ? { ...m, read: true } : m
      )
    );
  };

  return (
    <MarketplaceContext.Provider
      value={{
        campaigns,
        creators,
        applications,
        messages,
        isLoadingData,
        dataError,
        createCampaign,
        updateCampaign,
        removeCampaign,
        restoreCampaign,
        applyToCampaign,
        getApplicationUsageStats,
        getBusinessDecisionStats,
        submitReport,
        recordAbuseStrike,
        updateApplicationStatus,
        sendMessage,
        markConversationAsRead,
        activeConversation,
        setActiveConversation,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedPlatform,
        setSelectedPlatform,
        selectedFollowers,
        setSelectedFollowers,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
