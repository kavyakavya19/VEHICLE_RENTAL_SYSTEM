import React from 'react';
import { PlusCircle, History, CreditCard, User } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useRouter } from 'next/navigation';

export default function QuickActions({ hasPending }) {
  const router = useRouter();

  const actions = [
    { label: 'Book Vehicle', icon: PlusCircle, path: '/vehicles', variant: 'primary' },
    { label: 'Booking History', icon: History, path: '/booking-history', variant: 'secondary' },
    { label: 'Complete Payment', icon: CreditCard, path: '/booking-history', variant: 'primary', hide: !hasPending },
    { label: 'Profile Settings', icon: User, path: '/profile', variant: 'secondary' },
  ];

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {actions.filter(a => !a.hide).map((action, idx) => (
          <Button 
            key={idx} 
            variant={action.variant} 
            onClick={() => router.push(action.path)}
            style={{ 
              width: '100%', 
              justifyContent: 'flex-start', 
              gap: '12px', 
              padding: '12px 20px',
              background: action.variant === 'secondary' ? 'rgba(255,255,255,0.05)' : undefined
            }}
          >
            <action.icon size={20} />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
