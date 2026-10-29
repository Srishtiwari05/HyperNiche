import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Handshake,
  Megaphone,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface HeroProps {
  onPostCampaign?: () => void;
  onBrowseCreators?: () => void;
  onSeeOpenDeals?: () => void;
  onBrowseCategories?: () => void;
}

const creatorShowcase = [
  { name: 'Sophia', value: '2.3M followers', tone: 'bg-[#F5DDA7]' },
  { name: 'Ari', value: '875K subscribers', tone: 'bg-[#FFB59F]' },
  { name: 'Maya', value: '1.2M views / week', tone: 'bg-[#C9E7CD]' },
  { name: 'Noah', value: '430 brand collabs', tone: 'bg-[#D9D3FF]' },
];

export const Hero: React.FC<HeroProps> = ({
  onPostCampaign,
  onBrowseCreators,
  onSeeOpenDeals,
  onBrowseCategories,
}) => {
  const { userProfile } = useAuth();
  const { campaigns, creators } = useMarketplace();
  const role = userProfile?.role || 'creator';
  const isBusiness = role === 'business';

  return (
    <section className="relative overflow-hidden border-b border-[#f35050] bg-[#171a1d] pb-8 pt-6 transition-colors sm:pt-8 lg:pb-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.02),transparent_25%)]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1e2226] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f4f0eb] shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:text-[12px]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5d5d]" />
          <span>{isBusiness ? 'Hire creators with the right audience fit' : 'Find paid deals that match your niche'}</span>
        </div>

        <h1 className="max-w-[1400px] text-[clamp(4rem,8.5vw,13rem)] leading-[0.72] tracking-[-0.085em] text-[#f4f0eb] font-black font-['Archivo']">
          {isBusiness ? (
            <>
              <span className="block">Get your product</span>
              <span className="block">in front of the</span>
              <span className="mt-2 inline-block rounded-[26px] bg-[#f4f0eb] px-3 py-1 text-[#101214] shadow-[0_14px_30px_rgba(244,240,235,0.12)]">right audience</span>
            </>
          ) : (
            <>
              <span className="block">Turn your</span>
              <span className="block">audience into</span>
              <span className="mt-2 block max-w-[900px] rounded-[26px] bg-[#f4f0eb] px-3 py-1 text-[#101214] shadow-[0_14px_30px_rgba(244,240,235,0.12)]">
                income.
              </span>
            </>
          )}
        </h1>

        <p className="mt-5 max-w-[1200px] text-base leading-relaxed text-[#d7d1ca] sm:text-2xl sm:leading-[1.25]">
          {isBusiness
            ? 'Post a brief, review pitches, and work directly with trusted creators. No agency markup, clear budgets, and faster timelines.'
            : 'Browse live brand briefs with real budgets, pitch once, and get paid when the work is done.'}
        </p>
      </div>
    </section>
  );
};
