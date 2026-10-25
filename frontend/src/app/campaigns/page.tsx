"use client";

import React, { useState, useEffect } from "react";
import { CampaignCard } from "@/components/features/CampaignCard";
import { Campaign } from "@/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlusCircle, Search, Sparkles } from "lucide-react";

const CATEGORIES = ["All", "Tech & SaaS", "Fitness & Wellness", "Fintech & Crypto", "Beauty & Skincare", "Gaming & Esports", "Food & Beverage"];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [applyingCampaign, setApplyingCampaign] = useState<Campaign | null>(null);

  // Apply Form State
  const [pitch, setPitch] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Create Campaign State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Tech & SaaS");
  const [newPlatform, setNewPlatform] = useState("Instagram");
  const [newBudget, setNewBudget] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory]);

  async function fetchCampaigns() {
    setLoading(true);
    try {
      const catParam = selectedCategory === "All" ? undefined : selectedCategory;
      const res = await api.getCampaigns({ category: catParam });
      if (res?.content) {
        setCampaigns(res.content);
      }
    } catch (e) {
      console.error("Error fetching campaigns", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!applyingCampaign) return;
    setSubmitting(true);
    setFeedbackMsg("");
    try {
      await api.applyToCampaign({
        campaignId: applyingCampaign.id,
        pitch,
        proposedRateInr: parseFloat(proposedRate),
      });
      setFeedbackMsg("Application submitted successfully!");
      setTimeout(() => {
        setApplyingCampaign(null);
        setPitch("");
        setProposedRate("");
        setFeedbackMsg("");
      }, 1500);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setFeedbackMsg("");
    try {
      await api.createCampaign({
        title: newTitle,
        description: newDesc,
        category: newCategory,
        platform: newPlatform,
        budgetInr: parseFloat(newBudget),
      });
      setFeedbackMsg("Campaign published successfully!");
      setTimeout(() => {
        setShowCreateModal(false);
        fetchCampaigns();
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Failed to create campaign. Ensure you have BRAND role.");
    } finally {
      setCreating(false);
    }
  }

  const filtered = campaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Brand Campaigns</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse targeted brand briefs and submit your proposals.
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
          <PlusCircle className="h-4 w-4" />
          Post New Campaign
        </Button>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by keyword, product, or brief..."
            className="pl-9 bg-zinc-900 border-zinc-800"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 text-sm">Loading campaigns...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => (
            <CampaignCard key={c.id} campaign={c} onApply={(camp) => setApplyingCampaign(camp)} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center text-zinc-400">
          No campaigns found matching your criteria.
        </div>
      )}

      {/* Apply Modal */}
      {applyingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-1">Apply to {applyingCampaign.title}</h3>
            <p className="text-xs text-zinc-400 mb-4">Submit your proposal directly to the brand.</p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Your Pitch / Strategy</label>
                <textarea
                  required
                  rows={4}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="Outline your creative concept, audience demographics, and why you're a great fit..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Proposed Fee (INR)</label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder="e.g. 15000"
                />
              </div>

              {feedbackMsg && (
                <div className={`p-3 rounded-lg text-xs ${feedbackMsg.includes("success") ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {feedbackMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setApplyingCampaign(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500">
                  {submitting ? "Submitting..." : "Submit Proposal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-1">Create Campaign Brief</h3>
            <p className="text-xs text-zinc-400 mb-4">Post an opportunity for niche creators.</p>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Campaign Title</label>
                <Input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Instagram Reels Launch for Productivity App"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Description & Requirements</label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain deliverables, campaign goals, target audience..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Budget (INR)</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="e.g. 25000"
                  />
                </div>
              </div>

              {feedbackMsg && (
                <div className={`p-3 rounded-lg text-xs ${feedbackMsg.includes("success") ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {feedbackMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="bg-indigo-600 hover:bg-indigo-500">
                  {creating ? "Publishing..." : "Publish Campaign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
