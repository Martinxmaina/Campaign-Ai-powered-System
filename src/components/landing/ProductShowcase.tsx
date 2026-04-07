"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Bot, BarChart2, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";

const tabs = [
  {
    id: "dashboard",
    label: "Live Dashboard",
    icon: LayoutDashboard,
    description:
      "Kenya voter support visualised by county, real-time campaign activity feed, and cross-channel performance at a glance.",
    image: "/screenshots/dashboard.png",
    alt: "Campaign Dashboard — Kenya voter support map and activity feed",
    badge: "Command Center",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart2,
    description:
      "Campaign reach, voter contacts, conversion rates, channel response breakdowns, and county-level outreach metrics in one view.",
    image: "/screenshots/analytics.png",
    alt: "Analytics & Reports — channel performance and county reach",
    badge: "Reports",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "assistant",
    label: "AI Assistant",
    icon: Bot,
    description:
      "Ask strategy questions in plain language. Get intelligence-backed answers with full reasoning trace sourced from live campaign data.",
    image: "/screenshots/assistant.png",
    alt: "AI Campaign Assistant — reasoning trace and strategic guidance",
    badge: "AI-Powered",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
  },
] as const;

export function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [animKey, setAnimKey] = useState(0);

  const currentTab = tabs[active];

  function switchTo(i: number) {
    setActive(i);
    setAnimKey((k) => k + 1);
  }

  function prev() {
    switchTo((active - 1 + tabs.length) % tabs.length);
  }
  function next() {
    switchTo((active + 1) % tabs.length);
  }

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const id = setInterval(() => next(), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const hasImage = !imgError[currentTab.id];

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-500/8 blur-3xl" />
        <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Platform preview
          </p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            See it in action.
          </h3>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Every module is built for real campaign conditions — not demos.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="mt-10 flex items-center justify-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = active === i;
            return (
              <button
                key={tab.id}
                onClick={() => switchTo(i)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Description + badge */}
        <div className="mt-5 flex flex-col items-center gap-2 text-center">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${currentTab.badgeColor}`}
          >
            {currentTab.badge}
          </span>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            {currentTab.description}
          </p>
        </div>

        {/* Screenshot frame */}
        <div className="relative mt-8 sm:mt-10">
          {/* Browser chrome frame */}
          <div
            key={animKey}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.13)] animate-in fade-in zoom-in-95 duration-300 sm:rounded-[1.75rem]"
          >
            {/* Browser top bar */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="mx-auto flex w-full max-w-xs items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1">
                <span className="truncate text-xs text-slate-400">
                  votercore.app/{currentTab.id}
                </span>
              </div>
              {/* Spacer to balance dots */}
              <div className="flex w-12 items-center gap-1.5 opacity-0">
                <div className="h-2.5 w-2.5 rounded-full" />
                <div className="h-2.5 w-2.5 rounded-full" />
                <div className="h-2.5 w-2.5 rounded-full" />
              </div>
            </div>

            {/* Screenshot or placeholder */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              {hasImage ? (
                <Image
                  src={currentTab.image}
                  alt={currentTab.alt}
                  fill
                  className="object-cover object-top"
                  priority={active === 0}
                  onError={() =>
                    setImgError((prev) => ({ ...prev, [currentTab.id]: true }))
                  }
                />
              ) : (
                /* Fallback placeholder when image file is missing */
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200">
                    <currentTab.icon className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">{currentTab.label}</p>
                  <p className="text-xs text-slate-400">
                    Add{" "}
                    <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px]">
                      {currentTab.image}
                    </code>{" "}
                    to display this screenshot
                  </p>
                </div>
              )}

              {/* Subtle bottom fade */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-slate-100/60 to-transparent" />
            </div>
          </div>

          {/* Prev / Next arrows — mobile */}
          <button
            onClick={prev}
            aria-label="Previous screenshot"
            className="absolute -left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md sm:-left-5 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next screenshot"
            className="absolute -right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md sm:-right-5 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {tabs.map((_, i) => (
            <button
              key={i}
              onClick={() => switchTo(i)}
              aria-label={`Go to screenshot ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active === i ? "w-6 bg-slate-950" : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
