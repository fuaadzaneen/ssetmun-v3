'use client';

import React, { useState, useMemo } from 'react';
import { X, Send, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { Delegate, Round } from '../lib/types';
import { PRIORITY_EMAIL_TEMPLATE, MULTI_ROUND_EMAIL_TEMPLATE, hydrateTemplate } from '../lib/emailTemplates';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDelegates: Delegate[];
  activeRound: Round;
  onSendEmails: (data: { delegates: Delegate[]; templateType: string }) => Promise<void>;
}

export const EmailModal = ({ isOpen, onClose, targetDelegates, activeRound, onSendEmails }: EmailModalProps) => {
  if (!isOpen) return null;

  // Detect if ALL targets are school delegates — use school template by default
  const isSchoolBatch = targetDelegates.length > 0 && targetDelegates.every((d) => d.school_id);

  const [templateType, setTemplateType] = useState(
    isSchoolBatch ? 'school' : (activeRound.slug === 'priority' ? 'priority' : 'multi')
  );
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [forceResendConfirmed, setForceResendConfirmed] = useState(false);
  
  // By default, select all target delegates
  const [selectedDelegateIds, setSelectedDelegateIds] = useState<Set<string>>(
    new Set(targetDelegates.map(d => d.id))
  );

  const selectedDelegates = useMemo(() => {
    return targetDelegates.filter(d => selectedDelegateIds.has(d.id));
  }, [targetDelegates, selectedDelegateIds]);

  // Adjust preview to the currently selected active index if possible, otherwise first selected
  const activeDelegateId = targetDelegates[activePreviewIndex]?.id;
  const currentPreviewDelegate = selectedDelegateIds.has(activeDelegateId) 
    ? targetDelegates[activePreviewIndex] 
    : selectedDelegates[0];

  const alreadySentCount = useMemo(() => {
    return selectedDelegates.filter((d) => d.latest_email_status === 'sent' || d.latest_email_status === 'delivered').length;
  }, [selectedDelegates]);

  const previewHtml = useMemo(() => {
    if (!currentPreviewDelegate) return '';
    // 'school' reuses the multi-round template with feeSchoolFixed override
    const raw = (templateType === 'priority') ? PRIORITY_EMAIL_TEMPLATE : MULTI_ROUND_EMAIL_TEMPLATE;
    return hydrateTemplate(raw, {
      delegateName: currentPreviewDelegate.name,
      delegateEmail: currentPreviewDelegate.email,
      committee: currentPreviewDelegate.current_committee || 'UNGA-DISEC',
      country: currentPreviewDelegate.current_country || 'India',
      roundName: activeRound.name,
      passTier: currentPreviewDelegate.pass_tier || 'School Delegate',
      accommodation: currentPreviewDelegate.accommodation_required || 'No',
      foodPref: currentPreviewDelegate.food_preference || 'Non-Veg',
      travel: currentPreviewDelegate.travel_assistance || 'No',
      paymentDeadline: activeRound.deadline_date,
      paymentUrl: activeRound.fee_tiers[0]?.payment_url,
      feeDelegation: activeRound.fee_tiers.find((t) => t.name === 'Institutional Delegate')?.price,
      feeSchool: activeRound.fee_tiers.find((t) => t.name === 'School Delegate')?.price,
      feeIndividual: activeRound.fee_tiers.find((t) => t.name === 'Individual Delegate')?.price,
      feeSSETians: activeRound.fee_tiers.find((t) => t.name === 'Home Delegate')?.price,
      // When school template: use this delegate's fixed school price instead of the tier list
      feeSchoolFixed: templateType === 'school' ? (currentPreviewDelegate.school_price ?? undefined) : undefined,
    });
  }, [currentPreviewDelegate, templateType, activeRound]);

  const handleDispatch = async () => {
    if (alreadySentCount > 0 && !forceResendConfirmed) {
      alert(`Warning: ${alreadySentCount} recipient(s) have already received an allotment email. Please check the confirmation box to allow resending.`);
      return;
    }

    if (selectedDelegates.length === 0) {
      alert('Please select at least one delegate.');
      return;
    }

    setIsSending(true);
    await onSendEmails({ delegates: selectedDelegates, templateType });
    setIsSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-sset-card border border-sset-border rounded-2xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-sset-border flex items-center justify-between bg-sset-deep">
          <div>
            <h2 className="font-cinzel text-lg font-bold text-sset-gold">
              Email Dispatch Engine ({selectedDelegates.length} Selected)
            </h2>
            <p className="text-xs text-sset-muted">
              Live hydrated template preview & transactional dispatch tracking.
            </p>
          </div>
          <button onClick={onClose} className="text-sset-muted hover:text-sset-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left Column: Settings & Recipient List */}
          <div className="p-4 border-r border-sset-border bg-sset-bg space-y-4 overflow-y-auto text-xs">
            {/* Template Selector */}
            <div>
              <label className="block text-sset-gold font-bold mb-1 uppercase text-[10px] tracking-wider">
                Select Template
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full bg-sset-card border border-sset-border rounded-lg p-2 text-sset-text focus:outline-none focus:border-sset-gold font-medium"
              >
                <option value="priority">Priority Round Portfolio Allotment</option>
                <option value="multi">Round 1 &amp; 2 Portfolio + Logistics</option>
                <option value="school">School Delegation Allotment</option>
              </select>
              {templateType === 'school' && (
                <p className="mt-1 text-[10px] text-sset-muted">
                  Fee shown: each delegate&apos;s individual <strong className="text-sset-gold">school_price</strong> — no tier list.
                </p>
              )}
            </div>

            {/* Duplicate Send Guard Warning */}
            {alreadySentCount > 0 && (
              <div className="bg-amber-500/15 border border-amber-500/40 p-3 rounded-xl space-y-2 text-amber-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Duplicate Send Warning</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {alreadySentCount} out of {selectedDelegates.length} selected delegate(s) already received an email earlier.
                </p>
                <label className="flex items-center gap-2 text-[11px] pt-1 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceResendConfirmed}
                    onChange={(e) => setForceResendConfirmed(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Confirm resend anyway</span>
                </label>
              </div>
            )}

            {/* Recipient List Picker */}
            <div>
              <div className="flex items-center justify-between text-sset-muted mb-1 font-bold text-[10px] uppercase tracking-wider">
                <span>Recipients Preview ({selectedDelegates.length}/{targetDelegates.length})</span>
                <button
                  className="hover:text-sset-gold transition"
                  onClick={() => {
                    if (selectedDelegateIds.size === targetDelegates.length) {
                      setSelectedDelegateIds(new Set());
                    } else {
                      setSelectedDelegateIds(new Set(targetDelegates.map(d => d.id)));
                    }
                  }}
                >
                  {selectedDelegateIds.size === targetDelegates.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {targetDelegates.map((d, idx) => {
                  const isSelected = selectedDelegateIds.has(d.id);
                  return (
                    <div
                      key={d.id}
                      className={`w-full text-left p-2 rounded-lg border transition text-xs flex gap-2 items-center ${
                        activePreviewIndex === idx
                          ? 'bg-sset-gold/10 border-sset-gold/50'
                          : 'bg-sset-card border-sset-border hover:bg-sset-card/80'
                      } ${!isSelected && 'opacity-60'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSet = new Set(selectedDelegateIds);
                          if (e.target.checked) newSet.add(d.id);
                          else newSet.delete(d.id);
                          setSelectedDelegateIds(newSet);
                        }}
                        className="accent-sset-gold rounded w-4 h-4 cursor-pointer"
                      />
                      <button
                        onClick={() => setActivePreviewIndex(idx)}
                        className={`flex-1 flex justify-between items-center text-left ${activePreviewIndex === idx ? 'text-sset-gold font-semibold' : 'text-sset-text'}`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold text-xs">{d.name}</div>
                          <div className="text-[10px] text-sset-muted">{d.current_committee || 'Unallotted'}</div>
                        </div>
                        {d.latest_email_status === 'sent' && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                        {d.latest_email_status === 'failed' && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Hydrated HTML Email Preview */}
          <div className="col-span-2 bg-slate-950 flex flex-col overflow-hidden">
            <div className="p-2.5 bg-sset-deep border-b border-sset-border text-xs flex items-center justify-between text-sset-muted px-4">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-sset-gold" />
                <span>Live Email Preview: <strong className="text-sset-text">{currentPreviewDelegate?.name}</strong> ({currentPreviewDelegate?.email})</span>
              </div>
              <span className="text-[10px] text-sset-gold bg-sset-gold/20 px-2 py-0.5 rounded border border-sset-gold/30">
                Hydrated
              </span>
            </div>
            <div className="flex-1 w-full h-full p-2 bg-slate-900 overflow-hidden">
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                className="w-full h-full rounded border-0"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-sset-border flex items-center justify-between bg-sset-deep">
          <div className="text-xs text-sset-muted">
            Targeting <strong className="text-sset-gold">{selectedDelegates.length}</strong> recipient(s) via Transactional Mail Provider.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-lg border border-sset-border text-sset-muted hover:text-sset-text"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              disabled={isSending || selectedDelegates.length === 0 || (alreadySentCount > 0 && !forceResendConfirmed)}
              className="flex items-center gap-2 px-5 py-2 text-xs rounded-lg bg-sset-gold text-sset-bg font-bold hover:bg-sset-goldLight transition disabled:opacity-50 shadow-lg"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''}`} />
              <span>{isSending ? 'Dispatching Emails...' : `Dispatch ${selectedDelegates.length} Email(s)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
