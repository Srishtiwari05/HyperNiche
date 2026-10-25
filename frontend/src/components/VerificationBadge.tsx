import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified = false,
  size = 'md',
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipText = 'Verified means this account completed the Hyperniche verification payment.';

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={isVerified ? 'Verified account' : 'Not verified account'}
        className={`inline-flex items-center rounded-full font-bold cursor-pointer transition-all duration-150 select-none ${sizeClasses} ${
          isVerified
            ? 'bg-[#F06A4D] dark:bg-[#B3121E] text-white shadow-2xs hover:opacity-95'
            : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border border-[var(--border-primary)] hover:text-[var(--text-secondary)]'
        }`}
      >
        {isVerified ? (
          <>
            <CheckCircle2 className={`${iconSizes} stroke-[2.5] shrink-0`} />
            <span className="font-['Archivo'] tracking-tight">Verified</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] shrink-0" />
            <span className="font-['Archivo'] tracking-tight text-[11px]">Not verified</span>
          </>
        )}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 text-xs font-normal text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
        >
          <div className="flex items-start gap-1.5">
            <span className="text-[var(--accent)] font-bold">ℹ</span>
            <p className="leading-snug">{tooltipText}</p>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-[var(--bg-card)] border-r border-b border-[var(--border-primary)]" />
        </div>
      )}
    </div>
  );
};
