import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { id: 'PENDING', label: 'Booking Request' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'ONGOING', label: 'On Trip' },
  { id: 'COMPLETED', label: 'Completed' },
];

export default function ProgressTracker({ status, vehicleName }) {
  const currentStatus = (status || '').toUpperCase();
  
  const getStepIndex = () => {
    const idx = steps.findIndex(s => s.id === currentStatus);
    if (idx === -1) {
        if (currentStatus === 'PENDING_APPROVAL') return 2; // Treat as ongoing/waiting for end
        if (currentStatus === 'REFUNDED') return 3;
        return 0;
    }
    return idx;
  };

  const currentIndex = getStepIndex();

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Trip Progress</h3>
        <span style={{ fontSize: '13px', color: '#6366F1', fontWeight: '600' }}>{vehicleName || 'Select a Vehicle'}</span>
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
        {/* Progress Line */}
        <div style={{ position: 'absolute', top: '20px', left: '40px', right: '40px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '20px', left: '40px', width: `${(currentIndex / 3) * (typeof window !== 'undefined' ? window.innerWidth > 600 ? 80 : 70 : 80)}%`, height: '2px', background: '#6366F1', zIndex: 0, transition: 'width 0.5s ease' }} />

        {steps.map((step, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          
          return (
            <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '12px', 
                background: isCompleted ? '#6366F1' : isActive ? 'rgba(99, 102, 241, 0.2)' : '#18181B',
                border: isActive ? '2px solid #6366F1' : '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px', transition: 'all 0.3s'
              }}>
                {isCompleted ? <Check size={18} color="#FFF" /> : <span style={{ color: isActive ? '#6366F1' : '#52525B', fontSize: '14px', fontWeight: 'bold' }}>{idx + 1}</span>}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: isActive ? '#FFF' : '#A1A1AA', textAlign: 'center' }}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
