"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createElement, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

// ── Types ────────────────────────────────────────────────────────────────────
export interface Party {
  id: string;
  name: string;
  shortName: string;
  hexColor: string;
  logoUrl: string | null;
  coalition: string | null;
  description: string | null;
}

// Fallback for unmatched parties
const FALLBACK_PARTY: Party = {
  id: "",
  name: "Not Yet Confirmed",
  shortName: "TBD",
  hexColor: "#94a3b8",
  logoUrl: null,
  coalition: null,
  description: "Party affiliation not yet confirmed",
};

// ── Context ──────────────────────────────────────────────────────────────────
interface PartyContextValue {
  parties: Party[];
  partyMap: Map<string, Party>;
  loading: boolean;
  refetch: () => Promise<void>;
}

const PartyContext = createContext<PartyContextValue>({
  parties: [],
  partyMap: new Map(),
  loading: true,
  refetch: async () => {},
});

export function PartyProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParties = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("political_parties")
        .select("id, name, short_name, hex_color, logo_url, coalition, description")
        .order("name");

      if (data) {
        setParties(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            shortName: p.short_name,
            hexColor: p.hex_color ?? "#94a3b8",
            logoUrl: p.logo_url,
            coalition: p.coalition,
            description: p.description,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to fetch parties:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  const partyMap = useMemo(() => {
    const map = new Map<string, Party>();
    for (const p of parties) {
      map.set(p.shortName, p);
      map.set(p.name, p);        // Allow lookup by full name too
      map.set(p.id, p);          // Allow lookup by ID
    }
    return map;
  }, [parties]);

  const value = useMemo(
    () => ({ parties, partyMap, loading, refetch: fetchParties }),
    [parties, partyMap, loading, fetchParties]
  );

  return createElement(PartyContext.Provider, { value }, children);
}

// ── Hooks ────────────────────────────────────────────────────────────────────
export function useParties() {
  return useContext(PartyContext);
}

// ── Synchronous lookup (for renders) ─────────────────────────────────────────
export function getParty(partyName: string | null, partyMap?: Map<string, Party>): Party {
  if (!partyName) return FALLBACK_PARTY;
  if (partyMap) {
    return partyMap.get(partyName) ?? FALLBACK_PARTY;
  }
  // Fallback: return a party with just the name (no color from DB)
  return { ...FALLBACK_PARTY, shortName: partyName, name: partyName };
}

// ── Party options for dropdowns (dynamic) ────────────────────────────────────
export function usePartyOptions(): string[] {
  const { parties } = useParties();
  return useMemo(
    () => parties.map((p) => p.shortName).filter((s) => s !== "TBD"),
    [parties]
  );
}

// Legacy compat — PARTY_OPTIONS now requires context
// This is an empty array that gets populated after mount.
// Prefer usePartyOptions() hook instead.
export const PARTY_OPTIONS: string[] = [];
