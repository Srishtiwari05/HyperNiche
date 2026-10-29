import React from "react";
import { CreatorProfile } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, TrendingUp, Users } from "lucide-react";

interface CreatorCardProps {
  creator: CreatorProfile;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const formattedFollowers = new Intl.NumberFormat("en-IN").format(creator.followersCount);
  const formattedRate = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(creator.rateReelInr || creator.ratePostInr || 0);

  return (
    <Card className="hover:border-zinc-700 transition-all flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center gap-4 pb-3">
          <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-lg text-indigo-400 overflow-hidden">
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt={creator.displayName} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            ) : (
              creator.displayName?.charAt(0) || "C"
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-bold">{creator.displayName}</CardTitle>
              {creator.isVerified && (
                <CheckCircle2 className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{creator.niche || "Content Creator"}</p>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {creator.bio && (
            <p className="text-xs text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
              {creator.bio}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/80 mb-3">
            <div>
              <span className="text-zinc-500 block">Followers</span>
              <div className="flex items-center gap-1 font-semibold text-zinc-200 mt-0.5">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
                {formattedFollowers}
              </div>
            </div>
            <div>
              <span className="text-zinc-500 block">Engagement</span>
              <div className="flex items-center gap-1 font-semibold text-emerald-400 mt-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                {creator.engagementRate || 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="p-6 pt-0 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs">
        <span className="text-zinc-400">Starting Reel Rate</span>
        <span className="font-bold text-zinc-100">{formattedRate}</span>
      </div>
    </Card>
  );
}
