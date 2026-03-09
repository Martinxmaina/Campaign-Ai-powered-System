"use client";

import { useState } from "react";
import { Megaphone, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="bg-blue-600 p-2 rounded-xl text-white">
                        <Megaphone className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900 text-2xl tracking-tight">
                        VoterCore
                    </span>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                    <h1 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h1>
                    <p className="text-sm text-slate-500 mb-6">Sign in to your campaign dashboard</p>

                    <form className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" placeholder="your@email.com" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none pr-10" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />Remember me
                            </label>
                            <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Forgot password?</a>
                        </div>
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">Sign In</button>
                    </form>
                    <div className="mt-6 text-center"><p className="text-[11px] text-slate-400">Secured with end-to-end encryption • Role-based access control</p></div>
                </div>
            </div>
        </div>
    );
}
