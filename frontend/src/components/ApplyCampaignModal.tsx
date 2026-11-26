import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { validateMessageSafety } from '../utils/moderationList';
import { X, Send, IndianRupee, AlertCircle } from 'lucide-react';

interface ApplyCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyCampaignModal: React.FC<ApplyCampaignModalProps> = ({
  campaign,
  isOpen,
  onClose,
}) => {
  const { applyToCampaign } = useMarketplace();
  const { userProfile } = useAuth();

  const [proposedRate, setProposedRate] = useState<string>(
    campaign ? String(campaign.budget) : '25000'
  );
  const [pitch, setPitch] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [pitchWarning, setPitchWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Update proposedRate when campaign changes
  useEffect(() => {
    if (campaign) {
      setProposedRate(String(campaign.budget));
      setError('');
      setPitchWarning(null);
    }
  }, [campaign]);

  if (!isOpen || !campaign) return null;

  const handlePitchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPitch(val);
    setError('');

    // Pre-validate safety check as user types
    if (val.trim()) {
      const safety = validateMessageSafety(val);
      if (!safety.allowed) {
        setPitchWarning(safety.warningMessage || "This message can't be sent. Don't share personal contact details or use abusive language.");
      } else {
        setPitchWarning(null);
      }
    } else {
      setPitchWarning(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Proposed rate validation: must be a positive number in INR
    const rateNum = Number(proposedRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      setError('Please enter a valid positive amount in ₹.');
      return;
    }

    if (!pitch.trim() || pitch.trim().length < 15) {
      setError('Please provide a pitch of at least 15 characters explaining your creative concept.');
      return;
    }

    // 2. Chat Safety Check (applies to first message of application)
    const safetyCheck = validateMessageSafety(pitch);
    if (!safetyCheck.allowed) {
      setPitchWarning(safetyCheck.warningMessage || "This message can't be sent. Don't share personal contact details or use abusive language.");
      return;
    }

    setIsSubmitting(true);

    try {
      await applyToCampaign(campaign, pitch.trim(), rateNum);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
              Apply to brand deal
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {campaign.businessName} • {campaign.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--border-primary)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opportunity Summary Card */}
        <div className="my-4 p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
          <h4 className="font-bold text-sm text-[var(--text-primary)] font-['Archivo']">
            {campaign.title}
          </h4>
          {campaign.platforms && campaign.platforms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {campaign.platforms.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
                >
                  {p}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="block text-[10px] font-semibold text-[var(--text-muted)]">
                Brand budget
              </span>
              <span className="font-bold text-sm text-[var(--text-primary)]">
                ₹{campaign.budget.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-[var(--text-muted)]">
                Deliverable
              </span>
              <span className="font-semibold text-[var(--text-primary)] truncate block">
                {campaign.contentType}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] text-xs font-semibold flex items-center gap-2 border border-[var(--border-primary)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Your proposed rate (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                ₹
              </span>
              <input
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                step="any"
                required
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              Match the campaign budget or pitch your preferred rate for this deliverable.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Creative pitch & concept *
            </label>
            <textarea
              rows={4}
              value={pitch}
              onChange={handlePitchChange}
              placeholder="Why is your audience perfect for this product? Outline your planned video hook, styling concept, and posting timeline..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {/* Inline warning for blocked content */}
            {pitchWarning && (
              <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{pitchWarning}</span>
              </p>
            )}
          </div>

          {/* Plain profile attachment line */}
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your profile ({userProfile?.handle || '@handle'}, {userProfile?.followers || 'follower range'}) will be attached to this application.
          </p>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[var(--border-primary)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(pitchWarning)}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit pitch'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
