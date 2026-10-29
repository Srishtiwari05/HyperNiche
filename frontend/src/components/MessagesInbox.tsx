import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMarketplace, ActiveConversation } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { Campaign, Application, Message } from '../types';
import { DealDetailsModal } from './DealDetailsModal';
import { VerificationBadge } from './VerificationBadge';
import { 
  Search, 
  Send, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  MessageSquare, 
  Info,
  Clock,
  Sparkles,
  Flag
} from 'lucide-react';
import { validateMessageSafety } from '../utils/moderationList';

interface MessagesInboxProps {
  onViewProfile?: (userId: string) => void;
}

interface ConversationItem {
  id: string; // conversationId
  conversationId?: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  businessId: string;
  counterpartId: string;
  counterpartName: string;
  counterpartHandle?: string;
  counterpartIsVerified: boolean;
  applicationId: string;
  application: Application;
  campaign?: Campaign;
  lastMessage?: Message;
  lastTimestamp: string;
  unreadCount: number;
}

export const MessagesInbox: React.FC = () => {
  const { 
    applications, 
    campaigns, 
    conversations: savedConversations,
    messages, 
    sendMessage, 
    activeConversation, 
    setActiveConversation, 
    markConversationAsRead,
    submitReport,
    recordAbuseStrike
  } = useMarketplace();
  const { userProfile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [inputWarning, setInputWarning] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  // Reporting modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingMessage, setReportingMessage] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState('Personal contact info shared');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportToast, setReportToast] = useState<string | null>(null);

  // 24-hour chat mute check
  const isMuted = Boolean(
    userProfile?.chatMutedUntil && new Date(userProfile.chatMutedUntil).getTime() > Date.now()
  );

  // Mobile navigation state: show list (false) vs show chat panel (true)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const role = userProfile?.role || 'creator';

  // Extract conversations strictly based on ACCEPTED applications/deals
  const conversations: ConversationItem[] = useMemo(() => {
    if (!userProfile) return [];

    // Filter accepted applications according to role
    const acceptedApps = applications.filter((app) => {
      if (app.status !== 'accepted') return false;
      if (role === 'business') {
        return app.businessId === userProfile.id;
      } else {
        return app.creatorId === userProfile.id;
      }
    });

    const list: ConversationItem[] = acceptedApps.map((app) => {
      const localId = `${app.campaignId}_${app.creatorId}`;
      const savedConversation = savedConversations.find((item) =>
        item.campaignId === app.campaignId && item.brandId === app.businessId && item.creatorId === app.creatorId
      );
      const convId = savedConversation?.id || localId;
      const campaign = campaigns.find((c) => c.id === app.campaignId);

      const counterpartId = role === 'business' ? app.creatorId : app.businessId;
      const counterpartName = role === 'business' 
        ? app.creatorName 
        : (campaign?.businessName || 'Brand Partner');
      const counterpartHandle = role === 'business' 
        ? app.creatorHandle 
        : (campaign?.businessHandle || '@brand');
      const counterpartIsVerified = role === 'business'
        ? Boolean(app.creatorIsVerified)
        : Boolean(campaign?.businessIsVerified);

      // Find all messages for this conversation
      const convMessages = messages.filter(
        (m) => m.conversationId === convId
      );

      const lastMessage = convMessages.length > 0 ? convMessages[convMessages.length - 1] : undefined;
      const lastTimestamp = lastMessage ? lastMessage.createdAt : app.createdAt;

      // Count unread messages received by me
      const unreadCount = convMessages.filter(
        (m) => m.receiverId === userProfile.id && !m.read
      ).length;

      return {
        id: convId,
        conversationId: savedConversation?.id,
        campaignId: app.campaignId,
        campaignTitle: app.campaignTitle,
        creatorId: app.creatorId,
        businessId: app.businessId,
        counterpartId,
        counterpartName,
        counterpartHandle,
        counterpartIsVerified,
        applicationId: app.id,
        application: app,
        campaign,
        lastMessage,
        lastTimestamp,
        unreadCount,
      };
    });

    // Sort by most recent message/activity
    return list.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
  }, [applications, campaigns, savedConversations, messages, userProfile, role]);

  // Filter conversations by search box
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(
      (c) =>
        c.counterpartName.toLowerCase().includes(q) ||
        (c.counterpartHandle && c.counterpartHandle.toLowerCase().includes(q)) ||
        c.campaignTitle.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Ensure an active conversation is selected on desktop if available and none selected
  useEffect(() => {
    if (conversations.length > 0) {
      if (!activeConversation) {
        const first = conversations[0];
        setActiveConversation({
          campaignId: first.campaignId,
          conversationId: first.conversationId,
          campaignTitle: first.campaignTitle,
          creatorId: first.creatorId,
          businessId: first.businessId,
          peerName: first.counterpartName,
          peerHandle: first.counterpartHandle,
          applicationId: first.applicationId,
        });
      }
    }
  }, [conversations, activeConversation, setActiveConversation]);

  // Find messages for the current open chat
  const currentConvId = activeConversation
    ? activeConversation.conversationId || savedConversations.find((item) =>
        item.campaignId === activeConversation.campaignId &&
        item.brandId === activeConversation.businessId && item.creatorId === activeConversation.creatorId
      )?.id || `${activeConversation.campaignId}_${activeConversation.creatorId}`
    : '';

  const threadMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages.filter((m) => m.conversationId === currentConvId);
  }, [messages, activeConversation, currentConvId]);

  // When activeConversation is open, mark its messages as read
  useEffect(() => {
    if (activeConversation && currentConvId) {
      markConversationAsRead(currentConvId);
    }
  }, [activeConversation, currentConvId, markConversationAsRead]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
    return () => clearTimeout(timer);
  }, [messages, activeConversation, threadMessages.length]);

  // Validate input on change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (val.trim()) {
      const check = validateMessageSafety(val);
      if (!check.allowed) {
        setInputWarning("This message can't be sent. Don't share personal contact details or use abusive language.");
      } else {
        setInputWarning(null);
      }
    } else {
      setInputWarning(null);
    }
  };

  const handleSelectConversation = (conv: ConversationItem) => {
    setActiveConversation({
      campaignId: conv.campaignId,
      conversationId: conv.conversationId,
      campaignTitle: conv.campaignTitle,
      creatorId: conv.creatorId,
      businessId: conv.businessId,
      peerName: conv.counterpartName,
      peerHandle: conv.counterpartHandle,
      applicationId: conv.applicationId,
    });
    setIsMobileChatOpen(true);
    markConversationAsRead(conv.id);
  };

  const handleOpenReportModal = (msg?: Message) => {
    setReportingMessage(msg || null);
    setReportReason('Personal contact info shared');
    setIsReportModalOpen(true);
  };

  const handleConfirmReport = async () => {
    if (!activeConversation) return;
    setIsSubmittingReport(true);
    try {
      const reportedUserId = role === 'business' ? activeConversation.creatorId : activeConversation.businessId;
      const reportedUserName = activeConversation.peerName;
      const msgId = reportingMessage?.id || 'conversation-summary';
      const msgText = reportingMessage?.text || 'Conversation reported by user';
      const convId = currentConvId;

      await submitReport(
        reportedUserId,
        reportedUserName,
        msgId,
        msgText,
        convId,
        reportReason
      );

      setIsReportModalOpen(false);
      setReportToast('Report submitted. Our moderation team will review this message.');
      setTimeout(() => setReportToast(null), 5000);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !inputText.trim() || isSending) return;

    if (isMuted) {
      setInputWarning('Your chat is temporarily muted for 24 hours due to safety policy violations.');
      return;
    }

    // Strict safety & moderation check
    const check = validateMessageSafety(inputText.trim());
    if (!check.allowed) {
      if (check.reason === 'abuse') {
        await recordAbuseStrike(userProfile?.id || '');
      }
      setInputWarning("This message can't be sent. Don't share personal contact details or use abusive language.");
      return;
    }

    setIsSending(true);
    setInputWarning(null);
    try {
      const receiverId = role === 'business' ? activeConversation.creatorId : activeConversation.businessId;
      await sendMessage(
        activeConversation.campaignId,
        activeConversation.creatorId,
        activeConversation.businessId,
        inputText.trim(),
        receiverId
      );
      setInputText('');
    } catch (err: any) {
      setInputWarning(err.message || "This message can't be sent. Don't share personal contact details or use abusive language.");
    } finally {
      setIsSending(false);
    }
  };

  const activeConvItem = conversations.find(
    (c) =>
      c.campaignId === activeConversation?.campaignId &&
      c.creatorId === activeConversation?.creatorId
  );

  const isInvitationChat = useMemo(() => {
    if (!activeConversation) return false;
    return (
      threadMessages.some((m) => m.isInvitation) ||
      Boolean(activeConvItem?.application?.isInvitation) ||
      activeConversation.campaignId === 'direct-brief' ||
      activeConversation.campaignId === 'direct-collab'
    );
  }, [threadMessages, activeConvItem, activeConversation]);

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden transition-colors">
      
      {/* Container Frame (Fixed 100dvh minus nav height) */}
      <div className="w-full h-full flex-1 min-h-0 flex flex-col md:flex-row bg-[var(--bg-card)] border-t border-[var(--border-primary)] overflow-hidden relative">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: CONVERSATION LIST (Desktop: 340px, Mobile: toggle) */}
        {/* ======================================================== */}
        <div
          className={`w-full md:w-[340px] lg:w-[360px] border-r border-[var(--border-primary)] flex flex-col bg-[var(--bg-card)] shrink-0 h-full min-h-0 overflow-hidden transition-all ${
            isMobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Title - Pinned */}
          <div className="p-4 border-b border-[var(--border-primary)] shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
                  Messages
                </h1>
                {conversations.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--border-primary)]">
                    {conversations.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                {role === 'business' ? 'Approved creators' : 'Approved brands'}
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or deal..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Conversation Rows - Independent Scrolling */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[var(--border-primary)]/50">
            {filteredConversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[var(--text-secondary)]">
                <MessageSquare className="w-9 h-9 mb-2.5 text-[var(--text-muted)] opacity-50" />
                <p className="text-xs font-bold text-[var(--text-primary)] font-['Archivo']">
                  No conversations yet. Approved applicants will appear here.
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-[220px]">
                  {role === 'business'
                    ? 'Accept creator proposals in Applicants & Deals to open direct messaging.'
                    : 'When a brand accepts your application, your deal chat will appear here.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.campaignId === conv.campaignId && activeConversation?.creatorId === conv.creatorId;
                const hasUnread = conv.unreadCount > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    type="button"
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer relative ${
                      isSelected
                        ? 'bg-[var(--bg-card-subtle)] border-l-3 border-l-[var(--accent)]'
                        : 'hover:bg-[var(--border-primary)]/20'
                    }`}
                  >
                    {/* Avatar Initial */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-primary)] flex items-center justify-center font-bold text-sm font-['Archivo']">
                        {conv.counterpartName.charAt(0).toUpperCase()}
                      </div>
                      {hasUnread && (
                        <span 
                          title="Unread message"
                          className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] absolute -top-0.5 -right-0.5 ring-2 ring-[var(--bg-card)]" 
                        />
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`text-xs truncate font-['Archivo'] ${hasUnread ? 'font-black text-[var(--text-primary)]' : 'font-bold text-[var(--text-primary)]'}`}>
                            {conv.counterpartName}
                          </span>
                          <VerificationBadge isVerified={conv.counterpartIsVerified} size="sm" />
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                          {formatMessageTime(conv.lastTimestamp)}
                        </span>
                      </div>

                      {/* Campaign Title (small text) */}
                      <span className="block text-[11px] font-semibold text-[var(--accent)] truncate mb-1">
                        {conv.campaignTitle}
                      </span>

                      {/* Last message preview */}
                      <p className={`text-xs truncate ${hasUnread ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {conv.lastMessage 
                          ? conv.lastMessage.text 
                          : 'Deal accepted - tap to coordinate'}
                      </p>
                    </div>

                    {/* Coral dot indicator if unread */}
                    {hasUnread && (
                      <div className="shrink-0 self-center">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] block" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: CHAT AREA (Desktop: flex-1, Mobile: full screen) */}
        {/* ======================================================== */}
        <div
          className={`flex-1 min-w-0 h-full min-h-0 flex flex-col bg-[var(--bg-primary)] transition-all relative overflow-hidden ${
            !isMobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Pinned Chat Header at Top */}
              <div className="p-3.5 sm:p-4 border-b border-[var(--border-primary)] bg-[var(--bg-card)] flex items-center justify-between gap-3 shrink-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back button */}
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-[var(--border-primary)]/40 text-[var(--text-primary)] transition-colors cursor-pointer"
                    aria-label="Back to conversations list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-primary)] flex items-center justify-center font-bold text-sm shrink-0 font-['Archivo']">
                    {activeConversation.peerName.charAt(0).toUpperCase()}
                  </div>

                  {/* Title & Verified Collaboration */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-[var(--text-primary)] font-['Archivo'] truncate">
                        {activeConversation.peerName}
                      </h2>
                      <VerificationBadge 
                        isVerified={activeConvItem?.counterpartIsVerified ?? true} 
                        size="sm" 
                      />
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] border border-[var(--border-primary)] shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified deal collaboration
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate font-semibold">
                      {activeConversation.campaignTitle || 'Brand Campaign Deal'}
                    </p>
                  </div>
                </div>

                {/* Header Actions: View deal & Report */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsDealModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors shadow-2xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View deal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenReportModal()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-300/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                    title="Report message or safety violation"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>

              {/* Chat Body Container with Independent Scroll & Watermark strictly in background */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col relative">
                
                {/* FAINT CENTERED REPEATING WATERMARK: 5% opacity, behind messages, never blocking readability */}
                <div 
                  className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.05] z-0 flex flex-wrap items-center justify-around gap-12 sm:gap-16 p-6"
                  aria-hidden="true"
                >
                  {Array.from({ length: 32 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs sm:text-sm font-black tracking-wider text-[var(--text-primary)] -rotate-12 whitespace-nowrap"
                    >
                      Do not share personal information
                    </div>
                  ))}
                </div>

                {/* Message Content Container (Relative z-10 over watermark) */}
                <div className="relative z-10 flex flex-col space-y-3 pb-2 flex-1">
                  
                  {/* INVITATION CHAT NOTICE (if chat began from brand invitation) */}
                  {isInvitationChat && (
                    <div className="mb-2 p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] shadow-2xs flex items-start gap-3 shrink-0">
                      <div className="p-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shrink-0 mt-0.5">
                        <Info className="w-4 h-4" />
                      </div>
                      <p className="leading-relaxed text-[var(--text-primary)]">
                        Hyperniche is part of every conversation that starts from an invitation. We read the brand&apos;s first message before it reached you, and we stay in the chat so there&apos;s a record if anything goes wrong. Everyone who represents the brand can read the conversation too. The brand was told all of this before writing to you.
                      </p>
                    </div>
                  )}

                  {/* PINNED SAFETY NOTICE AT THE TOP OF MESSAGES */}
                  <div className="mb-4 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] shadow-2xs flex items-center gap-2.5 shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <span className="leading-snug">
                      <strong>For your safety:</strong> Keep all talks and payments on Hyperniche. Do not share phone numbers, emails or bank details.
                    </span>
                  </div>

                  {/* Message Thread */}
                  {threadMessages.length === 0 ? (
                    <div className="py-12 text-center text-[var(--text-secondary)] flex-1 flex flex-col items-center justify-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-[var(--accent)] opacity-60" />
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Conversation started
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Send a message below to coordinate deliverables, product delivery, or reel scripts.
                      </p>
                    </div>
                  ) : (
                    threadMessages.map((msg) => {
                      const isOwn = msg.senderId === userProfile?.id || msg.senderRole === role;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                        >
                          {/* Sender meta */}
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] mb-1 px-1">
                            {msg.senderName} ({msg.senderRole})
                          </span>

                          {/* Bubble: Own = dark (#2B2622 / var(--btn-primary-bg)), Other = cream (#FFFAF2 / var(--bg-card), bordered) */}
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs break-words ${
                              isOwn
                                ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-br-xs'
                                : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-bl-xs'
                            }`}
                          >
                            {msg.text}
                          </div>

                          {/* Small timestamp and report link */}
                          <div className="flex items-center gap-1.5 mt-1 px-1">
                            <span className="text-[9px] text-[var(--text-muted)] font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!isOwn && (
                              <button
                                type="button"
                                onClick={() => handleOpenReportModal(msg)}
                                className="text-[9px] text-[var(--text-muted)] hover:text-red-500 transition-colors ml-1 cursor-pointer flex items-center gap-0.5"
                                title="Report this message"
                              >
                                <Flag className="w-2.5 h-2.5" />
                                <span>Report</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

              </div>

              {/* Chat Input Bar Pinned at Bottom */}
              <div className="p-3 sm:p-4 border-t border-[var(--border-primary)] bg-[var(--bg-card)] shrink-0 z-20">
                {/* Warning notification banner if restricted contact info is typed */}
                {inputWarning && (
                  <div className="mb-2.5 p-2 rounded-xl bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] text-xs font-semibold flex items-center gap-2 border border-[var(--border-primary)] animate-in fade-in duration-150">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{inputWarning}</span>
                  </div>
                )}

                {isMuted ? (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-300/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Your account is currently in a 24-hour chat mute for safety policy violations. Messaging is temporarily disabled.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder="Type a message (Enter to send)..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !inputText.trim() || Boolean(inputWarning)}
                      className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[var(--accent)] text-white hover:opacity-95 disabled:opacity-40 transition-opacity flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            /* Desktop No Conversation Selected Empty State */
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[var(--text-secondary)]">
              <MessageSquare className="w-12 h-12 mb-3 text-[var(--accent)] opacity-40" />
              <h2 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Your Deal Messages
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
                Select an approved partner from the list to view chat history and discuss deliverables.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Deal Details Dialog Modal */}
      {activeConvItem && (
        <DealDetailsModal
          isOpen={isDealModalOpen}
          onClose={() => setIsDealModalOpen(false)}
          campaign={activeConvItem.campaign}
          application={activeConvItem.application}
          peerName={activeConvItem.counterpartName}
        />
      )}

      {/* Report Message Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)] font-['Archivo']">
                  Report message
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Reported messages are saved to our moderation review queue.
                </p>
              </div>
            </div>

            {reportingMessage && (
              <div className="p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] italic mb-4 max-h-24 overflow-y-auto">
                &ldquo;{reportingMessage.text}&rdquo;
              </div>
            )}

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Reason for report
              </label>
              {[
                'Personal contact info shared',
                'Abusive, vulgar, or threatening language',
                'Off-platform deal solicitation',
                'Scam or fraudulent activity',
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] hover:bg-[var(--input-bg)] cursor-pointer text-xs font-medium text-[var(--text-primary)] transition-colors"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="accent-[var(--accent)]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-primary)]">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                disabled={isSubmittingReport}
                className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReport}
                disabled={isSubmittingReport}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isSubmittingReport ? 'Submitting...' : 'Submit report'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Toast Notification */}
      {reportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xl border border-[var(--border-primary)] animate-in slide-in-from-bottom-3 duration-200 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{reportToast}</span>
        </div>
      )}

    </div>
  );
};
