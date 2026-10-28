import React from 'react';
import { Campaign } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatDeadline } from '../lib/utils';

interface CampaignCardProps {
  campaign: Campaign;
  onApply?: (campaign: Campaign) => void;
  hasApplied?: boolean;
  onViewBusinessProfile?: (campaign: Campaign) => void;
}

const pastelBgList = ['#FFE3D3', '#FFF0B8', '#D9F2E6', '#E6DCFF', '#FFDBE6'];

export const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onApply, 
  hasApplied = false,
  onViewBusinessProfile,
}) => {
  const colorIndex = Math.abs(campaign.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % pastelBgList.length;
  const badgeBg = pastelBgList[colorIndex];

  const platforms: string[] = Array.isArray(campaign.platforms) && campaign.platforms.length > 0
    ? campaign.platforms
    : (campaign.platform ? campaign.platform.split(',').map((s) => s.trim()) : []);

  const isExpired = campaign.deadline
    ? new Date(campaign.deadline).getTime() < new Date().setHours(0, 0, 0, 0)
    : false;
  const isClosed = campaign.status === 'closed' || isExpired;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-xs hover:border-[var(--accent)]/30 transition-all duration-200 flex flex-col justify-between group">
      {campaign.imageUrl && (
        <div className="h-36 overflow-hidden bg-[var(--bg-card-subtle)]">
          <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        </div>
      )}
      <div className="p-5 flex flex-col justify-between flex-1">
      <div>
        {/* Brand & Category row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onViewBusinessProfile && onViewBusinessProfile(campaign)}
                className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] text-left cursor-pointer transition-colors"
              >
                {campaign.businessName}
              </button>
              <VerificationBadge isVerified={campaign.businessIsVerified} size="sm" />
            </div>
            <div className="text-xs font-mono text-[var(--text-muted)]">
              {campaign.businessHandle}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isClosed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] border border-[var(--border-primary)]">
                Closed
              </span>
            )}
            <span
              style={{ backgroundColor: badgeBg }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#2B2622] border border-[var(--border-primary)]"
            >
              {campaign.category}
            </span>
          </div>
        </div>

        {/* Campaign Title (Used in place of product name) */}
        <h3 className="font-bold text-base text-[var(--text-primary)] tracking-tight font-['Archivo'] mb-2.5 leading-snug line-clamp-2">
          {campaign.title}
        </h3>

        {/* Target Platforms as Small Tags */}
        {platforms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {platforms.map((plat) => (
              <span
                key={plat}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-primary)] group-hover:border-[var(--accent)]/40 transition-colors"
              >
                {plat}
              </span>
            ))}
          </div>
        )}

        {/* Description snippet */}
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
          {campaign.description}
        </p>

        {/* Specs: Deliverable format and Deadline */}
        <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4 pb-3 border-b border-[var(--border-primary)]/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">Deliverable</span>
            <span className="font-semibold text-[var(--text-primary)] truncate max-w-[170px]">{campaign.contentType}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">Deadline</span>
            <span className="font-medium text-[var(--text-secondary)]">{formatDeadline(campaign.deadline) || campaign.deadline}</span>
          </div>
        </div>
      </div>

      {/* Pay in INR & Apply button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="block text-[10px] font-semibold text-[var(--text-muted)]">
            Fixed compensation
          </span>
          <span className="text-base font-black text-[var(--text-primary)] font-['Archivo']">
            ₹{campaign.budget.toLocaleString('en-IN')}
          </span>
        </div>

        {isClosed ? (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--input-bg)] text-[var(--text-muted)] text-xs font-bold border border-[var(--border-primary)]">
            Closed
          </span>
        ) : hasApplied ? (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-xs font-bold border border-[var(--border-primary)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Applied</span>
          </span>
        ) : onApply ? (
          <button
            onClick={() => onApply(campaign)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 hover:-translate-y-0.5 transition-all shadow-2xs cursor-pointer"
          >
            <span>Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">Live on marketplace</span>
        )}
      </div>
      </div>
    </div>
  );
};
