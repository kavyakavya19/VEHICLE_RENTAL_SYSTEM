'use client';

import Link from 'next/link';
import { Button } from '../components/Button';
import { Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, zIndex: -2 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.4) 100%)', zIndex: -1 }} />

      <div className="page-container animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '150px' }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239,62,66,0.1)', color: '#EF3E42', padding: '8px 16px', borderRadius: '30px', fontWeight: '600', marginBottom: '24px' }}>
            <Car size={18} /> Premium Vehicle Rentals
          </div>
          <h1 className="text-hero" style={{ marginBottom: '24px' }}>
            Find Your <span style={{ color: '#EF3E42' }}>Perfect Wheels</span> For The Journey
          </h1>
          <p className="text-body" style={{ color: '#A1A1AA', marginBottom: '40px' }}>
            Experience the ultimate freedom of the open road. Browse our premium collection of well-maintained vehicles for rent across the country.
          </p>
          <div className="stack-mobile">
            <Link href="/vehicles" style={{ width: '100%' }}>
              <Button variant="primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Browse Vehicles</Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" style={{ width: '100%' }}>
                <Button variant="secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/register" style={{ width: '100%' }}>
                <Button variant="secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Join Now</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
