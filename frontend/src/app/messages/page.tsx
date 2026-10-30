"use client";

import React, { useState, useEffect } from "react";
import { Conversation, Message } from "@/types";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageSquare, Send, ShieldAlert, Sparkles } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";

function MessagesPageContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;
    fetchMessages(selectedConversation.id);

    // Subscribe to live Supabase Realtime broadcasts for this conversation
    const channel = supabase
      .channel(`chat_${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row || !row.id) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            const senderName =
              row.sender_id === selectedConversation.brandId
                ? selectedConversation.brandName
                : selectedConversation.creatorName;
            const newMsg: Message = {
              id: row.id,
              conversationId: row.conversation_id,
              senderId: row.sender_id,
              senderName: senderName || "User",
              messageText: row.message_text,
              createdAt: row.created_at || new Date().toISOString(),
              campaignId: selectedConversation.campaignId || "",
              businessId: selectedConversation.brandId,
              creatorId: selectedConversation.creatorId,
            };
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  async function fetchConversations() {
    setLoading(true);
    try {
      const list = await api.getConversations();
      if (Array.isArray(list)) {
        setConversations(list);
        if (list.length > 0 && !selectedConversation) {
          setSelectedConversation(list[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(convId: string) {
    try {
      const list = await api.getMessages(convId);
      if (Array.isArray(list)) {
        setMessages(list);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !selectedConversation) return;

    setErrorMsg("");
    setSending(true);

    try {
      // 1. Safety check
      const safety = await api.validateSafety(text);
      if (safety && !safety.allowed) {
        setErrorMsg(safety.reason);
        setSending(false);
        return;
      }

      // 2. Send message
      const newMsg = await api.sendMessage({
        conversationId: selectedConversation.id,
        messageText: text,
      });

      setMessages(prev => [...prev, newMsg]);
      setText("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Direct Deal Inbox</h1>
          <p className="text-xs text-zinc-400 mt-1">Communicate directly with brands and creators in a secure environment.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
          <ShieldAlert className="h-4 w-4" />
          Off-platform contact filtering active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px] rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
        {/* Conversations List */}
        <div className="border-r border-zinc-800 p-4 overflow-y-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Conversations</h2>
          {conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConversation(c)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                    selectedConversation?.id === c.id
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-zinc-800 text-zinc-300"
                  }`}
                >
                  <div className="font-semibold text-sm truncate">{c.brandName} & {c.creatorName}</div>
                  {c.campaignTitle && (
                    <div className="text-xs text-zinc-400 truncate mt-0.5 opacity-80">{c.campaignTitle}</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No conversations yet. Apply to campaigns to start chatting!
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-zinc-950/40">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {selectedConversation.brandName} & {selectedConversation.creatorName}
                  </h3>
                  {selectedConversation.campaignTitle && (
                    <p className="text-xs text-indigo-400">Re: {selectedConversation.campaignTitle}</p>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length > 0 ? (
                  messages.map(m => (
                    <div key={m.id} className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-400">{m.senderName || "User"}</span>
                        <span className="text-[10px] text-zinc-600">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-200 max-w-md">
                        {m.messageText}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-xs text-zinc-500">
                    No messages yet in this deal thread. Say hello!
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div className="p-4 border-t border-zinc-800">
                {errorMsg && (
                  <div className="mb-3 p-2.5 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message (phone numbers/emails will be filtered)..."
                    className="flex-1 bg-zinc-900 border-zinc-700"
                  />
                  <Button type="submit" disabled={sending} className="bg-indigo-600 hover:bg-indigo-500">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-500">
              Select a conversation to open chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return <RequireAuth><MessagesPageContent /></RequireAuth>;
}
