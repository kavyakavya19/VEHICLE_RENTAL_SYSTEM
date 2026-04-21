import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import API from '../../../utils/api';

export default function FinesHistory() {
  const [fines, setFines] = useState([]);
  const [pendingFines, setPendingFines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFines = async () => {
    try {
      const [historyRes, pendingRes] = await Promise.all([
        API.get('fines/my-fines/'),
        API.get('fines/pending-deductions/')
      ]);
      setFines(historyRes.data);
      setPendingFines(pendingRes.data.pending_fines || []);
    } catch (err) {
      console.error('Failed to load fines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleSettle = async (id) => {
      try {
          await API.post(`fines/${id}/settle/`);
          alert('Settlement processed!');
          fetchFines();
          window.location.reload(); // Refresh wallet
      } catch (err) {
          alert('Failed to settle: ' + (err.response?.data?.message || err.response?.data?.error || 'Unknown error'));
      }
  };

  const handlePayRemaining = async (id, amount) => {
      const payAmount = prompt(`Enter amount to pay for remaining due (Max: ₹${amount}):`, amount);
      if (!payAmount) return;
      try {
          await API.post('fines/pay/', { fine_id: id, amount: payAmount });
          alert('Payment Successful!');
          fetchFines();
          window.location.reload(); // Refresh wallet
      } catch (err) {
          alert('Failed to pay: ' + (err.response?.data?.error || 'Unknown error'));
      }
  };

  if (loading) return null;

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {pendingFines.length > 0 && (
        <div className="glass-card summary-card fade-in" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div className="card-header summary-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
              <AlertCircle size={20} /> Pending Deductions
            </h3>
          </div>
          <div className="card-body" style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              {pendingFines.map(fine => (
                <div key={fine.id} style={{
                  padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
                }}>
                  <div>
                     <p style={{ fontWeight: '500', color: '#EF4444', marginBottom: '4px' }}>{fine.reason}</p>
                     <p style={{ fontSize: '12px', color: '#A1A1AA' }}>Booking #{fine.booking_id} • {new Date(fine.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ fontWeight: '700', color: '#EF4444', fontSize: '18px' }}>
                      ₹{fine.amount.toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleSettle(fine.id)} style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Settle Now
                        </button>
                        <button onClick={() => handlePayRemaining(fine.id, fine.amount)} style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Pay Remaining
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="glass-card summary-card fade-in">
        <div className="card-header summary-header">
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Clock size={20} /> Fine History
           </h3>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
           {fines.length === 0 ? (
             <div style={{ padding: '32px', textAlign: 'center', color: '#A1A1AA' }}>
               No fines recorded. Great job!
             </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               {fines.map((fine, idx) => (
                 <div key={fine.id} style={{ 
                   padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                   borderBottom: idx !== fines.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '600' }}>{fine.reason}</span>
                            {fine.is_settled ? (
                                <span style={{ background: '#10B98115', color: '#10B981', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700' }}>🟢 Settled</span>
                            ) : (
                                <span style={{ background: '#F59E0B15', color: '#F59E0B', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700' }}>🟡 Pending</span>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#A1A1AA' }}>
                          Booking #{fine.booking_id} • {new Date(fine.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div style={{ fontWeight: '600', color: fine.is_settled ? '#A1A1AA' : '#EF4444' }}>
                        ₹{fine.amount.toFixed(2)}
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
