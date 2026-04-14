'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/Card';
import { InputField } from '../../../../components/InputField';
import { Button } from '../../../../components/Button';
import API from '../../../../utils/api';

export default function ResetPasswordPage({ params }) {
  // Use `use` unwrapping if required by Next.js 15 for dynamic params, 
  // but if it's generic params prop we unwrap using standard React `use`
  const unwrappedParams = use(params);
  const { uid, token } = unwrappedParams;

  const router = useRouter();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      setStatus({ type: 'error', message: 'All fields are required' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await API.post('auth/reset-password/', {
        uid,
        token,
        new_password: formData.newPassword
      });
      
      setStatus({ type: 'success', message: res.data.message || 'Password reset successfully!' });
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Invalid or expired token. Please request a new reset link.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="animate-fade-in">
        <Card style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Reset Password</h2>
          <p style={{ color: '#A1A1AA', marginBottom: '32px' }}>Enter your new password below</p>
          
          {status.message && (
            <div style={{ 
              background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239,68,68,0.1)', 
              color: status.type === 'success' ? '#10B981' : '#EF4444', 
              padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' 
            }}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField 
              label="New Password" 
              type="password" 
              value={formData.newPassword} 
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} 
              required 
            />
            <InputField 
              label="Confirm New Password" 
              type="password" 
              value={formData.confirmPassword} 
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
              required 
            />
            <Button variant="primary" type="submit" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', color: '#A1A1AA', fontSize: '14px' }}>
            <Link href="/login" style={{ color: '#EF3E42', fontWeight: '600' }}>Back to Login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
