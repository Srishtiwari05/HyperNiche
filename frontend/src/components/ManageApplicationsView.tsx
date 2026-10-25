import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { ApplicationStatus } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { VerificationPaymentModal } from './VerificationPaymentModal';
import { Check, X, MessageSquare, IndianRupee, Clock, CheckCircle2, XCircle, Lock, ShieldCheck } from 'lucide-react';

interface ManageApplicationsViewProps {
  onOpenMessages?: () => void;
  onViewCreatorProfile?: (creatorId: string) => void;
}

export const ManageApplicationsView: React.FC<ManageApplicationsViewProps> = ({ 
  onOpenMessages,
  onViewCreatorProfile,
}) => {
  const { campaigns, applications, updateApplicationStatus, setActiveConversation, getBusinessDecisionStats } = useMarketplace();
  const { userProfile } = useAuth();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isOwnerVerified = Boolean(userProfile?.isVerified);
  const decisionStats = getBusinessDecisionStats(userProfile?.id);
  const canDecide = isOwnerVerified || decisionStats.hasFreeLeft;

  const removedCampaignIds = new Set(
    campaigns.filter((c) => c.status === 'removed' || c.removed === true).map((c) => c.id)
  );

  // Business sees applications for their campaigns (excluding removed campaigns unless accepted deal)
  const relevantApps = applications.filter((a) => {
    if (a.businessId !== userProfile?.id) return false;
    if (removedCampaignIds.has(a.campaignId) && a.status !== 'accepted') return false;
    return true;
  });

  const filteredApps = relevantApps.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const handleOpenChat = (app: typeof relevantApps[0]) => {
    setActiveConversation({
      campaignId: app.campaignId,
      campaignTitle: app.campaignTitle,
      creatorId: app.creatorId,
      businessId: app.businessId,
      peerName: app.creatorName,
      peerHandle: app.creatorHandle,
      applicationId: app.id,
    });
    if (onOpenMessages) {
      onOpenMessages();
    }
  };

  const handleApprove = async (app: typeof relevantApps[0]) => {
    try {
      await updateApplicationStatus(app.id, 'accepted');
      handleOpenChat(app);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateApplicationStatus(appId, 'rejected');
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200 transition-colors">
      
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-primary)]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
            Applicants & deal inquiries
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Review creator pitches, negotiate deliverables, and approve contracts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'pending', 'accepted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize text-xs transition-colors ${
                filterStatus === s
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                  : 'bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List of Applications */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl">
          <p className="text-sm font-bold text-[var(--text-primary)] font-['Archivo']">
            No applications yet.
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            Once creators apply to your campaigns, their proposals and proposed rates will appear here for your review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            return (
              <div
                key={app.id}
                className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 hover:shadow-2xs transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left: Creator info & pitch */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-sm border border-[var(--border-primary)]">
                        {app.creatorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-[var(--text-primary)] font-['Archivo']">
                            {app.creatorName}
                          </h4>
                          <VerificationBadge isVerified={app.creatorIsVerified} size="sm" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                          <span>{app.creatorHandle}</span>
                          <span>•</span>
                          <span>{app.creatorFollowers} followers</span>
                          <span>•</span>
                          <span className="font-sans font-semibold text-[var(--text-primary)]">
                            {app.creatorNiche}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2 text-xs font-semibold text-[var(--accent)]">
                      Applied for: {app.campaignTitle}
                    </div>

                    {/* Creator's Pitch */}
                    <div className="p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-primary)]/60 text-xs text-[var(--text-primary)] leading-relaxed">
                      <span className="font-semibold text-xs text-[var(--text-secondary)] block mb-1">
                        Creator pitch & concept:
                      </span>
                      {app.pitch}
                    </div>
                  </div>

                  {/* Right: Rate & Action buttons */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-primary)]/60">
                    <div>
                      <span className="block text-xs font-semibold text-[var(--text-muted)] text-right">
                        Proposed rate
                      </span>
                      <span className="text-base font-black text-[var(--text-primary)] font-['Archivo'] text-right block">
                        ₹{app.proposedRate.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {app.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] border border-[var(--border-primary)]">
                          <Clock className="w-3 h-3" />
                          <span>Pending review</span>
                        </span>
                      )}
                      {app.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] border border-[var(--border-primary)]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Deal accepted</span>
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] border border-[var(--border-primary)]">
                          <XCircle className="w-3 h-3" />
                          <span>Declined</span>
                        </span>
                      )}
                    </div>

                    {/* Action buttons with 1 Free Approval Rule */}
                    <div className="flex flex-col items-end gap-2">
                      {app.status === 'pending' && (
                        <>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={!canDecide}
                              onClick={() => canDecide && handleApprove(app)}
                              title={!canDecide ? 'Free approval used this month. Get verified to approve or reject more applicants.' : 'Approve proposal'}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                canDecide
                                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--accent)] hover:text-white cursor-pointer'
                                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-primary)] cursor-not-allowed opacity-60'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              disabled={!canDecide}
                              onClick={() => canDecide && handleReject(app.id)}
                              title={!canDecide ? 'Free approval used this month. Get verified to approve or reject more applicants.' : 'Decline proposal'}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                                canDecide
                                  ? 'border-[var(--border-primary)] hover:bg-[var(--badge-pink-bg)] cursor-pointer'
                                  : 'border-[var(--border-primary)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>

                          {/* Quota indicator near buttons */}
                          {isOwnerVerified ? (
                            <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-[var(--accent)]" />
                              <span>Unlimited approvals (verified)</span>
                            </span>
                          ) : decisionStats.hasFreeLeft ? (
                            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                              1 free approval left this month
                            </span>
                          ) : (
                            <div className="flex flex-col items-end gap-1 mt-1 text-right">
                              <span className="text-[11px] font-semibold text-[var(--accent)] flex items-center gap-1">
                                <Lock className="w-3 h-3 shrink-0" />
                                <span>Free approval used this month. Get verified to approve or reject more applicants.</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent)] text-white text-[11px] font-bold hover:opacity-95 shadow-2xs cursor-pointer transition-opacity"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Get verified</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {app.status === 'accepted' && (
                        <button
                          onClick={() => handleOpenChat(app)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat with creator</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification payment modal */}
      <VerificationPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

    </div>
  );
};
