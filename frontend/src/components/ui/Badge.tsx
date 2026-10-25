import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    secondary: "border-transparent bg-zinc-800 text-zinc-300",
    destructive: "border-transparent bg-red-500/20 text-red-400 border border-red-500/30",
    outline: "text-zinc-300 border border-zinc-700",
    success: "border-transparent bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
