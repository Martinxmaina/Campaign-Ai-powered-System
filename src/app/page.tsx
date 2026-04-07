import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Database,
  Megaphone,
  Radio,
  ShieldCheck,
  Sparkles,
  Users2,
  Waves,
} from "lucide-react";
import { ProductShowcase } from "@/components/landing/ProductShowcase";

const platformModules = [
  {
    name: "Executive Command",
    detail: "Unified oversight for leadership, operations, and daily decision velocity.",
  },
  {
    name: "Research & Intel",
    detail: "Candidate profiles, field reports, opposition tracking, and AI-assisted analysis.",
  },
  {
    name: "Comms & Media",
    detail: "Message planning, sentiment review, media execution, and narrative response loops.",
  },
  {
    name: "Field Operations",
    detail: "Survey capture, voter contact workflows, distributed reporting, and local updates.",
  },
];

const operatingSignals = [
  { label: "Workspaces", value: "12", note: "role-based teams across campaign functions" },
  { label: "Live feeds", value: "24/7", note: "social, field, finance, and war-room monitoring" },
  { label: "Governance", value: "RBAC", note: "audit-ready controls and access segmentation" },
];

const capabilities = [
  {
    icon: Database,
    title: "Operational data spine",
    description:
      "Bring outreach, surveys, parties, candidates, finance, and campaign reporting into one governed system.",
  },
  {
    icon: Waves,
    title: "Real-time signal monitoring",
    description:
      "Track sentiment shifts, threat patterns, ad performance, and field movement without waiting for end-of-day reports.",
  },
  {
    icon: Bot,
    title: "Embedded AI assistance",
    description:
      "Support analysts and operators with drafting, synthesis, research acceleration, and response preparation.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise controls",
    description:
      "Role-aware access, structured workflows, auditable actions, and workspace separation built for sensitive operations.",
  },
];

const workflow = [
  "Monitor campaign health across dashboards, alerts, and live regional inputs.",
  "Coordinate research, comms, outreach, and finance from shared operating context.",
  "Move from intelligence to action with assistant-guided recommendations and team-specific workspaces.",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(28,88,228,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(15,23,42,0.16),transparent_28%),linear-gradient(180deg,#f5f7fb_0%,#edf2f8_100%)] text-slate-950">
      <section className="landing-grid relative isolate min-h-svh border-b border-slate-200/70">
        <div className="landing-orb -left-40 -top-32 h-80 w-80 bg-blue-500/16" />
        <div className="landing-orb -right-32 top-20 h-72 w-72 bg-cyan-400/14" />
        <div className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-10">
          <header className="flex items-center justify-between gap-4 py-3 sm:py-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] sm:h-11 sm:w-11">
                <Megaphone className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Campaign Operating System
                </p>
                <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                  VoterCore Enterprise
                </h1>
              </div>
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-slate-600 lg:flex">
              <a href="#platform">Platform</a>
              <a href="#workflow">Workflow</a>
              <a href="#security">Security</a>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-slate-950/10 bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Sign in
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </nav>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-950/10 bg-slate-950 px-3.5 py-2 text-xs font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] transition hover:bg-slate-800 lg:hidden"
            >
              Sign in
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-10 py-8 md:gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-14">
            <div className="min-w-0 max-w-2xl">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="truncate">Enterprise campaign intelligence, coordination, and control</span>
              </div>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-balance text-slate-950 sm:text-5xl lg:text-6xl">
                The professional operating layer for modern campaign teams.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                VoterCore centralizes campaign oversight across research, outreach,
                media, finance, and war-room response so leadership can act from one
                trusted system.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Enter platform
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/field/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-medium text-slate-900 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white"
                >
                  Field team access
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-5 border-t border-slate-200 pt-7 sm:mt-12 sm:grid-cols-3 sm:gap-6 sm:pt-8">
                {operatingSignals.map((signal) => (
                  <div key={signal.label}>
                    <p className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                      {signal.value}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {signal.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {signal.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-w-0">
              <div className="landing-panel animate-float-slow overflow-hidden rounded-[1.75rem] border border-white/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.94))] p-4 text-white shadow-[0_35px_120px_rgba(15,23,42,0.30)] sm:rounded-[2rem] sm:p-5">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Executive Command Center
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                      National campaign operating view
                    </p>
                  </div>
                  <div className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Live system
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/4 p-4 sm:rounded-[1.5rem] sm:p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                          Campaign pulse
                        </p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">74%</p>
                        <p className="mt-2 text-sm leading-6 text-emerald-300">
                          Positive movement in target clusters this week
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>Alerts triaged</p>
                        <p className="mt-2 text-lg font-semibold text-white">19</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {platformModules.map((module, index) => (
                        <div
                          key={module.name}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">{module.name}</p>
                            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-400">
                              {module.detail}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-slate-500">
                            0{index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.35rem] border border-cyan-400/20 bg-cyan-400/10 p-4 sm:rounded-[1.5rem] sm:p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">
                        Active monitoring
                      </p>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-cyan-50">Narrative pressure</span>
                          <span className="font-semibold text-white">Elevated</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className="h-2 w-[68%] rounded-full bg-cyan-300" />
                        </div>
                        <p className="text-sm leading-6 text-cyan-50/80">
                          Regional volatility detected across digital chatter and
                          field summaries.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/10 bg-white/4 p-4 sm:rounded-[1.5rem] sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/8 p-3">
                          <Bot className="h-5 w-5 text-blue-200" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            AI Operations Assistant
                          </p>
                          <p className="text-sm text-slate-400">
                            Drafts response guidance, summaries, and escalation notes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/10 bg-white/4 p-4 sm:rounded-[1.5rem] sm:p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        Governance
                      </p>
                      <div className="mt-4 space-y-3 text-sm text-slate-300">
                        <div className="flex items-center justify-between">
                          <span>Role access policy</span>
                          <span className="rounded-full bg-emerald-400/12 px-2 py-1 text-xs font-medium text-emerald-300">
                            Enforced
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Audit activity</span>
                          <span className="text-white">Synced</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Data workspace health</span>
                          <span className="text-white">Stable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="landing-panel mt-4 rounded-[1.5rem] border border-white/70 bg-white/88 p-4 shadow-[0_25px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl md:absolute md:-bottom-8 md:-left-6 md:mt-0 md:w-64 md:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Decision latency
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  -31%
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Faster action from shared intel, coordinated workspaces, and fewer reporting gaps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductShowcase />

      <section id="platform" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Platform architecture
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Built like an enterprise system, not a campaign microsite.
          </h3>
          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            The platform is organized around real operating teams, persistent data,
            governed access, and cross-functional visibility for high-stakes execution.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:mt-12 lg:grid-cols-2 lg:gap-6">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <article
                key={capability.title}
                className="landing-panel rounded-[1.5rem] border border-white/70 bg-white/72 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[1.75rem] sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-slate-950 p-3 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                    {capability.title}
                  </h4>
                </div>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  {capability.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="border-y border-slate-200/80 bg-white/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:gap-12 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-10 lg:py-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Operating workflow
            </p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              From signal intake to executive action.
            </h3>
            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Teams work from shared context while leadership keeps a clean view of
              campaign health, active risks, and where intervention is needed next.
            </p>
          </div>

          <div className="space-y-8">
            {workflow.map((step, index) => (
              <div key={step} className="flex gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-900 shadow-sm">
                  0{index + 1}
                </div>
                <div className="border-b border-slate-200 pb-8 last:border-b-0 last:pb-0">
                  <p className="text-lg font-medium tracking-tight text-slate-950 sm:text-xl">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-10 lg:py-24">
        <div className="landing-panel overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(145deg,#0f172a,#172554)] p-6 text-white shadow-[0_35px_120px_rgba(15,23,42,0.22)] sm:rounded-[2rem] sm:p-8 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-200/70">
                Security and control
              </p>
              <h3 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                Professional infrastructure for sensitive political operations.
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Role-scoped workspaces, auditable activity, structured team modules,
                and controlled access pathways keep the system disciplined as the
                campaign grows in speed and complexity.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-4 sm:rounded-[1.5rem]">
                <div className="flex items-center gap-3">
                  <Users2 className="h-5 w-5 text-blue-200" />
                  <p className="text-base font-medium sm:text-lg">Role-specific workspaces</p>
                </div>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-4 sm:rounded-[1.5rem]">
                <div className="flex items-center gap-3">
                  <Radio className="h-5 w-5 text-blue-200" />
                  <p className="text-base font-medium sm:text-lg">Continuous monitoring and reporting</p>
                </div>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-4 sm:rounded-[1.5rem]">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-200" />
                  <p className="text-base font-medium sm:text-lg">Audit-ready operational governance</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Access enterprise workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/16 bg-white/6 px-6 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              View product area
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
