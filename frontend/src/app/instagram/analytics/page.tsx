"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/Button";
import { PageLoading } from "@/components/ui/PageLoading";

type Analytics = {
  connected?: boolean;
  username?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  last_synced_at?: string;
  sync_status?: string;
  last_sync_error?: string;
  latest?: { capturedAt?: string; metrics?: Record<string, unknown> };
  history?: Array<{ capturedAt: string; metrics: Record<string, unknown> }>;
  media?: Array<{ mediaId: string; mediaType?: string; permalink?: string; thumbnailUrl?: string; publishedAt?: string; metrics?: Record<string, unknown> }>;
};

function formatNumber(value: unknown) {
  return typeof value === "number" ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value) : "—";
}

function Trend({ rows, metric }: { rows: Analytics["history"]; metric: string }) {
  const values = (rows || []).map((row) => row.metrics?.[metric]).filter((value): value is number => typeof value === "number");
  if (values.length < 2) return <p className="mt-2 text-xs text-zinc-500">Trend appears as daily sync history builds.</p>;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${36 - (value / max) * 32}`).join(" ");
  return <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`${metric.replaceAll("_", " ")} history`} className="mt-3 h-20 w-full overflow-visible"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="text-indigo-400" /></svg>;
}

function InstagramAnalyticsContent() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      setData(await api.getInstagramAnalytics());
    } catch (err: any) {
      setError(err.message || "Instagram analytics could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function sync() {
    setSyncing(true);
    setError("");
    try {
      await api.syncInstagram();
      await load();
    } catch (err: any) {
      setError(err.message || "Instagram sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  const metrics = data?.latest?.metrics || {};
  const history = data?.history || [];
  const firstFollowers = history[0]?.metrics?.follower_count;
  const followerGrowth = typeof data?.followers_count === "number" && typeof firstFollowers === "number"
    ? data.followers_count - firstFollowers
    : null;

  if (loading) return <PageLoading label="Loading Instagram analytics" layout="rows" />;
  if (error && !data) return <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">{error}</div>;
  if (!data?.connected) {
    return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
      <h2 className="text-lg font-bold text-white">Connect Instagram to see analytics</h2>
      <p className="mt-2 text-sm text-zinc-400">Connect a professional creator account from your profile to begin syncing authorized metrics.</p>
      <Link href="/profile" className="mt-5 inline-flex text-sm font-semibold text-indigo-400 hover:text-indigo-300">Go to profile →</Link>
    </div>;
  }

  const cards = [
    ["Followers", formatNumber(data.followers_count), followerGrowth === null ? "Historical growth builds after daily syncs" : `${followerGrowth >= 0 ? "+" : ""}${formatNumber(followerGrowth)} since first saved snapshot`],
    ["Reach", formatNumber(metrics.reach), "Authorized account insight"],
    ["Views", formatNumber(metrics.views), "Instagram API view metric"],
    ["Interactions", formatNumber(metrics.total_interactions), "Likes, comments, shares and other available interactions"],
    ["Accounts engaged", formatNumber(metrics.accounts_engaged), "Unique engaged accounts when available"],
    ["Engagement rate", typeof metrics.engagement_rate === "number" ? `${metrics.engagement_rate}%` : "—", "Interactions divided by current followers"],
  ];
  const audience = metrics.follower_demographics ?? metrics.engaged_audience_demographics ?? metrics.reached_audience_demographics;
  const hasAudience = Array.isArray(audience) || (typeof audience === "object" && audience !== null);

  return (
    <div className="space-y-6 motion-fade-up">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {data.profile_picture_url && <img src={data.profile_picture_url} alt="Instagram profile" className="h-12 w-12 rounded-full object-cover" />}
          <div><h2 className="font-bold text-white">@{data.username}</h2><p className="text-xs text-zinc-400">{data.sync_status} · Last synced {data.last_synced_at ? new Date(data.last_synced_at).toLocaleString() : "not yet"}</p></div>
        </div>
        <Button onClick={sync} disabled={syncing} variant="outline" size="sm">
          {syncing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh metrics
        </Button>
      </section>
      {error && <p role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">{error}</p>}
      {data.last_sync_error && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">{data.last_sync_error}</p>}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" aria-label="Instagram metrics">
        {cards.map(([label, value, hint]) => (
          <article key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{hint}</p>
            {(label === "Followers" || label === "Reach") && <Trend rows={history} metric={label === "Followers" ? "follower_count" : "reach"} />}
          </article>
        ))}
      </section>

      {hasAudience && <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="font-bold text-white">Audience insights</h2>
        <p className="mt-1 text-xs text-zinc-400">Shown only when Instagram provides the authorized demographic data.</p>
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs text-zinc-300">{JSON.stringify(audience, null, 2)}</pre>
      </section>}

      <section className="space-y-3">
        <div><h2 className="text-lg font-bold text-white">Recent posts and Reels</h2><p className="text-xs text-zinc-400">Latest six items and metrics that Instagram makes available.</p></div>
        {data.media?.length ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.media.map((item) => <article key={item.mediaId} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="Instagram post thumbnail" loading="lazy" className="aspect-video w-full object-cover bg-zinc-800" />}
            <div className="p-4"><p className="text-xs uppercase tracking-wide text-zinc-500">{item.mediaType || "Post"} · {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Date unavailable"}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                <span>Likes: {formatNumber(item.metrics?.likes)}</span><span>Comments: {formatNumber(item.metrics?.comments)}</span>
                <span>Reach: {formatNumber(item.metrics?.reach)}</span><span>Views: {formatNumber(item.metrics?.views)}</span>
              </div>
              {item.permalink && <a href={item.permalink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-indigo-400 hover:text-indigo-300">Open on Instagram →</a>}
            </div>
          </article>)}
        </div> : <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">No recent media metrics are available yet.</div>}
      </section>
    </div>
  );
}

export default function InstagramAnalyticsPage() {
  return <RequireAuth><main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <div><Link href="/profile" className="text-xs text-indigo-400 hover:text-indigo-300">← Profile settings</Link><h1 className="mt-3 text-3xl font-extrabold text-white">Instagram analytics</h1><p className="mt-1 text-sm text-zinc-400">Authorized insights, recent post performance, and sync history.</p></div>
    <InstagramAnalyticsContent />
  </main></RequireAuth>;
}
