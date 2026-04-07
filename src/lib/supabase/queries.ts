import { createClient } from "@/utils/supabase/client";
import type { Database } from "./types";

type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
type WarRoomAlert = Database["public"]["Tables"]["war_room_alerts"]["Row"];
type FieldReport = Database["public"]["Tables"]["field_reports"]["Row"];
type AnalyzedPost = Database["public"]["Tables"]["analyzed_posts"]["Row"];
type RawPost = Database["public"]["Tables"]["raw_posts"]["Row"];
type MessageSent = Database["public"]["Tables"]["messages_sent"]["Row"];
type MediaHit = Database["public"]["Tables"]["media_hits"]["Row"];
type CandidateHistory = Database["public"]["Tables"]["candidates_history"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];
type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type PoliticalParty = Database["public"]["Tables"]["political_parties"]["Row"];
type PoliticalSeat = Database["public"]["Tables"]["political_seats"]["Row"];
type ElectionEvent = Database["public"]["Tables"]["election_events"]["Row"];
type CandidateIntel = Database["public"]["Tables"]["candidate_intel"]["Row"];
type VoterContact = Database["public"]["Tables"]["voter_contacts"]["Row"];
type WorkspaceSnapshot = Database["public"]["Tables"]["workspace_snapshots"]["Row"];
type WorkspaceSeries = Database["public"]["Tables"]["workspace_series"]["Row"];
type WorkspaceRecord = Database["public"]["Tables"]["workspace_records"]["Row"];

export interface CandidateIntelWithCandidate extends CandidateIntel {
    candidates: {
        id: string;
        name: string;
        party: string | null;
        photo_url: string | null;
        is_our_candidate: boolean | null;
        mention_count_7d: number | null;
        aliases: string[] | null;
    };
}

// Re-export for consumers
export type { Candidate, WarRoomAlert, FieldReport, AnalyzedPost, RawPost, MessageSent, MediaHit, CandidateHistory, Event, AuditLog, Notification, PoliticalParty, PoliticalSeat, ElectionEvent, CandidateIntel, VoterContact, WorkspaceSnapshot, WorkspaceSeries, WorkspaceRecord };

function getClient() {
    return createClient();
}

// ─── Candidates ────────────────────────────────────────────────────────────

const CANDIDATE_COLUMNS = "id, name, party, photo_url, bio, constituency, win_prob, momentum, threat_level, is_our_candidate, sentiment_positive, sentiment_negative, sentiment_neutral, mention_count_7d, share_of_voice, twitter_handle, facebook_url, instagram_handle, youtube_url, tiktok_url, aliases, created_at, updated_at" as const;

export async function getCandidates(): Promise<Candidate[]> {
    const { data, error } = await getClient()
        .from("candidates")
        .select(CANDIDATE_COLUMNS)
        .order("win_prob", { ascending: false });
    if (error) throw error;
    return data as Candidate[] ?? [];
}

export async function getOurCandidate(): Promise<Candidate | null> {
    const { data, error } = await getClient()
        .from("candidates")
        .select(CANDIDATE_COLUMNS)
        .eq("is_our_candidate", true)
        .single();
    if (error) return null;
    return data;
}

// ─── Dashboard Stats ────────��──────────────────────────────────────────────

export interface DashboardStats {
    totalPosts: number;
    totalFieldReports: number;
    activeAlerts: number;
    totalVoterContacts: number;
    candidates: Candidate[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const client = getClient();

    const [posts, reports, alerts, contacts, candidates] = await Promise.all([
        client.from("raw_posts").select("id", { count: "exact", head: true }),
        client.from("field_reports").select("id", { count: "exact", head: true }),
        client
            .from("war_room_alerts")
            .select("id", { count: "exact", head: true })
            .eq("status", "active"),
        client.from("voter_contacts").select("id", { count: "exact", head: true }),
        client.from("candidates").select(CANDIDATE_COLUMNS).order("win_prob", { ascending: false }),
    ]);

    return {
        totalPosts: posts.count ?? 0,
        totalFieldReports: reports.count ?? 0,
        activeAlerts: alerts.count ?? 0,
        totalVoterContacts: contacts.count ?? 0,
        candidates: candidates.data ?? [],
    };
}

// ─── War Room Alerts ───────��─────────────────────────────��─────────────────

export async function getWarRoomAlerts(
    limit = 50,
    status?: "active" | "responding" | "resolved"
): Promise<WarRoomAlert[]> {
    let query = getClient()
        .from("war_room_alerts")
        .select("id, description, severity, status, source, region, candidate_id, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function getVoterContacts(limit = 100): Promise<VoterContact[]> {
    const { data, error } = await getClient()
        .from("voter_contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data ?? [];
}

export async function getWorkspaceSnapshots(workspace: string, slug?: string): Promise<WorkspaceSnapshot[]> {
    let query = getClient()
        .from("workspace_snapshots")
        .select("*")
        .eq("workspace", workspace)
        .order("captured_at", { ascending: false });

    if (slug) query = query.eq("slug", slug);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function getWorkspaceSnapshot(workspace: string, slug?: string): Promise<WorkspaceSnapshot | null> {
    const snapshots = await getWorkspaceSnapshots(workspace, slug);
    return snapshots[0] ?? null;
}

export async function getWorkspaceSeries(workspace: string, slug?: string): Promise<WorkspaceSeries[]> {
    let query = getClient()
        .from("workspace_series")
        .select("*")
        .eq("workspace", workspace)
        .order("captured_at", { ascending: false })
        .order("sort_order", { ascending: true });

    if (slug) query = query.eq("slug", slug);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function getWorkspaceRecords(
    workspace: string,
    recordType?: string,
    limit = 100,
): Promise<WorkspaceRecord[]> {
    let query = getClient()
        .from("workspace_records")
        .select("*")
        .eq("workspace", workspace)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(limit);

    if (recordType) query = query.eq("record_type", recordType);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

// ─── Social Posts (analyzed) ───────────────────────────────────────────────

export interface SocialPostWithRaw extends AnalyzedPost {
    raw_posts: RawPost;
}

export async function getSocialPosts(options?: {
    platform?: string;
    sentiment?: string;
    limit?: number;
}): Promise<SocialPostWithRaw[]> {
    const limit = options?.limit ?? 50;

    let query = getClient()
        .from("analyzed_posts")
        .select("*, raw_posts(*)")
        .order("analyzed_at", { ascending: false })
        .limit(limit);

    if (options?.platform) {
        query = query.eq("raw_posts.platform", options.platform);
    }
    if (options?.sentiment) {
        query = query.eq("sentiment", options.sentiment);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as SocialPostWithRaw[]) ?? [];
}

// ─── Field Reports ─────────────────────────────────────────────────────��───

export async function getFieldReports(options?: {
    ward?: string;
    limit?: number;
}): Promise<FieldReport[]> {
    const limit = options?.limit ?? 50;

    let query = getClient()
        .from("field_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (options?.ward) {
        query = query.eq("ward", options.ward);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

// ─── Messaging ───────────────────────────���─────────────────────────────────

export async function getMessagingStats(): Promise<{
    messages: MessageSent[];
    totalSent: number;
    totalDelivered: number;
}> {
    const { data, error } = await getClient()
        .from("messages_sent")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(50);

    if (error) throw error;

    const messages = data ?? [];
    const totalSent = messages.reduce((sum, m) => sum + (m.sent_count ?? 0), 0);
    const totalDelivered = messages.reduce((sum, m) => sum + (m.delivered_count ?? 0), 0);

    return { messages, totalSent, totalDelivered };
}

// ─── Media Hits ────��────────────────────────────────���──────────────────────

export async function getMediaHits(limit = 20): Promise<MediaHit[]> {
    const { data, error } = await getClient()
        .from("media_hits")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data ?? [];
}

// ─── Candidates History (time-series) ─────��────────────────────────────────

export async function getCandidateHistory(
    candidateId: string,
    days = 30
): Promise<CandidateHistory[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await getClient()
        .from("candidates_history")
        .select("*")
        .eq("candidate_id", candidateId)
        .gte("snapshot_at", since.toISOString())
        .order("snapshot_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

// ─── Events ────────────────────────────────────────────────────────────────

export async function getEvents(limit = 50): Promise<Event[]> {
    const { data, error } = await getClient()
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
        .limit(limit);
    if (error) throw error;
    return data ?? [];
}

// ─── Sentiment Aggregation ───��─────────────────────────────────────────────

export interface SentimentBreakdown {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
}

export async function getSentimentBreakdown(hours = 24): Promise<SentimentBreakdown> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const client = getClient();

    const [positive, negative, neutral] = await Promise.all([
        client
            .from("analyzed_posts")
            .select("id", { count: "exact", head: true })
            .eq("sentiment", "positive")
            .gte("analyzed_at", since.toISOString()),
        client
            .from("analyzed_posts")
            .select("id", { count: "exact", head: true })
            .eq("sentiment", "negative")
            .gte("analyzed_at", since.toISOString()),
        client
            .from("analyzed_posts")
            .select("id", { count: "exact", head: true })
            .eq("sentiment", "neutral")
            .gte("analyzed_at", since.toISOString()),
    ]);

    const p = positive.count ?? 0;
    const n = negative.count ?? 0;
    const ne = neutral.count ?? 0;

    return { positive: p, negative: n, neutral: ne, total: p + n + ne };
}

// ─── Audit Logs ────────────────────────────────────────────────────────────

export async function getAuditLogs(options?: {
    module?: string;
    limit?: number;
}): Promise<AuditLog[]> {
    let query = getClient()
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(options?.limit ?? 100);

    if (options?.module) query = query.eq("module", options.module);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

// ─── Notifications ─────────────────────────────────────────────────────────

export async function getNotifications(userId?: string): Promise<Notification[]> {
    let query = getClient()
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    if (userId) {
        query = query.or(`user_id.is.null,user_id.eq.${userId}`);
    } else {
        query = query.is("user_id", null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
    const { error } = await getClient()
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
    if (error) throw error;
}

export async function markAllNotificationsRead(userId?: string): Promise<void> {
    let query = getClient()
        .from("notifications")
        .update({ read: true })
        .eq("read", false);
    if (userId) {
        query = query.or(`user_id.is.null,user_id.eq.${userId}`);
    }
    const { error } = await query;
    if (error) throw error;
}

// ─── Political Parties ─────────────────────────────────────────────────────

export async function getParties(): Promise<PoliticalParty[]> {
    const { data, error } = await getClient()
        .from("political_parties")
        .select("*")
        .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function getPartyById(id: string): Promise<PoliticalParty | null> {
    const { data, error } = await getClient()
        .from("political_parties")
        .select("*")
        .eq("id", id)
        .single();
    if (error) return null;
    return data;
}

// ─── Political Seats ───────────────────────────────────────────────────────

export async function getPoliticalSeats(options?: {
    seatType?: string;
    constituency?: string;
    partyId?: string;
    limit?: number;
}): Promise<PoliticalSeat[]> {
    let query = getClient()
        .from("political_seats")
        .select("*")
        .order("vote_share", { ascending: false })
        .limit(options?.limit ?? 100);

    if (options?.seatType)     query = query.eq("seat_type", options.seatType);
    if (options?.constituency) query = query.eq("constituency", options.constituency);
    if (options?.partyId)      query = query.eq("party_id", options.partyId);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

// ─── Election Events (Countdown) ──────────────────────────────────────────

export async function getElectionEvents(): Promise<ElectionEvent[]> {
    const { data, error } = await getClient()
        .from("election_events")
        .select("*")
        .order("event_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function getPrimaryElectionEvent(): Promise<ElectionEvent | null> {
    const { data, error } = await getClient()
        .from("election_events")
        .select("*")
        .eq("is_primary", true)
        .maybeSingle();
    if (error) return null;
    return data;
}

// ─── Field Reports by Constituency (for heatmap) ──────────────────────────

export interface ConstituencyHeatmapData {
    constituency: string;
    reportCount: number;
    avgMood: number;
    positiveReports: number;
    alertReports: number;
}

export async function getHeatmapData(): Promise<ConstituencyHeatmapData[]> {
    const { data, error } = await getClient()
        .from("field_reports")
        .select("ward, mood_score, report_type, priority")
        .order("created_at", { ascending: false })
        .limit(500);

    if (error) throw error;

    // Import ward→constituency mapping (dynamic import to avoid SSR issues)
    const { WARD_CONSTITUENCY } = await import("@/lib/geography");

    const byConstituency: Record<string, { moods: number[]; count: number; positive: number; alerts: number }> = {};

    for (const report of data ?? []) {
        const constituency = WARD_CONSTITUENCY[report.ward] ?? "Ol Kalou";
        if (!byConstituency[constituency]) {
            byConstituency[constituency] = { moods: [], count: 0, positive: 0, alerts: 0 };
        }
        byConstituency[constituency].count++;
        if (report.mood_score) byConstituency[constituency].moods.push(report.mood_score);
        if (report.mood_score && report.mood_score >= 4) byConstituency[constituency].positive++;
        if (report.priority === "high" || report.report_type === "alert") byConstituency[constituency].alerts++;
    }

    return Object.entries(byConstituency).map(([constituency, d]) => ({
        constituency,
        reportCount: d.count,
        avgMood: d.moods.length > 0 ? d.moods.reduce((a, b) => a + b, 0) / d.moods.length : 0,
        positiveReports: d.positive,
        alertReports: d.alerts,
    }));
}

// ─── Candidate Intelligence ───────────────────────────────────────────────

export async function getCandidateIntel(): Promise<CandidateIntelWithCandidate[]> {
    const { data, error } = await getClient()
        .from("candidate_intel")
        .select("*, candidates(id, name, party, photo_url, is_our_candidate, mention_count_7d, aliases)")
        .order("fame_rank", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return (data as CandidateIntelWithCandidate[]) ?? [];
}

export async function getCandidateIntelById(candidateId: string): Promise<CandidateIntel | null> {
    const { data, error } = await getClient()
        .from("candidate_intel")
        .select("*")
        .eq("candidate_id", candidateId)
        .maybeSingle();
    if (error) return null;
    return data;
}
