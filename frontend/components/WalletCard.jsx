'use client';

import { Wallet } from 'lucide-react';

export const WalletCard = ({ wallet }) => {
  if (!wallet) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#A1A1AA' }}>Wallet</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={24} color="#10B981" />
        </div>
        <div>
          <p style={{ color: '#A1A1AA', fontSize: '13px' }}>Available Balance</p>
          <h2 style={{ fontSize: '28px', color: '#10B981' }}>₹{parseFloat(wallet.balance || 0).toLocaleString('en-IN')}</h2>
        </div>
      </div>
      {wallet.total_spent !== undefined && (
        <p style={{ color: '#A1A1AA', fontSize: '13px' }}>Total Spent: ₹{parseFloat(wallet.total_spent || 0).toLocaleString('en-IN')}</p>
      )}
    </div>
  );
};
