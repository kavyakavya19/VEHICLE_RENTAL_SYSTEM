'use client';

import React from 'react';
import { X, Receipt, ShieldCheck, AlertTriangle } from 'lucide-react';

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
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          position: 'relative', width: '100%', maxWidth: '420px', background: '#121214',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '3px', background: 'linear-gradient(90deg, transparent, #EF3E42, transparent)', borderRadius: '3px 3px 0 0' }}></div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ background: 'rgba(239, 62, 66, 0.1)', padding: '10px', borderRadius: '12px' }}>
                <Receipt size={24} color="#EF3E42" />
             </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>Payment Details</h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: 'none', padding: '8px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1A1AA',
              transition: 'background 0.2s', outline: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#A1A1AA', fontSize: '15px' }}>Rental Cost</span>
            <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>₹{rental.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               <ShieldCheck size={16} color="#10B981" />
               <span style={{ color: '#A1A1AA', fontSize: '15px' }}>Security Deposit</span>
            </div>
            <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>₹{deposit.toLocaleString('en-IN')}</span>
          </div>

          {fine > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <AlertTriangle size={16} color="#EF4444" />
                 <span style={{ color: '#EF4444', fontSize: '15px' }}>Fine Amount</span>
              </div>
              <span style={{ color: '#EF4444', fontWeight: '600', fontSize: '16px' }}>₹{fine.toLocaleString('en-IN')}</span>
            </div>
          )}

          {damage > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <AlertTriangle size={16} color="#EF4444" />
                 <span style={{ color: '#EF4444', fontSize: '15px' }}>Damage Charges</span>
              </div>
              <span style={{ color: '#EF4444', fontWeight: '600', fontSize: '16px' }}>₹{damage.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div style={{ paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Total Paid</span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#10B981' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          {refund > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <span style={{ color: '#10B981', fontWeight: '600', fontSize: '15px' }}>Net Refund</span>
                <span style={{ color: '#10B981', fontWeight: '800', fontSize: '20px' }}>₹{refund.toLocaleString('en-IN')}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#A1A1AA', marginTop: '12px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                {booking.deposit_refunded ? 'Refunded to Wallet' : 'Refund Pending Verification'}
              </p>
            </div>
          )}
        </div>

        {/* Action */}
        <div style={{ marginTop: '32px' }}>
          <button 
            onClick={onClose}
            style={{
              width: '100%', padding: '16px', background: 'rgba(255,255,255,0.03)', color: '#fff', borderRadius: '12px',
              fontWeight: '700', fontSize: '16px', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
              transition: 'background 0.2s', outline: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            Close Receipt
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};
