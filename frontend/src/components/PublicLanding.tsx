'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Building2, 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  ExternalLink, 
  Lock, 
  Mail, 
  Menu, 
  MessageSquare, 
  Moon, 
  ShieldCheck, 
  Sparkles, 
  Sun, 
  UserRound, 
  X,
  BadgeCheck,
  TrendingUp,
  SlidersHorizontal,
  Compass,
  FileCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';

interface PublicLandingProps {
  onCreateAccount: (preferredRole?: UserRole) => void;
  onLogin: () => void;
}

// 1. Illustrative Indian creators for marquee showcase
const CREATOR_SHOWCASE = [
  {
    name: 'Asha Patel',
    handle: '@ashafooddiaries',
    niche: 'Food & Cooking',
    followers: '48.2K',
    engagement: '11.8%',
    city: 'Mumbai',
    badge: 'Regional recipes & quick snacks',
    tone: 'bg-[#FFDEB5] dark:bg-[#593d18]',
    border: 'border-[#F0C895] dark:border-[#7d5725]',
    accentColor: '#E67E22',
  },
  {
    name: 'Kabir Verma',
    handle: '@kabirfits',
    niche: 'Streetwear & Fashion',
    followers: '84.5K',
    engagement: '14.2%',
    city: 'Delhi NCR',
    badge: 'Outfit breakdowns & thrift finds',
    tone: 'bg-[#D9D3FF] dark:bg-[#2e265c]',
    border: 'border-[#C2B7FC] dark:border-[#483d8a]',
    accentColor: '#7C5CFC',
  },
  {
    name: 'Meera Iyer',
    handle: '@meeratechsound',
    niche: 'Consumer Tech',
    followers: '124K',
    engagement: '9.6%',
    city: 'Bengaluru',
    badge: 'Audio gear & workspace setups',
    tone: 'bg-[#C9E7CD] dark:bg-[#1f4726]',
    border: 'border-[#A8DCB0] dark:border-[#32693b]',
    accentColor: '#27AE60',
  },
  {
    name: 'Rohan Joshi',
    handle: '@rohanlifts',
    niche: 'Fitness & Calisthenics',
    followers: '62.1K',
    engagement: '15.4%',
    city: 'Pune',
    badge: 'Home workouts & nutrition',
    tone: 'bg-[#FFDBE6] dark:bg-[#571f30]',
    border: 'border-[#F8B6CA] dark:border-[#7a2f46]',
    accentColor: '#E91E63',
  },
  {
    name: 'Ananya Roy',
    handle: '@ananyaskincare',
    niche: 'Clean Beauty',
    followers: '39.8K',
    engagement: '12.5%',
    city: 'Kolkata',
    badge: 'Ingredient science & sunscreens',
    tone: 'bg-[#FFF0B8] dark:bg-[#524416]',
    border: 'border-[#EAD589] dark:border-[#736021]',
    accentColor: '#D4AC0D',
  },
  {
    name: 'Simran & Dev',
    handle: '@routesandrituals',
    niche: 'Travel & Solo Stays',
    followers: '96.3K',
    engagement: '13.1%',
    city: 'Chandigarh',
    badge: 'Himalayan homestays & roadtrips',
    tone: 'bg-[#C6EBEE] dark:bg-[#1a444a]',
    border: 'border-[#A3DEE3] dark:border-[#2a6871]',
    accentColor: '#17A2B8',
  },
];

// 2. Interactive "How it works" 5-step data (Reference Image 2)
interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  previewType: 'campaign' | 'checks' | 'pitch' | 'accepted' | 'chat';
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    title: 'A brand posts a campaign',
    description: 'The budget is shown in full, in rupees, before anyone applies. Deliverables, deadlines, and requirements are crystal clear from day one.',
    previewType: 'campaign',
  },
  {
    step: 2,
    title: 'Hyperniche shows two checks',
    description: 'One for the brand, one for the person who posted it. Unverified isn\'t a warning — it simply means nobody has checked yet. Verified badges confirm legitimate work domains.',
    previewType: 'checks',
  },
  {
    step: 3,
    title: 'Creators apply with a pitch',
    description: 'Find campaigns by niche, budget, and deadline, then say in a few lines why you fit. No generic cover letters or awkward DM cold pitches.',
    previewType: 'pitch',
  },
  {
    step: 4,
    title: 'The brand accepts',
    description: 'Brands read each pitch directly alongside the creator\'s portfolio metrics and accept the ones that fit. Both sides get immediate notification.',
    previewType: 'accepted',
  },
  {
    step: 5,
    title: 'You message each other directly',
    description: 'Once a brand accepts, you talk right on Hyperniche. Share script outlines, sample delivery addresses, and feedback without switching apps.',
    previewType: 'chat',
  },
];

// 3. Illustrative Sample Campaigns (Reference Image 1 & 2)
const SAMPLE_CAMPAIGNS = [
  {
    id: 'samp-1',
    brand: 'Chai Kettle',
    brandInitial: 'CK',
    brandBg: 'bg-[#F06A4D]/15 text-[#F06A4D] dark:bg-[#c81020]/20 dark:text-[#ff7070]',
    title: 'Rainy days. Really good reels.',
    category: 'Food & Beverage',
    budget: '₹25,000 – ₹45,000',
    deliverables: '1x 60s Reel + 2x Stories',
    deadline: 'Apply by 30 Nov',
    verified: true,
    niche: 'Food',
  },
  {
    id: 'samp-2',
    brand: 'Urban Thread Studio',
    brandInitial: 'UT',
    brandBg: 'bg-[#7C5CFC]/15 text-[#7C5CFC] dark:bg-[#7C5CFC]/20 dark:text-[#b4a4ff]',
    title: 'Winter Corduroy & Heavyweight Tees drop',
    category: 'Fashion & Streetwear',
    budget: '₹35,000 – ₹60,000',
    deliverables: '2x Styling Reels + Lookbook carousel',
    deadline: 'Apply by 5 Dec',
    verified: true,
    niche: 'Fashion',
  },
  {
    id: 'samp-3',
    brand: 'Nova Audio Labs',
    brandInitial: 'NA',
    brandBg: 'bg-[#27AE60]/15 text-[#27AE60] dark:bg-[#27AE60]/20 dark:text-[#7ae6a6]',
    title: 'ANC Earbuds real commute test in local train',
    category: 'Consumer Tech',
    budget: '₹40,000 – ₹70,000',
    deliverables: '1x Dedicated Review Reel + YouTube Short',
    deadline: 'Apply by 10 Dec',
    verified: true,
    niche: 'Tech',
  },
  {
    id: 'samp-4',
    brand: 'PureRoot Organics',
    brandInitial: 'PR',
    brandBg: 'bg-[#E67E22]/15 text-[#E67E22] dark:bg-[#E67E22]/20 dark:text-[#ffb77a]',
    title: '7-Day Monsoon Glow barrier repair routine',
    category: 'Beauty & Skincare',
    budget: '₹20,000 – ₹35,000',
    deliverables: '1x UGC Reel + 3x Before/After Stories',
    deadline: 'Apply by 28 Nov',
    verified: false,
    niche: 'Beauty',
  },
];

// 4. FAQ Questions (Reference Image 4)
const FAQ_ITEMS = [
  {
    question: 'Is Hyperniche free to join?',
    answer: 'Yes, for creators. Joining, setting up your profile, and pitching campaigns cost nothing. You keep 100% of your agreed payout with zero agency cuts taken from your earnings.',
  },
  {
    question: 'How do you check brands?',
    answer: 'Hyperniche checks brand submissions against the company\'s official website, business registration, or work email domains. The person posting the campaign is also checked separately so creators know exactly who they\'re partnering with.',
  },
  {
    question: 'What does "unverified" mean?',
    answer: 'Nobody has checked it yet. It is not a warning or penalty — it simply indicates a newly registered brand or creator profile that has not yet completed our domain verification checks.',
  },
  {
    question: 'Who can join as a creator?',
    answer: 'Anyone who creates original, high-quality content on Instagram, YouTube, or other social platforms in India. There is no minimum follower threshold: nano, micro, and established creators are all welcome.',
  },
  {
    question: 'How do campaign budgets work?',
    answer: 'Every campaign states its full budget range in Indian Rupees (INR) upfront before you apply. Deliverables, revisions, and deadlines are transparently listed so both parties are always aligned.',
  },
  {
    question: 'Who is behind Hyperniche?',
    answer: 'Hyperniche is built in India for the Indian creator economy — designed to replace noisy WhatsApp groups, spammy agency DMs, and opaque commission fees with a direct, transparent platform.',
  },
];

export const PublicLanding: React.FC<PublicLandingProps> = ({ onCreateAccount, onLogin }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Navigation mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Audience toggle: 'creators' | 'brands' (Reference Image 3 & 6)
  const [audienceTab, setAudienceTab] = useState<'creators' | 'brands'>('creators');

  // Interactive "How It Works" step selector (Reference Image 2)
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
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-left group cursor-pointer"
            >
              <div className="text-2xl sm:text-[1.75rem] font-black tracking-tight font-['Archivo'] leading-none">
                Hyperniche<span className="text-[var(--accent)] transition-transform inline-block group-hover:scale-125">.</span>
              </div>
              <div className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase mt-1">
                Creator commerce platform
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[var(--text-secondary)]">
            <button 
              onClick={() => scrollTo('how-it-works')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button 
              onClick={() => scrollTo('for-audience')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              For creators & brands
            </button>
            <button 
              onClick={() => scrollTo('campaign-previews')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Sample deals
            </button>
            <button 
              onClick={() => scrollTo('trust-promises')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Trust & promises
            </button>
            <button 
              onClick={() => scrollTo('faq-section')} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Questions
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to bright mode' : 'Switch to dark mode'}
              title={isDark ? 'Bright mode' : 'Dark mode'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:shadow-xs cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-[var(--text-secondary)]" />}
            </button>

            {/* Log In */}
            <button
              onClick={onLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-primary)] transition-all cursor-pointer"
            >
              Log in
            </button>

            {/* Get Started CTA */}
            <button
              onClick={() => onCreateAccount()}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-black shadow-xs hover:opacity-95 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Get started</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border-primary)] bg-[var(--bg-card)] px-5 py-4 space-y-3 animate-fade-in shadow-lg">
            <button 
              onClick={() => scrollTo('how-it-works')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              How it works
            </button>
            <button 
              onClick={() => scrollTo('for-audience')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              For creators & brands
            </button>
            <button 
              onClick={() => scrollTo('campaign-previews')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              Sample deals
            </button>
            <button 
              onClick={() => scrollTo('trust-promises')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              Trust & promises
            </button>
            <button 
              onClick={() => scrollTo('faq-section')} 
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-primary)]"
            >
              Questions (FAQ)
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
                Sign up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (Inspired by Reference Image 1 & 6)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[var(--border-primary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Top Micro-badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span>A little talent. A lot of direct possibility.</span>
            </div>
          </div>

          {/* Massive Headline (Sentence Case with Playful Highlight Accent) */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-black tracking-tight leading-[1.04] font-['Archivo'] text-[var(--text-primary)]">
              Meet your next <br className="hidden sm:inline" />
              <span className="relative inline-block mt-1 sm:mt-0">
                <span className="relative z-10 text-[var(--accent)] italic font-serif tracking-normal">let&apos;s make it.*</span>
                <span className="absolute left-0 bottom-1 sm:bottom-2 w-full h-3 sm:h-4 bg-[var(--accent-soft)] -z-0 -rotate-1 rounded-sm" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              The right brand. Your original voice. A good idea that becomes something great. 
              Direct deals with full INR budgets and zero agency middlemen.
            </p>

            {/* Dual CTAs (Creator vs Brand) */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
              <button
                onClick={() => onCreateAccount('creator')}
                className="group px-7 py-3.5 rounded-xl bg-[var(--accent)] text-white text-sm font-black shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Join as a creator</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onCreateAccount('business')}
                className="px-7 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm font-bold hover:border-[var(--text-primary)] hover:-translate-y-0.5 transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Post a campaign</span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Trust reassurance row */}
            <p className="mt-4 text-xs font-medium text-[var(--text-muted)] tracking-wide">
              Paid campaigns • Upfront INR budgets • 100% free for creators
            </p>
          </div>

          {/* ── Playful Visual Collage (Inspired by Reference Image 1) ── */}
          <div className="mt-14 sm:mt-20 max-w-5xl mx-auto relative">
            
            {/* Background dashed decorative connector */}
            <div className="hidden md:block absolute top-1/2 left-12 right-12 h-px border-t border-dashed border-[var(--border-primary)] -z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center relative z-10">
              
              {/* Left Polaroid: Asha (Food creator) */}
              <div className="hero-card-float group relative rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-5 shadow-sm hover:shadow-md transition-all md:-rotate-2">
                {/* Washi tape sticker */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#FFE3D3] dark:bg-[#4a2820] opacity-80 -rotate-3 rounded-xs border-x border-dashed border-[#F06A4D]/30" />
                
                <div className="aspect-4/3 rounded-2xl bg-gradient-to-tr from-[#FFDEB5] to-[#FFE8CC] dark:from-[#3a2814] dark:to-[#573d1f] flex flex-col justify-end p-4 relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-xs flex items-center justify-center font-black text-lg text-[#E67E22] mb-auto">
                    AP
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-black/40 text-white text-[10px] font-bold backdrop-blur-xs w-max">
                    Food & Recipes • 48K
                  </span>
                </div>
                
                <div className="mt-3.5">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Asha makes comfort food.</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">And a little monsoon magic.</p>
                </div>
              </div>

              {/* Center Highlight: The Campaign Deal Card (Chai Kettle) */}
              <div className="relative rounded-3xl border-2 border-[var(--accent)] bg-[var(--bg-card)] p-6 shadow-xl md:scale-105 z-20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white font-black flex items-center justify-center text-xs">
                      CK
                    </div>
                    <div>
                      <div className="text-xs font-black text-[var(--text-primary)]">Chai Kettle</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Verified Brand Partner</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-[10px] font-bold flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                </div>

                <div className="py-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
                    Live Sample Campaign
                  </div>
                  <h2 className="text-lg font-black text-[var(--text-primary)] font-['Archivo'] leading-snug">
                    Rainy days. Really good reels.
                  </h2>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border-primary)] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-medium">Campaign budget</div>
                    <div className="text-base font-black text-[var(--text-primary)] font-['Archivo']">
                      ₹25,000 – ₹45,000
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[11px] font-bold text-[var(--text-secondary)]">
                    Instagram Reels
                  </span>
                </div>

                {/* Floating pill sticker */}
                <div className="absolute -bottom-4 right-4 bg-[var(--accent)] text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Big ideas welcome
                </div>
              </div>

              {/* Right Polaroid: Meera (Tech creator) */}
              <div className="hero-card-float group relative rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-5 shadow-sm hover:shadow-md transition-all md:rotate-2">
                {/* Washi tape sticker */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#C9E7CD] dark:bg-[#1f4726] opacity-80 rotate-2 rounded-xs border-x border-dashed border-[#27AE60]/30" />
                
                <div className="aspect-4/3 rounded-2xl bg-gradient-to-tr from-[#C9E7CD] to-[#E3F5E5] dark:from-[#1b3d21] dark:to-[#2c5c34] flex flex-col justify-end p-4 relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-xs flex items-center justify-center font-black text-lg text-[#27AE60] mb-auto">
                    MI
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-black/40 text-white text-[10px] font-bold backdrop-blur-xs w-max">
                    Tech & Audio • 124K
                  </span>
                </div>

                <div className="mt-3.5">
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Meera has her own rhythm.</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Honest sound tests & tech reels.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CREATOR SHOWCASE (Horizontal Marquee - Reference Images 1 & 6)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-18 border-b border-[var(--border-primary)] bg-[var(--bg-card)]/50 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] mb-2">
            <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Real talent across India</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-['Archivo']">
            Small creators, genuine Indian reach.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl mx-auto">
            From regional food and street fashion to tech unboxings and fitness — meet creators with high engagement.
          </p>
        </div>

        {/* Marquee Track (Double duplicate for infinite seamless loop) */}
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
          4. HOW HYPERNICHE WORKS ("A campaign, start to finish" - Reference Image 2)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-[var(--border-primary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>Simple, transparent flow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo'] tracking-tight">
              A campaign, start to finish.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
              No agency gatekeepers, no hidden cuts. Here is exactly how brands and creators collaborate on Hyperniche.
            </p>
          </div>

          {/* Interactive Steps Grid: Left = Steps list, Right = Interactive visual preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Steps Navigation (Left Column) */}
            <div className="lg:col-span-6 space-y-4">
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

            {/* Interactive Preview Panel (Right Column - Directly renders the preview matching Reference Image 2) */}
            <div className="lg:col-span-6 sticky top-28 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)] mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Live Flow Preview • Step {activeStep} of 5
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-soft-text)] text-[10px] font-black">
                  Interactive Demo
                </span>
              </div>

              {/* Dynamic Preview Content based on activeStep */}
              {activeStep === 1 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Example: What creators see when a campaign is posted
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-[var(--text-primary)]">Monsoon recipe reels</div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] font-bold">
                        Open
                      </span>
                    </div>
                    <div className="text-2xl font-black text-[var(--text-primary)] font-['Archivo'] mt-2">
                      ₹25,000 – ₹45,000
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      Chai Kettle • Apply by 30 Nov • 1x 60s Reel
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--border-primary)] text-xs text-[var(--text-muted)]">
                      Deliverables: Share an authentic regional tea snack pairing. Fast payouts in INR.
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Example: Trust badges shown on every profile and deal
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] space-y-3">
                    <div className="text-xs font-bold text-[var(--text-secondary)]">The Brand checks:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" /> Verified brand (chaikettle.in)
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" /> Unverified brand
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[var(--text-secondary)] pt-3">The Person who posted it:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-xs font-bold">
                        <BadgeCheck className="w-4 h-4" /> Verified representative
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-2">
                      Unverified is never hidden; it simply lets creators choose their level of comfort.
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Example: How a creator pitches directly without spamming
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
                        AG
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">Aman Gill</div>
                        <div className="text-[11px] text-[var(--text-muted)]">18,100 followers • Food / Recipes</div>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] leading-relaxed font-sans">
                      <div className="font-bold text-[10px] uppercase text-[var(--accent)] mb-1">Creator Pitch</div>
                      &ldquo;I post quick Punjabi home-cooking reels. Every June my followers ask for monsoon snacks, so this fits my audience naturally.&rdquo;
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>Proposed rate: <strong>₹28,000</strong></span>
                      <span>Format: <strong>1x Reel</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Example: What you see when the brand reviews and accepts
                  </div>
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">Monsoon recipe reels</div>
                        <div className="text-xs text-[var(--text-muted)]">Chai Kettle • ₹28,000 agreed payout</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-xs font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Accepted
                      </span>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-[var(--badge-green-bg)]/30 border border-[var(--badge-green-bg)] text-xs text-[var(--badge-green-text)]">
                      🎉 Your application was accepted! Direct messaging has been unlocked for this campaign.
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 5 && (
                <div className="animate-fade-in space-y-4">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    Example: In-app direct messaging between brand and creator
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        CK
                      </div>
                      <div className="p-3 rounded-2xl rounded-tl-xs bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs max-w-[85%] text-[var(--text-primary)]">
                        Hi Aman! Loved your snack pairing pitch. Can we ship you our Masala Chai sample kit by Wednesday?
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 justify-end">
                      <div className="p-3 rounded-2xl rounded-tr-xs bg-[var(--accent)] text-white text-xs max-w-[85%]">
                        Yes absolutely! Sent my shipping address. I&apos;ll shoot the first draft as soon as it arrives.
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-gray-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        AG
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
                  Previous
                </button>
                <div className="text-xs text-[var(--text-muted)] font-bold">
                  Step {activeStep} of 5
                </div>
                <button
                  disabled={activeStep === 5}
                  onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold disabled:opacity-30 cursor-pointer"
                >
                  Next step
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FOR CREATORS & FOR BRANDS (Interactive Tabs - Ref 3 & 6)
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
                <span>For Creators</span>
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
                <span>For Brands</span>
              </button>
            </div>
          </div>

          {/* Creators View */}
          {audienceTab === 'creators' && (
            <div className="animate-fade-in">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
                  Turn your audience into predictable income.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Stop hoping for brand emails or dealing with dodgy middle agencies. 
                  Browse verified campaigns, pitch your unique angle, and get paid transparently in INR.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#D9D3FF] text-[#7C5CFC] flex items-center justify-center font-black mb-4">
                    ₹
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Keep 100% of What You Earn
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Zero application fees, zero platform commission taken from your agreed payouts. Every rupee belongs to you.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#C9E7CD] text-[#27AE60] flex items-center justify-center font-black mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Upfront Published Budgets
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Never guess what a brand pays. Budgets, deliverables, and timelines are listed publicly before you invest time pitching.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE3D3] text-[var(--accent)] flex items-center justify-center font-black mb-4">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Direct Founder & Lead Access
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Talk straight to marketing leads and founders through in-app DMs. Coordinate briefs and get feedback without middlemen.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => onCreateAccount('creator')}
                  className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-xs font-black shadow-xs hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Create creator account (Free)</span>
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
                  Small creators, real authentic reach.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Nano and micro creators are often closer to their audience than massive accounts are. 
                  Post one campaign with the full budget and let creators find you by niche.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#FFE3D3] text-[var(--accent)] flex items-center justify-center font-black mb-4">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Higher Conversion & Trust
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Micro-influencers have 3-5x higher engagement rates. Audiences genuinely trust their product recommendations.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#C9E7CD] text-[#27AE60] flex items-center justify-center font-black mb-4">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Structured Pitches, Not DM Chaos
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Stop messaging accounts one by one. Receive formatted pitches with creator statistics in one centralized dashboard.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#D9D3FF] text-[#7C5CFC] flex items-center justify-center font-black mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                    Zero Agency Markups
                  </h3>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Work directly with creator talent at real market rates. Every rupee of your budget goes towards content production.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => onCreateAccount('business')}
                  className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-xs font-black shadow-xs hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Post your first campaign</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Our Promises Section (Directly inspired by Reference Image 3) ── */}
          <div id="trust-promises" className="mt-20 pt-12 border-t border-[var(--border-primary)]">
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Archivo'] mb-6">
              Our promises
            </h3>

            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] divide-y divide-[var(--border-primary)] overflow-hidden shadow-2xs">
              <div className="p-5 sm:p-6">
                <div className="text-sm font-bold text-[var(--text-primary)]">You never pay to apply.</div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Hyperniche is 100% free for creators. If any campaign or brand asks you for money, report it immediately.
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="text-sm font-bold text-[var(--text-primary)]">The budget is shown in full.</div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Every campaign states its budget in Indian Rupees before you apply. No surprise renegotiations.
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="text-sm font-bold text-[var(--text-primary)]">Any campaign can be reported.</div>
                <div className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Every campaign page and message thread has safety and moderation checks built right in.
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CAMPAIGN PREVIEW (Illustrative Sample Campaigns)
      ───────────────────────────────────────────────────────────── */}
      <section id="campaign-previews" className="py-16 sm:py-24 border-b border-[var(--border-primary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] mb-2">
                <span>Sample deals</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
                What active campaigns look like.
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Illustrative sample previews for demonstration. Live campaigns and pitching unlock after login.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {['All', 'Food', 'Fashion', 'Tech', 'Beauty'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCampaignCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-6 shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${camp.brandBg} flex items-center justify-center font-black text-xs shrink-0`}>
                      {camp.brandInitial}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">{camp.brand}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{camp.category}</div>
                    </div>
                  </div>

                  {camp.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] text-[10px] font-bold">
                      <BadgeCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] text-[10px] font-bold">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] font-['Archivo'] leading-snug">
                    {camp.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)]">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block">Published budget</span>
                      <strong className="text-sm font-black text-[var(--text-primary)] font-['Archivo']">{camp.budget}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--text-muted)] block">Format</span>
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
                    <span>Sign up to apply</span>
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
              <span>Explore all marketplace categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. PLATFORM FEATURES (Bento Grid)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[var(--border-primary)] bg-[var(--bg-card)]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Full platform capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
              Everything built for smooth collaboration.
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              From discovering the right creators to pitching, chatting, and confirming milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFE3D3] text-[var(--accent)] flex items-center justify-center font-bold mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                16 Indian Categories
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Filter by Streetwear, Beauty, Tech, Regional Food, Wellness, Home, and more. Find exactly who fits your product.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#D9D3FF] text-[#7C5CFC] flex items-center justify-center font-bold mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Instagram-Style In-App DMs
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Coordinate scripts, share content drafts, and send sample tracking links without ever sharing personal phone numbers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#C9E7CD] text-[#27AE60] flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Dual Verification
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Separate checks for brand domains and the representative posting. Creators know who they deal with before committing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFDBE6] text-[#E91E63] flex items-center justify-center font-bold mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Pitch Pipeline
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Track submitted pitches, review pending applications, and manage active campaigns in one unified status board.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0B8] text-[#D4AC0D] flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Rich Creator Profiles
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Showcase your verified Instagram handle, follower tier, past campaign portfolio, and starting rates in INR.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#C6EBEE] text-[#17A2B8] flex items-center justify-center font-bold mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                Clear INR Terms
              </h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Clear milestone agreements. Both parties know the deliverables and timeline before any video is filmed.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. QUESTIONS / FAQ (Accordion - Directly from Reference Image 4)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq-section" className="py-16 sm:py-24 border-b border-[var(--border-primary)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-['Archivo']">
              Questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Clear answers about fees, verification, and how collaborations work.
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
          9. TALK TO US & FINAL CTA (Reference Images 4 & 5)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[var(--border-primary)] bg-[var(--bg-card)]/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* "Talk to us" contact card (Reference Image 5) */}
          <div className="max-w-xl mx-auto mb-16 p-6 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Support & Community
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)] font-['Archivo']">
              Talk to us
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              A question about a campaign, your account, or scaling with Hyperniche? 
              Our team reads and replies to every message.
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

          {/* "Free to join" Final CTA banner (Reference Image 5) */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] font-['Archivo'] tracking-tight">
              Free to join.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md mx-auto">
              Ready to find paid sponsorships or launch your brand campaign across India?
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => onCreateAccount('creator')}
                className="px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Join as a creator</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onCreateAccount('business')}
                className="px-8 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs sm:text-sm font-bold hover:border-[var(--text-primary)] hover:-translate-y-0.5 transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Post a campaign</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={onLogin}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline font-medium cursor-pointer"
              >
                Already have an account? Log in here
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
                Direct creator commerce platform. Brands post influencer campaigns. Creators apply.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <div className="font-bold text-[var(--text-primary)] mb-3">For creators</div>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onCreateAccount('creator')} className="hover:text-[var(--text-primary)]">Join as a creator</button></li>
                <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-[var(--text-primary)]">A campaign, start to finish</button></li>
                <li><button onClick={() => scrollTo('campaign-previews')} className="hover:text-[var(--text-primary)]">Sample brand deals</button></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="font-bold text-[var(--text-primary)] mb-3">For brands</div>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onCreateAccount('business')} className="hover:text-[var(--text-primary)]">Post a campaign</button></li>
                <li><button onClick={() => scrollTo('for-audience')} className="hover:text-[var(--text-primary)]">Small creators, real reach</button></li>
                <li><button onClick={() => scrollTo('trust-promises')} className="hover:text-[var(--text-primary)]">Brand verification</button></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <div className="font-bold text-[var(--text-primary)] mb-3">Hyperniche</div>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollTo('faq-section')} className="hover:text-[var(--text-primary)]">Questions (FAQ)</button></li>
                <li><a href="mailto:support@hyperniche.in" className="hover:text-[var(--text-primary)]">support@hyperniche.in</a></li>
                <li><span className="text-[var(--text-muted)]">India Creator Economy</span></li>
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
