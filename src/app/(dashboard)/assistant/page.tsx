"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Bot, Send, Sparkles, User, ChevronDown, ChevronRight,
    Loader2, AlertCircle, Plus, MessageSquare, Trash2,
    BookOpen, Clock, Hash,
} from "lucide-react";

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

// ─── Constants ───────────────────────────────────────────────────────────────
const SUGGESTED = [
    "What's the top voter concern in Kisumu right now?",
    "Draft counter-messaging to the Nakuru disinformation campaign.",
    "How should we frame cost of living in Nairobi for youth voters?",
    "Which issues should we prioritize for Mombasa rally talking points?",
    "Recommend a response strategy to the opposition ad surge.",
];

const DATA_SOURCES = [
    { label: "VoterCore Analytics", desc: "Sentiment, engagement, donor stats", tag: "Live" },
    { label: "Social Listening", desc: "45K+ mentions tracked across platforms", tag: "Live" },
    { label: "War Room Intelligence", desc: "Threat monitoring and counter-narratives", tag: "Live" },
    { label: "Internal Research Briefing", desc: "2027 Cost of Living County Analysis", tag: "Mar 2027" },
    { label: "County Polling Data", desc: "6 priority counties tracked", tag: "Mar 2027" },
];

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
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mt-0.5">
                {msg.isStreaming
                    ? <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    : <Bot className="h-4 w-4 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
                {msg.reasoningText && <ReasoningBlock text={msg.reasoningText} />}
                <div className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-md shadow-sm">
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
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSources, setShowSources] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeConv = conversations.find((c) => c.id === activeId) ?? null;
    const messages = activeConv?.messages ?? [];

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        setError(null);
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

            const res = await fetch("/api/chat", {
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
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

            {/* ── Conversation History Sidebar ─────────────────────────────── */}
            <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
                {/* Header */}
                <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700">Conversations</span>
                    </div>
                    <button
                        onClick={newConversation}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                        title="New conversation"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
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
                                className={`group mx-2 mb-0.5 px-3 py-2.5 rounded-lg cursor-pointer flex items-start gap-2 transition-colors ${conv.id === activeId
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-white text-slate-600"
                                    }`}
                            >
                                <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${conv.id === activeId ? "text-blue-200" : "text-slate-400"}`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[12px] font-medium truncate ${conv.id === activeId ? "text-white" : "text-slate-700"}`}>
                                        {conv.title}
                                    </p>
                                    <p className={`text-[10px] mt-0.5 ${conv.id === activeId ? "text-blue-200" : "text-slate-400"}`}>
                                        {conv.messages.length} msg · {formatTime(conv.updatedAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                    className={`flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity ${conv.id === activeId ? "hover:bg-blue-500 text-blue-200" : "hover:bg-slate-200 text-slate-400"}`}
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
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors w-full"
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                        Data Sources
                        {showSources ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />}
                    </button>
                    {showSources && (
                        <div className="mt-2 space-y-2">
                            {DATA_SOURCES.map((src) => (
                                <div key={src.label} className="flex items-start gap-2">
                                    <Hash className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-[11px] font-semibold text-slate-700 truncate">{src.label}</p>
                                            <span className="text-[9px] px-1 py-0.5 bg-blue-50 text-blue-600 rounded font-medium flex-shrink-0">{src.tag}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400">{src.desc}</p>
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
                <div className="px-6 py-3.5 border-b border-slate-100 flex items-center gap-3 bg-white flex-shrink-0">
                    <div className="p-1.5 bg-blue-50 rounded-lg"><Bot className="h-4 w-4 text-blue-600" /></div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            {activeConv?.title ?? "AI Strategy Assistant"}
                        </h2>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                            Qwen3 · OpenRouter · Reasoning enabled · Campaign context loaded
                        </p>
                    </div>
                    {messages.length > 0 && (
                        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            {messages.length} messages
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                <Bot className="h-7 w-7 text-blue-600" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">Campaign Strategy Assistant</h3>
                            <p className="text-sm text-slate-500 max-w-xs mb-6">
                                Ask me anything about voter data, messaging, county strategy, or War Room threats. I'm grounded in your live campaign intelligence.
                            </p>
                            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                                {SUGGESTED.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        className="px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all text-slate-600 font-medium shadow-sm text-left"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message list */}
                    {messages.map((msg, i) =>
                        msg.role === "user" ? (
                            <div key={i} className="flex gap-3 justify-end">
                                <div className="max-w-[75%]">
                                    <div className="px-4 py-3 bg-blue-600 text-white rounded-2xl rounded-tr-md text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                    {msg.timestamp && (
                                        <p className="text-[10px] text-slate-400 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                                    )}
                                </div>
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
                                    <User className="h-4 w-4 text-slate-500" />
                                </div>
                            </div>
                        ) : (
                            <AssistantMessage key={i} msg={msg} />
                        )
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex gap-2 items-start px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Error</p>
                                <p className="text-xs mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <div className="px-6 pb-5 pt-3 border-t border-slate-100 bg-white flex-shrink-0">
                    {/* References note */}
                    <div className="mb-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <BookOpen className="h-3 w-3" />
                        Responses cite: VoterCore Analytics · Social Listening · War Room · County Research · Polling Data
                    </div>
                    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about strategy, messaging, voter data, or threats… (Enter to send)"
                                rows={1}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-none leading-relaxed custom-scrollbar"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="flex-shrink-0 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
