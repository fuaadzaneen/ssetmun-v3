import React, { useState, useEffect } from 'react';
import { X, Save, Layers } from 'lucide-react';
import { Round } from '../lib/types';

interface RoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  round: Round;
  onSave: (updatedRound: Round) => void;
}

export const RoundSettingsModal: React.FC<RoundSettingsModalProps> = ({ isOpen, onClose, round, onSave }) => {
  const [formData, setFormData] = useState<Round>(round);

  useEffect(() => {
    setFormData(round);
  }, [round, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Round, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeeTierChange = (index: number, field: keyof Round['fee_tiers'][0], value: any) => {
    setFormData((prev) => {
      const newFeeTiers = [...prev.fee_tiers];
      newFeeTiers[index] = { ...newFeeTiers[index], [field]: value };
      return { ...prev, fee_tiers: newFeeTiers };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-sset-bg border border-sset-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-sset-border flex items-center justify-between bg-sset-deep">
          <div>
            <h2 className="font-cinzel text-lg font-bold text-sset-gold flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Edit Round Settings: {round.name}
            </h2>
            <p className="text-xs text-sset-muted mt-1">
              Configure payment links, pricing, and deadlines for {round.name} emails.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sset-card text-sset-muted hover:text-sset-text transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="round-settings-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="font-cinzel text-sm font-bold text-sset-text border-b border-sset-border pb-2">
                General
              </h3>
              <div>
                <label className="block text-xs font-semibold text-sset-muted uppercase tracking-wider mb-2">
                  Payment Deadline (Displayed in Email)
                </label>
                <input
                  type="text"
                  value={formData.deadline_date || ''}
                  onChange={(e) => handleChange('deadline_date', e.target.value)}
                  placeholder="e.g. 11:59 PM on 6th August, 2026"
                  className="w-full bg-sset-card border border-sset-border rounded-lg p-2.5 text-sm text-sset-text focus:outline-none focus:border-sset-gold transition"
                  required
                />
              </div>
            </div>

            {/* Fee Tiers */}
            <div className="space-y-4 pt-4">
              <h3 className="font-cinzel text-sm font-bold text-sset-text border-b border-sset-border pb-2">
                Fee Tiers & Payment Links
              </h3>
              
              <div className="space-y-4">
                {formData.fee_tiers.map((tier, idx) => (
                  <div key={idx} className="bg-sset-card p-4 rounded-xl border border-sset-border space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-sset-gold">{tier.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-semibold text-sset-muted uppercase tracking-wider mb-1.5">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => handleFeeTierChange(idx, 'price', Number(e.target.value))}
                          className="w-full bg-sset-bg border border-sset-border rounded-lg p-2 text-sm text-sset-text focus:outline-none focus:border-sset-gold transition"
                          required
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-semibold text-sset-muted uppercase tracking-wider mb-1.5">
                          Payment URL
                        </label>
                        <input
                          type="url"
                          value={tier.payment_url}
                          onChange={(e) => handleFeeTierChange(idx, 'payment_url', e.target.value)}
                          className="w-full bg-sset-bg border border-sset-border rounded-lg p-2 text-sm text-sset-text focus:outline-none focus:border-sset-gold transition"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sset-border flex items-center justify-end bg-sset-deep gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-sset-muted hover:text-sset-text transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="round-settings-form"
            className="flex items-center gap-2 px-5 py-2 text-xs rounded-lg bg-sset-gold text-sset-bg font-bold hover:bg-sset-goldLight transition shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
