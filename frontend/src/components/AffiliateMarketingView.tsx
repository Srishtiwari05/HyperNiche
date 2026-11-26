import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../config/categories';
import { 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Percent, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Tag, 
  Calendar, 
  ArrowUpRight, 
  Sparkles, 
  X,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  Send
} from 'lucide-react';

export interface AffiliateProgram {
  id: string;
  brandId: string;
  productName: string;
  storeUrl: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  discountPercent: number;
  codePrefix: string;
  niche: string;
  cookieDays: number;
  description: string;
  status: 'active' | 'paused';
  createdAt: string;
  clicks: number;
  orders: number;
  revenue: number;
  payoutPending: number;
}

export interface AffiliateCreator {
  id: string;
  programId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  promoCode: string;
  trackingUrl: string;
  clicks: number;
  orders: number;
  totalSales: number;
  commissionEarned: number;
  payoutStatus: 'paid' | 'pending';
}

interface AffiliateMarketingViewProps {
  onBrowseCreators?: () => void;
}

const DEFAULT_PROGRAMS: AffiliateProgram[] = [
  {
    id: 'aff_prog_1',
    brandId: 'default',
    productName: 'Signature Organic Apparel & Streetwear',
    storeUrl: 'https://store.hyperniche.in/collection/streetwear',
    commissionType: 'percentage',
    commissionValue: 15,
    discountPercent: 10,
    codePrefix: 'STREET',
    niche: 'Fashion',
    cookieDays: 30,
    description: 'Promote our bestselling oversized heavy-gsm drop. 15% revenue share on all verified orders.',
    status: 'active',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    clicks: 1420,
    orders: 86,
    revenue: 129000,
    payoutPending: 19350,
  },
  {
    id: 'aff_prog_2',
    brandId: 'default',
    productName: 'Veda Skin Glow Serum & Sunscreen Combo',
    storeUrl: 'https://store.hyperniche.in/products/glow-combo',
    commissionType: 'percentage',
    commissionValue: 18,
    discountPercent: 15,
    codePrefix: 'GLOW',
    niche: 'Beauty',
    cookieDays: 30,
    description: 'Targeted for clean beauty creators. High conversion skincare pack.',
    status: 'active',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    clicks: 2180,
    orders: 142,
    revenue: 177500,
    payoutPending: 31950,
  },
];

const DEFAULT_CREATORS: AffiliateCreator[] = [
  {
    id: 'aff_cr_1',
    programId: 'aff_prog_1',
    creatorName: 'Ritu Varma',
    creatorHandle: '@ritustyled',
    promoCode: 'RITU10',
    trackingUrl: 'https://hyperniche.in/ref/ritu/street',
    clicks: 680,
    orders: 48,
    totalSales: 72000,
    commissionEarned: 10800,
    payoutStatus: 'pending',
  },
  {
    id: 'aff_cr_2',
    programId: 'aff_prog_1',
    creatorName: 'Kabir Mehta',
    creatorHandle: '@kabir_fits',
    promoCode: 'KABIR10',
    trackingUrl: 'https://hyperniche.in/ref/kabir/street',
    clicks: 740,
    orders: 38,
    totalSales: 57000,
    commissionEarned: 8550,
    payoutStatus: 'paid',
  },
  {
    id: 'aff_cr_3',
    programId: 'aff_prog_2',
    creatorName: 'Ananya Deshmukh',
    creatorHandle: '@ananyaskincare',
    promoCode: 'ANANYA15',
    trackingUrl: 'https://hyperniche.in/ref/ananya/glow',
    clicks: 1150,
    orders: 84,
    totalSales: 105000,
    commissionEarned: 18900,
    payoutStatus: 'pending',
  },
];

export const AffiliateMarketingView: React.FC<AffiliateMarketingViewProps> = ({
  onBrowseCreators,
}) => {
  const { userProfile } = useAuth();
  const brandId = userProfile?.id || 'guest';
  const storageKey = `hyperniche_affiliates_${brandId}`;

  const [programs, setPrograms] = useState<AffiliateProgram[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return DEFAULT_PROGRAMS;
  });

  const [creators] = useState<AffiliateCreator[]>(DEFAULT_CREATORS);
  const [activeTab, setActiveTab] = useState<'programs' | 'creators' | 'payouts'>('programs');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Form states for new affiliate program
  const [productName, setProductName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [commissionValue, setCommissionValue] = useState('15');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [codePrefix, setCodePrefix] = useState('SAVE');
  const [niche, setNiche] = useState(CATEGORIES[0]?.name || 'Fashion');
  const [cookieDays, setCookieDays] = useState('30');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Persist programs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(programs));
    } catch { /* ignore */ }
  }, [programs, storageKey]);

  // Aggregate stats
  const totalRevenue = programs.reduce((acc, p) => acc + (p.revenue || 0), 0);
  const totalOrders = programs.reduce((acc, p) => acc + (p.orders || 0), 0);
  const totalClicks = programs.reduce((acc, p) => acc + (p.clicks || 0), 0);
  const totalPendingPayout = programs.reduce((acc, p) => acc + (p.payoutPending || 0), 0);
  const avgConversionRate = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : '0.0';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p
      )
    );
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!productName.trim()) {
      setFormError('Please enter a product or program name.');
      return;
    }
    if (!storeUrl.trim()) {
      setFormError('Please enter your online store or landing page URL.');
      return;
    }
    const commVal = parseFloat(commissionValue);
    if (isNaN(commVal) || commVal <= 0) {
      setFormError('Please enter a valid positive commission amount.');
      return;
    }

    const newProg: AffiliateProgram = {
      id: `aff_prog_${Date.now()}`,
      brandId,
      productName: productName.trim(),
      storeUrl: storeUrl.trim().startsWith('http') ? storeUrl.trim() : `https://${storeUrl.trim()}`,
      commissionType,
      commissionValue: commVal,
      discountPercent: parseInt(discountPercent, 10) || 10,
      codePrefix: (codePrefix.trim() || 'PROMO').toUpperCase(),
      niche,
      cookieDays: parseInt(cookieDays, 10) || 30,
      description: description.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
      clicks: 0,
      orders: 0,
      revenue: 0,
      payoutPending: 0,
    };

    setPrograms([newProg, ...programs]);
    setIsCreateModalOpen(false);

    // Reset form
    setProductName('');
    setStoreUrl('');
    setCommissionValue('15');
    setDiscountPercent('10');
    setCodePrefix('SAVE');
    setDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200 transition-colors">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-primary)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--accent)] text-white shadow-2xs font-['Archivo']">
              Performance Engine
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              0% Hyperniche take rate
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-['Archivo']">
            Affiliate Marketing
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Turn verified content creators into revenue-generating brand partners. Track coupon codes, attribution links, and sales commissions with automatic reporting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onBrowseCreators && (
            <button
              onClick={onBrowseCreators}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-2xs cursor-pointer"
            >
              <Users className="w-4 h-4 text-[var(--accent)]" />
              <span>Browse creators</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch affiliate program</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Tracked Sales (GMV)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Archivo']">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-medium text-[var(--badge-green-text)] mt-1 block">
            ↑ {totalOrders} orders generated
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Active Affiliates
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Archivo']">
            {creators.length} Creators
          </div>
          <span className="text-[11px] font-medium text-[var(--text-muted)] mt-1 block">
            Across 2 live campaigns
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Pending Commissions
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Archivo']">
            ₹{totalPendingPayout.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-medium text-[var(--text-muted)] mt-1 block">
            Settlement on 1st of month
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              Avg. Conversion
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--input-bg)] text-[var(--text-primary)] flex items-center justify-center font-bold border border-[var(--border-primary)]">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Archivo']">
            {avgConversionRate}%
          </div>
          <span className="text-[11px] font-medium text-[var(--text-muted)] mt-1 block">
            {totalClicks.toLocaleString('en-IN')} referral clicks
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[var(--border-primary)] pb-3">
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'programs'
              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]/40'
          }`}
        >
          <span>Affiliate Programs ({programs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('creators')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'creators'
              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]/40'
          }`}
        >
          <span>Creator Partners ({creators.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]/40'
          }`}
        >
          <span>Payouts & Terms</span>
        </button>
      </div>

      {/* TAB 1: AFFILIATE PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          {programs.map((prog) => {
            const trackingLink = `https://hyperniche.in/ref/${(userProfile?.handle || '@brand').replace('@', '')}/${prog.codePrefix.toLowerCase()}`;
            const isCopied = copiedLink === prog.id;

            return (
              <div
                key={prog.id}
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-2xs transition-all hover:border-[var(--accent)]/40 flex flex-col justify-between"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--border-primary)]">
                        {prog.niche}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        prog.status === 'active'
                          ? 'bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] border-[var(--badge-green-text)]/30'
                          : 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] border-[var(--badge-yellow-text)]/30'
                      }`}>
                        {prog.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] font-mono">
                        {prog.cookieDays} days cookie window
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Archivo']">
                      {prog.productName}
                    </h3>

                    {prog.description && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {prog.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <a
                        href={prog.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--accent)] font-semibold hover:underline"
                      >
                        <span>Target Store Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Program Commercial terms badge */}
                  <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-3 p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)] shrink-0 min-w-[200px]">
                    <div>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] block text-left lg:text-right">
                        Creator Commission
                      </span>
                      <span className="text-lg font-black text-[var(--accent)] font-['Archivo'] block text-left lg:text-right">
                        {prog.commissionType === 'percentage' ? `${prog.commissionValue}% of sale` : `₹${prog.commissionValue} per order`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] block text-left lg:text-right">
                        Audience Discount
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)] block text-left lg:text-right">
                        {prog.discountPercent}% OFF with creator code
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking Link & Actions Bar */}
                <div className="mt-5 pt-4 border-t border-[var(--border-primary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 max-w-xl">
                    <span className="text-xs font-semibold text-[var(--text-muted)] shrink-0">
                      Master Link:
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] font-mono flex-1 overflow-hidden">
                      <span className="truncate">{trackingLink}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(trackingLink, prog.id)}
                      className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
                      title="Copy affiliate tracking link"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleToggleStatus(prog.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      {prog.status === 'active' ? 'Pause program' : 'Activate program'}
                    </button>
                    {onBrowseCreators && (
                      <button
                        onClick={onBrowseCreators}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold hover:bg-[var(--accent)] hover:text-white transition-all cursor-pointer shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Invite creators</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CREATOR PARTNERS & CODES */}
      {activeTab === 'creators' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-[var(--border-primary)] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)] font-['Archivo']">
                Active Creator Affiliates
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Creators currently promoting your affiliate campaigns with custom audience codes
              </p>
            </div>
            {onBrowseCreators && (
              <button
                onClick={onBrowseCreators}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard more creators</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--input-bg)] border-b border-[var(--border-primary)] text-[var(--text-muted)] font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Promo Code</th>
                  <th className="py-3 px-4">Tracking Link</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-right">GMV Generated</th>
                  <th className="py-3 px-4 text-right">Commission</th>
                  <th className="py-3 px-4 text-center">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)] font-medium text-[var(--text-primary)]">
                {creators.map((c) => {
                  const isCopied = copiedLink === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-[var(--border-primary)]/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--text-primary)] font-['Archivo']">
                          {c.creatorName}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono">
                          {c.creatorHandle}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[var(--accent)]">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--accent-soft)] border border-[var(--accent)]/30">
                          {c.promoCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleCopy(c.trackingUrl, c.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] font-mono cursor-pointer"
                          title="Copy creator's referral URL"
                        >
                          <span className="truncate max-w-[140px]">{c.trackingUrl}</span>
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">{c.clicks}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">{c.orders}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">₹{c.totalSales.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--badge-green-text)]">₹{c.commissionEarned.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.payoutStatus === 'paid'
                            ? 'bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]'
                            : 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)]'
                        }`}>
                          {c.payoutStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUTS & TERMS */}
      {activeTab === 'payouts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4">
            <h3 className="font-bold text-base text-[var(--text-primary)] font-['Archivo'] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent)]" />
              <span>Commission Settlement Policy</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              All creator affiliate commissions are calculated on a net-30 basis to account for return/cancellation windows on your e-commerce store.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">Settlement Frequency</span>
                <span className="font-bold text-[var(--text-primary)]">Monthly (1st of each month)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">Attribution Model</span>
                <span className="font-bold text-[var(--text-primary)]">Last-Click & Promo Code priority</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">Platform Commission</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">0% (Completely Free)</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] space-y-4">
            <h3 className="font-bold text-base text-[var(--text-primary)] font-['Archivo'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>How Creator Affiliates Work</span>
            </h3>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>You create an affiliate program with your store link and commission rate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Creators receive custom referral links and promo codes (e.g. <code>@ritustyled</code> gets <code>RITU10</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>When their followers shop using the link or code, the sale is recorded instantly without any intermediary cuts.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* CREATE AFFILIATE PROGRAM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl transition-colors">
            
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
                  Launch Affiliate Program
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Configure commission rates and promo codes for creators
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--border-primary)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-4 p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 border border-red-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProgram} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-[var(--text-primary)]">
                  Product / Program Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Summer Drop Oversized Tees, Glow Skincare Kit"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-[var(--text-primary)]">
                  Target Store / Product URL *
                </label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://yourbrand.in/products/oversized-tee"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-[var(--text-primary)]">
                    Commission Model *
                  </label>
                  <select
                    value={commissionType}
                    onChange={(e) => setCommissionType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-[var(--text-primary)]">
                    Commission Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={commissionValue}
                      onChange={(e) => setCommissionValue(e.target.value)}
                      placeholder={commissionType === 'percentage' ? '15' : '200'}
                      required
                      min={1}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                      {commissionType === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-[var(--text-primary)]">
                    Audience Discount (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="10"
                    min={0}
                    max={90}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-[var(--text-primary)]">
                    Primary Niche
                  </label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-[var(--text-primary)]">
                  Guidelines / Notes for Creators
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Share link in your Instagram bio and stories. Tag @brand in your reels."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-primary)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
                >
                  Launch program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
