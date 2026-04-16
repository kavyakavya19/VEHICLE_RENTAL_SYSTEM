import React from 'react';
import { Calendar, MapPin, Tag, ArrowRight, CreditCard, Play, StopCircle } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useRouter } from 'next/navigation';

export default function ActiveBookingCard({ booking, onAction }) {
  const router = useRouter();
  
  if (!booking) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <div style={{ background: '#6366F115', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Tag size={32} color="#6366F1" />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No Active Bookings</h3>
        <p style={{ color: '#A1A1AA', fontSize: '14px', marginBottom: '24px' }}>Ready for your next adventure? Browse our fleet and start booking.</p>
        <Button variant="primary" onClick={() => router.push('/vehicles')} style={{ padding: '12px 24px' }}>Book a Vehicle</Button>
      </div>
    );
  }

  const st = (booking.booking_status || '').toUpperCase();
  
  const getBadgeStyle = () => {
    switch(st) {
      case 'PENDING': return { bg: '#F59E0B15', color: '#F59E0B', label: 'Payment Pending' };
      case 'CONFIRMED': return { bg: '#10B98115', color: '#10B981', label: 'Confirmed' };
      case 'ONGOING': return { bg: '#6366F115', color: '#6366F1', label: 'Trip Ongoing' };
      case 'PENDING_APPROVAL': return { bg: '#EF444415', color: '#EF4444', label: 'Action Required' };
      default: return { bg: '#3F3F4615', color: '#3F3F46', label: st };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <span style={{ background: badge.bg, color: badge.color, padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{badge.label}</span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '12px' }}>{booking.vehicle_brand} {booking.vehicle_name}</h3>
        </div>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>₹{parseFloat(booking.total_price || 0).toLocaleString('en-IN')}</span>
      </div>

      <div className="grid-responsive grid-responsive-2" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}>
            <Calendar size={18} color="#A1A1AA" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#52525B', display: 'block' }}>Duration</span>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{booking.start_date} - {booking.end_date}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' }}>
            <MapPin size={18} color="#A1A1AA" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#52525B', display: 'block' }}>Booking ID</span>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>#{booking.id}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {st === 'PENDING' && (
          <Button variant="primary" onClick={() => router.push(`/payment/${booking.id}`)} style={{ width: '100%', gap: '8px' }}>
            <CreditCard size={18} /> Complete Payment
          </Button>
        )}
        {st === 'CONFIRMED' && (
          <Button variant="primary" onClick={() => onAction(booking.id, 'start-trip')} style={{ width: '100%', gap: '8px', background: '#F97316' }}>
            <Play size={18} /> Start Trip
          </Button>
        )}
        {st === 'ONGOING' && (
          <Button variant="primary" onClick={() => onAction(booking.id, 'end-trip')} style={{ width: '100%', gap: '8px', background: '#10B981' }}>
            <StopCircle size={18} /> End Trip
          </Button>
        )}
        {st === 'PENDING_APPROVAL' && (
          <Button variant="primary" onClick={() => router.push('/booking-history')} style={{ width: '100%', gap: '8px', background: '#EF4444' }}>
             Pay Fines / Manage
          </Button>
        )}
        <Button variant="ghost" onClick={() => router.push('/booking-history')} style={{ width: '100%', color: '#A1A1AA' }}>
          Manage All Bookings <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
