'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle, Clock, AlertTriangle, Send, Edit, History, ShieldCheck, UserX } from 'lucide-react';
import { Delegate, CampusAmbassador } from '@/lib/types';
import { normalizeCommitteeName } from '@/lib/committees';

interface DelegateTableProps {
  delegates: Delegate[];
  campusAmbassadors: CampusAmbassador[];
  onOpenAllotment: (delegate: Delegate) => void;
  onSendSingleEmail: (delegate: Delegate) => void;
  onViewHistory: (delegate: Delegate) => void;
  onResolveCA: (delegate: Delegate) => void;
  onTogglePayment: (delegateId: string) => void;
}

export const DelegateTable: React.FC<DelegateTableProps> = ({
  delegates,
  campusAmbassadors,
  onOpenAllotment,
  onSendSingleEmail,
  onViewHistory,
  onResolveCA,
  onTogglePayment,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [caFilter, setCaFilter] = useState<string>('all');
  const [accomFilter, setAccomFilter] = useState<string>('all');
  const [transFilter, setTransFilter] = useState<string>('all');

  const filteredDelegates = useMemo(() => {
    return delegates.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase()) ||
        d.college.toLowerCase().includes(search.toLowerCase()) ||
        (d.raw_ca_input && d.raw_ca_input.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || d.delegation_type === categoryFilter;
      const matchCa =
        caFilter === 'all' ||
        (caFilter === 'unresolved' && !d.resolved_ca_id) ||
        (caFilter === 'resolved' && Boolean(d.resolved_ca_id));
      const matchAccom = accomFilter === 'all' || d.accommodation_required === accomFilter;
      const matchTrans = transFilter === 'all' || d.travel_assistance === transFilter;

      return matchSearch && matchStatus && matchCategory && matchCa && matchAccom && matchTrans;
    });
  }, [delegates, search, statusFilter, categoryFilter, caFilter, accomFilter, transFilter]);

  const getResolvedCAName = (caId?: string | null) => {
    if (!caId) return null;
    return campusAmbassadors.find((ca) => ca.id === caId);
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search Toolbar */}
      <div className="bg-sset-card p-4 rounded-xl border border-sset-border flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-sset-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, college, CA code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sset-bg border border-sset-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-sset-text placeholder:text-sset-muted focus:outline-none focus:border-sset-gold transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-sset-muted">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-sset-bg border border-sset-border text-sset-text text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sset-gold"
          >
            <option value="all">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="Allotted">Allotted</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-sset-bg border border-sset-border text-sset-text text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sset-gold"
          >
            <option value="all">All Categories</option>
            <option value="Institutional">Institutional</option>
            <option value="Single Delegate">Single Delegate</option>
          </select>

          <select
            value={caFilter}
            onChange={(e) => setCaFilter(e.target.value)}
            className="bg-sset-bg border border-sset-border text-sset-text text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sset-gold"
          >
            <option value="all">All CA Status</option>
            <option value="unresolved">Unresolved CA Code</option>
            <option value="resolved">Resolved CA Code</option>
          </select>

          <select
            value={accomFilter}
            onChange={(e) => setAccomFilter(e.target.value)}
            className="bg-sset-bg border border-sset-border text-sset-text text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sset-gold"
          >
            <option value="all">Accommodation</option>
            <option value="Yes">Acc: Yes</option>
            <option value="No">Acc: No</option>
          </select>

          <select
            value={transFilter}
            onChange={(e) => setTransFilter(e.target.value)}
            className="bg-sset-bg border border-sset-border text-sset-text text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sset-gold"
          >
            <option value="all">Transport</option>
            <option value="Yes">Trans: Yes</option>
            <option value="No">Trans: No</option>
          </select>
        </div>
      </div>

      {/* High Density Table Container */}
      <div className="bg-sset-card rounded-xl border border-sset-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-sset-deep border-b border-sset-border text-sset-gold uppercase font-cinzel tracking-wider text-[11px]">
                <th className="py-3 px-4 sticky left-0 z-20 bg-sset-deep sticky-col-shadow min-w-[200px]">
                  Delegate Name
                </th>
                <th className="py-3 px-4 min-w-[220px]">Contact & College</th>
                <th className="py-3 px-4 min-w-[130px]">Delegation</th>
                <th className="py-3 px-4 min-w-[140px]">Logistics & Payment</th>
                <th className="py-3 px-4 min-w-[180px]">CA Code (Raw vs Resolved)</th>
                <th className="py-3 px-4 min-w-[180px]">Preferences</th>
                <th className="py-3 px-4 min-w-[180px]">Current Allotment</th>
                <th className="py-3 px-4 min-w-[110px]">Status</th>
                <th className="py-3 px-4 min-w-[120px]">Email Status</th>
                <th className="py-3 px-4 text-right min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sset-border/50">
              {filteredDelegates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-sset-muted text-xs">
                    No delegate records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredDelegates.map((d) => {
                  const resolvedCA = getResolvedCAName(d.resolved_ca_id);
                  return (
                    <tr key={d.id} className="hover:bg-sset-bg/50 transition">
                      {/* Sticky First Column */}
                      <td className="py-3 px-4 sticky left-0 z-10 bg-sset-card sticky-col-shadow">
                        <div className="font-semibold text-sset-text text-sm">{d.name}</div>
                        <div className="text-[11px] text-sset-muted">{d.email}</div>
                      </td>

                      {/* Contact & College */}
                      <td className="py-3 px-4">
                        <div className="text-sset-subtle font-medium">{d.college}</div>
                        <div className="text-[11px] text-sset-muted">{d.course || 'N/A'} · WA: {d.whatsapp}</div>
                      </td>

                      {/* Delegation */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-sset-border bg-sset-bg text-sset-subtle">
                          {d.delegation_type}
                        </span>
                      </td>

                      {/* Logistics & Payment */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 text-[10px] font-semibold">
                          <span 
                            onClick={() => onTogglePayment(d.id)}
                            className={`px-2 py-0.5 rounded-md w-max cursor-pointer transition-colors ${d.payment_status === 'Paid' ? 'bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'}`} 
                            title="Click to toggle Payment Status"
                          >
                            {d.payment_status === 'Paid' ? '₹ Paid' : '₹ Pending'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md w-max ${d.accommodation_required === 'Yes' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-sset-bg text-sset-muted border border-sset-border'}`}>Acc: {d.accommodation_required || 'No'}</span>
                          <span className={`px-2 py-0.5 rounded-md w-max ${d.travel_assistance === 'Yes' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-sset-bg text-sset-muted border border-sset-border'}`}>Trans: {d.travel_assistance || 'No'}</span>
                          <span className="px-2 py-0.5 rounded-md w-max bg-sset-bg text-sset-subtle border border-sset-border">{d.food_preference || 'N/A'}</span>
                        </div>
                      </td>

                      {/* CA Code */}
                      <td className="py-3 px-4">
                        {resolvedCA ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{resolvedCA.code} ({resolvedCA.name})</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-amber-400 italic text-[11px] truncate max-w-[110px]" title={d.raw_ca_input || 'None'}>
                              Raw: "{d.raw_ca_input || 'None'}"
                            </span>
                            <button
                              onClick={() => onResolveCA(d)}
                              className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded hover:bg-amber-500/30 transition"
                            >
                              Resolve
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Preferences */}
                      <td className="py-3 px-4">
                        {d.committee_preferences && d.committee_preferences.length > 0 ? (
                          <div className="space-y-2 text-[11px]">
                            {d.committee_preferences.map((pref, idx) => (
                              <div key={idx} className="bg-sset-bg p-1.5 rounded border border-sset-border">
                                <span className="font-semibold text-sset-gold">#{idx + 1} {normalizeCommitteeName(pref.committee)}</span>
                                <span className="text-sset-muted block truncate max-w-[160px] mt-0.5">
                                  {pref.portfolios.join(', ') || 'No portfolio'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sset-muted text-[11px]">No preferences</span>
                        )}
                      </td>

                      {/* Allotment */}
                      <td className="py-3 px-4">
                        {d.current_committee ? (
                          <div className="bg-sset-deep/80 border border-sset-gold/40 p-1.5 rounded-md">
                            <div className="font-bold text-sset-gold text-xs">{d.current_committee}</div>
                            <div className="text-sset-text text-[11px] font-medium">{d.current_country}</div>
                          </div>
                        ) : (
                          <span className="text-amber-400/80 italic text-[11px]">Unallotted</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'Allotted'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : d.status === 'Confirmed'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>

                      {/* Email Status */}
                      <td className="py-3 px-4">
                        {d.latest_email_status === 'sent' || d.latest_email_status === 'delivered' ? (
                          <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Sent</span>
                          </div>
                        ) : d.latest_email_status === 'failed' ? (
                          <div 
                            className="flex items-center gap-1 text-rose-400 text-[11px] font-semibold cursor-help"
                            title={d.latest_email_error || 'Email failed to send. Check logs.'}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-sset-muted text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAllotment(d)}
                            title="Allot / Reallot Portfolio"
                            className="p-1.5 bg-sset-bg hover:bg-sset-gold hover:text-sset-bg text-sset-gold border border-sset-gold/40 rounded transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onSendSingleEmail(d)}
                            title="Send Portfolio Email"
                            className="p-1.5 bg-sset-bg hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/40 rounded transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onViewHistory(d)}
                            title="View Allotment History"
                            className="p-1.5 bg-sset-bg hover:bg-sset-muted hover:text-white text-sset-muted border border-sset-border rounded transition"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
