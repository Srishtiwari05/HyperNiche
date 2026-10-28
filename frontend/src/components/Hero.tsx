import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { ArrowRight, CheckCircle2, Handshake, Megaphone } from 'lucide-react';

interface HeroProps {
  onPostCampaign?: () => void;
  onBrowseCreators?: () => void;
  onSeeOpenDeals?: () => void;
  onBrowseCategories?: () => void;
}

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
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] transition-colors">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob-mint absolute -top-24 -left-16 w-[28rem] h-[28rem] rounded-full blur-[90px] opacity-[0.18] dark:opacity-[0.08] bg-[#D9F2E6]" />
        <div className="aurora-blob-blush absolute -bottom-20 right-0 w-[26rem] h-[26rem] rounded-full blur-[90px] opacity-[0.16] dark:opacity-[0.08] bg-[#FFE3D3]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 motion-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[var(--bg-card)]/80 border border-[var(--border-primary)] text-[var(--text-secondary)] mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
              <span>{isBusiness ? 'Hire creators who already know your niche' : 'Find paid deals that match your audience'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[48px] lg:leading-[1.12] font-black text-[var(--text-primary)] tracking-tight font-['Archivo']">
              {isBusiness
                ? 'Get your product in front of the right audience.'
                : 'Turn your audience into income.'}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {isBusiness
                ? 'Post a brief, review pitches, and work directly with verified Indian creators. No agency markup. Clear INR rates.'
                : 'Browse live brand briefs with budgets in INR, pitch once, and get paid when the work is done.'}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
              {isBusiness ? (
                <>
                  <button
                    onClick={onPostCampaign}
                    className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-xs sm:text-sm font-bold hover:opacity-95 hover:-translate-y-0.5 transition-all shadow-xs flex items-center gap-2"
                  >
                    <span>Post a campaign</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onBrowseCreators}
                    className="px-6 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs sm:text-sm font-bold hover:border-[var(--text-primary)] hover:-translate-y-0.5 transition-all"
                  >
                    Browse creators
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onSeeOpenDeals}
                    className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-xs sm:text-sm font-bold hover:opacity-95 hover:-translate-y-0.5 transition-all shadow-xs flex items-center gap-2"
                  >
                    <span>See open deals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onBrowseCategories}
                    className="px-6 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs sm:text-sm font-bold hover:border-[var(--text-primary)] hover:-translate-y-0.5 transition-all"
                  >
                    Browse categories
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border-primary)] flex flex-col gap-4">
              {(campaigns.length > 0 || creators.length > 0) && (
                <div className="flex items-center gap-8">
                  {campaigns.length > 0 && (
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Archivo']">
                        {campaigns.length}
                      </div>
                      <div className="text-xs font-semibold text-[var(--text-secondary)]">
                        {campaigns.length === 1 ? 'Live campaign' : 'Live campaigns'}
                      </div>
                    </div>
                  )}
                  {creators.length > 0 && (
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Archivo']">
                        {creators.length}
                      </div>
                      <div className="text-xs font-semibold text-[var(--text-secondary)]">
                        {creators.length === 1 ? 'Registered creator' : 'Registered creators'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {['Free during pilot', 'Direct deals, no agency', 'INR payments'].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)]/90 border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-primary)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 hidden md:block motion-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-[28px] bg-[var(--accent)]/8 blur-2xl" />
              <div className="relative rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-5 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                  {isBusiness ? 'What you get' : 'How you get paid'}
                </p>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-primary)]">
                    <span className="w-9 h-9 rounded-lg bg-[#FFE3D3] text-[#2B2622] flex items-center justify-center shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {isBusiness ? 'One brief, the right creators' : 'Open briefs with real budgets'}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {isBusiness
                          ? 'Fashion, beauty, fitness and 12 more verticals.'
                          : 'See compensation, deadline and deliverables before you pitch.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-primary)]">
                    <span className="w-9 h-9 rounded-lg bg-[#D9F2E6] text-[#2B2622] flex items-center justify-center shrink-0">
                      <Handshake className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">Direct chat after accept</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Align samples, scripts and posting dates in one thread.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
