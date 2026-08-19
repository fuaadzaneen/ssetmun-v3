'use client';

import React, { useState, useMemo } from 'react';
import { X, CheckCheck, Sparkles, ShieldCheck, Search } from 'lucide-react';
import { Delegate, CampusAmbassador } from '@/lib/types';
import { findBestCAMatches } from '@/lib/caMatcher';

interface CAResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  unresolvedDelegates: Delegate[];
  campusAmbassadors: CampusAmbassador[];
  onResolveCA: (data: { delegateId?: string; rawCaInput?: string; caId: string; isBulk: boolean }) => void;
}

export const CAResolutionModal: React.FC<CAResolutionModalProps> = ({
  isOpen,
  onClose,
  unresolvedDelegates,
  campusAmbassadors,
  onResolveCA,
}) => {
  if (!isOpen) return null;

  // Group delegates by raw_ca_input
  const groupedUnresolved = useMemo(() => {
    const map = new Map<string, Delegate[]>();
    unresolvedDelegates.forEach((d) => {
      const raw = d.raw_ca_input?.trim() || 'Unspecified';
      const existing = map.get(raw) || [];
      map.set(raw, [...existing, d]);
    });
    return Array.from(map.entries()).map(([rawInput, list]) => ({
      rawInput,
      count: list.length,
      delegates: list,
      suggestedCAs: findBestCAMatches(rawInput, campusAmbassadors, 3),
    }));
  }, [unresolvedDelegates, campusAmbassadors]);

  const [selectedCAMap, setSelectedCAMap] = useState<Record<string, string>>({});
  const [caSearchText, setCaSearchText] = useState('');

  const filteredCAs = useMemo(() => {
    if (!caSearchText.trim()) return campusAmbassadors;
    const q = caSearchText.toLowerCase();
    return campusAmbassadors.filter(
      (ca) =>
        ca.name.toLowerCase().includes(q) ||
        ca.code.toLowerCase().includes(q) ||
        ca.college.toLowerCase().includes(q)
    );
  }, [campusAmbassadors, caSearchText]);

  const handleSelectCA = (rawInput: string, caId: string) => {
    setSelectedCAMap((prev) => ({ ...prev, [rawInput]: caId }));
  };

  const handleResolveGroup = (rawInput: string, caId: string) => {
    if (!caId) return;
    onResolveCA({ rawCaInput: rawInput, caId, isBulk: true });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sset-card border border-sset-border rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-sset-border flex items-center justify-between bg-sset-deep">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-lg font-bold text-sset-gold">
                Campus Ambassador Code Resolver
              </h2>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                {unresolvedDelegates.length} Unresolved
              </span>
            </div>
            <p className="text-xs text-sset-muted">
              Map raw delegate inputs to canonical CA codes individually or in bulk.
            </p>
          </div>
          <button onClick={onClose} className="text-sset-muted hover:text-sset-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 border-b border-sset-border bg-sset-bg flex gap-4 flex-col sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sset-muted" />
            <input
              type="text"
              placeholder="Search Campus Ambassadors by name, code, or college to filter dropdowns..."
              value={caSearchText}
              onChange={(e) => setCaSearchText(e.target.value)}
              className="w-full bg-sset-card border border-sset-border rounded-lg pl-9 pr-4 py-2 text-xs text-sset-text focus:outline-none focus:border-sset-gold transition"
            />
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs bg-sset-bg/50">
          {groupedUnresolved.length === 0 ? (
            <div className="text-center py-12 text-sset-muted">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-sset-text">All Campus Ambassador codes resolved!</p>
              <p className="text-[11px] text-sset-muted">Every delegate record is properly attributed.</p>
            </div>
          ) : (
            groupedUnresolved.map((group) => {
              const selectedCAId = selectedCAMap[group.rawInput] || group.suggestedCAs[0]?.ca.id || '';

              return (
                <div
                  key={group.rawInput}
                  className="bg-sset-bg border border-sset-border p-4 rounded-xl space-y-3 hover:border-sset-gold/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sset-gold text-sm">
                        Raw Input: "{group.rawInput}"
                      </span>
                      <span className="bg-sset-card border border-sset-border text-sset-subtle px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {group.count} delegate{group.count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResolveGroup(group.rawInput, selectedCAId)}
                      disabled={!selectedCAId}
                      className="flex items-center gap-1 bg-sset-gold text-sset-bg font-bold px-3 py-1.5 rounded-lg hover:bg-sset-goldLight transition disabled:opacity-50 text-xs"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Apply to all {group.count}</span>
                    </button>
                  </div>

                  {/* Auto-suggestions badges */}
                  {group.suggestedCAs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <div className="flex items-center gap-1 text-[10px] text-sset-muted font-bold">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>AI Suggestions:</span>
                      </div>
                      {group.suggestedCAs.map((sug) => (
                        <button
                          key={sug.ca.id}
                          onClick={() => handleSelectCA(group.rawInput, sug.ca.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition ${
                            selectedCAId === sug.ca.id
                              ? 'bg-sset-gold/20 text-sset-gold border-sset-gold'
                              : 'bg-sset-card text-sset-muted border-sset-border hover:text-sset-text'
                          }`}
                        >
                          {sug.ca.code} – {sug.ca.name} ({sug.ca.college})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Manual CA Dropdown Select */}
                  <div className="pt-1">
                    <select
                      value={selectedCAId}
                      onChange={(e) => handleSelectCA(group.rawInput, e.target.value)}
                      className="w-full bg-sset-card border border-sset-border rounded-lg p-2 text-sset-text focus:outline-none focus:border-sset-gold"
                    >
                      <option value="">Select canonical CA...</option>
                      {filteredCAs.map((ca) => (
                        <option key={ca.id} value={ca.id}>
                          {ca.code} – {ca.name} ({ca.college})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
