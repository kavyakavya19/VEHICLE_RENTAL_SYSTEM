'use client';

export const Card = ({ children, style = {}, hoverEffect = false }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', padding: '24px',
      transition: hoverEffect ? 'transform 0.3s ease, box-shadow 0.3s ease' : undefined,
      ...style,
    }}
    onMouseEnter={hoverEffect ? (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'; } : undefined}
    onMouseLeave={hoverEffect ? (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } : undefined}
  >
    {children}
  </div>
);
