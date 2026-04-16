'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';

function AdminContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lateReturns, setLateReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchLateReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('bookings/');
      const all = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setLateReturns(all.filter((b) => b.booking_status === 'PENDING_APPROVAL'));
    } catch {
      setError('Failed to load late return requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') { router.replace('/dashboard'); return; }
    if (user?.role === 'ADMIN') fetchLateReturns();
  }, [user, authLoading, fetchLateReturns, router]);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const handleApprove = async (bookingId, fine, damage = 0) => {
    setProcessingId(bookingId);
    try {
      const res = await API.post(`bookings/${bookingId}/complete-trip-admin/`, { fine_amount: fine, damage_charge: damage });
      showToast('success', res.data.message || 'Refund processed successfully');
      fetchLateReturns();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to process refund.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleFieldChange = (bookingId, field, value) => {
    setLateReturns((prev) => prev.map((b) => b.id === bookingId ? { ...b, [field]: value } : b));
  };

  if (authLoading) return null;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      {toast && <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9998, background: toast.type === 'success' ? '#10B981' : '#EF4444', color: '#fff', padding: '14px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxWidth: '360px' }}>{toast.msg}</div>}

      <div className="stack-mobile justify-between items-center" style={{ marginBottom: '30px' }}>
        <div><h1 className="text-h2" style={{ marginBottom: '6px' }}>Admin Dashboard</h1><p className="text-body" style={{ color: '#A1A1AA' }}>Manage late returns and approve fines</p></div>
        <Button variant="ghost" onClick={fetchLateReturns} style={{ fontSize: '14px' }}>🔄 Refresh List</Button>
      </div>

      <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#EF4444' }}>⚠️ Late Return Approvals ({lateReturns.length})</h2>

      {loading ? <p style={{ color: '#A1A1AA' }}>Loading requests...</p>
        : error ? <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '15px', borderRadius: '10px' }}>{error}</div>
        : lateReturns.length === 0 ? (
          <Card style={{ padding: '40px', textAlign: 'center' }}><p style={{ color: '#A1A1AA' }}>No pending late return approvals.</p></Card>
        ) : (
          <Card style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#A1A1AA' }}>
                  {['Booking', 'User', 'Vehicle', 'Dates', 'Late Info', 'Fine (₹)', 'Damage (₹)', 'Refund (₹)', 'Action'].map(h => <th key={h} style={{ padding: '16px 20px' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {lateReturns.map((item) => {
                  const dep = parseFloat(item.security_deposit || 0);
                  const fin = parseFloat(item.fine_amount || 0);
                  const dmg = parseFloat(item.damage_charge || 0);
                  const ref = Math.max(0, dep - fin - dmg);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '18px 20px', color: '#52525B', fontSize: '13px' }}>#{item.id}</td>
                      <td style={{ padding: '18px 20px' }}><div style={{ fontWeight: '600' }}>{item.user?.name || `User ${item.user?.id}`}</div><div style={{ fontSize: '12px', color: '#A1A1AA' }}>{item.user?.email}</div></td>
                      <td style={{ padding: '18px 20px' }}>{item.vehicle?.brand} {item.vehicle?.name}</td>
                      <td style={{ padding: '18px 20px', fontSize: '13px' }}><div style={{ color: '#A1A1AA' }}>End: {item.end_date}</div><div style={{ color: '#F97316', fontWeight: 'bold' }}>Returned: {item.actual_return_date}</div></td>
                      <td style={{ padding: '18px 20px' }}><span style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>{item.late_days} Days Late</span></td>
                      <td style={{ padding: '18px 20px' }}><input type="number" value={item.fine_amount} onChange={(e) => handleFieldChange(item.id, 'fine_amount', e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '4px', width: '80px', outline: 'none' }} /></td>
                      <td style={{ padding: '18px 20px' }}><input type="number" value={item.damage_charge || 0} onChange={(e) => handleFieldChange(item.id, 'damage_charge', e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px', borderRadius: '4px', width: '80px', outline: 'none' }} /></td>
                      <td style={{ padding: '18px 20px' }}><div style={{ fontWeight: '700', color: '#10B981' }}>₹{ref.toFixed(2)}</div><div style={{ fontSize: '10px', color: '#A1A1AA' }}>of ₹{dep} dep</div></td>
                      <td style={{ padding: '18px 20px' }}><Button variant="primary" disabled={processingId === item.id} onClick={() => handleApprove(item.id, item.fine_amount, item.damage_charge)} style={{ padding: '8px 12px', fontSize: '12px' }}>{processingId === item.id ? '...' : 'Finalize Trip'}</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
    </div>
  );
}

export default function AdminPage() {
  return <ProtectedRoute><AdminContent /></ProtectedRoute>;
}
