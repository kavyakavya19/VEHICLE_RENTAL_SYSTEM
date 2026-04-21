'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '../../../utils/api';
import { Button } from '../../../components/Button';
import { getVehicleImage } from '../../../utils/imageHelpers';
import { 
  Car, 
  ShieldCheck, 
  Palette, 
  Hash, 
  Gauge, 
  Settings, 
  Repeat, 
  Fuel, 
  Users 
} from 'lucide-react';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleRes, bookingsRes, walletRes] = await Promise.all([
          API.get(`vehicles/${id}/`),
          API.get('bookings/my-bookings/').catch(() => ({ data: [] })),
          API.get('payments/wallet/').catch(() => ({ data: null }))
        ]);
        
        setVehicle(vehicleRes.data);
        const active = (Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.results || [])).find(b => 
          ['PENDING', 'CONFIRMED', 'ONGOING', 'PENDING_APPROVAL'].includes((b.booking_status || b.status).toUpperCase())
        );
        setActiveBooking(active);
        if (walletRes.data) setWallet(walletRes.data);
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  if (loading) return (
    <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#A1A1AA' }}>
      Loading Vehicle Details...
    </div>
  );
  if (!vehicle) return (
    <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#EF4444' }}>
      Vehicle not found!
    </div>
  );

  const isBlocked = !!activeBooking || (wallet && parseFloat(wallet.pending_deductions) > 0);

  const specs = [
    { label: 'Vehicle Type', value: vehicle.vehicle_type || vehicle.type, icon: Car },
    { label: 'Condition',    value: vehicle.condition || 'Premium',        icon: ShieldCheck },
    { label: 'Color',        value: vehicle.color || 'Dynamic',            icon: Palette },
    { label: 'Plate Number', value: vehicle.vehicle_number || vehicle.number, icon: Hash },
    { label: 'Mileage',      value: vehicle.mileage,                       icon: Gauge },
    { label: 'Engine',       value: vehicle.engine,                        icon: Settings },
    { label: 'Transmission', value: vehicle.transmission,                  icon: Repeat },
    { label: 'Fuel Type',    value: vehicle.fuel_type,                     icon: Fuel },
    { label: 'Seat Capacity',value: vehicle.seats ? `${vehicle.seats} Seater` : null, icon: Users },
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/vehicles')}
        style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        ← Back to Vehicles
      </Button>

      {/* Main Card: Image Left + Details Right */}
      <div
        className="grid-responsive grid-responsive-2"
        style={{
          gap: '0',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >

        {/* ── LEFT: IMAGE (no zoom, fully visible) ── */}
        <div
          style={{
            backgroundColor: '#111113',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '480px',
            padding: '20px',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <img
            src={getVehicleImage(vehicle) || '/placeholder-car.png'}
            alt={vehicle.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '440px',
              objectFit: 'contain',
              objectPosition: 'center',
              borderRadius: '12px',
              display: 'block',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #1a1a1e 0%, #27272a 100%)';
            }}
          />
        </div>

        {/* ── RIGHT: DETAILS PANEL (glass card) ── */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}
        >
          {/* Brand */}
          <p style={{
            color: '#EF4444',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            {vehicle.brand}
          </p>

          {/* Vehicle Name */}
          <h1 style={{
            color: '#FFFFFF',
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            lineHeight: '1.2',
            margin: '0 0 12px 0',
          }}>
            {vehicle.name}
          </h1>

          {/* Price */}
          <p style={{ margin: '0 0 20px 0' }}>
            <span style={{ color: '#4ADE80', fontSize: '26px', fontWeight: '700' }}>
              ₹{vehicle.price_per_day}
            </span>
            <span style={{ color: '#52525B', fontSize: '14px', fontWeight: '400', marginLeft: '4px' }}>
              / day
            </span>
          </p>

          {/* Description */}
          <p style={{
            color: '#A1A1AA',
            fontSize: '14px',
            lineHeight: '1.75',
            maxWidth: '420px',
            marginBottom: '28px',
          }}>
            {vehicle.description || 'Experience the ultimate freedom with this well-maintained premium vehicle. Perfect for city commutes and long-range highway exploration.'}
          </p>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '24px' }} />

          {/* Spec Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            {specs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'border-color 0.2s, background 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#EF4444',
                  }}>
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ color: '#52525B', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                      {item.label}
                    </p>
                    <p style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: '600' }}>
                      {item.value || 'N/A'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          {activeBooking && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <p style={{ fontWeight: '700', marginBottom: '4px' }}>⚠️ Active Booking Found</p>
              <p style={{ opacity: 0.85 }}>You have an active booking (#{activeBooking.id}). Please complete it before booking another vehicle.</p>
            </div>
          )}
          {wallet && parseFloat(wallet.pending_deductions) > 0 && (
            <div style={{ background: 'rgba(239,62,66,0.08)', border: '1px solid rgba(239,62,66,0.3)', color: '#EF3E42', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <p style={{ fontWeight: '700', marginBottom: '4px' }}>⚠️ Pending Dues Found</p>
              <p style={{ opacity: 0.85 }}>You have pending dues. Please clear them from your wallet/dashboard to continue booking.</p>
            </div>
          )}

          {/* CTA Button */}
          <button
            disabled={isBlocked}
            onClick={() => {
              sessionStorage.setItem('currentVehicle', JSON.stringify(vehicle));
              router.push(`/booking/${id}`);
            }}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '15px',
              borderRadius: '14px',
              background: isBlocked ? '#374151' : '#DC2626',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              cursor: isBlocked ? 'not-allowed' : 'pointer',
              opacity: isBlocked ? 0.6 : 1,
              boxShadow: isBlocked ? 'none' : '0 10px 30px rgba(220,38,38,0.3)',
              transition: 'all 0.25s ease',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => { if (!isBlocked) e.currentTarget.style.background = '#B91C1C'; }}
            onMouseLeave={e => { if (!isBlocked) e.currentTarget.style.background = '#DC2626'; }}
          >
            {activeBooking ? 'Trip in Progress...' : 'Proceed to Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
