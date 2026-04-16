'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { register } from '../../utils/authService';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      router.push('/login');
    } catch {
      setError('Failed to register. Please check your details.');
    }
  };

  return (
    <div className="auth-layout-container">
      <div className="auth-form-panel animate-fade-in">
        <Card style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: '#A1A1AA', marginBottom: '32px' }}>Join Perfect Wheels today for exclusive access</p>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <InputField label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <InputField label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <InputField label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <Button variant="primary" type="submit" style={{ width: '100%', marginTop: '16px' }}>Sign Up</Button>
          </form>

          {/* DIVIDER */}
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ margin: '0 12px', color: '#52525B', fontSize: '12px', fontWeight: '600' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <GoogleSignInButton />

          <div style={{ marginTop: '24px', textAlign: 'center', color: '#A1A1AA', fontSize: '14px' }}>
            Already Registered? <Link href="/login" style={{ color: '#EF3E42', fontWeight: '600' }}>Login</Link>
          </div>
        </Card>
      </div>
      <div className="auth-image-panel">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1503376712341-ea1d8213bd73?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, transparent, #0A0A0A)' }} />
        </div>
      </div>
    </div>
  );
}
