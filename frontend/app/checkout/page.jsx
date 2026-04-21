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
  const [useWallet, setUseWallet] = useState(true);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('bookingDetails');
    if (stored) {
      setBookingDetails(JSON.parse(stored));
    } else {
      router.replace('/vehicles');
    }
  }, [router]);

  if (!bookingDetails) return null;

  const { vehicle, start_date, end_date, booking_type, number_of_days, number_of_hours, price_per_day, price_per_hour, total_price, vehicle_id } = bookingDetails;
  const finalPrice = Math.max(0, total_price - discount);
  const totalWithDeposit = finalPrice + (bookingDetails.security_deposit || 2000);

  const refundableBal = bookingDetails.refundable_balance || 0;
  const normalBal = bookingDetails.wallet_balance || 0;

  let walletDeduction = 0;
  let amountToPay = totalWithDeposit;

  if (useWallet) {
     const fromRefundable = Math.min(refundableBal, amountToPay);
     amountToPay -= fromRefundable;
     
     const fromNormal = Math.min(normalBal, amountToPay);
     amountToPay -= fromNormal;
     
     walletDeduction = fromRefundable + fromNormal;
  }

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
      const res = await API.post('bookings/', {
        vehicle: vehicle_id, start_date, end_date,
        booking_type,
        total_price: totalWithDeposit,
        coupon_code: discount > 0 ? couponCode : null,
        status: 'PENDING',
      });
      
      const orderRes = await API.post('payments/create-order/', { 
        booking_id: res.data.id, 
        use_wallet: useWallet 
      });
      
      if (orderRes.data.status === 'SUCCESS_WALLET') {
        router.push(`/booking-success/${res.data.id}`);
        return;
      }
      
      if (orderRes.data.breakdown) {
          setBreakdown(orderRes.data.breakdown);
      }
      
      const bId = res.data.id || res.data.blockchain_id || res.data.booking_id;
      sessionStorage.setItem('paymentAmount', String(amountToPay));
      sessionStorage.setItem('useWallet', String(useWallet));
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
        <div className="grid-responsive grid-sidebar-layout" style={{ alignItems: 'start' }}>
          {/* Summary */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#A1A1AA' }}>Booking Summary</h2>
            <div style={{ marginBottom: '15px' }}>
              <span style={{ color: '#EF3E42', fontWeight: 'bold' }}>{vehicle?.brand}</span>
              <h3 style={{ fontSize: '20px', marginTop: '5px' }}>{vehicle?.name}</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#A1A1AA' }}>{booking_type === 'HOURLY' ? 'Start Time:' : 'Start Date:'}</span><span>{booking_type === 'HOURLY' ? new Date(start_date).toLocaleString() : start_date}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><span style={{ color: '#A1A1AA' }}>{booking_type === 'HOURLY' ? 'End Time:' : 'End Date:'}</span><span>{booking_type === 'HOURLY' ? new Date(end_date).toLocaleString() : end_date}</span></div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#A1A1AA' }}>Rate:</span><span>₹{booking_type === 'HOURLY' ? price_per_hour : price_per_day} / {booking_type === 'HOURLY' ? 'hour' : 'day'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ color: '#A1A1AA' }}>Security Deposit:</span><span>₹{bookingDetails.security_deposit || 2000}</span></div>
            
            {breakdown && breakdown.deposit && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#52525B' }}>• From Refundable</span><span style={{ color: '#10B981' }}>-₹{breakdown.deposit.from_refundable}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#52525B' }}>• From Balance</span><span style={{ color: '#10B981' }}>-₹{breakdown.deposit.from_balance}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#52525B' }}>• External Pay</span><span style={{ color: '#EF3E42' }}>₹{breakdown.deposit.external}</span></div>
                </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '15px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#A1A1AA' }}>Rental Amount:</span>
              <span>₹{finalPrice}</span>
            </div>

            {breakdown && breakdown.rental && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#52525B' }}>• From Refundable</span><span style={{ color: '#10B981' }}>-₹{breakdown.rental.from_refundable}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ color: '#52525B' }}>• From Balance</span><span style={{ color: '#10B981' }}>-₹{breakdown.rental.from_balance}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#52525B' }}>• External Pay</span><span style={{ color: '#EF3E42' }}>₹{breakdown.rental.external}</span></div>
                </div>
            )}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginBottom: (refundableBal > 0 || normalBal > 0) ? '10px' : '0' }}>
              <span>Total Cost:</span>
              <span>₹{totalWithDeposit}</span>
            </div>

            {(refundableBal > 0 || normalBal > 0) && (
              <div style={{ background: 'rgba(16,185,129,0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
                 <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px', fontWeight: '600' }}>
                    <input 
                      type="checkbox" 
                      checked={useWallet} 
                      onChange={(e) => setUseWallet(e.target.checked)} 
                      style={{ width: '18px', height: '18px', accentColor: '#10B981' }} 
                    />
                    Apply Wallet Balance
                 </label>
                 <div style={{ marginLeft: '28px', marginTop: '10px', fontSize: '14px', color: '#A1A1AA' }}>
                    Available: ₹{refundableBal + normalBal} (Refundable: ₹{refundableBal}, Top-up: ₹{normalBal})
                 </div>
                 {useWallet && walletDeduction > 0 && (
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed rgba(16,185,129,0.3)', color: '#10B981', fontWeight: '600' }}>
                     <span>Wallet Applied:</span>
                     <span>- ₹{walletDeduction}</span>
                   </div>
                 )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 'bold' }}>
              <span>Pay Now:</span>
              <span style={{ color: '#EF3E42' }}>₹{amountToPay}</span>
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
              {loading ? 'Processing...' : 'Proceed to Payment'}
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
