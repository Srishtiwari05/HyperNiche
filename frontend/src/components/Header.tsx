import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { ThemeToggle } from './ThemeToggle';
import { RoleSwitchModal } from './RoleSwitchModal';
import { VerificationBadge } from './VerificationBadge';
import { MessageSquare, LogOut, ArrowRightLeft, PlusCircle, Building2, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: 'browse' | 'my-campaigns' | 'applications' | 'messages' | 'profile';
  setCurrentTab: (tab: 'browse' | 'my-campaigns' | 'applications' | 'messages' | 'profile') => void;
  onOpenCreateCampaign?: () => void;
  onOpenProfile?: () => void;
  onOpenMessages?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreateCampaign,
  onOpenProfile,
  onOpenMessages,
}) => {
  const { userProfile, signOut, hasRoleProfile, switchActiveRole } = useAuth();
  const { applications, campaigns, messages } = useMarketplace();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [switchTargetRole, setSwitchTargetRole] = useState<UserRole>('creator');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = userProfile?.role || 'creator';
  const targetRole: UserRole = role === 'business' ? 'creator' : 'business';

  // Count relevant items for badges, excluding removed campaigns
  const nonRemovedCampaignIds = new Set(
    campaigns.filter((c) => !c.removed && c.status !== 'removed').map((c) => c.id)
  );

  const relevantApps = applications.filter((a) =>
    role === 'business'
      ? a.businessId === userProfile?.id && nonRemovedCampaignIds.has(a.campaignId)
      : a.creatorId === userProfile?.id && nonRemovedCampaignIds.has(a.campaignId)
  );

  const pendingCount = relevantApps.filter((a) => a.status === 'pending').length;

  const unreadMessagesCount = messages.filter(
    (m) => m.receiverId === userProfile?.id && !m.read
  ).length;

  const handleRoleSwitchClick = () => {
    if (hasRoleProfile(targetRole)) {
      switchActiveRole(targetRole);
      setCurrentTab('browse');
    } else {
      setSwitchTargetRole(targetRole);
      setIsRoleModalOpen(true);
    }
  };

  const handleMessagesClick = () => {
    setCurrentTab('messages');
    if (onOpenMessages) {
      onOpenMessages();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-primary)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px] sm:h-[76px] gap-2 sm:gap-8 min-w-0">
            <div className="flex flex-col items-start justify-center shrink-0">
              <button
                onClick={() => {
                  setCurrentTab('browse');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 focus:outline-none group text-left cursor-pointer"
              >
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] font-['Archivo'] leading-none">
                  Hyperniche<span className="text-[var(--accent)]">.</span>
                </span>
              </button>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-[var(--text-muted)] mt-1 tracking-normal select-none">
                {role === 'business' ? (
                  <>
                    <Building2 className="w-3 h-3 text-[var(--accent)] shrink-0" />
                    <span>Business owner</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-[var(--accent)] shrink-0" />
                    <span>Content creator</span>
                  </>
                )}
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 shrink-0">
              <button
                onClick={() => setCurrentTab('browse')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  currentTab === 'browse'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]/40'
                }`}
              >
                {role === 'business' ? 'Browse creators' : 'Browse deals'}
              </button>

              {role === 'business' && (
                <button
                  onClick={() => setCurrentTab('my-campaigns')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors ${
                    currentTab === 'my-campaigns'
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]/40'
                  }`}
                >
                  My campaigns
                </button>
              )}

              <button
                onClick={() => setCurrentTab('applications')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors relative ${
                  currentTab === 'applications'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]/40'
                }`}
              >
                {role === 'business' ? 'Applicants & deals' : 'My applications'}
                {pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--accent)] text-white">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleMessagesClick}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                  currentTab === 'messages'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]/40'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Messages</span>
                {unreadMessagesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg-card)]"></span>
                )}
              </button>
            </nav>

            {/* Right Action Icons & User Info */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {role === 'business' && onOpenCreateCampaign && (
                <button
                  onClick={onOpenCreateCampaign}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post campaign</span>
                </button>
              )}

              <button
                onClick={handleRoleSwitchClick}
                title={`Switch active role to ${targetRole}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Switch</span>
              </button>

              <ThemeToggle />

              {userProfile && (
                <button
                  onClick={() => (onOpenProfile ? onOpenProfile() : setCurrentTab('profile'))}
                  title="View Profile"
                  className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    currentTab === 'profile'
                      ? 'bg-[var(--border-primary)]/50 border border-[var(--accent)]'
                      : 'hover:bg-[var(--border-primary)]/30 border border-transparent hover:border-[var(--border-primary)]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs border border-[var(--border-primary)] overflow-hidden">
                    {userProfile.avatarUrl ? (
                      <img src={userProfile.avatarUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      userProfile.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[100px]">
                        {userProfile.name}
                      </span>
                      <VerificationBadge isVerified={userProfile.isVerified} size="sm" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {userProfile.handle || '@user'}
                    </span>
                  </div>
                </button>
              )}

              <button
                onClick={signOut}
                title="Log out"
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--border-primary)]/30 transition-colors"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="block w-4 h-0.5 rounded-full bg-current" />
                  <span className="block w-4 h-0.5 rounded-full bg-current" />
                  <span className="block w-4 h-0.5 rounded-full bg-current" />
                </div>
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-[var(--border-primary)] py-3 space-y-2">
              {[
                { key: 'browse', label: role === 'business' ? 'Browse creators' : 'Browse deals' },
                ...(role === 'business' ? [{ key: 'my-campaigns', label: 'My campaigns' }] : []),
                { key: 'applications', label: role === 'business' ? 'Applicants & deals' : 'My applications' },
                { key: 'messages', label: 'Messages' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setCurrentTab(item.key as 'browse' | 'my-campaigns' | 'applications' | 'messages');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    currentTab === item.key
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  handleRoleSwitchClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)]"
              >
                Switch active role
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Role setup modal when user has not yet configured the opposite profile */}
      <RoleSwitchModal
        isOpen={isRoleModalOpen}
        targetRole={switchTargetRole}
        onClose={() => setIsRoleModalOpen(false)}
        onSuccess={() => setCurrentTab('browse')}
      />
    </>
  );
};

