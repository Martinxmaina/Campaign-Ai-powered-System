"use client";

import { useEffect, useMemo, useState } from "react";
import ExecutiveBarChart from "@/components/charts/ExecutiveBarChart";
import ExecutiveKpiCard from "@/components/charts/ExecutiveKpiCard";
import ExecutiveLineChart from "@/components/charts/ExecutiveLineChart";
import {
    getWorkspaceRecords,
    getWorkspaceSeries,
    getWorkspaceSnapshots,
    type WorkspaceRecord,
    type WorkspaceSeries,
    type WorkspaceSnapshot,
} from "@/lib/supabase/queries";

type MetaRecord = Record<string, string | number | boolean | null>;

interface EmptyStateProps {
    title: string;
    description: string;
}

interface RecordColumn {
    key: string;
    label: string;
    source?: "code" | "title" | "subtitle" | "status" | "owner_label" | "primary_date";
    metaKey?: string;
    emphasize?: boolean;
}

interface WorkspaceRecordsTablePageProps {
    workspace: string;
    title: string;
    description: string;
    recordType: string;
    columns: RecordColumn[];
}

interface WorkspaceDashboardPageProps {
    workspace: string;
    title: string;
    description: string;
    recordsHeading?: string;
    recordsDescription?: string;
    recordsType?: string;
    recordColumns: RecordColumn[];
}

interface ReportingKpi {
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
}

interface ReportingHighlight {
    title: string;
    body: string;
}

function EmptyDataState({ title, description }: EmptyStateProps) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
            <h3 className="text-sm font-medium text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
    );
}

function statusClass(status: string | null) {
    const value = (status ?? "").toLowerCase();
    if (["final", "approved", "active", "field complete", "completed"].includes(value)) {
        return "bg-emerald-50 text-emerald-700";
    }
    if (["pending", "paused", "in review", "analysis in progress"].includes(value)) {
        return "bg-amber-50 text-amber-700";
    }
    return "bg-slate-100 text-slate-600";
}

function formatDate(value: string | null) {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString();
}

function getMeta(record: WorkspaceRecord, key?: string) {
    if (!key || !record.meta || typeof record.meta !== "object" || Array.isArray(record.meta)) {
        return null;
    }
    return (record.meta as MetaRecord)[key] ?? null;
}

function renderRecordValue(record: WorkspaceRecord, column: RecordColumn) {
    if (column.metaKey) {
        const value = getMeta(record, column.metaKey);
        return value == null ? "—" : String(value);
    }

    if (column.source === "primary_date") return formatDate(record.primary_date);
    if (column.source === "status") return record.status ?? "—";
    if (column.source === "owner_label") return record.owner_label ?? "—";
    if (column.source === "code") return record.code ?? "—";
    if (column.source === "subtitle") return record.subtitle ?? "—";
    if (column.source === "title") return record.title;

    return record.title;
}

function parseKpis(snapshots: WorkspaceSnapshot[]) {
    const kpiSnapshot = snapshots.find((snapshot) => snapshot.slug === "kpis");
    const payload = kpiSnapshot?.payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [] as ReportingKpi[];

    const cards = (payload as { cards?: unknown[] }).cards;
    if (!Array.isArray(cards)) return [] as ReportingKpi[];

    return cards
        .filter((card): card is Record<string, unknown> => typeof card === "object" && card !== null)
        .map((card) => ({
            label: String(card.label ?? "Metric"),
            value: String(card.value ?? "—"),
            change: card.change ? String(card.change) : undefined,
            positive: typeof card.positive === "boolean" ? card.positive : undefined,
        }));
}

function parseHighlights(snapshots: WorkspaceSnapshot[]) {
    const highlightSnapshot = snapshots.find((snapshot) => snapshot.slug === "highlights");
    const payload = highlightSnapshot?.payload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [] as ReportingHighlight[];

    const cards = (payload as { cards?: unknown[] }).cards;
    if (!Array.isArray(cards)) return [] as ReportingHighlight[];

    return cards
        .filter((card): card is Record<string, unknown> => typeof card === "object" && card !== null)
        .map((card) => ({
            title: String(card.title ?? "Highlight"),
            body: String(card.body ?? ""),
        }));
}

function buildChartGroups(series: WorkspaceSeries[]) {
    const bySlug = new Map<string, WorkspaceSeries[]>();
    for (const item of series) {
        const group = bySlug.get(item.slug) ?? [];
        group.push(item);
        bySlug.set(item.slug, group);
    }
    return Array.from(bySlug.entries()).map(([slug, rows]) => {
        const metaSource = rows.find((row) => row.meta && typeof row.meta === "object" && !Array.isArray(row.meta));
        const meta = (metaSource?.meta as MetaRecord | null) ?? {};
        const seriesKeys = Array.from(new Set(rows.map((row) => row.series_key)));
        const periods = Array.from(new Set(rows.map((row) => row.period_label)));
        const data = periods.map((period) => {
            const point: Record<string, string | number> = { period };
            rows.filter((row) => row.period_label === period).forEach((row) => {
                point[row.series_key] = row.value_num ?? 0;
            });
            return point;
        });

        return {
            slug,
            title: typeof meta.title === "string" ? meta.title : slug,
            subtitle: typeof meta.subtitle === "string" ? meta.subtitle : undefined,
            chartType: meta.chart_type === "bar" ? "bar" : "line",
            horizontal: Boolean(meta.horizontal),
            valueLabel: typeof meta.value_label === "string" ? meta.value_label : undefined,
            data,
            seriesKeys,
            labels: Object.fromEntries(
                rows.map((row) => [row.series_key, row.label || row.series_key]),
            ) as Record<string, string>,
        };
    });
}

function RecordsTable({
    title,
    description,
    records,
    columns,
}: {
    title: string;
    description: string;
    records: WorkspaceRecord[];
    columns: RecordColumn[];
}) {
    if (records.length === 0) {
        return <EmptyDataState title={`No ${title.toLowerCase()} yet`} description={description} />;
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            </div>
            <div className="divide-y divide-slate-50 md:hidden">
                {records.map((record) => (
                    <div key={record.id} className="space-y-3 px-4 py-4">
                        {columns.map((column) => {
                            const value = renderRecordValue(record, column);

                            return (
                                <div key={column.key} className="space-y-1">
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        {column.label}
                                    </p>
                                    {column.source === "status" ? (
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(record.status)}`}>
                                            {value}
                                        </span>
                                    ) : column.emphasize || column.source === "title" ? (
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{value}</p>
                                            {column.source === "title" && record.code && (
                                                <p className="text-[10px] text-slate-400">{record.code}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-600">{value}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-slate-500">
                            {columns.map((column) => (
                                <th key={column.key} className="px-4 py-3 text-xs font-medium uppercase tracking-wide sm:px-6">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {records.map((record) => (
                            <tr key={record.id} className="table-row-hover">
                                {columns.map((column) => {
                                    const value = renderRecordValue(record, column);
                                    if (column.source === "status") {
                                        return (
                                            <td key={column.key} className="px-4 py-3 text-xs sm:px-6">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(record.status)}`}>
                                                    {value}
                                                </span>
                                            </td>
                                        );
                                    }

                                    if (column.emphasize || column.source === "title") {
                                        return (
                                            <td key={column.key} className="px-4 py-3 sm:px-6">
                                                <p className="text-sm font-medium text-slate-900">{value}</p>
                                                {column.source === "title" && record.code && (
                                                    <p className="text-[10px] text-slate-400">{record.code}</p>
                                                )}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={column.key} className="px-4 py-3 text-xs text-slate-600 sm:px-6">
                                            {value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function WorkspaceRecordsTablePage(props: WorkspaceRecordsTablePageProps) {
    const { workspace, title, description, recordType, columns } = props;
    const [records, setRecords] = useState<WorkspaceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        getWorkspaceRecords(workspace, recordType)
            .then((data) => {
                if (active) setRecords(data);
            })
            .catch(() => {
                if (active) setRecords([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [recordType, workspace]);

    if (loading) {
        return <EmptyDataState title={`Loading ${title.toLowerCase()}...`} description="Fetching records from the database." />;
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <RecordsTable title={title} description={description} records={records} columns={columns} />
        </div>
    );
}

export function WorkspaceDashboardPage(props: WorkspaceDashboardPageProps) {
    const {
        workspace,
        title,
        description,
        recordsHeading = "Reports",
        recordsDescription = "Database-backed records for this workspace.",
        recordsType = "reports",
        recordColumns,
    } = props;
    const [snapshots, setSnapshots] = useState<WorkspaceSnapshot[]>([]);
    const [series, setSeries] = useState<WorkspaceSeries[]>([]);
    const [records, setRecords] = useState<WorkspaceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        Promise.all([
            getWorkspaceSnapshots(workspace),
            getWorkspaceSeries(workspace),
            getWorkspaceRecords(workspace, recordsType),
        ])
            .then(([snapshotRows, seriesRows, recordRows]) => {
                if (!active) return;
                setSnapshots(snapshotRows);
                setSeries(seriesRows);
                setRecords(recordRows);
            })
            .catch(() => {
                if (!active) return;
                setSnapshots([]);
                setSeries([]);
                setRecords([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [recordsType, workspace]);

    const kpis = useMemo(() => parseKpis(snapshots), [snapshots]);
    const highlights = useMemo(() => parseHighlights(snapshots), [snapshots]);
    const charts = useMemo(() => buildChartGroups(series), [series]);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div>
                <h1 className="text-lg font-bold text-slate-900 md:text-xl">{title}</h1>
                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            </div>

            {loading && (
                <EmptyDataState title="Loading workspace data..." description="Querying the database for the latest content." />
            )}

            {!loading && highlights.length > 0 && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {highlights.map((highlight) => (
                        <div key={highlight.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{highlight.title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">{highlight.body}</p>
                        </div>
                    ))}
                </div>
            )}

            {!loading && kpis.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((kpi) => (
                        <ExecutiveKpiCard
                            key={kpi.label}
                            label={kpi.label}
                            value={kpi.value}
                            change={kpi.change}
                            positive={kpi.positive}
                        />
                    ))}
                </div>
            )}

            {!loading && charts.length > 0 && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {charts.map((chart) => {
                        if (chart.seriesKeys.length <= 1 && chart.chartType === "bar") {
                            return (
                                <ExecutiveBarChart
                                    key={chart.slug}
                                    title={chart.title}
                                    subtitle={chart.subtitle}
                                    data={chart.data}
                                    xKey={chart.horizontal ? "period" : "period"}
                                    yKey={chart.seriesKeys[0]}
                                    valueLabel={chart.valueLabel}
                                    horizontal={chart.horizontal}
                                    color="#2563eb"
                                />
                            );
                        }

                        return (
                            <ExecutiveLineChart
                                key={chart.slug}
                                title={chart.title}
                                subtitle={chart.subtitle}
                                data={chart.data}
                                xKey="period"
                                series={chart.seriesKeys.map((seriesKey, index) => ({
                                    dataKey: seriesKey,
                                    label: chart.labels[seriesKey],
                                    color: ["#2563eb", "#16a34a", "#f59e0b", "#7c3aed"][index % 4],
                                }))}
                            />
                        );
                    })}
                </div>
            )}

            {!loading && (kpis.length > 0 || highlights.length > 0 || charts.length > 0 || records.length > 0) && (
                <RecordsTable
                    title={recordsHeading}
                    description={recordsDescription}
                    records={records}
                    columns={recordColumns}
                />
            )}

            {!loading && kpis.length === 0 && highlights.length === 0 && charts.length === 0 && records.length === 0 && (
                <EmptyDataState title={`No ${workspace.replace(/-/g, " ")} data yet`} description="This page is now database-backed and will populate when records are added." />
            )}
        </div>
    );
}
