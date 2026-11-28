"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Instagram, LoaderCircle, RefreshCw, Unlink } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type Account = {
  connected: boolean;
  username?: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  biography?: string;
  followers_count?: number;
  discoverable?: boolean;
  share_insights?: boolean;
  last_synced_at?: string;
  sync_status?: string;
  last_sync_error?: string;
};

export function InstagramConnectCard({ creatorId }: { creatorId: string }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAccount() {
    try {
      setAccount(await api.getInstagramAccount());
    } catch (err: any) {
      setError(err.message || "Could not load Instagram connection.");
    }
  }

  useEffect(() => {
    void loadAccount();
    const status = new URLSearchParams(window.location.search).get("instagram");
    if (status === "connected") setMessage("Instagram connected. Your profile and insights are syncing.");
    if (status === "cancelled") setMessage("Instagram connection was cancelled.");
    if (status === "error") setError("Instagram could not be connected. Please try again.");
  }, []);

  async function connect() {
    setError("");
    setBusy(true);
    try {
      const { authorizationUrl } = await api.connectInstagram();
      window.location.assign(authorizationUrl);
    } catch (err: any) {
      setError(err.message || "Instagram connection could not be started.");
      setBusy(false);
    }
  }

  async function sync() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.syncInstagram();
      await loadAccount();
      setMessage("Instagram data refreshed.");
    } catch (err: any) {
      setError(err.message || "Instagram sync failed.");
    } finally {
      setBusy(false);
    }
  }

  async function updateSharing(discoverable: boolean, shareInsights: boolean) {
    const previous = account;
    setAccount((current) => current ? { ...current, discoverable, share_insights: shareInsights } : current);
    try {
      await api.updateInstagramVisibility({ discoverable, shareInsights });
    } catch (err: any) {
      setAccount(previous);
      setError(err.message || "Sharing settings could not be updated.");
    }
  }

  async function disconnect() {
    if (!window.confirm("Disconnect Instagram and delete the synced Instagram data from Hyperniche?")) return;
    setBusy(true);
    try {
      await api.disconnectInstagram();
      setAccount({ connected: false });
      setMessage("Instagram disconnected and synced data removed.");
    } catch (err: any) {
      setError(err.message || "Instagram could not be disconnected.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 space-y-5 motion-fade-up" aria-labelledby="instagram-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {account?.profile_picture_url ? (
            <img src={account.profile_picture_url} alt="Instagram profile" className="h-12 w-12 rounded-full object-cover border border-zinc-700" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-pink-400"><Instagram className="h-5 w-5" /></div>
          )}
          <div>
            <h2 id="instagram-heading" className="font-bold text-white">Instagram account</h2>
            <p className="text-xs text-zinc-400">
              {account?.connected ? `@${account.username} · ${account.followers_count?.toLocaleString("en-IN") || 0} followers` : "Connect a professional Instagram account to sync authorized profile data."}
            </p>
          </div>
        </div>
        {account?.connected ? (
          <div className="flex gap-2">
            <Button onClick={sync} disabled={busy} variant="outline" size="sm">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync now
            </Button>
            <Button onClick={disconnect} disabled={busy} variant="ghost" size="sm" aria-label="Disconnect Instagram">
              <Unlink className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={connect} disabled={busy || !account} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
            Connect Instagram
          </Button>
        )}
      </div>

      {account?.connected && (
        <div className="space-y-3 border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-400">You control what other Hyperniche users can see.</p>
          <label className="flex items-start gap-3 text-sm text-zinc-200">
            <input type="checkbox" checked={Boolean(account.discoverable)} onChange={(e) => void updateSharing(e.target.checked, Boolean(account.share_insights))} className="mt-0.5 accent-indigo-500" />
            <span>Show my connected Instagram profile in creator search</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-zinc-200">
            <input type="checkbox" checked={Boolean(account.share_insights)} onChange={(e) => void updateSharing(Boolean(account.discoverable), e.target.checked)} className="mt-0.5 accent-indigo-500" />
            <span>Share authorized summary analytics on my public Hyperniche profile</span>
          </label>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
            <span>Status: {account.sync_status || "Connected"}</span>
            {account.last_synced_at && <span>Last sync: {new Date(account.last_synced_at).toLocaleString()}</span>}
            <Link href="/instagram/analytics" className="text-indigo-400 hover:text-indigo-300">Open analytics →</Link>
            <Link href={`/creators/${creatorId}?preview=1`} className="text-indigo-400 hover:text-indigo-300">Preview my profile →</Link>
          </div>
          {account.last_sync_error && <p className="text-xs text-amber-300">{account.last_sync_error}</p>}
        </div>
      )}
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">{message}</p>}
      {!account && !error && <div className="h-12 rounded-lg bg-zinc-800 animate-pulse" aria-label="Loading Instagram status" />}
    </section>
  );
}
