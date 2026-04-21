'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '../../utils/api';
import { WalletCard } from '../../components/WalletCard';
import { ProtectedRoute } from '../../components/ProtectedRoute';

function WalletPageContent() {
  const router = useRouter();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState([]);
  
  // Withdrawal Form State
  const [formData, setFormData] = useState({
    amount: '',
    bank_account_number: '',
    ifsc_code: '',
    account_holder_name: ''
  });
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = async () => {
    try {
      const [walletRes, requestsRes] = await Promise.all([
        API.get('payments/wallet/'),
        API.get('payments/withdrawals/'), // Updated path
      ]);
      setWallet(walletRes.data);
      setRequests(requestsRes.data.results || requestsRes.data);
    } catch (err) {
      setError('Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setWithdrawing(true);

    try {
      await API.post('payments/withdrawals/', formData);
      setSuccess('Withdrawal request submitted successfully!');
      setFormData({ amount: '', bank_account_number: '', ifsc_code: '', account_holder_name: '' });
      fetchData(); // Refresh balance and history
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.amount?.[0] || 'Failed to submit withdrawal request.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return (
    <div className="page-container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ width: '50px', height: '50px', border: '5px solid rgba(239, 62, 66, 0.2)', borderTopColor: '#EF3E42', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <h1 className="text-h2" style={{ marginBottom: '30px' }}>Digital Wallet</h1>
      
      {error && <div style={{ background: 'rgba(239, 62, 66, 0.1)', color: '#EF3E42', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
        <div>
          <WalletCard wallet={wallet} />
          
          <div style={{ marginTop: '30px', padding: '24px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>About Your Wallet</h3>
            <p style={{ color: '#A1A1AA', fontSize: '14px', lineHeight: '1.6' }}>
              <strong>Main Balance:</strong> Used for upcoming security deposits.<br/>
              <strong>Refundable Balance:</strong> Security deposits returned after successful trips. These can be withdrawn to your bank account.
            </p>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Withdrawal History</h3>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
              {requests.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#71717A' }}>No withdrawal requests found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', color: '#A1A1AA' }}>Date</th>
                      <th style={{ padding: '12px 16px', color: '#A1A1AA' }}>Amount</th>
                      <th style={{ padding: '12px 16px', color: '#A1A1AA' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <td style={{ padding: '12px 16px' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>₹{parseFloat(req.amount).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            background: req.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : req.status === 'REJECTED' ? 'rgba(239,62,66,0.1)' : 'rgba(245,158,11,0.1)',
                            color: req.status === 'APPROVED' ? '#10B981' : req.status === 'REJECTED' ? '#EF3E42' : '#F59E0B'
                          }}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Withdraw Funds</h3>
          <form onSubmit={handleWithdraw}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Amount to Withdraw</label>
              <input 
                type="number" 
                required 
                placeholder="e.g. 1000"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#FFF' }}
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Account Holder Name</label>
              <input 
                type="text" 
                required 
                placeholder="Full name as per bank record"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#FFF' }}
                value={formData.account_holder_name}
                onChange={e => setFormData({...formData, account_holder_name: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>Bank Account Number</label>
              <input 
                type="text" 
                required 
                placeholder="Enter account number"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#FFF' }}
                value={formData.bank_account_number}
                onChange={e => setFormData({...formData, bank_account_number: e.target.value})}
              />
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#A1A1AA', marginBottom: '8px' }}>IFSC Code</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. SBIN0001234"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#FFF' }}
                value={formData.ifsc_code}
                onChange={e => setFormData({...formData, ifsc_code: e.target.value})}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={withdrawing || (wallet && parseFloat(wallet.pending_deductions) > 0)}
              title={(wallet && parseFloat(wallet.pending_deductions) > 0) ? "You have pending dues. Please clear them to continue." : ""}
              style={{ 
                width: '100%', 
                background: (wallet && parseFloat(wallet.pending_deductions) > 0) ? '#4B5563' : '#EF3E42', 
                color: '#FFF', 
                padding: '14px', 
                borderRadius: '10px', 
                fontWeight: 'bold', 
                border: 'none', 
                cursor: (withdrawing || (wallet && parseFloat(wallet.pending_deductions) > 0)) ? 'not-allowed' : 'pointer',
                opacity: (withdrawing || (wallet && parseFloat(wallet.pending_deductions) > 0)) ? 0.7 : 1
              }}
            >
              {withdrawing ? 'Processing...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletPageContent />
    </ProtectedRoute>
  );
}
