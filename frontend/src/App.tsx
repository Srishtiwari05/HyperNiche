'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { MainMarketplace } from './components/MainMarketplace';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { SignupFlow } from './components/SignupFlow';
import { CreateCampaignModal } from './components/CreateCampaignModal';
import { ApplyCampaignModal } from './components/ApplyCampaignModal';
import { SendBriefModal } from './components/SendBriefModal';
import { ProfilePage } from './components/ProfilePage';
import { MessagesInbox } from './components/MessagesInbox';
import { MyCampaignsView } from './components/MyCampaignsView';
import { ManageApplicationsView } from './components/ManageApplicationsView';
import { MyApplicationsView } from './components/MyApplicationsView';
import { UserProfile, Campaign } from './types';

const MainAppContent: React.FC = () => {
  const { userProfile, isLoading, authError, retryAuth } = useAuth();
  const { setSelectedCategory } = useMarketplace();

  // Navigation tab: 'browse' | 'my-campaigns' | 'applications' | 'messages' | 'profile'
  const [currentTab, setCurrentTab] = useState<
    'browse' | 'my-campaigns' | 'applications' | 'messages' | 'profile'
  >('browse');

  // Currently viewed user profile (null = own profile)
  const [viewingUserProfile, setViewingUserProfile] = useState<UserProfile | null>(null);

  // Modals state
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [applyingCampaign, setApplyingCampaign] = useState<Campaign | null>(null);
  const [briefTargetCreator, setBriefTargetCreator] = useState<UserProfile | null>(null);

  if (authError) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-bold">!</span>
          </div>
          <h2 className="text-lg font-bold font-['Archivo'] mb-1">Can&apos;t connect to the server</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed break-words font-mono">
            {authError}
          </p>
          <button
            onClick={retryAuth}
            className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin"></div>
          <span className="text-xs font-bold tracking-wider text-[var(--text-secondary)] font-['Archivo']">
            Loading Hyperniche...
          </span>
        </div>
      </div>
    );
  }

  // If user is not authenticated or profile not set up yet, show the sign-up flow
  if (!userProfile) {
    return <SignupFlow />;
  }

  const role = userProfile.role;

  const scrollToCategories = () => {
    setCurrentTab('browse');
    const el = document.getElementById('categories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToMarketplace = () => {
    setCurrentTab('browse');
    window.scrollTo({ top: 480, behavior: 'smooth' });
  };

  const handleOpenOwnProfile = () => {
    setViewingUserProfile(null);
    setCurrentTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewUserProfile = (target: UserProfile) => {
    setViewingUserProfile(target);
    setCurrentTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewBusinessProfile = (camp: Campaign) => {
    setViewingUserProfile({
      id: camp.businessId,
      role: 'business',
      name: camp.businessName,
      handle: camp.businessHandle,
      email: `${camp.businessHandle.replace('@', '')}@example.com`,
      whatYouSell: camp.title,
      websiteOrInstagram: camp.businessHandle,
      isVerified: camp.businessIsVerified,
      bio: camp.description,
    });
    setCurrentTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${currentTab === 'messages' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : ''} bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent)]/20 selection:text-[var(--accent)] transition-colors`}>
      
      <div className={`flex-1 flex flex-col ${currentTab === 'messages' ? 'h-full min-h-0 overflow-hidden' : ''}`}>
        {/* Announcement Bar (hidden on messages) */}
        {currentTab !== 'messages' && (
          <AnnouncementBar />
        )}

        {/* Sticky Nav with Role-Based Controls */}
        <Header
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            if (tab !== 'profile') {
              setViewingUserProfile(null);
            }
            setCurrentTab(tab);
          }}
          onOpenCreateCampaign={() => setIsCreateCampaignOpen(true)}
          onOpenProfile={handleOpenOwnProfile}
          onOpenMessages={() => setCurrentTab('messages')}
        />

        {/* Main Content Area */}
        {currentTab === 'browse' && (
          <main>
            {/* Role-Personalized Hero Banner */}
            <Hero
              onPostCampaign={() => setIsCreateCampaignOpen(true)}
              onBrowseCreators={scrollToMarketplace}
              onSeeOpenDeals={scrollToMarketplace}
              onBrowseCategories={scrollToCategories}
            />

            {/* 16 Category Tiles with 5 Pastel Tones */}
            <CategoryGrid id="categories-section" />

            {/* Marketplace Grid: Creators for Business / Campaigns for Creator */}
            <MainMarketplace
              onOpenSendBrief={(creator) => setBriefTargetCreator(creator)}
              onOpenApplyCampaign={(campaign) => setApplyingCampaign(campaign)}
              onViewProfile={handleViewUserProfile}
              onViewBusinessProfile={handleViewBusinessProfile}
            />

            {/* How It Works (3 Steps) */}
            <HowItWorks />
          </main>
        )}

        {currentTab === 'my-campaigns' && role === 'business' && (
          <main>
            <MyCampaignsView
              onOpenCreateCampaign={() => setIsCreateCampaignOpen(true)}
              onViewApplicants={() => setCurrentTab('applications')}
            />
          </main>
        )}

        {currentTab === 'applications' && (
          <main>
            {role === 'business' ? (
              <ManageApplicationsView 
                onOpenMessages={() => setCurrentTab('messages')} 
              />
            ) : (
              <MyApplicationsView
                onBrowseDeals={() => setCurrentTab('browse')}
                onOpenMessages={() => setCurrentTab('messages')}
              />
            )}
          </main>
        )}

        {/* Full-Page Instagram DM Style Inbox (Fixed 100dvh minus nav) */}
        {currentTab === 'messages' && (
          <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <MessagesInbox />
          </main>
        )}

        {/* Full-Page Profile (Own profile or viewing other user) */}
        {currentTab === 'profile' && (
          <main className="flex-1 flex flex-col">
            <ProfilePage
              viewingProfile={viewingUserProfile}
              onBack={() => {
                setViewingUserProfile(null);
                setCurrentTab('browse');
              }}
              onNavigateToMessages={() => setCurrentTab('messages')}
              onOpenCreateCampaign={() => setIsCreateCampaignOpen(true)}
            />
          </main>
        )}
      </div>

      {/* Streetwear Minimalist Footer - Hidden on Messages page */}
      {currentTab !== 'messages' && (
        <Footer />
      )}

      {/* Interactive Modals */}
      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
      />

      <ApplyCampaignModal
        campaign={applyingCampaign}
        isOpen={applyingCampaign !== null}
        onClose={() => setApplyingCampaign(null)}
      />

      <SendBriefModal
        creator={briefTargetCreator}
        isOpen={briefTargetCreator !== null}
        onClose={() => setBriefTargetCreator(null)}
        onOpenMessages={() => setCurrentTab('messages')}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MarketplaceProvider>
          <MainAppContent />
        </MarketplaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
