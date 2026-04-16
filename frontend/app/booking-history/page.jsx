'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import API from '../../utils/api';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { PaymentBreakdownModal } from '../../components/PaymentBreakdownModal';

const BOOKING_BADGE = {
  PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: '⏳ PENDING' },
  CONFIRMED: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6', label: '✅ CONFIRMED' },
  ONGOING: { bg: 'rgba(249,115,22,0.15)', color: '#F97316', label: '🚗 ONGOING' },
  PENDING_APPROVAL: { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6', label: '⚠️ LATE RETURN' },
  COMPLETED: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: '🏁 COMPLETED' },
  REFUNDED: { bg: 'rgba(5,150,105,0.15)', color: '#059669', label: '💰 REFUNDED' },
  CANCELLED: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: '❌ CANCELLED' },
};
const PAYMENT_BADGE = {
  SUCCESS: { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: '✅ SUCCESS' },
  FAILED: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: '❌ FAILED' },
  PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: '⏳ PENDING' },
  NULL: { bg: 'rgba(107,114,128,0.15)', color: '#6B7280', label: '— No Payment' },
};

const getBookingBadge = (s) => BOOKING_BADGE[(s || '').toUpperCase()] || BOOKING_BADGE.PENDING;
const getPaymentBadge = (s) => PAYMENT_BADGE[(s || '').toUpperCase()] || PAYMENT_BADGE.NULL;

const StatusBadge = ({ style: b }) => (
  <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: b.bg, color: b.color, whiteSpace: 'nowrap' }}>{b.label}</span>
);

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
    <div style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px 36px', maxWidth: '420px', width: '90%', textAlign: 'center' }}>
      <p style={{ fontSize: '16px', marginBottom: '28px', lineHeight: '1.6' }}>{message}</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={onCancel} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#A1A1AA', cursor: 'pointer' }}>Cancel</button>
        <button onClick={onConfirm} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#EF3E42', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>Confirm</button>
      </div>
    </div>
  </div>
);

function BookingHistoryContent() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await API.get('bookings/my-bookings/');
      setHistory(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch {
      setError('Could not load booking history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const handleDownloadInvoice = async (bookingId) => {
    setLoadingId(bookingId);
    try {
      const response = await API.get(`bookings/${bookingId}/invoice/`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `invoice_booking_${bookingId}.pdf`);
      document.body.appendChild(link); link.click();
      link.parentNode.removeChild(link); window.URL.revokeObjectURL(url);
      showToast('success', 'Invoice downloaded!');
    } catch {
      showToast('error', 'Failed to download invoice.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleAction = (bookingId, action, message) => {
    if (action === 'invoice') { handleDownloadInvoice(bookingId); return; }
    setConfirm({ bookingId, action, message });
  };

  const executeAction = async () => {
    if (!confirm) return;
    const { bookingId, action } = confirm;
    setConfirm(null); setLoadingId(bookingId);
    try {
      const res = await API.post(`bookings/${bookingId}/${action}/`);
      showToast('success', res.data?.message || `Status updated`);
      setHistory(prev => prev.map(b => b.id === bookingId ? { ...b, booking_status: res.data?.status || action } : b));
      setTimeout(fetchHistory, 1500);
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Action failed.');
    } finally {
      setLoadingId(null);
    }
  };

    const ActionButton = ({ booking }) => {
    const st = (booking.booking_status || booking.status || '').toUpperCase();
    const busy = loadingId === booking.id;
    const btnStyle = (bg) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', background: busy ? '#374151' : bg, color: '#fff', cursor: busy ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', opacity: busy ? 0.6 : 1 });
    
    if (st === 'PENDING') return <button disabled={busy} onClick={() => router.push(`/payment/${booking.id}`)} style={btnStyle('#F59E0B')}>{busy ? '...' : '💳 Complete Payment'}</button>;
    if (st === 'CONFIRMED') return <button disabled={busy} onClick={() => handleAction(booking.id, 'start-trip', '🚗 Start your trip?')} style={btnStyle('#F97316')}>{busy ? '...' : '🚗 Start Trip'}</button>;
    if (st === 'ONGOING') return <button disabled={busy} onClick={() => handleAction(booking.id, 'end-trip', '🏁 End trip and return vehicle?')} style={btnStyle('#10B981')}>{busy ? '...' : '🏁 End Trip'}</button>;
    if (st === 'PENDING_APPROVAL') { const fine = parseFloat(booking.fine_amount || 0); return <button disabled={busy} onClick={() => handleAction(booking.id, 'pay-fine', `💳 Pay Late Fine of ₹${fine.toLocaleString('en-IN')}?`)} style={btnStyle('#8B5CF6')}>{busy ? '...' : `💳 Pay Fine ₹${fine}`}</button>; }
    if (st === 'COMPLETED') return <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><span style={{ fontSize: '13px', color: '#10B981', fontWeight: '600' }}>Trip Completed ✓</span><button disabled={busy} onClick={() => handleAction(booking.id, 'invoice')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #10B981', background: 'transparent', color: '#10B981', cursor: busy ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: '700' }}>{busy ? '...' : '📄 Download Invoice'}</button></div>;
    if (st === 'CANCELLED') return <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: '600' }}>Cancelled</span>;
    return <span style={{ fontSize: '13px', color: '#F59E0B', fontWeight: '600' }}>Awaiting Payment</span>;
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={executeAction} onCancel={() => setConfirm(null)} />}
      {toast && <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9998, background: toast.type === 'success' ? '#10B981' : '#EF4444', color: '#fff', padding: '14px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxWidth: '360px' }}>{toast.msg}</div>}

      <div className="stack-mobile justify-between items-center" style={{ marginBottom: '30px' }}>
        <div><h1 className="text-h2" style={{ marginBottom: '6px' }}>My Booking History</h1><p className="text-body" style={{ color: '#A1A1AA' }}>Track and manage all your vehicle rentals</p></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Button variant="ghost" onClick={fetchHistory} style={{ fontSize: '14px' }}>🔄 Refresh</Button>
          <Button variant="primary" onClick={() => router.push('/vehicles')}>+ Book Another</Button>
        </div>
      </div>

      {loading ? <p style={{ color: '#A1A1AA' }}>Loading your bookings...</p>
        : error ? <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '16px', borderRadius: '10px' }}>{error}</div>
          : history.length === 0 ? (
            <Card style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#A1A1AA', fontSize: '18px', marginBottom: '20px' }}>You have no past or active bookings.</p>
              <Button variant="ghost" onClick={() => router.push('/vehicles')}>Browse Vehicles</Button>
            </Card>
          ) : (
            <Card style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#A1A1AA' }}>
                    {['#', 'Vehicle', 'Dates', 'Amount', 'Booking Status', 'Payment', 'Action'].map(h => <th key={h} style={{ padding: '16px 20px' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const bBadge = getBookingBadge(item.booking_status || item.status);
                    const pBadge = getPaymentBadge(item.payment_status);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: loadingId === item.id ? 0.6 : 1 }}>
                        <td style={{ padding: '18px 20px', color: '#52525B', fontSize: '13px' }}>#{item.id}</td>
                        <td style={{ padding: '18px 20px', fontWeight: '600' }}>{item.vehicle_brand && `${item.vehicle_brand} `}{item.vehicle_name || item.vehicle || 'Vehicle'}</td>
                        <td style={{ padding: '18px 20px', color: '#A1A1AA', fontSize: '13px' }}><div>{item.start_date}</div><div style={{ color: '#52525B', fontSize: '11px', margin: '2px 0' }}>to</div><div>{item.end_date}</div></td>
                        <td 
                          style={{ padding: '18px 20px', fontWeight: '700', color: '#10B981', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedBooking(item);
                            setIsModalOpen(true);
                          }}
                          title="Click to view breakdown"
                        >
                          ₹{parseFloat(item.rental_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '18px 20px' }}><StatusBadge style={bBadge} />{item.late_days > 0 && <span style={{ display: 'block', fontSize: '11px', color: '#EF4444', fontWeight: '600', marginTop: '4px' }}>{item.late_days} Day(s) Late</span>}</td>
                        <td style={{ padding: '18px 20px' }}><StatusBadge style={pBadge} />{parseFloat(item.fine_amount || 0) > 0 && <span style={{ display: 'block', fontSize: '11px', color: item.fine_paid ? '#10B981' : '#F59E0B', fontWeight: '600', marginTop: '4px' }}>Fine: ₹{item.fine_amount} {item.fine_paid ? '(Paid)' : '(Pending)'}</span>}</td>
                        <td style={{ padding: '18px 20px' }}><ActionButton booking={item} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}

      <PaymentBreakdownModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        booking={selectedBooking} 
      />
    </div>
  );
}

export default function BookingHistoryPage() {
  return <ProtectedRoute><BookingHistoryContent /></ProtectedRoute>;
}
