import React, { useState } from 'react';
import { Wallet, Info, CreditCard, ShieldCheck, AlertCircle, ArrowDownToLine, X } from 'lucide-react';
import { Button } from '../../../components/Button';
import API from '../../../utils/api';

export default function WalletDetailedCard({ wallet, onUpdate, onWithdrawalSuccess }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!wallet) return null;

  const data = [
    { label: 'Security Deposit (Locked)', value: wallet.security_deposit, icon: ShieldCheck, color: '#F59E0B', desc: 'Held for active trips', id: 'sec_dep' },
    { label: 'Refundable Balance', value: wallet.refundable_balance, icon: CreditCard, color: '#10B981', desc: 'Returned after trips', id: 'ref_bal' },
    { label: 'Pending Deductions', value: wallet.pending_deductions, icon: AlertCircle, color: '#EF4444', desc: 'Unsettled fines/damages', id: 'pen_fin' },
  ];

  const handleWithdraw = async () => {
      setMessage('');
      if (!withdrawAmount || !bankAccount || !ifscCode || !accountHolder) {
          setMessage({ type: 'error', text: 'Please fill in all bank details.' });
          return;
      }
      setLoading(true);
      try {
          const res = await API.post('payments/withdrawals/', { 
              amount: parseFloat(withdrawAmount),
              bank_account_number: bankAccount,
              ifsc_code: ifscCode,
              account_holder_name: accountHolder
          });
          setMessage({ type: 'success', text: 'Request submitted for admin approval!' });
          setWithdrawAmount('');
          setBankAccount('');
          setIfscCode('');
          setAccountHolder('');
          if (onUpdate) onUpdate();
          if (onWithdrawalSuccess) onWithdrawalSuccess();
      } catch (err) {
          setMessage({ type: 'error', text: err.response?.data?.error || err.response?.data?.amount?.[0] || 'Failed to submit request' });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="glass-card p-5 animate-section" style={{ height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '10px' }}>
            <Wallet size={20} color="#10B981" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#FFF' }}>Wallet Overview</h3>
        </div>
      </div>

      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <span style={{ fontSize: '13px', color: '#9CA3AF', display: 'block', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top-up Balance</span>
        <h2 style={{ fontSize: '40px', fontWeight: '900', color: '#FFF', letterSpacing: '-0.04em' }}>₹{parseFloat(wallet.balance || 0).toLocaleString('en-IN')}</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 20px', 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderRadius: '16px', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            minHeight: '80px'
          }}>
            {/* Left Section: Icon + Label + Subtext */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: `${item.color}15`, padding: '10px', borderRadius: '12px' }}>
                <item.icon size={20} color={item.color} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#9CA3AF' }}>{item.label}</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{item.desc}</span>
              </div>
            </div>

            {/* Right Section: Amount + Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: item.id === 'ref_bal' ? '#4ADE80' : '#FFF',
                letterSpacing: '-0.02em'
              }}>
                ₹{parseFloat(item.value || 0).toLocaleString('en-IN')}
              </span>
              {item.id === 'ref_bal' && parseFloat(item.value || 0) > 0 && (
                <button 
                  onClick={() => setShowWithdraw(true)} 
                  disabled={parseFloat(wallet.pending_deductions || 0) > 0}
                  title={parseFloat(wallet.pending_deductions || 0) > 0 ? "You have pending dues. Please clear them to continue." : ""}
                  style={{ 
                    background: parseFloat(wallet.pending_deductions || 0) > 0 ? '#4B5563' : '#10B981', 
                    border: 'none', 
                    color: '#FFF', 
                    padding: '6px 12px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    fontWeight: '700', 
                    cursor: parseFloat(wallet.pending_deductions || 0) > 0 ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.2s',
                    boxShadow: parseFloat(wallet.pending_deductions || 0) > 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)'
                  }}
                  onMouseOver={(e) => {if(parseFloat(wallet.pending_deductions || 0) <= 0) e.target.style.background = '#059669'}}
                  onMouseOut={(e) => {if(parseFloat(wallet.pending_deductions || 0) <= 0) e.target.style.background = '#10B981'}}
                >
                   Withdraw
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showWithdraw && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(0, 0, 0, 0.6)', 
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '400px', 
            background: 'linear-gradient(to bottom, #111827, #000000)', 
            borderRadius: '20px', 
            padding: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)', 
            position: 'relative' 
          }}>
             <button 
                onClick={() => {setShowWithdraw(false); setMessage('');}} 
                style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  right: '20px', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  color: '#FFF', 
                  cursor: 'pointer', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
               <X size={18} />
             </button>
             
             <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFF', marginBottom: '4px' }}>Withdraw Funds</h3>
                <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Available: <span style={{ color: '#4ADE80', fontWeight: '600' }}>₹{parseFloat(wallet.refundable_balance || 0).toLocaleString('en-IN')}</span></p>
             </div>
             
             {message && (
               <div style={{ 
                 background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                 color: message.type === 'success' ? '#10B981' : '#EF4444', 
                 padding: '12px', 
                 borderRadius: '12px', 
                 fontSize: '13px', 
                 fontWeight: '600', 
                 marginBottom: '20px', 
                 textAlign: 'center' 
               }}>
                 {message.text}
                 {message.type === 'success' && <Button variant="secondary" onClick={() => setShowWithdraw(false)} style={{ width: '100%', marginTop: '12px', height: '40px' }}>Close</Button>}
               </div>
             )}

             {message?.type !== 'success' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Amount Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#9CA3AF' }}>Amount to Withdraw</label>
                      <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280', fontSize: '16px' }}>₹</span>
                          <input 
                              type="number" 
                              value={withdrawAmount} 
                              onChange={e => setWithdrawAmount(e.target.value)}
                              placeholder="0.00" 
                              style={{ 
                                width: '100%', height: '44px', background: '#0D0D11', border: '1px solid #374151', 
                                padding: '0 12px 0 32px', borderRadius: '10px', color: '#FFF', fontSize: '16px', outline: 'none' 
                              }} 
                              onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                              onBlur={(e) => e.target.style.borderColor = '#374151'}
                          />
                      </div>
                  </div>

                  {/* Account Holder */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#9CA3AF' }}>Account Holder Name</label>
                      <input 
                          type="text" 
                          value={accountHolder} 
                          onChange={e => setAccountHolder(e.target.value)}
                          placeholder="Full name as per bank" 
                          style={{ 
                            width: '100%', height: '44px', background: '#0D0D11', border: '1px solid #374151', 
                            padding: '0 12px', borderRadius: '10px', color: '#FFF', fontSize: '14px', outline: 'none' 
                          }} 
                          onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                          onBlur={(e) => e.target.style.borderColor = '#374151'}
                      />
                  </div>

                  {/* Account Number */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#9CA3AF' }}>Bank Account Number</label>
                      <input 
                          type="text" 
                          value={bankAccount} 
                          onChange={e => setBankAccount(e.target.value)}
                          placeholder="Enter account number" 
                          style={{ 
                            width: '100%', height: '44px', background: '#0D0D11', border: '1px solid #374151', 
                            padding: '0 12px', borderRadius: '10px', color: '#FFF', fontSize: '14px', outline: 'none' 
                          }} 
                          onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                          onBlur={(e) => e.target.style.borderColor = '#374151'}
                      />
                  </div>

                  {/* IFSC Code */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#9CA3AF' }}>IFSC Code</label>
                      <input 
                          type="text" 
                          value={ifscCode} 
                          onChange={e => setIfscCode(e.target.value)}
                          placeholder="e.g. SBIN0001234" 
                          style={{ 
                            width: '100%', height: '44px', background: '#0D0D11', border: '1px solid #374151', 
                            padding: '0 12px', borderRadius: '10px', color: '#FFF', fontSize: '14px', outline: 'none' 
                          }} 
                          onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                          onBlur={(e) => e.target.style.borderColor = '#374151'}
                      />
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '8px 0' }} />
                 
                 <Button 
                    variant="primary" 
                    style={{ width: '100%', height: '44px', borderRadius: '10px', background: '#EF4444', fontWeight: '700' }} 
                    onClick={handleWithdraw} 
                    disabled={loading || !withdrawAmount || !accountHolder || !bankAccount || !ifscCode}
                  >
                    {loading ? 'Processing...' : 'Confirm Withdrawal'}
                 </Button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
