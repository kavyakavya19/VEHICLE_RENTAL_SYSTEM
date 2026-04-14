'use client';

import React from 'react';
import { X } from 'lucide-react';

export const PaymentBreakdownModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const rental = parseFloat(booking.rental_amount || 0);
  const deposit = parseFloat(booking.security_deposit || 0);
  const fine = parseFloat(booking.fine_amount || 0);
  const damage = parseFloat(booking.damage_charge || 0);
  const total = parseFloat(booking.total_price || 0);
  const refund = parseFloat(booking.refund_amount || 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Payment Breakdown</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-zinc-400">Rental Cost</span>
            <span className="text-white font-medium">₹{rental.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-zinc-400">Security Deposit</span>
            <span className="text-white font-medium">₹{deposit.toLocaleString('en-IN')}</span>
          </div>

          {fine > 0 && (
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-red-400">Fine Amount</span>
              <span className="text-red-400 font-medium">₹{fine.toLocaleString('en-IN')}</span>
            </div>
          )}

          {damage > 0 && (
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-red-400">Damage Charges</span>
              <span className="text-red-400 font-medium">₹{damage.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-white">Total Paid</span>
            <span className="text-xl font-bold text-[#10B981]">₹{total.toLocaleString('en-IN')}</span>
          </div>

          {refund > 0 && (
            <div className="mt-6 pt-4 border-t border-dashed border-white/20">
              <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-400 font-semibold">Net Refund</span>
                <span className="text-emerald-400 font-bold text-lg">₹{refund.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 text-center uppercase tracking-widest font-bold">
                {booking.deposit_refunded ? 'Refunded to Wallet' : 'Refund Pending'}
              </p>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="mt-8">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-semibold border border-white/5 hover:border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
