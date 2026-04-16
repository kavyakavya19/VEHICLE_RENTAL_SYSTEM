'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '../../../components/Button';
import { getVehicleImage } from '../../../utils/imageHelpers';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    // Parallel fetch for speed
    const fetchData = async () => {
      try {
        const [vehicleRes, bookingsRes] = await Promise.all([
          axios.get(`${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/').replace(/\/?$/, '/')}vehicles/${id}/`),
          // We use public API for vehicle but need auth for bookings
          API.get('bookings/my-bookings/').catch(() => ({ data: [] }))
        ]);
        
        setVehicle(vehicleRes.data);
        const active = (Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.results || [])).find(b => 
          ['PENDING', 'CONFIRMED', 'ONGOING', 'PENDING_APPROVAL'].includes((b.booking_status || b.status).toUpperCase())
        );
        setActiveBooking(active);
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // Use API utility for Authenticated requests
  const API = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/').replace(/\/?$/, '/'),
    headers: { Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '' }
  });

  if (loading) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#A1A1AA' }}>Loading Vehicle Details...</div>;
  if (!vehicle) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#EF4444' }}>Vehicle not found!</div>;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      <Button variant="ghost" onClick={() => router.push('/vehicles')} style={{ marginBottom: '20px' }}>← Back to Vehicles</Button>

      <div className="grid-responsive grid-responsive-2" style={{ gap: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundImage: `url(${getVehicleImage(vehicle)})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '400px' }} />
        <div style={{ padding: '40px' }}>
          <span style={{ color: '#EF3E42', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{vehicle.brand}</span>
          <h1 className="text-h2" style={{ margin: '10px 0', color: '#FFF' }}>{vehicle.name}</h1>
          <h2 style={{ fontSize: '28px', color: '#10B981', marginBottom: '20px' }}>₹{vehicle.price_per_day}/day</h2>
          <p style={{ color: '#A1A1AA', lineHeight: '1.6', marginBottom: '30px', fontSize: '15px' }}>
            {vehicle.description || 'Experience the ultimate freedom with this well-maintained premium vehicle.'}
          </p>
          <div className="grid-responsive grid-responsive-2" style={{ gap: '20px', marginBottom: '40px' }}>
            {[
              { label: 'Vehicle Type', value: vehicle.vehicle_type || vehicle.type },
              { label: 'Condition', value: vehicle.condition || 'Premium' },
              { label: 'Color', value: vehicle.color || 'Dynamic' },
              { label: 'Plate Number', value: vehicle.vehicle_number || vehicle.number },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: '#A1A1AA' }}>{label}</span>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>{value}</p>
              </div>
            ))}
          </div>
          {activeBooking ? (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid #F59E0B', color: '#F59E0B', padding: '16px', borderRadius: '12px', marginBottom: '30px' }}>
              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>⚠️ Active Booking Found</p>
              <p style={{ fontSize: '13px', opacity: 0.9 }}>You have an active booking (#{activeBooking.id}). Please complete it before booking another vehicle.</p>
            </div>
          ) : null}
          <Button
            variant="primary"
            style={{ 
              width: '100%', padding: '16px', fontSize: '18px', fontWeight: '600',
              opacity: activeBooking ? 0.5 : 1,
              cursor: activeBooking ? 'not-allowed' : 'pointer'
            }}
            disabled={!!activeBooking}
            onClick={() => {
              sessionStorage.setItem('currentVehicle', JSON.stringify(vehicle));
              router.push(`/booking/${id}`);
            }}
          >
            {activeBooking ? 'Trip in Progress...' : 'Start Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
}
