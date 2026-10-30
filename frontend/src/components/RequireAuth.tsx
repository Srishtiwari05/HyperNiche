"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthenticated(Boolean(session));
    });
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthenticated(Boolean(data.session));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (authenticated === null) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-sm text-white/60">Loading Hyperniche…</main>;
  }
  if (!authenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0b0b0b] px-5 text-center text-[#eee9e2]">
        <p className="text-2xl font-black">Sign in to Hyperniche</p>
        <p className="max-w-md text-sm text-white/55">Create an account or log in to access campaigns, creators, applications, and messages.</p>
        <a href="/" className="rounded-full bg-[#c81020] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#df1b2b]">Continue to Hyperniche</a>
      </main>
    );
  }
  return <>{children}</>;
}
