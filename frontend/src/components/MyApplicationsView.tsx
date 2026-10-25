import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { VerificationPaymentModal } from './VerificationPaymentModal';
import { Clock, CheckCircle2, XCircle, MessageSquare, ArrowRight, Lock, Send, ShieldCheck } from 'lucide-react';

interface MyApplicationsViewProps {
  onBrowseDeals?: () => void;
  onOpenMessages?: () => void;
}

export const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({
  onBrowseDeals,
  onOpenMessages,
}) => {
  const { applications, campaigns, setActiveConversation } = useMarketplace();
  const { userProfile } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const isCreatorVerified = Boolean(userProfile?.isVerified);

  const removedCampaignIds = new Set(
    campaigns.filter((c) => c.status === 'removed' || c.removed === true).map((c) => c.id)
  );

  // Creator's applications (removed campaigns never show for creators, accepted applicants keep their chat & deal record)
  const myApps = applications.filter((a) => {
    if (a.creatorId !== userProfile?.id) return false;
    if (removedCampaignIds.has(a.campaignId) && a.status !== 'accepted') return false;
    return true;
  });

  const handleOpenChat = (app: typeof myApps[0]) => {
    const matchedCamp = campaigns.find((c) => c.id === app.campaignId);
    setActiveConversation({
      campaignId: app.campaignId,
      campaignTitle: app.campaignTitle,
      creatorId: app.creatorId,
      businessId: app.businessId,
      peerName: matchedCamp?.businessName || 'Brand Partner',
      peerHandle: matchedCamp?.businessHandle || '@brand',
      applicationId: app.id,
    });
    if (onOpenMessages) {
      onOpenMessages();
    }
  };

  // Identify the 1 free application per calendar month for unverified creators
  const freeAppIdByMonth = React.useMemo(() => {
    const map = new Map<string, string>();
    const sorted = [...myApps].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    sorted.forEach((app) => {
      const d = new Date(app.createdAt);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (app.isFreeApplication) {
        if (!map.has(monthKey)) {
          map.set(monthKey, app.id);
        }
      } else if (!app.isPaidExtra && !app.paymentId) {
        if (!map.has(monthKey)) {
          map.set(monthKey, app.id);
        }
      }
    });
    return map;
  }, [myApps]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200 transition-colors">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-primary)]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
            My deal applications
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Track approvals, review feedback, and communicate directly with brand partners.
          </p>
        </div>

        {onBrowseDeals && (
          <button
            onClick={onBrowseDeals}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold hover:bg-[var(--accent)] hover:text-white transition-colors"
          >
            <span>Explore more deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {myApps.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl">
          <p className="text-sm font-bold text-[var(--text-primary)] font-['Archivo']">
            No applications yet.
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            Browse through active brand campaigns in your niche and pitch your creative concept to start landing paid brand deals.
          </p>
          {onBrowseDeals && (
            <button
              onClick={onBrowseDeals}
              className="mt-4 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity"
            >
              Browse open deals
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myApps.map((app) => (
            <div
              key={app.id}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 hover:shadow-2xs transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Left: Campaign details & Pitch */}
                <div className="flex-1">
                  <div className="flex items-center justify-between sm:justify-start gap-3 mb-2">
                    <h3 className="font-bold text-base text-[var(--text-primary)] font-['Archivo']">
                      {app.campaignTitle}
                    </h3>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-primary)]/60 text-xs text-[var(--text-primary)] leading-relaxed mb-3">
                    <span className="font-semibold text-xs text-[var(--text-secondary)] block mb-1">
                      Your pitch:
                    </span>
                    {app.pitch}
                  </div>

                  <span className="text-xs text-[var(--text-muted)]">
                    Submitted on {new Date(app.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Right: Proposed Rate & Status Badge */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-primary)]/60">
                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-muted)] text-right">
                      Your proposed rate
                    </span>
                    <span className="text-base font-black text-[var(--text-primary)] font-['Archivo'] text-right block">
                      ₹{app.proposedRate.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Status Badge with Free Application & Verification Rules */}
                  {(() => {
                    // 1 free application per month gets full status; extra applications show Application sent
                    const d = new Date(app.createdAt);
                    const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
                    const isFreeApp = Boolean(app.isFreeApplication) || freeAppIdByMonth.get(monthKey) === app.id;
                    const showFullStatus = isCreatorVerified || isFreeApp;

                    return (
                      <div className="flex flex-col items-end gap-1.5">
                        {!showFullStatus ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                              <Send className="w-3.5 h-3.5 text-[var(--accent)]" />
                              <span>Application sent</span>
                            </span>

                            <div className="flex flex-col items-end gap-1 text-right mt-1">
                              <span className="text-[11px] font-semibold text-[var(--accent)] flex items-center gap-1">
                                <Lock className="w-3 h-3 shrink-0" />
                                Get verified to see your application results
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
                          </>
                        ) : (
                          <>
                            {app.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] border border-[var(--border-primary)]">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pending</span>
                              </span>
                            )}
                            {app.status === 'accepted' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] border border-[var(--border-primary)]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accepted</span>
                              </span>
                            )}
                            {app.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] border border-[var(--border-primary)]">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejected</span>
                              </span>
                            )}

                            {/* Open Chat if Accepted */}
                            {app.status === 'accepted' && (
                              <button
                                onClick={() => handleOpenChat(app)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-2xs mt-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Chat with brand</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verification Payment Modal */}
      <VerificationPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

    </div>
  );
};
