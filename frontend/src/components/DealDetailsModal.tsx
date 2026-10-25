import React from 'react';
import { Campaign, Application } from '../types';
import { X, CheckCircle2, ShieldCheck, IndianRupee, Calendar, Layers, ExternalLink } from 'lucide-react';

interface DealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign;
  application?: Application;
  peerName: string;
}

export const DealDetailsModal: React.FC<DealDetailsModalProps> = ({
  isOpen,
  onClose,
  campaign,
  application,
  peerName,
}) => {
  if (!isOpen) return null;

  const budget = application?.proposedRate || campaign?.budget || 28000;
  const title = campaign?.title || application?.campaignTitle || 'Brand Deal Collaboration';
  const deliverable = campaign?.contentType || '1x Reel + 2x Stories';
  const platforms = campaign?.platforms || (campaign?.platform ? [campaign.platform] : ['Instagram Reels']);
  const deadline = campaign?.deadline || 'May 2026';
  const pitch = application?.pitch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight font-['Archivo']">
                Confirmed Deal Details
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Collaboration with {peerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--border-primary)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className="mt-4 p-3 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] border border-[var(--border-primary)] flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Accepted partnership agreement</span>
          </div>
          <span className="font-mono text-[11px] bg-white/40 px-2 py-0.5 rounded-md">
            Direct INR payout
          </span>
        </div>

        {/* Campaign Info */}
        <div className="mt-5 space-y-4 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-muted)] block">
              Campaign opportunity
            </span>
            <h4 className="text-base font-bold text-[var(--text-primary)] font-['Archivo'] mt-0.5">
              {title}
            </h4>
            {platforms.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {platforms.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Grid specs */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
            <div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                Agreed compensation
              </span>
              <span className="text-base font-black text-[var(--text-primary)] font-['Archivo']">
                ₹{budget.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                Deliverable
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)] truncate block mt-0.5">
                {deliverable}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                Target Platform
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)] mt-0.5 block truncate">
                {platforms.join(', ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                Posting deadline
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)] mt-0.5 block">
                {deadline}
              </span>
            </div>
          </div>

          {/* Creator Pitch if exists */}
          {pitch && (
            <div className="p-3.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-primary)]">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">
                Approved pitch & concept:
              </span>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed italic">
                "{pitch}"
              </p>
            </div>
          )}

          {/* Guidelines */}
          {campaign?.description && (
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                Campaign guidelines:
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--input-bg)] p-3 rounded-xl border border-[var(--border-primary)]/60">
                {campaign.description}
              </p>
            </div>
          )}

          {/* Safety Notice */}
          <div className="p-3 rounded-xl bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--border-primary)] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              For security, confirm script drafts, sample deliveries, and proofs of posting directly in this chat thread.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--border-primary)] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Back to chat
          </button>
        </div>

      </div>
    </div>
  );
};
