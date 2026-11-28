"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { PageLoading } from "@/components/ui/PageLoading";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

type Creator = {
  creatorId: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  niche?: string;
  instagramUsername?: string;
  instagramName?: string;
  profilePictureUrl?: string;
  instagramBio?: string;
  followersCount?: number;
  mediaCount?: number;
  engagementRate?: number;
  insights?: Record<string, unknown> | null;
  discoverable?: boolean;
  shareInsights?: boolean;
  instagramHandle?: string;
  rateReelInr?: number;
};

type Campaign = { id: string; title: string; category?: string; budgetInr?: number; platform?: string };

function CreatorProfileContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerRole, setViewerRole] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [rate, setRate] = useState("");
  const [brief, setBrief] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const profile = await api.getCreator(id);
        if (!active) return;
        const base: Creator = {
          creatorId: profile.userId,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          niche: profile.niche,
          followersCount: profile.followersCount,
          engagementRate: profile.engagementRate,
          instagramHandle: profile.instagramHandle,
          rateReelInr: profile.rateReelInr,
        };
        const me = await api.getMe();
        if (!active) return;
        setViewerRole(String(me.role || "").toUpperCase());

        if (preview) {
          if (me.id !== id || String(me.role).toUpperCase() !== "CREATOR") throw new Error("Only the creator can preview this private profile.");
          const account = await api.getInstagramAccount();
          if (account.connected) {
            Object.assign(base, {
              instagramUsername: account.username,
              instagramName: account.name,
              profilePictureUrl: account.profile_picture_url,
              instagramBio: account.biography,
              followersCount: account.followers_count,
              mediaCount: account.media_count,
              discoverable: account.discoverable,
              shareInsights: account.share_insights,
            });
            if (account.share_insights) {
              const analytics = await api.getInstagramAnalytics();
              base.insights = analytics.latest?.metrics || null;
            }
          }
        } else {
          try {
            const instagram = await api.getPublicInstagramCreator(id);
            Object.assign(base, instagram);
          } catch {
            // The Hyperniche creator profile remains available when Instagram is private or unconnected.
          }
        }
        if (active) setCreator(base);
      } catch (err: any) {
        if (active) setError(err.message || "This creator profile is unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id, preview]);

  async function openInvite() {
    setInviteError("");
    try {
      const ownCampaigns = await api.getMyCampaigns();
      setCampaigns(ownCampaigns || []);
      setCampaignId(ownCampaigns?.[0]?.id || "");
      setShowInvite(true);
    } catch (err: any) {
      setInviteError(err.message || "Could not load your campaigns.");
    }
  }

  async function sendInvite(event: FormEvent) {
    event.preventDefault();
    if (!creator) return;
    const amount = Number(rate);
    if (!Number.isFinite(amount) || amount <= 0 || !brief.trim()) {
      setInviteError("Enter a valid offer and collaboration brief.");
      return;
    }
    setSending(true);
    setInviteError("");
    try {
      await api.sendMessage({
        recipientId: creator.creatorId,
        campaignId: campaignId || null,
        messageText: `[Collab Invitation: ₹${amount.toLocaleString("en-IN")}] ${brief.trim()}`,
      });
      setShowInvite(false);
      setInviteSent(true);
    } catch (err: any) {
      setInviteError(err.message || "Invitation could not be sent.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <PageLoading label="Loading creator profile" />;
  if (error || !creator) return <div role="alert" className="rounded-xl border border-zinc-800 p-8 text-center text-sm text-zinc-400">{error || "Creator not found."}</div>;

  const instagramUsername = creator.instagramUsername || creator.instagramHandle?.replace(/^@/, "");
  const metrics = creator.insights || {};

  return <main className="mx-auto max-w-4xl px-4 py-10 motion-fade-up">
    <Link href="/creators" className="text-sm text-indigo-400 hover:text-indigo-300">← Creator discovery</Link>
    {preview && <p className={`mt-4 rounded-xl border p-3 text-sm ${creator.discoverable ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-amber-500/30 bg-amber-500/10 text-amber-200"}`}>
      {creator.discoverable ? "Preview: your profile is visible in creator discovery." : "Private preview: brands cannot find this profile until you enable discovery in Profile settings."}
    </p>}
    <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {(creator.profilePictureUrl || creator.avatarUrl) && <img src={creator.profilePictureUrl || creator.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold text-white">{creator.displayName || creator.instagramName || (instagramUsername ? `@${instagramUsername}` : "Creator")}</h1>
          {instagramUsername ? <a href={`https://instagram.com/${encodeURIComponent(instagramUsername)}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300">@{instagramUsername} ↗</a> : <p className="text-sm text-zinc-400">{creator.niche || "Hyperniche creator"}</p>}
          <p className="mt-2 text-sm text-zinc-400">{creator.instagramBio || creator.bio || "Creator profile"}</p>
        </div>
        {viewerRole === "BRAND" && <Button onClick={() => void openInvite()} className="shrink-0">Invite to campaign</Button>}
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-zinc-800 p-4"><p className="text-xs text-zinc-500">Followers</p><p className="mt-1 text-xl font-bold text-white">{Number(creator.followersCount || 0).toLocaleString("en-IN")}</p></article>
        {creator.mediaCount !== undefined && <article className="rounded-xl border border-zinc-800 p-4"><p className="text-xs text-zinc-500">Posts and Reels</p><p className="mt-1 text-xl font-bold text-white">{Number(creator.mediaCount).toLocaleString("en-IN")}</p></article>}
        {creator.engagementRate !== undefined && <article className="rounded-xl border border-zinc-800 p-4"><p className="text-xs text-zinc-500">Engagement</p><p className="mt-1 text-xl font-bold text-white">{creator.engagementRate}%</p></article>}
      </div>
      {creator.shareInsights && Object.keys(metrics).length > 0 && <section className="mt-6 border-t border-zinc-800 pt-5">
        <h2 className="font-bold text-white">Shared Instagram insights</h2>
        <p className="mt-1 text-xs text-zinc-500">The creator chose to share these authorized summary metrics.</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(metrics).filter(([, value]) => typeof value === "number").map(([key, value]) => <div key={key} className="rounded-xl border border-zinc-800 p-4"><dt className="text-xs capitalize text-zinc-500">{key.replaceAll("_", " ")}</dt><dd className="mt-1 font-semibold text-white">{Number(value).toLocaleString("en-IN")}</dd></div>)}
        </dl>
      </section>}
    </section>
    {inviteError && !showInvite && <p role="alert" className="mt-4 text-sm text-red-300">{inviteError}</p>}
    {inviteSent && <p role="status" className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">Invitation sent. <Link href="/messages" className="font-semibold underline">Open Messages</Link></p>}
    {showInvite && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="invite-title" className="w-full max-w-lg space-y-4 rounded-2xl border border-zinc-700 bg-zinc-950 p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 id="invite-title" className="text-lg font-bold text-white">Invite {creator.displayName || "creator"}</h2><p className="text-xs text-zinc-400">Choose one of your campaigns and include a clear offer.</p></div><button type="button" onClick={() => setShowInvite(false)} className="text-zinc-400 hover:text-white" aria-label="Close">✕</button></div>
        <form onSubmit={sendInvite} className="space-y-4">
          <label className="block text-sm text-zinc-300">Campaign
            <select value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"><option value="">Direct collaboration</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title} {campaign.budgetInr ? `(₹${Number(campaign.budgetInr).toLocaleString("en-IN")})` : ""}</option>)}</select>
          </label>
          <label className="block text-sm text-zinc-300">Proposed compensation (₹ INR)
            <input required type="number" min="1" step="1" value={rate} onChange={(event) => setRate(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white" />
          </label>
          <label className="block text-sm text-zinc-300">Brief and deliverables
            <textarea required rows={4} value={brief} onChange={(event) => setBrief(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white" placeholder="Describe the deliverables, timeline, and product." />
          </label>
          {inviteError && <p role="alert" className="text-sm text-red-300">{inviteError}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button><Button type="submit" disabled={sending}>{sending ? "Sending…" : "Send invitation"}</Button></div>
        </form>
      </section>
    </div>}
  </main>;
}

export default function CreatorProfilePage() {
  return <RequireAuth><CreatorProfileContent /></RequireAuth>;
}
