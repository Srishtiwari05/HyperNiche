"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, MessageSquare, Briefcase, Users, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Hyper<span className="text-indigo-400">niche</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/campaigns" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Briefcase className="h-4 w-4" />
            Campaigns
          </Link>
          <Link href="/creators" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Users className="h-4 w-4" />
            Creators
          </Link>
          <Link href="/applications" className="flex items-center gap-1.5 hover:text-white transition-colors">
            Applications
          </Link>
          <Link href="/messages" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <MessageSquare className="h-4 w-4" />
            Messages
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
