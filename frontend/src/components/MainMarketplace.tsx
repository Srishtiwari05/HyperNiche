import React, { useState, useRef, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { CreatorCard } from './CreatorCard';
import { CampaignCard } from './CampaignCard';
import { UserProfile, Campaign } from '../types';
import { Search, Filter, SlidersHorizontal, X, ArrowUpDown, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';

interface MainMarketplaceProps {
  onOpenSendBrief: (creator: UserProfile) => void;
  onOpenApplyCampaign: (campaign: Campaign) => void;
  onViewProfile?: (creator: UserProfile) => void;
  onViewBusinessProfile?: (campaign: Campaign) => void;
}

export const MainMarketplace: React.FC<MainMarketplaceProps> = ({
  onOpenSendBrief,
  onOpenApplyCampaign,
  onViewProfile,
  onViewBusinessProfile,
}) => {
  const {
    creators,
    campaigns,
    applications,
    isLoadingData,
    dataError,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedPlatform,
    setSelectedPlatform,
    selectedFollowers,
    setSelectedFollowers,
  } = useMarketplace();

  const { userProfile } = useAuth();
  const role = userProfile?.role || 'creator';

  const [sortBy, setSortBy] = useState<'recommended' | 'rate-asc' | 'rate-desc'>('recommended');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Budget Filter Popover State
  const [appliedBudgetFrom, setAppliedBudgetFrom] = useState<number | null>(null);
  const [appliedBudgetTo, setAppliedBudgetTo] = useState<number | null>(null);
  const [inputBudgetFrom, setInputBudgetFrom] = useState<string>('');
  const [inputBudgetTo, setInputBudgetTo] = useState<string>('');
  const [budgetError, setBudgetError] = useState<string>('');
  const [isBudgetPopoverOpen, setIsBudgetPopoverOpen] = useState<boolean>(false);
  const budgetPopoverRef = useRef<HTMLDivElement>(null);

  // Close budget popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (budgetPopoverRef.current && !budgetPopoverRef.current.contains(e.target as Node)) {
        setIsBudgetPopoverOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsBudgetPopoverOpen(false);
      }
    };

    if (isBudgetPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBudgetPopoverOpen]);

  const handleToggleBudgetPopover = () => {
    if (!isBudgetPopoverOpen) {
      setInputBudgetFrom(appliedBudgetFrom !== null ? String(appliedBudgetFrom) : '');
      setInputBudgetTo(appliedBudgetTo !== null ? String(appliedBudgetTo) : '');
      setBudgetError('');
    }
    setIsBudgetPopoverOpen(!isBudgetPopoverOpen);
  };

  const handleApplyBudget = () => {
    setBudgetError('');
    const trimmedFrom = inputBudgetFrom.trim();
    const trimmedTo = inputBudgetTo.trim();

    if (!trimmedFrom && !trimmedTo) {
      setAppliedBudgetFrom(null);
      setAppliedBudgetTo(null);
      setIsBudgetPopoverOpen(false);
      return;
    }

    const fromVal = trimmedFrom ? parseFloat(trimmedFrom) : null;
    const toVal = trimmedTo ? parseFloat(trimmedTo) : null;

    if (fromVal !== null && (isNaN(fromVal) || fromVal <= 0)) {
      setBudgetError('Please enter a positive amount.');
      return;
    }

    if (toVal !== null && (isNaN(toVal) || toVal <= 0)) {
      setBudgetError('Please enter a positive amount.');
      return;
    }

    if (fromVal !== null && toVal !== null && fromVal > toVal) {
      setBudgetError('"Budget from" cannot be more than "Budget to".');
      return;
    }

    setAppliedBudgetFrom(fromVal);
    setAppliedBudgetTo(toVal);
    setIsBudgetPopoverOpen(false);
  };

  const handleClearBudget = () => {
    setInputBudgetFrom('');
    setInputBudgetTo('');
    setAppliedBudgetFrom(null);
    setAppliedBudgetTo(null);
    setBudgetError('');
    setIsBudgetPopoverOpen(false);
  };

  const getBudgetButtonLabel = () => {
    if (appliedBudgetFrom !== null && appliedBudgetTo !== null) {
      return `₹${appliedBudgetFrom.toLocaleString('en-IN')} – ₹${appliedBudgetTo.toLocaleString('en-IN')}`;
    }
    if (appliedBudgetFrom !== null) {
      return `From ₹${appliedBudgetFrom.toLocaleString('en-IN')}`;
    }
    if (appliedBudgetTo !== null) {
      return `Up to ₹${appliedBudgetTo.toLocaleString('en-IN')}`;
    }
    return 'Budget';
  };

  // Filter creators for Business view
  const filteredCreators = creators.filter((c) => {
    // Brand search setting: when letBrandsFindMe is false, hide from Browse creators & search
    // EXCEPT for businesses that already have an application from them
    if (c.letBrandsFindMe === false) {
      const isMyOwnProfile = userProfile && c.id === userProfile.id;
      const businessHasApplicationFromCreator = applications.some((app) => {
        const isCurrentBusiness = app.businessId === userProfile?.id;
        return isCurrentBusiness && app.creatorId === c.id;
      });
      if (!isMyOwnProfile && !businessHasApplicationFromCreator) {
        return false;
      }
    }

    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (c.name || '').toLowerCase();
      const handle = (c.handle || '').toLowerCase();
      const niche = (c.niche || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      const bio = (c.bio || '').toLowerCase();
      const match = name.includes(q) || handle.includes(q) || niche.includes(q) || city.includes(q) || bio.includes(q);
      if (!match) return false;
    }

    // Category match
    if (selectedCategory) {
      if ((c.niche || '').toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // Platform match
    if (selectedPlatform !== 'All') {
      if (!(c.platform || 'Instagram Reels').toLowerCase().includes(selectedPlatform.toLowerCase())) return false;
    }

    // Followers match
    if (selectedFollowers !== 'All') {
      if ((c.followers || '10K-50K') !== selectedFollowers) return false;
    }

    // Verified only filter
    if (verifiedOnly && !c.isVerified) {
      return false;
    }

    return true;
  });

  // Filter campaigns for Creator view
  const myAppliedCampaignIds = new Set(
    applications
      .filter((a) => a.creatorId === userProfile?.id)
      .map((a) => a.campaignId)
  );

  const filteredCampaigns = campaigns.filter((camp) => {
    // Show open campaigns that are not removed, not closed, and deadline not expired
    if (camp.status && camp.status !== 'open') return false;
    if (camp.status === 'closed') return false;
    if (camp.removed === true) return false;
    if (camp.deadline) {
      const deadlineDate = new Date(camp.deadline).getTime();
      const todayStart = new Date().setHours(0, 0, 0, 0);
      if (!isNaN(deadlineDate) && deadlineDate < todayStart) return false;
    }

    const title = camp.title || '';
    const businessName = camp.businessName || '';
    const category = camp.category || '';
    const description = camp.description || '';
    const budget = typeof camp.budget === 'number' && !isNaN(camp.budget) ? camp.budget : (Number(camp.budget) || 100);

    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        title.toLowerCase().includes(q) ||
        businessName.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category match
    if (selectedCategory) {
      if (category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // Platform match
    if (selectedPlatform !== 'All') {
      const campPlatforms = Array.isArray(camp.platforms) && camp.platforms.length > 0
        ? camp.platforms
        : (camp.platform ? [camp.platform] : ['Instagram Reels']);
      const matchesPlat = campPlatforms.some((p) =>
        p.toLowerCase().includes(selectedPlatform.toLowerCase()) ||
        selectedPlatform.toLowerCase().includes(p.toLowerCase())
      );
      if (!matchesPlat) return false;
    }

    // Budget range filter by campaign budget per creator
    if (appliedBudgetFrom !== null && budget < appliedBudgetFrom) return false;
    if (appliedBudgetTo !== null && budget > appliedBudgetTo) return false;

    // Verified only filter
    if (verifiedOnly && !camp.businessIsVerified) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    const budgetA = typeof a.budget === 'number' ? a.budget : 100;
    const budgetB = typeof b.budget === 'number' ? b.budget : 100;
    if (sortBy === 'rate-asc') return budgetA - budgetB;
    if (sortBy === 'rate-desc') return budgetB - budgetA;
    return 0;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedPlatform('All');
    setSelectedFollowers('All');
    setAppliedBudgetFrom(null);
    setAppliedBudgetTo(null);
    setInputBudgetFrom('');
    setInputBudgetTo('');
    setBudgetError('');
    setIsBudgetPopoverOpen(false);
    setSortBy('recommended');
    setVerifiedOnly(false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== null ||
    selectedPlatform !== 'All' ||
    (role === 'business' && selectedFollowers !== 'All') ||
    (role === 'creator' && (appliedBudgetFrom !== null || appliedBudgetTo !== null)) ||
    verifiedOnly;

  return (
    <section className="py-8 min-h-[500px] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search & Filter Header Bar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mb-6 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  role === 'business'
                    ? 'Search creators by name, handle, niche, or city...'
                    : 'Search brand deals by campaign title, brand, or deliverable...'
                }
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Controls Row: Platform, Followers, Budget Popover (creator deals only), Sort, Verified */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Platform Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-secondary)] hidden sm:inline">
                  Platform:
                </span>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="px-2.5 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  <option value="All">All platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                  <option value="Snapchat">Snapchat</option>
                  <option value="ShareChat">ShareChat</option>
                  <option value="Moj">Moj</option>
                </select>
              </div>

              {/* Followers Filter (Only for Business browsing creators) */}
              {role === 'business' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[var(--text-secondary)] hidden sm:inline">
                    Followers:
                  </span>
                  <select
                    value={selectedFollowers}
                    onChange={(e) => setSelectedFollowers(e.target.value)}
                    className="px-2.5 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="All">All follower sizes</option>
                    <option value="Under 10K">Under 10K</option>
                    <option value="10K-50K">10K - 50K</option>
                    <option value="50K-250K">50K - 250K</option>
                    <option value="Above 250K">Above 250K</option>
                  </select>
                </div>
              )}

              {/* BUDGET FILTER: Popover Menu Button (Shown on campaigns list only) */}
              {role === 'creator' && (
                <div className="relative inline-block" ref={budgetPopoverRef}>
                  <button
                    type="button"
                    onClick={handleToggleBudgetPopover}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      appliedBudgetFrom !== null || appliedBudgetTo !== null
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-2xs font-bold'
                        : isBudgetPopoverOpen
                        ? 'bg-[var(--bg-card-subtle)] text-[var(--text-primary)] border-[var(--accent)]'
                        : 'bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--border-primary)] hover:border-[var(--accent)]'
                    }`}
                  >
                    <span>{getBudgetButtonLabel()}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isBudgetPopoverOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Small Popover Menu */}
                  {isBudgetPopoverOpen && (
                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-primary)]">
                        <span className="text-xs font-bold text-[var(--text-primary)] font-['Archivo']">
                          Filter by Campaign Budget
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsBudgetPopoverOpen(false)}
                          className="p-1 rounded-lg hover:bg-[var(--border-primary)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {budgetError && (
                        <div className="mb-3 p-2 rounded-lg bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] text-[11px] font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{budgetError}</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                            Budget from (₹)
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 500"
                            value={inputBudgetFrom}
                            onChange={(e) => setInputBudgetFrom(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                            Budget to (₹)
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 50000"
                            value={inputBudgetTo}
                            onChange={(e) => setInputBudgetTo(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-primary)]/60">
                          <button
                            type="button"
                            onClick={handleClearBudget}
                            className="px-3 py-1.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyBudget}
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-2xs"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sort by (for Campaign deals) */}
              {role === 'creator' && (
                <div className="flex items-center gap-1.5">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="rate-asc">Budget: Low to High</option>
                    <option value="rate-desc">Budget: High to Low</option>
                  </select>
                </div>
              )}

              {/* Verified Filter Toggle */}
              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  verifiedOnly
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-2xs'
                    : 'bg-[var(--input-bg)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified only</span>
              </button>

              {/* Clear active filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-[var(--accent)] hover:underline px-2 py-1 cursor-pointer"
                >
                  Clear filters
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Dynamic Category Pill Indicator */}
        {selectedCategory && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-[var(--text-secondary)]">Showing niche category:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-primary)]">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory(null)}
                className="hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>
        )}

        {/* Header Count & Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
              {role === 'business' ? 'Vetted Indian Content Creators' : 'Open Brand Sponsorship Campaigns'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {role === 'business'
                ? `Showing ${filteredCreators.length} active creators available for direct collaborations`
                : `Showing ${filteredCampaigns.length} brand briefs open for application`}
            </p>
          </div>
        </div>

        {/* Database Error Alert */}
        {dataError && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dataError}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="underline hover:opacity-80 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoadingData ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-[var(--bg-card)]/50 border border-[var(--border-primary)] rounded-2xl">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-[var(--text-secondary)] font-['Archivo']">
              Loading {role === 'business' ? 'creators' : 'campaigns'} from database...
            </span>
          </div>
        ) : (
          /* Content Grid: Creators for Business / Campaigns for Creator */
          role === 'business' ? (
          filteredCreators.length === 0 ? (
            <div className="text-center py-20 px-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl">
              <p className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                {hasActiveFilters ? 'No creators found' : 'No creators yet.'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Try loosening your platform, follower, or budget filters to explore more creators.'
                  : 'New creators will appear here once they complete profile setup and enable discovery.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCreators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onSendBrief={onOpenSendBrief}
                  onViewProfile={onViewProfile}
                />
              ))}
            </div>
          )
        ) : (
          filteredCampaigns.length === 0 ? (
            <div className="text-center py-20 px-4 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl">
              <p className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                {hasActiveFilters ? 'No campaigns match your filters' : 'No campaigns yet. Be the first to post one.'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'No brand deals found for the current search criteria or budget range.'
                  : 'Brand deals and sponsored content opportunities posted by businesses will appear here.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCampaigns.map((camp) => (
                <CampaignCard
                  key={camp.id}
                  campaign={camp}
                  onApply={onOpenApplyCampaign}
                  hasApplied={myAppliedCampaignIds.has(camp.id)}
                  onViewBusinessProfile={onViewBusinessProfile}
                />
              ))}
            </div>
          )
        ))}

      </div>
    </section>
  );
};
