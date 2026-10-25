"use client";

import React, { useState, useEffect } from "react";
import { Application } from "@/types";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      try {
        const list = await api.getMyApplications();
        if (Array.isArray(list)) {
          setApplications(list);
        }
      } catch (e) {
        console.error("Failed to load applications", e);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge variant="success">Accepted</Badge>;
      case "DECLINED":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Campaign Applications</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Track the status of all submitted briefs and brand responses.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-zinc-500 text-sm">Loading applications...</div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">{app.campaignTitle}</h3>
                  {getStatusBadge(app.status)}
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 max-w-2xl">{app.pitch}</p>
                <span className="text-xs text-zinc-500 block">Submitted on {new Date(app.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-500 block">Proposed Rate</span>
                <span className="text-base font-bold text-emerald-400">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(app.proposedRateInr || app.proposedRate || 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center text-zinc-400">
          <p className="text-sm">You haven't submitted any campaign applications yet.</p>
          <a href="/campaigns" className="mt-4 inline-block">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500">
              Browse Opportunities
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
