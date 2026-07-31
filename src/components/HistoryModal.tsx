'use client';

import React from 'react';
import { X, History, Shield, Calendar } from 'lucide-react';
import { Delegate, Allotment } from '@/lib/types';
import { INITIAL_ALLOTMENTS } from '@/lib/store';

interface HistoryModalProps {
  delegate: Delegate | null;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ delegate, onClose }) => {
  if (!delegate) return null;

  // Filter allotments history for delegate
  const history: Allotment[] = INITIAL_ALLOTMENTS.filter((a) => a.delegate_id === delegate.id);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sset-card border border-sset-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-sset-muted hover:text-sset-text">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-sset-gold" />
          <div>
            <h2 className="font-cinzel text-lg font-bold text-sset-gold">Allotment Audit Lineage</h2>
            <p className="text-xs text-sset-muted">Reallotment log history for {delegate.name}</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          {history.length === 0 ? (
            <div className="bg-sset-bg p-4 rounded-xl text-center text-sset-muted border border-sset-border">
              No previous reallotment records found for this delegate.
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  item.is_current
                    ? 'bg-sset-gold/10 border-sset-gold text-sset-text'
                    : 'bg-sset-bg border-sset-border text-sset-muted opacity-80'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-sset-gold text-sm">
                    {item.committee} – {item.country}
                  </span>
                  {item.is_current ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Active Current
                    </span>
                  ) : (
                    <span className="bg-sset-card text-sset-muted text-[10px] px-2 py-0.5 rounded-full">
                      Superseded
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-sset-muted">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-sset-gold" />
                    <span>Assigned by: {item.assigned_by}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sset-gold" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-sset-subtle italic pt-1 border-t border-sset-border/50">
                    "{item.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
