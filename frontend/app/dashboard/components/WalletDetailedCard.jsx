import React from 'react';
import { Wallet, Info, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

export default function WalletDetailedCard({ wallet }) {
  if (!wallet) return null;

  const data = [
    { label: 'Security Deposit', value: wallet.deposit_amount, icon: ShieldCheck, color: '#F59E0B', desc: 'Held for active trips' },
    { label: 'Refundable Balance', value: wallet.refundable_amount, icon: CreditCard, color: '#10B981', desc: 'Available for withdrawal' },
    { label: 'Pending Deductions', value: wallet.pending_fines, icon: AlertCircle, color: '#EF4444', desc: 'Fines & damages' },
  ];

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#10B98115', padding: '8px', borderRadius: '10px' }}>
            <Wallet size={20} color="#10B981" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Wallet Overview</h3>
        </div>
        <button style={{ background: 'transparent', border: 'none', color: '#6366F1', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View Transactions</button>
      </div>

      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <span style={{ fontSize: '14px', color: '#A1A1AA', display: 'block', marginBottom: '8px' }}>Total Balance</span>
        <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#FFF' }}>₹{parseFloat(wallet.balance || 0).toLocaleString('en-IN')}</h2>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ background: `${item.color}15`, padding: '10px', borderRadius: '12px' }}>
              <item.icon size={20} color={item.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.label}</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: item.color }}>₹{parseFloat(item.value || 0).toLocaleString('en-IN')}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#52525B' }}>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
