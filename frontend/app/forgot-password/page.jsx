'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import API from '../../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await API.post('auth/forgot-password/', { email });
      setStatus({ type: 'success', message: res.data.message || 'If this email exists, a reset link has been sent' });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout-container">
      <div className="auth-form-panel animate-fade-in">
        <Card style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Forgot Password</h2>
          <p style={{ color: '#A1A1AA', marginBottom: '32px' }}>Enter your email to receive a password reset link</p>
          
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
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Button variant="primary" type="submit" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', color: '#A1A1AA', fontSize: '14px' }}>
            Remember your password? <Link href="/login" style={{ color: '#EF3E42', fontWeight: '600' }}>Back to Login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
