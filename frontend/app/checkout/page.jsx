'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '../../utils/api';
import { Button } from '../../components/Button';
import { ProtectedRoute } from '../../components/ProtectedRoute';

function CheckoutContent() {
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('bookingDetails');
    if (stored) {
      setBookingDetails(JSON.parse(stored));
    } else {
      router.replace('/vehicles');
    }
  }, [router]);

  if (!bookingDetails) return null;

  const { vehicle, start_date, end_date, number_of_days, price_per_day, total_price, vehicle_id } = bookingDetails;
  const finalPrice = Math.max(0, total_price - discount);

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponError(''); setCouponSuccess('');
    try {
      const res = await API.post('coupons/apply/', { code: couponCode, amount: total_price });
      setDiscount(res.data.discount || res.data.discount_amount || 0);
      setCouponSuccess('Coupon applied successfully!');
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid or expired coupon.');
      setDiscount(0);
    }
  };

  const confirmBooking = async () => {
    setLoading(true); setBookingError('');
    try {
      const totalWithDeposit = finalPrice + (bookingDetails.security_deposit || 2000);
      const res = await API.post('bookings/', {
        vehicle: vehicle_id, start_date, end_date,
        total_price: totalWithDeposit,
        coupon_code: discount > 0 ? couponCode : null,
        status: 'PENDING',
      });
      
      // Case 1: Booking created successfully (201)
      // Case 2: Pending booking exists for same vehicle (200)
      const bId = res.data.id || res.data.blockchain_id || res.data.booking_id;
      sessionStorage.setItem('paymentAmount', String(totalWithDeposit));
      router.push(`/payment/${bId}`);
    } catch (err) {
      const resp = err.response?.data;
      const msg = resp?.error || resp?.detail || (resp && typeof resp === 'object' ? Object.values(resp)[0] : null);
      
      if (msg && typeof msg === 'string' && msg.toLowerCase().includes('active booking')) {
        setBookingError('status_active');
      } else {
        setBookingError(msg || 'Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '16px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>Checkout</h1>
        {bookingError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            {bookingError === 'status_active' ? (
              <div>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>You already have an active booking!</p>
                <p style={{ fontSize: '14px', marginBottom: '12px' }}>Please complete or cancel your current trip before booking another vehicle.</p>
                <Button variant="secondary" onClick={() => router.push('/booking-history')} style={{ fontSize: '13px', padding: '8px 16px' }}>Go to Booking History</Button>
              </div>
            ) : (
              <>
                <p style={{ marginBottom: bookingError.includes('unpaid fines') ? '12px' : '0' }}>{bookingError}</p>
                {bookingError.includes('unpaid fines') && <Button variant="secondary" onClick={() => router.push('/booking-history')} style={{ fontSize: '13px', padding: '8px 16px' }}>Go to Booking History</Button>}
              </>
            )}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Summary */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#A1A1AA' }}>Booking Summary</h2>
            <div style={{ marginBottom: '15px' }}>
              <span style={{ color: '#EF3E42', fontWeight: 'bold' }}>{vehicle?.brand}</span>
              <h3 style={{ fontSize: '20px', marginTop: '5px' }}>{vehicle?.name}</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#A1A1AA' }}>Start Date:</span><span>{start_date}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><span style={{ color: '#A1A1AA' }}>End Date:</span><span>{end_date}</span></div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#A1A1AA' }}>Rate:</span><span>₹{price_per_day} / day</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#A1A1AA' }}>Duration:</span><span>{number_of_days} days</span></div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '15px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#A1A1AA' }}>Rental Cost:</span>
              <span>₹{total_price}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#10B981' }}>
                <span>Discount ({couponCode}):</span>
                <span>- ₹{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#A1A1AA' }}>Security Deposit:</span>
              <span>₹{bookingDetails.security_deposit || 2000}</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.2)', margin: '20px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 'bold' }}>
              <span>Total Payable:</span>
              <span style={{ color: '#EF3E42' }}>₹{finalPrice + (bookingDetails.security_deposit || 2000)}</span>
            </div>
          </div>
          {/* Actions */}
          <div>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#A1A1AA' }}>Promo Code / Coupon (Optional)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" style={{ flex: '1', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
                <Button variant="secondary" onClick={applyCoupon} style={{ padding: '0 20px' }}>Apply</Button>
              </div>
              {couponError && <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px' }}>{couponError}</p>}
              {couponSuccess && <p style={{ color: '#10B981', fontSize: '13px', marginTop: '8px' }}>{couponSuccess}</p>}
            </div>
            <Button variant="primary" style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: '600' }} onClick={confirmBooking} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Booking'}
            </Button>
            <Button variant="ghost" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '10px', color: '#A1A1AA' }} onClick={() => router.back()}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <ProtectedRoute><CheckoutContent /></ProtectedRoute>;
}
