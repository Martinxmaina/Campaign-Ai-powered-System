"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Shield, AlertTriangle, Clock, Zap, Loader2, Send, Bot,
  RefreshCw, ChevronDown, ChevronUp, Activity, Users, TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getWarRoomAlerts } from "@/lib/supabase/queries";
import { useWarRoomAlerts } from "@/lib/supabase/realtime";
import type { WarRoomAlert } from "@/lib/supabase/queries";
import { AI_MODELS, DEFAULT_MODEL, type AiModelId } from "@/lib/ai/claude";
import { authFetch } from "@/utils/supabase/auth-fetch";

const ThreatAnalysis = dynamic(() => import("@/components/war-room/ThreatAnalysis"), { ssr: false });
const CACHE_TTL_MS = 60 * 60 * 1000;
const ALERTS_CACHE_KEY = "war-room-alerts-cache";
const ANALYSIS_CACHE_KEY = "war-room-analysis-cache";

interface CachedPayload<T> {
  data: T;
  savedAt: string;
}

interface AnalysisResult {
  analysis: string;
  sentiment_pulse: { positive: number; negative: number; neutral: number; total: number };
  active_alerts: number;
  critical_threats: number;
  posts_analyzed_24h: number;
  generated_at: string;
}

interface ChatMsg { role: "user" | "assistant"; content: string; model?: string }

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-600" },
  high:     { bg: "bg-amber-50", text: "text-amber-600" },
  medium:   { bg: "bg-blue-50", text: "text-blue-600" },
  info:     { bg: "bg-slate-50", text: "text-slate-600" },
};

const PULSE_COLORS = { positive: "#22c55e", negative: "#ef4444", neutral: "#94a3b8" };

function readCache<T>(key: string): CachedPayload<T> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedPayload<T>;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;

  try {
    const payload: CachedPayload<T> = {
      data,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage errors and keep page functional.
  }
}

function isCacheFresh(savedAt: string) {
  return Date.now() - new Date(savedAt).getTime() < CACHE_TTL_MS;
}

export default function WarRoomPage() {
  const [initialAlerts, setInitialAlerts] = useState<WarRoomAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModelId>(DEFAULT_MODEL as AiModelId);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const alerts = useWarRoomAlerts(initialAlerts);

  const fetchAlerts = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache<WarRoomAlert[]>(ALERTS_CACHE_KEY);
      if (cached && isCacheFresh(cached.savedAt)) {
        setInitialAlerts(cached.data);
        setLoadingAlerts(false);
        return;
      }
    }

    setLoadingAlerts(true);
    try {
      const data = await getWarRoomAlerts(50);
      setInitialAlerts(data);
      writeCache(ALERTS_CACHE_KEY, data);
    } catch (err) {
      console.error("Failed to load war room alerts:", err);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  const fetchAnalysis = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache<AnalysisResult>(ANALYSIS_CACHE_KEY);
      if (cached && isCacheFresh(cached.savedAt)) {
        setAnalysisResult(cached.data);
        setAnalysisError("");
        setAnalysisLoading(false);
        return;
      }
    }

    setAnalysisLoading(true);
    setAnalysisError("");
    try {
      const res = await authFetch("/api/war-room/analysis");
      const data = await res.json();
      if (data.error) setAnalysisError(data.error);
      else {
        setAnalysisResult(data);
        writeCache(ANALYSIS_CACHE_KEY, data);
      }
    } catch (e) {
      setAnalysisError(String(e));
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
    fetchAlerts();
  }, [fetchAlerts, fetchAnalysis]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchAlerts(true);
      fetchAnalysis(true);
    }, CACHE_TTL_MS);

    return () => window.clearInterval(interval);
  }, [fetchAlerts, fetchAnalysis]);

  useEffect(() => {
    if (!alerts.length) return;
    writeCache(ALERTS_CACHE_KEY, alerts);
  }, [alerts]);

  async function sendChat() {
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", content: q };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    const allMsgs = [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    let reply = "";

    try {
      const res = await authFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMsgs, model: selectedModel }),
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setChatMessages((prev) => [...prev, { role: "assistant", content: "", model: selectedModel }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.type === "content") {
              reply += ev.text;
              setChatMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: reply, model: selectedModel };
                return updated;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: `Error: ${String(err)}` }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && a.status === "active");

  const pulseData = analysisResult
    ? [
        { label: "Positive", count: analysisResult.sentiment_pulse.positive, color: PULSE_COLORS.positive },
        { label: "Neutral",  count: analysisResult.sentiment_pulse.neutral,  color: PULSE_COLORS.neutral },
        { label: "Negative", count: analysisResult.sentiment_pulse.negative, color: PULSE_COLORS.negative },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:space-y-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-50 rounded-lg"><Shield className="h-4 w-4 text-red-600" /></div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">War Room</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time threat monitoring — Ol Kalou
              {analysisResult && (
                <span className="ml-2 text-xs text-slate-400">
                  · Last updated {timeAgo(analysisResult.generated_at)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Live
          </div>
          <button
            onClick={() => {
              fetchAlerts(true);
              fetchAnalysis(true);
            }}
            disabled={analysisLoading || loadingAlerts}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${analysisLoading || loadingAlerts ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {[
          { label: "Active Alerts", value: loadingAlerts ? null : activeAlerts.length, icon: Zap, bg: "bg-red-50", color: "text-red-600" },
          { label: "Critical Threats", value: loadingAlerts ? null : criticalAlerts.length, icon: AlertTriangle, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Posts Analyzed (24h)", value: analysisLoading ? null : (analysisResult?.posts_analyzed_24h ?? "—"), icon: Activity, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Monitoring", value: loadingAlerts ? null : alerts.length, icon: Users, bg: "bg-violet-50", color: "text-violet-600" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">{card.label}</span>
                <div className={`p-1.5 ${card.bg} ${card.color} rounded-lg`}><Icon className="h-3.5 w-3.5" /></div>
              </div>
              {card.value === null ? (
                <div className="h-8 w-12 bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <p className={`text-xl font-bold md:text-2xl ${card.color}`}>{card.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Threat Assessment — auto-loaded, no prompting */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 md:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <Shield className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-semibold text-slate-900">AI Threat Assessment</h3>
            {!analysisLoading && analysisResult && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Auto-updated</span>
            )}
          </div>
          {analysisLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>
        <div className="p-4 md:p-6">
          {analysisLoading && !analysisResult && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl" />
              ))}
            </div>
          )}
          {analysisError && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg p-4">
              {analysisError}
              <button onClick={() => fetchAnalysis(true)} className="ml-2 underline text-red-700">Retry</button>
            </div>
          )}
          {analysisResult && !analysisLoading && (
            <ThreatAnalysis markdown={analysisResult.analysis} />
          )}
        </div>
      </div>

      {/* Sentiment Pulse Chart */}
      {pulseData.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-900">Sentiment Pulse — Last 24h</h3>
          </div>
          <div className="h-36 sm:h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pulseData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {pulseData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Live Alerts Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 md:px-6 md:py-4">
          <Zap className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">Live Alerts</h3>
          <span className="text-xs text-slate-400 ml-auto">{alerts.length} total</span>
        </div>

        {loadingAlerts && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}
        {!loadingAlerts && alerts.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">
            No alerts yet. Alerts appear when thresholds are crossed.
          </div>
        )}
        <div className="divide-y divide-slate-50">
          {alerts.map((alert) => {
            const sv = SEVERITY_STYLES[alert.severity ?? "info"] ?? SEVERITY_STYLES.info;
            return (
              <div key={alert.id} className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-slate-50/50 md:gap-4 md:px-6">
                <div className={`shrink-0 rounded-lg p-2 ${sv.bg} ${sv.text}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${sv.bg} ${sv.text}`}>
                      {alert.severity}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      alert.status === "active" ? "bg-red-50 text-red-600" :
                      alert.status === "responding" ? "bg-amber-50 text-amber-600" :
                      "bg-emerald-50 text-emerald-600"
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{alert.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{timeAgo(alert.created_at ?? "")}
                    </span>
                    {alert.source && <span>Source: {alert.source}</span>}
                    {alert.region && <span>Region: {alert.region}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Chat — collapsible */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setChatOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/50 md:px-6 md:py-4"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Bot className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">Ask AI about threats</span>
            <span className="hidden text-xs text-slate-400 sm:inline">(click to expand)</span>
          </div>
          {chatOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {chatOpen && (
          <>
            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 px-4 pb-1 pt-3">
              {AI_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id as AiModelId)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-colors ${
                    selectedModel === m.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {m.short}
                </button>
              ))}
            </div>

            <div className="h-64 space-y-3 overflow-y-auto p-4 md:h-56">
              {chatMessages.length === 0 && (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  Ask about threats, counter-narratives, or opposition strategy…
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={`${msg.role}-${msg.model ?? "default"}-${i}`} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}>
                    {msg.role === "assistant" && msg.model && (
                      <p className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                        {AI_MODELS.find((m) => m.id === msg.model)?.short ?? msg.model}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content || (chatLoading ? "…" : "")}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-slate-100 px-4 pb-4 pt-2">
              <form onSubmit={(e) => { e.preventDefault(); sendChat(); }} className="flex items-end gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about threats, counter-narratives, opposition moves…"
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="rounded-lg bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
