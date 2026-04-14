'use client';

export const Button = ({ children, variant = 'primary', style = {}, disabled, onClick, type = 'button' }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', padding: '12px 24px', borderRadius: '8px', fontWeight: '600',
    fontSize: '15px', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease', border: 'none', fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary:   { background: '#EF3E42', color: '#fff' },
    secondary: { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' },
    ghost:     { background: 'transparent', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.1)' },
  };
  return (
    <button type={type} style={{ ...base, ...variants[variant], ...style }} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};
