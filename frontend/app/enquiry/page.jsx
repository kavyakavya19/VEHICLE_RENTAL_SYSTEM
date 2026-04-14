'use client';

import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function EnquiryPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await API.post('enquiries/', formData);
      setStatus('success:Enquiry submitted successfully! Our team will get back to you soon.');
      setFormData(prev => ({ ...prev, message: '' }));
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || (err.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data)[0] : null);
      setStatus(`error:${msg || 'Error submitting enquiry. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Submit an Enquiry</h1>
        <p style={{ color: '#A1A1AA', marginBottom: '30px' }}>Have questions about a particular vehicle or rental policy? Send us an enquiry!</p>
        
        {status && (
          <div style={{ 
            padding: '12px', 
            background: status.startsWith('success') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
            color: status.startsWith('success') ? '#10B981' : '#EF4444', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px',
            border: `1px solid ${status.startsWith('success') ? '#10B98130' : '#EF444430'}`
          }}>
            {status.split(':')[1]}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!!user} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <InputField label="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={!!user} required />
            <InputField label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!!user} required />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ color: '#A1A1AA', fontSize: '14px', fontWeight: '500' }}>Message</label>
            <textarea 
              rows="4"
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              required
              placeholder="Tell us how we can help you..."
              style={{
                background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFF', padding: '12px 16px', borderRadius: '8px', outline: 'none', transition: 'all 0.3s ease',
                width: '100%', fontFamily: 'inherit', fontSize: '15px'
              }}
            />
          </div>

          <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Submitting...' : 'Send Enquiry'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
