"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Bot, Send, Sparkles, User, ChevronDown, ChevronRight,
    Loader2, AlertCircle, Plus, MessageSquare, Trash2,
    BookOpen, Clock, Database, Menu, X,
} from "lucide-react";
import { authFetch } from "@/utils/supabase/auth-fetch";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ReasoningDetail {
    type: string;
    thinking?: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    reasoning_details?: ReasoningDetail[];
    isStreaming?: boolean;
    reasoningText?: string;
    timestamp?: number;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveContext {
    suggestions: string[];
    sources: { label: string; desc: string; tag: string }[];
}

const EMPTY_MESSAGES: Message[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

function formatTime(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - ts;
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getTitle(messages: Message[]) {
    const first = messages.find((m) => m.role === "user");
    if (!first) return "New conversation";
    return first.content.slice(0, 42) + (first.content.length > 42 ? "…" : "");
}

// ─── Markdown renderer (lightweight) ─────────────────────────────────────────
function renderMarkdown(text: string) {
    // Bold, then bullet lists, then newlines
    const lines = text.split("\n");
    return lines.map((line, i) => {
        const parts = line
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>');

        if (line.startsWith("### ")) {
            return (
                <h3 key={i} className="text-sm font-bold text-slate-900 mt-3 mb-1"
                    dangerouslySetInnerHTML={{ __html: line.slice(4).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            );
        }
        if (line.startsWith("## ")) {
            return (
                <h2 key={i} className="text-sm font-bold text-slate-900 mt-3 mb-1 border-b border-slate-100 pb-1"
                    dangerouslySetInnerHTML={{ __html: line.slice(3).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
            );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
            return (
                <li key={i} className="ml-4 text-sm leading-relaxed list-disc"
                    dangerouslySetInnerHTML={{ __html: parts }} />
            );
        }
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return (
            <p key={i} className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parts }} />
        );
    });
}

// ─── Reasoning trace ─────────────────────────────────────────────────────────
function ReasoningBlock({ text }: { text: string }) {
    const [open, setOpen] = useState(false);
    if (!text) return null;
    return (
        <div className="mb-2">
            <button onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors">
                {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <Sparkles className="h-3 w-3" />
                Reasoning trace
            </button>
            {open && (
                <div className="mt-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-relaxed whitespace-pre-wrap font-mono max-h-60 overflow-y-auto custom-scrollbar">
                    {text}
                </div>
            )}
        </div>
    );
}

// ─── Message component ────────────────────────────────────────────────────────
function AssistantMessage({ msg }: { msg: Message }) {
    return (
        <div className="flex gap-3 group">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 md:h-8 md:w-8">
                {msg.isStreaming
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 md:h-4 md:w-4" />
                    : <Bot className="h-3.5 w-3.5 text-blue-600 md:h-4 md:w-4" />}
            </div>
            <div className="flex-1 min-w-0">
                {msg.reasoningText && <ReasoningBlock text={msg.reasoningText} />}
                <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3.5 py-3 text-sm shadow-sm md:px-4 md:py-3.5">
                    {msg.isStreaming && !msg.content ? (
                        <span className="flex items-center gap-1 text-slate-400 text-sm">
                            <span className="animate-pulse">●</span>
                            <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                            <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                        </span>
                    ) : (
                        <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                    )}
                </div>
                {msg.timestamp && (
                    <p className="text-[10px] text-slate-400 mt-1 ml-1">
                        {formatTime(msg.timestamp)}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AssistantPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSources, setShowSources] = useState(false);
    const [liveCtx, setLiveCtx] = useState<LiveContext>({ suggestions: [], sources: [] });

    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeConv = conversations.find((c) => c.id === activeId) ?? null;
    const messages = activeConv?.messages ?? EMPTY_MESSAGES;

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!activeId) return;
        setMobileSidebarOpen(false);
    }, [activeId]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [input]);

    const newConversation = useCallback(() => {
        const id = generateId();
        const conv: Conversation = {
            id,
            title: "New conversation",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setConversations((prev) => [conv, ...prev]);
        setActiveId(id);
        setMobileSidebarOpen(false);
        setError(null);
    }, []);

    // Fetch live context for suggestions and data sources
    useEffect(() => {
        async function loadContext() {
            try {
                const [candidatesRes, alertsRes] = await Promise.all([
                    authFetch("/api/candidates").then((r) => r.json()).catch(() => ({ candidates: [] })),
                    authFetch("/api/war-room/analysis").then((r) => r.json()).catch(() => ({})),
                ]);
                const candidates: { name: string; party?: string; win_prob?: number; is_our_candidate?: boolean }[] =
                    candidatesRes.candidates ?? candidatesRes ?? [];
                const ours = candidates.find((c) => c.is_our_candidate);
                const threats = candidates.filter((c) => !c.is_our_candidate).slice(0, 2);
                const alertCount: number = alertsRes.active_alerts ?? 0;

                const suggestions: string[] = [];
                if (ours) {
                    suggestions.push(`What is ${ours.name}'s current win probability and momentum?`);
                    suggestions.push(`What are the top voter issues in Ol Kalou and how should ${ours.name} address them?`);
                }
                if (threats.length > 0) {
                    suggestions.push(`How do we counter ${threats.map((t) => t.name).join(" and ")} in the next 7 days?`);
                }
                if (alertCount > 0) {
                    suggestions.push(`Summarise the ${alertCount} active war room alert${alertCount > 1 ? "s" : ""} and recommend actions.`);
                } else {
                    suggestions.push("What ward-level ground strategy should we prioritise this week?");
                }
                suggestions.push("Draft UDA talking points on cost of living for youth voters in Ol Kalou.");

                const sources = [
                    { label: "Candidates", desc: `${candidates.length} candidates tracked`, tag: "Live" },
                    { label: "War Room", desc: `${alertCount} active alert${alertCount !== 1 ? "s" : ""}`, tag: "Live" },
                    { label: "Social Intelligence", desc: "Analyzed posts & sentiment", tag: "Live" },
                    { label: "Field Reports", desc: "Ground intelligence by ward", tag: "Live" },
                    { label: "Voter Contacts", desc: "Contact database by ward", tag: "Live" },
                ];

                setLiveCtx({ suggestions, sources });
            } catch {
                // Fallback — leave empty
            }
        }
        loadContext();
    }, []);

    // Start with one conversation
    useEffect(() => {
        newConversation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const deleteConversation = (id: string) => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeId === id) {
            const remaining = conversations.filter((c) => c.id !== id);
            setActiveId(remaining[0]?.id ?? null);
        }
    };

    const buildApiMessages = (msgs: Message[]) =>
        msgs.map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {}),
        }));

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        setError(null);

        // Ensure there's an active conversation
        let convId = activeId;
        if (!convId) {
            const id = generateId();
            const conv: Conversation = {
                id, title: "New conversation", messages: [], createdAt: Date.now(), updatedAt: Date.now(),
            };
            setConversations((prev) => [conv, ...prev]);
            setActiveId(id);
            convId = id;
        }

        const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };

        // Append user message
        setConversations((prev) => prev.map((c) =>
            c.id === convId
                ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now(), title: getTitle([...c.messages, userMsg]) }
                : c
        ));
        setInput("");
        setIsLoading(true);

        // Add streaming placeholder
        const placeholderMsg: Message = {
            role: "assistant", content: "", isStreaming: true, reasoningText: "", timestamp: Date.now(),
        };

        setConversations((prev) => prev.map((c) =>
            c.id === convId ? { ...c, messages: [...c.messages, placeholderMsg] } : c
        ));

        try {
            const currentMessages = [
                ...((conversations.find((c) => c.id === convId)?.messages ?? [])),
                userMsg,
            ];

            const res = await authFetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: buildApiMessages(currentMessages) }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? "Request failed");
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No stream");
            const decoder = new TextDecoder();
            let contentAcc = "";
            let reasoningAcc = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith("data: ")) continue;
                    try {
                        const event = JSON.parse(trimmed.slice(6));
                        if (event.type === "content") {
                            contentAcc += event.text;
                            setConversations((prev) => prev.map((c) => {
                                if (c.id !== convId) return c;
                                const msgs = [...c.messages];
                                msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: contentAcc, reasoningText: reasoningAcc };
                                return { ...c, messages: msgs };
                            }));
                        } else if (event.type === "reasoning") {
                            reasoningAcc += event.text;
                            setConversations((prev) => prev.map((c) => {
                                if (c.id !== convId) return c;
                                const msgs = [...c.messages];
                                msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], reasoningText: reasoningAcc };
                                return { ...c, messages: msgs };
                            }));
                        } else if (event.type === "done") {
                            const reasoningDetails: ReasoningDetail[] = reasoningAcc
                                ? [{ type: "thinking", thinking: reasoningAcc }] : [];
                            setConversations((prev) => prev.map((c) => {
                                if (c.id !== convId) return c;
                                const msgs = [...c.messages];
                                msgs[msgs.length - 1] = {
                                    role: "assistant", content: contentAcc, isStreaming: false,
                                    reasoningText: reasoningAcc, reasoning_details: reasoningDetails,
                                    timestamp: Date.now(),
                                };
                                return { ...c, messages: msgs, updatedAt: Date.now() };
                            }));
                        }
                    } catch { /* skip */ }
                }
            }
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : "Something went wrong";
            setError(errMsg);
            // Remove placeholder
            setConversations((prev) => prev.map((c) => {
                if (c.id !== convId) return c;
                return { ...c, messages: c.messages.filter((m) => !m.isStreaming) };
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    };

    return (
        <div className="relative flex h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden bg-white">
            {mobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close conversations"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="absolute inset-0 z-20 bg-slate-950/30 md:hidden"
                />
            )}

            {/* ── Conversation History Sidebar ─────────────────────────────── */}
            <div
                className={`absolute inset-y-0 left-0 z-30 flex w-[min(18rem,calc(100vw-2rem))] max-w-xs flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-200 md:static md:z-auto md:w-64 md:max-w-none ${
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700">Conversations</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={newConversation}
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                            title="New conversation"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 md:hidden"
                            title="Close conversations"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                    {conversations.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center mt-6 px-4">No conversations yet</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setActiveId(conv.id)}
                                className={`group mx-2 mb-1 flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2.5 transition-colors ${conv.id === activeId
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-white text-slate-600"
                                    }`}
                            >
                                <MessageSquare className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${conv.id === activeId ? "text-blue-200" : "text-slate-400"}`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`truncate text-sm font-medium ${conv.id === activeId ? "text-white" : "text-slate-700"}`}>
                                        {conv.title}
                                    </p>
                                    <p className={`text-[10px] mt-0.5 ${conv.id === activeId ? "text-blue-200" : "text-slate-400"}`}>
                                        {conv.messages.length} msg · {formatTime(conv.updatedAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                    className={`shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity ${conv.id === activeId ? "hover:bg-blue-500 text-blue-200" : "hover:bg-slate-200 text-slate-400"}`}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Data Sources Panel */}
                <div className="border-t border-slate-200 px-4 py-3">
                    <button
                        onClick={() => setShowSources((v) => !v)}
                        className="flex w-full items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700"
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                        Data Sources
                        {showSources ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />}
                    </button>
                    {showSources && (
                        <div className="mt-2 space-y-2">
                            {liveCtx.sources.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic">Loading…</p>
                            ) : liveCtx.sources.map((src) => (
                                <div key={src.label} className="flex items-start gap-2">
                                    <Database className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="truncate text-xs font-semibold text-slate-700">{src.label}</p>
                                            <span className="text-[9px] px-1 py-0.5 bg-emerald-50 text-emerald-600 rounded font-medium shrink-0">{src.tag}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">{src.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Chat Area ────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat header */}
                <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 md:px-6 md:py-3.5">
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 md:hidden"
                        aria-label="Open conversations"
                    >
                        <Menu className="h-4 w-4" />
                    </button>
                    <div className="rounded-lg bg-blue-50 p-1.5"><Bot className="h-4 w-4 text-blue-600" /></div>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-slate-900">
                            {activeConv?.title ?? "AI Strategy Assistant"}
                        </h2>
                        <p className="flex flex-wrap items-center gap-1.5 text-[11px] leading-relaxed text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                            Claude Sonnet · Live RAG · pgvector search · Campaign context loaded
                        </p>
                    </div>
                    {messages.length > 0 && (
                        <div className="ml-auto hidden items-center gap-1.5 text-[11px] text-slate-400 sm:flex">
                            <Clock className="h-3 w-3" />
                            {messages.length} messages
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 custom-scrollbar md:space-y-5 md:px-6 md:py-5">
                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 md:h-14 md:w-14">
                                <Bot className="h-6 w-6 text-blue-600 md:h-7 md:w-7" />
                            </div>
                            <h3 className="mb-1 text-sm font-semibold text-slate-900 md:text-base">Campaign Strategy Assistant</h3>
                            <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500">
                                Ask me anything about voter data, messaging, county strategy, or War Room threats. I&apos;m grounded in your live campaign intelligence.
                            </p>
                            {liveCtx.suggestions.length > 0 ? (
                                <div className="grid w-full max-w-sm grid-cols-1 gap-2">
                                    {liveCtx.suggestions.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => sendMessage(q)}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Loading suggestions from live data…</p>
                            )}
                        </div>
                    )}

                    {/* Message list */}
                    {messages.map((msg, i) =>
                        msg.role === "user" ? (
                            <div key={`${msg.timestamp ?? i}-${msg.role}`} className="flex justify-end gap-3">
                                <div className="max-w-[88%] sm:max-w-[75%]">
                                    <div className="rounded-2xl rounded-tr-md bg-blue-600 px-3.5 py-3 text-sm leading-relaxed text-white md:px-4">
                                        {msg.content}
                                    </div>
                                    {msg.timestamp && (
                                        <p className="text-[10px] text-slate-400 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                                    )}
                                </div>
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 md:h-8 md:w-8">
                                    <User className="h-3.5 w-3.5 text-slate-500 md:h-4 md:w-4" />
                                </div>
                            </div>
                        ) : (
                            <AssistantMessage key={`${msg.timestamp ?? i}-${msg.role}`} msg={msg} />
                        )
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex gap-2 items-start px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Error</p>
                                <p className="text-xs mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <div className="shrink-0 border-t border-slate-100 bg-white px-4 pb-4 pt-3 md:px-6 md:pb-5">
                    {/* References note */}
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] leading-relaxed text-slate-400">
                        <BookOpen className="h-3 w-3" />
                        Responses cite: VoterCore Analytics · Social Listening · War Room · County Research · Polling Data
                    </div>
                    <form onSubmit={handleSubmit} className="flex items-end gap-2.5 md:gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about strategy, messaging, voter data, or threats… (Enter to send)"
                                rows={1}
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-relaxed placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 custom-scrollbar md:px-4"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
