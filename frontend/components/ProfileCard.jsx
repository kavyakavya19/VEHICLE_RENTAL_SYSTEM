'use client';

import { User, Mail, Phone, IdCard } from 'lucide-react';

export const ProfileCard = ({ profile }) => {
  if (!profile) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#A1A1AA' }}>Profile</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239,62,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={28} color="#EF3E42" />
        </div>
        <div>
          <h2 style={{ fontSize: '20px' }}>{profile.name || profile.full_name}</h2>
          <span style={{ fontSize: '12px', color: profile.role === 'ADMIN' ? '#F59E0B' : '#10B981', fontWeight: '600' }}>
            {profile.role || 'USER'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#A1A1AA', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} />{profile.email}</div>
        {profile.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} />{profile.phone}</div>}
        {profile.licence_number && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IdCard size={14} />Licence: {profile.licence_number}</div>}
      </div>
    </div>
  );
};
