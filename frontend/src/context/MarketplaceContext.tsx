import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Campaign, Application, Message, UserProfile, ReportItem, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { FREE_APPLICATIONS_PER_MONTH, FREE_BUSINESS_DECISIONS_PER_MONTH } from '../config/marketplaceConfig';
import { validateMessageSafety } from '../utils/moderationList';

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

export function normalizeCampaign(data: any): Campaign {
  const rawPlatforms = data.platforms || (data.platform ? (typeof data.platform === 'string' ? data.platform.split(',').map((s: string) => s.trim()) : [data.platform]) : null);
  const platforms = Array.isArray(rawPlatforms) && rawPlatforms.length > 0 ? rawPlatforms : ['Instagram Reels'];

  return {
    id: data.id || '',
    businessId: data.businessId || data.brandId || '',
    businessName: data.businessName || data.brandName || 'Brand Partner',
    businessHandle: data.businessHandle || '@brandpartner',
    businessIsVerified: Boolean(data.businessIsVerified || data.isVerified || data.verified),
    title: data.title || 'Brand Deal Collaboration',
    category: data.category || 'Lifestyle',
    budget: typeof data.budget === 'number' && !isNaN(data.budget) ? data.budget : (typeof data.budgetInr === 'number' ? data.budgetInr : (Number(data.budget) || 100)),
    platforms,
    deadline: data.deadline || data.submissionDeadline || '',
    submissionDeadline: data.submissionDeadline || data.deadline || '',
    contentType: data.contentType || 'Reels & Stories',
    description: data.description || '',
    requirements: data.requirements || data.creatorRequirements || '',
    creatorRequirements: data.creatorRequirements || data.requirements || '',
    status: data.status || 'open',
    removed: Boolean(data.removed || data.status === 'removed'),
    isSample: Boolean(data.isSample),
    applicantsCount: typeof data.applicantsCount === 'number' ? data.applicantsCount : (data.applicationsCount || 0),
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export function normalizeCreator(data: any): UserProfile {
  return {
    id: data.id || data.userId || '',
    role: 'creator',
    activeRole: 'creator',
    lastActiveRole: 'creator',
    roles: ['creator'],
    name: data.name || data.displayName || 'Creator User',
    handle: data.handle || data.instagramHandle || (data.displayName ? `@${data.displayName.toLowerCase().replace(/\s+/g, '')}` : '@creator'),
    followers: data.followers || (data.followersCount ? `${Math.round(data.followersCount / 1000)}K` : '10K-50K'),
    niche: data.niche || 'Fashion',
    minRate: typeof data.minRate === 'number' ? data.minRate : (data.rateReelInr || 15000),
    bio: data.bio || '',
    city: data.city || 'Mumbai',
    platform: data.platform || 'Instagram Reels',
    contentType: data.contentType || 'Reels & Stories',
    isVerified: Boolean(data.isVerified || data.verified),
    verified: Boolean(data.isVerified || data.verified),
    letBrandsFindMe: data.letBrandsFindMe !== false,
    email: data.email || '',
    isSample: Boolean(data.isSample),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
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

  // 1. Fetch real campaigns & creators from Backend API
  useEffect(() => {
    setIsLoadingData(true);
    setDataError(null);

    const campParams: any = {};
    if (selectedCategory && selectedCategory !== 'All') {
      campParams.category = selectedCategory;
    }
    if (selectedPlatform && selectedPlatform !== 'All') {
      campParams.platform = selectedPlatform;
    }

    const creatorParams: any = {};
    if (selectedCategory && selectedCategory !== 'All') {
      creatorParams.niche = selectedCategory;
    }

    Promise.all([
      api.getCampaigns(campParams),
      api.getCreators(creatorParams),
    ])
      .then(([campRes, creatorRes]: [any, any]) => {
        const loadedCamps = (campRes?.content || campRes || []).map(normalizeCampaign);
        setCampaigns(loadedCamps);

        const loadedCreators = (creatorRes?.content || creatorRes || []).map(normalizeCreator);
        setCreators(loadedCreators);
      })
      .catch((err) => {
        console.warn('API getCampaigns/Creators note:', err);
        setDataError(err.message || 'Could not fetch marketplace data');
      })
      .finally(() => setIsLoadingData(false));
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
  }, [currentUser]);

  // 3. Supabase Realtime subscriptions
  useEffect(() => {
    const campaignChannel = supabase
      .channel('public:campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCampaigns((prev) => [normalizeCampaign(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCampaigns((prev) =>
              prev.map((c) => (c.id === payload.new.id ? normalizeCampaign(payload.new) : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setCampaigns((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
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
          setMessages((prev) => [...prev, newMsg]);
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
    const newId = `camp_${Date.now()}`;

    const newCampaign: Campaign = {
      ...data,
      id: newId,
      businessId: currentUid,
      businessName: userProfile.name || 'Brand Business',
      businessHandle: userProfile.handle || `@${userProfile.name?.toLowerCase().replace(/\s+/g, '') || 'brand'}`,
      businessIsVerified: Boolean(userProfile.isVerified),
      applicantsCount: 0,
      status: 'open',
      removed: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setCampaigns((prev) => [newCampaign, ...prev]);

    // Backend / Supabase sync
    try {
      const created = await api.createCampaign({
        title: data.title,
        description: data.description,
        category: data.category,
        platform: Array.isArray(data.platforms) ? data.platforms[0] : (data.platforms || 'Instagram Reels'),
        budgetInr: data.budget,
        requirements: data.requirements,
        deadline: data.deadline || '2027-12-31',
      });
      if (created) {
        setCampaigns((prev) => [normalizeCampaign(created), ...prev.filter((c) => c.id !== newId)]);
      }
    } catch {
      // Local optimistic fallback is maintained
    }
  };

  // UPDATE CAMPAIGN
  const updateCampaign = async (campaignId: string, data: Partial<Campaign>) => {
    if (!userProfile) throw new Error('You must be logged in to edit a campaign.');
    try {
      await api.updateCampaign(campaignId, {
        title: data.title,
        description: data.description,
        category: data.category,
        platform: Array.isArray(data.platforms) ? data.platforms[0] : (data.platforms || 'Instagram Reels'),
        budgetInr: data.budget,
        requirements: data.requirements,
        deadline: data.deadline,
      });
    } catch {
      // Optimistic fallback
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
      // Optimistic fallback
    }
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'removed', removed: true } : c))
    );
  };

  // RESTORE CAMPAIGN
  const restoreCampaign = async (campaignId: string) => {
    if (!userProfile) throw new Error('You must be logged in to restore a campaign.');
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
