import React, { useState } from 'react';
import { UserProfile, Campaign } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { X, Send, IndianRupee, AlertCircle } from 'lucide-react';
import { validateMessageSafety } from '../utils/moderationList';

interface SendBriefModalProps {
  creator: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMessages?: () => void;
}

export const SendBriefModal: React.FC<SendBriefModalProps> = ({
  creator,
  isOpen,
  onClose,
  onOpenMessages,
}) => {
  const { campaigns, sendMessage, setActiveConversation } = useMarketplace();
  const { userProfile } = useAuth();

  const businessCampaigns = campaigns.filter(
    (c) => c.businessId === userProfile?.id
  );

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    businessCampaigns[0]?.id || campaigns[0]?.id || ''
  );
  const [offerRate, setOfferRate] = useState<string>('30000');
  const [briefMessage, setBriefMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);

  if (!isOpen || !creator) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!briefMessage.trim()) {
      setError('Please provide a message or deliverable guidelines.');
      return;
    }

    const safety = validateMessageSafety(briefMessage.trim());
    if (!safety.allowed) {
      setSafetyWarning("This message can't be sent. Don't share personal contact details or use abusive language.");
      return;
    }

    const parsedRate = parseFloat(offerRate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      setError('Please enter a valid positive compensation amount in ₹.');
      return;
    }

    setIsSending(true);
    try {
      const targetCampId = selectedCampaignId || 'direct-collab';
      const text = `[Collab Invitation: ₹${parsedRate.toLocaleString('en-IN')}] ${briefMessage.trim()}`;

      await sendMessage(
        targetCampId,
        creator.id,
        userProfile?.id || '',
        text,
        creator.id,
        true
      );

      const matchedCampaign = campaigns.find((c) => c.id === targetCampId);
      setActiveConversation({
        campaignId: targetCampId,
        campaignTitle: matchedCampaign?.title || 'Direct Collab Invitation',
        creatorId: creator.id,
        businessId: userProfile?.id || '',
        peerName: creator.name,
        peerHandle: creator.handle,
      });

      onClose();
      if (onOpenMessages) {
        onOpenMessages();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send collab invitation.');
    } finally {
      setIsSending(false);
    }
  };

  const handleBriefChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBriefMessage(val);
    setError('');

    if (val.trim()) {
      const check = validateMessageSafety(val);
      if (!check.allowed) {
        setSafetyWarning("This message can't be sent. Don't share personal contact details or use abusive language.");
      } else {
        setSafetyWarning(null);
      }
    } else {
      setSafetyWarning(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
              Send collab invitation
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              To {creator.name} ({creator.handle})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--border-primary)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-xl bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] text-xs font-semibold flex items-center gap-2 border border-[var(--border-primary)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Select associated campaign
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {campaigns.slice(0, 5).map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.title} (₹{camp.budget.toLocaleString('en-IN')})
                </option>
              ))}
              <option value="custom-collab">Custom direct collaboration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Proposed compensation (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                ₹
              </span>
              <input
                type="number"
                value={offerRate}
                onChange={(e) => setOfferRate(e.target.value)}
                step="any"
                required
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Brief details & deliverables *
            </label>
            <textarea
              rows={4}
              value={briefMessage}
              onChange={handleBriefChange}
              placeholder="Hi! We'd love to partner with you for our upcoming product launch. We would ship 2 samples and need 1x Reel + 2x Stories highlighting..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {safetyWarning && (
              <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{safetyWarning}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[var(--border-primary)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || Boolean(safetyWarning)}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send collab invitation'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
