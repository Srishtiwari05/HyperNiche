import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';

export const AnnouncementBar: React.FC = () => {
  const { campaigns, creators } = useMarketplace();

  const openCampaignsCount = campaigns.filter(
    (c) =>
      (!c.status || c.status === 'open') &&
      c.status !== 'removed' &&
      !c.removed &&
      (!c.deadline || new Date(c.deadline).getTime() >= new Date().setHours(0, 0, 0, 0))
  ).length;

  const creatorsCount = creators.length;

  return (
    <div className="bg-[var(--announcement-bg)] text-[var(--announcement-text)] text-xs font-medium py-2 px-4 border-b border-[var(--border-primary)]/30 overflow-hidden whitespace-nowrap transition-colors flex items-center justify-center">
      <div className="flex items-center justify-center space-x-5 text-xs">
        <span className="flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
          <span>
            {openCampaignsCount > 0
              ? `${openCampaignsCount} live brand campaigns open`
              : 'Be among the first brands on Hyperniche'}
          </span>
        </span>
        {creatorsCount > 0 && (
          <>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="hidden sm:inline font-semibold">{creatorsCount} creators</span>
          </>
        )}
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="hidden sm:inline">Free during pilot</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="hidden sm:inline">Direct deals, no agency</span>
        <span className="hidden md:inline opacity-40">•</span>
        <span className="hidden md:inline">INR payments</span>
      </div>
    </div>
  );
};
