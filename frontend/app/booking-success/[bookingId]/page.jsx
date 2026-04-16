'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../../components/Button';
import API from '../../../utils/api';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

function BookingSuccessContent() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    API.get(`bookings/${bookingId}/`)
      .then((res) => setBooking(res.data))
      .catch((err) => console.error('Failed to fetch booking:', err))
      .finally(() => setLoading(false));
  }, [bookingId]);

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '50px 40px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ color: '#10B981', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CheckCircle size={80} />
        </div>
        <h1 className="text-h2" style={{ marginBottom: '15px' }}>Payment Successful!</h1>
        <p className="text-body" style={{ color: '#A1A1AA', marginBottom: '30px' }}>Your booking has been confirmed and locked in.</p>
        {loading ? (
          <p style={{ color: '#A1A1AA' }}>Loading booking details...</p>
        ) : booking ? (
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <p style={{ margin: '8px 0' }}><span style={{ color: '#A1A1AA', display: 'inline-block', width: '120px' }}>Booking Ref:</span> #{booking.id || bookingId}</p>
            <p style={{ margin: '8px 0' }}><span style={{ color: '#A1A1AA', display: 'inline-block', width: '120px' }}>Vehicle:</span> {booking.vehicle?.brand} {booking.vehicle?.name}</p>
            <p style={{ margin: '8px 0' }}><span style={{ color: '#A1A1AA', display: 'inline-block', width: '120px' }}>Dates:</span> {booking.start_date} to {booking.end_date}</p>
            <p style={{ margin: '8px 0' }}><span style={{ color: '#A1A1AA', display: 'inline-block', width: '120px' }}>Amount Paid:</span> <span style={{ color: '#10B981', fontWeight: 'bold' }}>₹{booking.total_price}</span></p>
            <p style={{ margin: '8px 0' }}><span style={{ color: '#A1A1AA', display: 'inline-block', width: '120px' }}>Status:</span> <span style={{ color: '#10B981', fontWeight: 'bold' }}>CONFIRMED</span></p>
          </div>
        ) : (
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
            <p style={{ margin: '8px 0' }}><span style={{ color: '#A1A1AA', display: 'inline-block', width: '160px' }}>Booking Ref:</span> #{bookingId}</p>
          </div>
        )}
        <div className="stack-mobile" style={{ gap: '20px' }}>
          <Button variant="ghost" onClick={() => router.push('/vehicles')} style={{ padding: '16px', width: '100%' }}>Browse More</Button>
          <Button variant="primary" onClick={() => router.push('/booking-history')} style={{ padding: '16px', width: '100%' }}>View My Bookings</Button>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return <ProtectedRoute><BookingSuccessContent /></ProtectedRoute>;
}
