import React from 'react';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

const AlertBox = ({ type, message }) => {
  const styles = {
    warning: { bg: 'rgba(245,158,11,0.1)', border: '#F59E0B', color: '#F59E0B', icon: Info },
    success: { bg: 'rgba(16,185,129,0.1)', border: '#10B981', color: '#10B981', icon: CheckCircle },
    error: { bg: 'rgba(239,68,68,0.1)', border: '#EF4444', color: '#EF4444', icon: AlertCircle },
    info: { bg: 'rgba(99,102,241,0.1)', border: '#6366F1', color: '#6366F1', icon: Info },
  };

  const s = styles[type] || styles.info;
  const Icon = s.icon;

  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}20`, color: s.color, padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
      <Icon size={20} />
      <span style={{ fontSize: '14px', fontWeight: '600' }}>{message}</span>
    </div>
  );
};

export default function DashboardAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      {alerts.map((alert, idx) => (
        <AlertBox key={idx} {...alert} />
      ))}
    </div>
  );
}
