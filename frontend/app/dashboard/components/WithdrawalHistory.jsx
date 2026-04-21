import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle2, XCircle, History, IndianRupee } from 'lucide-react';
import API from '../../../utils/api';

export default function WithdrawalHistory({ refreshTrigger }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Using the exact route requested
      const res = await API.get('wallet/withdrawals/');
      // Handle both paginated and non-paginated results
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setWithdrawals(data.slice(0, 5)); // Last 5
      setError('');
    } catch (err) {
      setError('Could not load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle2 };
      case 'REJECTED':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle };
      default:
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock };
    }
  };

  if (loading && !refreshTrigger) {
    return (
      <div className="glass-card p-6 animate-section" style={{ transitionDelay: '0.5s' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-section" style={{ transitionDelay: '0.5s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px' }}>
          <History size={20} color="#6366F1" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#FFF' }}>Recent Withdrawals</h3>
      </div>

      {error ? (
        <p style={{ color: '#EF4444', fontSize: '14px' }}>{error}</p>
      ) : withdrawals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>No withdrawal requests yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {withdrawals.map((req) => {
            const style = getStatusStyle(req.status);
            return (
              <div key={req.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '14px 20px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'transform 0.2s ease'
              }}>
                {/* Left: Amount & Date Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ color: '#FFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IndianRupee size={15} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '-0.02em' }}>
                      {parseFloat(req.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Right: Status Badge */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '6px 12px', 
                  background: style.bg, 
                  color: style.color, 
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: `1px solid ${style.color}20`
                }}>
                  <style.icon size={12} />
                  {req.status}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
