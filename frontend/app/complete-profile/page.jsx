'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';

function CompleteProfileContent() {
  const router = useRouter();
  const { setIsProfileComplete } = useAuth();
  const [formData, setFormData] = useState({ phone: '', licence_number: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Licence image is required.'); return; }
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const data = new FormData();
      data.append('phone', formData.phone);
      data.append('licence_number', formData.licence_number);
      data.append('licence_image', file);
      const res = await API.put('users/complete-profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.is_profile_complete) {
        localStorage.setItem('is_profile_complete', 'true');
        setIsProfileComplete(true);
        setSuccess('Profile completed successfully!');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setError('Please make sure all fields are valid.');
      }
    } catch {
      setError('Failed to update profile. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout-container">
      <div className="auth-form-panel animate-fade-in">
        <Card style={{ width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.02)' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Complete Your Profile</h2>
          <p style={{ color: '#A1A1AA', marginBottom: '32px' }}>We need a bit more info before you can start booking vehicles.</p>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <InputField label="Phone Number" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            <InputField label="Licence Number" value={formData.licence_number} onChange={(e) => setFormData({ ...formData, licence_number: e.target.value })} required />
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#A1A1AA' }}>Licence Image</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFF' }} required />
            </div>
            <Button variant="primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: '16px' }}>
              {submitting ? 'Updating...' : 'Complete Profile'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return <ProtectedRoute><CompleteProfileContent /></ProtectedRoute>;
}
