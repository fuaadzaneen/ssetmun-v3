"use client";

import React, { useState, useEffect } from "react";
import { X, School, Link2, Phone, Mail, User, DollarSign, FileText, Save, Loader2 } from "lucide-react";
import { School as SchoolType } from "@/lib/types";
import { INITIAL_ROUNDS } from "@/lib/store";

interface Props {
  isOpen: boolean;
  school: SchoolType | null; // null = create mode
  onClose: () => void;
  onSaved: (school: SchoolType) => void;
}

const EMPTY_FORM = {
  name: "",
  coordinator_name: "",
  coordinator_email: "",
  coordinator_phone: "",
  price_per_delegate: "",
  payment_link: "",
  sheet_id: "",
  sheet_name: "",
  round_id: INITIAL_ROUNDS[0].id,
  notes: "",
};

function extractSheetId(input: string): string {
  // Handle full Google Sheets URL or bare ID
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input.trim();
}

export const SchoolFormModal: React.FC<Props> = ({ isOpen, school, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (school) {
        setForm({
          name: school.name ?? "",
          coordinator_name: school.coordinator_name ?? "",
          coordinator_email: school.coordinator_email ?? "",
          coordinator_phone: school.coordinator_phone ?? "",
          price_per_delegate: String(school.price_per_delegate ?? ""),
          payment_link: school.payment_link ?? "",
          sheet_id: school.sheet_id ?? "",
          sheet_name: school.sheet_name ?? "",
          round_id: school.round_id ?? INITIAL_ROUNDS[0].id,
          notes: school.notes ?? "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError(null);
    }
  }, [isOpen, school]);

  if (!isOpen) return null;

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const price = parseInt(form.price_per_delegate);
    if (!form.name.trim()) return setError("School name is required.");
    if (!price || price <= 0) return setError("Enter a valid price per delegate.");
    if (!form.payment_link.trim()) return setError("Payment link is required.");

    setIsSaving(true);
    try {
      const payload = {
        ...(school ? { id: school.id } : {}),
        name: form.name.trim(),
        coordinator_name: form.coordinator_name.trim() || null,
        coordinator_email: form.coordinator_email.trim() || null,
        coordinator_phone: form.coordinator_phone.trim() || null,
        price_per_delegate: price,
        payment_link: form.payment_link.trim(),
        sheet_id: form.sheet_id.trim() ? extractSheetId(form.sheet_id.trim()) : null,
        sheet_name: form.sheet_name.trim() || null,
        round_id: form.round_id || INITIAL_ROUNDS[0].id,
        notes: form.notes.trim() || null,
      };

      const method = school ? "PATCH" : "POST";
      const res = await fetch("/api/schools", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Save failed");
      onSaved(data.school);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full bg-sset-bg border border-sset-border rounded-lg px-3 py-2 text-sm text-sset-text placeholder-sset-muted/50 focus:outline-none focus:border-sset-gold/60 transition-colors";
  const labelClass = "block text-[11px] font-semibold text-sset-muted uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-sset-card border border-sset-border rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sset-border">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-sset-gold" />
            <h2 className="font-cinzel text-base font-bold text-sset-text">
              {school ? "Edit School" : "Add School"}
            </h2>
          </div>
          <button onClick={onClose} className="text-sset-muted hover:text-sset-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* School Name */}
          <div>
            <label className={labelClass}>School / Institution Name *</label>
            <input className={inputClass} value={form.name} onChange={set("name")} placeholder="e.g. Army Public School, Ernakulam" required />
          </div>

          {/* Round */}
          <div>
            <label className={labelClass}>Registration Round</label>
            <select className={inputClass} value={form.round_id} onChange={set("round_id")}>
              {INITIAL_ROUNDS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Price + Payment Link */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><DollarSign className="w-3 h-3 inline mr-1" />Price / Delegate (₹) *</label>
              <input className={inputClass} type="number" min="1" value={form.price_per_delegate} onChange={set("price_per_delegate")} placeholder="e.g. 999" required />
            </div>
            <div>
              <label className={labelClass}><Link2 className="w-3 h-3 inline mr-1" />Payment Link *</label>
              <input className={inputClass} type="url" value={form.payment_link} onChange={set("payment_link")} placeholder="https://forms.gle/..." required />
            </div>
          </div>

          {/* Coordinator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><User className="w-3 h-3 inline mr-1" />Coordinator Name</label>
              <input className={inputClass} value={form.coordinator_name} onChange={set("coordinator_name")} placeholder="Name" />
            </div>
            <div>
              <label className={labelClass}><Phone className="w-3 h-3 inline mr-1" />Coordinator Phone</label>
              <input className={inputClass} value={form.coordinator_phone} onChange={set("coordinator_phone")} placeholder="Phone / WhatsApp" />
            </div>
          </div>
          <div>
            <label className={labelClass}><Mail className="w-3 h-3 inline mr-1" />Coordinator Email</label>
            <input className={inputClass} type="email" value={form.coordinator_email} onChange={set("coordinator_email")} placeholder="coordinator@school.edu" />
          </div>

          {/* Google Sheet Link */}
          <div className="pt-1 border-t border-sset-border/50">
            <label className={labelClass}>Google Sheet Link (school&apos;s filled template)</label>
            <input
              className={inputClass}
              value={form.sheet_id}
              onChange={set("sheet_id")}
              placeholder="Paste full Google Sheets URL or Sheet ID"
            />
            <p className="mt-1 text-[10px] text-sset-muted">
              Leave blank for now — add once the school shares their filled sheet.
              Sheet must be publicly accessible or shared with your Google account.
            </p>
          </div>
          <div>
            <label className={labelClass}>Sheet Tab Name <span className="normal-case font-normal">(optional)</span></label>
            <input className={inputClass} value={form.sheet_name} onChange={set("sheet_name")} placeholder="e.g. Sheet1 (leave blank to use first sheet)" />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}><FileText className="w-3 h-3 inline mr-1" />Notes</label>
            <textarea className={inputClass + " resize-none"} rows={2} value={form.notes} onChange={set("notes")} placeholder="Any internal notes..." />
          </div>

          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-sset-muted hover:text-sset-text border border-sset-border rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-sset-gold text-sset-bg rounded-lg hover:bg-sset-goldLight transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {school ? "Save Changes" : "Add School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
