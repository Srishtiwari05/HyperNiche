'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Building2, 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  Compass,
  FileCheck,
  Lock, 
  Mail, 
  Menu, 
  MessageSquare, 
  Moon, 
  ShieldCheck, 
  SlidersHorizontal,
  Sparkles, 
  Sun, 
  TrendingUp,
  UserRound, 
  X,
  BadgeCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';

interface PublicLandingProps {
  onCreateAccount: (preferredRole?: UserRole) => void;
  onLogin: () => void;
}

// 1. Diverse specialized Indian creators for marquee showcase
const CREATOR_SHOWCASE = [
  {
    name: 'Ritu Sharma',
    handle: '@rituculinary',
    niche: 'Food & Regional Recipes',
    followers: '62.4K',
    engagement: '13.8%',
    city: 'Delhi NCR',
    badge: 'Heritage flavours & everyday kitchen hacks',
    tone: 'bg-[#FFDEB5] dark:bg-[#593d18]',
    border: 'border-[#F0C895] dark:border-[#7d5725]',
    accentColor: '#E67E22',
  },
  {
    name: 'Tanya Mehra',
    handle: '@tanyastyled',
    niche: 'Streetwear & Vintage',
    followers: '78.2K',
    engagement: '14.5%',
    city: 'Mumbai',
    badge: 'Capsule wardrobes & Indian homegrown labels',
    tone: 'bg-[#D9D3FF] dark:bg-[#2e265c]',
    border: 'border-[#C2B7FC] dark:border-[#483d8a]',
    accentColor: '#7C5CFC',
  },
  {
    name: 'Arjun Nair',
    handle: '@arjuntechstudio',
    niche: 'Consumer Electronics',
    followers: '115K',
    engagement: '10.2%',
    city: 'Bengaluru',
    badge: 'Acoustic gear & ergonomic productivity setups',
    tone: 'bg-[#C9E7CD] dark:bg-[#1f4726]',
    border: 'border-[#A8DCB0] dark:border-[#32693b]',
    accentColor: '#27AE60',
  },
  {
    name: 'Aakash Rao',
    handle: '@aakash_moves',
    niche: 'Mobility & Calisthenics',
    followers: '68.9K',
    engagement: '16.1%',
    city: 'Pune',
    badge: 'Bodyweight strength & natural nutrition',
    tone: 'bg-[#FFDBE6] dark:bg-[#571f30]',
    border: 'border-[#F8B6CA] dark:border-[#7a2f46]',
    accentColor: '#E91E63',
  },
  {
    name: 'Neha Varma',
    handle: '@nehaskinlab',
    niche: 'Derm & Clean Beauty',
    followers: '44.3K',
    engagement: '13.4%',
    city: 'Hyderabad',
    badge: 'Ingredient breakdowns & climate skincare',
    tone: 'bg-[#FFF0B8] dark:bg-[#524416]',
    border: 'border-[#EAD589] dark:border-[#736021]',
    accentColor: '#D4AC0D',
  },
  {
    name: 'Sneha & Varun',
    handle: '@hiddenroutes_in',
    niche: 'Eco Stays & Roadtrips',
    followers: '102K',
    engagement: '12.7%',
    city: 'Chandigarh',
    badge: 'Slow travel escapes & mountain homestays',
    tone: 'bg-[#C6EBEE] dark:bg-[#1a444a]',
    border: 'border-[#A3DEE3] dark:border-[#2a6871]',
    accentColor: '#17A2B8',
  },
];

// 2. Interactive "The Collaboration Journey" steps
interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  previewType: 'brief' | 'identity' | 'angle' | 'approval' | 'workspace';
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: 'Brand publishes a structured brief',
    description: 'Every brief discloses the full INR compensation range, expected formats, submission milestones, and brand guidelines before any creator invests time pitching.',
    previewType: 'brief',
  },
  {
    step: 2,
    title: 'Two-tier verification protects both parties',
    description: 'We cross-verify corporate web domains and representative credentials. Emerging profiles without verification remain transparently labeled so creators make informed choices.',
    previewType: 'identity',
  },
  {
    step: 3,
    title: 'Creators propose a tailored angle',
    description: 'Skip robotic templates. Creators write a concise 3-sentence concept explaining how the brand naturally complements their upcoming content and audience.',
    previewType: 'angle',
  },
  {
    step: 4,
    title: 'Brand approves and locks milestone terms',
    description: 'Marketing leads inspect creator audience quality, past sample work, and concept fit, confirming chosen partners with zero agency friction.',
    previewType: 'approval',
  },
  {
    step: 5,
    title: 'Collaborate inside a dedicated workspace',
    description: 'Coordinate creative outlines, dispatch sample packages, review video previews, and approve milestones in our unified real-time chat.',
    previewType: 'workspace',
  },
];

// 3. Illustrative Sample Campaigns
const SAMPLE_CAMPAIGNS = [
  {
    id: 'samp-1',
    brand: 'BeanCraft Roasters',
    brandInitial: 'BC',
    brandBg: 'bg-[#F06A4D]/15 text-[#F06A4D] dark:bg-[#c81020]/20 dark:text-[#ff7070]',
    title: 'Artisan Cold Brew for Monsoon Study Sessions',
    category: 'Food & Beverage',
    budget: '₹30,000 – ₹55,000',
    deliverables: '1x Dedicated 60s Reel + 2x Story Frames',
    deadline: 'Pitch before 30 Nov',
    verified: true,
    niche: 'Food',
  },
  {
    id: 'samp-2',
    brand: 'Kala Sutra Atelier',
    brandInitial: 'KS',
    brandBg: 'bg-[#7C5CFC]/15 text-[#7C5CFC] dark:bg-[#7C5CFC]/20 dark:text-[#b4a4ff]',
    title: 'Heavyweight Winter Cotton & Oversized Knit Drop',
    category: 'Fashion & Streetwear',
    budget: '₹45,000 – ₹75,000',
    deliverables: '2x Styling Lookbooks + Reel Sound Integration',
    deadline: 'Pitch before 5 Dec',
    verified: true,
    niche: 'Fashion',
  },
  {
    id: 'samp-3',
    brand: 'Zenith Audio Labs',
    brandInitial: 'ZA',
    brandBg: 'bg-[#27AE60]/15 text-[#27AE60] dark:bg-[#27AE60]/20 dark:text-[#7ae6a6]',
    title: 'ANC Headphones Real Commute Test in Rush Hour',
    category: 'Consumer Electronics',
    budget: '₹50,000 – ₹85,000',
    deliverables: '1x Hands-on Field Review + YouTube Short',
    deadline: 'Pitch before 10 Dec',
    verified: true,
    niche: 'Tech',
  },
  {
    id: 'samp-4',
    brand: 'DermisBotanica',
    brandInitial: 'DB',
    brandBg: 'bg-[#E67E22]/15 text-[#E67E22] dark:bg-[#E67E22]/20 dark:text-[#ffb77a]',
    title: 'Barrier Defense Serum 7-Day Skin Reset Challenge',
    category: 'Clean Beauty & Wellness',
    budget: '₹25,000 – ₹42,000',
    deliverables: '1x UGC Demonstration + Texture Macro Clips',
    deadline: 'Pitch before 28 Nov',
    verified: false,
    niche: 'Beauty',
  },
];

// 4. FAQ Questions & Answers
const FAQ_ITEMS = [
  {
    question: 'Does Hyperniche deduct fees from creator payouts?',
    answer: 'Never. For creators, joining, publishing a profile, and pitching deals is entirely free. You receive 100% of your agreed commercial fee with no hidden agency cuts taken from your earnings.',
  },
  {
    question: 'How are brands and posting representatives authenticated?',
    answer: 'We evaluate brand accounts against their verified corporate domain, official web presence, and business email signatures. The actual individual posting the campaign is also validated separately to ensure authentic representation.',
  },
  {
    question: 'What does the "Unverified" label indicate?',
    answer: 'It simply means the profile or campaign is freshly onboarded and has not yet completed our full domain validation cycle. It is an honest transparency marker, not a penalty.',
  },
  {
    question: 'Can creators with nano or micro followings apply?',
    answer: 'Absolutely. Many of our partner brands prioritize targeted engagement, niche credibility, and strong creative aesthetics over vanity follower totals. There is no minimum follower barrier.',
  },
  {
    question: 'How are campaign deliverables and budgets structured?',
    answer: 'Every brief specifies an unambiguous INR budget range, clear deliverables (e.g. 1x Reel + Stories), and firm turnaround timelines. Both parties enter each collaboration with shared clarity.',
  },
  {
    question: 'How is Hyperniche different from traditional talent agencies?',
    answer: 'Traditional agencies take hefty 20-30% cuts and operate through opaque communication channels. Hyperniche provides a direct, software-first marketplace where brands and creators interact directly with speed and transparency.',
  },
];

export const PublicLanding: React.FC<PublicLandingProps> = ({ onCreateAccount, onLogin }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Navigation mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Audience toggle: 'creators' | 'brands'
  const [audienceTab, setAudienceTab] = useState<'creators' | 'brands'>('creators');

  // Interactive step selector
  const [activeStep, setActiveStep] = useState<number>(1);

  // Campaign sample category filter
  const [campaignCategory, setCampaignCategory] = useState<string>('All');

  // FAQ Accordion open index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const filteredCampaigns = campaignCategory === 'All'
    ? SAMPLE_CAMPAIGNS
    : SAMPLE_CAMPAIGNS.filter((c) => c.niche === campaignCategory);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent)]/20 selection:text-[var(--accent)] transition-colors duration-200">
      
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="aurora-blob-mint absolute -left-36 top-24 h-[32rem] w-[32rem] rounded-full bg-[#c9e7cd]/30 blur-[130px] dark:bg-[#c9e7cd]/10" />
        <div className="aurora-blob-blush absolute -right-24 top-[32rem] h-[34rem] w-[34rem] rounded-full bg-[var(--accent)]/15 blur-[150px] dark:bg-[#b3121e]/20" />
        <div className="aurora-blob-lavender absolute left-[45%] top-[14rem] h-[26rem] w-[26rem] rounded-full bg-[#d9d3ff]/25 blur-[140px] dark:bg-[#d9d3ff]/10" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER NAVIGATION
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-primary)]/85 border-b border-[var(--border-primary)] transition-colors">
        <div className="mx-auto flex h-[64px] sm:h-[72px] max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-left group cursor-pointer"
            >
              <div className="text-xl sm:text-2xl font-black tracking-tight font-['Archivo'] leading-none">
                Hyperniche<span className="text-[var(--accent)] transition-transform inline-block group-hover:scale-125">.</span>
              </div>
              <div className="hidden sm:block text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase mt-1">
                Direct creator commerce hub
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[var(--text-secondary)]">
            <button 
              onClick={() => scrollTo('how-it-works')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              The workflow
            </button>
            <button 
              onClick={() => scrollTo('for-audience')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Ecosystem benefits
            </button>
            <button 
              onClick={() => scrollTo('campaign-previews')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Brief catalog
            </button>
            <button 
              onClick={() => scrollTo('trust-promises')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Operating standards
            </button>
            <button 
              onClick={() => scrollTo('faq-section')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Common queries
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to bright mode' : 'Switch to dark mode'}
              title={isDark ? 'Bright mode' : 'Dark mode'}
              className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:shadow-xs cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-[var(--text-secondary)]" />}
            </button>

            {/* Log In */}
            <button
              onClick={onLogin}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-primary)] transition-all cursor-pointer whitespace-nowrap"
            >
              Sign in
            </button>

            {/* Get Started CTA */}
            <button
              onClick={() => onCreateAccount()}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-black shadow-xs hover:opacity-95 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Get started</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] ml-0.5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border-primary)] bg-[var(--bg-card)] px-4 py-4 space-y-2.5 animate-fade-in shadow-lg">
            <button 
              onClick={() => scrollTo('how-it-works')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              The workflow
            </button>
            <button 
              onClick={() => scrollTo('for-audience')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              Ecosystem benefits
            </button>
            <button 
              onClick={() => scrollTo('campaign-previews')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              Brief catalog
            </button>
            <button 
              onClick={() => scrollTo('trust-promises')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              Operating standards
            </button>
            <button 
              onClick={() => scrollTo('faq-section')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              Common queries
            </button>
            <div className="pt-3 border-t border-[var(--border-primary)] flex gap-2">
              <button
                onClick={onLogin}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-center"
              >
                Log in
              </button>
              <button
                onClick={() => onCreateAccount()}
                className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-black text-center"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-8 pb-14 sm:pt-16 sm:pb-24 border-b border-[var(--border-primary)] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Top Micro-badge */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] shadow-2xs text-center max-w-full">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse shrink-0" />
              <span className="truncate">Where focused creator communities power modern Indian commerce.</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-[72px] font-black tracking-tight leading-[1.1] font-['Archivo'] text-[var(--text-primary)] break-words">
              Direct sponsorships. <br className="hidden sm:inline" />
              <span className="relative inline-block mt-1 sm:mt-0">
                <span className="relative z-10 text-[var(--accent)] italic font-serif tracking-normal">Built on real trust.*</span>
                <span className="absolute left-0 bottom-1 sm:bottom-2 w-full h-2.5 sm:h-4 bg-[var(--accent-soft)] -z-0 -rotate-1 rounded-sm" />
              </span>
            </h1>

            {/* Shortened, Punchy Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Direct partnerships between Indian brands and specialized creators across 16 niches. Transparent INR budgets, zero agency cuts.
            </p>

            {/* Dual CTAs (Responsive on Mobile) */}
            <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
              <button
                onClick={() => onCreateAccount('creator')}
                className="w-full sm:w-auto justify-center group px-7 py-3.5 rounded-xl bg-[var(--accent)] text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Discover brand deals</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onCreateAccount('business')}
                className="w-full sm:w-auto justify-center px-7 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs sm:text-sm font-bold hover:border-[var(--text-primary)] hover:-translate-y-0.5 transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Launch campaign brief</span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Trust reassurance row */}
            <p className="mt-4 text-[11px] sm:text-xs font-medium text-[var(--text-muted)] tracking-wide">
              Upfront budget disclosures • Verified company domains • 100% free for creator applications
            </p>
          </div>

          {/* ── Visual Showcase Composition ── */}
          <div className="mt-10 sm:mt-20 max-w-5xl mx-auto relative">
            
            {/* Background dashed decorative connector */}
            <div className="hidden md:block absolute top-1/2 left-12 right-12 h-px border-t border-dashed border-[var(--border-primary)] -z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center relative z-10">
              
              {/* Left Polaroid: Ritu (Culinary creator) */}
              <div className="hero-card-float group relative rounded-2xl sm:rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all md:-rotate-2">
                {/* Washi tape sticker */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-5 sm:h-6 bg-[#FFE3D3] dark:bg-[#4a2820] opacity-80 -rotate-3 rounded-xs border-x border-dashed border-[#F06A4D]/30" />
                
                <div className="aspect-4/3 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#FFDEB5] to-[#FFE8CC] dark:from-[#3a2814] dark:to-[#573d1f] flex flex-col justify-end p-4 relative overflow-hidden">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-xs flex items-center justify-center font-black text-base sm:text-lg text-[#E67E22] mb-auto">
                    RS
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-black/40 text-white text-[10px] font-bold backdrop-blur-xs w-max">
                    Culinary Stories • 62K
                  </span>
                </div>
                
                <div className="mt-3.5">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Ritu champions authentic taste.</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Heritage flavours with modern charm.</p>
                </div>
              </div>

              {/* Center Highlight: The Campaign Deal Card (BeanCraft Roasters) */}
              <div className="relative rounded-2xl sm:rounded-3xl border-2 border-[var(--accent)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-xl md:scale-105 z-20">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white font-black flex items-center justify-center text-xs">
                      BC
                    </div>
                    <div>
                      <div className="text-xs font-black text-[var(--text-primary)]">BeanCraft Roasters</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Verified Brand Partner</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-[10px] font-bold flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Authenticated
                  </span>
                </div>

                <div className="py-2 sm:py-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
                    Spotlight Sponsorship
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] font-['Archivo'] leading-snug">
                    Artisan Cold Brew for Monsoon Study Sessions
                  </h2>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border-primary)] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-medium">Stated payout pool</div>
                    <div className="text-base sm:text-lg font-black text-[var(--text-primary)] font-['Archivo']">
                      ₹30,000 – ₹55,000
                    </div>
                  </div>
                  <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)]">
                    Reels & Stories
                  </span>
                </div>

                {/* Floating pill sticker */}
                <div className="absolute -bottom-3.5 right-4 bg-[var(--accent)] text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Pitches open now
                </div>
              </div>

              {/* Right Polaroid: Arjun (Consumer Tech) */}
              <div className="hero-card-float group relative rounded-2xl sm:rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all md:rotate-2">
                {/* Washi tape sticker */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-5 sm:h-6 bg-[#C9E7CD] dark:bg-[#1f4726] opacity-80 rotate-2 rounded-xs border-x border-dashed border-[#27AE60]/30" />
                
                <div className="aspect-4/3 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#C9E7CD] to-[#E3F5E5] dark:from-[#1b3d21] dark:to-[#2c5c34] flex flex-col justify-end p-4 relative overflow-hidden">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-xs flex items-center justify-center font-black text-base sm:text-lg text-[#27AE60] mb-auto">
                    AN
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-black/40 text-white text-[10px] font-bold backdrop-blur-xs w-max">
                    Tech & Audio • 115K
                  </span>
                </div>

                <div className="mt-3.5">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Arjun builds thoughtful setups.</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Hardware field tests that convert.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CREATOR SHOWCASE (Horizontal Marquee)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 border-b border-[var(--border-primary)] bg-[var(--bg-card)]/50 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] mb-2">
            <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Curated creator ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-['Archivo']">
            Targeted communities with unbeatable engagement.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl mx-auto">
            Hyperniche creators hold genuine credibility across tier-1 and tier-2 hubs, turning audience trust into measurable brand traction.
          </p>
        </div>

        {/* Marquee Track */}
        <div className="relative w-full overflow-hidden">
          <div className="hero-marquee-track flex gap-4 px-4 hover:[animation-play-state:paused]">
            {[...CREATOR_SHOWCASE, ...CREATOR_SHOWCASE].map((creator, i) => (
              <div
                key={`${creator.name}-${i}`}
                className="w-72 sm:w-80 shrink-0 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-4 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${creator.tone} ${creator.border} border flex items-center justify-center font-black text-sm shrink-0`}>
                    {creator.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-bold text-[var(--text-primary)] truncate">{creator.name}</div>
                      <BadgeCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">{creator.handle}</div>
                  </div>
                </div>

                <div className="mt-3 py-2 px-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] text-xs text-[var(--text-secondary)] line-clamp-1">
                  &ldquo;{creator.badge}&rdquo;
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--border-primary)] flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[var(--text-secondary)]">{creator.niche}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[var(--text-primary)]">{creator.followers}</span>
                    <span className="text-[var(--text-muted)]">• {creator.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE COLLABORATION JOURNEY ("Workflow")
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-[var(--border-primary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>Transparent operating model</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo'] tracking-tight">
              The collaboration journey, made seamless.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
              A structured, friction-free pipeline replacing messy WhatsApp forwards and weeks of unread agency emails.
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* Mobile Step Stepper Pills */}
            <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 pb-1 w-full">
              {WORKFLOW_STEPS.map((s) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    activeStep === s.step
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                      : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${activeStep === s.step ? 'bg-white/20 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-primary)]'}`}>
                    {s.step}
                  </span>
                  <span>{s.title.split(' ').slice(0, 2).join(' ')}</span>
                </button>
              ))}
            </div>

            {/* Desktop Steps Navigation */}
            <div className="hidden lg:block lg:col-span-6 space-y-4 w-full">
              {WORKFLOW_STEPS.map((s) => {
                const isActive = activeStep === s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => setActiveStep(s.step)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                      isActive 
                        ? 'bg-[var(--bg-card)] border-[var(--accent)] shadow-sm' 
                        : 'bg-[var(--bg-card)]/40 border-[var(--border-primary)] hover:border-[var(--text-secondary)]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-[var(--accent)] text-white' 
                        : 'bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)]'
                    }`}>
                      {s.step}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-base font-bold font-['Archivo'] ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {s.title}
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Preview Panel */}
            <div className="w-full lg:col-span-6 lg:sticky lg:top-28 rounded-2xl sm:rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)] mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Live Stage Preview • Milestone {activeStep} of 5
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-soft-text)] text-[10px] font-black">
                  Interactive Simulation
                </span>
              </div>

              {/* Dynamic Step Previews */}
              {activeStep === 1 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Simulated View: Stated campaign terms visible to creator network
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-[var(--text-primary)]">Artisan Cold Brew Launch</div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] font-bold">
                        Accepting Submissions
                      </span>
                    </div>
                    <div className="text-2xl font-black text-[var(--text-primary)] font-['Archivo'] mt-2">
                      ₹30,000 – ₹55,000
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      BeanCraft Roasters • Deadline 30 Nov • 1x 60s Reel
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--border-primary)] text-xs text-[var(--text-muted)]">
                      Deliverable criteria: Highlight morning coffee routines & bean origin. Zero hidden deductions.
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Simulated View: Verification indicators displayed across parties
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] space-y-3">
                    <div className="text-xs font-bold text-[var(--text-secondary)]">Corporate Credentials:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" /> Domain Validated (beancraft.in)
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" /> Domain Review Pending
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[var(--text-secondary)] pt-3">Designated Contact:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-xs font-bold">
                        <BadgeCheck className="w-4 h-4" /> Official Brand Representative
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-2">
                      Full transparency ensures creators engage exclusively with confirmed brand stakeholders.
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Simulated View: Creator creative angle proposal
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
                        RS
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">Ritu Sharma</div>
                        <div className="text-[11px] text-[var(--text-muted)]">62,400 audience • Regional Culinary</div>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] leading-relaxed font-sans">
                      <div className="font-bold text-[10px] uppercase text-[var(--accent)] mb-1">Proposed Creative Concept</div>
                      &ldquo;My followers frequently ask for non-bitter coffee pairings during monsoon mornings. I will film a rustic cold brew brewing sequence paired with homemade cardamom biscotti.&rdquo;
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>Proposed compensation: <strong>₹35,000</strong></span>
                      <span>Commitment: <strong>1x Dedicated Reel</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Simulated View: Brand approval & milestone confirmation
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">Artisan Cold Brew Launch</div>
                        <div className="text-xs text-[var(--text-muted)]">BeanCraft Roasters • ₹35,000 agreed payout</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-xs font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Concept Approved
                      </span>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-[var(--badge-green-bg)]/30 border border-[var(--badge-green-bg)] text-xs text-[var(--badge-green-text)]">
                      🎉 Collaboration confirmed. The integrated workspace and direct messaging have been activated.
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 5 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Simulated View: Integrated direct collaboration workspace
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        BC
                      </div>
                      <div className="p-3 rounded-2xl rounded-tl-xs bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs max-w-[85%] text-[var(--text-primary)]">
                        Welcome aboard Ritu! Loved your cardamom biscotti concept. We have dispatched the origin sampler beans to your Delhi studio.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 justify-end">
                      <div className="p-3 rounded-2xl rounded-tr-xs bg-[var(--accent)] text-white text-xs max-w-[85%]">
                        Thank you! Tracking received. I will have the rough cut ready for your team by Monday morning.
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-gray-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        RS
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Pill buttons */}
              <div className="mt-6 pt-4 border-t border-[var(--border-primary)] flex items-center justify-between">
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-primary)] text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  Previous stage
                </button>
                <div className="text-xs text-[var(--text-muted)] font-bold">
                  Stage {activeStep} of 5
                </div>
                <button
                  disabled={activeStep === 5}
                  onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  Advance stage
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. AUDIENCE ADVANTAGES (Creators vs Brands)
      ───────────────────────────────────────────────────────────── */}
      <section id="for-audience" className="py-16 sm:py-24 border-b border-[var(--border-primary)] bg-[var(--bg-card)]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Segmented Control Pill Switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-2xs">
              <button
                onClick={() => setAudienceTab('creators')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  audienceTab === 'creators'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <UserRound className="w-4 h-4" />
                <span>Creator Advantages</span>
              </button>

              <button
                onClick={() => setAudienceTab('brands')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  audienceTab === 'brands'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Brand Advantages</span>
              </button>
            </div>
          </div>

          {/* Creators View */}
          {audienceTab === 'creators' && (
            <div className="animate-fade-in">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
                  Monetize your craft with transparency and respect.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Stop settling for product-only barter deals or waiting months for unpaid invoices. 
                  Connect directly with authentic Indian brands offering guaranteed milestone compensation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#D9D3FF] text-[#7C5CFC] flex items-center justify-center font-black mb-4">
                    ₹
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Zero Commission Deductions
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    We never take a percentage from your creative fees. Every rupee agreed with the brand lands fully in your account.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#C9E7CD] text-[#27AE60] flex items-center justify-center font-black mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Upfront Budget Disclosures
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Never negotiate in the dark. Payout figures, format requirements, and dates are stated before you prepare a concept.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE3D3] text-[var(--accent)] flex items-center justify-center font-black mb-4">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Direct Decision-Maker Access
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Chat straight with founders and marketing heads. Speed up approvals and eliminate miscommunicated briefs.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => onCreateAccount('creator')}
                  className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-xs font-black shadow-xs hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Build creator profile (Complimentary)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Brands View */}
          {audienceTab === 'brands' && (
            <div className="animate-fade-in">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
                  Engage niche audiences with proven credibility.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Specialized micro-creators generate high-intent audience action that broad, disconnected celebrity promotions rarely achieve. Post once and receive tailored creator pitches.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE3D3] text-[var(--accent)] flex items-center justify-center font-black mb-4">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    High-Intent Communities
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Reach viewers who actively seek advice and buy products recommended by creators they follow loyally.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#C9E7CD] text-[#27AE60] flex items-center justify-center font-black mb-4">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Centralized Pitch Submissions
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Say goodbye to scattered DMs. Review clean, comparable creative proposals with real engagement figures in one place.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#D9D3FF] text-[#7C5CFC] flex items-center justify-center font-black mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    No Inflated Agency Overheads
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Invest your marketing budget directly into authentic production. Transparent milestone agreements guarantee deliverable quality.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => onCreateAccount('business')}
                  className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-xs font-black shadow-xs hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Post your brand opportunity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Operating Standards / Commitments ── */}
          <div id="trust-promises" className="mt-20 pt-12 border-t border-[var(--border-primary)]">
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Archivo'] mb-6">
              Our core operating commitments
            </h3>

            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] divide-y divide-[var(--border-primary)] overflow-hidden shadow-2xs">
              <div className="p-5 sm:p-6">
                <div className="text-sm font-bold text-[var(--text-primary)]">Zero application taxation</div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Hyperniche is free for creators to browse and pitch. If any brand solicits upfront fees or charges, report it immediately for swift removal.
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="text-sm font-bold text-[var(--text-primary)]">Guaranteed budget transparency</div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Every opportunity declares its full INR commercial scope prior to pitch submission. No downward renegotiation after approval.
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="text-sm font-bold text-[var(--text-primary)]">Comprehensive safety & moderation</div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Every interaction and creative exchange is guarded by active community guidelines, moderation logs, and identity validation.
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CAMPAIGN BRIEF CATALOG (Sample Deals)
      ───────────────────────────────────────────────────────────── */}
      <section id="campaign-previews" className="py-16 sm:py-24 border-b border-[var(--border-primary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] mb-2">
                <span>Deal inventory preview</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
                Explore representative campaign briefs.
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Illustrative sample briefs for preview purposes. Real-time briefs and live application forms unlock after member registration.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex overflow-x-auto no-scrollbar py-1 w-full md:w-auto items-center gap-1.5 sm:gap-2">
              {['All', 'Food', 'Fashion', 'Tech', 'Beauty'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCampaignCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    campaignCategory === cat
                      ? 'bg-[var(--accent)] text-white shadow-2xs'
                      : 'bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="rounded-2xl sm:rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${camp.brandBg} flex items-center justify-center font-black text-xs shrink-0`}>
                      {camp.brandInitial}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">{camp.brand}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{camp.category}</div>
                    </div>
                  </div>

                  {camp.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-[10px] font-bold">
                      <BadgeCheck className="w-3 h-3" /> Authenticated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] text-[10px] font-bold">
                      Pending Check
                    </span>
                  )}
                </div>

                <div className="mt-3 sm:mt-4">
                  <h3 className="text-sm sm:text-lg font-black text-[var(--text-primary)] font-['Archivo'] leading-snug">
                    {camp.title}
                  </h3>
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs py-2.5 px-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Committed budget pool</span>
                      <strong className="text-sm font-black text-[var(--text-primary)] font-['Archivo']">{camp.budget}</strong>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[var(--text-muted)] block">Deliverable scope</span>
                      <strong className="text-xs font-bold text-[var(--text-secondary)]">{camp.deliverables}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-primary)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">{camp.deadline}</span>
                  <button
                    onClick={() => onCreateAccount('creator')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    <span>Register to pitch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onCreateAccount()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all cursor-pointer"
            >
              <span>Explore all category verticals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. PLATFORM CAPABILITIES
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[var(--border-primary)] bg-[var(--bg-card)]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Engineered for creator commerce</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
              Engineered to make partnerships effortless.
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              From discovering authentic creator voices to pitch evaluation, real-time messaging, and deliverable approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFE3D3] text-[var(--accent)] flex items-center justify-center font-bold mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                16 Indian Market Verticals
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Filter by Streetwear, Derm Beauty, Tech, Desi Culinary, Fitness, and more. Locate creators aligned with your target buyer persona.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#D9D3FF] text-[#7C5CFC] flex items-center justify-center font-bold mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Built-in Direct Messaging
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Coordinate video scripts, clarify creative briefs, and share package tracking details without ever handing out personal phone numbers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#C9E7CD] text-[#27AE60] flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Dual Identity Validation
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Corporate web domains and individual poster roles are inspected separately, ensuring negotiations are safe and authentic.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFDBE6] text-[#E91E63] flex items-center justify-center font-bold mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Structured Application Pipeline
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Monitor incoming pitches, assess candidate metrics, and track active deliverables through clean, organized milestone stages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0B8] text-[#D4AC0D] flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Verified Creator Portfolios
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Exhibit your authentic social handles, audience engagement brackets, past commercial clips, and baseline rate expectations in INR.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#C6EBEE] text-[#17A2B8] flex items-center justify-center font-bold mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Firm Commercial Agreements
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Clear milestone contracts ensure mutual accountability: content criteria and payout dates are fixed prior to video recording.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. COMMON QUERIES (FAQ Accordion)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq-section" className="py-16 sm:py-24 border-b border-[var(--border-primary)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Straightforward details about onboarding, commercial verification, and collaboration terms.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] divide-y divide-[var(--border-primary)] overflow-hidden shadow-2xs">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--bg-primary)]/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                      {item.question}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed animate-fade-in">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. DIRECT CONTACT & FINAL CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[var(--border-primary)] bg-[var(--bg-card)]/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Direct Support Card */}
          <div className="max-w-xl mx-auto mb-16 p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Direct Support & Feedback
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)] font-['Archivo']">
              Connect with our founding team
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              Have questions regarding brand briefs, profile onboarding, or platform features? 
              Our founders review and respond to community messages promptly.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:support@hyperniche.in"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>support@hyperniche.in</span>
              </a>
            </div>
          </div>

          {/* Final Call to Action */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] font-['Archivo'] tracking-tight">
              Ready to elevate your partnerships?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md mx-auto">
              Join hundreds of independent creators and pioneering Indian consumer brands building direct, profitable collaborations.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => onCreateAccount('creator')}
                className="px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Launch creator profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onCreateAccount('business')}
                className="px-8 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs sm:text-sm font-bold hover:border-[var(--text-primary)] hover:-translate-y-0.5 transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Post brand opportunity</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onLogin}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline font-medium cursor-pointer"
              >
                Existing account holder? Sign in here
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="py-12 bg-[var(--bg-primary)] border-t border-[var(--border-primary)] text-xs text-[var(--text-secondary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="text-xl font-black tracking-tight font-['Archivo'] text-[var(--text-primary)]">
                Hyperniche<span className="text-[var(--accent)]">.</span>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                Direct creator commerce platform. Where Indian brands meet specialized creators with verified reach.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <div className="font-bold text-[var(--text-primary)] mb-3">Creators</div>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onCreateAccount('creator')} className="hover:text-[var(--text-primary)]">Launch creator profile</button></li>
                <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-[var(--text-primary)]">The collaboration workflow</button></li>
                <li><button onClick={() => scrollTo('campaign-previews')} className="hover:text-[var(--text-primary)]">Sponsorship catalog</button></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="font-bold text-[var(--text-primary)] mb-3">Brands</div>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onCreateAccount('business')} className="hover:text-[var(--text-primary)]">Post a brand opportunity</button></li>
                <li><button onClick={() => scrollTo('for-audience')} className="hover:text-[var(--text-primary)]">Targeted audience reach</button></li>
                <li><button onClick={() => scrollTo('trust-promises')} className="hover:text-[var(--text-primary)]">Corporate authentication</button></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <div className="font-bold text-[var(--text-primary)] mb-3">Hyperniche</div>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollTo('faq-section')} className="hover:text-[var(--text-primary)]">Common questions</button></li>
                <li><a href="mailto:support@hyperniche.in" className="hover:text-[var(--text-primary)]">support@hyperniche.in</a></li>
                <li><span className="text-[var(--text-muted)]">Built for the Indian Creator Economy</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-[var(--border-primary)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
            <div>
              © {new Date().getFullYear()} Hyperniche. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>Made with care in India</span>
              <span>100% Free for Creators</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
