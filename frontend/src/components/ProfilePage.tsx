import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserProfile, Campaign, Application } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { VerificationPaymentModal } from './VerificationPaymentModal';
import { CATEGORIES } from '../config/categories';
import { 
  Building2, 
  User, 
  MapPin, 
  Globe, 
  Instagram, 
  Layers, 
  IndianRupee, 
  Calendar, 
  Edit3, 
  Check, 
  X, 
  MessageSquare, 
  ShieldCheck, 
  ArrowLeft, 
  ExternalLink,
  PlusCircle,
  Briefcase
} from 'lucide-react';

interface ProfilePageProps {
  viewingProfile?: UserProfile | null;
  onBack?: () => void;
  onNavigateToMessages?: () => void;
  onOpenCreateCampaign?: () => void;
}

const FOLLOWER_RANGES = [
  'Under 10K',
  '10K-50K',
  '50K-250K',
  'Above 250K',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  viewingProfile,
  onBack,
  onNavigateToMessages,
  onOpenCreateCampaign,
}) => {
  const { userProfile, updateUserProfile } = useAuth();
  const { campaigns, applications, setActiveConversation, getApplicationUsageStats } = useMarketplace();

  // If viewingProfile is provided, we view that user; otherwise we view own profile
  const isOwnProfile = !viewingProfile || viewingProfile.id === userProfile?.id;
  const profile: UserProfile | null = isOwnProfile ? userProfile : viewingProfile;
  const usageStats = getApplicationUsageStats(profile?.id);

  // Edit Mode state (for own profile)
  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable Form fields
  const [name, setName] = useState(profile?.name || '');
  const [handle, setHandle] = useState(profile?.handle || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [websiteOrInstagram, setWebsiteOrInstagram] = useState(profile?.websiteOrInstagram || '');
  const [whatYouSell, setWhatYouSell] = useState(profile?.whatYouSell || '');
  const [niche, setNiche] = useState(profile?.niche || 'Fashion');
  const [followers, setFollowers] = useState(profile?.followers || '10K-50K');
  const [city, setCity] = useState(profile?.city || 'Mumbai');
  const [portfolio, setPortfolio] = useState(profile?.portfolio || '');
  const [letBrandsFindMe, setLetBrandsFindMe] = useState(profile?.letBrandsFindMe ?? true);

  // Sync letBrandsFindMe if profile changes
  React.useEffect(() => {
    if (profile) {
      setLetBrandsFindMe(profile.letBrandsFindMe ?? true);
    }
  }, [profile]);

  const handleToggleBrandSearch = async (checked: boolean) => {
    setLetBrandsFindMe(checked);
    try {
      await updateUserProfile({
        letBrandsFindMe: checked,
      });
    } catch (err) {
      console.warn('Update letBrandsFindMe note:', err);
    }
  };

  // Reset form when profile updates or edit starts
  const startEditing = () => {
    if (!profile) return;
    setName(profile.name);
    setHandle(profile.handle);
    setBio(profile.bio || '');
    setWebsiteOrInstagram(profile.websiteOrInstagram || '');
    setWhatYouSell(profile.whatYouSell || '');
    setNiche(profile.niche || 'Fashion');
    setFollowers(profile.followers || '10K-50K');
    setCity(profile.city || 'Mumbai');
    setPortfolio(profile.portfolio || '');
    setLetBrandsFindMe(profile.letBrandsFindMe ?? true);
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        handle: handle.trim(),
        bio: bio.trim(),
        websiteOrInstagram: websiteOrInstagram.trim(),
        whatYouSell: whatYouSell.trim(),
        niche,
        followers,
        city: city.trim(),
        portfolio: portfolio.trim(),
        letBrandsFindMe,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Save profile note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-bold text-[var(--text-primary)]">Profile not found</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 px-4 py-2 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold">
            Go back
          </button>
        )}
      </div>
    );
  }

  const isBusiness = profile.role === 'business';
  const isVerified = Boolean(profile.isVerified);

  // Check if viewing another user and if an accepted deal exists between current user and target user
  const hasAcceptedDealWithUser = Boolean(
    !isOwnProfile &&
    userProfile &&
    applications.some((a) => {
      if (a.status !== 'accepted') return false;
      if (userProfile.role === 'business') {
        return a.businessId === userProfile.id && a.creatorId === profile.id;
      } else {
        return a.creatorId === userProfile.id && a.businessId === profile.id;
      }
    })
  );

  // Handle direct messaging to counterpart with accepted deal
  const handleOpenDirectChat = () => {
    if (!hasAcceptedDealWithUser || !userProfile) return;
    const acceptedApp = applications.find((a) => {
      if (a.status !== 'accepted') return false;
      if (userProfile.role === 'business') {
        return a.businessId === userProfile.id && a.creatorId === profile.id;
      } else {
        return a.creatorId === userProfile.id && a.businessId === profile.id;
      }
    });

    if (acceptedApp) {
      setActiveConversation({
        campaignId: acceptedApp.campaignId,
        campaignTitle: acceptedApp.campaignTitle,
        creatorId: acceptedApp.creatorId,
        businessId: acceptedApp.businessId,
        peerName: profile.name,
        peerHandle: profile.handle,
        applicationId: acceptedApp.id,
      });
      if (onNavigateToMessages) {
        onNavigateToMessages();
      }
    }
  };

  // Activity feeds
  const userCampaigns = campaigns.filter((c) => c.businessId === profile.id);
  const userApplications = applications.filter((a) => a.creatorId === profile.id);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-colors">
      
      {/* Top back button if viewing another user */}
      {!isOwnProfile && onBack && (
        <button
          onClick={onBack}
          type="button"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to marketplace</span>
        </button>
      )}

      {/* Main Profile Card Container */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl shadow-sm overflow-hidden transition-colors">
        
        {/* SECTION: COVER BANNER */}
        <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-[#2B2622] via-[#4A3B32] to-[#F06A4D]/80 dark:from-[#111111] dark:via-[#1F1718] dark:to-[#B3121E]/60">
          {/* Subtle graphic overlay texture */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/40 text-white backdrop-blur-md border border-white/20 font-mono">
              Hyperniche Profile
            </span>
          </div>
        </div>

        {/* SECTION: AVATAR & HEADER INFO */}
        <div className="px-6 sm:px-8 pb-8 relative pt-0">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-4 sm:gap-6">
              {/* Large Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[var(--bg-card)] border-4 border-[var(--bg-card)] shadow-lg flex items-center justify-center font-black text-3xl sm:text-4xl text-[#F06A4D] bg-[#FFE3D3] dark:bg-[#34241E] shrink-0 font-['Archivo']">
                {profile.name.charAt(0).toUpperCase()}
              </div>

              <div className="mb-1">
                {/* Name + Verification Badge */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-['Archivo']">
                    {profile.name}
                  </h1>
                  <VerificationBadge isVerified={isVerified} size="md" />
                </div>

                {/* Handle & Role */}
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1 font-mono">
                  <span>{profile.handle}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-sans font-semibold text-[var(--text-primary)]">
                    {isBusiness ? <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" /> : <User className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    {isBusiness ? 'Brand / Business' : 'Content Creator'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-end">
              {isOwnProfile ? (
                <>
                  {/* If unverified on own profile, show "Get verified" button */}
                  {!isVerified && (
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F06A4D] dark:bg-[#B3121E] text-white text-xs font-bold hover:opacity-95 transition-all shadow-xs cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Get verified</span>
                    </button>
                  )}

                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent)] transition-all shadow-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Edit profile</span>
                    </button>
                  ) : null}
                </>
              ) : (
                <>
                  {/* Other user's profile: Show "Message" button only if accepted deal exists */}
                  {hasAcceptedDealWithUser ? (
                    <button
                      onClick={handleOpenDirectChat}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-[var(--text-muted)] bg-[var(--input-bg)] px-3 py-1.5 rounded-xl border border-[var(--border-primary)] flex items-center gap-1.5 font-medium">
                      <span>Deal-locked</span>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Success Notification on save */}
          {saveSuccess && (
            <div className="mb-6 p-3 rounded-xl bg-[var(--badge-green-bg)] text-[var(--badge-green-text)] border border-[var(--border-primary)] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4" />
              <span>Profile details successfully updated!</span>
            </div>
          )}

          {/* EDIT FORM (INLINE ON PAGE) OR DISPLAY VIEW */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-6 pt-4 border-t border-[var(--border-primary)] animate-in fade-in duration-150">
              
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-base font-bold text-[var(--text-primary)] font-['Archivo']">
                  Editing Profile Information
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save changes'}</span>
                  </button>
                </div>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                    {isBusiness ? 'Company Name' : 'Display Name'} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                    Social Handle *
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                  About / Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Outline your brand ethos or creator content style..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>

              {isBusiness ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                      Website or Instagram Link
                    </label>
                    <input
                      type="text"
                      value={websiteOrInstagram}
                      onChange={(e) => setWebsiteOrInstagram(e.target.value)}
                      placeholder="e.g. kansowear.in"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                      What You Sell / Industry
                    </label>
                    <input
                      type="text"
                      value={whatYouSell}
                      onChange={(e) => setWhatYouSell(e.target.value)}
                      placeholder="e.g. Streetwear Clothing"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                        Primary Niche
                      </label>
                      <select
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                        Followers Range
                      </label>
                      <select
                        value={followers}
                        onChange={(e) => setFollowers(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      >
                        {FOLLOWER_RANGES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                        City / Base
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai, Bengaluru"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[var(--text-primary)]">
                        Portfolio / Reel Link
                      </label>
                      <input
                        type="text"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="e.g. instagram.com/myreels"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-['Archivo'] mb-0.5">
                        Brand search
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Brands can search for creators to invite to their campaigns.
                      </p>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={letBrandsFindMe}
                        onChange={(e) => setLetBrandsFindMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--accent)] accent-[var(--accent)] cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] font-['Archivo']">
                        Let brands find me
                      </span>
                    </label>

                    <p className="text-xs text-[var(--text-secondary)] pl-6.5 leading-relaxed">
                      When this is off, your profile stops appearing when brands search for creators. A brand reviewing an application you sent still sees your profile.
                    </p>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-[var(--border-primary)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

            </form>
          ) : (
            /* DISPLAY SECTIONS: ABOUT, DETAILS, ACTIVITY */
            <div className="space-y-8 pt-4 border-t border-[var(--border-primary)]">
              
              {/* SECTION: ABOUT */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-['Archivo'] mb-2">
                  About
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {profile.bio || (isBusiness 
                    ? 'Verified Indian consumer brand partnering directly with creative talent on transparent milestone agreements.' 
                    : 'Authentic content creator focused on high-engagement organic reels and lifestyle showcase.')}
                </p>
              </div>

              {/* SECTION: DETAILS */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-['Archivo'] mb-3">
                  Details & Demographics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Item: Industry or Niche */}
                  <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                      {isBusiness ? 'Industry / Sector' : 'Primary Vertical'}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)] font-['Archivo'] mt-0.5 block">
                      {isBusiness ? (profile.whatYouSell || 'D2C Consumer Goods') : (profile.niche || 'Fashion')}
                    </span>
                  </div>

                  {/* Item: Website or Social */}
                  <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                      {isBusiness ? 'Online Store / Social' : 'Platform & Channel'}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5 block">
                      {profile.websiteOrInstagram || profile.handle}
                    </span>
                  </div>

                  {/* Item: Followers (creator) or Status */}
                  {!isBusiness ? (
                    <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                        Verified Audience Size
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)] mt-0.5 block">
                        {profile.followers || '10K-50K'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                        Payout Currency
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)] mt-0.5 block">
                        Indian Rupees (INR ₹)
                      </span>
                    </div>
                  )}

                  {/* Creator City */}
                  {!isBusiness && (
                    <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                        Location / Metro
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)] mt-0.5 block">
                        {profile.city || 'Mumbai'}
                      </span>
                    </div>
                  )}

                  {/* Verification Status Card */}
                  <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                      Hyperniche Trust Status
                    </span>
                    <div className="mt-0.5">
                      <VerificationBadge isVerified={isVerified} size="sm" />
                    </div>
                  </div>

                  {/* Application usage (used this month, free left, paid extras, hidden for verified users) */}
                  {!isBusiness && !isVerified && (
                    <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)]">
                      <span className="text-[10px] font-semibold text-[var(--text-muted)] block">
                        Application Usage
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-primary)] mt-0.5 block">
                        {usageStats.usedThisMonth} used this month • {usageStats.freeLeft} free left • {usageStats.paidExtras} paid extras
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: CREATOR PORTFOLIO & WORK SAMPLES */}
              {!isBusiness && (
                <div className="pt-6 border-t border-[var(--border-primary)]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-['Archivo'] mb-0.5">
                        Creator Portfolio & Work Samples
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Showcase your past brand integrations, viral reels, and content showreels.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-3">
                    {profile.portfolio ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)]">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Globe className="w-4 h-4 text-[var(--accent)] shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                              {profile.portfolio}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">Verified Showreel / Portfolio Link</span>
                          </div>
                        </div>
                        <a
                          href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 shrink-0 self-start sm:self-auto"
                        >
                          <span>Open Portfolio</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-xs text-[var(--text-secondary)]">
                        <span>No portfolio link attached yet.</span>
                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={startEditing}
                            className="ml-2 text-[var(--accent)] font-bold hover:underline cursor-pointer"
                          >
                            Add portfolio link
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: BRAND SEARCH (Creator's own profile) */}
              {!isBusiness && isOwnProfile && (
                <div className="pt-6 border-t border-[var(--border-primary)]">
                  <div className="mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-['Archivo'] mb-1">
                      Brand search
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Brands can search for creators to invite to their campaigns.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={letBrandsFindMe}
                        onChange={(e) => handleToggleBrandSearch(e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--accent)] accent-[var(--accent)] cursor-pointer"
                      />
                      <span className="text-sm font-bold text-[var(--text-primary)] font-['Archivo']">
                        Let brands find me
                      </span>
                    </label>

                    <p className="text-xs text-[var(--text-secondary)] pl-6.5 leading-relaxed">
                      When this is off, your profile stops appearing when brands search for creators. A brand reviewing an application you sent still sees your profile.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION: ACTIVITY */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-['Archivo']">
                    {isBusiness ? 'Campaigns Posted' : 'Brand Deal Activity'}
                  </h2>
                  {isBusiness && isOwnProfile && onOpenCreateCampaign && (
                    <button
                      onClick={onOpenCreateCampaign}
                      className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Post campaign</span>
                    </button>
                  )}
                </div>

                {isBusiness ? (
                  userCampaigns.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-primary)] text-center">
                      <Briefcase className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-[var(--text-primary)] font-['Archivo']">
                        No campaigns posted yet
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-xs mx-auto">
                        Post your first brand deal brief to start hiring vetted creators across India.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userCampaigns.map((camp) => (
                        <div
                          key={camp.id}
                          className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:border-[var(--accent)] transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--border-primary)]">
                                {camp.category}
                              </span>
                              <span className="text-[10px] font-bold text-[var(--badge-green-text)] bg-[var(--badge-green-bg)] px-2 py-0.5 rounded-full">
                                {camp.status.toUpperCase()}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)] font-['Archivo'] line-clamp-1 mb-1">
                              {camp.title}
                            </h3>
                            {camp.platforms && camp.platforms.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {camp.platforms.map((p) => (
                                  <span
                                    key={p}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-[var(--border-primary)]/60 flex items-center justify-between text-xs">
                            <span className="font-mono text-[11px] text-[var(--text-muted)]">
                              ₹{camp.budget.toLocaleString('en-IN')}
                            </span>
                            <span className="font-semibold text-[var(--text-secondary)]">
                              {camp.applicantsCount || 0} applicants
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  userApplications.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-primary)] text-center">
                      <Briefcase className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-[var(--text-primary)] font-['Archivo']">
                        No active deal applications
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-xs mx-auto">
                        Explore brand deals in your vertical to pitch creative concepts and receive paid sponsorships.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userApplications.map((app) => (
                        <div
                          key={app.id}
                          className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-between gap-4"
                        >
                          <div>
                            <h3 className="font-bold text-sm text-[var(--text-primary)] font-['Archivo']">
                              {app.campaignTitle}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                              Pitch: "{app.pitch}"
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-[var(--text-primary)] font-['Archivo'] block">
                              ₹{app.proposedRate.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-semibold text-[var(--accent)] capitalize">
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Razorpay Payment Verification Modal */}
      <VerificationPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

    </div>
  );
};
