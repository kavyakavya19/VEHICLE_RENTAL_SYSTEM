import React from 'react';
import { BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s', cursor: 'default' }} className="hover-scale">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ background: `${color}15`, padding: '10px', borderRadius: '12px' }}>
        <Icon size={24} color={color} />
      </div>
      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFF' }}>{value}</span>
    </div>
    <span style={{ fontSize: '14px', color: '#A1A1AA', fontWeight: '500' }}>{title}</span>
  </div>
);

export default function StatsGrid({ stats }) {
  if (!stats) return null;

  const items = [
    { title: 'Total Bookings', value: stats.total || 0, icon: BarChart3, color: '#6366F1' },
    { title: 'Completed Trips', value: stats.completed || 0, icon: CheckCircle, color: '#10B981' },
    { title: 'Cancelled', value: stats.cancelled || 0, icon: XCircle, color: '#EF4444' },
    { title: 'Pending Payment', value: stats.pending_payment || 0, icon: Clock, color: '#F59E0B' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
      {items.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </div>
  );
}
