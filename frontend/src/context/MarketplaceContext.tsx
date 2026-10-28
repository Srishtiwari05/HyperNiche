import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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

function mergeById(primary: Campaign[], extra: Campaign[]): Campaign[] {
  return extra.reduce((acc, row) => upsertById(acc, row), primary);
}

async function fetchCampaignsFromApi(params: { category?: string; platform?: string }): Promise<Campaign[]> {
  const first = await api.getCampaigns({ ...params, page: 0, size: 100 });
  const content = first?.content || (Array.isArray(first) ? first : []);
  let rows = content.map(normalizeCampaign);
  const totalPages = Math.min(Number(first?.totalPages) || 1, 20);
  for (let page = 1; page < totalPages; page++) {
    const next = await api.getCampaigns({ ...params, page, size: 100 });
    rows = rows.concat((next?.content || []).map(normalizeCampaign));
  }
  return rows;
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
  const filtersRef = useRef({ selectedCategory, selectedPlatform });
  filtersRef.current = { selectedCategory, selectedPlatform };

  const loadMarketplace = async (showSpinner = true) => {
    const { selectedCategory: category, selectedPlatform: platform } = filtersRef.current;
    const campParams: { category?: string; platform?: string } = {};
    if (category && category !== 'All') campParams.category = category;
    if (platform && platform !== 'All') campParams.platform = platform;
    const creatorParams: { niche?: string; size?: number } = { size: 100 };
    if (category && category !== 'All') creatorParams.niche = category;

    if (showSpinner) {
      setIsLoadingData(true);
      setDataError(null);
    }

    const apiCamps = await fetchCampaignsFromApi(campParams).catch(() => [] as Campaign[]);
    const sbCamps = await fetchCampaignsFromSupabase().catch(() => [] as Campaign[]);
    const merged = mergeById(apiCamps, sbCamps);
    setCampaigns(merged);

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
    void loadMarketplace(true);
  }, [selectedCategory, selectedPlatform]);

  // 2. Fetch authenticated user applications and conversations
  useEffect(() => {
    if (!currentUser) return;

    api.getMyApplications()
      .then((res: any[]) => {
        if (Array.isArray(res)) {
          setApplications(res.map((a: any) => ({
            id: a.id,
            campaignId: a.campaignId,
            campaignTitle: a.campaignTitle,
            businessId: a.brandId || '',
            creatorId: a.creatorId,
            creatorName: a.creatorName || 'Creator',
            creatorHandle: `@${(a.creatorName || 'creator').toLowerCase().replace(/\s+/g, '')}`,
            creatorFollowers: '10K-50K',
            creatorNiche: 'Lifestyle',
            creatorIsVerified: true,
            pitch: a.pitch,
            proposedRate: a.proposedRateInr,
            status: (a.status || 'pending').toLowerCase(),
            createdAt: a.createdAt || new Date().toISOString(),
            updatedAt: a.updatedAt || a.createdAt || new Date().toISOString(),
          })));
        }
      })
      .catch((err) => console.warn('API getMyApplications note:', err));

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

    api.getMyCampaigns()
      .then((mine: any) => {
        const list = Array.isArray(mine) ? mine : (mine?.content || []);
        if (list.length) {
          setCampaigns((prev) => list.reduce((acc: Campaign[], row: any) => upsertById(acc, normalizeCampaign(row)), prev));
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // 3. Supabase Realtime subscriptions
  useEffect(() => {
    const campaignChannel = supabase
      .channel('public:campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setCampaigns((prev) => prev.filter((c) => c.id !== payload.old.id));
            return;
          }
          setCampaigns((prev) => upsertById(prev, normalizeCampaign(payload.new)));
          void fetchCampaignsFromSupabase()
            .then((rows) => setCampaigns((prev) => mergeById(prev, rows)))
            .catch(() => {});
        }
      )
      .subscribe();

    const messageChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const newMsg: Message = {
            id: payload.new.id,
            conversationId: payload.new.conversation_id,
            campaignId: '',
            businessId: '',
            creatorId: '',
            senderId: payload.new.sender_id,
            receiverId: '',
            senderName: 'User',
            senderRole: 'creator',
            text: payload.new.message_text,
            createdAt: payload.new.created_at || new Date().toISOString(),
            read: payload.new.is_read || false,
          };
          setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(campaignChannel);
      supabase.removeChannel(messageChannel);
    };
  }, []);

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

    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      platform: platformValue,
      budgetInr: data.budget,
      requirements: data.requirements,
      deadline: isoDeadline,
      imageUrl: data.imageUrl || null,
      contentType: data.contentType || null,
    };

    await supabase.from('users').upsert({
      id: currentUid,
      email: userProfile.email,
      role: 'BRAND',
      display_name: userProfile.name,
      avatar_url: userProfile.avatarUrl || null,
    });

    let created: any = null;
    let apiErr: any = null;
    try {
      created = await api.createCampaign(payload);
    } catch (err) {
      apiErr = err;
    }

    const { data: sbRow, error: sbErr } = await supabase
      .from('campaigns')
      .upsert(toCampaignRow(currentUid, { ...data, deadline: isoDeadline, platform: platformValue }, created?.id))
      .select()
      .maybeSingle();

    if (sbRow || created) {
      setCampaigns((prev) =>
        upsertById(
          prev,
          normalizeCampaign({
            ...data,
            ...created,
            ...sbRow,
            businessName: userProfile.name,
            businessHandle: userProfile.handle,
            businessId: currentUid,
            contentType: data.contentType,
            imageUrl: data.imageUrl || created?.imageUrl,
          })
        )
      );
      return;
    }

    throw new Error(apiErr?.message || sbErr?.message || 'Could not publish campaign. Please try again.');
  };

  // UPDATE CAMPAIGN
  const updateCampaign = async (campaignId: string, data: Partial<Campaign>) => {
    if (!userProfile) throw new Error('You must be logged in to edit a campaign.');
    try {
      await api.updateCampaign(campaignId, {
        title: data.title,
        description: data.description,
        category: data.category,
        platform: Array.isArray(data.platforms) ? data.platforms.join(', ') : (data.platforms || 'Instagram Reels'),
        budgetInr: data.budget,
        requirements: data.requirements,
        deadline: toIsoDate(data.deadline),
        imageUrl: data.imageUrl,
        contentType: data.contentType,
      });
    } catch {
      // still persist on Supabase so other accounts keep the edit
    }
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
      await supabase.from('campaigns').update(patch).eq('id', campaignId);
    }
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
    );
  };

  // REMOVE CAMPAIGN
  const removeCampaign = async (campaignId: string) => {
    if (!userProfile) throw new Error('You must be logged in to remove a campaign.');
    try {
      await api.deleteCampaign(campaignId);
    } catch {
      // still hide locally and in Supabase
    }
    await supabase.from('campaigns').update({ status: 'removed' }).eq('id', campaignId);
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'removed', removed: true } : c))
    );
  };

  // RESTORE CAMPAIGN
  const restoreCampaign = async (campaignId: string) => {
    if (!userProfile) throw new Error('You must be logged in to restore a campaign.');
    await supabase.from('campaigns').update({ status: 'ACTIVE' }).eq('id', campaignId);
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

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus, decidedAt: nowIso, updatedAt: nowIso } : a))
    );

    if (newStatus === 'accepted' && targetApp) {
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
      await api.updateApplicationStatus(applicationId, newStatus.toUpperCase());
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
