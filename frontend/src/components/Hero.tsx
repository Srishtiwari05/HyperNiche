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
    <section className="relative overflow-hidden border-b border-[var(--border-primary)] bg-[var(--bg-primary)] pb-10 pt-6 transition-colors sm:pt-8 lg:pb-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-orb hero-orb--mint absolute -left-20 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#CDE9D9] opacity-30 blur-[100px]" />
        <div className="hero-orb hero-orb--blush absolute -bottom-24 right-0 h-[26rem] w-[26rem] rounded-full bg-[#FFDCCF] opacity-30 blur-[110px]" />
        <div className="hero-orb hero-orb--lavender absolute left-1/2 top-14 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-[#E7DEFF] opacity-20 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-7 lg:px-10 xl:px-12">
        <div className="hero-marquee mb-8 overflow-hidden rounded-[22px] border border-[var(--border-primary)] bg-[var(--bg-card)]/70 p-2 shadow-[0_10px_30px_rgba(43,38,34,0.05)] backdrop-blur-sm">
          <div className="hero-marquee-track flex min-w-max items-center gap-3">
            {[...creatorShowcase, ...creatorShowcase].map((creator, index) => (
              <div
                key={`${creator.name}-${index}`}
                className="hero-card-float flex min-w-[220px] items-center gap-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] px-3 py-2.5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${creator.tone} text-sm font-black text-[var(--text-primary)]`}>
                  {creator.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--text-primary)]">{creator.name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{creator.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14 xl:gap-16">
          <div className="motion-fade-up lg:col-span-7 xl:pr-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)]/80 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[var(--text-secondary)] uppercase shadow-[0_8px_18px_rgba(43,38,34,0.04)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span>{isBusiness ? 'Hire proven creators' : 'Find paid deals that match your niche'}</span>
            </div>

            <h1 className="max-w-[920px] text-[clamp(3rem,6vw,7rem)] leading-[0.9] tracking-[-0.065em] text-[var(--text-primary)] font-black font-['Archivo']">
              {isBusiness ? (
                <>
                  Get your product in front of the{' '}
                  <span className="inline-block rounded-[26px] bg-[var(--bg-card)] px-2 py-1 text-[var(--text-primary)] shadow-[0_14px_30px_rgba(43,38,34,0.08)]">
                    right audience
                  </span>
                  .
                </>
              ) : (
                <>
                  Turn your audience into{' '}
                  <span className="inline-block rounded-[26px] bg-[var(--bg-card)] px-2 py-1 text-[var(--text-primary)] shadow-[0_14px_30px_rgba(43,38,34,0.08)]">
                    income.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-5 max-w-[680px] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base sm:leading-[1.6]">
              {isBusiness
                ? 'Discover creators, connect with brands, and manage opportunities in one place.'
                : 'Your next collaboration starts here.'}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isBusiness ? (
                <>
                  <button
                    onClick={onPostCampaign}
                    className="group inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(240,106,77,0.35)]"
                  >
                    <span>Post a campaign</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <button
                    onClick={onBrowseCreators}
                    className="rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--text-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--text-primary)]"
                  >
                    Browse creators
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onSeeOpenDeals}
                    className="group inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(240,106,77,0.35)]"
                  >
                    <span>See open deals</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <button
                    onClick={onBrowseCategories}
                    className="rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--text-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--text-primary)]"
                  >
                    Browse categories
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--border-primary)] pt-5">
              {campaigns.length > 0 && (
                <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)]/80 px-4 py-3 shadow-[0_10px_18px_rgba(43,38,34,0.03)]">
                  <div className="text-xl font-black text-[var(--text-primary)] font-['Archivo']">{campaigns.length}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    {campaigns.length === 1 ? 'Live campaign' : 'Live campaigns'}
                  </div>
                </div>
              )}
              {creators.length > 0 && (
                <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)]/80 px-4 py-3 shadow-[0_10px_18px_rgba(43,38,34,0.03)]">
                  <div className="text-xl font-black text-[var(--text-primary)] font-['Archivo']">{creators.length}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    {creators.length === 1 ? 'Creator' : 'Creators'}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {['Free during pilot', 'Direct deals', 'INR payouts'].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)]/80 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-primary)]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="motion-fade-up lg:col-span-5 xl:pl-4" style={{ animationDelay: '120ms' }}>
            <div className="relative mx-auto max-w-[520px]">
              <div className="hero-surface absolute -inset-4 rounded-[32px] bg-[var(--accent)]/10 blur-2xl" />
              <div className="hero-surface relative rounded-[30px] border border-[var(--border-primary)] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_40px_rgba(43,38,34,0.08)]">
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-primary)] bg-[var(--bg-card)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Featured match
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[var(--badge-yellow-bg)] px-2 py-1 text-[10px] font-bold text-[var(--badge-yellow-text)]">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </div>
                </div>

                <div className="rounded-[24px] border border-[var(--border-primary)] bg-[var(--bg-card)] p-4">
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--bg-card-subtle)] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#FFDDBB,#F7C7A3)] text-base font-black text-[var(--text-primary)]">
                        A
                      </div>
                      <div>
                        <div className="text-base font-black text-[var(--text-primary)]">Aisha Mehta</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">Beauty & lifestyle</div>
                      </div>
                    </div>
                    <div className="rounded-full bg-[var(--bg-card)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                      High fit
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card-subtle)] p-3">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Reach</span>
                      </div>
                      <div className="mt-2 text-lg font-black text-[var(--text-primary)]">1.4M</div>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card-subtle)] p-3">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Megaphone className="h-4 w-4 text-[var(--accent)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Deals</span>
                      </div>
                      <div className="mt-2 text-lg font-black text-[var(--text-primary)]">18</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card-subtle)] p-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFE3D3] text-[var(--text-primary)]">
                        <Handshake className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[var(--text-primary)]">Direct collaboration</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">No agency layer, clear scope</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card-subtle)] p-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D9F2E6] text-[var(--text-primary)]">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[var(--text-primary)]">Fast onboarding</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">Get matched in under 48 hours</div>
                      </div>
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
