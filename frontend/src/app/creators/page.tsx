"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CreatorCard } from "@/components/features/CreatorCard";
import { CreatorProfile } from "@/types";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { PageLoading } from "@/components/ui/PageLoading";

const NICHES = ["All", "Tech", "SaaS", "Fitness", "Fintech", "Gaming", "Beauty", "Fashion", "AI Tools"];

function startingRate(creator: any) {
  return Number(creator.rateReelInr || creator.ratePostInr || creator.rateStoryInr || creator.rateVideoInr || 0);
}

function campaignFitScore(creator: any, campaign: any) {
  if (!campaign) return 0;
  const campaignText = `${campaign.title} ${campaign.category || ""} ${campaign.platform || ""} ${campaign.requirements || ""}`.toLowerCase();
  const profileText = `${creator.niche || ""} ${creator.bio || ""} ${creator.instagramBio || ""} ${creator.instagramHandle || ""} ${creator.instagramUsername || ""}`.toLowerCase();
  const niche = creator.niche?.trim().toLowerCase();
  const rate = startingRate(creator);
  const budget = Number(campaign.budgetInr || 0);
  let score = niche && campaignText.includes(niche) ? 3 : 0;
  const words = campaignText.split(/[^a-z0-9]+/).filter((word: string) => word.length > 4);
  if (words.some((word: string) => profileText.includes(word))) score += 2;
  if (campaign.platform?.toLowerCase().includes("instagram") && (creator.instagramHandle || creator.instagramUsername)) score += 2;
  if (budget && rate) score += rate <= budget ? 2 : -2;
  return score;
}

function CreatorsPageContent() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [remoteCreators, setRemoteCreators] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [viewerIsBrand, setViewerIsBrand] = useState(false);
  const [brandCampaigns, setBrandCampaigns] = useState<any[]>([]);
  const [matchCampaignId, setMatchCampaignId] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minEngagement, setMinEngagement] = useState("");

  useEffect(() => {
    fetchCreators();
  }, [selectedNiche]);

  useEffect(() => {
    api.getMe().then(async (me) => {
      if (String(me.role).toUpperCase() !== "BRAND") return;
      setViewerIsBrand(true);
      try { setBrandCampaigns(await api.getMyCampaigns() || []); } catch { /* Campaign matching stays optional. */ }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      setRemoteCreators(null);
      setSearching(false);
      setSearchError("");
      return;
    }

    let active = true;
    const timer = setTimeout(() => {
      setSearching(true);
      setSearchError("");
      api.searchInstagramCreators(query)
        .then((results) => { if (active) setRemoteCreators(results); })
        .catch((err: any) => { if (active) setSearchError(err.message || "Creator search failed."); })
        .finally(() => { if (active) setSearching(false); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);

  async function fetchCreators() {
    setLoading(true);
    try {
      const nicheParam = selectedNiche === "All" ? undefined : selectedNiche;
      const res = await api.getCreators({ niche: nicheParam });
      if (res?.content) {
        setCreators(res.content);
      }
    } catch (e) {
      console.error("Error fetching creators", e);
    } finally {
      setLoading(false);
    }
  }

  const selectedCampaign = brandCampaigns.find((campaign) => campaign.id === matchCampaignId);
  const matchesFilters = (cr: any) => {
    const query = search.trim().toLowerCase();
    const nameMatches = !query || [cr.displayName, cr.niche, cr.bio, cr.instagramHandle].some((value) => value?.toLowerCase().includes(query));
    const rate = startingRate(cr);
    const engagement = Number(cr.engagementRate || cr.insights?.engagement_rate || 0);
    const nicheMatches = selectedNiche === "All" || cr.niche?.toLowerCase().includes(selectedNiche.toLowerCase());
    return nameMatches
      && nicheMatches
      && (!minFollowers || cr.followersCount >= Number(minFollowers))
      && (!maxRate || (rate > 0 && rate <= Number(maxRate)))
      && (!minEngagement || engagement >= Number(minEngagement));
  };
  const filtered = creators.filter(matchesFilters)
    .map((creator) => ({ creator, score: campaignFitScore(creator, selectedCampaign) }))
    .sort((a, b) => b.score - a.score);
  const filteredInstagram = (remoteCreators || []).filter(matchesFilters)
    .map((creator) => ({ creator, score: campaignFitScore(creator, selectedCampaign) }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 motion-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Verified Creators Directory</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Explore vetted content creators across specialized domains.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Instagram or Hyperniche username..."
            className="pl-9 bg-zinc-900 border-zinc-800"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {NICHES.map(niche => (
            <button
              key={niche}
              onClick={() => setSelectedNiche(niche)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedNiche === niche
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {viewerIsBrand && <label className="text-xs text-zinc-400">Match to campaign
          <select value={matchCampaignId} onChange={(event) => setMatchCampaignId(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white"><option value="">No campaign selected</option>{brandCampaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select>
        </label>}
        <label className="text-xs text-zinc-400">Minimum followers<input type="number" min="0" value={minFollowers} onChange={(event) => setMinFollowers(event.target.value)} placeholder="Any" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white" /></label>
        <label className="text-xs text-zinc-400">Maximum starting rate (₹)<input type="number" min="0" value={maxRate} onChange={(event) => setMaxRate(event.target.value)} placeholder="Any" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white" /></label>
        <label className="text-xs text-zinc-400">Minimum engagement (%)<input type="number" min="0" max="100" step="0.1" value={minEngagement} onChange={(event) => setMinEngagement(event.target.value)} placeholder="Any" className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white" /></label>
      </div>

      {search.trim().length >= 2 && (
        <section className="mb-8 space-y-4" aria-live="polite">
          <div><h2 className="text-lg font-bold text-white">Instagram matches</h2><p className="text-xs text-zinc-400">Connected Instagram profiles appear only when the creator enables discovery.</p></div>
          {searchError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{searchError}</p>}
          {searching ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-40 rounded-xl bg-zinc-900 animate-pulse" /><div className="h-40 rounded-xl bg-zinc-900 animate-pulse" /><div className="h-40 rounded-xl bg-zinc-900 animate-pulse" /></div> : filteredInstagram.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstagram.map(({ creator, score }, index) => <Link key={creator.creatorId} href={`/creators/${creator.creatorId}`} className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-lg motion-fade-up">
                {selectedCampaign && index < 3 && score > 0 && <span className="absolute right-3 top-3 rounded-full bg-indigo-500 px-2.5 py-1 text-[10px] font-bold text-white">Campaign fit</span>}
                <div className="flex items-center gap-3">
                  {creator.profilePictureUrl ? <img src={creator.profilePictureUrl} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-zinc-800" />}
                  <div className="min-w-0"><h3 className="truncate font-bold text-white">{creator.displayName}</h3><p className="truncate text-xs text-zinc-400">@{creator.instagramUsername}</p></div>
                </div>
                <p className="mt-4 line-clamp-2 text-xs text-zinc-400">{creator.instagramBio || creator.bio || "Instagram creator"}</p>
                <div className="mt-4 flex items-center justify-between text-xs"><span className="text-zinc-500">Followers</span><strong className="text-zinc-200">{Number(creator.followersCount || 0).toLocaleString("en-IN")}</strong></div>
                {creator.insights?.reach != null && <div className="mt-1 flex items-center justify-between text-xs"><span className="text-zinc-500">Recent reach</span><strong className="text-zinc-200">{Number(creator.insights.reach).toLocaleString("en-IN")}</strong></div>}
              </Link>)}
            </div>
          ) : !searchError ? <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-400">No discoverable creators match “{search.trim()}”.</div> : null}
        </section>
      )}

      {selectedCampaign && <p className="mb-4 text-xs text-indigo-300">Creator matches are ranked by creator-listed niche and rates, campaign brief keywords, and Instagram presence. Use filters to narrow your shortlist; review each profile before inviting.</p>}

      {/* Grid */}
      {loading ? (
        <PageLoading label="Loading creators" />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(({ creator: cr, score }, index) => (
            <div key={cr.userId} className="relative">{selectedCampaign && index < 3 && score > 0 && <span className="absolute -top-2 right-3 z-10 rounded-full bg-indigo-500 px-2.5 py-1 text-[10px] font-bold text-white">Campaign fit</span>}<CreatorCard creator={cr} /></div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center text-zinc-400">
          No creators found matching this niche.
        </div>
      )}
    </div>
  );
}

export default function CreatorsPage() {
  return <RequireAuth><CreatorsPageContent /></RequireAuth>;
}
