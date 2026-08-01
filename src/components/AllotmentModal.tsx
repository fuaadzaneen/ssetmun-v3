'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Eye, Loader2 } from 'lucide-react';
import { Delegate } from '@/lib/types';
import { COMMITTEES, normalizeCommitteeName } from '@/lib/committees';

interface AllotmentModalProps {
  delegate: Delegate | null;
  onClose: () => void;
  onSaveAllotment: (data: {
    delegateId: string;
    committee: string;
    country: string;
    passTier: string;
    notes: string;
  }) => Promise<void>;
}

export const AllotmentModal: React.FC<AllotmentModalProps> = ({
  delegate,
  onClose,
  onSaveAllotment,
}) => {
  const [committee, setCommittee] = useState('UNGA-DISEC');
  const [country, setCountry] = useState('');
  const [passTier, setPassTier] = useState('Institutional Delegate');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Re-initialize form every time the delegate changes
  // This fixes the stale-state bug where opening a different delegate
  // would show the previous delegate's values
  useEffect(() => {
    if (delegate) {
      // Normalize the preference committee name in case it's an old full-name from the Google Form
      const firstPrefCommittee = delegate.committee_preferences?.[0]?.committee;
      setCommittee(
        delegate.current_committee ||
          (firstPrefCommittee ? normalizeCommitteeName(firstPrefCommittee) : null) ||
          'UNGA-DISEC'
      );
      setCountry(
        delegate.current_country ||
          delegate.committee_preferences?.[0]?.portfolios?.[0] ||
          ''
      );
      setPassTier(delegate.pass_tier || 'Institutional Delegate');
      setNotes('');
    }
  }, [delegate?.id]); // only re-run when the delegate ID actually changes

  if (!delegate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!committee || !country) return;
    setIsSaving(true);
    try {
      await onSaveAllotment({
        delegateId: delegate.id,
        committee,
        country,
        passTier,
        notes,
      });
      onClose(); // Only close AFTER save succeeds
    } catch {
      // error already shown by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sset-card border border-sset-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 text-sset-muted hover:text-sset-text disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="font-cinzel text-lg font-bold text-sset-gold">
            {delegate.current_committee ? 'Reallot Portfolio' : 'Allot Committee & Country'}
          </h2>
          <p className="text-xs text-sset-muted">
            Assigning portfolio for <span className="text-sset-text font-semibold">{delegate.name}</span> ({delegate.college})
          </p>
          <p className="text-[10px] text-sset-muted/60 mt-0.5 font-mono">ID: {delegate.id}</p>
        </div>

        {/* Delegate Preferences Box */}
        {delegate.committee_preferences && delegate.committee_preferences.length > 0 && (
          <div className="bg-sset-bg p-3 rounded-xl border border-sset-border text-xs space-y-1.5">
            <div className="flex items-center gap-1 text-sset-gold font-bold uppercase tracking-wider text-[10px]">
              <Eye className="w-3.5 h-3.5" />
              <span>Submitted Preferences:</span>
            </div>
            {delegate.committee_preferences.map((pref, idx) => {
              const displayCommittee = normalizeCommitteeName(pref.committee);
              return (
                <div key={idx} className="flex justify-between items-center text-sset-subtle bg-sset-card/60 p-2 rounded border border-sset-border/50">
                  <span className="font-semibold text-sset-gold">{displayCommittee}:</span>
                  <span className="text-sset-text font-medium">{pref.portfolios.join(', ') || 'No portfolio list'}</span>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Committee Select */}
          <div>
            <label className="block text-sset-muted font-medium mb-1 uppercase text-[10px] tracking-wider">
              Committee
            </label>
            <select
              value={committee}
              onChange={(e) => setCommittee(e.target.value)}
              disabled={isSaving}
              className="w-full bg-sset-bg border border-sset-border rounded-lg p-2.5 text-sset-text focus:outline-none focus:border-sset-gold disabled:opacity-60"
            >
              {COMMITTEES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Country / Portfolio Input */}
          <div>
            <label className="block text-sset-muted font-medium mb-1 uppercase text-[10px] tracking-wider">
              Country / Portfolio
            </label>
            <input
              type="text"
              placeholder="e.g. France, India, Journalist"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isSaving}
              className="w-full bg-sset-bg border border-sset-border rounded-lg p-2.5 text-sset-text placeholder:text-sset-muted focus:outline-none focus:border-sset-gold disabled:opacity-60"
              required
            />
          </div>

          {/* Pass Tier */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sset-muted font-medium uppercase text-[10px] tracking-wider">
                Pass Tier
              </label>
              <span className="text-[10px] text-sset-gold font-semibold bg-sset-gold/10 px-2 py-0.5 rounded border border-sset-gold/30">
                Type: {delegate.delegation_type}
              </span>
            </div>
            <select
              value={passTier}
              onChange={(e) => setPassTier(e.target.value)}
              disabled={isSaving}
              className="w-full bg-sset-bg border border-sset-border rounded-lg p-2.5 text-sset-text focus:outline-none focus:border-sset-gold disabled:opacity-60"
            >
              <option value="Individual Delegate">Individual Delegate (₹1299)</option>
              <option value="School Delegate">School Delegate (₹1199)</option>
              <option value="Other Delegate">Other Delegate (₹1199)</option>
              <option value="Home Delegate">Home Delegate (₹999)</option>
              <option value="Institutional Delegate">Institutional Delegate (₹999)</option>
            </select>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-sset-muted font-medium mb-1 uppercase text-[10px] tracking-wider">
              Allotment Notes (Audit Log)
            </label>
            <textarea
              placeholder="e.g. Allotted 1st choice / Reallotted after drop"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSaving}
              rows={2}
              className="w-full bg-sset-bg border border-sset-border rounded-lg p-2.5 text-sset-text placeholder:text-sset-muted focus:outline-none focus:border-sset-gold resize-none disabled:opacity-60"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-sset-border text-sset-muted hover:text-sset-text disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sset-gold text-sset-bg font-bold hover:bg-sset-goldLight transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Allotment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
