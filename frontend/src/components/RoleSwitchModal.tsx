import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../config/categories';
import { X, ArrowRight, User, Building2, AlertCircle } from 'lucide-react';

interface RoleSwitchModalProps {
  isOpen: boolean;
  targetRole: UserRole;
  onClose: () => void;
  onSuccess?: () => void;
}

const FOLLOWER_RANGES = [
  'Under 10K',
  '10K-50K',
  '50K-250K',
  'Above 250K',
];

const BUSINESS_SELL_OPTIONS = [
  'Clothing & Streetwear',
  'Beauty & Skincare',
  'Consumer Tech & Accessories',
  'Food & Beverages',
  'Fitness & Supplements',
  'Home & Interior Decor',
  'Mobile Apps & Fintech',
  'Automotive & Riding Gear',
  'Pet Care Products',
  'Other Consumer Goods',
];

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  targetRole,
  onClose,
  onSuccess,
}) => {
  const { completeRoleSetup } = useAuth();

  // Creator fields (max 3 questions)
  const [handle, setHandle] = useState('');
  const [followers, setFollowers] = useState('10K-50K');
  const [niche, setNiche] = useState('Fashion');

  // Business fields (max 3 questions)
  const [businessName, setBusinessName] = useState('');
  const [websiteOrInstagram, setWebsiteOrInstagram] = useState('');
  const [whatYouSell, setWhatYouSell] = useState('Clothing & Streetwear');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (targetRole === 'creator') {
      if (!handle.trim()) {
        setError('Please enter your Instagram handle.');
        return;
      }
    } else {
      if (!businessName.trim()) {
        setError('Please enter your business name.');
        return;
      }
      if (!websiteOrInstagram.trim()) {
        setError('Please enter your Instagram handle or website.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (targetRole === 'creator') {
        const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
        await completeRoleSetup('creator', {
          handle: cleanHandle,
          followers,
          niche,
          name: cleanHandle.replace('@', ''),
        });
      } else {
        await completeRoleSetup('business', {
          name: businessName.trim(),
          websiteOrInstagram: websiteOrInstagram.trim(),
          whatYouSell,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to set up profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isToCreator = targetRole === 'creator';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold">
              {isToCreator ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-['Archivo']">
                {isToCreator ? 'Set up your creator profile' : 'Set up your business profile'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Answer 3 quick questions to unlock {isToCreator ? 'creator brand deals' : 'creator campaigns'}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--border-primary)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close modal"
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isToCreator ? (
            <>
              {/* Question 1: Instagram handle */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                  1. Instagram handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@yourhandle"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              {/* Question 2: Follower range */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                  2. Follower range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FOLLOWER_RANGES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFollowers(f)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-colors ${
                        followers === f
                          ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                          : 'border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Niche */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                  3. Primary niche
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Question 1: Business name */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                  1. Business name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Kanso Wear, Veda Botanics"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              {/* Question 2: Instagram or website */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                  2. Instagram or website
                </label>
                <input
                  type="text"
                  value={websiteOrInstagram}
                  onChange={(e) => setWebsiteOrInstagram(e.target.value)}
                  placeholder="e.g. @kansowear or kansowear.in"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              {/* Question 3: What you sell */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                  3. What you sell
                </label>
                <select
                  value={whatYouSell}
                  onChange={(e) => setWhatYouSell(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  {BUSINESS_SELL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-[var(--border-primary)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Saving...' : isToCreator ? 'Activate creator profile' : 'Activate business profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
