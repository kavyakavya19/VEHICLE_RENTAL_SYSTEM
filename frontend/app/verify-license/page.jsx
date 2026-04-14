'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import API from '../../utils/api';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

function VerifyLicenseContent() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({ licence_number: '', licence_image: null });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);
  const [previewName, setPreviewName] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await API.get('users/verification-status/');
        setServerStatus(res.data);
      } catch (err) {
        console.error('Failed to fetch status', err);
      } finally {
        setFetchingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setStatus({ type: 'error', message: 'Please upload a valid image file.' });
        return;
      }
      setFormData({ ...formData, licence_image: file });
      setPreviewName(file.name);
      setStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.licence_number || formData.licence_number.length < 5) {
      setStatus({ type: 'error', message: 'Please enter a valid driver\'s license number' });
      return;
    }
    
    if (!formData.licence_image) {
      setStatus({ type: 'error', message: 'Please upload a clear picture of your driver\'s license' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const data = new FormData();
      data.append('licence_number', formData.licence_number);
      data.append('licence_image', formData.licence_image);

      const res = await API.post('users/upload-license/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatus({ type: 'success', message: res.data.message || 'License submitted successfully!' });
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || 'Failed to submit documents. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStatus) {
    return (
      <div className="page-container" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <p style={{ color: '#A1A1AA' }}>Checking verification status...</p>
      </div>
    );
  }

  const isApproved = serverStatus?.status === 'APPROVED';
  const isPending = serverStatus?.status === 'PENDING';
  const isRejected = serverStatus?.status === 'REJECTED';

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '60px', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: '100%', maxWidth: '540px', padding: '40px' }}>
        
        {isApproved ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#10B98115', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle2 size={40} color="#10B981" />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Verified & Approved!</h1>
            <p style={{ color: '#A1A1AA', marginBottom: '32px' }}>Your driving license has been verified. You can now book any vehicle in our fleet.</p>
            <Button variant="primary" onClick={() => router.push('/vehicles')} style={{ width: '100%', padding: '16px' }}>
              Explore Vehicles & Book
            </Button>
          </div>
        ) : isPending ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#F59E0B15', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <UploadCloud size={40} color="#F59E0B" />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Verification In Progress</h1>
            <p style={{ color: '#A1A1AA', marginBottom: '32px' }}>We have received your documents and are currently reviewing them. This usually takes about 24 hours.</p>
            <Button variant="secondary" onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: '16px' }}>
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ background: 'rgba(239, 62, 66, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} color="#EF3E42" />
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '800' }}>{isRejected ? 'Update Your License' : 'Verify Your License'}</h1>
              <p style={{ color: '#A1A1AA', marginTop: '8px' }}>
                {isRejected 
                  ? 'Your previous submission was rejected. Please upload a clear license copy.' 
                  : 'For your safety and ours, we need to verify your driver\'s license before you can book.'}
              </p>
            </div>

            {isRejected && (
              <div style={{ background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
                <strong>Rejection Remark:</strong> {serverStatus.remarks || 'Document unclear or invalid.'}
              </div>
            )}

            {status.message && (
              <div style={{ 
                background: status.type === 'success' ? '#10B98115' : '#EF444415', 
                color: status.type === 'success' ? '#10B981' : '#EF4444', 
                padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '500',
                border: `1px solid ${status.type === 'success' ? '#10B98130' : '#EF444430'}`
              }}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <InputField 
                  label="Driver's License Number" 
                  type="text" 
                  placeholder="e.g. DL-14-1234567890"
                  value={formData.licence_number} 
                  onChange={(e) => setFormData({ ...formData, licence_number: e.target.value.toUpperCase() })} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#FFF' }}>Upload License Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '12px', padding: '32px 20px', 
                    textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease', 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#EF3E42'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                >
                  <UploadCloud size={32} color="#A1A1AA" style={{ margin: '0 auto 12px' }} />
                  {previewName ? (
                    <p style={{ color: '#10B981', fontWeight: '600' }}>{previewName}</p>
                  ) : (
                    <>
                      <p style={{ color: '#FFF', fontWeight: '500', marginBottom: '4px' }}>Click to browse your files</p>
                      <p style={{ color: '#A1A1AA', fontSize: '12px' }}>JPEG, PNG up to 5MB</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>

              <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%', padding: '16px' }}>
                {loading ? 'Uploading...' : 'Submit for Verification'}
              </Button>
              
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button variant="ghost" type="button" onClick={() => router.back()} style={{ color: '#A1A1AA' }}>
                  Back
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

export default function VerifyLicensePage() {
  return (
    <ProtectedRoute>
      <VerifyLicenseContent />
    </ProtectedRoute>
  );
}
