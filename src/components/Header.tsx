'use client';

import React from 'react';
import { RefreshCw, Download, UserCheck, Award, Mail, Layers } from 'lucide-react';
import { Round } from '@/lib/types';

interface HeaderProps {
  rounds: Round[];
  activeRound: Round;
  onSelectRound: (round: Round) => void;
  onSync: () => void;
  isSyncing: boolean;
  onOpenCAResolution: () => void;
  onOpenBulkEmail: () => void;
  onOpenRoundSettings: () => void;
  onExport: () => void;
  onExportAccom: () => void;
  onExportTrans: () => void;
  onOpenLeaderboard: () => void;
  unresolvedCACount: number;
  totalDelegatesCount: number;
  allottedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  rounds,
  activeRound,
  onSelectRound,
  onSync,
  isSyncing,
  onOpenCAResolution,
  onOpenBulkEmail,
  onOpenRoundSettings,
  onExport,
  onExportAccom,
  onExportTrans,
  onOpenLeaderboard,
  unresolvedCACount,
  totalDelegatesCount,
  allottedCount,
}) => {
  return (
    <header className="border-b border-sset-border bg-sset-card/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Round Selectors */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-sset-gold flex-shrink-0 bg-sset-deep flex items-center justify-center shadow-lg">
            <img src="https://i.ibb.co/ksY274mG/SSET-MUN-pfp.png" alt="SSET MUN" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-lg font-bold text-sset-text tracking-wider">
                SSET MUN 2026
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-sset-gold/20 text-sset-gold border border-sset-gold/40 px-2 py-0.5 rounded-full">
                v3 Admin
              </span>
            </div>
            <p className="text-xs text-sset-muted">Delegate Allotment & Operations Portal</p>
          </div>
        </div>

        {/* Round Tabs */}
        <div className="flex items-center bg-sset-bg/90 p-1 rounded-xl border border-sset-border">
          {rounds.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRound(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeRound.slug === r.slug
                  ? 'bg-sset-gold text-sset-bg font-bold shadow-md'
                  : 'text-sset-muted hover:text-sset-text'
              }`}
            >
              {r.name}
            </button>
          ))}
          <button
            onClick={onOpenRoundSettings}
            className="p-1.5 ml-2 rounded-lg text-sset-muted hover:text-sset-gold hover:bg-sset-gold/10 transition-all border border-transparent hover:border-sset-gold/30"
            title="Edit Round Settings"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sset-bg hover:bg-sset-card text-sset-gold border border-sset-gold/60 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Sheet'}</span>
          </button>

          {/* CA Resolution Button */}
          <button
            onClick={onOpenCAResolution}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sset-bg hover:bg-sset-card text-sset-text border border-sset-border transition-all relative"
          >
            <UserCheck className="w-3.5 h-3.5 text-sset-gold" />
            <span>CA Resolver</span>
            {unresolvedCACount > 0 && (
              <span className="ml-1 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {unresolvedCACount}
              </span>
            )}
          </button>

          {/* Bulk Email Button */}
          <button
            onClick={onOpenBulkEmail}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sset-bg hover:bg-sset-card text-sset-text border border-sset-border transition-all"
          >
            <Mail className="w-3.5 h-3.5 text-sset-gold" />
            <span>Bulk Email</span>
          </button>

          {/* CA Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sset-bg hover:bg-sset-card text-sset-text border border-sset-border transition-all"
          >
            <Award className="w-3.5 h-3.5 text-sset-gold" />
            <span>Leaderboard</span>
          </button>

          {/* CSV Export */}
          <div className="flex gap-1.5 items-center">
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sset-gold text-sset-bg hover:bg-sset-goldLight font-bold transition-all shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All</span>
            </button>
            <button
              onClick={onExportAccom}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all shadow"
              title="Export Accommodation List"
            >
              Acc
            </button>
            <button
              onClick={onExportTrans}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all shadow"
              title="Export Transport List"
            >
              Trans
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
