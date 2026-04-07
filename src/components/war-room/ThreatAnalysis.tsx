"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Users, TrendingUp, Lightbulb, Activity } from "lucide-react";

interface ThreatAnalysisProps {
  markdown: string;
}

const SEVERITY_STYLES: Record<string, { border: string; bg: string; badge: string }> = {
  critical: { border: "border-red-400", bg: "bg-red-50", badge: "bg-red-100 text-red-700" },
  high:     { border: "border-amber-400", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  medium:   { border: "border-blue-400", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
  low:      { border: "border-slate-300", bg: "bg-slate-50", badge: "bg-slate-100 text-slate-600" },
  info:     { border: "border-slate-300", bg: "bg-slate-50", badge: "bg-slate-100 text-slate-600" },
};

function getSeverityStyle(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("critical")) return SEVERITY_STYLES.critical;
  if (lower.includes("high")) return SEVERITY_STYLES.high;
  if (lower.includes("medium")) return SEVERITY_STYLES.medium;
  return SEVERITY_STYLES.low;
}

function TableBlock({ lines }: { lines: string[] }) {
  // Parse markdown table: header, separator, rows
  const rows = lines.filter((l) => l.startsWith("|") && !l.match(/^\|\s*[-:]+/));
  if (rows.length < 2) return null;

  const parseRow = (row: string) =>
    row.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1).map((c) => c.trim());

  const headers = parseRow(rows[0]);
  const dataRows = rows.slice(1);

  const severityCol = headers.findIndex((h) => h.toLowerCase().includes("severity") || h.toLowerCase().includes("threat level"));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => {
            const cells = parseRow(row);
            const severityCell = severityCol >= 0 ? cells[severityCol] ?? "" : cells[0] ?? "";
            const style = getSeverityStyle(severityCell);
            return (
              <tr key={ri} className={`border-b border-slate-100 last:border-0 ${style.bg}`}>
                {cells.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-slate-700 leading-snug">
                    {(ci === severityCol || (severityCol < 0 && ci === 0)) ? (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}>
                        {cell}
                      </span>
                    ) : cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "executive summary":    <AlertTriangle className="h-4 w-4 text-red-600" />,
  "active threats":       <Activity className="h-4 w-4 text-amber-600" />,
  "candidate threat":     <Users className="h-4 w-4 text-blue-600" />,
  "recommended actions":  <Lightbulb className="h-4 w-4 text-emerald-600" />,
  "sentiment pulse":      <TrendingUp className="h-4 w-4 text-violet-600" />,
};

function getSectionIcon(title: string) {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(SECTION_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <CheckCircle className="h-4 w-4 text-slate-500" />;
}

export default function ThreatAnalysis({ markdown }: ThreatAnalysisProps) {
  const sections = useMemo(() => {
    const lines = markdown.split("\n");
    const result: { title: string; lines: string[] }[] = [];
    let current: { title: string; lines: string[] } | null = null;

    for (const line of lines) {
      if (line.startsWith("## ")) {
        if (current) result.push(current);
        current = { title: line.replace(/^##\s+/, ""), lines: [] };
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (current) result.push(current);
    return result;
  }, [markdown]);

  if (!markdown || sections.length === 0) {
    return (
      <div className="text-sm text-slate-400 text-center py-8">
        Analysis not available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const hasTable = section.lines.some((l) => l.startsWith("|"));
        const tableLines = section.lines.filter((l) => l.startsWith("|") || l.match(/^\s*\|/));
        const nonTableLines = section.lines.filter((l) => !l.startsWith("|") && !l.match(/^\s*\|-/));
        const icon = getSectionIcon(section.title);

        return (
          <div key={section.title} className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              {icon}
              <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
            </div>
            <div className="space-y-3 p-4">
              {/* Prose content (non-table) */}
              {nonTableLines.length > 0 && (() => {
                const text = nonTableLines.join("\n").trim();
                if (!text) return null;

                // Numbered list
                const numberedItems = text.match(/^\d+\.\s+.+/gm);
                if (numberedItems && numberedItems.length >= 2) {
                  return (
                    <ol className="space-y-2">
                      {numberedItems.map((item, i) => (
                        <li key={i} className="flex gap-2.5 text-sm leading-snug text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                            {i + 1}
                          </span>
                          <span>{item.replace(/^\d+\.\s+/, "")}</span>
                        </li>
                      ))}
                    </ol>
                  );
                }

                // Paragraph with sentiment parsing
                const paragraphs = text.split(/\n{2,}/).filter(Boolean);
                return (
                  <div className="space-y-2">
                    {paragraphs.map((para, i) => {
                      const lower = para.toLowerCase();
                      const isCritical = lower.includes("critical") || lower.includes("significant risk");
                      return (
                        <p key={i} className={`text-sm leading-relaxed ${isCritical ? "font-medium text-red-700" : "text-slate-700"}`}>
                          {para}
                        </p>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Table content */}
              {hasTable && tableLines.length > 0 && (
                <div className="-mx-1">
                  <TableBlock lines={tableLines} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
