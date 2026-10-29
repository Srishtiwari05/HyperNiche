import React, { useState } from 'react';
import { useAuth, validatePassword } from '../context/AuthContext';
import { UserRole } from '../types';
import { CATEGORIES } from '../config/categories';
import { ArrowLeft, ArrowRight, Building2, User, Sparkles, AlertCircle, Camera } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { uploadMedia } from '../lib/storage';

const BUSINESS_SELL_OPTIONS = [
  'Clothing & Streetwear',
  'Beauty & Skincare',
  'Consumer Tech & Accessories',
  'Food & Beverages',
  'Fitness & Supplements',
  'Home & Interior Decor',
  'Mobile Apps & Fintech',
  'Automotive & Riding Gear',
  'Pet Care Products',
  'Other Consumer Goods',
];

const FOLLOWER_RANGES = [
  'Under 10K',
  '10K-50K',
  '50K-250K',
  'Above 250K',
];

export const SignupFlow: React.FC = () => {
  const { 
    currentUser, 
    signUp, 
    signIn, 
    needsProfileCompletion, 
    completeProfileForCurrentUser,
    updateUserProfile,
  } = useAuth();

  // Slide state: 1 to 4 (always starts on Step 1 "Who are you?")
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<UserRole>('business');
  const [accountType, setAccountType] = useState<'new' | 'existing'>('new');

  // Step 3 Creator fields
  const [creatorHandle, setCreatorHandle] = useState('');
  const [creatorFollowers, setCreatorFollowers] = useState('10K-50K');
  const [creatorNiche, setCreatorNiche] = useState('Fashion');

  // Step 3 Business fields
  const [businessName, setBusinessName] = useState('');
  const [businessWebOrInsta, setBusinessWebOrInsta] = useState('');
  const [businessWhatYouSell, setBusinessWhatYouSell] = useState('Clothing & Streetwear');

  // Step 4 Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const handleAvatarPick = (file?: File) => {
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const persistAvatarAfterAuth = async () => {
    if (!avatarFile) return;
    try {
      const url = await uploadMedia(avatarFile, 'avatars');
      await updateUserProfile({ avatarUrl: url });
    } catch (err) {
      console.warn('Avatar upload note:', err);
    }
  };

  // Step indicator calculation:
  // Step 1: Step 1 of 4
  // Step 2: Step 2 of 4
  // Step 3: Step 3 of 4 (or Step 2 of 4 if logged-in completing profile)
  // Step 4: Step 4 of 4 (or Step 3 of 3 if existing user logging in)
  const isCompletionMode = Boolean(needsProfileCompletion && currentUser);
  
  const getStepLabel = () => {
    if (step === 1) return 'Getting started';
    if (step === 2) return 'Account type';
    if (step === 3) return 'Tell us about yourself';
    return accountType === 'new' ? 'Create account' : 'Log in';
  };

  const getStepNumber = () => {
    if (isCompletionMode) {
      return step === 1 ? 'Step 1 of 2' : 'Step 2 of 2';
    }
    if (accountType === 'existing' && step === 4) {
      return 'Step 3 of 3';
    }
    return `Step ${step} of 4`;
  };

  const progressPercent = isCompletionMode
    ? (step === 1 ? 50 : 100)
    : Math.round((step / 4) * 100);

  const handleStep1SelectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setErrorMsg('');
    setSaveFailed(false);
    if (isCompletionMode) {
      // Logged in without a saved profile: after choosing role, show the same 3-question slide used for new users!
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleStep2SelectAccount = (selectedType: 'new' | 'existing') => {
    setAccountType(selectedType);
    setErrorMsg('');
    setSaveFailed(false);
    if (selectedType === 'new') {
      setStep(3);
    } else {
      // skip step 3 and go straight to Step 4 (Log in)
      setStep(4);
    }
  };

  const handleStep3SubmitQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveFailed(false);

    if (role === 'creator') {
      if (!creatorHandle.trim()) {
        setErrorMsg('Please enter your Instagram handle.');
        return;
      }
    } else {
      if (!businessName.trim()) {
        setErrorMsg('Please enter your business name.');
        return;
      }
      if (!businessWebOrInsta.trim()) {
        setErrorMsg('Please enter your website or Instagram.');
        return;
      }
    }

    // If logged-in user without a saved profile: save the profile and open the main page!
    if (isCompletionMode) {
      setIsSubmitting(true);
      try {
        const payload = role === 'creator' ? {
          handle: creatorHandle.startsWith('@') ? creatorHandle : `@${creatorHandle}`,
          followers: creatorFollowers,
          niche: creatorNiche,
          name: creatorHandle.replace('@', ''),
        } : {
          name: businessName,
          handle: businessWebOrInsta.startsWith('@') ? businessWebOrInsta : `@${businessName.toLowerCase().replace(/\s+/g, '')}`,
          websiteOrInstagram: businessWebOrInsta,
          whatYouSell: businessWhatYouSell,
        };

        let avatarUrl = '';
        if (avatarFile) {
          avatarUrl = await uploadMedia(avatarFile, 'avatars');
        }
        await completeProfileForCurrentUser(role, { ...payload, avatarUrl });
      } catch (err: any) {
        console.error('Save profile error:', err);
        setErrorMsg(err.message || "Couldn't save your profile, please try again");
        setSaveFailed(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep(4);
  };

  const handleStep4AuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveFailed(false);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    if (accountType === 'new') {
      const pwdErr = validatePassword(password);
      if (pwdErr) {
        setErrorMsg(pwdErr);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (accountType === 'new') {
        const extra = role === 'creator' ? {
          name: creatorHandle.replace('@', ''),
          handle: creatorHandle.startsWith('@') ? creatorHandle : `@${creatorHandle}`,
          followers: creatorFollowers,
          niche: creatorNiche,
        } : {
          name: businessName,
          handle: businessWebOrInsta.startsWith('@') ? businessWebOrInsta : `@${businessName.toLowerCase().replace(/\s+/g, '')}`,
          websiteOrInstagram: businessWebOrInsta,
          whatYouSell: businessWhatYouSell,
        };

        await signUp(email, password, role, extra);
        await persistAvatarAfterAuth();
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      if (accountType === 'existing') {
        setErrorMsg(err.message || 'Email or password is incorrect');
      } else {
        setErrorMsg(err.message || "Couldn't save your profile, please try again");
        setSaveFailed(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setSaveFailed(false);
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      if (isCompletionMode) {
        setStep(1);
      } else {
        setStep(2);
      }
    } else if (step === 4) {
      if (accountType === 'existing') {
        setStep(2);
      } else {
        setStep(3);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between transition-colors relative overflow-hidden">
      
      {/* Soft Northern Lights / Aurora Background on First "Who are you?" Page */}
      {step === 1 && (
        <div
          className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
          aria-hidden="true"
        >
          {/* Pale Mint Blob */}
          <div
            className="aurora-blob-mint absolute -top-20 -left-20 w-[34rem] h-[34rem] rounded-full blur-[95px] opacity-[0.14] dark:opacity-[0.08] bg-[#D9F2E6] dark:bg-[#0D281E]"
          />
          {/* Lavender Blob */}
          <div
            className="aurora-blob-lavender absolute top-1/4 -right-24 w-[36rem] h-[36rem] rounded-full blur-[105px] opacity-[0.15] dark:opacity-[0.09] bg-[#E6DCFF] dark:bg-[#221838]"
          />
          {/* Blush Blob */}
          <div
            className="aurora-blob-blush absolute -bottom-24 left-1/3 w-[32rem] h-[32rem] rounded-full blur-[100px] opacity-[0.13] dark:opacity-[0.07] bg-[#FFDBE6] dark:bg-[#30141E]"
          />
        </div>
      )}

      {/* Top Header with Brand & Theme Toggle */}
      <div className="w-full border-b border-[var(--border-primary)] bg-[var(--bg-card)]/90 backdrop-blur-xs relative z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
              Hyperniche<span className="text-[var(--accent)]">.</span>
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-muted)] hidden sm:inline">
              Creator marketplace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Progress Bar on Top */}
        <div className="w-full bg-[var(--border-primary)]/40 h-1.5 overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flow Container */}
      <main className="flex-1 max-w-[760px] w-full mx-auto px-4 py-10 sm:py-14 flex flex-col justify-center relative z-10">
        
        {/* Navigation & Step Indicator */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          {step > 1 ? (
            <button
              onClick={handleBack}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">
              {getStepLabel()}
            </span>
          )}

          <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">
            {getStepNumber()}
          </span>
        </div>

        {/* SLIDE 1: Who are you? */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200 relative w-full">
            <div className="pointer-events-none absolute inset-[-8%] -z-10 overflow-hidden rounded-[40px]" aria-hidden="true">
              <div className="absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full border border-[#f35050]/15 bg-[#f35050]/5 blur-3xl" />
              <div className="absolute left-8 top-24 h-14 w-14 rotate-12 rounded-full border border-[#f35050]/25 bg-[#f35050]/10" />
              <div className="absolute right-8 top-20 h-10 w-10 rotate-45 rounded-full border border-[#f35050]/20 bg-[#f35050]/5" />
              <div className="absolute left-1/4 bottom-8 h-16 w-16 rotate-12 rounded-full border border-[#f35050]/20 bg-[#f35050]/5" />
              <div className="absolute right-1/4 bottom-8 h-12 w-12 rotate-45 rounded-full border border-[#f35050]/20 bg-[#f35050]/5" />
            </div>

            <div className="rounded-[26px] border border-[#eae5df]/10 bg-[#f3efe9] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-3xl sm:text-6xl font-black tracking-[-0.08em] text-[#18191a] font-['Archivo']">
                  Who are you?
                </h2>
                <p className="mt-3 text-sm sm:text-xl text-[#2f2d2b] opacity-85">
                  Choose your primary focus on the Hyperniche marketplace.
                </p>
              </div>

              {isCompletionMode && (
                <div className="text-center mb-7 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)]/60 py-2.5 px-4 rounded-xl border border-[var(--accent)]/30 shadow-2xs">
                  You're signed in. Just 3 quick questions to finish setting up.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <button
                  onClick={() => handleStep1SelectRole('business')}
                  type="button"
                  className="group relative overflow-hidden rounded-[24px] border border-[#1f1f22]/5 bg-[#111315]/95 p-6 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-1 hover:border-[#f35050]/30 hover:shadow-[0_24px_60px_rgba(243,80,80,0.08)] cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(243,80,80,0.12),transparent_46%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff5d5d]/10 text-[#ff6b6b] ring-1 ring-[#ff6b6b]/20">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-[#f5f3ef] font-['Archivo']">
                      I'm a business owner
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed text-[#d5d1cd]">
                      Post campaigns, browse verified Indian creators, and hire talent with milestone payouts.
                    </p>
                    <div className="mt-5 flex items-center gap-1 text-sm sm:text-lg font-bold text-[#ff6b6b] transition-transform group-hover:translate-x-0.5">
                      <span>Continue as business</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStep1SelectRole('creator')}
                  type="button"
                  className="group relative overflow-hidden rounded-[24px] border border-[#1f1f22]/5 bg-[#111315]/95 p-6 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-1 hover:border-[#5bd19a]/30 hover:shadow-[0_24px_60px_rgba(91,209,154,0.08)] cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,209,154,0.12),transparent_46%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#64d1a0]/10 text-[#78e0b0] ring-1 ring-[#64d1a0]/20">
                      <User className="w-6 h-6" />
                    </div>
                    <h3 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-[#f5f3ef] font-['Archivo']">
                      I'm a content creator
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed text-[#d5d1cd]">
                      Find paid brand deals, send pitches directly to verified companies, and get paid in INR.
                    </p>
                    <div className="mt-5 flex items-center gap-1 text-sm sm:text-lg font-bold text-[#78e0b0] transition-transform group-hover:translate-x-0.5">
                      <span>Continue as creator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Welcome to Hyperniche */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
                Welcome to Hyperniche
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                Setting up as a {role === 'business' ? 'Business Owner' : 'Content Creator'}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleStep2SelectAccount('new')}
                type="button"
                className="p-6 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-200 text-left group shadow-2xs cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] flex items-center justify-center mb-4 border border-[var(--border-primary)]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)] font-['Archivo'] mb-1">
                  I'm new here
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Set up your profile in 3 short questions and create your login credentials.
                </p>
              </button>

              <button
                onClick={() => handleStep2SelectAccount('existing')}
                type="button"
                className="p-6 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-200 text-left group shadow-2xs cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)] flex items-center justify-center mb-4 border border-[var(--border-primary)]">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)] font-['Archivo'] mb-1">
                  I already have an account
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Sign into your existing account directly to access your deals and campaigns.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 3: 3 Questions Only (Same 3-question slide used for new users and completing profiles) */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
                Tell us about yourself
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                Just 3 questions to tailor your marketplace experience.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between gap-3 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                {saveFailed && (
                  <button
                    type="button"
                    onClick={handleStep3SubmitQuestions}
                    className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shrink-0"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleStep3SubmitQuestions} className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="relative w-16 h-16 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] overflow-hidden cursor-pointer shrink-0 group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <Camera className="w-5 h-5" />
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleAvatarPick(e.target.files?.[0])}
                  />
                </label>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Profile photo</p>
                  <p className="text-[11px] text-[var(--text-muted)]">JPG, PNG or WEBP up to 5 MB. Stored in your account.</p>
                </div>
              </div>
              {role === 'creator' ? (
                <>
                  {/* Q1: Instagram handle */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
                      1. Instagram handle
                    </label>
                    <input
                      type="text"
                      value={creatorHandle}
                      onChange={(e) => {
                        setCreatorHandle(e.target.value);
                        if (errorMsg) { setErrorMsg(''); setSaveFailed(false); }
                      }}
                      placeholder="@yourhandle"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  {/* Q2: Follower range */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
                      2. Follower range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {FOLLOWER_RANGES.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            setCreatorFollowers(f);
                            if (errorMsg) { setErrorMsg(''); setSaveFailed(false); }
                          }}
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                            creatorFollowers === f
                              ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                              : 'border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q3: Niche */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
                      3. Primary niche
                    </label>
                    <select
                      value={creatorNiche}
                      onChange={(e) => {
                        setCreatorNiche(e.target.value);
                        if (errorMsg) { setErrorMsg(''); setSaveFailed(false); }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Q1: Business name */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
                      1. Business name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (errorMsg) { setErrorMsg(''); setSaveFailed(false); }
                      }}
                      placeholder="e.g. Kanso Wear, Veda Botanics"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  {/* Q2: Website or Instagram */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
                      2. Website or Instagram
                    </label>
                    <input
                      type="text"
                      value={businessWebOrInsta}
                      onChange={(e) => {
                        setBusinessWebOrInsta(e.target.value);
                        if (errorMsg) { setErrorMsg(''); setSaveFailed(false); }
                      }}
                      placeholder="e.g. kansowear.in or @kansowear"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  {/* Q3: What you sell */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
                      3. What you sell
                    </label>
                    <select
                      value={businessWhatYouSell}
                      onChange={(e) => {
                        setBusinessWhatYouSell(e.target.value);
                        if (errorMsg) { setErrorMsg(''); setSaveFailed(false); }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      {BUSINESS_SELL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold hover:bg-[var(--accent)] hover:text-white transition-all shadow-2xs flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving profile...</span>
                ) : isCompletionMode ? (
                  <>
                    <span>Save profile & launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Continue to account setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* SLIDE 4: Create account / Log in */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
                {accountType === 'new' ? 'Create your account' : 'Log into Hyperniche'}
              </h2>
              {/* Role-aware subtitle */}
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
                {accountType === 'new'
                  ? 'Your profile data will be securely saved to Supabase.'
                  : role === 'business'
                  ? 'Enter your credentials to manage your brand deals.'
                  : 'Enter your credentials to manage your applications and deals.'}
              </p>
            </div>

            <form onSubmit={handleStep4AuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) { setErrorMsg(''); setSaveFailed(false); }
                  }}
                  placeholder="name@domain.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[var(--text-primary)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) { setErrorMsg(''); setSaveFailed(false); }
                  }}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    password.length > 0 && password.length < 8
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[var(--border-primary)] focus:ring-[var(--accent)]'
                  } bg-[var(--input-bg)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2`}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Minimum 8 characters
                  </span>
                  {password.length > 0 && password.length < 8 && (
                    <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                      Password is too short (minimum 8 characters)
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-2xs flex items-center justify-center gap-2 mt-6 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : accountType === 'new' ? (
                  <>
                    <span>Create account & launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Clear red error message displayed strictly under the form */}
              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between gap-3 border border-red-500/20 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  {saveFailed && (
                    <button
                      type="button"
                      onClick={handleStep4AuthSubmit}
                      className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shrink-0"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        )}

      </main>

      {/* Streetwear Minimal Footer note */}
      <footer className="w-full border-t border-[var(--border-primary)] py-4 text-center text-[11px] font-semibold text-[var(--text-muted)]">
        <span>Hyperniche direct commerce • All amounts in Indian Rupees (₹)</span>
      </footer>

    </div>
  );
};
