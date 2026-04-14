'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '../../../utils/api';
import { Button } from '../../../components/Button';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function PaymentContent() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await API.get(`bookings/${bookingId}/`);
        setBooking(res.data);
      } catch {
        setError('Could not load booking details.');
      } finally {
        setFetching(false);
      }
    };
    if (bookingId) loadBooking();
    else { setError('No booking ID provided.'); setFetching(false); }
  }, [bookingId]);

  const cancelBookingOnBackend = async (reason) => {
    try {
      await API.post('payments/cancel-payment/', { booking_id: parseInt(bookingId, 10), reason });
    } catch (err) {
      console.warn('cancel-payment API error:', err?.response?.data || err.message);
    }
  };

  const handlePayment = async () => {
    setLoading(true); setError('');
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) { setError('Failed to load Razorpay SDK.'); setLoading(false); return; }
    try {
      const orderRes = await API.post('payments/create-order/', { booking_id: parseInt(bookingId, 10) });
      const { order_id, amount, currency, razorpay_key } = orderRes.data;
      let paymentActioned = false;
      const options = {
        key: razorpay_key, amount, currency,
        name: 'Perfect Wheels', description: 'Vehicle Booking Payment', order_id,
        handler: async (response) => {
          paymentActioned = true;
          try {
            const verifyRes = await API.post('payments/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: parseInt(bookingId, 10),
            });
            if (verifyRes.data.status === 'SUCCESS') {
              sessionStorage.removeItem('paymentAmount');
              router.replace(`/booking-success/${bookingId}`);
            } else {
              setError('Verification failed. Contact support.'); setLoading(false);
            }
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.error || 'Payment verification failed.'); setLoading(false);
          }
        },
        prefill: { name: booking?.user?.full_name || 'Customer', email: booking?.user?.email || '', contact: booking?.user?.phone || '' },
        theme: { color: '#EF3E42' },
        modal: {
          ondismiss: async () => {
            setLoading(false);
            if (!paymentActioned) {
              setError('Payment was not completed. Your booking has been cancelled.');
              await cancelBookingOnBackend('DISMISSED');
            }
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        paymentActioned = true;
        const errMsg = response.error?.description || 'Payment failed.';
        setError(`❌ Payment failed: ${errMsg}. Please start a new booking.`);
        setLoading(false);
        await cancelBookingOnBackend(`FAILED: ${errMsg}`);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate payment.'); setLoading(false);
    }
  };

  const displayAmount = booking?.total_price ?? 0;

  if (fetching) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#A1A1AA' }}>Loading payment details...</div>;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,62,66,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: '28px' }}>💳</span>
          </div>
          <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>Complete Payment</h1>
          <p style={{ color: '#A1A1AA', fontSize: '14px' }}>Your booking is saved. Complete payment to confirm it.</p>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>⚠️ {error}</div>}
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#A1A1AA', fontSize: '14px' }}>Booking ID:</span>
            <span style={{ fontWeight: '600' }}>#{bookingId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#A1A1AA', fontSize: '14px' }}>Rental Cost:</span>
            <span>₹{parseFloat(booking?.rental_amount || 0).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#A1A1AA', fontSize: '14px' }}>Security Deposit:</span>
            <span>₹{parseFloat(booking?.security_deposit || 0).toLocaleString('en-IN')}</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#A1A1AA', fontSize: '14px', fontWeight: '600' }}>Total Payable</span>
            <span style={{ fontSize: '28px', color: '#10B981', fontWeight: '700' }}>₹{parseFloat(displayAmount).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px' }}>
          <span style={{ fontSize: '18px' }}>🔒</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>100% Secure Payment</p>
            <p style={{ fontSize: '12px', color: '#A1A1AA' }}>Verified by Razorpay. Your data is encrypted.</p>
          </div>
        </div>
        <Button variant="primary" disabled={loading || fetching || !booking} onClick={handlePayment} style={{ width: '100%', padding: '16px', fontSize: '17px', fontWeight: '700' }}>
          {loading ? '⏳ Opening Razorpay...' : `Pay ₹${parseFloat(displayAmount).toLocaleString('en-IN')} with Razorpay`}
        </Button>
        <Button variant="ghost" onClick={() => router.back()} style={{ width: '100%', marginTop: '12px', padding: '14px', color: '#A1A1AA' }}>← Go Back</Button>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#52525B' }}>Powered by Razorpay · Test Mode</p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return <ProtectedRoute><PaymentContent /></ProtectedRoute>;
}
