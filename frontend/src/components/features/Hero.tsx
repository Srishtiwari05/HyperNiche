import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 border-b border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400 mb-6">
          <Zap className="h-3.5 w-3.5" />
          The Premier B2B2C Creator-Brand Marketplace
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Connect with Verified <span className="text-indigo-400">Hyper-Niche</span> Creators That Actually Convert.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
          Skip generic influencers. Partner directly with passionate creators across specialized niches with guaranteed deliverables, secure chat, and escrow protections.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/campaigns">
            <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-base">
              Explore Active Campaigns
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/creators">
            <Button variant="outline" size="lg" className="text-base">
              Find Verified Creators
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <span>Zero Off-Platform Spam</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Verified Creator Profiles</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Direct Milestone Pipeline</span>
          </div>
        </div>
      </div>
    </section>
  );
}
