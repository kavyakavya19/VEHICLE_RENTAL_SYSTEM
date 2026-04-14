'use client';

export const InputField = ({ label, type = 'text', value, onChange, required, placeholder, disabled, readOnly }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#A1A1AA' }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      style={{
        width: '100%', padding: '12px 16px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', 
        color: disabled ? '#A1A1AA' : '#fff',
        fontFamily: 'inherit', fontSize: '15px', transition: 'all 0.3s',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    />
  </div>
);
