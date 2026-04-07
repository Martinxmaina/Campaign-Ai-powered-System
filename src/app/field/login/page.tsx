"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { tr, type Lang } from "@/lib/field/i18n";

export default function FieldLoginPage() {
    const router = useRouter();
    const [lang, setLang] = useState<Lang>("sw");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleMagicLink(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/field` },
        });

        setLoading(false);

        if (authError) {
            setError(authError.message);
            return;
        }

        setSent(true);
    }

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <div className="text-5xl mb-4">📩</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        {lang === "sw" ? "Angalia barua pepe yako" : "Check your email"}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {lang === "sw"
                            ? `Tumetuma kiungo cha kuingia kwa ${email}`
                            : `We sent a login link to ${email}`}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-600 p-6">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="bg-white p-2 rounded-xl">
                        <Megaphone className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-bold text-white text-xl">{tr("appTitle", lang)}</span>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-lg font-bold text-slate-900">{tr("login", lang)}</h1>
                        <button
                            onClick={() => setLang(lang === "sw" ? "en" : "sw")}
                            className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600 font-medium"
                        >
                            {lang === "sw" ? tr("english", lang) : tr("swahili", lang)}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleMagicLink} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                                placeholder="agent@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {lang === "sw" ? "Tuma kiungo" : "Send magic link"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
