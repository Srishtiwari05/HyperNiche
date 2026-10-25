import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { Campaign } from '../types';
import { CreateCampaignModal } from './CreateCampaignModal';
import { Plus, Users, Trash2, X, AlertTriangle, RotateCcw, Pencil } from 'lucide-react';

interface MyCampaignsViewProps {
  onOpenCreateCampaign: () => void;
  onViewApplicants: () => void;
}

export const MyCampaignsView: React.FC<MyCampaignsViewProps> = ({
  onOpenCreateCampaign,
  onViewApplicants,
}) => {
  const { campaigns, removeCampaign, restoreCampaign } = useMarketplace();
  const { userProfile } = useAuth();

  // Dialog & Toast states
  const [campaignToRemove, setCampaignToRemove] = useState<Campaign | null>(null);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [undoToast, setUndoToast] = useState<{ visible: boolean; campaignId: string; campaignTitle: string } | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Tab state: 'active' | 'removed'
  const [activeTab, setActiveTab] = useState<'active' | 'removed'>('active');

  // Filter active and removed campaigns
  const myActiveCampaigns = campaigns.filter(
    (c) =>
      c.businessId === userProfile?.id &&
      !c.removed &&
      c.status !== 'removed'
  );

  const myRemovedCampaigns = campaigns.filter(
    (c) =>
      c.businessId === userProfile?.id &&
      (c.removed === true || c.status === 'removed')
  );

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const handleConfirmRemove = async () => {
    if (!campaignToRemove) return;
    const camp = campaignToRemove;
    setIsRemoving(true);
    try {
      await removeCampaign(camp.id);
      setCampaignToRemove(null);

      // Trigger 6-second undo toast
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      setUndoToast({
        visible: true,
        campaignId: camp.id,
        campaignTitle: camp.title,
      });

      undoTimerRef.current = setTimeout(() => {
        setUndoToast(null);
      }, 6000);
    } catch (err) {
      console.error('Failed to remove campaign:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUndo = async () => {
    if (!undoToast) return;
    const targetId = undoToast.campaignId;
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    setUndoToast(null);
    try {
      await restoreCampaign(targetId);
    } catch (err) {
      console.error('Failed to undo campaign removal:', err);
    }
  };

  const handleRestore = async (campaignId: string) => {
    try {
      await restoreCampaign(campaignId);
    } catch (err) {
      console.error('Failed to restore campaign:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200 transition-colors relative">
      
      {/* Title & Post button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-primary)]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
            My posted campaigns
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage your open product promotion briefs and track creator applications.
          </p>
        </div>

        <button
          onClick={onOpenCreateCampaign}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post new campaign</span>
        </button>
      </div>

      {/* Tabs: Active vs Removed */}
      <div className="flex items-center gap-2 mb-6 border-b border-[var(--border-primary)] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-2xs'
              : 'bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'
          }`}
        >
          Active ({myActiveCampaigns.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('removed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'removed'
              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-2xs'
              : 'bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'
          }`}
        >
          Removed ({myRemovedCampaigns.length})
        </button>
      </div>

      {activeTab === 'active' ? (
        myActiveCampaigns.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl">
            <p className="text-sm font-bold text-[var(--text-primary)] font-['Archivo']">
              No active campaigns
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
              Create your first brand deal brief specifying product deliverables and creator compensation in INR.
            </p>
            <button
              onClick={onOpenCreateCampaign}
              className="mt-4 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
            >
              Create first campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myActiveCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 flex flex-col justify-between hover:shadow-2xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--border-primary)]">
                      {camp.category}
                    </span>
                    <span className="text-xs font-bold text-[var(--badge-green-text)] bg-[var(--badge-green-bg)] px-2 py-0.5 rounded-full">
                      {camp.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--text-primary)] font-['Archivo'] mb-2">
                    {camp.title}
                  </h3>
                  {camp.platforms && camp.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {camp.platforms.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                    {camp.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4 pb-3 border-b border-[var(--border-primary)]/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Deliverable</span>
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[170px]">{camp.contentType}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Deadline</span>
                      <span>{camp.deadline}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Budget</span>
                      <span className="font-bold text-[var(--text-primary)]">₹{camp.budget.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Action row with View applicants & Remove button */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                    <Users className="w-4 h-4 text-[var(--accent)]" />
                    <span>{camp.applicantsCount || 0} Applicants</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onViewApplicants}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      View applicants
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => setEditingCampaign(camp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent)] text-xs font-medium transition-colors cursor-pointer"
                      title="Edit this campaign"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => setCampaignToRemove(camp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-300/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors cursor-pointer"
                      title="Remove this campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        myRemovedCampaigns.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl">
            <p className="text-sm font-bold text-[var(--text-primary)] font-['Archivo']">
              No removed campaigns
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
              Campaigns you remove will appear here if you ever wish to restore them back to the live marketplace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myRemovedCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--border-primary)]">
                      {camp.category}
                    </span>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      REMOVED
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--text-primary)] font-['Archivo'] mb-2">
                    {camp.title}
                  </h3>
                  {camp.platforms && camp.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {camp.platforms.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                    {camp.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4 pb-3 border-b border-[var(--border-primary)]/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Deliverable</span>
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[170px]">{camp.contentType}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Budget</span>
                      <span className="font-bold text-[var(--text-primary)]">₹{camp.budget.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Restore button */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <span className="text-xs text-[var(--text-muted)]">Hidden from creators</span>
                  <button
                    type="button"
                    onClick={() => handleRestore(camp.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Confirmation Modal */}
      {campaignToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)] font-['Archivo'] leading-snug">
                  Remove this campaign? Creators will no longer see it.
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  {campaignToRemove.applicantsCount > 0 ? (
                    <>
                      This campaign has <span className="font-semibold text-[var(--text-primary)]">{campaignToRemove.applicantsCount}</span> {campaignToRemove.applicantsCount === 1 ? 'applicant' : 'applicants'}. Removing it will close their applications. Accepted applicants keep their chat and deal record.
                    </>
                  ) : (
                    'This campaign will be taken down from the public marketplace.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[var(--border-primary)]">
              <button
                type="button"
                onClick={() => setCampaignToRemove(null)}
                disabled={isRemoving}
                className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRemoving ? 'Removing...' : 'Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Toast Notification (6 Seconds) */}
      {undoToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xl border border-[var(--border-primary)] animate-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-medium">Campaign removed</span>
          <button
            onClick={handleUndo}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
          <button
            onClick={() => {
              if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
              setUndoToast(null);
            }}
            className="p-1 text-[var(--btn-primary-text)]/70 hover:text-[var(--btn-primary-text)] cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <CreateCampaignModal
          key={editingCampaign.id}
          isOpen={true}
          onClose={() => setEditingCampaign(null)}
          initialCampaign={editingCampaign}
        />
      )}
    </div>
  );
};

