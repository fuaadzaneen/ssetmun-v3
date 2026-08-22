"use client";

import React, { useState, useCallback } from "react";
import {
  School,
  Plus,
  Download,
  RefreshCw,
  Pencil,
  Trash2,
  ExternalLink,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Link2,
  ChevronDown,
  ChevronUp,
  Gavel,
  CircleDot,
  Mail,
  MailCheck,
} from "lucide-react";
import Papa from "papaparse";
import { School as SchoolType, Delegate, Round } from "@/lib/types";
import { SchoolFormModal } from "./SchoolFormModal";

interface Props {
  activeRound: Round;
  schools: SchoolType[];
  delegates: Delegate[];
  isLoading: boolean;
  onSchoolsChanged: () => void;
  onDelegateSynced: () => void;
  onOpenAllotment: (delegate: Delegate) => void;
  onSendEmail: (delegates: Delegate[]) => void;
}

// ---- Template CSV generator ----
function downloadTemplate(school: SchoolType) {
  const headers = [
    "Sl. No",
    "Full Name",
    "Email",
    "Phone No",
    "Emergency Contact",
    "Committee Pref 01",
    "Country Pref 01",
    "Country Pref 02",
    "Country Pref 03",
    "Country Pref 04",
    "Country Pref 05",
    "Committee Pref 02",
    "Country Pref 01",
    "Country Pref 02",
    "Country Pref 03",
    "Country Pref 04",
    "Country Pref 05",
    "Food Preference",
  ];

  const allRows = [
    // Info rows shown clearly at the top of the sheet
    [`SSET MUN 2026 — School Delegation Form`],
    [`School: ${school.name}`],
    [`Registration Fee: Rs.${school.price_per_delegate} per delegate`],
    [`Payment Link: ${school.payment_link}`],
    [`--- Fill delegate details below. Do NOT modify or remove the header row (Row 7). ---`],
    [], // blank spacer
    headers,
    ...Array.from({ length: 50 }, (_, i) => [String(i + 1), ...Array(17).fill("")]),
  ];

  const csv = Papa.unparse(allRows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `SSETMUN2026_${school.name.replace(/\s+/g, "_")}_RegistrationForm.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---- Status badge ----
const StatusBadge: React.FC<{ status: Delegate["status"] }> = ({ status }) => {
  const map: Record<string, string> = {
    Registered: "bg-sset-bg border border-sset-border text-sset-muted",
    Allotted: "bg-sset-gold/15 border border-sset-gold/40 text-sset-gold",
    Confirmed: "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400",
    Cancelled: "bg-red-500/10 border border-red-500/30 text-red-400",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] ?? map.Registered}`}>
      {status}
    </span>
  );
};

// ---- Sync state type ----
interface SyncState {
  loading: boolean;
  result: { added: number; updated: number; skipped: number; skippedEmails?: string[] } | null;
  error: string | null;
}

// ---- Individual school card ----
const SchoolCard: React.FC<{
  school: SchoolType;
  delegates: Delegate[];
  activeRound: Round;
  onEdit: (s: SchoolType) => void;
  onDelete: (s: SchoolType) => void;
  onDelegateSynced: () => void;
  onOpenAllotment: (d: Delegate) => void;
  onSendEmail: (delegates: Delegate[]) => void;
}> = ({ school, delegates, activeRound, onEdit, onDelete, onDelegateSynced, onOpenAllotment, onSendEmail }) => {
  const [syncState, setSyncState] = useState<SyncState>({ loading: false, result: null, error: null });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSync = useCallback(async () => {
    setSyncState({ loading: true, result: null, error: null });
    try {
      const res = await fetch("/api/school-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: school.id, roundSlug: activeRound.slug }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Sync failed");
      setSyncState({ loading: false, result: data.summary, error: null });
      onDelegateSynced();
      // Auto-expand after sync so you can see + allot right away
      setIsExpanded(true);
    } catch (err: any) {
      setSyncState({ loading: false, result: null, error: err.message });
    }
  }, [school.id, activeRound.slug, onDelegateSynced]);

  const hasSheet = Boolean(school.sheet_id);
  const allottedDelegates = delegates.filter(
    (d) => d.status === "Allotted" || d.status === "Confirmed"
  );
  const allottedCount = allottedDelegates.length;

  return (
    <div className="bg-sset-card border border-sset-border rounded-2xl overflow-hidden hover:border-sset-gold/30 transition-colors">
      {/* Card body */}
      <div className="p-5 flex flex-col gap-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sset-gold/10 border border-sset-gold/30 flex items-center justify-center flex-shrink-0">
              <School className="w-4 h-4 text-sset-gold" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-sset-text truncate">{school.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-sset-gold bg-sset-gold/10 border border-sset-gold/30 px-1.5 py-0.5 rounded-full">
                  ₹{school.price_per_delegate} / delegate
                </span>
                <span className="text-[10px] text-sset-muted">
                  {allottedCount}/{delegates.length} allotted
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onEdit(school)} className="p-1.5 rounded-lg text-sset-muted hover:text-sset-gold hover:bg-sset-gold/10 transition-colors" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(school)} className="p-1.5 rounded-lg text-sset-muted hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Coordinator */}
        {(school.coordinator_name || school.coordinator_phone || school.coordinator_email) && (
          <div className="text-[11px] text-sset-muted space-y-0.5">
            {school.coordinator_name && <div className="font-medium text-sset-text">{school.coordinator_name}</div>}
            {school.coordinator_phone && <div>{school.coordinator_phone}</div>}
            {school.coordinator_email && <div>{school.coordinator_email}</div>}
          </div>
        )}

        {/* Payment link */}
        <a href={school.payment_link} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors truncate">
          <Link2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{school.payment_link}</span>
          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
        </a>

        {/* Sheet status */}
        <div className={`text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
          hasSheet ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" : "bg-amber-500/10 border border-amber-500/25 text-amber-400"
        }`}>
          {hasSheet ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {hasSheet ? `Sheet linked` : "No sheet linked — click Edit to add"}
        </div>

        {/* Sync result / error */}
        {syncState.result && (
          <div className="text-[11px] bg-sset-bg rounded-lg px-3 py-2 border border-sset-border">
            <div className="text-emerald-400 font-semibold">✓ Sync complete</div>
            <div className="text-sset-muted">Added {syncState.result.added} · Updated {syncState.result.updated} · Skipped {syncState.result.skipped}</div>
          </div>
        )}
        {syncState.error && (
          <div className="text-[11px] bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg px-3 py-2">✕ {syncState.error}</div>
        )}

        {/* Notes */}
        {school.notes && <p className="text-[11px] text-sset-muted italic">{school.notes}</p>}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1 border-t border-sset-border/50">
          <button onClick={() => downloadTemplate(school)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-sset-bg border border-sset-border text-sset-text hover:border-sset-gold/40 hover:text-sset-gold rounded-lg transition-colors">
            <Download className="w-3 h-3" />
            Template
          </button>
          <button onClick={handleSync} disabled={syncState.loading || !hasSheet}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-sset-gold/10 border border-sset-gold/40 text-sset-gold hover:bg-sset-gold/20 rounded-lg transition-colors disabled:opacity-40"
            title={!hasSheet ? "Add Google Sheet link first" : "Pull latest rows from sheet"}>
            {syncState.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Sync School
          </button>
          {/* Expand/collapse delegates */}
          {delegates.length > 0 && (
            <button onClick={() => setIsExpanded((v) => !v)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 text-[11px] font-semibold bg-sset-bg border border-sset-border text-sset-muted hover:text-sset-text rounded-lg transition-colors"
              title="View & allot delegates">
              <Users className="w-3 h-3" />
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* ---- Inline delegates panel ---- */}
      {isExpanded && delegates.length > 0 && (
        <div className="border-t border-sset-border bg-sset-bg/60">
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-sset-border/30 bg-sset-deep/40">
            <span className="text-[10px] font-bold text-sset-muted uppercase tracking-wider">
              Delegates — {delegates.length} total ({allottedCount} allotted)
            </span>
            {allottedCount > 0 && (
              <button
                onClick={() => onSendEmail(allottedDelegates)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sset-gold/15 border border-sset-gold/40 text-sset-gold hover:bg-sset-gold/25 transition-colors"
                title="Send allotment emails to all allotted delegates in this school"
              >
                <Mail className="w-3 h-3" />
                Email Allotted ({allottedCount})
              </button>
            )}
          </div>
          <div className="divide-y divide-sset-border/40 max-h-72 overflow-y-auto">
            {delegates.map((d) => {
              const pref1 = d.committee_preferences?.[0];
              const pref2 = d.committee_preferences?.[1];
              const isAllotted = d.status === "Allotted" || d.status === "Confirmed";
              return (
                <div key={d.id} className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-sset-card/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-sset-text truncate">{d.name}</span>
                      <StatusBadge status={d.status} />
                      {d.latest_email_status === 'sent' && (
                        <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <MailCheck className="w-2.5 h-2.5" /> Sent
                        </span>
                      )}
                    </div>
                    {/* Allotted info */}
                    {isAllotted && d.current_committee ? (
                      <div className="text-[10px] text-sset-gold mt-0.5 flex items-center gap-1">
                        <Gavel className="w-2.5 h-2.5" />
                        {d.current_committee}{d.current_country ? ` · ${d.current_country}` : ""}
                      </div>
                    ) : (
                      <div className="text-[10px] text-sset-muted mt-0.5 space-x-2">
                        {pref1 && (
                          <span>
                            <CircleDot className="w-2.5 h-2.5 inline mr-0.5 opacity-50" />
                            {pref1.committee}
                            {pref1.portfolios?.length > 0 ? ` (${pref1.portfolios.slice(0, 2).join(", ")})` : ""}
                          </span>
                        )}
                        {pref2 && (
                          <span className="opacity-60">
                            · {pref2.committee}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onSendEmail([d])}
                      className={`p-1.5 rounded-lg transition-colors ${
                        d.latest_email_status === 'sent'
                          ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                          : 'text-sset-muted hover:text-sset-gold hover:bg-sset-gold/10'
                      }`}
                      title={d.latest_email_status === 'sent' ? 'Email sent. Click to resend.' : 'Send allotment email'}
                    >
                      {d.latest_email_status === 'sent' ? <MailCheck className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onOpenAllotment(d)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-colors ${
                        isAllotted
                          ? "bg-sset-gold/10 border border-sset-gold/30 text-sset-gold hover:bg-sset-gold/20"
                          : "bg-sset-gold text-sset-bg hover:bg-amber-400 shadow-sm"
                      }`}
                    >
                      {isAllotted ? "Re-allot" : "Allot"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Main SchoolsSection ----
export const SchoolsSection: React.FC<Props> = ({
  activeRound,
  schools,
  delegates,
  isLoading,
  onSchoolsChanged,
  onDelegateSynced,
  onOpenAllotment,
  onSendEmail,
}) => {
  const [formState, setFormState] = useState<{ isOpen: boolean; school: SchoolType | null }>({
    isOpen: false,
    school: null,
  });

  const handleDelete = useCallback(async (school: SchoolType) => {
    if (!confirm(`Delete "${school.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/schools?id=${school.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) onSchoolsChanged();
    else alert(data.error ?? "Delete failed");
  }, [onSchoolsChanged]);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cinzel text-base font-bold text-sset-text flex items-center gap-2">
            <School className="w-4 h-4 text-sset-gold" />
            School Delegations
          </h2>
          <p className="text-[11px] text-sset-muted mt-0.5">
            {schools.length} school{schools.length !== 1 ? "s" : ""} · {activeRound.name}
          </p>
        </div>
        <button
          onClick={() => setFormState({ isOpen: true, school: null })}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-sset-gold text-sset-bg rounded-lg hover:bg-amber-400 transition-colors shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          Add School
        </button>
      </div>

      {/* How it works */}
      <div className="bg-sset-bg border border-sset-border rounded-xl px-4 py-3 text-[11px] text-sset-muted space-y-0.5">
        <p className="font-semibold text-sset-text mb-1">How it works</p>
        <p>1. Add school → set their fixed fee + payment link.</p>
        <p>2. <strong className="text-sset-text">Download Template</strong> → CSV pre-filled with school name & fee. Send it to the school coordinator.</p>
        <p>3. They fill it in Google Sheets and share the link → <strong className="text-sset-text">Edit</strong> school to paste the link.</p>
        <p>4. <strong className="text-sset-text">Sync School</strong> any time to pull latest rows. Delegates appear right below the card — click <strong className="text-sset-text">Allot</strong> to assign committees and <strong className="text-sset-text">Email</strong> to dispatch allotment letters with their school fee.</p>
      </div>

      {/* School cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sset-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />Loading schools...
        </div>
      ) : schools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-sset-muted text-center">
          <School className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-semibold text-sm">No schools yet</p>
          <p className="text-xs mt-1">Click <strong>Add School</strong> to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              delegates={delegates.filter((d) => d.school_id === school.id)}
              activeRound={activeRound}
              onEdit={(s) => setFormState({ isOpen: true, school: s })}
              onDelete={handleDelete}
              onDelegateSynced={onDelegateSynced}
              onOpenAllotment={onOpenAllotment}
              onSendEmail={onSendEmail}
            />
          ))}
        </div>
      )}


      <SchoolFormModal
        isOpen={formState.isOpen}
        school={formState.school}
        onClose={() => setFormState({ isOpen: false, school: null })}
        onSaved={() => {
          setFormState({ isOpen: false, school: null });
          onSchoolsChanged();
        }}
      />
    </div>
  );
};
