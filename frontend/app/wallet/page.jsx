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

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await API.get('payments/wallet/');
        setWallet(res.data);
      } catch (err) {
        setError('Failed to load wallet details.');
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) return (
    <div className="page-container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ width: '50px', height: '50px', border: '5px solid rgba(239, 62, 66, 0.2)', borderTopColor: '#EF3E42', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>Digital Wallet</h1>
      
      {error && <div style={{ background: 'rgba(239, 62, 66, 0.1)', color: '#EF3E42', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ maxWidth: '600px' }}>
        <WalletCard wallet={wallet} />
        
        <div style={{ marginTop: '30px', padding: '24px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>About Your Wallet</h3>
          <p style={{ color: '#A1A1AA', fontSize: '14px', lineHeight: '1.6' }}>
            Your wallet balance is used for security deposits and fine payments. 
            Refunds from canceled bookings or security deposits are credited back to this wallet.
          </p>
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
