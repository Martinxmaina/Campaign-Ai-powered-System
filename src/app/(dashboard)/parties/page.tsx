"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Award, Plus, RefreshCw, Upload, Users, Pencil, Trash2, Check, X } from "lucide-react";
import { getParties, getPoliticalSeats, type PoliticalParty } from "@/lib/supabase/queries";

interface PartyWithCount extends PoliticalParty {
  candidateCount: number;
}

interface EditState {
  name: string;
  short_name: string;
  hex_color: string;
}

export default function PartiesPage() {
  const [parties, setParties] = useState<PartyWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newShort, setNewShort] = useState("");
  const [newColor, setNewColor] = useState("#2563eb");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", short_name: "", hex_color: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    try {
      const [partyData, seats] = await Promise.all([getParties(), getPoliticalSeats()]);
      const counts: Record<string, number> = {};
      for (const s of seats) {
        if (s.party_id) counts[s.party_id] = (counts[s.party_id] ?? 0) + 1;
      }
      setParties(partyData.map((p) => ({ ...p, candidateCount: counts[p.id] ?? 0 })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newShort) return;
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, short_name: newShort, hex_color: newColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? "Failed to add party");
      } else {
        setNewName(""); setNewShort(""); setNewColor("#2563eb");
        setShowAdd(false);
        await load();
      }
    } catch (err) {
      setAddError(String(err));
    }
    setAdding(false);
  }

  function startEdit(party: PartyWithCount) {
    setEditingId(party.id);
    setEditState({
      name: party.name,
      short_name: party.short_name,
      hex_color: party.hex_color ?? "#64748b",
    });
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    try {
      await fetch(`/api/parties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editState),
      });
      setEditingId(null);
      await load();
    } catch (err) { console.error(err); }
    setSavingId(null);
  }

  async function handleDelete(party: PartyWithCount) {
    if (!confirm(`Delete "${party.name}"? This cannot be undone.`)) return;
    setDeletingId(party.id);
    try {
      await fetch(`/api/parties/${party.id}`, { method: "DELETE" });
      setParties((prev) => prev.filter((p) => p.id !== party.id));
    } catch (err) { console.error(err); }
    setDeletingId(null);
  }

  async function handleLogoUpload(partyId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch(`/api/parties/${partyId}/logo`, { method: "POST", body: formData });
      await load();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#F7F6F3] rounded-[8px] border border-[#EAEAEA]">
            <Award className="h-4 w-4 text-[#787774]" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-[#111111]">Political Parties</h1>
            <p className="text-sm text-[#787774] mt-0.5">Parties and their candidates across all elected seats.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <RefreshCw className="h-4 w-4 text-[#B0ADAA] animate-spin" />}
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-2 bg-[#111111] text-white px-3 py-2 rounded-[6px] text-xs font-medium hover:bg-[#333333] active:scale-[0.98] transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Add Party
          </button>
        </div>
      </div>

      {/* Add party form */}
      {showAdd && (
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#787774] mb-4">New party</h3>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-[10px] font-medium text-[#787774] block mb-1.5">Full name *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="United Democratic Alliance" required
                className="px-3 py-2 text-xs border border-[#EAEAEA] rounded-[6px] bg-white focus:outline-none focus:border-[#111111] w-56 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#787774] block mb-1.5">Short name *</label>
              <input value={newShort} onChange={(e) => setNewShort(e.target.value)} placeholder="UDA" required
                className="px-3 py-2 text-xs border border-[#EAEAEA] rounded-[6px] bg-white focus:outline-none focus:border-[#111111] w-24 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#787774] block mb-1.5">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
                  className="w-9 h-9 rounded-[6px] cursor-pointer border border-[#EAEAEA] p-0.5" />
                <span className="text-xs text-[#787774] font-mono">{newColor}</span>
              </div>
            </div>
            <button type="submit" disabled={adding}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-medium rounded-[6px] hover:bg-[#333333] disabled:opacity-50 transition-colors">
              {adding ? "Adding…" : "Add Party"}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setAddError(null); }}
              className="text-xs text-[#787774] hover:text-[#111111] transition-colors">
              Cancel
            </button>
          </form>
          {addError && <p className="text-xs text-[#9F2F2D] mt-2">{addError}</p>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-6 w-6 text-[#EAEAEA] animate-spin" />
        </div>
      ) : parties.length === 0 ? (
        <div className="py-20 text-center">
          <Award className="h-10 w-10 text-[#EAEAEA] mx-auto mb-3" />
          <p className="text-sm text-[#787774]">No parties yet.</p>
          <p className="text-xs text-[#B0ADAA] mt-1">Click Add Party above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {parties.map((party) => {
            const isEditing = editingId === party.id;
            const isSaving = savingId === party.id;
            const isDeleting = deletingId === party.id;
            const color = isEditing ? editState.hex_color : (party.hex_color ?? "#64748b");

            return (
              <div key={party.id} className="bg-white rounded-[12px] border border-[#EAEAEA] overflow-hidden hover:border-[#D0CDCA] transition-colors">
                {/* Color strip */}
                <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

                <div className="p-4">
                  {isEditing ? (
                    /* Inline edit form */
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-[#787774] block mb-1">Full name</label>
                        <input
                          value={editState.name}
                          onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#EAEAEA] rounded-[6px] focus:outline-none focus:border-[#111111] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#787774] block mb-1">Short name</label>
                        <input
                          value={editState.short_name}
                          onChange={(e) => setEditState((s) => ({ ...s, short_name: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#EAEAEA] rounded-[6px] focus:outline-none focus:border-[#111111] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#787774] block mb-1">Party color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editState.hex_color}
                            onChange={(e) => setEditState((s) => ({ ...s, hex_color: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-[#EAEAEA] p-0.5"
                          />
                          <span className="text-[10px] text-[#787774] font-mono">{editState.hex_color}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(party.id)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-[10px] font-medium rounded-[5px] hover:bg-[#333333] disabled:opacity-50 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          {isSaving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 px-2 py-1.5 border border-[#EAEAEA] text-[10px] text-[#787774] rounded-[5px] hover:border-[#111111] transition-colors"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal view */
                    <>
                      <div className="flex items-start gap-3">
                        {/* Logo */}
                        <label className="relative w-12 h-12 rounded-[10px] shrink-0 cursor-pointer group">
                          {party.logo_url ? (
                            <Image src={party.logo_url} alt={party.short_name} width={48} height={48} className="w-12 h-12 rounded-[10px] object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-[10px] flex items-center justify-center text-white text-sm font-black" style={{ backgroundColor: color }}>
                              {party.short_name.slice(0, 3)}
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-[10px] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="h-4 w-4 text-white" />
                          </div>
                          <input type="file" accept="image/*" className="hidden"
                            ref={(el) => { fileRefs.current[party.id] = el; }}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(party.id, f); }} />
                        </label>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#111111] leading-tight">{party.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wide" style={{ backgroundColor: color }}>
                              {party.short_name}
                            </span>
                            {party.coalition && (
                              <span className="text-[10px] text-[#787774]">{party.coalition}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#F7F6F3] flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-[#787774]">
                          <Users className="h-3.5 w-3.5" />
                          <span>{party.candidateCount} candidates</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(party)}
                            className="p-1.5 rounded-[5px] text-[#B0ADAA] hover:text-[#111111] hover:bg-[#F7F6F3] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(party)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-[5px] text-[#B0ADAA] hover:text-[#9F2F2D] hover:bg-[#FDEBEC] transition-colors disabled:opacity-50"
                            title="Delete party"
                          >
                            {isDeleting
                              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                          <Link href={`/parties/${party.id}`} className="text-[10px] font-semibold text-[#787774] hover:text-[#111111] transition-colors px-1.5">
                            View →
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
