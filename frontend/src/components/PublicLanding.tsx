import React from 'react';
import { ArrowRight, ArrowUpRight, Building2, Moon, Sparkles, Sun, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PublicLandingProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({ onCreateAccount, onLogin }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FDF6EC] text-[#2B2622] selection:bg-[#F06A4D]/20 dark:bg-[#0b0b0b] dark:text-[#eee9e2] dark:selection:bg-[#c81020]/30 dark:selection:text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-36 h-[30rem] w-[30rem] rounded-full bg-[#c9e7cd]/25 blur-[130px]" />
        <div className="absolute right-[-5rem] top-[28rem] h-[28rem] w-[28rem] rounded-full bg-[#F06A4D]/10 blur-[130px] dark:bg-[#b3121e]/20" />
        <div className="absolute left-[48%] top-[12rem] h-[22rem] w-[22rem] rounded-full bg-[#d9d3ff]/20 blur-[120px] dark:bg-[#d9d3ff]/10" />
      </div>

      <header className="relative z-10 border-b border-[#EADFCF] dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div>
            <div className="text-[1.65rem] font-black leading-none tracking-[-0.06em] sm:text-[1.9rem]">
              Hyperniche<span className="text-[#F06A4D] dark:text-[#ef3542]">.</span>
            </div>
            <div className="mt-1 text-[10px] font-medium tracking-wide text-[#736B63] dark:text-white/50">Creator × brand partnerships</div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to bright mode' : 'Switch to dark mode'}
              title={isDark ? 'Bright mode' : 'Dark mode'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EADFCF] bg-[#FFFAF2] text-[#2B2622] transition hover:border-[#F06A4D] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75 dark:hover:border-white/35"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={onLogin} className="rounded-full px-3 py-2.5 text-xs font-bold text-[#736B63] transition hover:text-[#2B2622] dark:text-white/75 dark:hover:text-white sm:px-5">
              Log in
            </button>
            <button onClick={onCreateAccount} className="inline-flex items-center gap-2 rounded-full bg-[#F06A4D] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#D95438] dark:bg-[#c81020] dark:hover:bg-[#df1b2b] sm:px-5">
              Get started <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100svh-77px)] max-w-[1440px] items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-12 lg:py-16">
        <div className="max-w-[720px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EADFCF] bg-[#FFFAF2] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#736B63] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/65">
            <span className="h-2 w-2 rounded-full bg-[#F06A4D] shadow-[0_0_14px_rgba(240,106,77,0.5)] dark:bg-[#ef3542] dark:shadow-[0_0_14px_rgba(239,53,66,0.8)]" />
            Made for creators and brands
          </div>
          <h1 className="max-w-[760px] text-[clamp(3.7rem,8vw,7.4rem)] font-black leading-[0.88] tracking-[-0.075em]">
            Turn your audience into <span className="text-[#2B2622] dark:text-[#f0eae2]">income.</span>
          </h1>
          <p className="mt-7 max-w-[550px] text-base leading-relaxed text-[#736B63] dark:text-white/60 sm:text-lg">
            Hyperniche brings independent creators and Indian brands together to build direct, meaningful partnerships.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={onCreateAccount} className="group inline-flex items-center gap-3 rounded-full bg-[#F06A4D] px-6 py-3.5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-[#D95438] hover:shadow-[0_14px_36px_rgba(240,106,77,0.28)] dark:bg-[#c81020] dark:hover:bg-[#df1b2b] sm:px-7">
              Create your account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={onLogin} className="rounded-full border border-[#EADFCF] bg-[#FFFAF2] px-6 py-3.5 text-xs font-black uppercase tracking-[0.08em] text-[#2B2622] transition hover:border-[#736B63] dark:border-white/15 dark:bg-white/[0.03] dark:text-white/80 dark:hover:border-white/35 dark:hover:text-white sm:px-7">
              I already have an account
            </button>
          </div>

          <div className="mt-12 grid max-w-[580px] grid-cols-1 gap-3 border-t border-[#EADFCF] pt-5 dark:border-white/10 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-[#EADFCF] bg-[#FFFAF2] p-3.5 dark:border-white/[0.08] dark:bg-white/[0.025]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9d3ff]/25 text-[#6254a0] dark:bg-[#d9d3ff]/10 dark:text-[#d9d3ff]"><UserRound className="h-5 w-5" /></span>
              <span><span className="block text-xs font-bold">For creators</span><span className="mt-0.5 block text-[11px] text-[#736B63] dark:text-white/45">Find your next collaboration</span></span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#EADFCF] bg-[#FFFAF2] p-3.5 dark:border-white/[0.08] dark:bg-white/[0.025]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffb59f]/25 text-[#a24d3a] dark:bg-[#ffb59f]/10 dark:text-[#ffb59f]"><Building2 className="h-5 w-5" /></span>
              <span><span className="block text-xs font-bold">For brands</span><span className="mt-0.5 block text-[11px] text-[#736B63] dark:text-white/45">Meet creators who fit your vision</span></span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:justify-self-end">
          <div className="absolute -inset-8 rounded-[40px] bg-[#F06A4D]/10 blur-3xl dark:bg-[#c81020]/10" />
          <div className="relative overflow-hidden rounded-[30px] border border-[#EADFCF] bg-[#FFFAF2]/90 p-5 shadow-[0_30px_100px_rgba(43,38,34,0.12)] dark:border-white/10 dark:bg-[#121212]/90 dark:shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#EADFCF] pb-5 dark:border-white/[0.08]">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#736B63] dark:text-white/50">
                <Sparkles className="h-3.5 w-3.5 text-[#F06A4D] dark:text-[#ef3542]" /> A new kind of collaboration
              </div>
              <span className="rounded-full border border-[#EADFCF] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#8F877E] dark:border-white/10 dark:text-white/40">Hyperniche</span>
            </div>

            <div className="relative my-7 flex items-center justify-center gap-4 sm:gap-6">
              <div className="absolute left-[22%] right-[22%] top-1/2 h-px bg-gradient-to-r from-[#d9d3ff]/40 via-[#F06A4D]/70 to-[#ffb59f]/40 dark:from-[#d9d3ff]/20 dark:via-[#ef3542]/70 dark:to-[#ffb59f]/20" />
              <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-[26px] border border-[#d9d3ff]/50 bg-[#d9d3ff]/20 shadow-[0_0_45px_rgba(217,211,255,0.08)] sm:h-28 sm:w-28 dark:border-[#d9d3ff]/20 dark:bg-[#d9d3ff]/[0.08]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d9d3ff] text-sm font-black text-[#25212d]">C</span>
                <span className="mt-2 text-[10px] font-semibold text-[#736B63] dark:text-white/65">Creator</span>
              </div>
              <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#EADFCF] bg-[#FDF6EC] text-[#F06A4D] dark:border-white/10 dark:bg-[#171717] dark:text-[#ef3542]"><ArrowRight className="h-4 w-4" /></div>
              <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-[26px] border border-[#ffb59f]/50 bg-[#ffb59f]/20 shadow-[0_0_45px_rgba(255,181,159,0.08)] sm:h-28 sm:w-28 dark:border-[#ffb59f]/20 dark:bg-[#ffb59f]/[0.08]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffb59f] text-sm font-black text-[#30221e]">B</span>
                <span className="mt-2 text-[10px] font-semibold text-[#736B63] dark:text-white/65">Brand</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#EADFCF] bg-[#F8EFE3] p-4 sm:p-5 dark:border-white/[0.08] dark:bg-[#191919]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F06A4D] dark:text-[#ef3542]">Your next collaboration</p>
              <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">Starts with a connection.</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#736B63] dark:text-white/45 sm:text-sm">Create a profile to find the people and projects that fit what you do.</p>
            </div>
            <div className="mt-4 flex items-center justify-between px-1 text-[10px] font-medium text-[#8F877E] dark:text-white/35">
              <span>Built for India's creator economy</span>
              <span className="tracking-[0.18em]">01 / 01</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#EADFCF] px-5 py-4 text-center text-[10px] text-[#8F877E] dark:border-white/[0.08] dark:text-white/35">
        Hyperniche · Creator and brand partnerships
      </footer>
    </main>
  );
};
