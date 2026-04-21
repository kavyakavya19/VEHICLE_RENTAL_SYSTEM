'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '../../../utils/api';
import { Button } from '../../../components/Button';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

// Next.js doesn't support router.push with {state}. 
// We store booking details in sessionStorage when navigating from VehicleDetail.
function BookingContent() {
  const { vehicleId } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingType, setBookingType] = useState('DAILY');

  useEffect(() => {
    // Try to get vehicle from sessionStorage 
    const stored = sessionStorage.getItem('currentVehicle');
    if (stored) {
      setVehicle(JSON.parse(stored));
      setFetching(false);
    } else {
      // Fallback: fetch directly
      API.get(`vehicles/${vehicleId}/`)
        .then((res) => setVehicle(res.data))
        .catch(() => router.push('/vehicles'))
        .finally(() => setFetching(false));
    }

    // Set default times to next full hour if hourly
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    
    // Default dates for DAILY: Start tomorrow, End day-after-tomorrow
    const tomorrow = new Date(now.getTime() + 86400000);
    const dayAfter = new Date(now.getTime() + (2 * 86400000));
    setStartDate(tomorrow.toISOString().split('T')[0]);
    setEndDate(dayAfter.toISOString().split('T')[0]);

    // Check for active bookings
    const checkActiveBooking = async () => {
      try {
        const res = await API.get('bookings/my-bookings/');
        const active = (Array.isArray(res.data) ? res.data : (res.data.results || [])).find(b => 
          ['PENDING', 'CONFIRMED', 'ONGOING', 'PENDING_APPROVAL'].includes((b.booking_status || b.status).toUpperCase())
        );
        setActiveBooking(active);
      } catch (err) {
        console.error('Failed to check active bookings', err);
      }
    };
    checkActiveBooking();
  }, [vehicleId, router]);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (activeBooking) {
      setError('You already have an active booking. Please complete or cancel it first.');
      return;
    }
    if (!startDate || !endDate) { 
      setError(bookingType === 'HOURLY' ? 'Please select both start and end times.' : 'Please select both start and end dates.'); 
      return; 
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      setError(bookingType === 'HOURLY' ? 'End time must be after start time.' : 'End date must be after start date.');
      return;
    }

    setLoading(true); setError(''); setSuccess(''); setNeedsVerification(false);
    try {
      const res = await API.post('bookings/check-availability/', {
        vehicle_id: parseInt(vehicleId, 10), 
        start_date: startDate, 
        end_date: endDate,
        booking_type: bookingType
      });
      if (res.data.available === true) {
        setSuccess('Vehicle is available! Redirecting to checkout...');
        const bookingDetails = {
          vehicle_id: parseInt(vehicleId, 10), vehicle,
          start_date: startDate, end_date: endDate,
          booking_type: bookingType,
          number_of_days: res.data.days, 
          number_of_hours: res.data.hours,
          price_per_day: res.data.price_per_day,
          price_per_hour: res.data.price_per_hour,
          total_price: res.data.total,
          security_deposit: res.data.security_deposit,
          wallet_balance: res.data.wallet_balance,
          refundable_balance: res.data.refundable_balance
        };
        sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
        setTimeout(() => router.push('/checkout'), 1200);
      } else if (res.data.needs_verification) {
        setNeedsVerification(true);
        setError(res.data.message);
      } else {
        setError(res.data.message || 'Vehicle is not available for the selected dates.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to check availability.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#A1A1AA' }}>Loading...</div>;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '16px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Book {vehicle?.brand} {vehicle?.name}</h1>
        <p style={{ color: '#A1A1AA', marginBottom: '30px' }}>Select your trip type and timing.</p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '10px' }}>
          {['DAILY', 'HOURLY'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setBookingType(type);
                const now = new Date();
                now.setHours(now.getHours() + 1, 0, 0, 0);
                if (type === 'HOURLY') {
                  // Round to next hour for starting
                  setStartDate(new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16));
                  const end = new Date(now);
                  end.setHours(end.getHours() + 2);
                  setEndDate(new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16));
                } else {
                  const tomorrow = new Date(now.getTime() + 86400000);
                  const dayAfter = new Date(now.getTime() + (2 * 86400000));
                  setStartDate(tomorrow.toISOString().split('T')[0]);
                  setEndDate(dayAfter.toISOString().split('T')[0]);
                }
              }}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                background: bookingType === type ? '#EF3E42' : 'transparent',
                color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s'
              }}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()} Booking
            </button>
          ))}
        </div>
        
        {activeBooking && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span style={{ fontWeight: '600' }}>Active Booking Detected</span>
            </div>
            <p style={{ fontSize: '14px' }}>You already have an active reservation (Booking #{activeBooking.id}). Please complete or cancel it before booking another vehicle.</p>
            <Button variant="secondary" onClick={() => router.push('/booking-history')} style={{ width: 'fit-content', fontSize: '12px', padding: '8px 16px' }}>View Booking History</Button>
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p>{error}</p>
            {error.includes('unpaid fines') && <Button variant="secondary" onClick={() => router.push('/booking-history')} style={{ width: 'fit-content', fontSize: '13px', padding: '8px 16px' }}>Go to Booking History</Button>}
            {needsVerification && <Button variant="primary" onClick={() => router.push('/verify-license')} style={{ width: 'fit-content', fontSize: '13px', padding: '8px 16px' }}>Verify License Now</Button>}
          </div>
        )}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', color: '#10B981', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{success}</div>}
        <form onSubmit={handleCheckAvailability} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#A1A1AA' }}>
              {bookingType === 'HOURLY' ? 'Start Date & Time' : 'Start Date'}
            </label>
            <input 
              type={bookingType === 'HOURLY' ? "datetime-local" : "date"} 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              min={bookingType === 'HOURLY' ? new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : new Date().toISOString().split('T')[0]} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: 'white', width: '100%' }} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#A1A1AA' }}>
              {bookingType === 'HOURLY' ? 'End Date & Time' : 'End Date'}
            </label>
            <input 
              type={bookingType === 'HOURLY' ? "datetime-local" : "date"} 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              min={startDate || (bookingType === 'HOURLY' ? new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : new Date().toISOString().split('T')[0])} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: 'white', width: '100%' }} 
              required 
            />
            {bookingType === 'HOURLY' && (
              <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '6px' }}>* Minimum 2 hours. Partial hours rounded up.</p>
            )}
          </div>
          <Button type="submit" variant="primary" style={{ padding: '16px', fontSize: '16px' }} disabled={loading}>{loading ? 'Checking...' : 'Check Availability'}</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()} style={{ padding: '16px', fontSize: '16px' }}>Cancel</Button>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return <ProtectedRoute><BookingContent /></ProtectedRoute>;
}
