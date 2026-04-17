'use client';

import React from 'react';
import { PlusCircle, History, CreditCard, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActions({ hasPending }) {
  const router = useRouter();

  const actions = [
    { label: 'Book Vehicle', icon: PlusCircle, path: '/vehicles', bg: 'linear-gradient(135deg, rgba(239, 62, 66, 0.1) 0%, rgba(239, 62, 66, 0.05) 100%)', hoverBg: 'rgba(239, 62, 66, 0.15)', border: 'rgba(239, 62, 66, 0.2)', iconColor: '#EF3E42' },
    { label: 'Booking History', icon: History, path: '/booking-history', bg: 'rgba(255,255,255,0.03)', hoverBg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.05)', iconColor: '#A1A1AA' },
    { label: 'Complete Payment', icon: CreditCard, path: '/booking-history', bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', hoverBg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.2)', iconColor: '#10B981', hide: !hasPending },
    { label: 'Profile Settings', icon: User, path: '/profile', bg: 'rgba(255,255,255,0.03)', hoverBg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.05)', iconColor: '#A1A1AA' },
  ];

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '18px', background: '#EF3E42', borderRadius: '4px' }}></div>
        Quick Actions
      </h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        {actions.filter(a => !a.hide).map((action, idx) => (
          <button 
            key={idx} 
            className="quick-action-card"
            onClick={() => router.push(action.path)}
            style={{
              '--bg': action.bg,
              '--hover-bg': action.hoverBg,
              '--border': action.border,
            }}
          >
            <div style={{ background: 'rgba(10,10,10,0.5)', padding: '10px', borderRadius: '12px' }}>
              <action.icon size={22} color={action.iconColor} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>{action.label}</span>
          </button>
        ))}
      </div>
      <style>{`
        .quick-action-card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 16px;
          background: var(--bg);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          outline: none;
        }
        .quick-action-card:hover {
          background: var(--hover-bg);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          border-color: rgba(255,255,255,0.1);
        }
        .quick-action-card:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
