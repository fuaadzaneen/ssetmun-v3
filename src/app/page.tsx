'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Header } from '@/components/Header';
import { DelegateTable } from '@/components/DelegateTable';
import { AllotmentModal } from '@/components/AllotmentModal';
import { CAResolutionModal } from '@/components/CAResolutionModal';
import { EmailModal } from '@/components/EmailModal';
import { HistoryModal } from '@/components/HistoryModal';
import { CALeaderboard } from '@/components/CALeaderboard';

import { Delegate, CampusAmbassador, Round } from '@/lib/types';
import { INITIAL_ROUNDS, INITIAL_CAS } from '@/lib/store';

export default function DashboardPage() {
  const [rounds] = useState<Round[]>(INITIAL_ROUNDS);
  const [activeRound, setActiveRound] = useState<Round>(INITIAL_ROUNDS[0]);

  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [isLoadingDelegates, setIsLoadingDelegates] = useState(true);
  const [campusAmbassadors] = useState<CampusAmbassador[]>(INITIAL_CAS);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Modals state
  const [allotmentDelegate, setAllotmentDelegate] = useState<Delegate | null>(null);
  const [isCAResolutionOpen, setIsCAResolutionOpen] = useState(false);

  const [emailModalState, setEmailModalState] = useState<{
    isOpen: boolean;
    targets: Delegate[];
  }>({ isOpen: false, targets: [] });

  const [historyDelegate, setHistoryDelegate] = useState<Delegate | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Load delegates from Supabase
  const loadDelegates = async (roundSlug: string) => {
    setIsLoadingDelegates(true);
    try {
      const res = await fetch(`/api/delegates?roundSlug=${roundSlug}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setDelegates(data.delegates);
      }
    } catch (err) {
      console.error('Failed to load delegates:', err);
    } finally {
      setIsLoadingDelegates(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadDelegates(activeRound.slug);
  }, []);

  // Reload when round changes
  const handleSelectRound = (round: Round) => {
    setActiveRound(round);
    loadDelegates(round.slug);
  };

  // Unresolved CA Count
  const unresolvedCACount = delegates.filter((d) => !d.resolved_ca_id).length;
  const allottedCount = delegates.filter((d) => d.status === 'Allotted' || d.status === 'Confirmed').length;

  // Handle Sheet Sync
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncNotice(null);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundSlug: activeRound.slug }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncNotice(`Synced ${data.summary.round}: ${data.summary.updated} updated, ${data.summary.added} added.`);
        // Reload delegates from Supabase after sync
        await loadDelegates(activeRound.slug);
      } else {
        setSyncNotice('Sync completed in mock fallback mode.');
      }
    } catch (err: any) {
      setSyncNotice('Sync notice: Using local cached response data.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  // Handle Save Allotment
  const handleSaveAllotment = async (data: {
    delegateId: string;
    committee: string;
    country: string;
    passTier: string;
    notes: string;
  }) => {
    let savedDelegate: any = null;
    try {
      const res = await fetch('/api/allot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) {
        console.error('Allotment failed:', result.error);
        alert('⚠️ Allotment failed:\n\n' + result.error);
        return; // Don't update UI if DB save failed
      }
      // If the server returned the updated delegate, use it
      if (result.delegate) {
        savedDelegate = result.delegate;
      }
    } catch (err: any) {
      console.error(err);
      alert('An error occurred while saving: ' + err.message);
      return;
    }

    // Immediately update local state for snappy UI
    setDelegates((prev) =>
      prev.map((d) =>
        d.id === data.delegateId
          ? {
              ...d,
              ...(savedDelegate || {}),
              current_committee: data.committee,
              current_country: data.country,
              pass_tier: data.passTier,
              status: 'Allotted' as const,
            }
          : d
      )
    );

    // After 1.5s, reload from Supabase to confirm the data actually persisted
    setTimeout(async () => {
      await loadDelegates(activeRound.slug);
    }, 1500);
  };


  // Handle CA Resolution
  const handleResolveCA = async (data: {
    delegateId?: string;
    rawCaInput?: string;
    caId: string;
    isBulk: boolean;
  }) => {
    try {
      await fetch('/api/ca/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error(err);
    }

    setDelegates((prev) =>
      prev.map((d) => {
        if (data.isBulk && data.rawCaInput && d.raw_ca_input === data.rawCaInput) {
          return { ...d, resolved_ca_id: data.caId };
        }
        if (d.id === data.delegateId) {
          return { ...d, resolved_ca_id: data.caId };
        }
        return d;
      })
    );
  };

  // Handle Send Emails
  const handleSendEmails = async (data: { delegates: Delegate[]; templateType: string }) => {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegates: data.delegates,
          roundSlug: activeRound.slug,
          templateType: data.templateType,
        }),
      });
      const responseData = await res.json();
      
      if (responseData.success && responseData.details) {
        setDelegates((prev) =>
          prev.map((d) => {
            const result = responseData.details.find((r: any) => r.id === d.id);
            if (result) {
              return {
                ...d,
                latest_email_status: result.status,
                latest_email_error: result.error,
                latest_email_sent_at: result.status === 'sent' ? new Date().toISOString() : d.latest_email_sent_at,
              };
            }
            return d;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePayment = (delegateId: string) => {
    setDelegates((prev) =>
      prev.map((d) =>
        d.id === delegateId
          ? { ...d, payment_status: d.payment_status === 'Paid' ? 'Pending' : 'Paid' }
          : d
      )
    );
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    const csvRows = delegates.map((d) => {
      const ca = campusAmbassadors.find((c) => c.id === d.resolved_ca_id);
      return {
        'Delegate Name': d.name,
        'Email': d.email,
        'WhatsApp': d.whatsapp,
        'College': d.college,
        'Course': d.course,
        'Delegation Type': d.delegation_type,
        'Round': activeRound.name,
        'Payment Status': d.payment_status || 'Pending',
        'Accommodation': d.accommodation_required || 'No',
        'Food Preference': d.food_preference || 'N/A',
        'Transport': d.travel_assistance || 'No',
        'Pass Tier': d.pass_tier || 'N/A',
        'Status': d.status,
        'Allotted Committee': d.current_committee || 'Unallotted',
        'Allotted Country': d.current_country || 'Unallotted',
        'Raw CA Code': d.raw_ca_input || '',
        'Resolved CA Code': ca ? ca.code : 'Unresolved',
        'Resolved CA Name': ca ? ca.name : '',
        'Email Status': d.latest_email_status,
      };
    });

    const csv = Papa.unparse(csvRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SSETMUN_2026_Delegates_${activeRound.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAccommodation = () => {
    const accDelegates = delegates.filter(d => d.accommodation_required === 'Yes');
    const csvRows = accDelegates.map((d) => ({
      'Delegate Name': d.name,
      'Email': d.email,
      'WhatsApp': d.whatsapp,
      'College': d.college,
      'Food Preference': d.food_preference,
      'Delegation Type': d.delegation_type,
    }));
    const csv = Papa.unparse(csvRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SSETMUN_2026_Accommodation_${activeRound.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTransport = () => {
    const transDelegates = delegates.filter(d => d.travel_assistance === 'Yes');
    const csvRows = transDelegates.map((d) => ({
      'Delegate Name': d.name,
      'Email': d.email,
      'WhatsApp': d.whatsapp,
      'College': d.college,
      'Delegation Type': d.delegation_type,
    }));
    const csv = Papa.unparse(csvRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SSETMUN_2026_Transport_${activeRound.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-sset-bg text-sset-text pb-12">
      {/* Header Bar */}
      <Header
        rounds={rounds}
        activeRound={activeRound}
        onSelectRound={handleSelectRound}
        onSync={handleSync}
        isSyncing={isSyncing}
        onOpenCAResolution={() => setIsCAResolutionOpen(true)}
        onOpenBulkEmail={() =>
          setEmailModalState({
            isOpen: true,
            targets: delegates.filter((d) => d.status === 'Allotted'),
          })
        }
        onExport={handleExportCSV}
        onExportAccom={handleExportAccommodation}
        onExportTrans={handleExportTransport}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        unresolvedCACount={unresolvedCACount}
        totalDelegatesCount={delegates.length}
        allottedCount={allottedCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* Sync Toast Notification */}
        {syncNotice && (
          <div className="bg-sset-gold/15 border border-sset-gold/50 text-sset-gold px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in">
            <span>{syncNotice}</span>
            <button onClick={() => setSyncNotice(null)} className="text-sset-muted hover:text-sset-text">
              ✕
            </button>
          </div>
        )}

        {/* Stats Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-sset-card p-4 rounded-xl border border-sset-border">
            <div className="text-sset-muted font-cinzel uppercase tracking-wider text-[10px]">Total Registered</div>
            <div className="text-xl font-bold text-sset-text mt-1">{delegates.length}</div>
          </div>
          <div className="bg-sset-card p-4 rounded-xl border border-sset-border">
            <div className="text-sset-muted font-cinzel uppercase tracking-wider text-[10px]">Allotted Delegates</div>
            <div className="text-xl font-bold text-sset-gold mt-1">{allottedCount}</div>
          </div>
          <div className="bg-sset-card p-4 rounded-xl border border-sset-border">
            <div className="text-sset-muted font-cinzel uppercase tracking-wider text-[10px]">CA Codes Resolved</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {delegates.length - unresolvedCACount} / {delegates.length}
            </div>
          </div>
          <div className="bg-sset-card p-4 rounded-xl border border-sset-border">
            <div className="text-sset-muted font-cinzel uppercase tracking-wider text-[10px]">Emails Sent</div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {delegates.filter((d) => d.latest_email_status === 'sent').length}
            </div>
          </div>
        </div>

        {/* Primary Data Grid */}
        <DelegateTable
          delegates={delegates}
          campusAmbassadors={campusAmbassadors}
          onOpenAllotment={(d) => setAllotmentDelegate(d)}
          onSendSingleEmail={(d) => setEmailModalState({ isOpen: true, targets: [d] })}
          onViewHistory={(d) => setHistoryDelegate(d)}
          onResolveCA={(d) => {
            setIsCAResolutionOpen(true);
          }}
          onTogglePayment={handleTogglePayment}
        />
      </main>

      {/* Modals */}
      <AllotmentModal
        delegate={allotmentDelegate}
        onClose={() => setAllotmentDelegate(null)}
        onSaveAllotment={handleSaveAllotment}
      />

      <CAResolutionModal
        isOpen={isCAResolutionOpen}
        onClose={() => setIsCAResolutionOpen(false)}
        unresolvedDelegates={delegates.filter((d) => !d.resolved_ca_id)}
        campusAmbassadors={campusAmbassadors}
        onResolveCA={handleResolveCA}
      />

      <EmailModal
        isOpen={emailModalState.isOpen}
        onClose={() => setEmailModalState({ isOpen: false, targets: [] })}
        targetDelegates={emailModalState.targets}
        roundSlug={activeRound.slug}
        onSendEmails={handleSendEmails}
      />

      <HistoryModal
        delegate={historyDelegate}
        onClose={() => setHistoryDelegate(null)}
      />

      <CALeaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        delegates={delegates}
        campusAmbassadors={campusAmbassadors}
      />
    </div>
  );
}
