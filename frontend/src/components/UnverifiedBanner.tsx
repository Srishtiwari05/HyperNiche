import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, X, ArrowRight } from 'lucide-react';

interface UnverifiedBannerProps {
  onOpenVerification: () => void;
}

const SESSION_DISMISS_KEY = 'hyperniche_unverified_banner_dismissed';

export const UnverifiedBanner: React.FC<UnverifiedBannerProps> = ({ onOpenVerification }) => {
  const { userProfile } = useAuth();

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // If user is verified or logged out, never show
  if (!userProfile || userProfile.isVerified || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, 'true');
    } catch {
      // Ignore sessionStorage issues
    }
  };

  return (
    <div className="w-full bg-[var(--bg-card)] border-b border-[var(--border-primary)] text-[var(--text-primary)] px-4 py-2.5 transition-colors shadow-2xs relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-medium text-[var(--text-primary)] truncate sm:overflow-visible">
            <span className="font-bold text-[var(--accent)]">Not verified:</span>{' '}
            <span>get verified to unlock approvals and application tracking</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenVerification}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-2xs cursor-pointer"
          >
            <span>Get verified</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded-lg hover:bg-[var(--border-primary)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
