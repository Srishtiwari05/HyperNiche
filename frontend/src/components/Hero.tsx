import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

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

  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          
          {/* Subtle category badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
            <span>India creator commerce platform</span>
          </div>

          {/* Heading - Desktop 40-56px, normal sentence case */}
          {role === 'business' ? (
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] lg:leading-[1.16] font-black text-[var(--text-primary)] tracking-tight font-['Archivo']">
              Get your product in front of the right audience.
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] lg:leading-[1.16] font-black text-[var(--text-primary)] tracking-tight font-['Archivo']">
              Turn your audience into income.
            </h1>
          )}

          {/* Subheading */}
          <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {role === 'business'
              ? 'Connect directly with verified creators in fashion, tech, fitness, beauty and 12+ other verticals. Zero agency markups. Milestone-based INR contracts.'
              : 'Discover transparent brand sponsorships from leading Indian D2C brands. Pitch your creative vision, negotiate rates in INR, and get paid securely upon publishing.'}
          </p>

          {/* Action Buttons in Sentence Case */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            {role === 'business' ? (
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

          {/* Stats & Trust row: Real counts + true statements only */}
          <div className="mt-8 pt-6 border-t border-[var(--border-primary)] flex flex-col gap-4">
            
            {/* Real counts from database when they exist */}
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

            {/* True statements row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Free during pilot</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Direct deals, no agency</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>INR payments</span>
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

