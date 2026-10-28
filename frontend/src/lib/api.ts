import { supabase } from "./supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token: string | undefined;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch {
    // Continue without session if supabase is uninitialized
  }

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `API request failed with status ${res.status}`);
  }

  return json.data;
}

export const api = {
  // Users & Auth
  getMe: () => fetchWithAuth<any>("/users/me"),
  syncUser: (data: any) => fetchWithAuth<any>("/users/sync", { method: "POST", body: JSON.stringify(data) }),

  // Creators
  getCreators: (params?: { niche?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.niche && params.niche !== "All") query.set("niche", params.niche);
    if (params?.page !== undefined) query.set("page", params.page.toString());
    if (params?.size !== undefined) query.set("size", params.size.toString());
    const qStr = query.toString();
    return fetchWithAuth<any>(`/creators${qStr ? `?${qStr}` : ""}`);
  },
  getCreator: (id: string) => fetchWithAuth<any>(`/creators/${id}`),
  updateCreatorProfile: (data: any) => fetchWithAuth<any>("/creators/profile", { method: "PUT", body: JSON.stringify(data) }),

  // Campaigns
  getCampaigns: (params?: { category?: string; platform?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "All") query.set("category", params.category);
    if (params?.platform && params.platform !== "All") query.set("platform", params.platform);
    if (params?.page !== undefined) query.set("page", params.page.toString());
    if (params?.size !== undefined) query.set("size", params.size.toString());
    const qStr = query.toString();
    return fetchWithAuth<any>(`/campaigns${qStr ? `?${qStr}` : ""}`);
  },
  getCampaign: (id: string) => fetchWithAuth<any>(`/campaigns/${id}`),
  getMyCampaigns: () => fetchWithAuth<any[]>("/campaigns/my"),
  createCampaign: (data: any) => fetchWithAuth<any>("/campaigns", { method: "POST", body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: any) => fetchWithAuth<any>(`/campaigns/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCampaign: (id: string) => fetchWithAuth<any>(`/campaigns/${id}`, { method: "DELETE" }),

  // Applications
  applyToCampaign: (data: any) => fetchWithAuth<any>("/applications", { method: "POST", body: JSON.stringify(data) }),
  getMyApplications: () => fetchWithAuth<any[]>("/applications/my"),
  getCampaignApplications: (campaignId: string) => fetchWithAuth<any[]>(`/applications/campaign/${campaignId}`),
  updateApplicationStatus: (id: string, status: string) =>
    fetchWithAuth<any>(`/applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Messaging
  getConversations: () => fetchWithAuth<any[]>("/conversations"),
  getMessages: (conversationId: string) => fetchWithAuth<any[]>(`/conversations/${conversationId}/messages`),
  sendMessage: (data: any) => fetchWithAuth<any>("/conversations/messages", { method: "POST", body: JSON.stringify(data) }),

  // Safety
  validateSafety: (text: string) => fetchWithAuth<any>("/safety/validate", { method: "POST", body: JSON.stringify({ text }) }),

  // Payments
  createVerificationOrder: () => fetchWithAuth<any>("/payments/verification/order", { method: "POST" }),
  verifyPayment: (data: any) => fetchWithAuth<any>("/payments/verification/verify", { method: "POST", body: JSON.stringify(data) }),
};
