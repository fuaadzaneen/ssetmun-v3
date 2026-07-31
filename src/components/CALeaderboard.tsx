'use client';

import React, { useMemo } from 'react';
import { X, Award, Trophy, Users, ShieldCheck } from 'lucide-react';
import { Delegate, CampusAmbassador } from '@/lib/types';

interface CALeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  delegates: Delegate[];
  campusAmbassadors: CampusAmbassador[];
}

export const CALeaderboard: React.FC<CALeaderboardProps> = ({
  isOpen,
  onClose,
  delegates,
  campusAmbassadors,
}) => {
  if (!isOpen) return null;

  const leaderboardData = useMemo(() => {
    return campusAmbassadors.map((ca) => {
      const referred = delegates.filter((d) => d.resolved_ca_id === ca.id);
      const allotted = referred.filter((d) => d.status === 'Allotted' || d.status === 'Confirmed');
      return {
        ca,
        totalReferred: referred.length,
        totalAllotted: allotted.length,
        conversionRate: referred.length > 0 ? Math.round((allotted.length / referred.length) * 100) : 0,
      };
    }).sort((a, b) => b.totalReferred - a.totalReferred);
  }, [delegates, campusAmbassadors]);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sset-card border border-sset-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-sset-muted hover:text-sset-text">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-sset-gold" />
          <div>
            <h2 className="font-cinzel text-lg font-bold text-sset-gold">Campus Ambassador Leaderboard</h2>
            <p className="text-xs text-sset-muted">Performance tracking & resolved referral metrics</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-sset-bg border border-sset-border rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-sset-deep border-b border-sset-border text-sset-gold uppercase font-cinzel text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Campus Ambassador</th>
                <th className="py-2.5 px-4">College</th>
                <th className="py-2.5 px-4 text-center">Referrals</th>
                <th className="py-2.5 px-4 text-center">Allotted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sset-border/50">
              {leaderboardData.map((item, idx) => (
                <tr key={item.ca.id} className="hover:bg-sset-card/60 transition">
                  <td className="py-3 px-4 font-bold text-sset-gold">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-sset-text">{item.ca.name}</div>
                    <div className="text-[10px] text-sset-muted">Code: {item.ca.code}</div>
                  </td>
                  <td className="py-3 px-4 text-sset-subtle">{item.ca.college}</td>
                  <td className="py-3 px-4 text-center font-bold text-sm text-sset-gold">
                    {item.totalReferred}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-400">
                    {item.totalAllotted} ({item.conversionRate}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
