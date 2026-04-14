'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { login as authServiceLogin } from '../../utils/authService';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';

export default function LoginPage() {
  const router = useRouter();
  const { login: loginFromContext, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await authServiceLogin(formData.email, formData.password);
      // data: { token, refresh, user }
      loginFromContext({ token: data.token, refresh: data.refresh }, data.user);
      router.push(data.user.is_profile_complete ? '/dashboard' : '/complete-profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  if (loading) return null; // Or a loading spinner

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="animate-fade-in">
        <Card style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: '#A1A1AA', marginBottom: '32px' }}>Enter your credentials to access your account</p>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <InputField label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <InputField label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link href="/forgot-password" style={{ color: '#A1A1AA', fontSize: '13px', transition: 'color 0.3s ease' }}>
                Forgot your password?
              </Link>
            </div>

            <Button variant="primary" type="submit" style={{ width: '100%', marginTop: '16px' }}>Login Securely</Button>
          </form>

          {/* DIVIDER */}
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ margin: '0 12px', color: '#52525B', fontSize: '12px', fontWeight: '600' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <GoogleSignInButton />

          <div style={{ marginTop: '24px', textAlign: 'center', color: '#A1A1AA', fontSize: '14px' }}>
            Not Registered? <Link href="/register" style={{ color: '#EF3E42', fontWeight: '600' }}>Register here</Link>
          </div>
        </Card>
      </div>
      <div style={{ flex: '1', position: 'relative' }} className="auth-image-container">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, transparent, #0A0A0A)' }} />
        </div>
      </div>
      <style>{`@media (max-width: 767px) { .auth-image-container { display: none; } }`}</style>
    </div>
  );
}
