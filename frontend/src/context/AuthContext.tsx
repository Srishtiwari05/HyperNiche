import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { UserProfile, UserRole } from '../types';

export const COMMON_PASSWORDS = new Set([
  '123456',
  '1234567',
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'passwords',
  'password123',
  'qwerty',
  'qwertyuiop',
  'qwerty123',
  'asdfghjk',
  'asdfghjkl',
  'iloveyou',
  'admin123',
  'welcome1',
  'letmein123',
  'hyperniche',
  'hyperniche123',
  'mumbai123',
  'sunshine',
  'princess',
  'football',
  'monkey123',
  'india123',
]);

export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase().trim())) {
    return 'This password is too common. Please choose a more secure password.';
  }
  return null;
}

export interface AuthUser {
  id: string;
  uid: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  authError: string | null;
  needsProfileCompletion: boolean;
  retryAuth: () => void;
  signUp: (email: string, password: string, role: UserRole, extra: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  toggleRolePreview: () => void;
  hasRoleProfile: (role: UserRole) => boolean;
  switchActiveRole: (targetRole: UserRole) => Promise<void>;
  completeRoleSetup: (
    targetRole: UserRole,
    data: {
      handle?: string;
      followers?: string;
      niche?: string;
      name?: string;
      websiteOrInstagram?: string;
      whatYouSell?: string;
    }
  ) => Promise<void>;
  completeProfileForCurrentUser: (
    role: UserRole,
    data: {
      handle?: string;
      followers?: string;
      niche?: string;
      name?: string;
      websiteOrInstagram?: string;
      whatYouSell?: string;
    }
  ) => Promise<void>;
  // exploreAsGuest removed — no guest mode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = 'hyperniche_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [authCycle, setAuthCycle] = useState(0);

  const retryAuth = () => {
    setIsLoading(true);
    setAuthError(null);
    setAuthCycle((c) => c + 1);
  };

  const saveProfileLocally = (profile: UserProfile | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (profile) {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
      }
    } catch {
      // ignore
    }
  };

  const getProfileLocally = (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed?.id?.startsWith('guest_')) {
        localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };

  const loadUserProfile = async (user: AuthUser) => {
    try {
      // 1. Fetch the auth row from Supabase
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (dbUser) {
        // Merge: DB is authoritative for auth fields; cached localStorage holds
        // the full profile (handle, niche, creatorProfile, businessProfile, etc.)
        const cached = getProfileLocally();
        const isSameUser = cached && (cached.id === user.id || cached.email === (dbUser.email || user.email));
        const activeRole = (dbUser.role?.toLowerCase() || cached?.role || 'creator') as UserRole;
        const base = isSameUser ? cached! : {};

        // Parse profile_json column if it exists (future-proof)
        let fromDb: Partial<UserProfile> = {};
        if (dbUser.profile_json) {
          try { fromDb = JSON.parse(dbUser.profile_json); } catch { /* ignore */ }
        }

        const profile: UserProfile = {
          ...base,
          ...fromDb,
          id: dbUser.id,
          role: activeRole,
          activeRole,
          lastActiveRole: (base as UserProfile).lastActiveRole || activeRole,
          roles: (base as UserProfile).roles?.length ? (base as UserProfile).roles! : [activeRole],
          email: dbUser.email || user.email || '',
          name: dbUser.display_name || (base as UserProfile).name || user.email?.split('@')[0] || 'User',
          handle: (base as UserProfile).handle || `@${(dbUser.display_name || user.email?.split('@')[0] || 'user').toLowerCase().replace(/\s+/g, '')}`,
          isVerified: Boolean(dbUser.is_verified),
          verified: Boolean(dbUser.is_verified),
          createdAt: dbUser.created_at || new Date().toISOString(),
          updatedAt: dbUser.updated_at || new Date().toISOString(),
        };
        setUserProfile(profile);
        saveProfileLocally(profile);
        setNeedsProfileCompletion(false);
        setAuthError(null);
        return;
      }

      // 2. Check local cached profile
      const cached = getProfileLocally();
      if (cached && (cached.id === user.id || cached.email === user.email)) {
        setUserProfile(cached);
        setNeedsProfileCompletion(false);
        setAuthError(null);
        return;
      }

      // 3. Fallback: build a complete profile from user metadata and email
      const rawRole = (user.user_metadata?.role || 'creator').toLowerCase();
      const activeRole: UserRole = rawRole.includes('biz') || rawRole.includes('business') || rawRole.includes('brand') ? 'business' : 'creator';
      const displayName = user.user_metadata?.displayName || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const cleanHandle = `@${displayName.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'}`;

      const fallbackProfile: UserProfile = {
        id: user.id,
        role: activeRole,
        activeRole,
        lastActiveRole: activeRole,
        roles: [activeRole],
        hasBusinessProfile: activeRole === 'business',
        hasCreatorProfile: activeRole === 'creator',
        email: user.email || '',
        name: displayName,
        handle: cleanHandle,
        followers: user.user_metadata?.followers || '10K-50K',
        niche: user.user_metadata?.niche || 'Fashion & Lifestyle',
        websiteOrInstagram: user.user_metadata?.websiteOrInstagram || '',
        whatYouSell: user.user_metadata?.whatYouSell || 'Direct to Consumer',
        bio: 'Hyperniche member',
        platform: 'Instagram Reels',
        contentType: 'Reels & Stories',
        letBrandsFindMe: true,
        isVerified: false,
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (activeRole === 'business') {
        fallbackProfile.businessProfile = {
          name: displayName,
          handle: cleanHandle,
          websiteOrInstagram: '',
          whatYouSell: 'Direct to Consumer',
        };
      } else {
        fallbackProfile.creatorProfile = {
          name: displayName,
          handle: cleanHandle,
          followers: '10K-50K',
          niche: 'Fashion & Lifestyle',
          minRate: 25000,
        };
      }

      setUserProfile(fallbackProfile);
      saveProfileLocally(fallbackProfile);
      setNeedsProfileCompletion(false);
      setAuthError(null);
    } catch (err: any) {
      console.warn('Error fetching Supabase user profile:', err);
      const cached = getProfileLocally();
      if (cached) {
        setUserProfile(cached);
        setNeedsProfileCompletion(false);
      } else {
        const rawRole = (user.user_metadata?.role || 'creator').toLowerCase();
        const activeRole: UserRole = rawRole.includes('biz') || rawRole.includes('business') || rawRole.includes('brand') ? 'business' : 'creator';
        const displayName = user.user_metadata?.displayName || user.email?.split('@')[0] || 'User';
        const cleanHandle = `@${displayName.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'}`;
        const fallbackProfile: UserProfile = {
          id: user.id,
          role: activeRole,
          activeRole,
          lastActiveRole: activeRole,
          roles: [activeRole],
          hasBusinessProfile: activeRole === 'business',
          hasCreatorProfile: activeRole === 'creator',
          email: user.email || '',
          name: displayName,
          handle: cleanHandle,
          followers: '10K-50K',
          niche: 'Fashion & Lifestyle',
          websiteOrInstagram: '',
          whatYouSell: '',
          isVerified: false,
          verified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUserProfile(fallbackProfile);
        saveProfileLocally(fallbackProfile);
        setNeedsProfileCompletion(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout | null = null;

    // Safety timeout so UI never hangs
    timerId = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 5000);

    // Initial check with 5s timeout fallback
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), 5000)
    );

    Promise.race([sessionPromise, timeoutPromise]).then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          uid: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        };
        setCurrentUser(user);
        loadUserProfile(user).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        const cached = getProfileLocally();
        if (cached && !cached.id?.startsWith('guest_')) {
          setCurrentUser({
            id: cached.id,
            uid: cached.id,
            email: cached.email,
            user_metadata: { role: cached.role?.toUpperCase(), displayName: cached.name },
          });
          setUserProfile(cached);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setIsLoading(false);
      }
    }).catch((err) => {
      console.warn('Supabase getSession note:', err);
      if (isMounted) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          uid: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        };
        setCurrentUser(user);
        await loadUserProfile(user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserProfile(null);
        saveProfileLocally(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
      subscription.unsubscribe();
    };
  }, [authCycle]);

  const hasRoleProfile = (roleToCheck: UserRole): boolean => {
    if (!userProfile) return false;
    if (roleToCheck === 'business') {
      return Boolean(
        userProfile.hasBusinessProfile ||
        userProfile.businessProfile != null ||
        (userProfile.role === 'business' && (userProfile.whatYouSell || userProfile.websiteOrInstagram))
      );
    }
    if (roleToCheck === 'creator') {
      return Boolean(
        userProfile.hasCreatorProfile ||
        userProfile.creatorProfile != null ||
        (userProfile.role === 'creator' && (userProfile.niche || userProfile.followers))
      );
    }
    return false;
  };

  const switchActiveRole = async (targetRole: UserRole) => {
    if (!userProfile) return;
    let updated: UserProfile = {
      ...userProfile,
      role: targetRole,
      activeRole: targetRole,
      lastActiveRole: targetRole,
      updatedAt: new Date().toISOString(),
    };

    if (targetRole === 'creator') {
      const c = userProfile.creatorProfile;
      if (c) {
        updated.handle = c.handle;
        updated.followers = c.followers;
        updated.niche = c.niche;
        updated.name = c.name || updated.name;
        if (c.bio) updated.bio = c.bio;
        if (c.city) updated.city = c.city;
        if (c.minRate) updated.minRate = c.minRate;
      }
    } else {
      const b = userProfile.businessProfile;
      if (b) {
        updated.name = b.name;
        updated.handle = b.handle || (b.websiteOrInstagram?.startsWith('@') ? b.websiteOrInstagram : `@${b.name.toLowerCase().replace(/\s+/g, '')}`);
        updated.websiteOrInstagram = b.websiteOrInstagram;
        updated.whatYouSell = b.whatYouSell;
        if (b.bio) updated.bio = b.bio;
        if (b.city) updated.city = b.city;
      }
    }

    setUserProfile(updated);
    saveProfileLocally(updated);

    if (currentUser) {
      try {
        await supabase.from('users').update({
          role: targetRole.toUpperCase(),
          updated_at: updated.updatedAt,
        }).eq('id', currentUser.id);
      } catch (err) {
        console.warn('Supabase switch role note:', err);
      }
    }
  };

  const completeRoleSetup = async (
    targetRole: UserRole,
    data: {
      handle?: string;
      followers?: string;
      niche?: string;
      name?: string;
      websiteOrInstagram?: string;
      whatYouSell?: string;
    }
  ) => {
    if (!userProfile) return;

    let updated: any = {
      ...userProfile,
      role: targetRole,
      activeRole: targetRole,
      lastActiveRole: targetRole,
      roles: Array.from(new Set([...(userProfile.roles || [userProfile.role]), targetRole])),
      updatedAt: new Date().toISOString(),
    };

    if (targetRole === 'creator') {
      updated.hasCreatorProfile = true;
      const creatorData = {
        handle: data.handle?.startsWith('@') ? data.handle : `@${data.handle || 'creator'}`,
        followers: data.followers || '10K-50K',
        niche: data.niche || 'Fashion',
        name: data.name || (data.handle ? data.handle.replace('@', '') : 'Creator User'),
        minRate: 25000,
      };
      updated.creatorProfile = creatorData;
      updated.name = creatorData.name;
      updated.handle = creatorData.handle;
      updated.followers = creatorData.followers;
      updated.niche = creatorData.niche;
      updated.minRate = 25000;
    } else {
      updated.hasBusinessProfile = true;
      const bizData = {
        name: data.name || 'Business Partner',
        handle: data.handle || (data.websiteOrInstagram?.startsWith('@') ? data.websiteOrInstagram : `@${(data.name || 'brand').toLowerCase().replace(/\s+/g, '')}`),
        websiteOrInstagram: data.websiteOrInstagram || '',
        whatYouSell: data.whatYouSell || 'Consumer Goods',
      };
      updated.businessProfile = bizData;
      updated.name = bizData.name;
      updated.handle = bizData.handle;
      updated.websiteOrInstagram = bizData.websiteOrInstagram;
      updated.whatYouSell = bizData.whatYouSell;
    }

    setUserProfile(updated as UserProfile);
    saveProfileLocally(updated as UserProfile);

    if (currentUser) {
      try {
        await supabase.from('users').upsert({
          id: currentUser.id,
          email: currentUser.email,
          role: targetRole.toUpperCase(),
          display_name: updated.name,
          updated_at: updated.updatedAt,
          profile_json: JSON.stringify(updated),
        });
      } catch (err) {
        console.warn('Supabase role setup update note:', err);
      }
    }
  };

  const completeProfileForCurrentUser = async (
    targetRole: UserRole,
    data: {
      handle?: string;
      followers?: string;
      niche?: string;
      name?: string;
      websiteOrInstagram?: string;
      whatYouSell?: string;
    }
  ) => {
    if (!currentUser) {
      throw new Error("Couldn't save your profile, please try again");
    }
    setIsLoading(true);
    setAuthError(null);

    const uid = currentUser.id;
    const userEmail = currentUser.email || '';

    const newProfile: any = {
      id: uid,
      role: targetRole,
      activeRole: targetRole,
      lastActiveRole: targetRole,
      roles: [targetRole],
      hasBusinessProfile: targetRole === 'business',
      hasCreatorProfile: targetRole === 'creator',
      email: userEmail,
      name: data.name || (targetRole === 'business' ? 'Business Partner' : 'Creator User'),
      handle: data.handle || (targetRole === 'business' ? '@mybrand' : '@creator'),
      followers: data.followers || '10K-50K',
      niche: data.niche || 'Fashion',
      websiteOrInstagram: data.websiteOrInstagram || '',
      whatYouSell: data.whatYouSell || '',
      letBrandsFindMe: true,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (targetRole === 'business') {
      newProfile.businessProfile = {
        name: data.name || 'Business Partner',
        handle: data.handle || (data.websiteOrInstagram?.startsWith('@') ? data.websiteOrInstagram : `@${(data.name || 'brand').toLowerCase().replace(/\s+/g, '')}`),
        websiteOrInstagram: data.websiteOrInstagram || '',
        whatYouSell: data.whatYouSell || 'Consumer Goods',
      };
    } else {
      newProfile.minRate = 25000;
      newProfile.creatorProfile = {
        handle: data.handle?.startsWith('@') ? data.handle : `@${data.handle || 'creator'}`,
        followers: data.followers || '10K-50K',
        niche: data.niche || 'Fashion',
        name: data.name || (data.handle ? data.handle.replace('@', '') : 'Creator User'),
        minRate: 25000,
      };
    }

    try {
      const followersCount = parseInt(String(newProfile.followers || '10').replace(/\D/g, '')) * (String(newProfile.followers).includes('K') ? 1000 : 1);
      await api.syncUser({
        id: uid,
        email: userEmail,
        role: targetRole.toUpperCase(),
        displayName: newProfile.name,
        handle: newProfile.handle,
        niche: newProfile.niche,
        followersCount: followersCount || 10000,
        websiteUrl: newProfile.websiteOrInstagram || '',
        bio: newProfile.bio || '',
        companyName: newProfile.name,
        industry: newProfile.whatYouSell || newProfile.niche || '',
        whatYouSell: newProfile.whatYouSell || '',
      }).catch(() => null);

      await supabase.from('users').upsert({
        id: uid,
        email: userEmail,
        role: targetRole.toUpperCase(),
        display_name: newProfile.name,
        updated_at: newProfile.updatedAt,
        // Store full profile so re-login restores everything
        profile_json: JSON.stringify(newProfile),
      });

      setUserProfile(newProfile as UserProfile);
      saveProfileLocally(newProfile as UserProfile);
      setNeedsProfileCompletion(false);
    } catch (err: any) {
      console.error('Failed to complete profile:', err);
      // Fallback locally
      setUserProfile(newProfile as UserProfile);
      saveProfileLocally(newProfile as UserProfile);
      setNeedsProfileCompletion(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    extra: Partial<UserProfile>
  ) => {
    setIsLoading(true);
    setAuthError(null);

    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setIsLoading(false);
      throw new Error(pwdErr);
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: role.toUpperCase(),
            displayName: extra.name || (role === 'business' ? 'Business Partner' : 'Creator User'),
          },
        },
      });

      if (error) {
        if (error.message?.includes('already registered')) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }
        throw new Error(error.message || 'Could not create account');
      }

      const uid = authData.user?.id || `user_${Date.now()}`;
      const authUser: AuthUser = {
        id: uid,
        uid: uid,
        email: email.trim(),
        user_metadata: {
          role: role.toUpperCase(),
          displayName: extra.name || (role === 'business' ? 'Business Partner' : 'Creator User'),
        },
      };
      setCurrentUser(authUser);

      const newProfile: any = {
        id: uid,
        role,
        activeRole: role,
        lastActiveRole: role,
        roles: [role],
        hasBusinessProfile: role === 'business',
        hasCreatorProfile: role === 'creator',
        email: email.trim(),
        name: extra.name || (role === 'business' ? 'Business Partner' : 'Creator User'),
        handle: extra.handle || (role === 'business' ? '@mybrand' : '@creator'),
        followers: extra.followers || '10K-50K',
        niche: extra.niche || 'Fashion',
        websiteOrInstagram: extra.websiteOrInstagram || '',
        whatYouSell: extra.whatYouSell || '',
        bio: extra.bio || '',
        portfolio: extra.portfolio || '',
        platform: extra.platform || 'Instagram Reels',
        contentType: extra.contentType || 'Reels & Stories',
        letBrandsFindMe: true,
        isVerified: false,
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (role === 'business') {
        newProfile.businessProfile = {
          name: newProfile.name,
          handle: newProfile.handle,
          websiteOrInstagram: newProfile.websiteOrInstagram,
          whatYouSell: newProfile.whatYouSell,
        };
      } else {
        newProfile.creatorProfile = {
          name: newProfile.name,
          handle: newProfile.handle,
          followers: newProfile.followers,
          niche: newProfile.niche,
          minRate: 25000,
        };
      }

      setUserProfile(newProfile as UserProfile);
      saveProfileLocally(newProfile as UserProfile);
      setNeedsProfileCompletion(false);

      // Sync with DB & backend
      try {
        const followersCount = parseInt(String(newProfile.followers || '10').replace(/\D/g, '')) * (String(newProfile.followers).includes('K') ? 1000 : 1);
        await api.syncUser({
          id: uid,
          email: email.trim(),
          role: role.toUpperCase(),
          displayName: newProfile.name,
          handle: newProfile.handle,
          niche: newProfile.niche,
          followersCount: followersCount || 10000,
          websiteUrl: newProfile.websiteOrInstagram || '',
          bio: newProfile.bio || '',
          companyName: newProfile.name,
          industry: newProfile.whatYouSell || newProfile.niche || '',
          whatYouSell: newProfile.whatYouSell || '',
        }).catch(() => null);

        await supabase.from('users').upsert({
          id: uid,
          email: email.trim(),
          role: role.toUpperCase(),
          display_name: newProfile.name,
          updated_at: newProfile.updatedAt,
          // Store full profile so re-login restores everything
          profile_json: JSON.stringify(newProfile),
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          throw new Error('Please confirm your email address or turn off "Confirm email" in Supabase Auth settings.');
        }
        throw new Error(error.message || 'Invalid email or password.');
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          uid: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        };
        setCurrentUser(authUser);
        await loadUserProfile(authUser);
      }
    } catch (err: any) {
      console.warn('Sign in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      saveProfileLocally(null);
      setUserProfile(null);
      setCurrentUser(null);
      setNeedsProfileCompletion(false);
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    saveProfileLocally(updated);

    if (currentUser) {
      try {
        await supabase.from('users').update({
          display_name: updated.name,
          updated_at: updated.updatedAt,
          profile_json: JSON.stringify(updated),
        }).eq('id', currentUser.id);
      } catch (err) {
        console.warn('Supabase profile update note:', err);
      }
    }
  };

  const toggleRolePreview = () => {
    if (!userProfile) return;
    const newRole: UserRole = userProfile.role === 'business' ? 'creator' : 'business';
    switchActiveRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        authError,
        needsProfileCompletion,
        retryAuth,
        signUp,
        signIn,
        signOut,
        updateUserProfile,
        toggleRolePreview,
        hasRoleProfile,
        switchActiveRole,
        completeRoleSetup,
        completeProfileForCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
