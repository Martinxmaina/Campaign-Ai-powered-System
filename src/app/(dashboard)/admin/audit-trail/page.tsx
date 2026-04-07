"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
import { Filter, RefreshCw, Shield, ChevronDown, ChevronUp, Activity } from "lucide-react";
import { authFetch } from "@/utils/supabase/auth-fetch";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface AuditLog {
  id: string;
  created_at: string;
  user_email: string | null;
  role: string | null;
  action: string;
  module: string;
  record_id: string | null;
  details: Record<string, unknown> | null;
  result: string;
  ip_address?: string | null;
}

const MODULE_OPTIONS = ["candidates", "war-room", "finance", "field", "admin", "parties", "users", "surveys", "research"];
const ACTION_OPTIONS = ["create", "update", "delete", "export", "login", "logout", "view", "publish"];

const ACTION_COLORS: Record<string, string> = {
  create: "bg-[#EDF3EC] text-[#346538]",
  update: "bg-[#E1F3FE] text-[#1F6C9F]",
  delete: "bg-[#FDEBEC] text-[#9F2F2D]",
  export: "bg-[#F3EFFE] text-[#6B3FA0]",
  login:  "bg-[#F7F6F3] text-[#787774]",
  logout: "bg-[#F7F6F3] text-[#787774]",
  view:   "bg-[#FBF3DB] text-[#956400]",
  publish:"bg-[#EDF3EC] text-[#346538]",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-KE", { dateStyle: "short", timeStyle: "short" });
}

// Group logs by day for the activity chart
function buildActivityChart(logs: AuditLog[]) {
  const buckets: Record<string, number> = {};
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    buckets[d.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })] = 0;
  }
  for (const log of logs) {
    const d = new Date(log.created_at);
    if (now - d.getTime() > 7 * 86400000) continue;
    const key = d.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" });
    if (key in buckets) buckets[key]++;
  }
  return Object.entries(buckets).map(([day, count]) => ({ day, count }));
}

export default function AdminAuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const PAGE = 100;

  const load = useCallback(async (reset = false) => {
    const off = reset ? 0 : offset;
    if (reset) setOffset(0);
    setRefreshing(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE),
        offset: String(off),
      });
      if (moduleFilter) params.set("module", moduleFilter);
      if (actionFilter) params.set("action", actionFilter);
      if (userFilter)   params.set("user", userFilter);

      const res = await authFetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      if (reset || off === 0) {
        setLogs(data.logs ?? []);
      } else {
        setLogs((prev) => [...prev, ...(data.logs ?? [])]);
      }
      setTotal(data.total ?? 0);
    } catch {
      setLogs([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [moduleFilter, actionFilter, userFilter, offset]);

  // Reset and reload on filter changes
  useEffect(() => {
    load(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleFilter, actionFilter, userFilter]);

  const activityChart = buildActivityChart(logs);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#F7F6F3] rounded-[8px] border border-[#EAEAEA]">
            <Shield className="h-4 w-4 text-[#787774]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#111111]">Worklog / Audit Trail</h2>
            <p className="text-xs text-[#787774] mt-0.5">All actions by all users across every module.</p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[#EAEAEA] bg-white text-xs font-medium text-[#2F3437] hover:border-[#111111] disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Activity chart — last 7 days */}
      {logs.length > 0 && (
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-[#787774]" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774]">Actions — Last 7 Days</h3>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChart} margin={{ left: -20, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F1" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#B0ADAA" }} />
                <YAxis tick={{ fontSize: 10, fill: "#B0ADAA" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, border: "1px solid #EAEAEA", borderRadius: 6, boxShadow: "none" }}
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                />
                <Bar dataKey="count" name="Actions" fill="#111111" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="w-full rounded-[6px] border border-[#EAEAEA] bg-white px-3 py-2 text-xs text-[#2F3437] transition-colors focus:border-[#111111] focus:outline-none sm:w-auto"
        >
          <option value="">All modules</option>
          {MODULE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full rounded-[6px] border border-[#EAEAEA] bg-white px-3 py-2 text-xs text-[#2F3437] transition-colors focus:border-[#111111] focus:outline-none sm:w-auto"
        >
          <option value="">All actions</option>
          {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          type="text"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Filter by user email…"
          className="w-full rounded-[6px] border border-[#EAEAEA] bg-white px-3 py-2 text-xs text-[#2F3437] transition-colors placeholder:text-[#B0ADAA] focus:border-[#111111] focus:outline-none sm:w-48"
        />
        {(moduleFilter || actionFilter || userFilter) && (
          <button
            onClick={() => { setModuleFilter(""); setActionFilter(""); setUserFilter(""); }}
            className="text-xs text-[#787774] hover:text-[#111111] px-2 py-1 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#EAEAEA] rounded-[12px] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-[#787774]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading audit logs…</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Filter className="h-8 w-8 text-[#EAEAEA] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#787774]">No audit logs found</p>
            <p className="text-xs text-[#B0ADAA] mt-1">
              {moduleFilter || actionFilter || userFilter
                ? "Try adjusting your filters."
                : "Actions taken in the system will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#F7F6F3] md:hidden">
              {logs.map((log) => (
                <div key={log.id} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <p className="truncate text-sm font-medium text-[#111111]">{log.user_email ?? "System"}</p>
                        <p className="text-[11px] text-[#787774]">{formatTime(log.created_at)}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${ACTION_COLORS[log.action] ?? "bg-[#F7F6F3] text-[#787774]"}`}>
                            {log.action}
                          </span>
                          <span className="text-[11px] text-[#787774]">{log.module}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            log.result === "success" ? "bg-[#EDF3EC] text-[#346538]" : "bg-[#FDEBEC] text-[#9F2F2D]"
                          }`}>
                            {log.result}
                          </span>
                        </div>
                      </div>
                      <div className="pt-0.5 text-[#B0ADAA]">
                        {log.details
                          ? expanded === log.id
                            ? <ChevronUp className="h-3.5 w-3.5" />
                            : <ChevronDown className="h-3.5 w-3.5" />
                          : null}
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] text-[#787774]">
                      <p>Role: {log.role ?? "—"}</p>
                      <p className="truncate">Record: {log.record_id ?? "—"}</p>
                    </div>
                  </button>
                  {expanded === log.id && log.details && (
                    <pre className="mt-3 max-h-40 overflow-y-auto rounded-[8px] bg-[#F7F6F3] px-3 py-2 text-[10px] text-[#787774] whitespace-pre-wrap break-all">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EAEAEA] text-left text-[#787774]">
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Timestamp</th>
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Actor</th>
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Role</th>
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Action</th>
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Module</th>
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Record</th>
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-[0.06em]">Result</th>
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-[0.06em] w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F6F3]">
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <tr
                      onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                      className="hover:bg-[#F7F6F3] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3 text-xs text-[#787774] whitespace-nowrap font-mono">
                        {formatTime(log.created_at)}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#111111] font-medium">{log.user_email ?? "System"}</td>
                      <td className="px-5 py-3 text-xs text-[#787774]">{log.role ?? "—"}</td>
                      <td className="px-5 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.04em] ${ACTION_COLORS[log.action] ?? "bg-[#F7F6F3] text-[#787774]"}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#2F3437]">{log.module}</td>
                      <td className="px-5 py-3 text-xs text-[#B0ADAA] max-w-40 truncate font-mono">
                        {log.record_id ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          log.result === "success"
                            ? "bg-[#EDF3EC] text-[#346538]"
                            : "bg-[#FDEBEC] text-[#9F2F2D]"
                        }`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#B0ADAA]">
                        {log.details
                          ? expanded === log.id
                            ? <ChevronUp className="h-3.5 w-3.5" />
                            : <ChevronDown className="h-3.5 w-3.5" />
                          : null}
                      </td>
                    </tr>
                    {expanded === log.id && log.details && (
                      <tr className="bg-[#F7F6F3]">
                        <td colSpan={8} className="px-5 py-3">
                          <pre className="text-[10px] text-[#787774] font-mono whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Footer: pagination + count */}
      <div className="flex flex-col gap-2 text-[10px] text-[#B0ADAA] sm:flex-row sm:items-center sm:justify-between">
        <span>
          {logs.length} of {total} entries
          {moduleFilter && ` · module: ${moduleFilter}`}
          {actionFilter && ` · action: ${actionFilter}`}
        </span>
        {logs.length < total && (
          <button
            onClick={() => { const newOffset = offset + PAGE; setOffset(newOffset); load(); }}
            disabled={refreshing}
            className="text-[#787774] hover:text-[#111111] font-medium transition-colors disabled:opacity-50"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
