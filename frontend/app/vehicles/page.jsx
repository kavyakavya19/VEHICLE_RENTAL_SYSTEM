'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import API from '../../utils/api';

import { getVehicleImage } from '../../utils/imageHelpers';

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState('ALL');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await API.get('vehicles/?page_size=100');
        const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setVehicles(list.filter((v) => v.availability_status === true && v.maintenance_status === false));
      } catch {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const brands = ['ALL', 'BAJAJ', 'TVS', 'BMW', 'TATA', 'HONDA', 'MAHINDRA'];
  const filtered = activeBrand === 'ALL' 
    ? vehicles 
    : vehicles.filter((v) => {
        const vBrand = (v.brand || v.brand_name || v.brand_str || '').toString().trim().toUpperCase();
        return vBrand === activeBrand.toUpperCase();
      });

  if (loading) return <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center', color: '#A1A1AA' }}>Loading Fleet...</div>;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Our Fleet Collection</h1>
        <p style={{ color: '#A1A1AA', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Choose from our wide variety of premium and economical vehicles designed for your perfect journey.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
        {brands.map((brand) => (
          <Button key={brand} variant={activeBrand === brand ? 'primary' : 'secondary'} onClick={() => setActiveBrand(brand)} style={{ borderRadius: '30px', padding: '8px 20px', fontSize: '14px' }}>
            {brand}
          </Button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#A1A1AA', padding: '60px 20px' }}>
          <p style={{ fontSize: '18px' }}>No vehicles available for the selected brand.</p>
        </div>
      )}

      <div className="grid-responsive grid-responsive-3" style={{ gap: '30px' }}>
        {filtered.map((vehicle) => (
          <Card key={vehicle.id} hoverEffect style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              height: '200px', 
              backgroundImage: `url(${getVehicleImage(vehicle)}), linear-gradient(45deg, #18181B, #27272A)`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              position: 'relative' 
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                background: vehicle.is_available ? '#10B981' : '#EF4444', 
                color: '#fff', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: '700', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                {vehicle.is_available ? (
                  <><CheckCircle2 size={13} /> Available</>
                ) : (
                  <><CheckCircle2 size={13} style={{ transform: 'rotate(45deg)' }} /> Booked</>
                )}
              </div>
            </div>
            <div style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#EF3E42', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{vehicle.brand}</span>
                  <h3 style={{ fontSize: '20px', margin: '4px 0', fontWeight: '700' }}>{vehicle.name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ fontSize: '18px', color: '#10B981', fontWeight: '700' }}>₹{vehicle.price_per_day}</h4>
                  <span style={{ fontSize: '10px', color: '#52525B', textTransform: 'uppercase' }}>per day</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '22px', color: '#A1A1AA', fontSize: '13px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#52525B', display: 'block' }}>COLOR</span>
                  {vehicle.color || 'Dynamic'}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#52525B', display: 'block' }}>NUMBER</span>
                  {vehicle.vehicle_number || vehicle.number}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#52525B', display: 'block' }}>CONDITION</span>
                  {vehicle.condition || 'Excl.'}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#52525B', display: 'block' }}>TYPE</span>
                  {vehicle.vehicle_type || vehicle.type}
                </div>
              </div>
              <Button 
                variant="primary" 
                style={{ width: '100%', marginTop: 'auto', borderRadius: '12px', fontWeight: '700' }} 
                onClick={() => router.push(`/vehicle/${vehicle.id}`)}
                disabled={!vehicle.is_available}
              >
                {vehicle.is_available ? 'Book Now' : 'Not Available'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
