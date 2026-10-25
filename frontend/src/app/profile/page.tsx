"use client";

import React, { useState, useEffect } from "react";
import { User, CreatorProfile } from "@/types";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, ShieldCheck, Sparkles, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"CREATOR" | "BRAND">("CREATOR");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userRes = await api.getMe();
      if (userRes) {
        setCurrentUser(userRes);
        if (userRes.role === "CREATOR") {
          const cProfile = await api.getCreator(userRes.id);
          setCreatorProfile(cProfile);
        }
      }
    } catch (e) {
      console.log("Not authenticated yet");
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMsg("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await api.syncUser({
          id: data.user.id,
          email,
          role,
          displayName,
        });
        setAuthMsg("Account created! Logged in successfully.");
        await loadUser();
      }
    } catch (err: any) {
      setAuthMsg(err.message || "Failed to sign up");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMsg("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setAuthMsg("Logged in successfully!");
      await loadUser();
    } catch (err: any) {
      setAuthMsg(err.message || "Invalid credentials");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleVerification() {
    setVerifying(true);
    try {
      const order = await api.createVerificationOrder();
      // Simulate/trigger verification payment confirmation
      await api.verifyPayment({
        orderId: order.orderId,
        paymentId: "pay_test_" + Date.now(),
        signature: "test_sig",
      });
      alert("Verification successful! Your profile now has the blue verified badge.");
      await loadUser();
    } catch (e: any) {
      alert("Verification failed: " + e.message);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account & Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your identity, role permissions, and verification status.</p>
      </div>

      {currentUser ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  {currentUser.displayName}
                  {creatorProfile?.isVerified && (
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
                  )}
                </CardTitle>
                <p className="text-xs text-zinc-400 mt-1">{currentUser.email}</p>
              </div>
              <Badge variant="default" className="text-sm px-3 py-1">
                {currentUser.role}
              </Badge>
            </CardHeader>
            <CardContent>
              {currentUser.role === "CREATOR" && !creatorProfile?.isVerified && (
                <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <ShieldCheck className="h-4 w-4 text-indigo-400" />
                      Get Verified Creator Badge
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Stand out to top brands, unlock premium briefs, and boost proposal conversion. (₹499 one-time fee)
                    </p>
                  </div>
                  <Button
                    onClick={handleVerification}
                    disabled={verifying}
                    className="bg-indigo-600 hover:bg-indigo-500 text-xs shrink-0"
                  >
                    {verifying ? "Processing..." : "Verify Account (₹499)"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">Join Hyperniche</CardTitle>
            <p className="text-xs text-zinc-400 text-center mt-1">Sign in or create a brand/creator account</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name or Brand Name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "CREATOR" | "BRAND")}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CREATOR">Creator (Apply to Campaigns & Earn)</option>
                  <option value="BRAND">Brand (Post Campaigns & Hire Creators)</option>
                </select>
              </div>

              {authMsg && (
                <div className={`p-3 rounded-lg text-xs ${authMsg.includes("success") || authMsg.includes("created") ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {authMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={handleSignIn}
                  disabled={authLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Sign In
                </Button>
                <Button
                  type="button"
                  onClick={handleSignUp}
                  disabled={authLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500"
                >
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
