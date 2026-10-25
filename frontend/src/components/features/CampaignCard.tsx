import React from "react";
import { Campaign } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, Users } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  onApply?: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onApply }: CampaignCardProps) {
  const formattedBudget = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(campaign.budgetInr || campaign.budget || 0);

  return (
    <Card className="flex flex-col justify-between hover:border-zinc-700 transition-all">
      <div>
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">{campaign.category}</Badge>
              <Badge variant="secondary">{campaign.platform}</Badge>
            </div>
            <CardTitle className="text-xl font-bold">{campaign.title}</CardTitle>
            <p className="text-xs text-zinc-400 mt-1">by {campaign.brandName || "Brand Partner"}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-500 uppercase tracking-wider block">Budget</span>
            <span className="text-lg font-bold text-emerald-400">{formattedBudget}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed">
            {campaign.description}
          </p>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-zinc-500" />
              <span>{campaign.applicationsCount || 0} applied</span>
            </div>
            {campaign.deadline && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span>Deadline: {campaign.deadline}</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-6 pt-0">
        <Button
          onClick={() => onApply?.(campaign)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 mt-4"
        >
          Apply to Brief
        </Button>
      </div>
    </Card>
  );
}
