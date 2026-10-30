"use client";

import React, { useState, useEffect } from "react";
import { CreatorCard } from "@/components/features/CreatorCard";
import { CreatorProfile } from "@/types";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Search, Sparkles } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

const NICHES = ["All", "Tech", "SaaS", "Fitness", "Fintech", "Gaming", "Beauty", "Fashion", "AI Tools"];

function CreatorsPageContent() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, [selectedNiche]);

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

  const filtered = creators.filter(cr =>
    cr.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    cr.niche?.toLowerCase().includes(search.toLowerCase()) ||
    cr.bio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
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
            placeholder="Search creators by name, handle, or topic..."
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

      {/* Grid */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 text-sm">Loading creators directory...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(cr => (
            <CreatorCard key={cr.userId} creator={cr} />
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
