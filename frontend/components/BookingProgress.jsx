'use client';

const STEPS = ['PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED'];

export const BookingProgress = ({ booking }) => {
  if (!booking) return null;
  const status = (booking.booking_status || booking.status || '').toUpperCase();
  const currentStep = STEPS.indexOf(status);

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#A1A1AA' }}>Booking Progress</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: i <= currentStep ? '#EF3E42' : 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: i <= currentStep ? '#fff' : '#A1A1AA',
              transition: 'all 0.3s',
            }}>{i + 1}</div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: i < currentStep ? '#EF3E42' : 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        {STEPS.map((step) => (
          <span key={step} style={{ fontSize: '10px', color: '#A1A1AA', textAlign: 'center', flex: 1 }}>{step}</span>
        ))}
      </div>
    </div>
  );
};
