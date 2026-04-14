'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
        const res = await API.get('vehicles/');
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
  const filtered = activeBrand === 'ALL' ? vehicles : vehicles.filter((v) => v.brand?.toUpperCase() === activeBrand);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
        {filtered.map((vehicle) => (
          <Card key={vehicle.id} hoverEffect style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '200px', backgroundImage: `url(${getVehicleImage(vehicle)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#10B981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>✅ Available</div>
            </div>
            <div style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#EF3E42', fontWeight: '600', letterSpacing: '1px' }}>{vehicle.brand}</span>
                  <h3 style={{ fontSize: '22px', margin: '4px 0' }}>{vehicle.name}</h3>
                </div>
                <h4 style={{ fontSize: '20px', color: '#10B981' }}>₹{vehicle.price_per_day}/day</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '25px', color: '#A1A1AA', fontSize: '14px' }}>
                <div><strong>Color:</strong><br />{vehicle.color || 'Dynamic'}</div>
                <div><strong>Number:</strong><br />{vehicle.vehicle_number || vehicle.number}</div>
                <div><strong>Condition:</strong><br />{vehicle.condition || 'Excellent'}</div>
                <div><strong>Type:</strong><br />{vehicle.vehicle_type || vehicle.type}</div>
              </div>
              <Button variant="primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => router.push(`/vehicle/${vehicle.id}`)}>
                Book Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
